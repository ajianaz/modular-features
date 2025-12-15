import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationPreference } from '../../../domain/entities/NotificationPreference.entity';
import {
  NotificationChannel,
  NotificationFrequency
} from '../../../domain/types';
import {
  testUserIds,
  createTestNotificationPreference,
  createMinimalNotificationPreference
} from '../../utils/testFixtures.test';

describe('NotificationPreference Entity', () => {
  describe('Constructor', () => {
    it('should create a valid notification preference with all required fields', () => {
      const preference = new NotificationPreference(
        '123e4567-e89b-12d3-a456-426614174401',
        testUserIds.validUser1,
        'general',
        true,
        false,
        true,
        true,
        NotificationFrequency.IMMEDIATE,
        true,
        '22:00',
        '08:00',
        'America/New_York',
        { preferences: 'custom' },
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );

      expect(preference.id).toBe('123e4567-e89b-12d3-a456-426614174401');
      expect(preference.userId).toBe(testUserIds.validUser1);
      expect(preference.type).toBe('general');
      expect(preference.emailEnabled).toBe(true);
      expect(preference.smsEnabled).toBe(false);
      expect(preference.pushEnabled).toBe(true);
      expect(preference.inAppEnabled).toBe(true);
      expect(preference.frequency).toBe(NotificationFrequency.IMMEDIATE);
      expect(preference.quietHoursEnabled).toBe(true);
      expect(preference.quietHoursStart).toBe('22:00');
      expect(preference.quietHoursEnd).toBe('08:00');
      expect(preference.timezone).toBe('America/New_York');
      expect(preference.metadata).toEqual({ preferences: 'custom' });
      expect(preference.createdAt).toBeInstanceOf(Date);
      expect(preference.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a notification preference with default values', () => {
      const preference = new NotificationPreference(
        '123e4567-e89b-12d3-a456-426614174401',
        testUserIds.validUser1,
        'general',
        true,
        false,
        true,
        true
      );

      expect(preference.frequency).toBe(NotificationFrequency.IMMEDIATE);
      expect(preference.quietHoursEnabled).toBe(false);
      expect(preference.quietHoursStart).toBeUndefined();
      expect(preference.quietHoursEnd).toBeUndefined();
      expect(preference.timezone).toBe('UTC');
      expect(preference.metadata).toEqual({});
      expect(preference.createdAt).toBeInstanceOf(Date);
      expect(preference.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid notification preference using factory method', () => {
      const preferenceData = {
        userId: testUserIds.validUser1,
        type: 'general',
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: NotificationFrequency.DAILY,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'America/New_York',
        metadata: { preferences: 'custom' }
      };

      const preference = NotificationPreference.create(preferenceData);

      expect(preference.userId).toBe(preferenceData.userId);
      expect(preference.type).toBe(preferenceData.type);
      expect(preference.emailEnabled).toBe(preferenceData.emailEnabled);
      expect(preference.smsEnabled).toBe(preferenceData.smsEnabled);
      expect(preference.pushEnabled).toBe(preferenceData.pushEnabled);
      expect(preference.inAppEnabled).toBe(preferenceData.inAppEnabled);
      expect(preference.frequency).toBe(preferenceData.frequency);
      expect(preference.quietHoursEnabled).toBe(preferenceData.quietHoursEnabled);
      expect(preference.quietHoursStart).toBe(preferenceData.quietHoursStart);
      expect(preference.quietHoursEnd).toBe(preferenceData.quietHoursEnd);
      expect(preference.timezone).toBe(preferenceData.timezone);
      expect(preference.metadata).toEqual(preferenceData.metadata);
      expect(preference.id).toBeDefined();
      expect(preference.createdAt).toBeInstanceOf(Date);
      expect(preference.updatedAt).toBeInstanceOf(Date);
    });

    it('should create notification preference with default values using factory method', () => {
      const preferenceData = {
        userId: testUserIds.validUser1,
        type: 'general',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
      };

      const preference = NotificationPreference.create(preferenceData);

      expect(preference.userId).toBe(preferenceData.userId);
      expect(preference.type).toBe(preferenceData.type);
      expect(preference.emailEnabled).toBe(preferenceData.emailEnabled);
      expect(preference.smsEnabled).toBe(false);
      expect(preference.pushEnabled).toBe(preferenceData.pushEnabled);
      expect(preference.inAppEnabled).toBe(preferenceData.inAppEnabled);
      expect(preference.frequency).toBe(NotificationFrequency.IMMEDIATE);
      expect(preference.quietHoursEnabled).toBe(false);
      expect(preference.quietHoursStart).toBeUndefined();
      expect(preference.quietHoursEnd).toBeUndefined();
      expect(preference.timezone).toBe('UTC');
      expect(preference.metadata).toEqual({});
      expect(preference.id).toBeDefined();
      expect(preference.createdAt).toBeInstanceOf(Date);
      expect(preference.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Methods', () => {
    let preference: NotificationPreference;

    beforeEach(() => {
      preference = createTestNotificationPreference();
    });

    describe('isChannelEnabled', () => {
      it('should return true for enabled email channel', () => {
        const emailEnabledPreference = createTestNotificationPreference({ emailEnabled: true });
        expect(emailEnabledPreference.isChannelEnabled(NotificationChannel.EMAIL)).toBe(true);
      });

      it('should return false for disabled email channel', () => {
        const emailDisabledPreference = createTestNotificationPreference({ emailEnabled: false });
        expect(emailDisabledPreference.isChannelEnabled(NotificationChannel.EMAIL)).toBe(false);
      });

      it('should return true for enabled SMS channel', () => {
        const smsEnabledPreference = createTestNotificationPreference({ smsEnabled: true });
        expect(smsEnabledPreference.isChannelEnabled(NotificationChannel.SMS)).toBe(true);
      });

      it('should return false for disabled SMS channel', () => {
        const smsDisabledPreference = createTestNotificationPreference({ smsEnabled: false });
        expect(smsDisabledPreference.isChannelEnabled(NotificationChannel.SMS)).toBe(false);
      });

      it('should return true for enabled push channel', () => {
        const pushEnabledPreference = createTestNotificationPreference({ pushEnabled: true });
        expect(pushEnabledPreference.isChannelEnabled(NotificationChannel.PUSH)).toBe(true);
      });

      it('should return false for disabled push channel', () => {
        const pushDisabledPreference = createTestNotificationPreference({ pushEnabled: false });
        expect(pushDisabledPreference.isChannelEnabled(NotificationChannel.PUSH)).toBe(false);
      });

      it('should return true for enabled in-app channel', () => {
        const inAppEnabledPreference = createTestNotificationPreference({ inAppEnabled: true });
        expect(inAppEnabledPreference.isChannelEnabled(NotificationChannel.IN_APP)).toBe(true);
      });

      it('should return false for disabled in-app channel', () => {
        const inAppDisabledPreference = createTestNotificationPreference({ inAppEnabled: false });
        expect(inAppDisabledPreference.isChannelEnabled(NotificationChannel.IN_APP)).toBe(false);
      });

      it('should return true for unknown channel', () => {
        const preference = createTestNotificationPreference();
        expect(preference.isChannelEnabled('unknown' as NotificationChannel)).toBe(true);
      });
    });

    describe('isInQuietHours', () => {
      it('should return true when current time is within quiet hours', () => {
        // Mock current time to be 23:00
        const mockDate = new Date('2023-12-01T23:00:00.000Z');
        const originalDate = Date.now;
        Date.now = () => mockDate.getTime();

        const preferenceWithQuietHours = createTestNotificationPreference({
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'UTC'  // Use UTC to match the mocked time
        });

        const inQuietHours = preferenceWithQuietHours.isInQuietHours();

        expect(inQuietHours).toBe(true);

        // Restore original Date.now
        Date.now = originalDate;
      });

      it('should return false when current time is outside quiet hours', () => {
        // Mock current time to be 10:00
        const mockDate = new Date('2023-12-01T10:00:00.000Z');
        const originalDate = Date.now;
        Date.now = () => mockDate.getTime();

        const preferenceWithQuietHours = createTestNotificationPreference({
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'UTC'  // Use UTC to match the mocked time
        });

        const inQuietHours = preferenceWithQuietHours.isInQuietHours();

        expect(inQuietHours).toBe(false);

        // Restore original Date.now
        Date.now = originalDate;
      });

      it('should return false when quiet hours are disabled', () => {
        const preferenceWithoutQuietHours = createTestNotificationPreference({
          quietHoursEnabled: false
        });

        const inQuietHours = preferenceWithoutQuietHours.isInQuietHours();

        expect(inQuietHours).toBe(false);
      });

      it('should handle overnight quiet hours', () => {
        // Mock current time to be 01:00 (should be in quiet hours 22:00-08:00)
        const mockDate = new Date('2023-12-01T01:00:00.000Z');
        const originalDate = Date.now;
        Date.now = () => mockDate.getTime();

        const preferenceWithOvernightQuietHours = createTestNotificationPreference({
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'UTC'  // Use UTC to match the mocked time
        });

        const inQuietHours = preferenceWithOvernightQuietHours.isInQuietHours();

        expect(inQuietHours).toBe(true);

        // Restore original Date.now
        Date.now = originalDate;
      });

      it('should return false when quiet hours start or end are not set', () => {
        const preferenceWithIncompleteQuietHours = createTestNotificationPreference({
          quietHoursEnabled: true,
          quietHoursStart: undefined,
          quietHoursEnd: '08:00'
        });

        const inQuietHours = preferenceWithIncompleteQuietHours.isInQuietHours();

        expect(inQuietHours).toBe(false);
      });
    });

    describe('updateEmailEnabled', () => {
      it('should update email enabled status and return new instance', () => {
        const updatedPreference = preference.updateEmailEnabled(false);

        expect(updatedPreference.emailEnabled).toBe(false);
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updateSmsEnabled', () => {
      it('should update SMS enabled status and return new instance', () => {
        const updatedPreference = preference.updateSmsEnabled(true);

        expect(updatedPreference.smsEnabled).toBe(true);
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updatePushEnabled', () => {
      it('should update push enabled status and return new instance', () => {
        const updatedPreference = preference.updatePushEnabled(false);

        expect(updatedPreference.pushEnabled).toBe(false);
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updateInAppEnabled', () => {
      it('should update in-app enabled status and return new instance', () => {
        const updatedPreference = preference.updateInAppEnabled(false);

        expect(updatedPreference.inAppEnabled).toBe(false);
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updateFrequency', () => {
      it('should update frequency and return new instance', () => {
        const updatedPreference = preference.updateFrequency(NotificationFrequency.WEEKLY);

        expect(updatedPreference.frequency).toBe(NotificationFrequency.WEEKLY);
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updateQuietHours', () => {
      it('should update quiet hours and return new instance', () => {
        const updatedPreference = preference.updateQuietHours(false, '23:00', '07:00');

        expect(updatedPreference.quietHoursEnabled).toBe(false);
        expect(updatedPreference.quietHoursStart).toBe('23:00');
        expect(updatedPreference.quietHoursEnd).toBe('07:00');
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });

      it('should disable quiet hours when enabled is false', () => {
        const updatedPreference = preference.updateQuietHours(false);

        expect(updatedPreference.quietHoursEnabled).toBe(false);
        expect(updatedPreference.quietHoursStart).toBeUndefined();
        expect(updatedPreference.quietHoursEnd).toBeUndefined();
      });
    });

    describe('updateTimezone', () => {
      it('should update timezone and return new instance', () => {
        const updatedPreference = preference.updateTimezone('Europe/London');

        expect(updatedPreference.timezone).toBe('Europe/London');
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });
    });

    describe('updateMetadata', () => {
      it('should update metadata and return new instance', () => {
        const newMetadata = { custom: 'value', updated: true };
        const updatedPreference = preference.updateMetadata(newMetadata);

        expect(updatedPreference.metadata).toEqual({ preferences: 'custom', custom: 'value', updated: true });
        expect(updatedPreference.updatedAt.getTime()).toBeGreaterThan(preference.updatedAt.getTime());
        expect(updatedPreference.id).toBe(preference.id);
        expect(updatedPreference.userId).toBe(preference.userId);
        expect(updatedPreference.type).toBe(preference.type);
      });

      it('should merge metadata with existing metadata', () => {
        const preferenceWithExistingMetadata = createTestNotificationPreference({
          metadata: { existing: 'value' }
        });
        const newMetadata = { new: 'value' };
        const updatedPreference = preferenceWithExistingMetadata.updateMetadata(newMetadata);

        expect(updatedPreference.metadata).toEqual({ existing: 'value', new: 'value' });
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid notification preference', () => {
        const preference = createTestNotificationPreference();
        const result = preference.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid notification preference', () => {
        const invalidPreference = new NotificationPreference(
          'invalid-id',
          testUserIds.validUser1,
          '', // Empty type
          'invalid-email-enabled' as any, // Invalid emailEnabled
          'invalid-sms-enabled' as any, // Invalid smsEnabled
          'invalid-push-enabled' as any, // Invalid pushEnabled
          'invalid-in-app-enabled' as any, // Invalid inAppEnabled
          'invalid-frequency' as any, // Invalid frequency
          'invalid-quiet-hours-enabled' as any, // Invalid quietHoursEnabled
          '', // Invalid quietHoursStart
          '', // Invalid quietHoursEnd
          '', // Invalid timezone
          'invalid-metadata' as any, // Invalid metadata
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any  // Invalid updated date
        );

        const result = invalidPreference.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const preferenceData = {
          userId: testUserIds.validUser1,
          type: 'general',
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          frequency: NotificationFrequency.DAILY,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'America/New_York',
          metadata: { preferences: 'custom' }
        };

        const result = NotificationPreference.validateCreate(preferenceData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid', // Invalid UUID
          type: '', // Empty type
          emailEnabled: 'invalid-email-enabled' as any, // Invalid emailEnabled type
          smsEnabled: 'invalid-sms-enabled' as any, // Invalid smsEnabled type
          pushEnabled: 'invalid-push-enabled' as any, // Invalid pushEnabled type
          inAppEnabled: 'invalid-in-app-enabled' as any, // Invalid inAppEnabled type
          frequency: 'invalid-frequency' as any, // Invalid frequency
          quietHoursEnabled: 'invalid-quiet-hours-enabled' as any, // Invalid quietHoursEnabled type
          quietHoursStart: '25:00', // Invalid quietHoursStart format
          quietHoursEnd: '25:00', // Invalid quietHoursEnd format
          timezone: '', // Empty timezone
          metadata: 'invalid-metadata' as any // Invalid metadata type
        };

        const result = NotificationPreference.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let preference: NotificationPreference;

    beforeEach(() => {
      preference = createTestNotificationPreference();
    });

    describe('toJSON', () => {
      it('should return preference object with all properties', () => {
        const json = preference.toJSON();

        expect(json).toEqual({
          id: preference.id,
          userId: preference.userId,
          type: preference.type,
          emailEnabled: preference.emailEnabled,
          smsEnabled: preference.smsEnabled,
          pushEnabled: preference.pushEnabled,
          inAppEnabled: preference.inAppEnabled,
          frequency: preference.frequency,
          quietHoursEnabled: preference.quietHoursEnabled,
          quietHoursStart: preference.quietHoursStart,
          quietHoursEnd: preference.quietHoursEnd,
          timezone: preference.timezone,
          metadata: preference.metadata,
          createdAt: preference.createdAt,
          updatedAt: preference.updatedAt
        });
      });
    });
  });
});
;