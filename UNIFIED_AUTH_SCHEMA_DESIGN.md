# Unified Authentication Schema Design (RS256)

## Executive Summary

This document outlines a unified authentication schema using RS256 algorithm that bridges the gap between:
- Current custom JWT implementation (HS256)
- Better Auth implementation (OAuth/Keycloak)
- Both systems using the same token structure and validation approach

## Current State Analysis

### Existing Custom Auth Implementation
- **Algorithm**: HS256 (symmetric)
- **Token Generator**: `JWTTokenGenerator` class
- **Key Storage**: Environment variable `JWT_SECRET`
- **Token Expiry**: 15 minutes (access), 7 days (refresh)
- **Validation**: Local verification with secret key

### Existing Better Auth Implementation
- **Integration**: Keycloak OAuth provider
- **Session Management**: Better Auth sessions + database
- **Token Handling**: JWT plugin with default EdDSA algorithm
- **Key Storage**: Database JWKS table

### Identified Gaps
1. **Algorithm Mismatch**: Custom auth uses HS256, Better Auth uses EdDSA
2. **Key Management**: Different storage approaches (env vs database)
3. **Token Structure**: Inconsistent payload formats
4. **Validation Methods**: Separate verification mechanisms
5. **Session Handling**: Different session management approaches

## Unified RS256 Token Schema Design

### Standard Token Payload Structure

```typescript
interface UnifiedTokenPayload {
  // Standard JWT Claims
  sub: string;           // User ID (UUID)
  iss: string;           // Issuer (modular-monolith)
  aud: string;           // Audience (api/web)
  exp: number;           // Expiration time
  iat: number;           // Issued at
  jti: string;           // JWT ID (unique identifier)
  nbf?: number;          // Not before

  // User Information
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  username?: string;

  // Authentication Context
  auth_provider: 'custom' | 'keycloak' | 'oauth';
  auth_method: 'password' | 'oauth' | 'sso';
  session_id?: string;    // For session tracking

  // Token Specific
  type: 'access' | 'refresh';
  scope?: string;         // OAuth scopes if applicable

  // Application Specific
  tenant_id?: string;     // Multi-tenancy support
  permissions?: string[];  // Fine-grained permissions
}
```

### Token Header Structure

```typescript
interface UnifiedTokenHeader {
  alg: 'RS256';          // Algorithm
  typ: 'JWT';           // Token type
  kid: string;          // Key ID for rotation
}
```

## RS256 Key Management Strategy

### Key Pair Generation

```bash
# Generate RSA 2048-bit key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Convert to base64 for environment variables
base64 -w 0 private.pem > private_base64.txt
base64 -w 0 public.pem > public_base64.txt
```

### Environment Configuration

```bash
# .env configuration
JWT_RS256_PRIVATE_KEY_BASE64=<base64-encoded-private-key>
JWT_RS256_PUBLIC_KEY_BASE64=<base64-encoded-public-key>
JWT_RS256_KEY_ID=key-2024-001
JWT_ACCESS_TOKEN_EXPIRY=3h
JWT_REFRESH_TOKEN_EXPIRY=7d
```

### Key Management Service

```typescript
class RS256KeyManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor() {
    this.privateKey = this.decodeBase64Key(process.env.JWT_RS256_PRIVATE_KEY_BASE64);
    this.publicKey = this.decodeBase64Key(process.env.JWT_RS256_PUBLIC_KEY_BASE64);
    this.keyId = process.env.JWT_RS256_KEY_ID || 'default';
  }

  getPrivateKey(): string { return this.privateKey; }
  getPublicKey(): string { return this.publicKey; }
  getKeyId(): string { return this.keyId; }

  private decodeBase64Key(encoded: string): string {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }
}
```

## Unified Token Generator Implementation

### Custom Auth Integration

```typescript
export class UnifiedRS256TokenGenerator implements ITokenGenerator {
  private keyManager: RS256KeyManager;
  private accessTokenExpiry: number; // 3 hours in seconds
  private refreshTokenExpiry: number; // 7 days in seconds
  private issuer: string;
  private audience: string;

  constructor(config: {
    keyManager: RS256KeyManager;
    accessTokenExpiry?: number;
    refreshTokenExpiry?: number;
    issuer?: string;
    audience?: string;
  }) {
    this.keyManager = config.keyManager;
    this.accessTokenExpiry = config.accessTokenExpiry || 3 * 60 * 60; // 3 hours
    this.refreshTokenExpiry = config.refreshTokenExpiry || 7 * 24 * 60 * 60; // 7 days
    this.issuer = config.issuer || 'modular-monolith';
    this.audience = config.audience || 'modular-monolith-api';
  }

  async generateAccessToken(payload: UnifiedTokenPayload, options?: TokenOptions): Promise<string> {
    const tokenPayload = {
      ...payload,
      type: 'access' as const,
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
      iat: Math.floor(Date.now() / 1000),
      jti: this.generateJTI(),
      iss: this.issuer,
      aud: this.audience
    };

    return jwt.sign(tokenPayload, this.keyManager.getPrivateKey(), {
      algorithm: 'RS256',
      keyid: this.keyManager.getKeyId()
    });
  }

  async generateRefreshToken(payload: UnifiedTokenPayload, options?: TokenOptions): Promise<string> {
    const tokenPayload = {
      ...payload,
      type: 'refresh' as const,
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry,
      iat: Math.floor(Date.now() / 1000),
      jti: this.generateJTI(),
      iss: this.issuer,
      aud: this.audience
    };

    return jwt.sign(tokenPayload, this.keyManager.getPrivateKey(), {
      algorithm: 'RS256',
      keyid: this.keyManager.getKeyId()
    });
  }

  async verifyToken(token: string): Promise<TokenVerificationResult> {
    try {
      const decoded = jwt.verify(token, this.keyManager.getPublicKey(), {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience
      }) as UnifiedTokenPayload;

      return {
        valid: true,
        payload: decoded
      };
    } catch (error) {
      return this.handleVerificationError(error);
    }
  }

  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleVerificationError(error: any): TokenVerificationResult {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: error.message };
  }
}
```

### Better Auth Integration

```typescript
// Better Auth configuration with RS256
export const auth = betterAuth({
  // ... existing configuration
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: 'RS256',
          modulusLength: 2048
        },
        // Use our custom key manager instead of database storage
        adapter: {
          getJwks: async () => {
            const keyManager = new RS256KeyManager();
            return {
              keys: [{
                kty: 'RSA',
                alg: 'RS256',
                kid: keyManager.getKeyId(),
                use: 'sig',
                n: this.extractModulus(keyManager.getPublicKey()),
                e: 'AQAB' // Standard exponent for RSA
              }]
            };
          },
          getLatestKey: async () => {
            // Return the current key
            return await this.getJwks();
          }
        }
      },
      jwt: {
        definePayload: ({ user, session }) => {
          return {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            auth_provider: 'keycloak',
            auth_method: 'oauth',
            session_id: session.id,
            type: 'access'
          };
        },
        issuer: 'modular-monolith',
        audience: 'modular-monolith-api',
        expirationTime: '3h'
      }
    }),
    // ... existing plugins
  ]
});
```

## Token Validation Approach

### Unified Validation Middleware

```typescript
export class UnifiedTokenValidator {
  private keyManager: RS256KeyManager;
  private tokenGenerator: UnifiedRS256TokenGenerator;

  constructor() {
    this.keyManager = new RS256KeyManager();
    this.tokenGenerator = new UnifiedRS256TokenGenerator({ keyManager: this.keyManager });
  }

  async validateBearerToken(req: Request): Promise<ValidationResult> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    return await this.tokenGenerator.verifyToken(token);
  }

  async validateCookieToken(req: Request): Promise<ValidationResult> {
    const token = req.cookies['auth-token'];
    if (!token) {
      return { valid: false, error: 'Missing authentication cookie' };
    }

    return await this.tokenGenerator.verifyToken(token);
  }
}

// Express/Hono middleware
export function createAuthMiddleware(validator: UnifiedTokenValidator) {
  return async (c: Context, next: Next) => {
    const result = await validator.validateBearerToken(c.req);

    if (!result.valid) {
      return c.json({ error: result.error }, 401);
    }

    // Set user context
    c.set('user', result.payload);
    c.set('userId', result.payload.sub);
    c.set('userRole', result.payload.role);

    await next();
  };
}
```

## Session Management Strategy

### Hybrid Session Approach

```typescript
interface UnifiedSession {
  id: string;
  userId: string;
  tokenJTI: string;
  authProvider: 'custom' | 'keycloak';
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export class UnifiedSessionManager {
  constructor(
    private sessionRepository: ISessionRepository,
    private redisClient: Redis
  ) {}

  async createSession(payload: UnifiedTokenPayload, request: Request): Promise<UnifiedSession> {
    const session: UnifiedSession = {
      id: this.generateSessionId(),
      userId: payload.sub,
      tokenJTI: payload.jti!,
      authProvider: payload.auth_provider,
      createdAt: new Date(),
      expiresAt: new Date(payload.exp * 1000),
      lastAccessedAt: new Date(),
      ipAddress: this.getClientIP(request),
      userAgent: this.getUserAgent(request),
      isActive: true
    };

    // Store in database
    await this.sessionRepository.create(session);

    // Cache in Redis for fast access
    await this.redisClient.setex(
      `session:${session.id}`,
      3 * 60 * 60, // 3 hours
      JSON.stringify(session)
    );

    return session;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    // Try Redis first
    const cached = await this.redisClient.get(`session:${sessionId}`);
    if (cached) {
      const session = JSON.parse(cached);
      return session.isActive && session.expiresAt > new Date();
    }

    // Fallback to database
    const session = await this.sessionRepository.findById(sessionId);
    return session?.isActive && session.expiresAt > new Date() || false;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
    await this.redisClient.del(`session:${sessionId}`);
  }
}
```

## Token Refresh Mechanism

### Refresh Token Flow

```typescript
export class TokenRefreshService {
  constructor(
    private tokenGenerator: UnifiedRS256TokenGenerator,
    private sessionManager: UnifiedSessionManager
  ) {}

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const verification = await this.tokenGenerator.verifyToken(refreshToken);
    if (!verification.valid || verification.payload?.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const payload = verification.payload;

    // Validate session
    if (payload.session_id) {
      const sessionValid = await this.sessionManager.validateSession(payload.session_id);
      if (!sessionValid) {
        throw new Error('Session expired or revoked');
      }
    }

    // Generate new token pair
    const newPayload: UnifiedTokenPayload = {
      ...payload,
      iat: undefined,
      exp: undefined,
      jti: undefined
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenGenerator.generateAccessToken(newPayload),
      this.tokenGenerator.generateRefreshToken(newPayload)
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: Math.floor(Date.now() / 1000) + (3 * 60 * 60), // 3 hours
      tokenType: 'Bearer'
    };
  }
}
```

## Security Considerations

### Token Expiration Strategy
- **Access Tokens**: 3 hours (as requested)
- **Refresh Tokens**: 7 days
- **Session Timeout**: 3 hours (inactivity)
- **Absolute Session Limit**: 7 days

### Rate Limiting
```typescript
export class AuthRateLimiter {
  constructor(private redis: Redis) {}

  async checkLoginAttempts(identifier: string): Promise<boolean> {
    const key = `auth:attempts:${identifier}`;
    const attempts = await this.redis.incr(key);

    if (attempts === 1) {
      await this.redis.expire(key, 15 * 60); // 15 minutes
    }

    return attempts <= 5; // Max 5 attempts per 15 minutes
  }

  async checkTokenRefresh(userId: string): Promise<boolean> {
    const key = `auth:refresh:${userId}`;
    const requests = await this.redis.incr(key);

    if (requests === 1) {
      await this.redis.expire(key, 60); // 1 minute
    }

    return requests <= 10; // Max 10 refresh requests per minute
  }
}
```

### Token Revocation
```typescript
export class TokenRevocationService {
  constructor(private redis: Redis) {}

  async revokeToken(jti: string, exp: number): Promise<void> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(`revoked:${jti}`, ttl, '1');
    }
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const result = await this.redis.get(`revoked:${jti}`);
    return result === '1';
  }
}
```

## Migration Strategy

### Phase 1: Parallel Implementation
1. Deploy new RS256 implementation alongside existing HS256
2. Add feature flag for RS256 tokens
3. Update authentication endpoints to support both algorithms

### Phase 2: Gradual Migration
1. Enable RS256 for new users
2. Force re-authentication for existing users
3. Monitor system performance and errors

### Phase 3: Complete Migration
1. Disable HS256 token generation
2. Allow existing HS256 tokens to expire naturally
3. Remove HS256 code after all tokens expire

### Migration Code Example
```typescript
export class MigrationTokenGenerator {
  constructor(
    private rs256Generator: UnifiedRS256TokenGenerator,
    private hs256Generator: JWTTokenGenerator,
    private useRS256: boolean = false
  ) {}

  async generateToken(payload: TokenPayload): Promise<string> {
    if (this.useRS256) {
      return await this.rs256Generator.generateAccessToken(payload);
    } else {
      return await this.hs256Generator.generateAccessToken(payload);
    }
  }

  async verifyToken(token: string): Promise<TokenVerificationResult> {
    // Try RS256 first if enabled
    if (this.useRS256) {
      const rs256Result = await this.rs256Generator.verifyToken(token);
      if (rs256Result.valid) {
        return rs256Result;
      }
    }

    // Fallback to HS256
    return await this.hs256Generator.verifyToken(token);
  }
}
```

## Testing Requirements

### Unit Tests
- Token generation and verification
- Key management functionality
- Session management operations
- Token refresh flow
- Rate limiting enforcement

### Integration Tests
- End-to-end authentication flow
- Cross-system token validation
- Session persistence and retrieval
- Token revocation scenarios

### Security Tests
- Token tampering attempts
- Replay attack prevention
- Brute force protection
- Session hijacking prevention

### Performance Tests
- Token generation throughput
- Validation latency
- Concurrent authentication requests
- Memory usage under load

## Implementation Checklist

### Configuration
- [ ] Generate RSA key pair
- [ ] Update environment variables
- [ ] Configure Better Auth with RS256
- [ ] Update custom auth token generator

### Integration
- [ ] Implement unified token validator
- [ ] Create session management service
- [ ] Build token refresh mechanism
- [ ] Add rate limiting and security measures

### Migration
- [ ] Deploy parallel implementation
- [ ] Enable gradual migration
- [ ] Monitor system performance
- [ ] Complete migration and cleanup

### Testing
- [ ] Write comprehensive unit tests
- [ ] Create integration test suite
- [ ] Perform security testing
- [ ] Validate performance requirements

## Conclusion

This unified authentication schema provides:
- **Consistent token structure** across custom auth and Better Auth
- **RS256 security** with asymmetric cryptography
- **Simple key management** using environment variables
- **Gradual migration** path from existing HS256 implementation
- **Scalable session management** with Redis caching
- **Comprehensive security** measures including rate limiting and token revocation

The design maintains compatibility with both Keycloak OAuth flows and custom API authentication while providing a unified, secure, and maintainable authentication system.