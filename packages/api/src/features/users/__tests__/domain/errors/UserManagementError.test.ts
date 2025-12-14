import { describe, it, expect } from 'vitest';
import {
  UserProfileNotFoundError,
  UserSettingsNotFoundError,
  InvalidUserProfileError,
  InvalidUserSettingsError,
  AvatarUploadError,
  InvalidAvatarFormatError,
  AvatarTooLargeError,
  UserRoleNotFoundError,
  RoleAssignmentError,
  PermissionDeniedError,
  UserActivityNotFoundError,
  DuplicateProfileError,
  DuplicateSettingsError
} from '../../../domain/errors/UserManagementError';
import { testUserIds, testRoleIds, testActivityIds } from '../../utils/testFixtures.test';

describe('UserManagementError', () => {
  describe('UserProfileNotFoundError', () => {
    it('should create error with correct message and code', () => {
      const error = new UserProfileNotFoundError(testUserIds.validUser1);

      expect(error.message).toBe(`User profile with ID ${testUserIds.validUser1} not found`);
      expect(error.code).toBe('USER_PROFILE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserProfileNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new UserProfileNotFoundError(testUserIds.validUser1);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new UserProfileNotFoundError(testUserIds.validUser1);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('UserSettingsNotFoundError', () => {
    it('should create error with correct message and code', () => {
      const error = new UserSettingsNotFoundError(testUserIds.validUser1);

      expect(error.message).toBe(`User settings with ID ${testUserIds.validUser1} not found`);
      expect(error.code).toBe('USER_SETTINGS_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserSettingsNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new UserSettingsNotFoundError(testUserIds.validUser1);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new UserSettingsNotFoundError(testUserIds.validUser1);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('InvalidUserProfileError', () => {
    it('should create error with correct message and code', () => {
      const errorMessage = 'Invalid email format';
      const error = new InvalidUserProfileError(errorMessage);

      expect(error.message).toBe(`Invalid user profile: ${errorMessage}`);
      expect(error.code).toBe('INVALID_USER_PROFILE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('InvalidUserProfileError');
    });

    it('should be instance of Error', () => {
      const error = new InvalidUserProfileError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new InvalidUserProfileError('test error');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('InvalidUserSettingsError', () => {
    it('should create error with correct message and code', () => {
      const errorMessage = 'Invalid theme value';
      const error = new InvalidUserSettingsError(errorMessage);

      expect(error.message).toBe(`Invalid user settings: ${errorMessage}`);
      expect(error.code).toBe('INVALID_USER_SETTINGS');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('InvalidUserSettingsError');
    });

    it('should be instance of Error', () => {
      const error = new InvalidUserSettingsError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new InvalidUserSettingsError('test error');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('AvatarUploadError', () => {
    it('should create error with correct message and code', () => {
      const errorMessage = 'File upload failed';
      const error = new AvatarUploadError(errorMessage);

      expect(error.message).toBe(`Avatar upload failed: ${errorMessage}`);
      expect(error.code).toBe('AVATAR_UPLOAD_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AvatarUploadError');
    });

    it('should be instance of Error', () => {
      const error = new AvatarUploadError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new AvatarUploadError('test error');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('InvalidAvatarFormatError', () => {
    it('should create error with correct message and code', () => {
      const format = 'bmp';
      const error = new InvalidAvatarFormatError(format);

      expect(error.message).toBe(`Invalid avatar format: ${format}. Supported formats: jpg, jpeg, png, webp`);
      expect(error.code).toBe('INVALID_AVATAR_FORMAT');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('InvalidAvatarFormatError');
    });

    it('should be instance of Error', () => {
      const error = new InvalidAvatarFormatError('jpg');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new InvalidAvatarFormatError('jpg');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('AvatarTooLargeError', () => {
    it('should create error with correct message and code', () => {
      const size = 10485760; // 10MB
      const maxSize = 5242880; // 5MB
      const error = new AvatarTooLargeError(size, maxSize);

      expect(error.message).toBe(`Avatar size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`);
      expect(error.code).toBe('AVATAR_TOO_LARGE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AvatarTooLargeError');
    });

    it('should be instance of Error', () => {
      const error = new AvatarTooLargeError(1000000, 5000000);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new AvatarTooLargeError(1000000, 5000000);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('UserRoleNotFoundError', () => {
    it('should create error with correct message and code', () => {
      const error = new UserRoleNotFoundError(testRoleIds.adminRole);

      expect(error.message).toBe(`User role with ID ${testRoleIds.adminRole} not found`);
      expect(error.code).toBe('USER_ROLE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserRoleNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new UserRoleNotFoundError(testRoleIds.adminRole);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new UserRoleNotFoundError(testRoleIds.adminRole);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('RoleAssignmentError', () => {
    it('should create error with correct message and code', () => {
      const errorMessage = 'User already has this role';
      const error = new RoleAssignmentError(errorMessage);

      expect(error.message).toBe(`Role assignment failed: ${errorMessage}`);
      expect(error.code).toBe('ROLE_ASSIGNMENT_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('RoleAssignmentError');
    });

    it('should be instance of Error', () => {
      const error = new RoleAssignmentError('test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new RoleAssignmentError('test error');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('PermissionDeniedError', () => {
    it('should create error with correct message and code', () => {
      const permission = 'admin:users';
      const error = new PermissionDeniedError(permission);

      expect(error.message).toBe(`Permission denied: ${permission}`);
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('PermissionDeniedError');
    });

    it('should be instance of Error', () => {
      const error = new PermissionDeniedError('admin:users');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new PermissionDeniedError('admin:users');

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('UserActivityNotFoundError', () => {
    it('should create error with correct message and code', () => {
      const error = new UserActivityNotFoundError(testActivityIds.activity1);

      expect(error.message).toBe(`User activity with ID ${testActivityIds.activity1} not found`);
      expect(error.code).toBe('USER_ACTIVITY_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserActivityNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new UserActivityNotFoundError(testActivityIds.activity1);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new UserActivityNotFoundError(testActivityIds.activity1);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('DuplicateProfileError', () => {
    it('should create error with correct message and code', () => {
      const error = new DuplicateProfileError(testUserIds.validUser1);

      expect(error.message).toBe(`User profile for user ID ${testUserIds.validUser1} already exists`);
      expect(error.code).toBe('DUPLICATE_PROFILE');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('DuplicateProfileError');
    });

    it('should be instance of Error', () => {
      const error = new DuplicateProfileError(testUserIds.validUser1);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new DuplicateProfileError(testUserIds.validUser1);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('DuplicateSettingsError', () => {
    it('should create error with correct message and code', () => {
      const error = new DuplicateSettingsError(testUserIds.validUser1);

      expect(error.message).toBe(`User settings for user ID ${testUserIds.validUser1} already exists`);
      expect(error.code).toBe('DUPLICATE_SETTINGS');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('DuplicateSettingsError');
    });

    it('should be instance of Error', () => {
      const error = new DuplicateSettingsError(testUserIds.validUser1);

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of DomainError', () => {
      const error = new DuplicateSettingsError(testUserIds.validUser1);

      expect(error.constructor.name).toBe('DomainError');
    });
  });

  describe('Error Inheritance and Type Checking', () => {
    it('should all errors be instances of Error', () => {
      const errors = [
        new UserProfileNotFoundError(testUserIds.validUser1),
        new UserSettingsNotFoundError(testUserIds.validUser1),
        new InvalidUserProfileError('test'),
        new InvalidUserSettingsError('test'),
        new AvatarUploadError('test'),
        new InvalidAvatarFormatError('jpg'),
        new AvatarTooLargeError(1000000, 5000000),
        new UserRoleNotFoundError(testRoleIds.adminRole),
        new RoleAssignmentError('test'),
        new PermissionDeniedError('admin:users'),
        new UserActivityNotFoundError(testActivityIds.activity1),
        new DuplicateProfileError(testUserIds.validUser1),
        new DuplicateSettingsError(testUserIds.validUser1)
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should all errors have correct structure', () => {
      const errors = [
        new UserProfileNotFoundError(testUserIds.validUser1),
        new UserSettingsNotFoundError(testUserIds.validUser1),
        new InvalidUserProfileError('test'),
        new InvalidUserSettingsError('test'),
        new AvatarUploadError('test'),
        new InvalidAvatarFormatError('jpg'),
        new AvatarTooLargeError(1000000, 5000000),
        new UserRoleNotFoundError(testRoleIds.adminRole),
        new RoleAssignmentError('test'),
        new PermissionDeniedError('admin:users'),
        new UserActivityNotFoundError(testActivityIds.activity1),
        new DuplicateProfileError(testUserIds.validUser1),
        new DuplicateSettingsError(testUserIds.validUser1)
      ];

      errors.forEach(error => {
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('statusCode');
        expect(error).toHaveProperty('name');
        expect(typeof error.message).toBe('string');
        expect(typeof error.code).toBe('string');
        expect(typeof error.statusCode).toBe('number');
        expect(typeof error.name).toBe('string');
      });
    });

    it('should all errors have appropriate status codes', () => {
      const notFoundErrors = [
        new UserProfileNotFoundError(testUserIds.validUser1),
        new UserSettingsNotFoundError(testUserIds.validUser1),
        new UserRoleNotFoundError(testRoleIds.adminRole),
        new UserActivityNotFoundError(testActivityIds.activity1)
      ];

      const badRequestErrors = [
        new InvalidUserProfileError('test'),
        new InvalidUserSettingsError('test'),
        new AvatarUploadError('test'),
        new InvalidAvatarFormatError('jpg'),
        new AvatarTooLargeError(1000000, 5000000),
        new RoleAssignmentError('test'),
        new PermissionDeniedError('admin:users')
      ];

      const conflictErrors = [
        new DuplicateProfileError(testUserIds.validUser1),
        new DuplicateSettingsError(testUserIds.validUser1)
      ];

      notFoundErrors.forEach(error => {
        expect(error.statusCode).toBe(404);
      });

      badRequestErrors.forEach(error => {
        expect(error.statusCode).toBe(400);
      });

      conflictErrors.forEach(error => {
        expect(error.statusCode).toBe(409);
      });
    });
  });
});