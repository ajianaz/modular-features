import { UserProfile, UserActivity } from '../../domain/entities';
import { IUserProfileRepository, IUserActivityRepository } from '../../domain/interfaces';
import {
  UpdateUserProfileRequest,
  UpdateUserProfileResponse
} from '../dtos';
import {
  UserProfileNotFoundError,
  InvalidUserProfileError
} from '../../domain/errors';
import { UpdateUserProfileRequestSchema } from '../dtos/input/UpdateUserProfileRequest';

export class UpdateUserProfileUseCase {
  constructor(
    private userProfileRepository: IUserProfileRepository,
    private userActivityRepository: IUserActivityRepository
  ) {}

  async execute(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    try {
      // Validate request
      const requestValidation = UpdateUserProfileRequestSchema.safeParse(request);
      if (!requestValidation.success) {
        return {
          success: false,
          message: `Validation error: ${requestValidation.error.issues.map(i => i.message).join(', ')}`,
          data: {
            profile: {} as any
          }
        };
      }

      // Check if profile exists
      const existingProfile = await this.userProfileRepository.findByUserId(request.userId);
      if (!existingProfile) {
        throw new UserProfileNotFoundError(request.userId);
      }

      // Track what fields are being updated for activity logging
      const updatedFields: string[] = [];

      if (request.firstName !== undefined && request.firstName !== existingProfile.firstName) {
        updatedFields.push('firstName');
      }
      if (request.lastName !== undefined && request.lastName !== existingProfile.lastName) {
        updatedFields.push('lastName');
      }
      if (request.displayName !== undefined && request.displayName !== existingProfile.displayName) {
        updatedFields.push('displayName');
      }
      if (request.bio !== undefined && request.bio !== existingProfile.bio) {
        updatedFields.push('bio');
      }
      if (request.website !== undefined && request.website !== existingProfile.website) {
        updatedFields.push('website');
      }
      if (request.location !== undefined && request.location !== existingProfile.location) {
        updatedFields.push('location');
      }
      if (request.gender !== undefined && request.gender !== existingProfile.gender) {
        updatedFields.push('gender');
      }
      if (request.dateOfBirth !== undefined && request.dateOfBirth?.getTime() !== existingProfile.dateOfBirth?.getTime()) {
        updatedFields.push('dateOfBirth');
      }
      if (request.phoneNumber !== undefined && request.phoneNumber !== existingProfile.phoneNumber) {
        updatedFields.push('phoneNumber');
      }
      if (request.socialLinks !== undefined && JSON.stringify(request.socialLinks) !== JSON.stringify(existingProfile.socialLinks)) {
        updatedFields.push('socialLinks');
      }
      if (request.preferences !== undefined && JSON.stringify(request.preferences) !== JSON.stringify(existingProfile.preferences)) {
        updatedFields.push('preferences');
      }

      // If no fields are being updated, return current profile
      if (updatedFields.length === 0) {
        return {
          success: true,
          message: 'No changes detected in profile',
          data: {
            profile: existingProfile.toJSON()
          }
        };
      }

      // Update profile
      let updatedProfile = existingProfile;

      // Update personal information
      if (request.firstName !== undefined || request.lastName !== undefined ||
          request.displayName !== undefined || request.bio !== undefined ||
          request.website !== undefined || request.location !== undefined ||
          request.gender !== undefined || request.dateOfBirth !== undefined) {

        updatedProfile = updatedProfile.updatePersonalInfo({
          firstName: request.firstName,
          lastName: request.lastName,
          displayName: request.displayName,
          bio: request.bio,
          website: request.website,
          location: request.location,
          gender: request.gender,
          dateOfBirth: request.dateOfBirth
        });
      }

      // Update contact information
      if (request.phoneNumber !== undefined) {
        updatedProfile = updatedProfile.updateContactInfo({
          phoneNumber: request.phoneNumber,
          isPhoneVerified: false // Reset phone verification when phone number changes
        });
      }

      // Update preferences
      if (request.socialLinks !== undefined || request.preferences !== undefined) {
        updatedProfile = updatedProfile.updatePreferences({
          socialLinks: request.socialLinks,
          preferences: request.preferences
        });
      }

      // Validate updated profile
      const profileValidation = updatedProfile.validate();
      if (!profileValidation.isValid) {
        throw new InvalidUserProfileError(profileValidation.errors.join(', '));
      }

      // Save updated profile
      const savedProfile = await this.userProfileRepository.update(updatedProfile);

      // Log profile update activity
      await this.userActivityRepository.create(
        UserActivity.createProfileUpdateActivity({
          userId: request.userId,
          fieldsUpdated: updatedFields,
          metadata: {
            previousValues: {
              firstName: existingProfile.firstName,
              lastName: existingProfile.lastName,
              displayName: existingProfile.displayName,
              bio: existingProfile.bio,
              website: existingProfile.website,
              location: existingProfile.location,
              gender: existingProfile.gender,
              dateOfBirth: existingProfile.dateOfBirth,
              phoneNumber: existingProfile.phoneNumber,
              socialLinks: existingProfile.socialLinks,
              preferences: existingProfile.preferences
            },
            newValues: {
              firstName: request.firstName,
              lastName: request.lastName,
              displayName: request.displayName,
              bio: request.bio,
              website: request.website,
              location: request.location,
              gender: request.gender,
              dateOfBirth: request.dateOfBirth,
              phoneNumber: request.phoneNumber,
              socialLinks: request.socialLinks,
              preferences: request.preferences
            }
          }
        })
      );

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: savedProfile.toJSON()
        }
      };

    } catch (error) {
      console.error('UpdateUserProfileUseCase error:', error);

      if (error instanceof UserProfileNotFoundError || error instanceof InvalidUserProfileError) {
        return {
          success: false,
          message: error.message,
          data: {
            profile: {} as any
          }
        };
      }

      return {
        success: false,
        message: 'Failed to update profile',
        data: {
          profile: {} as any
        }
      };
    }
  }
}
