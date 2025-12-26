import { UserRepository } from '../repositories/UserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { BcryptHashProvider } from '../lib/BcryptHashProvider';
import { UnifiedRS256TokenGenerator } from '../lib/JWTTokenGenerator';

import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { LogoutUseCase } from '../../application/usecases/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/usecases/RefreshTokenUseCase';

/**
 * Dependency Injection Container for Auth Feature
 *
 * This container manages all the dependencies for the authentication feature
 * following the Dependency Injection pattern. It provides a centralized
 * place to configure and resolve dependencies, making it easier to
 * manage the feature's dependencies and test them.
 */
export class AuthContainer {
  private static instance: AuthContainer;
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;
  private hashProvider: BcryptHashProvider;
  private tokenGenerator: UnifiedRS256TokenGenerator;

  // Use cases
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;
  private logoutUseCase: LogoutUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;

  private constructor() {
    // Initialize all infrastructure dependencies
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
    this.hashProvider = new BcryptHashProvider();
    this.tokenGenerator = new UnifiedRS256TokenGenerator({
      accessTokenExpiry: 3 * 60 * 60, // 3 hours (as per unified schema)
      refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
      issuer: 'modular-monolith',
      audience: 'modular-monolith-api'
    });

    // Initialize all use cases
    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.sessionRepository,
      this.hashProvider,
      this.tokenGenerator
    );

    this.registerUseCase = new RegisterUseCase(
      this.userRepository,
      this.hashProvider
    );

    this.logoutUseCase = new LogoutUseCase(
      this.sessionRepository
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.sessionRepository,
      this.userRepository,
      this.tokenGenerator
    );
  }

  /**
   * Get singleton instance of the container
   */
  public static getInstance(): AuthContainer {
    if (!AuthContainer.instance) {
      AuthContainer.instance = new AuthContainer();
    }
    return AuthContainer.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    AuthContainer.instance = null as any;
  }

  // Repository getters
  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getSessionRepository(): SessionRepository {
    return this.sessionRepository;
  }

  public getHashProvider(): BcryptHashProvider {
    return this.hashProvider;
  }

  public getTokenGenerator(): UnifiedRS256TokenGenerator {
    return this.tokenGenerator;
  }

  // Use case getters
  public getLoginUseCase(): LoginUseCase {
    return this.loginUseCase;
  }

  public getRegisterUseCase(): RegisterUseCase {
    return this.registerUseCase;
  }

  public getLogoutUseCase(): LogoutUseCase {
    return this.logoutUseCase;
  }

  public getRefreshTokenUseCase(): RefreshTokenUseCase {
    return this.refreshTokenUseCase;
  }
}