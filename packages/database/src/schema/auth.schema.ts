import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  boolean,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core'

// Users table - Core user information
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 100 }).unique(),
  avatar: varchar('avatar', { length: 500 }),
  role: varchar('role', { length: 50, enum: ['user', 'admin', 'super_admin'] }).default('user').notNull(),
  status: varchar('status', { length: 20, enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  usernameIdx: index('idx_users_username').on(table.username),
  statusIdx: index('idx_users_status').on(table.status),
}))

// Sessions table - User session management
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  tokenIdx: index('idx_sessions_token').on(table.token),
  expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
}))

// OAuth Accounts table - External authentication providers
export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 50, enum: ['google', 'github', 'keycloak', 'microsoft'] }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: varchar('access_token', { length: 1000 }),
  refreshToken: varchar('refresh_token', { length: 1000 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  scopes: jsonb('scopes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_oauth_accounts_user_id').on(table.userId),
  providerIdx: index('idx_oauth_accounts_provider').on(table.provider),
  providerAccountIdIdx: index('idx_oauth_accounts_provider_account_id').on(table.providerAccountId),
  uniqueProviderAccount: index('idx_oauth_accounts_unique_provider_account').on(table.provider, table.providerAccountId),
}))

// Password Resets table - Password reset functionality
export const passwordResets = pgTable('password_resets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_password_resets_user_id').on(table.userId),
  tokenIdx: index('idx_password_resets_token').on(table.token),
  expiresAtIdx: index('idx_password_resets_expires_at').on(table.expiresAt),
}))

// Email Verifications table - Email verification functionality
export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_email_verifications_user_id').on(table.userId),
  emailIdx: index('idx_email_verifications_email').on(table.email),
  tokenIdx: index('idx_email_verifications_token').on(table.token),
  expiresAtIdx: index('idx_email_verifications_expires_at').on(table.expiresAt),
}))

// MFA Settings table - Multi-factor authentication
export const mfaSettings = pgTable('mfa_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isTotpEnabled: boolean('is_totp_enabled').default(false).notNull(),
  totpSecret: varchar('totp_secret', { length: 255 }),
  backupCodes: jsonb('backup_codes'), // Array of backup codes
  isSmsEnabled: boolean('is_sms_enabled').default(false).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  isEmailEnabled: boolean('is_email_enabled').default(false).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_mfa_settings_user_id').on(table.userId),
  totpSecretIdx: index('idx_mfa_settings_totp_secret').on(table.totpSecret),
}))

// Login Attempts table - Security monitoring
export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  failureReason: varchar('failure_reason', { length: 255 }), // e.g., 'invalid_password', 'user_not_found', 'account_locked'
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_login_attempts_email').on(table.email),
  ipAddressIdx: index('idx_login_attempts_ip_address').on(table.ipAddress),
  successIdx: index('idx_login_attempts_success').on(table.success),
  userIdIdx: index('idx_login_attempts_user_id').on(table.userId),
  createdAtIdx: index('idx_login_attempts_created_at').on(table.createdAt),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type OAuthAccount = typeof oauthAccounts.$inferSelect
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert
export type PasswordReset = typeof passwordResets.$inferSelect
export type NewPasswordReset = typeof passwordResets.$inferInsert
export type EmailVerification = typeof emailVerifications.$inferSelect
export type NewEmailVerification = typeof emailVerifications.$inferInsert
export type MfaSettings = typeof mfaSettings.$inferSelect
export type NewMfaSettings = typeof mfaSettings.$inferInsert
export type LoginAttempt = typeof loginAttempts.$inferSelect
export type NewLoginAttempt = typeof loginAttempts.$inferInsert
