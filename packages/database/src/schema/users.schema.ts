import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  jsonb,
  boolean,
  integer,
  decimal,
  date,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

// User Profiles table - Extended user information
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  displayName: varchar('display_name', { length: 255 }),
  bio: text('bio'),
  website: varchar('website', { length: 500 }),
  location: varchar('location', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  language: varchar('language', { length: 10 }).default('en'),
  gender: varchar('gender', { length: 20, enum: ['male', 'female', 'other', 'prefer_not_to_say'] }),
  dateOfBirth: date('date_of_birth'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
  socialLinks: jsonb('social_links'), // { twitter: '', linkedin: '', github: '' }
  preferences: jsonb('preferences'), // User-specific preferences
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_profiles_user_id').on(table.userId),
  firstNameIdx: index('idx_user_profiles_first_name').on(table.firstName),
  lastNameIdx: index('idx_user_profiles_last_name').on(table.lastName),
}))

// User Settings table - Application preferences
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  theme: varchar('theme', { length: 20, enum: ['light', 'dark', 'auto'] }).default('auto').notNull(),
  language: varchar('language', { length: 10 }).default('en').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  smsNotifications: boolean('sms_notifications').default(false).notNull(),
  marketingEmails: boolean('marketing_emails').default(false).notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  sessionTimeout: integer('session_timeout').default(24).notNull(), // hours
  autoSaveDrafts: boolean('auto_save_drafts').default(true).notNull(),
  showOnlineStatus: boolean('show_online_status').default(true).notNull(),
  profileVisibility: varchar('profile_visibility', { length: 20, enum: ['public', 'private', 'friends'] }).default('public').notNull(),
  customSettings: jsonb('custom_settings'), // Additional custom settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_settings_user_id').on(table.userId),
}))

// User Roles table - Role definitions
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  level: integer('level').default(0).notNull(), // Higher level = more permissions
  isSystem: boolean('is_system').default(false).notNull(), // System roles cannot be deleted
  permissions: jsonb('permissions'), // Array of permission strings
  metadata: jsonb('metadata'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_user_roles_name').on(table.name),
  levelIdx: index('idx_user_roles_level').on(table.level),
  isActiveIdx: index('idx_user_roles_is_active').on(table.isActive),
}))

// User Role Assignments table - Many-to-many relationship between users and roles
export const userRoleAssignments = pgTable('user_role_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => userRoles.id, { onDelete: 'cascade' }).notNull(),
  assignedBy: varchar('assigned_by', { length: 255 }).references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // For temporary role assignments
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_role_assignments_user_id').on(table.userId),
  roleIdIdx: index('idx_user_role_assignments_role_id').on(table.roleId),
  assignedByIdx: index('idx_user_role_assignments_assigned_by').on(table.assignedBy),
  expiresAtIdx: index('idx_user_role_assignments_expires_at').on(table.expiresAt),
  isActiveIdx: index('idx_user_role_assignments_is_active').on(table.isActive),
  uniqueUserRole: unique('unique_user_role_assignment').on(table.userId, table.roleId),
}))

// User Activity table - Track user activities
export const userActivity = pgTable('user_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // login, logout, update, delete, etc.
  action: varchar('action', { length: 100 }).notNull(), // Specific action performed
  description: text('description'),
  resource: varchar('resource', { length: 255 }), // Resource that was acted upon
  resourceId: varchar('resource_id', { length: 255 }), // ID of the resource
  metadata: jsonb('metadata'), // Additional data about the activity
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }), // Related session if available
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_activity_user_id').on(table.userId),
  typeIdx: index('idx_user_activity_type').on(table.type),
  actionIdx: index('idx_user_activity_action').on(table.action),
  createdAtIdx: index('idx_user_activity_created_at').on(table.createdAt),
  ipAddressIdx: index('idx_user_activity_ip_address').on(table.ipAddress),
  sessionIdIdx: index('idx_user_activity_session_id').on(table.sessionId),
}))

// User Stats table - User statistics and metrics
export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  loginCount: integer('login_count').default(0).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  lastActiveAt: timestamp('last_active_at'),
  totalOrders: integer('total_orders').default(0).notNull(),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0.00').notNull(),
  avgOrderValue: decimal('avg_order_value', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalSubscriptions: integer('total_subscriptions').default(0).notNull(),
  totalRefunds: integer('total_refunds').default(0).notNull(),
  accountAgeDays: integer('account_age_days').default(0).notNull(),
  storageUsed: integer('storage_used').default(0).notNull(), // bytes
  apiCallsThisMonth: integer('api_calls_this_month').default(0).notNull(),
  supportTickets: integer('support_tickets').default(0).notNull(),
  satisfactionScore: decimal('satisfaction_score', { precision: 3, scale: 2 }), // 0-100
  metadata: jsonb('metadata'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_stats_user_id').on(table.userId),
  loginCountIdx: index('idx_user_stats_login_count').on(table.loginCount),
  lastLoginAtIdx: index('idx_user_stats_last_login_at').on(table.lastLoginAt),
  lastActiveAtIdx: index('idx_user_stats_last_active_at').on(table.lastActiveAt),
}))

// User Preferences table - Fine-grained user preferences
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // notifications, privacy, security, etc.
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(), // Flexible value storage
  type: varchar('type', { length: 20, enum: ['string', 'number', 'boolean', 'object', 'array'] }).default('string').notNull(),
  isPublic: boolean('is_public').default(false).notNull(), // Can this preference be shared?
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_preferences_user_id').on(table.userId),
  categoryIdx: index('idx_user_preferences_category').on(table.category),
  keyIdx: index('idx_user_preferences_key').on(table.key),
  uniquePreference: unique('unique_user_preference').on(table.userId, table.category, table.key),
}))

// Types
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type UserSetting = typeof userSettings.$inferSelect
export type NewUserSetting = typeof userSettings.$inferInsert
export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert
export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect
export type NewUserRoleAssignment = typeof userRoleAssignments.$inferInsert
export type UserActivity = typeof userActivity.$inferSelect
export type NewUserActivity = typeof userActivity.$inferInsert
export type UserStats = typeof userStats.$inferSelect
export type NewUserStats = typeof userStats.$inferInsert
export type UserPreference = typeof userPreferences.$inferSelect
export type NewUserPreference = typeof userPreferences.$inferInsert
