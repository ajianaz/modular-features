import { vi, expect } from 'vitest';
import { IUserProfileRepository, IUserSettingsRepository, IUserRoleRepository, IUserActivityRepository } from '../../domain/interfaces';
import { UserProfile, UserSettings, UserRole, UserActivity, UserRoleAssignment } from '../../domain/entities';
import { FileStorageProvider } from '../../infrastructure/lib/FileStorageProvider';

// Mock repository factory functions
export const createMockUserProfileRepository = () => {
  return {
    // CRUD operations
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),

    // Query operations
    findAll: vi.fn(),
    findByEmail: vi.fn(),
    findByPhone: vi.fn(),
    findByName: vi.fn(),
    findByLocation: vi.fn(),

    // Search operations
    search: vi.fn(),
    searchByDisplayName: vi.fn(),

    // Existence checks
    existsById: vi.fn(),
    existsByUserId: vi.fn(),
    existsByEmail: vi.fn(),
    existsByPhone: vi.fn(),

    // Batch operations
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),

    // Count operations
    count: vi.fn(),
    countByLocation: vi.fn(),
    countByDateRange: vi.fn(),

    // Advanced queries
    findWithFilters: vi.fn(),

    // Profile completion and statistics
    findIncompleteProfiles: vi.fn(),
    findProfilesWithoutAvatar: vi.fn(),
    findProfilesWithoutPhone: vi.fn(),
    findProfilesWithUnverifiedPhone: vi.fn(),

    // Recent activity
    findRecentlyUpdated: vi.fn(),
    findRecentlyCreated: vi.fn()
  } as unknown as IUserProfileRepository;
};

export const createMockUserSettingsRepository = () => {
  return {
    // CRUD operations
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),

    // Query operations
    findAll: vi.fn(),
    findByTheme: vi.fn(),
    findByLanguage: vi.fn(),
    findByTimezone: vi.fn(),

    // Filter operations
    findByNotificationSettings: vi.fn(),
    findBySecuritySettings: vi.fn(),
    findByPrivacySettings: vi.fn(),

    // Existence checks
    existsById: vi.fn(),
    existsByUserId: vi.fn(),

    // Batch operations
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),

    // Count operations
    count: vi.fn(),
    countByTheme: vi.fn(),
    countByLanguage: vi.fn(),
    countByTimezone: vi.fn(),
    countWithTwoFactorEnabled: vi.fn(),
    countWithMarketingEmails: vi.fn(),

    // Advanced queries
    findWithFilters: vi.fn(),

    // Security and privacy focused queries
    findUsersWithTwoFactorDisabled: vi.fn(),
    findUsersWithLongSessionTimeout: vi.fn(),
    findUsersWithPublicProfiles: vi.fn(),
    findUsersWithPrivateProfiles: vi.fn(),
    findUsersWithMarketingEmailsEnabled: vi.fn(),
    findUsersWithAllNotificationsEnabled: vi.fn(),
    findUsersWithAllNotificationsDisabled: vi.fn(),

    // Recent activity
    findRecentlyUpdated: vi.fn(),
    findRecentlyCreated: vi.fn(),

    // Settings analytics
    getThemeDistribution: vi.fn(),
    getLanguageDistribution: vi.fn(),
    getTimezoneDistribution: vi.fn(),
    getNotificationSettingsSummary: vi.fn(),
    getSecuritySettingsSummary: vi.fn(),
    getPrivacySettingsSummary: vi.fn()
  } as unknown as IUserSettingsRepository;
};

export const createMockUserRoleRepository = () => {
  return {
    // Role CRUD operations
    findRoleById: vi.fn(),
    findRoleByName: vi.fn(),
    findAllRoles: vi.fn(),
    findActiveRoles: vi.fn(),
    findSystemRoles: vi.fn(),
    findCustomRoles: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),

    // Role query operations
    findRolesByLevel: vi.fn(),
    findRolesWithPermission: vi.fn(),
    findRolesWithAnyPermission: vi.fn(),
    findRolesWithAllPermissions: vi.fn(),

    // Role existence checks
    roleExistsById: vi.fn(),
    roleExistsByName: vi.fn(),

    // Role batch operations
    createRoles: vi.fn(),
    updateRoles: vi.fn(),
    deleteRoles: vi.fn(),

    // Role count operations
    countRoles: vi.fn(),
    countActiveRoles: vi.fn(),
    countSystemRoles: vi.fn(),
    countCustomRoles: vi.fn(),
    countRolesByLevel: vi.fn(),

    // Role Assignment CRUD operations
    findAssignmentById: vi.fn(),
    findAssignmentsByUserId: vi.fn(),
    findAssignmentsByRoleId: vi.fn(),
    findActiveAssignmentsByUserId: vi.fn(),
    findActiveAssignmentsByRoleId: vi.fn(),
    findExpiredAssignments: vi.fn(),
    findAllAssignments: vi.fn(),
    createAssignment: vi.fn(),
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),

    // Role Assignment query operations
    findAssignmentsByAssignedBy: vi.fn(),
    findTemporaryAssignments: vi.fn(),
    findPermanentAssignments: vi.fn(),
    findAssignmentsExpiringBefore: vi.fn(),
    findAssignmentsExpiringAfter: vi.fn(),

    // Role Assignment existence checks
    assignmentExistsById: vi.fn(),
    assignmentExists: vi.fn(),
    activeAssignmentExists: vi.fn(),

    // Role Assignment batch operations
    createAssignments: vi.fn(),
    updateAssignments: vi.fn(),
    deleteAssignments: vi.fn(),
    deleteAssignmentsByUserId: vi.fn(),
    deleteAssignmentsByRoleId: vi.fn(),
    deleteExpiredAssignments: vi.fn(),

    // Role Assignment count operations
    countAssignments: vi.fn(),
    countActiveAssignments: vi.fn(),
    countExpiredAssignments: vi.fn(),
    countAssignmentsByUserId: vi.fn(),
    countAssignmentsByRoleId: vi.fn(),
    countTemporaryAssignments: vi.fn(),
    countPermanentAssignments: vi.fn(),

    // User role operations
    getUserRoles: vi.fn(),
    getUserActiveRoles: vi.fn(),
    getUserPermissions: vi.fn(),
    getUserHighestRoleLevel: vi.fn(),
    hasUserRole: vi.fn(),
    hasUserPermission: vi.fn(),
    hasUserAnyPermission: vi.fn(),
    hasUserAllPermissions: vi.fn(),

    // Permission operations
    getAllPermissions: vi.fn(),
    getPermissionCategories: vi.fn(),
    getPermissionsByCategory: vi.fn(),

    // Role hierarchy operations
    getRoleHierarchy: vi.fn(),
    getRolesAboveLevel: vi.fn(),
    getRolesBelowLevel: vi.fn(),

    // Analytics and reporting
    getRoleUsageStatistics: vi.fn(),
    getPermissionUsageStatistics: vi.fn(),
    getAssignmentTrends: vi.fn(),

    // Search operations
    searchRoles: vi.fn(),
    searchAssignments: vi.fn(),

    // Recent activity
    findRecentlyCreatedRoles: vi.fn(),
    findRecentlyUpdatedRoles: vi.fn(),
    findRecentlyCreatedAssignments: vi.fn(),
    findRecentlyUpdatedAssignments: vi.fn()
  } as unknown as IUserRoleRepository;
};

export const createMockUserActivityRepository = () => {
  return {
    // CRUD operations
    findById: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    deleteByUserId: vi.fn(),

    // Query operations
    findByUserId: vi.fn(),
    findByType: vi.fn(),
    findByAction: vi.fn(),
    findByResource: vi.fn(),
    findByResourceId: vi.fn(),
    findBySessionId: vi.fn(),
    findByIpAddress: vi.fn(),

    // Time-based queries
    findByDateRange: vi.fn(),
    findByUserIdAndDateRange: vi.fn(),
    findRecent: vi.fn(),
    findRecentByUserId: vi.fn(),
    findToday: vi.fn(),
    findTodayByUserId: vi.fn(),
    findThisWeek: vi.fn(),
    findThisWeekByUserId: vi.fn(),
    findThisMonth: vi.fn(),
    findThisMonthByUserId: vi.fn(),

    // Combined filter queries
    findWithFilters: vi.fn(),

    // Activity type specific queries
    findAuthenticationActivities: vi.fn(),
    findAuthenticationActivitiesByUserId: vi.fn(),
    findProfileActivities: vi.fn(),
    findProfileActivitiesByUserId: vi.fn(),
    findSettingsActivities: vi.fn(),
    findSettingsActivitiesByUserId: vi.fn(),
    findRoleActivities: vi.fn(),
    findRoleActivitiesByUserId: vi.fn(),
    findSystemActivities: vi.fn(),
    findSecurityActivities: vi.fn(),
    findSecurityActivitiesByUserId: vi.fn(),

    // Search operations
    search: vi.fn(),
    searchByDescription: vi.fn(),
    searchByUserId: vi.fn(),

    // Count operations
    count: vi.fn(),
    countByUserId: vi.fn(),
    countByType: vi.fn(),
    countByAction: vi.fn(),
    countByResource: vi.fn(),
    countByDateRange: vi.fn(),
    countByUserIdAndDateRange: vi.fn(),
    countRecent: vi.fn(),
    countRecentByUserId: vi.fn(),
    countToday: vi.fn(),
    countTodayByUserId: vi.fn(),
    countThisWeek: vi.fn(),
    countThisWeekByUserId: vi.fn(),
    countThisMonth: vi.fn(),
    countThisMonthByUserId: vi.fn(),

    // Activity analytics
    getActivitySummary: vi.fn(),
    getActivityTrends: vi.fn(),
    getTopActivities: vi.fn(),
    getTopActivitiesByUserId: vi.fn(),
    getTopResources: vi.fn(),
    getTopResourcesByUserId: vi.fn(),

    // User activity patterns
    getUserActivityPatterns: vi.fn(),

    // Security and fraud detection
    findSuspiciousActivities: vi.fn(),
    findSuspiciousActivitiesByUserId: vi.fn(),
    findFailedLoginAttempts: vi.fn(),
    findMultipleIpAddresses: vi.fn(),
    findUnusualLoginTimes: vi.fn(),

    // Data retention and cleanup
    deleteOlderThan: vi.fn(),
    deleteByUserIdOlderThan: vi.fn(),

    // Batch operations for analytics
    getActivityCountsByUser: vi.fn(),
    getLastActivityDates: vi.fn(),

    // Export and reporting
    exportActivities: vi.fn(),

    // Existence checks
    existsById: vi.fn(),
    existsByUserId: vi.fn(),

    // Recent activity for specific entities
    findRecentActivitiesForResource: vi.fn(),
    findRecentActivitiesForUser: vi.fn()
  } as unknown as IUserActivityRepository;
};

// Mock FileStorageProvider
export const createMockFileStorageProvider = () => {
  return {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    validateFile: vi.fn(),
    getFileExtension: vi.fn(),
    processImage: vi.fn(),
    uploadToCloudStorage: vi.fn()
  } as any;
};

// Mock Hono Context
export const createMockContext = (overrides: any = {}) => {
  const defaultContext = {
    req: {
      param: vi.fn(),
      query: vi.fn(),
      header: vi.fn(),
      body: vi.fn(),
      json: vi.fn()
    },
    json: vi.fn(),
    text: vi.fn(),
    blob: vi.fn(),
    status: vi.fn(),
    redirect: vi.fn(),
    header: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    env: {},
    executionCtx: {},
    event: {},
    finalized: false
  };

  return { ...defaultContext, ...overrides };
};

// Mock request data
export const createMockRequest = (overrides: any = {}) => {
  const defaultRequest = {
    method: 'GET',
    url: '/api/users/profile',
    headers: new Headers(),
    body: null,
    query: {},
    params: {}
  };

  return { ...defaultRequest, ...overrides };
};

// Test helper functions
export const expectValidationError = (result: any, expectedErrorFields: string[]) => {
  expect(result.success).toBe(false);
  expect(result.message).toContain('Validation error');

  expectedErrorFields.forEach(field => {
    expect(result.message).toContain(field);
  });
};

export const expectSuccessResponse = (result: any, expectedData?: any) => {
  expect(result.success).toBe(true);
  if (expectedData) {
    expect(result.data).toEqual(expectedData);
  }
};

export const expectErrorResponse = (result: any, expectedErrorMessage?: string) => {
  expect(result.success).toBe(false);
  if (expectedErrorMessage) {
    expect(result.message).toContain(expectedErrorMessage);
  }
};

// Date helpers for testing
export const createDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0) => {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

export const createPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0); // Normalize to start of day
  return date;
};

export const createFutureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(23, 59, 59, 999); // Normalize to end of day
  return date;
};

// Async test helpers
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Repository setup helpers
export const setupUserProfileRepository = (repository: IUserProfileRepository, profiles: Record<string, UserProfile>) => {
  (repository.findByUserId as any).mockImplementation((userId: string) => {
    return Promise.resolve(profiles[userId] || null);
  });

  (repository.findById as any).mockImplementation((id: string) => {
    const profile = Object.values(profiles).find(p => p.id === id);
    return Promise.resolve(profile || null);
  });

  (repository.create as any).mockImplementation((profile: UserProfile) => {
    return Promise.resolve(profile);
  });

  (repository.update as any).mockImplementation((profile: UserProfile) => {
    return Promise.resolve(profile);
  });
};

export const setupUserSettingsRepository = (repository: IUserSettingsRepository, settings: Record<string, UserSettings>) => {
  (repository.findByUserId as any).mockImplementation((userId: string) => {
    return Promise.resolve(settings[userId] || null);
  });

  (repository.findById as any).mockImplementation((id: string) => {
    const setting = Object.values(settings).find(s => s.id === id);
    return Promise.resolve(setting || null);
  });

  (repository.create as any).mockImplementation((setting: UserSettings) => {
    return Promise.resolve(setting);
  });

  (repository.update as any).mockImplementation((setting: UserSettings) => {
    return Promise.resolve(setting);
  });
};

export const setupUserRoleRepository = (repository: IUserRoleRepository, roles: Record<string, UserRole>, assignments: UserRoleAssignment[] = []) => {
  (repository.findRoleById as any).mockImplementation((id: string) => {
    return Promise.resolve(roles[id] || null);
  });

  (repository.findRoleByName as any).mockImplementation((name: string) => {
    const role = Object.values(roles).find(r => r.name === name);
    return Promise.resolve(role || null);
  });

  (repository.findAllRoles as any).mockImplementation(() => {
    return Promise.resolve(Object.values(roles));
  });

  (repository.findActiveAssignmentsByUserId as any).mockImplementation((userId: string) => {
    return Promise.resolve(assignments.filter(a => a.userId === userId && a.isActive));
  });

  (repository.createRole as any).mockImplementation((role: UserRole) => {
    return Promise.resolve(role);
  });

  (repository.updateRole as any).mockImplementation((role: UserRole) => {
    return Promise.resolve(role);
  });
};

export const setupUserActivityRepository = (repository: IUserActivityRepository, activities: Record<string, UserActivity>) => {
  (repository.findById as any).mockImplementation((id: string) => {
    return Promise.resolve(activities[id] || null);
  });

  (repository.findByUserId as any).mockImplementation((userId: string) => {
    const userActivities = Object.values(activities).filter(a => a.userId === userId);
    return Promise.resolve(userActivities);
  });

  (repository.findRecentByUserId as any).mockImplementation((userId: string, hours: number, limit?: number) => {
    const userActivities = Object.values(activities)
      .filter(a => a.userId === userId)
      .filter(a => a.isRecent(hours * 60)) // Convert hours to minutes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit || 10);
    return Promise.resolve(userActivities);
  });

  (repository.create as any).mockImplementation((activity: UserActivity) => {
    return Promise.resolve(activity);
  });
};

// File storage provider setup
export const setupFileStorageProvider = (provider: FileStorageProvider, uploadResults: Record<string, string> = {}) => {
  (provider.uploadFile as any).mockImplementation((file: File) => {
    const fileName = file.name;
    const mockUrl = uploadResults[fileName] || `https://example.com/uploads/${fileName}`;
    return Promise.resolve(mockUrl);
  });

  (provider.deleteFile as any).mockImplementation((fileUrl: string) => {
    return Promise.resolve(true);
  });
};

// Test data generators
export const generateTestUsers = (count: number) => {
  const users: UserProfile[] = [];

  for (let i = 1; i <= count; i++) {
    users.push(UserProfile.create({
      userId: `123e4567-e89b-12d3-a456-426614174${i.toString().padStart(3, '0')}`,
      firstName: `User${i}`,
      lastName: `Test${i}`,
      displayName: `User${i} Test${i}`,
      bio: `Test user ${i} bio`,
      website: `https://user${i}.example.com`,
      location: `City${i}, Country`,
      timezone: 'UTC',
      language: 'en',
      gender: 'prefer_not_to_say' as const,
      dateOfBirth: new Date(`199${i % 10}-01-01`),
      phoneNumber: `+123456789${i}`,
      isPhoneVerified: i % 2 === 0,
      socialLinks: {
        twitter: `@user${i}`,
        github: `user${i}`
      },
      preferences: {
        theme: i % 2 === 0 ? 'dark' : 'light',
        notifications: i % 3 === 0
      },
      avatarUrl: `https://example.com/avatars/user${i}.jpg`,
      isEmailVerified: i % 2 === 0
    }));
  }

  return users;
};

export const generateTestActivities = (userId: string, count: number) => {
  const activities: UserActivity[] = [];
  const types = ['login', 'logout', 'profile_update', 'settings_update', 'avatar_upload'];
  const actions = ['success', 'failed', 'update', 'upload'];

  for (let i = 1; i <= count; i++) {
    const type = types[i % types.length];
    const action = actions[i % actions.length];

    activities.push(UserActivity.create({
      userId,
      type: type as string,
      action: action as string,
      description: `Test activity ${i}: ${type} ${action}`,
      resource: type,
      resourceId: `123e4567-e89b-12d3-a456-426614174${i.toString().padStart(3, '0')}`,
      metadata: {
        test: true,
        index: i
      },
      ipAddress: `192.168.1.${i % 255}`,
      userAgent: `Test Agent ${i}`,
      sessionId: `123e4567-e89b-12d3-a456-426614174${i.toString().padStart(3, '0')}`
    }));
  }

  return activities;
};

// Validation helpers
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};