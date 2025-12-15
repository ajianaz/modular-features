import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UpdateProfileController } from '../../../presentation/controllers/UpdateProfileController';
import { UpdateUserProfileUseCase } from '../../../application/usecases/UpdateUserProfileUseCase';
import { UserProfile } from '../../../domain/entities';
import {
  createTestUserProfile,
  createTestUpdateUserProfileRequest
} from '../../utils/testFixtures.test';

describe('UpdateProfileController', () => {
  let updateUserProfileUseCase: UpdateUserProfileUseCase;
  let updateProfileController: UpdateProfileController;
  let testUserProfile: UserProfile;

  beforeEach(() => {
    // Mock the use case
    updateUserProfileUseCase = {
      execute: vi.fn()
    } as any;

    testUserProfile = createTestUserProfile();

    // Create the controller with mocked dependencies
    updateProfileController = new UpdateProfileController(updateUserProfileUseCase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Mock the use case to return an updated profile
      const updatedProfile = createTestUserProfile();
      updateUserProfileUseCase.execute.mockResolvedValue({
        success: true,
        data: updatedProfile
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
      await updateProfileController.updateProfile(mockContext as any);

      // Verify the use case was called with correct request
      expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id'
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProfile
      });
    });

    it('should handle validation error', async () => {
      // Mock the use case to return a validation error
      updateUserProfileUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile data',
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
      await updateProfileController.updateProfile(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(400);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile data'
        }
      });
    });

    it('should handle profile not found error', async () => {
      // Mock the use case to return a not found error
      updateUserProfileUseCase.execute.mockResolvedValue({
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
      await updateProfileController.updateProfile(mockContext as any);

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

    it('should handle server error', async () => {
      // Mock the use case to throw an error
      updateUserProfileUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

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
      await updateProfileController.updateProfile(mockContext as any);

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