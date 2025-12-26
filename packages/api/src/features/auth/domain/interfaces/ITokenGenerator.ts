// Unified Token payload interface for RS256 implementation
export interface TokenPayload {
  // Standard JWT Claims
  sub: string;           // User ID (UUID)
  iss?: string;          // Issuer (modular-monolith)
  aud?: string;          // Audience (api/web)
  exp?: number;          // Expiration time
  iat?: number;          // Issued at
  jti?: string;          // JWT ID (unique identifier)
  nbf?: number;          // Not before

  // User Information
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  username?: string;

  // Authentication Context
  auth_provider?: 'custom' | 'keycloak' | 'oauth';
  auth_method?: 'password' | 'oauth' | 'sso';
  session_id?: string;    // For session tracking

  // Token Specific
  type?: 'access' | 'refresh';
  scope?: string;         // OAuth scopes if applicable

  // Application Specific
  tenant_id?: string;     // Multi-tenancy support
  permissions?: string[];  // Fine-grained permissions
}

// Token generation options
export interface TokenOptions {
  expiresIn?: string | number; // e.g., '15m', '7d', 3600
  issuer?: string;
  audience?: string;
  algorithm?: string;
}

// Token pair for authentication
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
}

// Interface for JWT token generation and verification
export interface ITokenGenerator {
  // Generate access token
  generateAccessToken(payload: TokenPayload, options?: TokenOptions): Promise<string>;

  // Generate refresh token
  generateRefreshToken(payload: TokenPayload, options?: TokenOptions): Promise<string>;

  // Generate token pair
  generateTokenPair(payload: TokenPayload, accessOptions?: TokenOptions, refreshOptions?: TokenOptions): Promise<TokenPair>;

  // Verify and decode token
  verifyToken(token: string): Promise<{
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
  }>;

  // Decode token without verification (for debugging/logging)
  decodeToken(token: string): TokenPayload | null;

  // Check if token is expired
  isTokenExpired(token: string): Promise<boolean>;

  // Get token expiration time
  getTokenExpiration(token: string): Promise<{
    isExpired: boolean;
    expiresIn: number;
    timeToExpiry: number;
  } | null>;
}