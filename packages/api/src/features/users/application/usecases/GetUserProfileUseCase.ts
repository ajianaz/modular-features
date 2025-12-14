import { UserProfile, UserSettings, UserRole, UserActivity } from '../../domain/entities';
import { IUserProfileRepository, IUserSettingsRepository, IUserRoleRepository, IUserActivityRepository } from '../../domain/interfaces';
import {
  GetUserProfileRequest,
  GetUserProfileResponse
} from '../dtos';
import {
  UserProfileNotFoundError,
  UserSettingsNotFoundError
} from '../../domain/errors';

export class GetUserProfileUseCase {
  constructor(
    private userProfileRepository: IUserProfileRepository,
    private userSettingsRepository: IUserSettingsRepository,
    private userRoleRepository: IUserRoleRepository,
    private userActivityRepository: IUserActivityRepository
  ) {}

  async execute(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    try {
      // Validate request
      const validation = GetUserProfileRequestSchema.safeParse(request);
      if (!validation.success) {
        return {
          success: false,
          message: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
          data: {
            profile: {} as any,
            settings: undefined,
            roles: undefined,
            activity: undefined
          }
        };
      }

      // Get user profile
      const profile = await this.userProfileRepository.findByUserId(request.userId);
      if (!profile) {
        throw new UserProfileNotFoundError(request.userId);
      }

      let settings: UserSettings | undefined;
      let roles: UserRole[] | undefined;
      let activity: UserActivity[] | undefined;

      // Get user settings if requested
      if (request.includeSettings) {
        settings = await this.userSettingsRepository.findByUserId(request.userId) || undefined;
        if (!settings) {
          // Create default settings if none exist
          settings = UserSettings.create({ userId: request.userId });
          await this.userSettingsRepository.create(settings);
        }
      }

      // Get user roles if requested
      if (request.includeRoles) {
        const assignments = await this.userRoleRepository.findActiveAssignmentsByUserId(request.userId);
        roles = await Promise.all(
          assignments.map(async (assignment) => {
            const role = await this.userRoleRepository.findRoleById(assignment.roleId);
            return role || null;
          })
        ).then(roles => roles.filter((role): role is UserRole => role !== null));
      }

      // Get user activity if requested
      if (request.includeActivity) {
        const limit = Math.min(request.activityLimit || 10, 100); // Max 100 activities
        activity = await this.userActivityRepository.findRecentByUserId(request.userId, 24 * 7, limit); // Last week
      }

      // Log profile view activity
      await this.userActivityRepository.create(
        UserActivity.create({
          userId: request.userId,
          type: 'profile',
          action: 'view',
          description: 'User profile viewed',
          resource: 'profile',
          resourceId: profile.id
        })
      );

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          profile: profile.toJSON(),
          settings: settings?.toJSON(),
          roles: roles?.map(role => ({
            ...role.toJSON(),
            assignedAt: new Date(), // This would come from assignment
            expiresAt: undefined // This would come from assignment
          })),
          activity: activity?.map(activity => activity.toJSON())
        }
      };

    } catch (error) {
      console.error('GetUserProfileUseCase error:', error);

      if (error instanceof UserProfileNotFoundError || error instanceof UserSettingsNotFoundError) {
        return {
          success: false,
          message: error.message,
          data: {
            profile: {} as any,
            settings: undefined,
            roles: undefined,
            activity: undefined
          }
        };
      }

      return {
        success: false,
        message: 'Failed to retrieve user profile',
        data: {
          profile: {} as any,
          settings: undefined,
          roles: undefined,
          activity: undefined
        }
      };
    }
  }
}

// Import the schema at the top level
import { GetUserProfileRequestSchema } from '../dtos/input/GetUserProfileRequest';