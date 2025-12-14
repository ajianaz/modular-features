import { describe, it, expect, beforeEach } from 'vitest';
import { UserSettings } from '../../../domain/entities/UserSettings.entity';
import {
  testUserIds,
  createTestUserSettings,
  createMinimalUserSettings
} from '../../utils/testFixtures.test';

describe('UserSettings Entity', () => {
  describe('Constructor', () => {
    it('should create a valid user settings with all required fields', () => {
      const settings = new UserSettings(
        '123e4567-e89b-12d3-a456-426614174121',
        testUserIds.validUser1,
        'dark',
        'en',
        'America/Los_Angeles',
        true,
        true,
        false,
        false,
        true,
        24,
        true,
        true,
        'public',
        { dashboardLayout: 'grid' },
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );

      expect(settings.id).toBe('123e4567-e89b-12d3-a456-426614174121');
      expect(settings.userId).toBe(testUserIds.validUser1);
      expect(settings.theme).toBe('dark');
      expect(settings.language).toBe('en');
      expect(settings.timezone).toBe('America/Los_Angeles');
      expect(settings.emailNotifications).toBe(true);
      expect(settings.pushNotifications).toBe(true);
      expect(settings.smsNotifications).toBe(false);
      expect(settings.marketingEmails).toBe(false);
      expect(settings.twoFactorEnabled).toBe(true);
      expect(settings.sessionTimeout).toBe(24);
      expect(settings.autoSaveDrafts).toBe(true);
      expect(settings.showOnlineStatus).toBe(true);
      expect(settings.profileVisibility).toBe('public');
      expect(settings.customSettings).toEqual({ dashboardLayout: 'grid' });
      expect(settings.createdAt).toBeInstanceOf(Date);
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user settings with default values', () => {
      const settings = new UserSettings(
        '123e4567-e89b-12d3-a456-426614174121',
        testUserIds.validUser1
      );

      expect(settings.theme).toBe('auto');
      expect(settings.language).toBe('en');
      expect(settings.timezone).toBe('UTC');
      expect(settings.emailNotifications).toBe(true);
      expect(settings.pushNotifications).toBe(true);
      expect(settings.smsNotifications).toBe(false);
      expect(settings.marketingEmails).toBe(false);
      expect(settings.twoFactorEnabled).toBe(false);
      expect(settings.sessionTimeout).toBe(24);
      expect(settings.autoSaveDrafts).toBe(true);
      expect(settings.showOnlineStatus).toBe(true);
      expect(settings.profileVisibility).toBe('public');
      expect(settings.customSettings).toBeUndefined();
      expect(settings.createdAt).toBeInstanceOf(Date);
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create valid user settings using factory method', () => {
      const settingsData = {
        userId: testUserIds.validUser1,
        theme: 'dark' as const,
        language: 'en',
        timezone: 'America/Los_Angeles',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        twoFactorEnabled: true,
        sessionTimeout: 24,
        autoSaveDrafts: true,
        showOnlineStatus: true,
        profileVisibility: 'public' as const,
        customSettings: { dashboardLayout: 'grid' }
      };

      const settings = UserSettings.create(settingsData);

      expect(settings.userId).toBe(settingsData.userId);
      expect(settings.theme).toBe(settingsData.theme);
      expect(settings.language).toBe(settingsData.language);
      expect(settings.timezone).toBe(settingsData.timezone);
      expect(settings.emailNotifications).toBe(settingsData.emailNotifications);
      expect(settings.pushNotifications).toBe(settingsData.pushNotifications);
      expect(settings.smsNotifications).toBe(settingsData.smsNotifications);
      expect(settings.marketingEmails).toBe(settingsData.marketingEmails);
      expect(settings.twoFactorEnabled).toBe(settingsData.twoFactorEnabled);
      expect(settings.sessionTimeout).toBe(settingsData.sessionTimeout);
      expect(settings.autoSaveDrafts).toBe(settingsData.autoSaveDrafts);
      expect(settings.showOnlineStatus).toBe(settingsData.showOnlineStatus);
      expect(settings.profileVisibility).toBe(settingsData.profileVisibility);
      expect(settings.customSettings).toEqual(settingsData.customSettings);
      expect(settings.id).toBeDefined();
      expect(settings.createdAt).toBeInstanceOf(Date);
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user settings with default values using factory method', () => {
      const settingsData = {
        userId: testUserIds.validUser1
      };

      const settings = UserSettings.create(settingsData);

      expect(settings.userId).toBe(settingsData.userId);
      expect(settings.theme).toBe('auto');
      expect(settings.language).toBe('en');
      expect(settings.timezone).toBe('UTC');
      expect(settings.emailNotifications).toBe(true);
      expect(settings.pushNotifications).toBe(true);
      expect(settings.smsNotifications).toBe(false);
      expect(settings.marketingEmails).toBe(false);
      expect(settings.twoFactorEnabled).toBe(false);
      expect(settings.sessionTimeout).toBe(24);
      expect(settings.autoSaveDrafts).toBe(true);
      expect(settings.showOnlineStatus).toBe(true);
      expect(settings.profileVisibility).toBe('public');
      expect(settings.customSettings).toBeUndefined();
      expect(settings.id).toBeDefined();
      expect(settings.createdAt).toBeInstanceOf(Date);
      expect(settings.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Methods', () => {
    let settings: UserSettings;

    beforeEach(() => {
      settings = createTestUserSettings();
    });

    describe('updateAppearance', () => {
      it('should update appearance settings and return new instance', () => {
        const updateData = {
          theme: 'light' as const,
          language: 'es',
          timezone: 'Europe/Madrid'
        };

        const updatedSettings = settings.updateAppearance(updateData);

        expect(updatedSettings.theme).toBe(updateData.theme);
        expect(updatedSettings.language).toBe(updateData.language);
        expect(updatedSettings.timezone).toBe(updateData.timezone);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settings.updatedAt.getTime());
        expect(updatedSettings.id).toBe(settings.id);
        expect(updatedSettings.userId).toBe(settings.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          theme: 'light' as const
          // other fields are undefined
        };

        const updatedSettings = settings.updateAppearance(updateData);

        expect(updatedSettings.theme).toBe('light');
        expect(updatedSettings.language).toBe(settings.language);
        expect(updatedSettings.timezone).toBe(settings.timezone);
      });
    });

    describe('updateNotifications', () => {
      it('should update notification settings and return new instance', () => {
        const updateData = {
          emailNotifications: false,
          pushNotifications: false,
          smsNotifications: true,
          marketingEmails: true
        };

        const updatedSettings = settings.updateNotifications(updateData);

        expect(updatedSettings.emailNotifications).toBe(updateData.emailNotifications);
        expect(updatedSettings.pushNotifications).toBe(updateData.pushNotifications);
        expect(updatedSettings.smsNotifications).toBe(updateData.smsNotifications);
        expect(updatedSettings.marketingEmails).toBe(updateData.marketingEmails);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settings.updatedAt.getTime());
        expect(updatedSettings.id).toBe(settings.id);
        expect(updatedSettings.userId).toBe(settings.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          emailNotifications: false
          // other fields are undefined
        };

        const updatedSettings = settings.updateNotifications(updateData);

        expect(updatedSettings.emailNotifications).toBe(false);
        expect(updatedSettings.pushNotifications).toBe(settings.pushNotifications);
        expect(updatedSettings.smsNotifications).toBe(settings.smsNotifications);
        expect(updatedSettings.marketingEmails).toBe(settings.marketingEmails);
      });
    });

    describe('updateSecurity', () => {
      it('should update security settings and return new instance', () => {
        const updateData = {
          twoFactorEnabled: false,
          sessionTimeout: 12
        };

        const updatedSettings = settings.updateSecurity(updateData);

        expect(updatedSettings.twoFactorEnabled).toBe(updateData.twoFactorEnabled);
        expect(updatedSettings.sessionTimeout).toBe(updateData.sessionTimeout);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settings.updatedAt.getTime());
        expect(updatedSettings.id).toBe(settings.id);
        expect(updatedSettings.userId).toBe(settings.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          twoFactorEnabled: false
          // sessionTimeout is undefined
        };

        const updatedSettings = settings.updateSecurity(updateData);

        expect(updatedSettings.twoFactorEnabled).toBe(false);
        expect(updatedSettings.sessionTimeout).toBe(settings.sessionTimeout);
      });
    });

    describe('updatePrivacy', () => {
      it('should update privacy settings and return new instance', () => {
        const updateData = {
          showOnlineStatus: false,
          profileVisibility: 'private' as const
        };

        const updatedSettings = settings.updatePrivacy(updateData);

        expect(updatedSettings.showOnlineStatus).toBe(updateData.showOnlineStatus);
        expect(updatedSettings.profileVisibility).toBe(updateData.profileVisibility);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settings.updatedAt.getTime());
        expect(updatedSettings.id).toBe(settings.id);
        expect(updatedSettings.userId).toBe(settings.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          showOnlineStatus: false
          // profileVisibility is undefined
        };

        const updatedSettings = settings.updatePrivacy(updateData);

        expect(updatedSettings.showOnlineStatus).toBe(false);
        expect(updatedSettings.profileVisibility).toBe(settings.profileVisibility);
      });
    });

    describe('updatePreferences', () => {
      it('should update preferences and return new instance', () => {
        const updateData = {
          autoSaveDrafts: false,
          customSettings: { dashboardLayout: 'list' }
        };

        const updatedSettings = settings.updatePreferences(updateData);

        expect(updatedSettings.autoSaveDrafts).toBe(updateData.autoSaveDrafts);
        expect(updatedSettings.customSettings).toEqual(updateData.customSettings);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settings.updatedAt.getTime());
        expect(updatedSettings.id).toBe(settings.id);
        expect(updatedSettings.userId).toBe(settings.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          autoSaveDrafts: false
          // customSettings is undefined
        };

        const updatedSettings = settings.updatePreferences(updateData);

        expect(updatedSettings.autoSaveDrafts).toBe(false);
        expect(updatedSettings.customSettings).toEqual(settings.customSettings);
      });
    });

    describe('enableTwoFactor', () => {
      it('should enable two-factor authentication', () => {
        const settingsWithout2FA = createTestUserSettings({ twoFactorEnabled: false });

        const settingsWith2FA = settingsWithout2FA.enableTwoFactor();

        expect(settingsWith2FA.twoFactorEnabled).toBe(true);
        expect(settingsWith2FA.updatedAt.getTime()).toBeGreaterThan(settingsWithout2FA.updatedAt.getTime());
      });

      it('should keep two-factor enabled if already enabled', () => {
        const settingsWith2FA = createTestUserSettings({ twoFactorEnabled: true });

        const updatedSettings = settingsWith2FA.enableTwoFactor();

        expect(updatedSettings.twoFactorEnabled).toBe(true);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settingsWith2FA.updatedAt.getTime());
      });
    });

    describe('disableTwoFactor', () => {
      it('should disable two-factor authentication', () => {
        const settingsWith2FA = createTestUserSettings({ twoFactorEnabled: true });

        const settingsWithout2FA = settingsWith2FA.disableTwoFactor();

        expect(settingsWithout2FA.twoFactorEnabled).toBe(false);
        expect(settingsWithout2FA.updatedAt.getTime()).toBeGreaterThan(settingsWith2FA.updatedAt.getTime());
      });

      it('should keep two-factor disabled if already disabled', () => {
        const settingsWithout2FA = createTestUserSettings({ twoFactorEnabled: false });

        const updatedSettings = settingsWithout2FA.disableTwoFactor();

        expect(updatedSettings.twoFactorEnabled).toBe(false);
        expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(settingsWithout2FA.updatedAt.getTime());
      });
    });
  });

  describe('Business Validation Methods', () => {
    let settings: UserSettings;

    beforeEach(() => {
      settings = createTestUserSettings();
    });

    describe('isSecureSession', () => {
      it('should return true for session timeout of 24 hours or less', () => {
        const secureSettings = createTestUserSettings({ sessionTimeout: 24 });
        expect(secureSettings.isSecureSession()).toBe(true);

        const verySecureSettings = createTestUserSettings({ sessionTimeout: 12 });
        expect(verySecureSettings.isSecureSession()).toBe(true);
      });

      it('should return false for session timeout greater than 24 hours', () => {
        const insecureSettings = createTestUserSettings({ sessionTimeout: 48 });
        expect(insecureSettings.isSecureSession()).toBe(false);
      });
    });

    describe('hasEmailNotifications', () => {
      it('should return true when email notifications are enabled', () => {
        const emailEnabledSettings = createTestUserSettings({ emailNotifications: true });
        expect(emailEnabledSettings.hasEmailNotifications()).toBe(true);
      });

      it('should return true when marketing emails are enabled', () => {
        const marketingEnabledSettings = createTestUserSettings({
          emailNotifications: false,
          marketingEmails: true
        });
        expect(marketingEnabledSettings.hasEmailNotifications()).toBe(true);
      });

      it('should return false when both email and marketing emails are disabled', () => {
        const noEmailSettings = createTestUserSettings({
          emailNotifications: false,
          marketingEmails: false
        });
        expect(noEmailSettings.hasEmailNotifications()).toBe(false);
      });
    });

    describe('hasPushNotifications', () => {
      it('should return true when push notifications are enabled', () => {
        const pushEnabledSettings = createTestUserSettings({ pushNotifications: true });
        expect(pushEnabledSettings.hasPushNotifications()).toBe(true);
      });

      it('should return false when push notifications are disabled', () => {
        const pushDisabledSettings = createTestUserSettings({ pushNotifications: false });
        expect(pushDisabledSettings.hasPushNotifications()).toBe(false);
      });
    });

    describe('isPrivateProfile', () => {
      it('should return true when profile visibility is private', () => {
        const privateSettings = createTestUserSettings({ profileVisibility: 'private' });
        expect(privateSettings.isPrivateProfile()).toBe(true);
      });

      it('should return false when profile visibility is not private', () => {
        const publicSettings = createTestUserSettings({ profileVisibility: 'public' });
        expect(publicSettings.isPrivateProfile()).toBe(false);

        const friendsSettings = createTestUserSettings({ profileVisibility: 'friends' });
        expect(friendsSettings.isPrivateProfile()).toBe(false);
      });
    });

    describe('isPublicProfile', () => {
      it('should return true when profile visibility is public', () => {
        const publicSettings = createTestUserSettings({ profileVisibility: 'public' });
        expect(publicSettings.isPublicProfile()).toBe(true);
      });

      it('should return false when profile visibility is not public', () => {
        const privateSettings = createTestUserSettings({ profileVisibility: 'private' });
        expect(privateSettings.isPublicProfile()).toBe(false);

        const friendsSettings = createTestUserSettings({ profileVisibility: 'friends' });
        expect(friendsSettings.isPublicProfile()).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid user settings', () => {
        const settings = createTestUserSettings();
        const result = settings.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid user settings', () => {
        const invalidSettings = new UserSettings(
          'invalid-id',
          testUserIds.validUser1,
          'invalid-theme' as any, // Invalid theme
          '', // Empty language is invalid
          '', // Empty timezone is invalid
          'not-a-boolean' as any, // Invalid type for emailNotifications
          'not-a-boolean' as any, // Invalid type for pushNotifications
          'not-a-boolean' as any, // Invalid type for smsNotifications
          'not-a-boolean' as any, // Invalid type for marketingEmails
          'not-a-boolean' as any, // Invalid type for twoFactorEnabled
          -1, // Invalid session timeout (below minimum)
          'not-a-boolean' as any, // Invalid type for autoSaveDrafts
          'not-a-boolean' as any, // Invalid type for showOnlineStatus
          'invalid-visibility' as any, // Invalid profile visibility
          'not-an-object' as any, // Invalid type for customSettings
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any  // Invalid updated date
        );

        const result = invalidSettings.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const settingsData = {
          userId: testUserIds.validUser1,
          theme: 'dark' as const,
          language: 'en',
          timezone: 'America/Los_Angeles',
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          twoFactorEnabled: true,
          sessionTimeout: 24,
          autoSaveDrafts: true,
          showOnlineStatus: true,
          profileVisibility: 'public' as const,
          customSettings: { dashboardLayout: 'grid' }
        };

        const result = UserSettings.validateCreate(settingsData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid', // Invalid UUID
          theme: 'invalid-theme' as any, // Invalid theme
          language: 'a'.repeat(11), // Too long
          timezone: 'a'.repeat(51), // Too long
          emailNotifications: 'not-a-boolean' as any, // Invalid type
          pushNotifications: 'not-a-boolean' as any, // Invalid type
          smsNotifications: 'not-a-boolean' as any, // Invalid type
          marketingEmails: 'not-a-boolean' as any, // Invalid type
          twoFactorEnabled: 'not-a-boolean' as any, // Invalid type
          sessionTimeout: 0, // Below minimum
          autoSaveDrafts: 'not-a-boolean' as any, // Invalid type
          showOnlineStatus: 'not-a-boolean' as any, // Invalid type
          profileVisibility: 'invalid-visibility' as any, // Invalid visibility
          customSettings: 'not-an-object' as any // Invalid type
        };

        const result = UserSettings.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let settings: UserSettings;

    beforeEach(() => {
      settings = createTestUserSettings();
    });

    describe('toJSON', () => {
      it('should return settings object with all properties', () => {
        const json = settings.toJSON();

        expect(json).toEqual({
          id: settings.id,
          userId: settings.userId,
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
          customSettings: settings.customSettings,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        });
      });
    });
  });
});