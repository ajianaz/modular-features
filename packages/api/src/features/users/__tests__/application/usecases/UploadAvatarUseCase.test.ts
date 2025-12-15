import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadAvatarUseCase } from '../../../application/usecases/UploadAvatarUseCase';
import { IUserProfileRepository, IUserActivityRepository } from '../../../domain/interfaces';
import { UserProfile, UserActivity } from '../../../domain/entities';
import {
  UserProfileNotFoundError,
  AvatarUploadError,
  InvalidAvatarFormatError,
  AvatarTooLargeError
} from '../../../domain/errors/UserManagementError';
import {
  testUserIds,
  createTestUserProfile,
  createTestUserActivity,
  createTestFile,
  createTestImageFile,
  createTestUploadAvatarRequest
} from '../../utils/testFixtures.test';
import {
  createMockUserProfileRepository,
  createMockUserActivityRepository,
  createMockFileStorageProvider,
  setupUserProfileRepository,
  setupUserActivityRepository,
  setupFileStorageProvider
} from '../../utils/testUtils.test';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  let mockUserProfileRepository: IUserProfileRepository;
  let mockUserActivityRepository: IUserActivityRepository;
  let mockFileStorageProvider: FileStorageProvider;

  beforeEach(() => {
    mockUserProfileRepository = createMockUserProfileRepository();
    mockUserActivityRepository = createMockUserActivityRepository();
    mockFileStorageProvider = createMockFileStorageProvider() as FileStorageProvider;

    useCase = new UploadAvatarUseCase(
      mockUserProfileRepository,
      mockUserActivityRepository,
      mockFileStorageProvider
    );
  });

  describe('execute', () => {
    const validRequest = createTestUploadAvatarRequest();

    describe('when profile exists and file is valid', () => {
      let existingProfile: UserProfile;
      let updatedProfile: UserProfile;
      const mockAvatarUrl = 'https://example.com/uploads/avatar.jpg';

      beforeEach(() => {
        existingProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          avatarUrl: 'https://example.com/old-avatar.jpg'
        });

        updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          avatarUrl: mockAvatarUrl
        });

        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);
        setupUserActivityRepository(mockUserActivityRepository, {});
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
        setupFileStorageProvider(mockFileStorageProvider, { [validRequest.file.name]: mockAvatarUrl });
      });

      it('should return success response with updated profile', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Avatar uploaded successfully');
        expect(result.data.profile).toEqual(updatedProfile.toJSON());
        expect(result.data.fileInfo.url).toBe(mockAvatarUrl);
      });

      it('should call repository methods with correct parameters', async () => {
        await useCase.execute(validRequest);

        expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockFileStorageProvider.validateFile).toHaveBeenCalledWith(validRequest.file);
        expect(mockFileStorageProvider.uploadFile).toHaveBeenCalledWith(validRequest.file);
        expect(mockUserProfileRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: existingProfile.id,
            userId: testUserIds.validUser1,
            avatarUrl: mockAvatarUrl
          })
        );
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'avatar_upload',
            resource: 'profile',
            resourceId: existingProfile.id,
            description: expect.stringContaining('Avatar uploaded'),
            metadata: expect.objectContaining({
              fileName: validRequest.file.name,
              fileSize: validRequest.file.size,
              fileType: validRequest.file.type,
              avatarUrl: mockAvatarUrl
            })
          })
        );
      });
    });

    describe('when profile does not exist', () => {
      beforeEach(() => {
        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(null);
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return error response', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe(`User profile with ID ${testUserIds.validUser1} not found`);
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'avatar_upload',
            resource: 'profile',
            description: expect.stringContaining('not found')
          })
        );
      });
    });

    describe('when file validation fails', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle invalid file format', async () => {
        const invalidFile = createTestFile({
          name: 'avatar.txt',
          type: 'text/plain',
          size: 1024
        });

        (mockFileStorageProvider.validateFile as any).mockRejectedValue(
          new InvalidAvatarFormatError('txt')
        );

        const requestWithInvalidFile = {
          userId: testUserIds.validUser1,
          file: invalidFile
        };

        const result = await useCase.execute(requestWithInvalidFile);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid avatar format: txt');
      });

      it('should handle file too large', async () => {
        const largeFile = createTestFile({
          name: 'avatar.jpg',
          type: 'image/jpeg',
          size: 10 * 1024 * 1024 // 10MB
        });

        (mockFileStorageProvider.validateFile as any).mockRejectedValue(
          new AvatarTooLargeError(10 * 1024 * 1024, 5 * 1024 * 1024) // 10MB, 5MB limit
        );

        const requestWithLargeFile = {
          userId: testUserIds.validUser1,
          file: largeFile
        };

        const result = await useCase.execute(requestWithLargeFile);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Avatar size 10485760 bytes exceeds maximum allowed size of 5242880 bytes');
      });
    });

    describe('when file upload fails', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockFileStorageProvider.uploadFile as any).mockRejectedValue(
          new Error('Upload failed: Storage error')
        );
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle upload errors gracefully', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Upload failed: Storage error');
      });
    });

    describe('when repository errors occur', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockFileStorageProvider.uploadFile as any).mockResolvedValue('https://example.com/uploads/avatar.jpg');
        (mockUserProfileRepository.update as any).mockRejectedValue(new Error('Database error'));
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle repository errors gracefully', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to update user profile');
      });
    });

    describe('validation', () => {
      it('should handle invalid request validation', async () => {
        const invalidRequest = {
          userId: 'invalid-uuid',
          file: null as any
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle empty userId', async () => {
        const emptyUserIdRequest = {
          userId: '',
          file: createTestImageFile()
        };

        const result = await useCase.execute(emptyUserIdRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle missing file', async () => {
        const missingFileRequest = {
          userId: testUserIds.validUser1,
          file: null as any
        };

        const result = await useCase.execute(missingFileRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });
    });

    describe('file format validation', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockFileStorageProvider.uploadFile as any).mockResolvedValue('https://example.com/uploads/avatar.jpg');
        (mockUserProfileRepository.update as any).mockResolvedValue(createTestUserProfile());
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should accept valid image formats', async () => {
        const validFormats = [
          { name: 'avatar.jpg', type: 'image/jpeg' },
          { name: 'avatar.jpeg', type: 'image/jpeg' },
          { name: 'avatar.png', type: 'image/png' },
          { name: 'avatar.webp', type: 'image/webp' }
        ];

        for (const format of validFormats) {
          const validFile = createTestFile(format);
          const requestWithValidFile = {
            userId: testUserIds.validUser1,
            file: validFile
          };

          const result = await useCase.execute(requestWithValidFile);

          expect(result.success).toBe(true);
        }
      });
    });

    describe('file size validation', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockFileStorageProvider.uploadFile as any).mockResolvedValue('https://example.com/uploads/avatar.jpg');
        (mockUserProfileRepository.update as any).mockResolvedValue(createTestUserProfile());
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should accept files within size limit', async () => {
        const validSizes = [
          100 * 1024,    // 100KB
          500 * 1024,    // 500KB
          1024 * 1024,   // 1MB
          3 * 1024 * 1024 // 3MB
        ];

        for (const size of validSizes) {
          const validFile = createTestFile({
            name: 'avatar.jpg',
            type: 'image/jpeg',
            size
          });

          const requestWithValidFile = {
            userId: testUserIds.validUser1,
            file: validFile
          };

          const result = await useCase.execute(requestWithValidFile);

          expect(result.success).toBe(true);
        }
      });
    });

    describe('activity logging', () => {
      let existingProfile: UserProfile;

      beforeEach(() => {
        existingProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          avatarUrl: 'https://example.com/old-avatar.jpg'
        });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserProfileRepository.update as any).mockResolvedValue(createTestUserProfile());
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockFileStorageProvider.uploadFile as any).mockResolvedValue('https://example.com/uploads/new-avatar.jpg');
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should log avatar upload activity with correct metadata', async () => {
        await useCase.execute(validRequest);

        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'avatar_upload',
            resource: 'profile',
            resourceId: existingProfile.id,
            description: expect.stringContaining('Avatar uploaded'),
            metadata: expect.objectContaining({
              fileName: validRequest.file.name,
              fileSize: validRequest.file.size,
              fileType: validRequest.file.type,
              avatarUrl: 'https://example.com/uploads/new-avatar.jpg',
              previousAvatarUrl: 'https://example.com/old-avatar.jpg'
            })
          })
        );
      });
    });

    describe('avatar URL update', () => {
      let existingProfile: UserProfile;

      beforeEach(() => {
        existingProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          avatarUrl: 'https://example.com/old-avatar.jpg'
        });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockFileStorageProvider.validateFile as any).mockResolvedValue(true);
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should update avatar URL in profile', async () => {
        const newAvatarUrl = 'https://example.com/uploads/new-avatar.jpg';
        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          avatarUrl: newAvatarUrl
        });

        (mockFileStorageProvider.uploadFile as any).mockResolvedValue(newAvatarUrl);
        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.data.profile.avatar).toBe(newAvatarUrl);
        expect(result.data.fileInfo.url).toBe(newAvatarUrl);
      });
    });
  });
});