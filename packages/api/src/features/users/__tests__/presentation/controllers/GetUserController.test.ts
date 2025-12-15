import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GetUserController } from '../../../presentation/controllers/GetUserController';
import { GetUserProfileUseCase } from '../../../application/usecases/GetUserProfileUseCase';
import { GetUserSettingsUseCase } from '../../../application/usecases/GetUserSettingsUseCase';
import { UserProfile } from '../../../domain/entities';
import {
  createTestUserProfile,
  createTestUserSettings
} from '../../utils/testFixtures.test';

describe('GetUserController', () => {
  let getUserProfileUseCase: GetUserProfileUseCase;
  let getUserSettingsUseCase: GetUserSettingsUseCase;
  let getUserController: GetUserController;
  let testUserProfile: UserProfile;

  beforeEach(() => {
    // Mock the use cases
    getUserProfileUseCase = {
      execute: vi.fn()
    } as any;

    getUserSettingsUseCase = {
      execute: vi.fn()
    } as any;

    testUserProfile = createTestUserProfile();

    // Create the controller with mocked dependencies
    getUserController = new GetUserController(getUserProfileUseCase, getUserSettingsUseCase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Mock the use case to return a profile
      const mockProfile = createTestUserProfile();
      getUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: mockProfile
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          includeSettings: false,
          includeRoles: false,
          includeActivity: false
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should return user profile with settings when requested', async () => {
      // Mock the use case to return a profile
      const mockProfile = createTestUserProfile();
      getUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: mockProfile
      });

      // Create a mock context with include settings query
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({ includeSettings: 'true' }),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          includeSettings: true,
          includeRoles: false,
          includeActivity: false
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should return user profile with roles when requested', async () => {
      // Mock the use case to return a profile
      const mockProfile = createTestUserProfile();
      getUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: mockProfile
      });

      // Create a mock context with include roles query
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({ includeRoles: 'true' }),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          includeSettings: false,
          includeRoles: true,
          includeActivity: false
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should return user profile with activity when requested', async () => {
      // Mock the use case to return a profile
      const mockProfile = createTestUserProfile();
      getUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: mockProfile
      });

      // Create a mock context with include activity query
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({ includeActivity: 'true' }),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          includeSettings: false,
          includeRoles: false,
          includeActivity: true
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should return user profile with all options when requested', async () => {
      // Mock the use case to return a profile
      const mockProfile = createTestUserProfile();
      getUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: mockProfile
      });

      // Create a mock context with all options
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({
            includeSettings: 'true',
            includeRoles: 'true',
            includeActivity: 'true'
          }),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          includeSettings: true,
          includeRoles: true,
          includeActivity: true
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockProfile
      });
    });

    it('should handle profile not found error', async () => {
      // Mock the use case to return an error
      getUserProfileUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
          statusCode: 404
        }
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(404);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found'
        }
      });
    });

    it('should handle validation error', async () => {
      // Mock the use case to return a validation error
      getUserProfileUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID',
          statusCode: 400
        }
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(400);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        }
      });
    });

    it('should handle server error', async () => {
      // Mock the use case to throw an error
      getUserProfileUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getProfile(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(500);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      });
    });
  });

  describe('getSettings', () => {
    it('should return user settings successfully', async () => {
      // Mock the use case to return settings
      const mockSettings = createTestUserSettings();
      getUserSettingsUseCase.execute.mockResolvedValue({
        success: true,
        data: mockSettings
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getSettings(mockContext as any);

      // Verify the use case was called with correct request
      expect(getUserSettingsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id'
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: mockSettings
      });
    });

    it('should handle settings not found error', async () => {
      // Mock the use case to return an error
      getUserSettingsUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'SETTINGS_NOT_FOUND',
          message: 'Settings not found',
          statusCode: 404
        }
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getSettings(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(404);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SETTINGS_NOT_FOUND',
          message: 'Settings not found'
        }
      });
    });

    it('should handle server error', async () => {
      // Mock the use case to throw an error
      getUserSettingsUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await getUserController.getSettings(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(500);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      });
    });
  });
});