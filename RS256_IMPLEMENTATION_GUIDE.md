# RS256 Implementation Guide - Quick Start

## 1. Generate RSA Keys

```bash
# Create keys directory
mkdir -p keys
cd keys

# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to base64 for environment variables
base64 -w 0 private.pem > private_base64.txt
base64 -w 0 public.pem > public_base64.txt

# Display keys for copy-paste
echo "Private Key (base64):"
cat private_base64.txt
echo ""
echo "Public Key (base64):"
cat public_base64.txt
```

## 2. Update Environment Variables

Add to your `.env` file:

```bash
# RS256 JWT Configuration
JWT_RS256_PRIVATE_KEY_BASE64=<paste-private-key-here>
JWT_RS256_PUBLIC_KEY_BASE64=<paste-public-key-here>
JWT_RS256_KEY_ID=key-2024-001

# Token Expiration
JWT_ACCESS_TOKEN_EXPIRY=3h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Migration Flag
ENABLE_RS256_TOKENS=true
```

## 3. Update Custom Auth Implementation

Replace `packages/api/src/features/auth/infrastructure/lib/JWTTokenGenerator.ts`:

```typescript
import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';
import { ITokenGenerator, TokenPayload, TokenOptions, TokenPair } from '../../domain/interfaces/ITokenGenerator';

class RS256KeyManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor() {
    const privateKeyBase64 = process.env.JWT_RS256_PRIVATE_KEY_BASE64;
    const publicKeyBase64 = process.env.JWT_RS256_PUBLIC_KEY_BASE64;

    if (!privateKeyBase64 || !publicKeyBase64) {
      throw new Error('RS256 keys not configured in environment variables');
    }

    this.privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
    this.publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
    this.keyId = process.env.JWT_RS256_KEY_ID || 'default';
  }

  getPrivateKey(): string { return this.privateKey; }
  getPublicKey(): string { return this.publicKey; }
  getKeyId(): string { return this.keyId; }
}

export class UnifiedRS256TokenGenerator implements ITokenGenerator {
  private keyManager: RS256KeyManager;
  private accessTokenExpiry: number;
  private refreshTokenExpiry: number;
  private issuer: string;
  private audience: string;
  private useRS256: boolean;

  constructor(config: {
    accessTokenExpiry?: number;
    refreshTokenExpiry?: number;
    issuer?: string;
    audience?: string;
  }) {
    this.keyManager = new RS256KeyManager();
    this.accessTokenExpiry = config.accessTokenExpiry || 3 * 60 * 60; // 3 hours
    this.refreshTokenExpiry = config.refreshTokenExpiry || 7 * 24 * 60 * 60; // 7 days
    this.issuer = config.issuer || 'modular-monolith';
    this.audience = config.audience || 'modular-monolith-api';
    this.useRS256 = process.env.ENABLE_RS256_TOKENS === 'true';
  }

  async generateAccessToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    const algorithm = this.useRS256 ? 'RS256' : 'HS256';
    const key = this.useRS256 ? this.keyManager.getPrivateKey() : process.env.JWT_SECRET!;

    const signOptions: any = {
      algorithm,
      keyid: this.useRS256 ? this.keyManager.getKeyId() : undefined
    };

    if (options?.expiresIn) {
      signOptions.expiresIn = options.expiresIn;
    } else {
      signOptions.expiresIn = `${this.accessTokenExpiry}s`;
    }

    const { exp, iat, jti, type, ...cleanPayload } = payload;

    const jwtPayload = {
      ...cleanPayload,
      iss: this.issuer,
      aud: this.audience,
      type: 'access'
    };

    return jwt.sign(jwtPayload, key, signOptions);
  }

  async generateRefreshToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    const algorithm = this.useRS256 ? 'RS256' : 'HS256';
    const key = this.useRS256 ? this.keyManager.getPrivateKey() : process.env.JWT_SECRET!;

    const signOptions: any = {
      algorithm,
      keyid: this.useRS256 ? this.keyManager.getKeyId() : undefined
    };

    if (options?.expiresIn) {
      signOptions.expiresIn = options.expiresIn;
    } else {
      signOptions.expiresIn = `${this.refreshTokenExpiry}s`;
    }

    const { exp, iat, jti, type, ...cleanPayload } = payload;

    const jwtPayload = {
      ...cleanPayload,
      iss: this.issuer,
      aud: this.audience,
      type: 'refresh'
    };

    return jwt.sign(jwtPayload, key, signOptions);
  }

  async generateTokenPair(payload: TokenPayload, accessOptions?: TokenOptions, refreshOptions?: TokenOptions): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload, accessOptions),
      this.generateRefreshToken(payload, refreshOptions)
    ]);

    const now = Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn: now + this.accessTokenExpiry,
      tokenType: 'Bearer'
    };
  }

  async verifyToken(token: string): Promise<{
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
  }> {
    // Try RS256 first if enabled
    if (this.useRS256) {
      try {
        const decoded = jwt.verify(token, this.keyManager.getPublicKey(), {
          algorithms: ['RS256'],
          issuer: this.issuer,
          audience: this.audience
        }) as any;

        return {
          valid: true,
          payload: decoded
        };
      } catch (error) {
        // Continue to HS256 fallback
      }
    }

    // Fallback to HS256
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256'],
        issuer: this.issuer,
        audience: this.audience
      }) as any;

      return {
        valid: true,
        payload: decoded
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token expired'
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Invalid token'
        };
      }

      return {
        valid: false,
        error: error.message || 'Token verification failed'
      };
    }
  }

  async verifyRefreshToken(token: string): Promise<{
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
  }> {
    return this.verifyToken(token);
  }

  // Helper methods (unchanged)
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async isTokenExpired(token: string): Promise<boolean> {
    const verification = await this.verifyToken(token);
    return !verification.valid;
  }

  async getTokenExpiration(token: string): Promise<{
    isExpired: boolean;
    expiresIn: number;
    timeToExpiry: number;
  } | null> {
    const verification = await this.verifyToken(token);

    if (!verification.valid || !verification.payload) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = verification.payload.exp ? verification.payload.exp - now : 0;
    const isExpired = expiresIn <= 0;

    return {
      isExpired,
      expiresIn,
      timeToExpiry: isExpired ? 0 : verification.payload.exp || 0
    };
  }

  // Get configuration methods
  getSecretKey(): string {
    return this.useRS256 ? this.keyManager.getPrivateKey() : process.env.JWT_SECRET!;
  }

  getAccessTokenExpiry(): number {
    return this.accessTokenExpiry;
  }

  getRefreshTokenExpiry(): number {
    return this.refreshTokenExpiry;
  }

  getIssuer(): string {
    return this.issuer;
  }

  getAudience(): string {
    return this.audience;
  }
}
```

## 4. Update Better Auth Configuration

Update `packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, keycloak, jwt } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';
import { users, sessions, oauthAccounts, emailVerifications } from '@modular-monolith/database';

// RS256 Key Manager for Better Auth
class BetterAuthRS256Manager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor() {
    const privateKeyBase64 = process.env.JWT_RS256_PRIVATE_KEY_BASE64;
    const publicKeyBase64 = process.env.JWT_RS256_PUBLIC_KEY_BASE64;

    if (!privateKeyBase64 || !publicKeyBase64) {
      throw new Error('RS256 keys not configured for Better Auth');
    }

    this.privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
    this.publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
    this.keyId = process.env.JWT_RS256_KEY_ID || 'default';
  }

  getPrivateKey(): string { return this.privateKey; }
  getPublicKey(): string { return this.publicKey; }
  getKeyId(): string { return this.keyId; }
}

const rs256Manager = new BetterAuthRS256Manager();

// Better Auth configuration with RS256
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false,
    schema: {
      user: users,
      session: sessions,
      oauthAccount: oauthAccounts,
      emailVerification: emailVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: 'RS256',
          modulusLength: 2048
        },
        // Use our custom key manager
        adapter: {
          getJwks: async () => {
            // Convert PEM to JWK format
            const publicKeyPem = rs256Manager.getPublicKey();
            const jwk = this.pemToJWK(publicKeyPem, rs256Manager.getKeyId());

            return {
              keys: [jwk]
            };
          },
          getLatestKey: async () => {
            const publicKeyPem = rs256Manager.getPublicKey();
            const jwk = this.pemToJWK(publicKeyPem, rs256Manager.getKeyId());

            return {
              keys: [jwk]
            };
          }
        }
      },
      jwt: {
        definePayload: ({ user, session }) => {
          return {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
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
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.KEYCLOAK_CLIENT_ID || config.auth.keycloak.clientId,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || config.auth.keycloak.clientSecret,
          issuer: process.env.KEYCLOAK_ISSUER || `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}`,
          scopes: ['openid', 'email', 'profile'],
          redirectURI: process.env.KEYCLOAK_REDIRECT_URI || `${config.auth.betterAuth.url}/api/auth/oauth2/callback/keycloak`
        })
      ]
    })
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false
      },
      username: {
        type: 'string',
        required: false,
        input: true
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'active',
        input: false
      }
    }
  },
  account: {
    modelName: 'oauth_accounts',
    fields: {
      providerId: 'provider',
      accountId: 'providerAccountId',
      accessTokenExpiresAt: 'tokenExpiresAt',
    }
  },
  verification: {
    modelName: 'email_verifications',
    fields: {
      identifier: 'email',
      value: 'token',
    }
  },
  callbacks: {
    signIn: async ({ user, account }: any) => {
      if (account?.provider === 'keycloak') {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: true,
            role: user.role || 'user'
          }
        };
      }
      return { user };
    },
    session: async ({ session, user }: any) => {
      return {
        session: {
          userId: session.userId,
          expiresAt: session.expiresAt,
          lastAccessedAt: new Date()
        }
      };
    }
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false
    },
    generateId: true,
    cookiePrefix: 'better-auth',
    idGenerator: 'uuid'
  }
});

// Helper function to convert PEM to JWK
function pemToJWK(pemKey: string, kid: string): any {
  // This is a simplified conversion - in production, use a proper library
  // like 'jose' or 'node-jose' for proper JWK conversion
  const publicKey = pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  return {
    kty: 'RSA',
    alg: 'RS256',
    use: 'sig',
    kid: kid,
    n: publicKey, // This needs proper conversion
    e: 'AQAB'
  };
}

export default auth;
```

## 5. Update Auth Container

Update `packages/api/src/features/auth/infrastructure/container/AuthContainer.ts`:

```typescript
import { Container } from 'inversify';
import { TYPES } from '../../../types';
import { ITokenGenerator } from '../../domain/interfaces/ITokenGenerator';
import { UnifiedRS256TokenGenerator } from '../lib/JWTTokenGenerator';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { IHashProvider } from '../../domain/interfaces/IHashProvider';
import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { BcryptHashProvider } from '../lib/BcryptHashProvider';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { LogoutUseCase } from '../../application/usecases/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/usecases/RefreshTokenUseCase';
import { LoginController } from '../../presentation/controllers/LoginController';
import { RegisterController } from '../../presentation/controllers/RegisterController';
import { LogoutController } from '../../presentation/controllers/LogoutController';
import { RefreshTokenController } from '../../presentation/controllers/RefreshTokenController';

export const authContainer = new Container();

// Token Generator - Updated to use RS256
authContainer.bind<ITokenGenerator>(TYPES.TokenGenerator).to(UnifiedRS256TokenGenerator).inSingletonScope();

// Repositories
authContainer.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
authContainer.bind<ISessionRepository>(TYPES.SessionRepository).to(SessionRepository).inSingletonScope();

// Providers
authContainer.bind<IHashProvider>(TYPES.HashProvider).to(BcryptHashProvider).inSingletonScope();

// Use Cases
authContainer.bind<LoginUseCase>(TYPES.LoginUseCase).toDynamicValue((context) => {
  return new LoginUseCase(
    context.container.get<IUserRepository>(TYPES.UserRepository),
    context.container.get<ITokenGenerator>(TYPES.TokenGenerator),
    context.container.get<IHashProvider>(TYPES.HashProvider),
    context.container.get<ISessionRepository>(TYPES.SessionRepository)
  );
});

authContainer.bind<RegisterUseCase>(TYPES.RegisterUseCase).toDynamicValue((context) => {
  return new RegisterUseCase(
    context.container.get<IUserRepository>(TYPES.UserRepository),
    context.container.get<ITokenGenerator>(TYPES.TokenGenerator),
    context.container.get<IHashProvider>(TYPES.HashProvider),
    context.container.get<ISessionRepository>(TYPES.SessionRepository)
  );
});

authContainer.bind<LogoutUseCase>(TYPES.LogoutUseCase).toDynamicValue((context) => {
  return new LogoutUseCase(
    context.container.get<ISessionRepository>(TYPES.SessionRepository)
  );
});

authContainer.bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).toDynamicValue((context) => {
  return new RefreshTokenUseCase(
    context.container.get<ITokenGenerator>(TYPES.TokenGenerator),
    context.container.get<ISessionRepository>(TYPES.SessionRepository)
  );
});

// Controllers
authContainer.bind<LoginController>(TYPES.LoginController).toDynamicValue((context) => {
  return new LoginController(
    context.container.get<LoginUseCase>(TYPES.LoginUseCase)
  );
});

authContainer.bind<RegisterController>(TYPES.RegisterController).toDynamicValue((context) => {
  return new RegisterController(
    context.container.get<RegisterUseCase>(TYPES.RegisterUseCase)
  );
});

authContainer.bind<LogoutController>(TYPES.LogoutController).toDynamicValue((context) => {
  return new LogoutController(
    context.container.get<LogoutUseCase>(TYPES.LogoutUseCase)
  );
});

authContainer.bind<RefreshTokenController>(TYPES.RefreshTokenController).toDynamicValue((context) => {
  return new RefreshTokenController(
    context.container.get<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase)
  );
});
```

## 6. Test the Implementation

```bash
# Start your application
npm run dev

# Test custom auth login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test Better Auth OAuth flow
curl -X GET http://localhost:3000/api/auth/oauth2/keycloak

# Test token verification
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 7. Migration Steps

1. **Phase 1**: Deploy with `ENABLE_RS256_TOKENS=false` (HS256 only)
2. **Phase 2**: Set `ENABLE_RS256_TOKENS=true` (both algorithms supported)
3. **Phase 3**: After 7 days (when all HS256 tokens expire), remove HS256 code

## 8. Verification Commands

```bash
# Verify RS256 token structure
echo "YOUR_RS256_TOKEN" | cut -d'.' -f2 | base64 -d | jq

# Check token algorithm
echo "YOUR_RS256_TOKEN" | cut -d'.' -f1 | base64 -d | jq
```

This guide provides a simple, step-by-step approach to implement RS256 while maintaining backward compatibility with your existing HS256 implementation.