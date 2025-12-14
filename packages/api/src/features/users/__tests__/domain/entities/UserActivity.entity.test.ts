import { describe, it, expect, beforeEach } from 'vitest';
import { UserActivity } from '../../../domain/entities/UserActivity.entity';
import {
  testUserIds,
  testActivityIds,
  createTestUserActivity,
  createTestLoginActivity,
  createTestProfileUpdateActivity,
  createTestAvatarUploadActivity
} from '../../utils/testFixtures.test';

// Helper functions for testing
const createPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const createFutureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

describe('UserActivity Entity', () => {
  describe('Constructor', () => {
    it('should create a valid user activity with all required fields', () => {
      const activity = new UserActivity(
        testActivityIds.activity1,
        testUserIds.validUser1,
        'login',
        'success',
        'User logged in successfully',
        'authentication',
        '123e4567-e89b-12d3-a456-426614174111',
        { success: true },
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '123e4567-e89b-12d3-a456-426614174141',
        new Date('2023-01-01T12:00:00.000Z')
      );

      expect(activity.id).toBe(testActivityIds.activity1);
      expect(activity.userId).toBe(testUserIds.validUser1);
      expect(activity.type).toBe('login');
      expect(activity.action).toBe('success');
      expect(activity.description).toBe('User logged in successfully');
      expect(activity.resource).toBe('authentication');
      expect(activity.resourceId).toBe('123e4567-e89b-12d3-a456-426614174111');
      expect(activity.metadata).toEqual({ success: true });
      expect(activity.ipAddress).toBe('192.168.1.1');
      expect(activity.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(activity.sessionId).toBe('123e4567-e89b-12d3-a456-426614174141');
      expect(activity.createdAt).toBeInstanceOf(Date);
    });

    it('should create a user activity with default values', () => {
      const activity = new UserActivity(
        testActivityIds.activity1,
        testUserIds.validUser1,
        'login',
        'success'
      );

      expect(activity.id).toBe(testActivityIds.activity1);
      expect(activity.userId).toBe(testUserIds.validUser1);
      expect(activity.type).toBe('login');
      expect(activity.action).toBe('success');
      expect(activity.description).toBeUndefined();
      expect(activity.resource).toBeUndefined();
      expect(activity.resourceId).toBeUndefined();
      expect(activity.metadata).toBeUndefined();
      expect(activity.ipAddress).toBeUndefined();
      expect(activity.userAgent).toBeUndefined();
      expect(activity.sessionId).toBeUndefined();
      expect(activity.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid user activity using factory method', () => {
      const activityData = {
        userId: testUserIds.validUser1,
        type: 'login',
        action: 'success',
        description: 'User logged in successfully',
        resource: 'authentication',
        resourceId: '123e4567-e89b-12d3-a456-426614174111',
        metadata: { success: true },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: '123e4567-e89b-12d3-a456-426614174141'
      };

      const activity = UserActivity.create(activityData);

      expect(activity.userId).toBe(activityData.userId);
      expect(activity.type).toBe(activityData.type.toLowerCase().trim());
      expect(activity.action).toBe(activityData.action.toLowerCase().trim());
      expect(activity.description).toBe(activityData.description?.trim());
      expect(activity.resource).toBe(activityData.resource?.toLowerCase().trim());
      expect(activity.resourceId).toBe(activityData.resourceId);
      expect(activity.metadata).toEqual(activityData.metadata);
      expect(activity.ipAddress).toBe(activityData.ipAddress?.trim());
      expect(activity.userAgent).toBe(activityData.userAgent?.trim());
      expect(activity.sessionId).toBe(activityData.sessionId);
      expect(activity.id).toBeDefined();
      expect(activity.createdAt).toBeInstanceOf(Date);
    });

    it('should create user activity with default values using factory method', () => {
      const activityData = {
        userId: testUserIds.validUser1,
        type: 'login',
        action: 'success'
      };

      const activity = UserActivity.create(activityData);

      expect(activity.userId).toBe(activityData.userId);
      expect(activity.type).toBe(activityData.type.toLowerCase().trim());
      expect(activity.action).toBe(activityData.action.toLowerCase().trim());
      expect(activity.description).toBeUndefined();
      expect(activity.resource).toBeUndefined();
      expect(activity.resourceId).toBeUndefined();
      expect(activity.metadata).toBeUndefined();
      expect(activity.ipAddress).toBeUndefined();
      expect(activity.userAgent).toBeUndefined();
      expect(activity.sessionId).toBeUndefined();
      expect(activity.id).toBeDefined();
      expect(activity.createdAt).toBeInstanceOf(Date);
    });

    it('should trim and normalize string fields', () => {
      const activityData = {
        userId: testUserIds.validUser1,
        type: '  LOGIN  ',
        action: '  SUCCESS  ',
        description: '  User logged in successfully  ',
        resource: '  AUTHENTICATION  ',
        ipAddress: '  192.168.1.1  ',
        userAgent: '  Mozilla/5.0  '
      };

      const activity = UserActivity.create(activityData);

      expect(activity.type).toBe('login');
      expect(activity.action).toBe('success');
      expect(activity.description).toBe('User logged in successfully');
      expect(activity.resource).toBe('authentication');
      expect(activity.ipAddress).toBe('192.168.1.1');
      expect(activity.userAgent).toBe('Mozilla/5.0');
    });
  });

  describe('Business Logic Methods', () => {
    let activity: UserActivity;

    beforeEach(() => {
      activity = createTestUserActivity();
    });

    describe('updateDescription', () => {
      it('should update description and return new activity instance', () => {
        const newDescription = 'Updated description';
        const updatedActivity = activity.updateDescription(newDescription);

        expect(updatedActivity.description).toBe(newDescription.trim());
        expect(updatedActivity.id).toBe(activity.id);
        expect(updatedActivity.userId).toBe(activity.userId);
        expect(updatedActivity.type).toBe(activity.type);
        expect(updatedActivity.action).toBe(activity.action);
        expect(updatedActivity.createdAt).toBe(activity.createdAt);
      });

      it('should trim description', () => {
        const newDescription = '  Updated description  ';
        const updatedActivity = activity.updateDescription(newDescription);

        expect(updatedActivity.description).toBe('Updated description');
      });
    });

    describe('updateMetadata', () => {
      it('should update metadata and return new activity instance', () => {
        const newMetadata = { updated: true, reason: 'test' };
        const updatedActivity = activity.updateMetadata(newMetadata);

        expect(updatedActivity.metadata).toEqual({ ...activity.metadata, ...newMetadata });
        expect(updatedActivity.id).toBe(activity.id);
        expect(updatedActivity.userId).toBe(activity.userId);
        expect(updatedActivity.type).toBe(activity.type);
        expect(updatedActivity.action).toBe(activity.action);
        expect(updatedActivity.createdAt).toBe(activity.createdAt);
      });
    });
  });

  describe('Business Validation Methods', () => {
    let activity: UserActivity;

    beforeEach(() => {
      activity = createTestUserActivity();
    });

    describe('isAuthenticationActivity', () => {
      it('should return true for authentication activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const logoutActivity = createTestUserActivity({ type: 'logout' });
        const registerActivity = createTestUserActivity({ type: 'register' });
        const passwordResetActivity = createTestUserActivity({ type: 'password_reset' });
        const mfaSetupActivity = createTestUserActivity({ type: 'mfa_setup' });

        expect(loginActivity.isAuthenticationActivity()).toBe(true);
        expect(logoutActivity.isAuthenticationActivity()).toBe(true);
        expect(registerActivity.isAuthenticationActivity()).toBe(true);
        expect(passwordResetActivity.isAuthenticationActivity()).toBe(true);
        expect(mfaSetupActivity.isAuthenticationActivity()).toBe(true);
      });

      it('should return false for non-authentication activity types', () => {
        const profileActivity = createTestUserActivity({ type: 'profile_update' });
        const settingsActivity = createTestUserActivity({ type: 'settings_update' });

        expect(profileActivity.isAuthenticationActivity()).toBe(false);
        expect(settingsActivity.isAuthenticationActivity()).toBe(false);
      });
    });

    describe('isProfileActivity', () => {
      it('should return true for profile activity types', () => {
        const profileUpdateActivity = createTestUserActivity({ type: 'profile_update' });
        const avatarUploadActivity = createTestUserActivity({ type: 'avatar_upload' });
        const profileViewActivity = createTestUserActivity({ type: 'profile_view' });

        expect(profileUpdateActivity.isProfileActivity()).toBe(true);
        expect(avatarUploadActivity.isProfileActivity()).toBe(true);
        expect(profileViewActivity.isProfileActivity()).toBe(true);
      });

      it('should return false for non-profile activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const settingsActivity = createTestUserActivity({ type: 'settings_update' });

        expect(loginActivity.isProfileActivity()).toBe(false);
        expect(settingsActivity.isProfileActivity()).toBe(false);
      });
    });

    describe('isSettingsActivity', () => {
      it('should return true for settings activity types', () => {
        const settingsUpdateActivity = createTestUserActivity({ type: 'settings_update' });
        const preferenceChangeActivity = createTestUserActivity({ type: 'preference_change' });
        const securityUpdateActivity = createTestUserActivity({ type: 'security_update' });

        expect(settingsUpdateActivity.isSettingsActivity()).toBe(true);
        expect(preferenceChangeActivity.isSettingsActivity()).toBe(true);
        expect(securityUpdateActivity.isSettingsActivity()).toBe(true);
      });

      it('should return false for non-settings activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const profileActivity = createTestUserActivity({ type: 'profile_update' });

        expect(loginActivity.isSettingsActivity()).toBe(false);
        expect(profileActivity.isSettingsActivity()).toBe(false);
      });
    });

    describe('isRoleActivity', () => {
      it('should return true for role activity types', () => {
        const roleAssignActivity = createTestUserActivity({ type: 'role_assign' });
        const roleRevokeActivity = createTestUserActivity({ type: 'role_revoke' });
        const permissionChangeActivity = createTestUserActivity({ type: 'permission_change' });

        expect(roleAssignActivity.isRoleActivity()).toBe(true);
        expect(roleRevokeActivity.isRoleActivity()).toBe(true);
        expect(permissionChangeActivity.isRoleActivity()).toBe(true);
      });

      it('should return false for non-role activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const profileActivity = createTestUserActivity({ type: 'profile_update' });

        expect(loginActivity.isRoleActivity()).toBe(false);
        expect(profileActivity.isRoleActivity()).toBe(false);
      });
    });

    describe('isSystemActivity', () => {
      it('should return true for system activity types', () => {
        const systemLoginActivity = createTestUserActivity({ type: 'system_login' });
        const adminActionActivity = createTestUserActivity({ type: 'admin_action' });
        const systemConfigActivity = createTestUserActivity({ type: 'system_config' });

        expect(systemLoginActivity.isSystemActivity()).toBe(true);
        expect(adminActionActivity.isSystemActivity()).toBe(true);
        expect(systemConfigActivity.isSystemActivity()).toBe(true);
      });

      it('should return false for non-system activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const profileActivity = createTestUserActivity({ type: 'profile_update' });

        expect(loginActivity.isSystemActivity()).toBe(false);
        expect(profileActivity.isSystemActivity()).toBe(false);
      });
    });

    describe('isSecurityActivity', () => {
      it('should return true for security activity types', () => {
        const loginAttemptActivity = createTestUserActivity({ type: 'login_attempt' });
        const passwordChangeActivity = createTestUserActivity({ type: 'password_change' });
        const mfaVerifyActivity = createTestUserActivity({ type: 'mfa_verify' });
        const accountLockActivity = createTestUserActivity({ type: 'account_lock' });

        expect(loginAttemptActivity.isSecurityActivity()).toBe(true);
        expect(passwordChangeActivity.isSecurityActivity()).toBe(true);
        expect(mfaVerifyActivity.isSecurityActivity()).toBe(true);
        expect(accountLockActivity.isSecurityActivity()).toBe(true);
      });

      it('should return false for non-security activity types', () => {
        const loginActivity = createTestUserActivity({ type: 'login' });
        const profileActivity = createTestUserActivity({ type: 'profile_update' });

        expect(loginActivity.isSecurityActivity()).toBe(false);
        expect(profileActivity.isSecurityActivity()).toBe(false);
      });
    });

    describe('isRecent', () => {
      it('should return true for recent activity', () => {
        const recentActivity = createTestUserActivity({
          createdAt: new Date() // Current time
        });

        expect(recentActivity.isRecent(60)).toBe(true); // Within 60 minutes
      });

      it('should return false for old activity', () => {
        const oldActivity = createTestUserActivity({
          createdAt: createPastDate(120) // 2 hours ago
        });

        expect(oldActivity.isRecent(60)).toBe(false); // Not within 60 minutes
      });

      it('should use default minutes when not provided', () => {
        const recentActivity = createTestUserActivity({
          createdAt: new Date() // Current time
        });

        expect(recentActivity.isRecent()).toBe(true); // Within default 60 minutes
      });
    });

    describe('isToday', () => {
      it('should return true for activity created today', () => {
        const todayActivity = createTestUserActivity({
          createdAt: new Date() // Current time
        });

        expect(todayActivity.isToday()).toBe(true);
      });

      it('should return false for activity created yesterday', () => {
        const yesterdayActivity = createTestUserActivity({
          createdAt: createPastDate(1) // Yesterday
        });

        expect(yesterdayActivity.isToday()).toBe(false);
      });

      it('should return false for activity created tomorrow', () => {
        const tomorrowActivity = createTestUserActivity({
          createdAt: createFutureDate(1) // Tomorrow
        });

        expect(tomorrowActivity.isToday()).toBe(false);
      });
    });

    describe('isThisWeek', () => {
      it('should return true for activity created this week', () => {
        const thisWeekActivity = createTestUserActivity({
          createdAt: new Date() // Current time
        });

        expect(thisWeekActivity.isThisWeek()).toBe(true);
      });

      it('should return false for activity created last week', () => {
        const lastWeekActivity = createTestUserActivity({
          createdAt: createPastDate(8) // 8 days ago
        });

        expect(lastWeekActivity.isThisWeek()).toBe(false);
      });
    });

    describe('isThisMonth', () => {
      it('should return true for activity created this month', () => {
        const thisMonthActivity = createTestUserActivity({
          createdAt: new Date() // Current time
        });

        expect(thisMonthActivity.isThisMonth()).toBe(true);
      });

      it('should return false for activity created last month', () => {
        const lastMonthActivity = createTestUserActivity({
          createdAt: createPastDate(35) // 35 days ago
        });

        expect(lastMonthActivity.isThisMonth()).toBe(false);
      });
    });
  });

  describe('Static Factory Methods', () => {
    describe('createLoginActivity', () => {
      it('should create a login activity with success=true', () => {
        const loginActivity = UserActivity.createLoginActivity({
          userId: testUserIds.validUser1,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          sessionId: '123e4567-e89b-12d3-a456-426614174141',
          success: true,
          metadata: { device: 'mobile' }
        });

        expect(loginActivity.userId).toBe(testUserIds.validUser1);
        expect(loginActivity.type).toBe('login');
        expect(loginActivity.action).toBe('success');
        expect(loginActivity.description).toBe('User logged in successfully');
        expect(loginActivity.resource).toBe('authentication');
        expect(loginActivity.metadata).toEqual({ success: true, device: 'mobile' });
        expect(loginActivity.ipAddress).toBe('192.168.1.1');
        expect(loginActivity.userAgent).toBe('Mozilla/5.0');
        expect(loginActivity.sessionId).toBe('123e4567-e89b-12d3-a456-426614174141');
      });

      it('should create a login activity with success=false', () => {
        const loginActivity = UserActivity.createLoginActivity({
          userId: testUserIds.validUser1,
          success: false
        });

        expect(loginActivity.type).toBe('login');
        expect(loginActivity.action).toBe('failed');
        expect(loginActivity.description).toBe('User login attempt failed');
        expect(loginActivity.resource).toBe('authentication');
        expect(loginActivity.metadata).toEqual({ success: false });
      });
    });

    describe('createLogoutActivity', () => {
      it('should create a logout activity', () => {
        const logoutActivity = UserActivity.createLogoutActivity({
          userId: testUserIds.validUser1,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          sessionId: '123e4567-e89b-12d3-a456-426614174141',
          metadata: { device: 'mobile' }
        });

        expect(logoutActivity.userId).toBe(testUserIds.validUser1);
        expect(logoutActivity.type).toBe('logout');
        expect(logoutActivity.action).toBe('success');
        expect(logoutActivity.description).toBe('User logged out');
        expect(logoutActivity.resource).toBe('authentication');
        expect(logoutActivity.metadata).toEqual({ device: 'mobile' });
        expect(logoutActivity.ipAddress).toBe('192.168.1.1');
        expect(logoutActivity.userAgent).toBe('Mozilla/5.0');
        expect(logoutActivity.sessionId).toBe('123e4567-e89b-12d3-a456-426614174141');
      });
    });

    describe('createProfileUpdateActivity', () => {
      it('should create a profile update activity', () => {
        const profileUpdateActivity = UserActivity.createProfileUpdateActivity({
          userId: testUserIds.validUser1,
          fieldsUpdated: ['firstName', 'lastName'],
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { reason: 'user_request' }
        });

        expect(profileUpdateActivity.userId).toBe(testUserIds.validUser1);
        expect(profileUpdateActivity.type).toBe('profile_update');
        expect(profileUpdateActivity.action).toBe('update');
        expect(profileUpdateActivity.description).toBe('User updated profile: firstName, lastName');
        expect(profileUpdateActivity.resource).toBe('profile');
        expect(profileUpdateActivity.metadata).toEqual({
          fieldsUpdated: ['firstName', 'lastName'],
          reason: 'user_request'
        });
        expect(profileUpdateActivity.ipAddress).toBe('192.168.1.1');
        expect(profileUpdateActivity.userAgent).toBe('Mozilla/5.0');
      });
    });

    describe('createAvatarUploadActivity', () => {
      it('should create an avatar upload activity', () => {
        const avatarUploadActivity = UserActivity.createAvatarUploadActivity({
          userId: testUserIds.validUser1,
          fileName: 'avatar.jpg',
          fileSize: 1024000,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { device: 'mobile' }
        });

        expect(avatarUploadActivity.userId).toBe(testUserIds.validUser1);
        expect(avatarUploadActivity.type).toBe('avatar_upload');
        expect(avatarUploadActivity.action).toBe('upload');
        expect(avatarUploadActivity.description).toBe('User uploaded avatar: avatar.jpg');
        expect(avatarUploadActivity.resource).toBe('avatar');
        expect(avatarUploadActivity.metadata).toEqual({
          fileName: 'avatar.jpg',
          fileSize: 1024000,
          device: 'mobile'
        });
        expect(avatarUploadActivity.ipAddress).toBe('192.168.1.1');
        expect(avatarUploadActivity.userAgent).toBe('Mozilla/5.0');
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid user activity', () => {
        const activity = createTestUserActivity();
        const result = activity.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid user activity', () => {
        const invalidActivity = new UserActivity(
          'invalid-id',
          testUserIds.validUser1,
          '', // Empty type is invalid
          '', // Empty action is invalid
          'a'.repeat(1001), // Description too long
          'a'.repeat(256), // Resource too long
          'invalid-uuid', // Invalid resource ID
          'not-an-object' as any, // Invalid metadata type
          'a'.repeat(46), // IP address too long
          'a'.repeat(1001), // User agent too long
          'invalid-uuid', // Invalid session ID
          'invalid-date' as any // Invalid created date
        );

        const result = invalidActivity.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const activityData = {
          userId: testUserIds.validUser1,
          type: 'login',
          action: 'success',
          description: 'User logged in successfully',
          resource: 'authentication',
          resourceId: '123e4567-e89b-12d3-a456-426614174111',
          metadata: { success: true },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: '123e4567-e89b-12d3-a456-426614174141'
        };

        const result = UserActivity.validateCreate(activityData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid', // Invalid UUID
          type: '', // Empty type is invalid
          action: '', // Empty action is invalid
          description: 'a'.repeat(1001), // Too long
          resource: 'a'.repeat(256), // Too long
          resourceId: 'invalid-uuid', // Invalid UUID
          metadata: 'not-an-object' as any, // Invalid type
          ipAddress: 'a'.repeat(46), // Too long
          userAgent: 'a'.repeat(1001), // Too long
          sessionId: 'invalid-uuid' // Invalid UUID
        };

        const result = UserActivity.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let activity: UserActivity;

    beforeEach(() => {
      activity = createTestUserActivity();
    });

    describe('toJSON', () => {
      it('should return activity object with all properties', () => {
        const json = activity.toJSON();

        expect(json).toEqual({
          id: activity.id,
          userId: activity.userId,
          type: activity.type,
          action: activity.action,
          description: activity.description,
          resource: activity.resource,
          resourceId: activity.resourceId,
          metadata: activity.metadata,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          sessionId: activity.sessionId,
          createdAt: activity.createdAt
        });
      });
    });
  });
});