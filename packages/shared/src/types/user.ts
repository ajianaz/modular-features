import { z } from 'zod'
import { BaseEntity, EntityStatus } from './base'
import { Address, PhoneNumber } from './domain'

// User domain types
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user' | 'guest'
export type AuthProvider = 'email' | 'google' | 'github' | 'microsoft' | 'facebook' | 'linkedin'

// User interface
export interface User extends BaseEntity {
  email: string
  name: string
  username?: string | null
  avatar?: string | null
  status: UserStatus
  role: UserRole
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: Date | null
  lastActiveAt?: Date | null
  passwordChangedAt?: Date | null
  authProvider?: AuthProvider
  externalId?: string | null
  metadata?: Record<string, any> | null
}

// User schema for validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending_verification']),
  role: z.enum(['super_admin', 'admin', 'moderator', 'user', 'guest']),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  lastLoginAt: z.date().nullable().optional(),
  lastActiveAt: z.date().nullable().optional(),
  passwordChangedAt: z.date().nullable().optional(),
  authProvider: z.enum(['email', 'google', 'github', 'microsoft', 'facebook', 'linkedin']).optional(),
  externalId: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Profile interface
export interface UserProfile extends BaseEntity {
  userId: string
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  bio?: string | null
  phone?: string | null
  birthday?: Date | null
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  timezone?: string | null
  language?: string | null
  country?: string | null
  website?: string | null
  social?: {
    twitter?: string | null
    linkedin?: string | null
    github?: string | null
    facebook?: string | null
  } | null
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
  } | null
  isPhoneVerified: boolean
  metadata?: Record<string, any> | null
}

// User Profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(100).nullable().optional(),
  lastName: z.string().min(1).max(100).nullable().optional(),
  displayName: z.string().min(1).max(255).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/).nullable().optional(),
  birthday: z.date().nullable().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
  timezone: z.string().nullable().optional(),
  language: z.string().length(2).nullable().optional(),
  country: z.string().length(2).nullable().optional(),
  website: z.string().url().nullable().optional(),
  social: z.object({
    twitter: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    github: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
  }).nullable().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    marketingEmails: z.boolean().default(false),
  }).nullable().optional(),
  isPhoneVerified: z.boolean(),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Settings interface
export interface UserSettings extends BaseEntity {
  userId: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  twoFactorEnabled: boolean
  sessionTimeout: number
  autoSaveDrafts: boolean
  showOnlineStatus: boolean
  profileVisibility: 'public' | 'friends' | 'private'
  allowDirectMessages: boolean
  allowTagging: boolean
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  metadata?: Record<string, any> | null
}

// User Settings schema
export const UserSettingsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('YYYY-MM-DD'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  currency: z.string().length(3).default('USD'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(168).default(24), // hours
  autoSaveDrafts: z.boolean().default(true),
  showOnlineStatus: z.boolean().default(true),
  profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
  allowDirectMessages: z.boolean().default(true),
  allowTagging: z.boolean().default(true),
  passwordMinLength: z.number().min(6).max(128).default(8),
  passwordRequireSpecialChars: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireUppercase: z.boolean().default(true),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Role interface
export interface UserRoleDefinition extends BaseEntity {
  name: string
  displayName: string
  description?: string | null
  level: number
  permissions: string[]
  isSystem: boolean
  isActive: boolean
  metadata?: Record<string, any> | null
}

// User Role schema
export const UserRoleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  level: z.number().min(0).max(100),
  permissions: z.array(z.string()),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Role Assignment interface
export interface UserRoleAssignment extends BaseEntity {
  userId: string
  roleId: string
  assignedBy?: string | null
  assignedAt?: Date | null
  expiresAt?: Date | null
  isActive: boolean
  metadata?: Record<string, any> | null
}

// User Role Assignment schema
export const UserRoleAssignmentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  assignedBy: z.string().uuid().nullable().optional(),
  assignedAt: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Activity interface
export interface UserActivity extends BaseEntity {
  userId: string
  type: string
  description?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  location?: {
    country?: string | null
    city?: string | null
    region?: string | null
  } | null
  metadata?: Record<string, any> | null
}

// User Activity schema
export const UserActivitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  type: z.string().min(1).max(100),
  description: z.string().max(1000).nullable().optional(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  location: z.object({
    country: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
  }).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Statistics interface
export interface UserStats extends BaseEntity {
  userId: string
  loginCount: number
  lastLoginAt?: Date | null
  sessionDuration: number // in seconds
  requestCount: number
  storageUsed: number // in bytes
  apiCalls: number
  notificationsSent: number
  notificationsRead: number
  metadata?: Record<string, any> | null
}

// User Stats schema
export const UserStatsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  loginCount: z.number().default(0),
  lastLoginAt: z.date().nullable().optional(),
  sessionDuration: z.number().default(0),
  requestCount: z.number().default(0),
  storageUsed: z.number().default(0),
  apiCalls: z.number().default(0),
  notificationsSent: z.number().default(0),
  notificationsRead: z.number().default(0),
  metadata: z.record(z.any()).nullable().optional(),
})

// User Preferences interface (different from settings)
export interface UserPreferences extends BaseEntity {
  userId: string
  type: string
  data: Record<string, any>
  metadata?: Record<string, any> | null
}

// User Preferences schema
export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  type: z.string().min(1).max(100),
  data: z.record(z.any()),
  metadata: z.record(z.any()).nullable().optional(),
})

// Permission definitions
export const USER_PERMISSIONS = {
  // User management
  'users:read': 'View user profiles',
  'users:write': 'Edit own user profile',
  'users:delete': 'Delete own user account',
  'users:admin:read': 'View all user profiles',
  'users:admin:write': 'Edit any user profile',
  'users:admin:delete': 'Delete any user account',
  
  // Authentication
  'auth:login': 'Login to system',
  'auth:logout': 'Logout from system',
  'auth:register': 'Register new account',
  'auth:2fa:enable': 'Enable two-factor authentication',
  'auth:2fa:disable': 'Disable two-factor authentication',
  
  // Profile management
  'profile:view': 'View user profile',
  'profile:edit': 'Edit user profile',
  'profile:avatar:upload': 'Upload profile avatar',
  'profile:avatar:remove': 'Remove profile avatar',
  
  // Settings management
  'settings:view': 'View user settings',
  'settings:edit': 'Edit user settings',
  'settings:notifications': 'Manage notification preferences',
  
  // Activity tracking
  'activity:view': 'View user activity',
  'activity:export': 'Export user activity',
  
  // Statistics
  'stats:view': 'View user statistics',
  'stats:export': 'Export user statistics',
  
  // Admin permissions
  'admin:dashboard': 'Access admin dashboard',
  'admin:users': 'Manage all users',
  'admin:roles': 'Manage user roles',
  'admin:permissions': 'Manage permissions',
  'admin:system': 'System administration',
  
  // Super admin permissions
  'superadmin:everything': 'Full system access',
} as const

export type UserPermission = keyof typeof USER_PERMISSIONS

// Role definitions
export const DEFAULT_ROLES = {
  super_admin: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    level: 100,
    permissions: ['superadmin:everything'],
    isSystem: true,
  },
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    level: 80,
    permissions: [
      'admin:dashboard',
      'admin:users',
      'admin:roles',
      'admin:system',
      'users:admin:read',
      'users:admin:write',
    ],
    isSystem: true,
  },
  moderator: {
    name: 'moderator',
    displayName: 'Moderator',
    level: 60,
    permissions: [
      'users:admin:read',
      'activity:view',
      'activity:export',
    ],
    isSystem: true,
  },
  user: {
    name: 'user',
    displayName: 'User',
    level: 10,
    permissions: [
      'auth:login',
      'auth:logout',
      'auth:register',
      'auth:2fa:enable',
      'auth:2fa:disable',
      'profile:view',
      'profile:edit',
      'profile:avatar:upload',
      'profile:avatar:remove',
      'settings:view',
      'settings:edit',
      'settings:notifications',
      'activity:view',
      'stats:view',
    ],
    isSystem: true,
  },
  guest: {
    name: 'guest',
    displayName: 'Guest',
    level: 0,
    permissions: [
      'auth:login',
      'auth:register',
      'profile:view',
    ],
    isSystem: true,
  },
} as const

export type {
  User,
  UserStatus,
  UserRole,
  AuthProvider,
  UserProfile,
  UserSettings,
  UserRoleDefinition,
  UserRoleAssignment,
  UserActivity,
  UserStats,
  UserPreferences,
  UserPermission,
}
