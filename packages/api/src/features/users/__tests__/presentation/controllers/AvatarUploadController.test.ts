import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvatarUploadController } from '../../../presentation/controllers/AvatarUploadController';
import { UploadAvatarUseCase } from '../../../application/usecases/UploadAvatarUseCase';
import { UsersContainer } from '../../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  createTestFile,
  createTestImageFile,
  testUserIds
} from '../../utils/testFixtures.test';
import {
  createMockFileStorageProvider,
  createMockUserActivityRepository,
  createMockContext,
  createMockRequest
} from '../../utils/testUtils.test';

// Mock UsersContainer
vi.mock('../../../infrastructure/container/UsersContainer', () => ({
  UsersContainer: {
    getInstance: vi.fn(() => ({
      getUploadAvatarUseCase: vi.fn()
    }))
  }
}));

// Mock UploadAvatarUseCase
vi.mock('../../../application/usecases/UploadAvatarUseCase', () => ({
  UploadAvatarUseCase: vi.fn()
}));

// Create a proper mock for Hono Context
const createHonoMockContext = (overrides: any = {}) => {
  return {
    req: {
      param: vi.fn(),
      parseBody: vi.fn(),
      file: null,
      ...overrides.req
    },
    json: vi.fn(),
    get: vi.fn(),
    ...overrides
  };
};

describe('AvatarUploadController', () => {
  let controller: AvatarUploadController;
  let mockUploadAvatarUseCase: any;
  let mockUsersContainer: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock use case
    mockUploadAvatarUseCase = {
      execute: vi.fn()
    };

    // Create mock container
    mockUsersContainer = {
      getUploadAvatarUseCase: vi.fn().mockReturnValue(mockUploadAvatarUseCase)
    };

    // Mock UsersContainer.getInstance
    (UsersContainer.getInstance as any).mockReturnValue(mockUsersContainer);

    controller = new AvatarUploadController();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully with valid data', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const mockResult = {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profile: {
            id: userId,
            userId: userId,
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            bio: 'Test user bio',
            website: 'https://example.com',
            location: 'Test City',
            timezone: 'UTC',
            language: 'en',
            gender: 'prefer_not_to_say' as const,
            phoneNumber: '+1234567890',
            isPhoneVerified: true,
            socialLinks: {
              twitter: 'https://twitter.com/johndoe'
            },
            preferences: {
              theme: 'dark'
            },
            avatar: 'https://example.com/uploads/avatar.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          fileInfo: {
            originalName: 'test-avatar.jpeg',
            fileName: 'avatar.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            url: 'https://example.com/uploads/avatar.jpg',
            dimensions: {
              width: 200,
              height: 200
            }
          }
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(mockResult);

      // Create mock Hono context
      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({
            maxWidth: '200',
            maxHeight: '200',
            quality: '0.8'
          }),
          file: testFile
        }
      });

      const result = await controller.uploadAvatar(mockContext as any);

      expect(mockUploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId,
        file: testFile,
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8
      });

      expect(mockContext.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when userId is missing', async () => {
      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({}),
          parseBody: vi.fn().mockResolvedValue({}),
          file: createTestImageFile()
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required',
        error: 'MISSING_USER_ID'
      }, 400);
    });

    it('should return 400 when file is missing', async () => {
      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId: testUserIds.validUser1 }),
          parseBody: vi.fn().mockResolvedValue({}),
          file: null
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avatar file is required',
        error: 'MISSING_AVATAR_FILE'
      }, 400);
    });

    it('should handle validation errors from use case', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const validationError = new ValidationError('Invalid file type');

      mockUploadAvatarUseCase.execute.mockRejectedValue(validationError);

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({}),
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid file type',
        error: 'VALIDATION_ERROR'
      }, 400);
    });

    it('should handle response validation failure', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();

      // Mock invalid response that fails schema validation
      const invalidResult = {
        success: true,
        data: {
          userId,
          // Missing required fields
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(invalidResult);

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({}),
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error - response validation failed',
        error: 'RESPONSE_VALIDATION_ERROR'
      }, 500);
    });

    it('should handle general errors', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();

      mockUploadAvatarUseCase.execute.mockRejectedValue(new Error('Database error'));

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({}),
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
    });

    it('should handle optional parameters correctly', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const mockResult = {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profile: {
            id: userId,
            userId: userId,
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            bio: 'Test user bio',
            website: 'https://example.com',
            location: 'Test City',
            timezone: 'UTC',
            language: 'en',
            gender: 'prefer_not_to_say' as const,
            phoneNumber: '+1234567890',
            isPhoneVerified: true,
            socialLinks: {
              twitter: 'https://twitter.com/johndoe'
            },
            preferences: {
              theme: 'dark'
            },
            avatar: 'https://example.com/uploads/avatar.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          fileInfo: {
            originalName: 'test-avatar.jpeg',
            fileName: 'avatar.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            url: 'https://example.com/uploads/avatar.jpg',
            dimensions: {
              width: 200,
              height: 200
            }
          }
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(mockResult);

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({}), // No optional parameters
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockUploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId,
        file: testFile,
        maxWidth: undefined,
        maxHeight: undefined,
        quality: undefined
      });
    });
  });

  describe('uploadCurrentUserAvatar', () => {
    it('should upload avatar for current user successfully', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const mockResult = {
        success: true,
        data: {
          userId,
          avatarUrl: 'https://example.com/uploads/avatar.jpg',
          fileName: 'avatar.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg'
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(mockResult);

      const mockContext = createHonoMockContext({
        get: vi.fn().mockReturnValue(userId),
        req: {
          parseBody: vi.fn().mockResolvedValue({
            maxWidth: '150',
            maxHeight: '150',
            quality: '0.9'
          }),
          file: testFile
        }
      });

      await controller.uploadCurrentUserAvatar(mockContext as any);

      expect(mockUploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId,
        file: testFile,
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.9
      });

      expect(mockContext.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockContext = createHonoMockContext({
        get: vi.fn().mockReturnValue(undefined),
        req: {
          parseBody: vi.fn().mockResolvedValue({}),
          file: createTestImageFile()
        }
      });

      await controller.uploadCurrentUserAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      }, 401);
    });

    it('should return 400 when file is missing for current user', async () => {
      const mockContext = createHonoMockContext({
        get: vi.fn().mockReturnValue(testUserIds.validUser1),
        req: {
          parseBody: vi.fn().mockResolvedValue({}),
          file: null
        }
      });

      await controller.uploadCurrentUserAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avatar file is required',
        error: 'MISSING_AVATAR_FILE'
      }, 400);
    });
  });

  describe('deleteAvatar', () => {
    it('should return 501 for avatar deletion (not implemented)', async () => {
      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId: testUserIds.validUser1 })
        }
      });

      await controller.deleteAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avatar deletion not implemented through this endpoint',
        error: 'NOT_IMPLEMENTED'
      }, 501);
    });

    it('should return 400 when userId is missing for deletion', async () => {
      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({})
        }
      });

      await controller.deleteAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required',
        error: 'MISSING_USER_ID'
      }, 400);
    });
  });

  describe('deleteCurrentUserAvatar', () => {
    it('should return 501 for current user avatar deletion (not implemented)', async () => {
      const mockContext = createHonoMockContext({
        get: vi.fn().mockReturnValue(testUserIds.validUser1)
      });

      await controller.deleteCurrentUserAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avatar deletion not implemented through this endpoint',
        error: 'NOT_IMPLEMENTED'
      }, 501);
    });

    it('should return 401 when user is not authenticated for deletion', async () => {
      const mockContext = createHonoMockContext({
        get: vi.fn().mockReturnValue(undefined)
      });

      await controller.deleteCurrentUserAvatar(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      }, 401);
    });
  });

  describe('parameter parsing', () => {
    it('should correctly parse numeric parameters', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const mockResult = {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profile: {
            id: userId,
            userId: userId,
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            bio: 'Test user bio',
            website: 'https://example.com',
            location: 'Test City',
            timezone: 'UTC',
            language: 'en',
            gender: 'prefer_not_to_say' as const,
            phoneNumber: '+1234567890',
            isPhoneVerified: true,
            socialLinks: {
              twitter: 'https://twitter.com/johndoe'
            },
            preferences: {
              theme: 'dark'
            },
            avatar: 'https://example.com/uploads/avatar.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          fileInfo: {
            originalName: 'test-avatar.jpeg',
            fileName: 'avatar.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            url: 'https://example.com/uploads/avatar.jpg',
            dimensions: {
              width: 200,
              height: 200
            }
          }
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(mockResult);

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({
            maxWidth: '300',
            maxHeight: '250',
            quality: '0.75'
          }),
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockUploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId,
        file: testFile,
        maxWidth: 300,
        maxHeight: 250,
        quality: 0.75
      });
    });

    it('should handle invalid numeric parameters gracefully', async () => {
      const userId = testUserIds.validUser1;
      const testFile = createTestImageFile();
      const mockResult = {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profile: {
            id: userId,
            userId: userId,
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            bio: 'Test user bio',
            website: 'https://example.com',
            location: 'Test City',
            timezone: 'UTC',
            language: 'en',
            gender: 'prefer_not_to_say' as const,
            phoneNumber: '+1234567890',
            isPhoneVerified: true,
            socialLinks: {
              twitter: 'https://twitter.com/johndoe'
            },
            preferences: {
              theme: 'dark'
            },
            avatar: 'https://example.com/uploads/avatar.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          fileInfo: {
            originalName: 'test-avatar.jpeg',
            fileName: 'avatar.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            url: 'https://example.com/uploads/avatar.jpg',
            dimensions: {
              width: 200,
              height: 200
            }
          }
        }
      };

      mockUploadAvatarUseCase.execute.mockResolvedValue(mockResult);

      const mockContext = createHonoMockContext({
        req: {
          param: vi.fn().mockReturnValue({ userId }),
          parseBody: vi.fn().mockResolvedValue({
            maxWidth: 'invalid',
            maxHeight: '',
            quality: 'not-a-number'
          }),
          file: testFile
        }
      });

      await controller.uploadAvatar(mockContext as any);

      expect(mockUploadAvatarUseCase.execute).toHaveBeenCalledWith({
        userId,
        file: testFile,
        maxWidth: undefined, // parseInt('invalid') returns NaN, but controller should handle this
        maxHeight: undefined, // parseInt('') returns NaN, but controller should handle this
        quality: undefined   // parseFloat('not-a-number') returns NaN, but controller should handle this
      });
    });
  });
});