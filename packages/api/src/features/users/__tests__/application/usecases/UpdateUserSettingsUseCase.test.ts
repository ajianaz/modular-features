import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateUserSettingsUseCase } from '../../../application/usecases/UpdateUserSettingsUseCase';
import { IUserSettingsRepository, IUserActivityRepository } from '../../../domain/interfaces';
import { UserSettings, UserActivity } from '../../../domain/entities';
import {
  UserSettingsNotFoundError,
  InvalidUserSettingsError
} from '../../../domain/errors/UserManagementError';
import {
  testUserIds,
  createTestUserSettings,
  createTestUserActivity,
  createTestUpdateUserSettingsRequest
} from '../../utils/testFixtures.test';
import {
  createMockUserSettingsRepository,
  createMockUserActivityRepository,
  setupUserSettingsRepository,
  setupUserActivityRepository
} from '../../utils/testUtils.test';

describe('UpdateUserSettingsUseCase', () => {
  let useCase: UpdateUserSettingsUseCase;
  let mockUserSettingsRepository: IUserSettingsRepository;
  let mockUserActivityRepository: IUserActivityRepository;

  beforeEach(() => {
    mockUserSettingsRepository = createMockUserSettingsRepository();
    mockUserActivityRepository = createMockUserActivityRepository();

    useCase = new UpdateUserSettingsUseCase(
      mockUserSettingsRepository,
      mockUserActivityRepository
    );
  });

  describe('execute', () => {
    const validRequest = createTestUpdateUserSettingsRequest();

    describe('when settings exist and update is valid', () => {
      let existingSettings: UserSettings;
      let updatedSettings: UserSettings;

      beforeEach(() => {
        existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          theme: validRequest.theme,
          language: validRequest.language,
          timezone: validRequest.timezone,
          emailNotifications: validRequest.emailNotifications,
          pushNotifications: validRequest.pushNotifications,
          smsNotifications: validRequest.smsNotifications,
          marketingEmails: validRequest.marketingEmails,
          twoFactorEnabled: validRequest.twoFactorEnabled,
          sessionTimeout: validRequest.sessionTimeout,
          autoSaveDrafts: validRequest.autoSaveDrafts,
          showOnlineStatus: validRequest.showOnlineStatus,
          profileVisibility: validRequest.profileVisibility,
          customSettings: validRequest.customSettings
        });

        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);
        setupUserActivityRepository(mockUserActivityRepository, {});
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return success response with updated settings', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.message).toBe('User settings updated successfully');
        expect(result.data.settings).toEqual(updatedSettings.toJSON());
      });

      it('should call repository methods with correct parameters', async () => {
        await useCase.execute(validRequest);

        expect(mockUserSettingsRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserSettingsRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: existingSettings.id,
            userId: testUserIds.validUser1,
            theme: validRequest.theme,
            language: validRequest.language,
            timezone: validRequest.timezone,
            emailNotifications: validRequest.emailNotifications,
            pushNotifications: validRequest.pushNotifications,
            smsNotifications: validRequest.smsNotifications,
            marketingEmails: validRequest.marketingEmails,
            twoFactorEnabled: validRequest.twoFactorEnabled,
            sessionTimeout: validRequest.sessionTimeout,
            autoSaveDrafts: validRequest.autoSaveDrafts,
            showOnlineStatus: validRequest.showOnlineStatus,
            profileVisibility: validRequest.profileVisibility,
            customSettings: validRequest.customSettings
          })
        );
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'update',
            resource: 'settings',
            resourceId: existingSettings.id,
            description: expect.stringContaining('updated'),
            metadata: expect.objectContaining({
              fieldsUpdated: expect.arrayContaining([
                'theme', 'language', 'timezone', 'emailNotifications', 'pushNotifications',
                'smsNotifications', 'marketingEmails', 'twoFactorEnabled', 'sessionTimeout',
                'autoSaveDrafts', 'showOnlineStatus', 'profileVisibility', 'customSettings'
              ])
            })
          })
        );
      });

      it('should handle partial updates', async () => {
        const partialRequest = {
          userId: testUserIds.validUser1,
          theme: 'light' as const,
          language: 'es'
        };

        const partialUpdatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          theme: partialRequest.theme,
          language: partialRequest.language
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(partialUpdatedSettings);

        const result = await useCase.execute(partialRequest);

        expect(result.success).toBe(true);
        expect(result.data.settings.theme).toBe(partialRequest.theme);
        expect(result.data.settings.language).toBe(partialRequest.language);
      });
    });

    describe('when settings do not exist', () => {
      beforeEach(() => {
        (mockUserSettingsRepository.findByUserId as any).mockResolvedValue(null);
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return error response', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe(`User settings with ID ${testUserIds.validUser1} not found`);
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'update',
            resource: 'settings',
            description: expect.stringContaining('not found')
          })
        );
      });
    });

    describe('when validation fails', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle invalid request validation', async () => {
        const invalidRequest = {
          userId: 'invalid-uuid',
          theme: 'invalid-theme' as any,
          language: '',
          timezone: '',
          sessionTimeout: -1,
          profileVisibility: 'invalid-visibility' as any
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle invalid theme', async () => {
        const invalidRequest = {
          userId: testUserIds.validUser1,
          theme: 'invalid-theme' as any
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle invalid session timeout', async () => {
        const invalidRequest = {
          userId: testUserIds.validUser1,
          sessionTimeout: -1
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle invalid profile visibility', async () => {
        const invalidRequest = {
          userId: testUserIds.validUser1,
          profileVisibility: 'invalid-visibility' as any
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });
    });

    describe('when repository errors occur', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle repository errors gracefully', async () => {
        const error = new Error('Database error');
        (mockUserSettingsRepository.update as any).mockRejectedValue(error);

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to update user settings');
      });
    });

    describe('theme validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid themes', async () => {
        const validThemes = ['light', 'dark', 'auto'];

        for (const theme of validThemes) {
          const requestWithTheme = {
            userId: testUserIds.validUser1,
            theme: theme as 'light' | 'dark' | 'auto'
          };

          const updatedSettings = createTestUserSettings({
            userId: testUserIds.validUser1,
            theme
          });

          (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

          const result = await useCase.execute(requestWithTheme);

          expect(result.success).toBe(true);
          expect(result.data.settings.theme).toBe(theme);
        }
      });
    });

    describe('language validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid languages', async () => {
        const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];

        for (const language of validLanguages) {
          const requestWithLanguage = {
            userId: testUserIds.validUser1,
            language
          };

          const updatedSettings = createTestUserSettings({
            userId: testUserIds.validUser1,
            language
          });

          (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

          const result = await useCase.execute(requestWithLanguage);

          expect(result.success).toBe(true);
          expect(result.data.settings.language).toBe(language);
        }
      });
    });

    describe('notification settings validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle boolean notification settings', async () => {
        const requestWithNotifications = {
          userId: testUserIds.validUser1,
          emailNotifications: false,
          pushNotifications: true,
          smsNotifications: false,
          marketingEmails: true
        };

        const updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          emailNotifications: requestWithNotifications.emailNotifications,
          pushNotifications: requestWithNotifications.pushNotifications,
          smsNotifications: requestWithNotifications.smsNotifications,
          marketingEmails: requestWithNotifications.marketingEmails
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

        const result = await useCase.execute(requestWithNotifications);

        expect(result.success).toBe(true);
        expect(result.data.settings.emailNotifications).toBe(false);
        expect(result.data.settings.pushNotifications).toBe(true);
        expect(result.data.settings.smsNotifications).toBe(false);
        expect(result.data.settings.marketingEmails).toBe(true);
      });
    });

    describe('security settings validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid security settings', async () => {
        const requestWithSecurity = {
          userId: testUserIds.validUser1,
          twoFactorEnabled: true,
          sessionTimeout: 12
        };

        const updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          twoFactorEnabled: requestWithSecurity.twoFactorEnabled,
          sessionTimeout: requestWithSecurity.sessionTimeout
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

        const result = await useCase.execute(requestWithSecurity);

        expect(result.success).toBe(true);
        expect(result.data.settings.twoFactorEnabled).toBe(true);
        expect(result.data.settings.sessionTimeout).toBe(12);
      });

      it('should handle invalid session timeout values', async () => {
        const invalidTimeouts = [-1, 0, 1000];

        for (const timeout of invalidTimeouts) {
          const requestWithInvalidTimeout = {
            userId: testUserIds.validUser1,
            sessionTimeout: timeout
          };

          const result = await useCase.execute(requestWithInvalidTimeout);

          expect(result.success).toBe(false);
          expect(result.message).toContain('Validation error');
        }
      });
    });

    describe('privacy settings validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid privacy settings', async () => {
        const requestWithPrivacy = {
          userId: testUserIds.validUser1,
          showOnlineStatus: false,
          profileVisibility: 'private' as const
        };

        const updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          showOnlineStatus: requestWithPrivacy.showOnlineStatus,
          profileVisibility: requestWithPrivacy.profileVisibility
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

        const result = await useCase.execute(requestWithPrivacy);

        expect(result.success).toBe(true);
        expect(result.data.settings.showOnlineStatus).toBe(false);
        expect(result.data.settings.profileVisibility).toBe('private');
      });

      it('should handle valid profile visibility options', async () => {
        const validVisibilities = ['public', 'private', 'friends'];

        for (const visibility of validVisibilities) {
          const requestWithVisibility = {
            userId: testUserIds.validUser1,
            profileVisibility: visibility as 'public' | 'private' | 'friends'
          };

          const updatedSettings = createTestUserSettings({
            userId: testUserIds.validUser1,
            profileVisibility: visibility
          });

          (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

          const result = await useCase.execute(requestWithVisibility);

          expect(result.success).toBe(true);
          expect(result.data.settings.profileVisibility).toBe(visibility);
        }
      });
    });

    describe('custom settings validation', () => {
      beforeEach(() => {
        const existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle valid custom settings', async () => {
        const requestWithCustomSettings = {
          userId: testUserIds.validUser1,
          customSettings: {
            dashboardLayout: 'list',
            defaultPageSize: 50,
            showAdvancedOptions: true,
            customColor: '#ff0000'
          }
        };

        const updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          customSettings: requestWithCustomSettings.customSettings
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

        const result = await useCase.execute(requestWithCustomSettings);

        expect(result.success).toBe(true);
        expect(result.data.settings.customSettings).toEqual(requestWithCustomSettings.customSettings);
      });
    });

    describe('activity logging', () => {
      let existingSettings: UserSettings;

      beforeEach(() => {
        existingSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: existingSettings });
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should log settings update activity with correct metadata', async () => {
        const updatedSettings = createTestUserSettings({
          userId: testUserIds.validUser1,
          theme: 'light',
          language: 'es'
        });

        (mockUserSettingsRepository.update as any).mockResolvedValue(updatedSettings);

        await useCase.execute({
          userId: testUserIds.validUser1,
          theme: 'light',
          language: 'es'
        });

        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'update',
            resource: 'settings',
            resourceId: existingSettings.id,
            description: expect.stringContaining('updated'),
            metadata: expect.objectContaining({
              fieldsUpdated: expect.arrayContaining(['theme', 'language']),
              previousValues: expect.objectContaining({
                theme: existingSettings.theme,
                language: existingSettings.language
              }),
              newValues: expect.objectContaining({
                theme: 'light',
                language: 'es'
              })
            })
          })
        );
      });
    });
  });
});