import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';
import { ITokenGenerator, TokenPayload, TokenOptions, TokenPair } from '../../domain/interfaces/ITokenGenerator';
import { RS256KeyManager } from './RS256KeyManager';

/**
 * Unified Token Generator supporting both RS256 and HS256 algorithms
 * Implements the unified token payload structure for compatibility with custom auth and Better Auth
 */
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
    this.accessTokenExpiry = config.accessTokenExpiry || 3 * 60 * 60; // 3 hours default
    this.refreshTokenExpiry = config.refreshTokenExpiry || 7 * 24 * 60 * 60; // 7 days default
    this.issuer = config.issuer || 'modular-monolith';
    this.audience = config.audience || 'modular-monolith-api';
    this.useRS256 = process.env.ENABLE_RS256_TOKENS === 'true';
  }

  async generateAccessToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    try {
      const algorithm = this.useRS256 ? 'RS256' : 'HS256';
      const key = this.useRS256 ? this.keyManager.getPrivateKey() : process.env.JWT_SECRET!;

      if (!key) {
        throw new Error('No signing key available');
      }

      const signOptions: any = {
        algorithm,
        keyid: this.useRS256 ? this.keyManager.getKeyId() : undefined
      };

      if (options?.expiresIn) {
        signOptions.expiresIn = options.expiresIn;
      } else {
        signOptions.expiresIn = `${this.accessTokenExpiry}s`;
      }

      // Create a clean payload without any JWT-specific fields
      const { exp, iat, jti, type, ...cleanPayload } = payload;

      const jwtPayload = {
        ...cleanPayload,
        iss: this.issuer,
        aud: this.audience,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        jti: this.generateJTI()
      };

      console.log(`[JWT] Generating access token with ${algorithm} algorithm`);
      console.log('[JWT] Token payload:', JSON.stringify(jwtPayload, null, 2));

      const token = jwt.sign(jwtPayload, key, signOptions);
      console.log(`[JWT] Access token generated successfully using ${algorithm}`);

      return token;
    } catch (error) {
      console.error('[JWT] Error generating access token:', error);
      throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRefreshToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    try {
      const algorithm = this.useRS256 ? 'RS256' : 'HS256';
      const key = this.useRS256 ? this.keyManager.getPrivateKey() : process.env.JWT_SECRET!;

      if (!key) {
        throw new Error('No signing key available');
      }

      const signOptions: any = {
        algorithm,
        keyid: this.useRS256 ? this.keyManager.getKeyId() : undefined
      };

      if (options?.expiresIn) {
        signOptions.expiresIn = options.expiresIn;
      } else {
        signOptions.expiresIn = `${this.refreshTokenExpiry}s`;
      }

      // Create a clean payload without any JWT-specific fields
      const { exp, iat, jti, type, ...cleanPayload } = payload;

      const jwtPayload = {
        ...cleanPayload,
        iss: this.issuer,
        aud: this.audience,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        jti: this.generateJTI()
      };

      console.log(`[JWT] Generating refresh token with ${algorithm} algorithm`);

      const token = jwt.sign(jwtPayload, key, signOptions);
      console.log(`[JWT] Refresh token generated successfully using ${algorithm}`);

      return token;
    } catch (error) {
      console.error('[JWT] Error generating refresh token:', error);
      throw new Error(`Failed to generate refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTokenPair(payload: TokenPayload, accessOptions?: TokenOptions, refreshOptions?: TokenOptions): Promise<TokenPair> {
    console.log('[JWT] Generating token pair with payload:', JSON.stringify(payload, null, 2));

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

        console.log('[JWT] Token verified successfully using RS256');
        return {
          valid: true,
          payload: decoded
        };
      } catch (error) {
        console.log('[JWT] RS256 verification failed, trying HS256 fallback');
        // Continue to HS256 fallback
      }
    }

    // Fallback to HS256
    try {
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error('JWT_SECRET not configured for HS256 fallback');
      }

      const decoded = jwt.verify(token, secretKey, {
        algorithms: ['HS256'],
        issuer: this.issuer,
        audience: this.audience
      }) as any;

      console.log('[JWT] Token verified successfully using HS256');
      return {
        valid: true,
        payload: decoded
      };
    } catch (error: any) {
      console.log('[JWT] Token verification failed:', error.name);

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
    const verification = await this.verifyToken(token);

    // Additional check for refresh token type
    if (verification.valid && verification.payload?.type !== 'refresh') {
      return {
        valid: false,
        error: 'Token is not a refresh token'
      };
    }

    return verification;
  }

  // Helper method to extract token without verification (for debugging)
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  async isTokenExpired(token: string): Promise<boolean> {
    const verification = await this.verifyToken(token);
    return !verification.valid;
  }

  // Get token expiration time
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

  // Get current algorithm
  getAlgorithm(): string {
    return this.useRS256 ? 'RS256' : 'HS256';
  }

  // Get key ID for RS256
  getKeyId(): string | undefined {
    return this.useRS256 ? this.keyManager.getKeyId() : undefined;
  }

  // Generate JWT ID for token tracking
  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Legacy class for backward compatibility
export class JWTTokenGenerator extends UnifiedRS256TokenGenerator {
  constructor(config: {
    secretKey?: string;
    accessTokenExpiry?: number;
    refreshTokenExpiry?: number;
    issuer?: string;
    audience?: string;
  }) {
    // Ignore secretKey parameter as we now use RS256/HS256 based on environment
    super({
      accessTokenExpiry: config.accessTokenExpiry,
      refreshTokenExpiry: config.refreshTokenExpiry,
      issuer: config.issuer,
      audience: config.audience
    });
  }
}