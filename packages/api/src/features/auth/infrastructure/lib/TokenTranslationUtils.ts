import { UnifiedRS256TokenGenerator } from './JWTTokenGenerator';
import { KeycloakTokenTranslator, UnifiedTokenPayload } from './KeycloakProvider';
import { TokenPayload } from '../../domain/interfaces/ITokenGenerator';

/**
 * Token Translation Utilities
 * Provides interoperability between custom auth, Better Auth, and Keycloak tokens
 */
export class TokenTranslationUtils {
  private tokenGenerator: UnifiedRS256TokenGenerator;

  constructor() {
    this.tokenGenerator = new UnifiedRS256TokenGenerator({});
  }

  /**
   * Translate custom auth token to unified format
   */
  translateCustomToUnified(customPayload: TokenPayload): UnifiedTokenPayload {
    console.log('[TOKEN-TRANSLATOR] Translating custom auth token to unified format');

    const unifiedPayload: UnifiedTokenPayload = {
      // Standard JWT claims
      sub: customPayload.sub,
      iss: 'modular-monolith',
      aud: 'modular-monolith-api',
      exp: customPayload.exp || Math.floor(Date.now() / 1000) + (3 * 60 * 60),
      iat: customPayload.iat || Math.floor(Date.now() / 1000),
      jti: customPayload.jti || this.generateJTI(),
      nbf: customPayload.nbf,

      // User information
      email: customPayload.email,
      name: customPayload.name,
      role: customPayload.role || 'user',
      username: customPayload.username,

      // Authentication context
      auth_provider: 'custom',
      auth_method: customPayload.auth_method || 'password',
      session_id: customPayload.session_id,

      // Token specific
      type: customPayload.type || 'access',
      scope: customPayload.scope,

      // Application specific
      tenant_id: customPayload.tenant_id,
      permissions: customPayload.permissions || []
    };

    console.log('[TOKEN-TRANSLATOR] Custom token translated to unified format');
    return unifiedPayload;
  }

  /**
   * Translate Better Auth token to unified format
   */
  translateBetterAuthToUnified(betterAuthPayload: any): UnifiedTokenPayload {
    console.log('[TOKEN-TRANSLATOR] Translating Better Auth token to unified format');

    const unifiedPayload: UnifiedTokenPayload = {
      // Standard JWT claims
      sub: betterAuthPayload.sub || betterAuthPayload.userId,
      iss: 'modular-monolith',
      aud: 'modular-monolith-api',
      exp: betterAuthPayload.exp || Math.floor(Date.now() / 1000) + (3 * 60 * 60),
      iat: betterAuthPayload.iat || Math.floor(Date.now() / 1000),
      jti: betterAuthPayload.jti || this.generateJTI(),
      nbf: betterAuthPayload.nbf,

      // User information
      email: betterAuthPayload.email,
      name: betterAuthPayload.name,
      role: betterAuthPayload.role || 'user',
      username: betterAuthPayload.username,

      // Authentication context
      auth_provider: 'keycloak',
      auth_method: 'oauth',
      session_id: betterAuthPayload.session_id || betterAuthPayload.sessionId,

      // Token specific
      type: betterAuthPayload.type || 'access',
      scope: betterAuthPayload.scope,

      // Application specific
      tenant_id: betterAuthPayload.tenant_id,
      permissions: betterAuthPayload.permissions || []
    };

    console.log('[TOKEN-TRANSLATOR] Better Auth token translated to unified format');
    return unifiedPayload;
  }

  /**
   * Translate unified format to custom auth format
   */
  translateUnifiedToCustom(unifiedPayload: UnifiedTokenPayload): TokenPayload {
    console.log('[TOKEN-TRANSLATOR] Translating unified format to custom auth format');

    const customPayload: TokenPayload = {
      // User identification
      sub: unifiedPayload.sub,
      email: unifiedPayload.email,
      name: unifiedPayload.name,
      role: unifiedPayload.role,
      username: unifiedPayload.username,

      // Authentication context
      auth_method: unifiedPayload.auth_method,
      session_id: unifiedPayload.session_id,

      // Token metadata
      type: unifiedPayload.type,
      scope: unifiedPayload.scope,

      // Application specific
      tenant_id: unifiedPayload.tenant_id,
      permissions: unifiedPayload.permissions,

      // JWT claims (for compatibility)
      iss: unifiedPayload.iss,
      aud: unifiedPayload.aud,
      exp: unifiedPayload.exp,
      iat: unifiedPayload.iat,
      jti: unifiedPayload.jti,
      nbf: unifiedPayload.nbf
    };

    console.log('[TOKEN-TRANSLATOR] Unified format translated to custom auth format');
    return customPayload;
  }

  /**
   * Translate unified format to Better Auth format
   */
  translateUnifiedToBetterAuth(unifiedPayload: UnifiedTokenPayload): any {
    console.log('[TOKEN-TRANSLATOR] Translating unified format to Better Auth format');

    const betterAuthPayload = {
      // User identification
      sub: unifiedPayload.sub,
      userId: unifiedPayload.sub,
      email: unifiedPayload.email,
      name: unifiedPayload.name,
      role: unifiedPayload.role,
      username: unifiedPayload.username,

      // Authentication context
      auth_provider: unifiedPayload.auth_provider,
      auth_method: unifiedPayload.auth_method,
      session_id: unifiedPayload.session_id,
      sessionId: unifiedPayload.session_id,

      // Token metadata
      type: unifiedPayload.type,
      scope: unifiedPayload.scope,

      // Application specific
      tenant_id: unifiedPayload.tenant_id,
      permissions: unifiedPayload.permissions,

      // JWT claims
      exp: unifiedPayload.exp,
      iat: unifiedPayload.iat,
      jti: unifiedPayload.jti,
      nbf: unifiedPayload.nbf,

      // Better Auth specific fields
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('[TOKEN-TRANSLATOR] Unified format translated to Better Auth format');
    return betterAuthPayload;
  }

  /**
   * Validate and translate token from any source to unified format
   */
  async validateAndTranslateToUnified(token: string): Promise<{
    valid: boolean;
    unifiedPayload?: UnifiedTokenPayload;
    source?: 'custom' | 'better-auth' | 'keycloak';
    error?: string;
  }> {
    console.log('[TOKEN-TRANSLATOR] Validating and translating token to unified format');

    // First, verify the token using our unified token generator
    const verification = await this.tokenGenerator.verifyToken(token);

    if (!verification.valid) {
      console.log('[TOKEN-TRANSLATOR] Token verification failed:', verification.error);
      return {
        valid: false,
        error: verification.error || 'Token verification failed'
      };
    }

    const payload = verification.payload!;

    // Determine token source and translate accordingly
    let source: 'custom' | 'better-auth' | 'keycloak';
    let unifiedPayload: UnifiedTokenPayload;

    if (payload.auth_provider) {
      source = payload.auth_provider === 'keycloak' ? 'keycloak' : 'custom';
    } else if (payload.auth_method) {
      source = 'custom';
    } else {
      source = 'better-auth';
    }

    // Translate based on source
    switch (source) {
      case 'custom':
        unifiedPayload = this.translateCustomToUnified(payload);
        break;
      case 'better-auth':
        unifiedPayload = this.translateBetterAuthToUnified(payload);
        break;
      case 'keycloak':
        unifiedPayload = KeycloakTokenTranslator.translateToUnified(payload);
        break;
      default:
        unifiedPayload = this.translateCustomToUnified(payload);
    }

    console.log('[TOKEN-TRANSLATOR] Token validated and translated successfully');
    return {
      valid: true,
      unifiedPayload,
      source
    };
  }

  /**
   * Create unified token from any user data source
   */
  async createUnifiedToken(userData: {
    userId: string;
    email: string;
    name: string;
    role?: 'user' | 'admin' | 'super_admin';
    username?: string;
    authProvider?: 'custom' | 'keycloak' | 'oauth';
    authMethod?: 'password' | 'oauth' | 'sso';
    sessionId?: string;
    tenantId?: string;
    permissions?: string[];
  }, tokenType: 'access' | 'refresh' = 'access'): Promise<string> {
    console.log(`[TOKEN-TRANSLATOR] Creating unified ${tokenType} token`);

    const unifiedPayload: UnifiedTokenPayload = {
      // Standard JWT claims
      sub: userData.userId,
      iss: 'modular-monolith',
      aud: 'modular-monolith-api',
      exp: Math.floor(Date.now() / 1000) + (tokenType === 'access' ? 3 * 60 * 60 : 7 * 24 * 60 * 60),
      iat: Math.floor(Date.now() / 1000),
      jti: this.generateJTI(),

      // User information
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      username: userData.username,

      // Authentication context
      auth_provider: userData.authProvider || 'custom',
      auth_method: userData.authMethod || 'password',
      session_id: userData.sessionId,

      // Token specific
      type: tokenType,

      // Application specific
      tenant_id: userData.tenantId,
      permissions: userData.permissions || []
    };

    // Generate token using unified token generator
    const token = tokenType === 'access'
      ? await this.tokenGenerator.generateAccessToken(unifiedPayload)
      : await this.tokenGenerator.generateRefreshToken(unifiedPayload);

    console.log(`[TOKEN-TRANSLATOR] Unified ${tokenType} token created successfully`);
    return token;
  }

  /**
   * Generate JWT ID for token tracking
   */
  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract token metadata without verification
   */
  extractTokenMetadata(token: string): {
    header: any;
    payload: any;
    algorithm: string;
    keyId?: string;
  } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Ensure parts exist before parsing
      if (!parts[0] || !parts[1]) {
        return null;
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      return {
        header,
        payload,
        algorithm: header.alg,
        keyId: header.kid
      };
    } catch (error) {
      console.error('[TOKEN-TRANSLATOR] Error extracting token metadata:', error);
      return null;
    }
  }

  /**
   * Check if token uses RS256 algorithm
   */
  isRS256Token(token: string): boolean {
    const metadata = this.extractTokenMetadata(token);
    return metadata?.algorithm === 'RS256';
  }

  /**
   * Check if token uses HS256 algorithm
   */
  isHS256Token(token: string): boolean {
    const metadata = this.extractTokenMetadata(token);
    return metadata?.algorithm === 'HS256';
  }
}

// Export singleton instance
export const tokenTranslationUtils = new TokenTranslationUtils();