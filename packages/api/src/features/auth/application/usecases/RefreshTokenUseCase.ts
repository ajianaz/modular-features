import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ITokenGenerator } from '../../domain/interfaces/ITokenGenerator';
import { Session } from '../../domain/entities/Session.entity';
import { RefreshTokenRequest } from '../dtos/input/RefreshTokenRequest';
import { RefreshTokenResponse } from '../dtos/output/RefreshTokenResponse';
import {
  RefreshTokenRevokedError,
  SessionNotFoundError,
  SessionExpiredError
} from '../../domain/errors/AuthenticationError';

export class RefreshTokenUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository,
    private tokenGenerator: ITokenGenerator
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken, userAgent, ipAddress } = request;

    // Find session by refresh token
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new RefreshTokenRevokedError();
    }

    // Check if session is still valid
    if (!session.isValid()) {
      throw new SessionExpiredError();
    }

    // Fetch user information
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new SessionNotFoundError(`User not found for session ${session.id}`);
    }

    // Generate new token pair with unified schema
    const tokenPair = await this.tokenGenerator.generateTokenPair(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        auth_provider: 'custom',
        auth_method: 'password',
        session_id: session.id
      },
      { expiresIn: '15m' }, // Access token expires in 15 minutes
      { expiresIn: '7d' } // Refresh token expires in 7 days
    );

    // Update session with new tokens
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days from now

    // Create a new session with updated tokens
    const updatedSession = new Session(
      session.id,
      session.userId,
      tokenPair.accessToken,
      tokenPair.refreshToken,
      newExpiresAt,
      new Date(), // Update lastAccessedAt
      session.createdAt,
      new Date(), // Update updatedAt
      session.userAgent,
      session.ipAddress,
      session.isActive
    );

    // Save updated session
    const savedSession = await this.sessionRepository.update(updatedSession);

    return {
      user: user.toJSON(),
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: this.getExpiresInSeconds(tokenPair.expiresIn),
        tokenType: tokenPair.tokenType || 'Bearer'
      },
      session: {
        id: savedSession.id,
        expiresAt: savedSession.expiresAt,
        lastAccessedAt: savedSession.lastAccessedAt
      }
    };
  }

  private getExpiresInSeconds(expiresIn: string | number): number {
    if (typeof expiresIn === 'string') {
      // Parse time strings like '15m', '7d', '30d'
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (!match) return 3600; // Default to 1 hour

      const value = parseInt(match[1] || '0');
      const unit = match[2];

      switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: return 3600;
      }
    }

    return typeof expiresIn === 'number' ? expiresIn : 3600;
  }
}