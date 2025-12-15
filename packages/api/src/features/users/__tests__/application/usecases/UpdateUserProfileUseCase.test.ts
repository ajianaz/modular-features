import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateUserProfileUseCase } from '../../../application/usecases/UpdateUserProfileUseCase';
import { IUserProfileRepository, IUserSettingsRepository, IUserRoleRepository, IUserActivityRepository } from '../../../domain/interfaces';
import { UserProfile, UserSettings, UserRole, UserActivity } from '../../../domain/entities';
import {
  UserProfileNotFoundError,
  InvalidUserProfileError
} from '../../../domain/errors/UserManagementError';
import {
  testUserIds,
  createTestUserProfile,
  createTestUserSettings,
  createTestUserRole,
  createTestUserActivity,
  createTestUpdateUserProfileRequest
} from '../../utils/testFixtures.test';
import {
  createMockUserProfileRepository,
  createMockUserSettingsRepository,
  createMockUserRoleRepository,
  createMockUserActivityRepository,
  setupUserProfileRepository,
  setupUserSettingsRepository,
  setupUserRoleRepository,
  setupUserActivityRepository
} from '../../utils/testUtils.test';

describe('UpdateUserProfileUseCase', () => {
  let useCase: UpdateUserProfileUseCase;
  let mockUserProfileRepository: IUserProfileRepository;
  let mockUserSettingsRepository: IUserSettingsRepository;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockUserActivityRepository: IUserActivityRepository;

  beforeEach(() => {
    mockUserProfileRepository = createMockUserProfileRepository();
    mockUserSettingsRepository = createMockUserSettingsRepository();
    mockUserRoleRepository = createMockUserRoleRepository();
    mockUserActivityRepository = createMockUserActivityRepository();

    useCase = new UpdateUserProfileUseCase(
      mockUserProfileRepository,
      mockUserSettingsRepository,
      mockUserRoleRepository,
      mockUserActivityRepository
    );
  });

  describe('execute', () => {
    const validRequest = createTestUpdateUserProfileRequest();

    describe('when profile exists and update is valid', () => {
      let existingProfile: UserProfile;
      let updatedProfile: UserProfile;

      beforeEach(() => {
        existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          firstName: validRequest.firstName,
          lastName: validRequest.lastName,
          displayName: validRequest.displayName,
          bio: validRequest.bio,
          website: validRequest.website,
          location: validRequest.location,
          gender: validRequest.gender,
          dateOfBirth: validRequest.dateOfBirth,
          phoneNumber: validRequest.phoneNumber,
          socialLinks: validRequest.socialLinks,
          preferences: validRequest.preferences
        });

        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);
        setupUserActivityRepository(mockUserActivityRepository, { [createTestUserActivity().id]: createTestUserActivity() });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return success response with updated profile', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.message).toBe('User profile updated successfully');
        expect(result.data.profile).toEqual(updatedProfile.toJSON());
      });

      it('should call repository methods with correct parameters', async () => {
        await useCase.execute(validRequest);

        expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserProfileRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: existingProfile.id,
            userId: testUserIds.validUser1,
            firstName: validRequest.firstName,
            lastName: validRequest.lastName,
            displayName: validRequest.displayName,
            bio: validRequest.bio,
            website: validRequest.website,
            location: validRequest.location,
            gender: validRequest.gender,
            dateOfBirth: validRequest.dateOfBirth,
            phoneNumber: validRequest.phoneNumber,
            socialLinks: validRequest.socialLinks,
            preferences: validRequest.preferences
          })
        );
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'update',
            resource: 'profile',
            resourceId: existingProfile.id,
            description: expect.stringContaining('updated'),
            metadata: expect.objectContaining({
              fieldsUpdated: expect.arrayContaining([
                'firstName', 'lastName', 'displayName', 'bio', 'website',
                'location', 'gender', 'dateOfBirth', 'phoneNumber', 'socialLinks', 'preferences'
              ])
            })
          })
        );
      });

      it('should handle partial updates', async () => {
        const partialRequest = {
          userId: testUserIds.validUser1,
          firstName: 'Updated First Name',
          lastName: 'Updated Last Name'
        };

        const partialUpdatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          firstName: partialRequest.firstName,
          lastName: partialRequest.lastName
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(partialUpdatedProfile);

        const result = await useCase.execute(partialRequest);

        expect(result.success).toBe(true);
        expect(result.data.profile.firstName).toBe(partialRequest.firstName);
        expect(result.data.profile.lastName).toBe(partialRequest.lastName);
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
            action: 'update',
            resource: 'profile',
            description: expect.stringContaining('not found')
          })
        );
      });
    });

    describe('when validation fails', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle invalid request validation', async () => {
        const invalidRequest = {
          userId: 'invalid-uuid',
          firstName: '',
          lastName: '',
          displayName: '',
          website: 'invalid-url',
          phoneNumber: 'invalid-phone',
          dateOfBirth: new Date('future')
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle invalid website URL', async () => {
        const invalidRequest = {
          userId: testUserIds.validUser1,
          website: 'not-a-valid-url'
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle invalid phone number', async () => {
        const invalidRequest = {
          userId: testUserIds.validUser1,
          phoneNumber: 'not-a-phone-number'
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle future date of birth', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const invalidRequest = {
          userId: testUserIds.validUser1,
          dateOfBirth: futureDate
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });
    });

    describe('when repository errors occur', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle repository errors gracefully', async () => {
        const error = new Error('Database error');
        (mockUserProfileRepository.update as any).mockRejectedValue(error);

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to update user profile');
      });
    });

    describe('phone number verification', () => {
      let existingProfile: UserProfile;

      beforeEach(() => {
        existingProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          phoneNumber: '+1234567890',
          isPhoneVerified: true
        });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should mark phone as unverified when phone number changes', async () => {
        const requestWithNewPhone = {
          userId: testUserIds.validUser1,
          phoneNumber: '+0987654321'
        };

        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          phoneNumber: '+0987654321',
          isPhoneVerified: false
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(requestWithNewPhone);

        expect(result.success).toBe(true);
        expect(result.data.profile.phoneNumber).toBe('+0987654321');
        expect(result.data.profile.isPhoneVerified).toBe(false);
      });

      it('should keep phone verification status when phone number is the same', async () => {
        const requestWithSamePhone = {
          userId: testUserIds.validUser1,
          phoneNumber: '+1234567890'
        };

        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          phoneNumber: '+1234567890',
          isPhoneVerified: true
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(requestWithSamePhone);

        expect(result.success).toBe(true);
        expect(result.data.profile.phoneNumber).toBe('+1234567890');
        expect(result.data.profile.isPhoneVerified).toBe(true);
      });
    });

    describe('social links validation', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid social links', async () => {
        const requestWithSocialLinks = {
          userId: testUserIds.validUser1,
          socialLinks: {
            twitter: '@newhandle',
            github: 'newusername',
            linkedin: 'newlinkedin',
            facebook: 'newfacebook',
            instagram: 'newinstagram',
            youtube: 'newyoutube',
            website: 'https://newwebsite.com'
          }
        };

        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          socialLinks: requestWithSocialLinks.socialLinks
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(requestWithSocialLinks);

        expect(result.success).toBe(true);
        expect(result.data.profile.socialLinks).toEqual(requestWithSocialLinks.socialLinks);
      });

      it('should handle partial social links', async () => {
        const requestWithPartialSocialLinks = {
          userId: testUserIds.validUser1,
          socialLinks: {
            twitter: '@newhandle',
            github: 'newusername'
          }
        };

        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          socialLinks: requestWithPartialSocialLinks.socialLinks
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(requestWithPartialSocialLinks);

        expect(result.success).toBe(true);
        expect(result.data.profile.socialLinks).toEqual(requestWithPartialSocialLinks.socialLinks);
      });
    });

    describe('preferences validation', () => {
      beforeEach(() => {
        const existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid preferences', async () => {
        const requestWithPreferences = {
          userId: testUserIds.validUser1,
          preferences: {
            theme: 'light',
            notifications: false,
            language: 'es',
            timezone: 'Europe/Madrid'
          }
        };

        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          preferences: requestWithPreferences.preferences
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        const result = await useCase.execute(requestWithPreferences);

        expect(result.success).toBe(true);
        expect(result.data.profile.preferences).toEqual(requestWithPreferences.preferences);
      });

      it('should handle invalid theme preference', async () => {
        const requestWithInvalidTheme = {
          userId: testUserIds.validUser1,
          preferences: {
            theme: 'invalid-theme'
          }
        };

        const result = await useCase.execute(requestWithInvalidTheme);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });
    });

    describe('activity logging', () => {
      let existingProfile: UserProfile;

      beforeEach(() => {
        existingProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: existingProfile });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should log profile update activity with correct metadata', async () => {
        const updatedProfile = createTestUserProfile({
          userId: testUserIds.validUser1,
          firstName: 'Updated First Name',
          lastName: 'Updated Last Name'
        });

        (mockUserProfileRepository.update as any).mockResolvedValue(updatedProfile);

        await useCase.execute({
          userId: testUserIds.validUser1,
          firstName: 'Updated First Name',
          lastName: 'Updated Last Name'
        });

        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'update',
            resource: 'profile',
            resourceId: existingProfile.id,
            description: expect.stringContaining('updated'),
            metadata: expect.objectContaining({
              fieldsUpdated: expect.arrayContaining(['firstName', 'lastName']),
              previousValues: expect.objectContaining({
                firstName: existingProfile.firstName,
                lastName: existingProfile.lastName
              }),
              newValues: expect.objectContaining({
                firstName: 'Updated First Name',
                lastName: 'Updated Last Name'
              })
            })
          })
        );
      });
    });
  });
});