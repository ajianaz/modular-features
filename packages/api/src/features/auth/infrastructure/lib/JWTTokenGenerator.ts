import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { ITokenGenerator, TokenPayload, TokenOptions, TokenPair } from '../../domain/interfaces/ITokenGenerator';

export class JWTTokenGenerator implements ITokenGenerator {
  private readonly secretKey: string;
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(config: {
    secretKey: string;
    accessTokenExpiry?: number; // in seconds
    refreshTokenExpiry?: number; // in seconds
    issuer?: string;
    audience?: string;
  }) {
    this.secretKey = config.secretKey;
    this.accessTokenExpiry = config.accessTokenExpiry || 15 * 60; // 15 minutes default
    this.refreshTokenExpiry = config.refreshTokenExpiry || 7 * 24 * 60 * 60; // 7 days default
    this.issuer = config.issuer || 'modular-monolith';
    this.audience = config.audience || 'modular-monolith-api';
  }

  async generateAccessToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      iat: now,
      exp: now + this.accessTokenExpiry,
      iss: this.issuer,
      aud: this.audience
    };

    const signOptions: SignOptions = {
      algorithm: 'HS256',
      expiresIn: (options?.expiresIn as any) || this.accessTokenExpiry
    };

    try {
      return jwt.sign(jwtPayload, this.secretKey, signOptions);
    } catch (error) {
      throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRefreshToken(payload: TokenPayload, options?: TokenOptions): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      iat: now,
      exp: now + this.refreshTokenExpiry,
      iss: this.issuer,
      aud: this.audience
    };

    const signOptions: SignOptions = {
      algorithm: 'HS256',
      expiresIn: (options?.expiresIn as any) || this.refreshTokenExpiry
    };

    try {
      return jwt.sign(jwtPayload, this.secretKey, signOptions);
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    const verifyOptions: VerifyOptions = {
      algorithms: ['HS256'],
      issuer: this.issuer,
      audience: this.audience
    };

    try {
      const decoded = jwt.verify(token, this.secretKey, verifyOptions) as TokenPayload;

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
    // Use the same verification logic for refresh tokens
    return this.verifyToken(token);
  }

  // Helper method to extract token without verification (for debugging)
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
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

  // Get token expiry information (deprecated, use getTokenExpiration instead)
  async getTokenExpiryInfo(token: string): Promise<{
    isExpired: boolean;
    expiresIn: number;
    timeToExpiry: number;
  } | null> {
    return this.getTokenExpiration(token);
  }

  // Get configuration
  getSecretKey(): string {
    return this.secretKey;
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