import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUseCase } from '../../application/usecases';
import { IUserRepository, ISessionRepository, IHashProvider, ITokenGenerator } from '../../domain/interfaces';
import { LoginRequest, LoginResponse } from '../../application/dtos';
import { User, Session } from '../../domain/entities';
import { UserNotFoundError, InvalidCredentialsError, AccountNotVerifiedError, AccountInactiveError } from '../../domain/errors';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: IUserRepository;
  let mockSessionRepository: ISessionRepository;
  let mockHashProvider: IHashProvider;
  let mockTokenGenerator: ITokenGenerator;

  const mockUser = User.create({
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedPassword',
    emailVerified: true
  });

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    mockSessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByToken: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByUserId: vi.fn(),
      deleteExpiredSessions: vi.fn()
    } as any;

    mockHashProvider = {
      hash: vi.fn(),
      verify: vi.fn(),
      needsRehash: vi.fn(),
      getAlgorithmInfo: vi.fn()
    } as any;

    mockTokenGenerator = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      generateTokenPair: vi.fn(),
      verifyToken: vi.fn(),
      decodeToken: vi.fn()
    } as any;

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockSessionRepository,
      mockHashProvider,
      mockTokenGenerator
    );
  });

  describe('execute', () => {
    const validRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (mockUserRepository.findByEmail as any).mockResolvedValue(mockUser);
      (mockHashProvider.verify as any).mockResolvedValue(true);
      (mockTokenGenerator.generateAccessToken as any).mockResolvedValue('access-token');
      (mockTokenGenerator.generateRefreshToken as any).mockResolvedValue('refresh-token');

      const mockTokenPair = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer'
      };
      (mockTokenGenerator.generateTokenPair as any).mockResolvedValue(mockTokenPair);

      const expectedSession = Session.create({
        userId: mockUser.id,
        token: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
      (mockSessionRepository.create as any).mockResolvedValue(expectedSession);

      // Act
      const result = await loginUseCase.execute(validRequest);

      // Assert
      expect(result).toEqual({
        user: mockUser.toJSON(),
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer'
        },
        session: {
          id: expectedSession.id,
          expiresAt: expectedSession.expiresAt,
          lastAccessedAt: expectedSession.lastAccessedAt
        }
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockHashProvider.verify).toHaveBeenCalledWith(validRequest.password, mockUser.passwordHash);
      expect(mockTokenGenerator.generateTokenPair).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
        { expiresIn: '15m' },
        { expiresIn: '7d' }
      );
      expect(mockSessionRepository.create).toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError for invalid credentials', async () => {
      // Arrange
      (mockUserRepository.findByEmail as any).mockResolvedValue(mockUser);
      (mockHashProvider.verify as any).mockResolvedValue(false);

      // Act & Assert
      await expect(loginUseCase.execute(validRequest)).rejects.toThrow(InvalidCredentialsError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockHashProvider.verify).toHaveBeenCalledWith(validRequest.password, mockUser.passwordHash);
      expect(mockSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
      // Arrange
      (mockUserRepository.findByEmail as any).mockResolvedValue(null);

      // Act & Assert
      await expect(loginUseCase.execute(validRequest)).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockHashProvider.verify).not.toHaveBeenCalled();
      expect(mockSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw AccountInactiveError for inactive user', async () => {
      // Arrange
      const inactiveUser = mockUser.updateStatus('inactive');
      (mockUserRepository.findByEmail as any).mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(loginUseCase.execute(validRequest)).rejects.toThrow(AccountInactiveError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockHashProvider.verify).not.toHaveBeenCalled();
      expect(mockSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw AccountNotVerifiedError for unverified user', async () => {
      // Arrange
      const unverifiedUser = User.create({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword',
        emailVerified: false
      });
      (mockUserRepository.findByEmail as any).mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(loginUseCase.execute(validRequest)).rejects.toThrow(AccountNotVerifiedError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockHashProvider.verify).not.toHaveBeenCalled();
      expect(mockSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database error');
      (mockUserRepository.findByEmail as any).mockRejectedValue(error);

      // Act & Assert
      await expect(loginUseCase.execute(validRequest)).rejects.toThrow(error);
    });

    it('should include device info when provided', async () => {
      // Arrange
      const requestWithDeviceInfo: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1'
      };

      (mockUserRepository.findByEmail as any).mockResolvedValue(mockUser);
      (mockHashProvider.verify as any).mockResolvedValue(true);

      const mockTokenPair = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer'
      };
      (mockTokenGenerator.generateTokenPair as any).mockResolvedValue(mockTokenPair);

      const expectedSession = Session.create({
        userId: mockUser.id,
        token: 'access-token',
        refreshToken: 'refresh-token',
        userAgent: requestWithDeviceInfo.userAgent,
        ipAddress: requestWithDeviceInfo.ipAddress,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
      (mockSessionRepository.create as any).mockResolvedValue(expectedSession);

      // Act
      await loginUseCase.execute(requestWithDeviceInfo);

      // Assert
      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          userAgent: requestWithDeviceInfo.userAgent,
          ipAddress: requestWithDeviceInfo.ipAddress
        })
      );
    });

    it('should create session with correct expiration time', async () => {
      // Arrange
      (mockUserRepository.findByEmail as any).mockResolvedValue(mockUser);
      (mockHashProvider.verify as any).mockResolvedValue(true);

      const mockTokenPair = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer'
      };
      (mockTokenGenerator.generateTokenPair as any).mockResolvedValue(mockTokenPair);

      const expectedSession = Session.create({
        userId: mockUser.id,
        token: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
      (mockSessionRepository.create as any).mockResolvedValue(expectedSession);

      // Act
      const result = await loginUseCase.execute(validRequest);

      // Assert
      expect(result.session).toBeDefined();
      expect(result.session!.expiresAt).toBeInstanceOf(Date);
      const timeDiff = result.session!.expiresAt.getTime() - Date.now();
      expect(timeDiff).toBeGreaterThan(14 * 60 * 1000); // At least 14 minutes
      expect(timeDiff).toBeLessThan(16 * 60 * 1000); // Less than 16 minutes
    });
  });
});