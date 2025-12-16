import { LoginRequest } from '../dtos/input/LoginRequest';
import { LoginResponse } from '../dtos/output/LoginResponse';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { IHashProvider } from '../../domain/interfaces/IHashProvider';
import { ITokenGenerator, TokenPair } from '../../domain/interfaces/ITokenGenerator';
import { User as UserEntity } from '../../domain/entities/User.entity';
import { Session } from '../../domain/entities/Session.entity';
import {
  InvalidCredentialsError,
  AccountNotVerifiedError,
  AccountSuspendedError,
  AccountInactiveError,
  TooManyLoginAttemptsError
} from '../../domain/errors/AuthenticationError';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private hashProvider: IHashProvider,
    private tokenGenerator: ITokenGenerator
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password, rememberMe, userAgent, ipAddress } = request;

    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new UserNotFoundError(email);
    }

    // Check if user can login
    if (!user.canLogin()) {
      if (!user.emailVerified) {
        throw new AccountNotVerifiedError(email);
      }
      if (user.status === 'suspended') {
        throw new AccountSuspendedError(email);
      }
      if (user.status === 'inactive') {
        throw new AccountInactiveError(email);
      }
    }

    // Verify password
    const isPasswordValid = await this.hashProvider.verify(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    const tokenPair = await this.tokenGenerator.generateTokenPair(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    );

    // Create session
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + (rememberMe ? 7 : 1)); // 7 days for remember me, 1 day otherwise

    const session = Session.create({
      userId: user.id,
      token: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      userAgent,
      ipAddress,
      expiresAt: sessionExpiresAt
    });

    // Save session
    const savedSession = await this.sessionRepository.create(session);

    // Update user's last login (optional, could be handled by a separate use case)
    // await this.userRepository.updateLastLogin(user.id);

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