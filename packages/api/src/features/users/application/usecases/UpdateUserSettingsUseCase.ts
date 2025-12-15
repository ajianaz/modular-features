import { UserSettings, UserActivity } from '../../domain/entities';
import { IUserSettingsRepository, IUserActivityRepository } from '../../domain/interfaces';
import {
  UpdateUserSettingsRequest,
  UpdateUserSettingsResponse
} from '../dtos';
import {
  UserSettingsNotFoundError,
  InvalidUserSettingsError
} from '../../domain/errors';
import { UpdateUserSettingsRequestSchema } from '../dtos/input/UpdateUserSettingsRequest';

export class UpdateUserSettingsUseCase {
  constructor(
    private userSettingsRepository: IUserSettingsRepository,
    private userActivityRepository: IUserActivityRepository
  ) {}

  async execute(request: UpdateUserSettingsRequest): Promise<UpdateUserSettingsResponse> {
    try {
      // Validate request
      const requestValidation = UpdateUserSettingsRequestSchema.safeParse(request);
      if (!requestValidation.success) {
        return {
          success: false,
          message: `Validation error: ${requestValidation.error.issues.map(i => i.message).join(', ')}`,
          data: {
            settings: {} as any
          }
        };
      }

      // Check if settings exist
      const existingSettings = await this.userSettingsRepository.findByUserId(request.userId);
      if (!existingSettings) {
        // Create default settings if none exist
        const defaultSettings = UserSettings.create({ userId: request.userId });
        await this.userSettingsRepository.create(defaultSettings);
      }

      const settings = existingSettings || UserSettings.create({ userId: request.userId });

      // Track what settings are being updated for activity logging
      const updatedSettings: string[] = [];

      if (request.theme !== undefined && request.theme !== settings.theme) {
        updatedSettings.push('theme');
      }
      if (request.language !== undefined && request.language !== settings.language) {
        updatedSettings.push('language');
      }
      if (request.timezone !== undefined && request.timezone !== settings.timezone) {
        updatedSettings.push('timezone');
      }
      if (request.emailNotifications !== undefined && request.emailNotifications !== settings.emailNotifications) {
        updatedSettings.push('emailNotifications');
      }
      if (request.pushNotifications !== undefined && request.pushNotifications !== settings.pushNotifications) {
        updatedSettings.push('pushNotifications');
      }
      if (request.smsNotifications !== undefined && request.smsNotifications !== settings.smsNotifications) {
        updatedSettings.push('smsNotifications');
      }
      if (request.marketingEmails !== undefined && request.marketingEmails !== settings.marketingEmails) {
        updatedSettings.push('marketingEmails');
      }
      if (request.twoFactorEnabled !== undefined && request.twoFactorEnabled !== settings.twoFactorEnabled) {
        updatedSettings.push('twoFactorEnabled');
      }
      if (request.sessionTimeout !== undefined && request.sessionTimeout !== settings.sessionTimeout) {
        updatedSettings.push('sessionTimeout');
      }
      if (request.autoSaveDrafts !== undefined && request.autoSaveDrafts !== settings.autoSaveDrafts) {
        updatedSettings.push('autoSaveDrafts');
      }
      if (request.showOnlineStatus !== undefined && request.showOnlineStatus !== settings.showOnlineStatus) {
        updatedSettings.push('showOnlineStatus');
      }
      if (request.profileVisibility !== undefined && request.profileVisibility !== settings.profileVisibility) {
        updatedSettings.push('profileVisibility');
      }
      if (request.customSettings !== undefined && JSON.stringify(request.customSettings) !== JSON.stringify(settings.customSettings)) {
        updatedSettings.push('customSettings');
      }

      // If no settings are being updated, return current settings
      if (updatedSettings.length === 0) {
        return {
          success: true,
          message: 'No changes detected in settings',
          data: {
            settings: settings.toJSON()
          }
        };
      }

      // Update settings
      let updatedSettingsEntity = settings;

      // Update appearance settings
      if (request.theme !== undefined || request.language !== undefined || request.timezone !== undefined) {
        updatedSettingsEntity = updatedSettingsEntity.updateAppearance({
          theme: request.theme,
          language: request.language,
          timezone: request.timezone
        });
      }

      // Update notification settings
      if (request.emailNotifications !== undefined || request.pushNotifications !== undefined ||
          request.smsNotifications !== undefined || request.marketingEmails !== undefined) {

        updatedSettingsEntity = updatedSettingsEntity.updateNotifications({
          emailNotifications: request.emailNotifications,
          pushNotifications: request.pushNotifications,
          smsNotifications: request.smsNotifications,
          marketingEmails: request.marketingEmails
        });
      }

      // Update security settings
      if (request.twoFactorEnabled !== undefined || request.sessionTimeout !== undefined) {
        updatedSettingsEntity = updatedSettingsEntity.updateSecurity({
          twoFactorEnabled: request.twoFactorEnabled,
          sessionTimeout: request.sessionTimeout
        });
      }

      // Update privacy settings
      if (request.showOnlineStatus !== undefined || request.profileVisibility !== undefined) {
        updatedSettingsEntity = updatedSettingsEntity.updatePrivacy({
          showOnlineStatus: request.showOnlineStatus,
          profileVisibility: request.profileVisibility
        });
      }

      // Update preferences
      if (request.autoSaveDrafts !== undefined || request.customSettings !== undefined) {
        updatedSettingsEntity = updatedSettingsEntity.updatePreferences({
          autoSaveDrafts: request.autoSaveDrafts,
          customSettings: request.customSettings
        });
      }

      // Validate updated settings
      const settingsValidation = updatedSettingsEntity.validate();
      if (!settingsValidation.isValid) {
        throw new InvalidUserSettingsError(settingsValidation.errors.join(', '));
      }

      // Save updated settings
      const savedSettings = await this.userSettingsRepository.update(updatedSettingsEntity);

      // Log settings update activity
      await this.userActivityRepository.create(
        UserActivity.createSettingsUpdateActivity({
          userId: request.userId,
          category: 'general',
          settingsChanged: updatedSettings,
          metadata: {
            previousValues: {
              theme: settings.theme,
              language: settings.language,
              timezone: settings.timezone,
              emailNotifications: settings.emailNotifications,
              pushNotifications: settings.pushNotifications,
              smsNotifications: settings.smsNotifications,
              marketingEmails: settings.marketingEmails,
              twoFactorEnabled: settings.twoFactorEnabled,
              sessionTimeout: settings.sessionTimeout,
              autoSaveDrafts: settings.autoSaveDrafts,
              showOnlineStatus: settings.showOnlineStatus,
              profileVisibility: settings.profileVisibility,
              customSettings: settings.customSettings
            },
            newValues: {
              theme: updatedSettingsEntity.theme,
              language: updatedSettingsEntity.language,
              timezone: updatedSettingsEntity.timezone,
              emailNotifications: updatedSettingsEntity.emailNotifications,
              pushNotifications: updatedSettingsEntity.pushNotifications,
              smsNotifications: updatedSettingsEntity.smsNotifications,
              marketingEmails: updatedSettingsEntity.marketingEmails,
              twoFactorEnabled: updatedSettingsEntity.twoFactorEnabled,
              sessionTimeout: updatedSettingsEntity.sessionTimeout,
              autoSaveDrafts: updatedSettingsEntity.autoSaveDrafts,
              showOnlineStatus: updatedSettingsEntity.showOnlineStatus,
              profileVisibility: updatedSettingsEntity.profileVisibility,
              customSettings: updatedSettingsEntity.customSettings
            }
          }
        })
      );

      return {
        success: true,
        message: 'Settings updated successfully',
        data: {
          settings: savedSettings.toJSON()
        }
      };

    } catch (error) {
      console.error('UpdateUserSettingsUseCase error:', error);

      if (error instanceof UserSettingsNotFoundError || error instanceof InvalidUserSettingsError) {
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
        message: 'Failed to update settings',
        data: {
          settings: {} as any
        }
      };
    }
  }
}
