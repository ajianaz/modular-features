import { UserSettings } from '../../domain/entities';
import { IUserSettingsRepository } from '../../domain/interfaces';
import {
  GetUserSettingsRequest,
  GetUserSettingsResponse
} from '../dtos';
import {
  UserSettingsNotFoundError
} from '../../domain/errors';

export class GetUserSettingsUseCase {
  constructor(
    private userSettingsRepository: IUserSettingsRepository
  ) {}

  async execute(request: GetUserSettingsRequest): Promise<GetUserSettingsResponse> {
    try {
      // Validate request
      const validation = GetUserSettingsRequestSchema.safeParse(request);
      if (!validation.success) {
        return {
          success: false,
          message: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
          data: {
            settings: {} as any
          }
        };
      }

      // Get user settings
      let settings = await this.userSettingsRepository.findByUserId(request.userId);

      // Create default settings if none exist
      if (!settings) {
        settings = UserSettings.create({ userId: request.userId });
        await this.userSettingsRepository.create(settings);
      }

      return {
        success: true,
        message: 'User settings retrieved successfully',
        data: {
          settings: settings.toJSON()
        }
      };

    } catch (error) {
      console.error('GetUserSettingsUseCase error:', error);

      if (error instanceof UserSettingsNotFoundError) {
        return {
          success: false,
          message: error.message,
          data: {
            settings: {} as any
          }
        };
      }

      return {
        success: false,
        message: 'Failed to retrieve user settings',
        data: {
          settings: {} as any
        }
      };
    }
  }
}

// Import the schema at the top level
import { GetUserSettingsRequestSchema } from '../dtos/input/GetUserSettingsRequest';