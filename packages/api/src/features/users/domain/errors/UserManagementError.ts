import { DomainError } from '@modular-monolith/shared';

// User Management related errors
export class UserProfileNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User profile with ID ${userId} not found`, 'USER_PROFILE_NOT_FOUND', 404);
  }
}

export class UserSettingsNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User settings with ID ${userId} not found`, 'USER_SETTINGS_NOT_FOUND', 404);
  }
}

export class InvalidUserProfileError extends DomainError {
  constructor(message: string) {
    super(`Invalid user profile: ${message}`, 'INVALID_USER_PROFILE', 400);
  }
}

export class InvalidUserSettingsError extends DomainError {
  constructor(message: string) {
    super(`Invalid user settings: ${message}`, 'INVALID_USER_SETTINGS', 400);
  }
}

export class AvatarUploadError extends DomainError {
  constructor(message: string) {
    super(`Avatar upload failed: ${message}`, 'AVATAR_UPLOAD_ERROR', 400);
  }
}

export class InvalidAvatarFormatError extends DomainError {
  constructor(format: string) {
    super(`Invalid avatar format: ${format}. Supported formats: jpg, jpeg, png, webp`, 'INVALID_AVATAR_FORMAT', 400);
  }
}

export class AvatarTooLargeError extends DomainError {
  constructor(size: number, maxSize: number) {
    super(`Avatar size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`, 'AVATAR_TOO_LARGE', 400);
  }
}

export class UserRoleNotFoundError extends DomainError {
  constructor(roleId: string) {
    super(`User role with ID ${roleId} not found`, 'USER_ROLE_NOT_FOUND', 404);
  }
}

export class RoleAssignmentError extends DomainError {
  constructor(message: string) {
    super(`Role assignment failed: ${message}`, 'ROLE_ASSIGNMENT_ERROR', 400);
  }
}

export class PermissionDeniedError extends DomainError {
  constructor(permission: string) {
    super(`Permission denied: ${permission}`, 'PERMISSION_DENIED', 403);
  }
}

export class UserActivityNotFoundError extends DomainError {
  constructor(activityId: string) {
    super(`User activity with ID ${activityId} not found`, 'USER_ACTIVITY_NOT_FOUND', 404);
  }
}

export class DuplicateProfileError extends DomainError {
  constructor(userId: string) {
    super(`User profile for user ID ${userId} already exists`, 'DUPLICATE_PROFILE', 409);
  }
}

export class DuplicateSettingsError extends DomainError {
  constructor(userId: string) {
    super(`User settings for user ID ${userId} already exists`, 'DUPLICATE_SETTINGS', 409);
  }
}