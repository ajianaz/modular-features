// Token payload interface
export interface TokenPayload {
  sub: string; // Subject (user ID)
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  iat?: number; // Issued at
  exp?: number; // Expires at
  jti?: string; // JWT ID
  type?: 'access' | 'refresh'; // Token type
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