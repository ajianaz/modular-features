
import { UserProfile, UserSettings, UserRole, UserActivity, UserRoleAssignment } from '../../domain/entities';

// Test data fixtures
export const testUserIds = {
  validUser1: '123e4567-e89b-12d3-a456-426614174001',
  validUser2: '123e4567-e89b-12d3-a456-426614174002',
  validUser3: '123e4567-e89b-12d3-a456-426614174003',
  nonExistentUser: '123e4567-e89b-12d3-a456-426614174999'
};

export const testRoleIds = {
  adminRole: '123e4567-e89b-12d3-a456-426614174101',
  userRole: '123e4567-e89b-12d3-a456-426614174102',
  moderatorRole: '123e4567-e89b-12d3-a456-426614174103',
  nonExistentRole: '123e4567-e89b-12d3-a456-426614174999'
};

export const testActivityIds = {
  activity1: '123e4567-e89b-12d3-a456-426614174201',
  activity2: '123e4567-e89b-12d3-a456-426614174202',
  activity3: '123e4567-e89b-12d3-a456-426614174203',
  nonExistentActivity: '123e4567-e89b-12d3-a456-426614174999'
};

// UserProfile fixtures
export const createTestUserProfile = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: '123e4567-e89b-12d3-a456-426614174111',
    userId: testUserIds.validUser1,
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    bio: 'Software developer passionate about clean code',
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    language: 'en',
    gender: 'male' as const,
    dateOfBirth: new Date('1990-01-15'),
    phoneNumber: '+1234567890',
    isPhoneVerified: true,
    socialLinks: {
      twitter: '@johndoe',
      github: 'johndoe',
      linkedin: 'johndoe'
    },
    preferences: {
      theme: 'dark',
      notifications: true
    },
    avatarUrl: 'https://example.com/avatars/johndoe.jpg',
    isEmailVerified: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  return UserProfile.create({ ...defaults, ...overrides });
};

export const createMinimalUserProfile = (userId: string = testUserIds.validUser1) => {
  return UserProfile.create({
    userId
  });
};

// UserSettings fixtures
export const createTestUserSettings = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: '123e4567-e89b-12d3-a456-426614174121',
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
    customSettings: {
      dashboardLayout: 'grid',
      defaultPageSize: 20
    },
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  return UserSettings.create({ ...defaults, ...overrides });
};

export const createMinimalUserSettings = (userId: string = testUserIds.validUser1) => {
  return UserSettings.create({
    userId
  });
};

// UserRole fixtures
export const createTestUserRole = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: testRoleIds.adminRole,
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    level: 100,
    isSystem: false,
    permissions: [
      'user:read',
      'user:write',
      'user:delete',
      'profile:read',
      'profile:write',
      'settings:read',
      'settings:write',
      'role:read',
      'role:write',
      'activity:read',
      'system:admin'
    ],
    metadata: {
      category: 'system',
      createdFor: 'internal_admins'
    },
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  return UserRole.create({ ...defaults, ...overrides });
};

export const createTestUserRoleAssignment = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: '123e4567-e89b-12d3-a456-426614174131',
    userId: testUserIds.validUser1,
    roleId: testRoleIds.adminRole,
    assignedBy: testUserIds.validUser2,
    assignedAt: new Date('2023-01-01T00:00:00.000Z'),
    expiresAt: new Date('2024-01-01T00:00:00.000Z'),
    isActive: true,
    metadata: {
      reason: 'Promotion to admin role',
      approvedBy: 'system'
    },
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  return UserRoleAssignment.create({ ...defaults, ...overrides });
};

// UserActivity fixtures
export const createTestUserActivity = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: testActivityIds.activity1,
    userId: testUserIds.validUser1,
    type: 'profile_update',
    action: 'update',
    description: 'User updated profile information',
    resource: 'profile',
    resourceId: '123e4567-e89b-12d3-a456-426614174111',
    metadata: {
      fieldsUpdated: ['firstName', 'lastName'],
      previousValues: { firstName: 'Old', lastName: 'Name' },
      newValues: { firstName: 'John', lastName: 'Doe' }
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: '123e4567-e89b-12d3-a456-426614174141',
    createdAt: new Date('2023-01-01T12:00:00.000Z')
  };

  return UserActivity.create({ ...defaults, ...overrides });
};

export const createTestLoginActivity = (overrides: Partial<any> = {}) => {
  return UserActivity.createLoginActivity({
    userId: testUserIds.validUser1,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: '123e4567-e89b-12d3-a456-426614174141',
    success: true,
    ...overrides
  });
};

export const createTestProfileUpdateActivity = (overrides: Partial<any> = {}) => {
  return UserActivity.createProfileUpdateActivity({
    userId: testUserIds.validUser1,
    fieldsUpdated: ['firstName', 'lastName'],
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ...overrides
  });
};

export const createTestAvatarUploadActivity = (overrides: Partial<any> = {}) => {
  return UserActivity.createAvatarUploadActivity({
    userId: testUserIds.validUser1,
    fileName: 'avatar.jpg',
    fileSize: 1024000,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ...overrides
  });
};

// Mock data for repositories
export const mockUserProfileData = {
  [testUserIds.validUser1]: createTestUserProfile(),
  [testUserIds.validUser2]: createTestUserProfile({ userId: testUserIds.validUser2, firstName: 'Jane', lastName: 'Smith' }),
  [testUserIds.validUser3]: createTestUserProfile({ userId: testUserIds.validUser3, firstName: 'Bob', lastName: 'Johnson' })
};

export const mockUserSettingsData = {
  [testUserIds.validUser1]: createTestUserSettings(),
  [testUserIds.validUser2]: createTestUserSettings({ userId: testUserIds.validUser2, theme: 'light' }),
  [testUserIds.validUser3]: createTestUserSettings({ userId: testUserIds.validUser3, theme: 'auto' })
};

export const mockUserRoleData = {
  [testRoleIds.adminRole]: createTestUserRole({ name: 'admin', displayName: 'Administrator', level: 100 }),
  [testRoleIds.userRole]: createTestUserRole({ id: testRoleIds.userRole, name: 'user', displayName: 'User', level: 10 }),
  [testRoleIds.moderatorRole]: createTestUserRole({ id: testRoleIds.moderatorRole, name: 'moderator', displayName: 'Moderator', level: 50 })
};

export const mockUserActivityData = {
  [testActivityIds.activity1]: createTestUserActivity(),
  [testActivityIds.activity2]: createTestUserActivity({ id: testActivityIds.activity2, type: 'login', action: 'success' }),
  [testActivityIds.activity3]: createTestUserActivity({ id: testActivityIds.activity3, type: 'settings_update', action: 'update' })
};

// Test file data for avatar upload
export const createTestFile = (overrides: Partial<any> = {}) => {
  const defaults = {
    name: 'test-avatar.jpg',
    type: 'image/jpeg',
    size: 1024000, // 1MB
    lastModified: Date.now(),
    arrayBuffer: async () => new ArrayBuffer(1024000),
    stream: () => new ReadableStream(),
    text: async () => 'test file content',
    slice: () => createTestFile()
  };

  return { ...defaults, ...overrides } as any;
};

export const createTestImageFile = (size: number = 1024000, type: string = 'image/jpeg') => {
  return createTestFile({
    name: `test-avatar.${type.split('/')[1]}`,
    type,
    size
  });
};

// Test request/response data
export const createTestGetUserProfileRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1,
    includeSettings: true,
    includeRoles: true,
    includeActivity: true,
    activityLimit: 10
  };

  return { ...defaults, ...overrides };
};

export const createTestUpdateUserProfileRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1,
    firstName: 'Updated',
    lastName: 'Name',
    displayName: 'Updated Name',
    bio: 'Updated bio',
    website: 'https://updated.dev',
    location: 'Updated Location',
    gender: 'male' as const,
    dateOfBirth: new Date('1990-01-15'),
    phoneNumber: '+1234567890',
    socialLinks: {
      twitter: '@updated',
      github: 'updated'
    },
    preferences: {
      theme: 'light'
    }
  };

  return { ...defaults, ...overrides };
};

export const createTestGetUserSettingsRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1
  };

  return { ...defaults, ...overrides };
};

export const createTestUpdateUserSettingsRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1,
    theme: 'light' as const,
    language: 'es',
    timezone: 'Europe/Madrid',
    emailNotifications: false,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorEnabled: true,
    sessionTimeout: 12,
    autoSaveDrafts: false,
    showOnlineStatus: false,
    profileVisibility: 'private' as const,
    customSettings: {
      dashboardLayout: 'list',
      defaultPageSize: 20
    }
  };
};
