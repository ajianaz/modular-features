import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  jsonb,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'
import { subscriptionPlans } from './subscriptions.schema'

// Quota Type enum
export const quotaTypeEnum = pgEnum('quota_type', [
  'api_calls',
  'storage',
  'bandwidth',
  'requests',
  'messages',
  'files',
  'teams',
  'projects',
  'custom'
])

// Quota Period enum
export const quotaPeriodEnum = pgEnum('quota_period', [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
  'lifetime'
])

// Quota Reset Strategy enum
export const quotaResetStrategyEnum = pgEnum('quota_reset_strategy', [
  'fixed',
  'rolling',
  'calendar',
  'manual'
])

// Quota Limits table - Define usage limits
export const quotaLimits = pgTable('quota_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: quotaTypeEnum('type').notNull(),
  description: text('description'),
  period: quotaPeriodEnum('period').notNull(),
  resetStrategy: quotaResetStrategyEnum('reset_strategy').default('calendar').notNull(),
  defaultLimit: integer('default_limit').notNull(), // Default limit for free tier
  limitsByPlan: jsonb('limits_by_plan'), // Plan-specific limits { planId: limit }
  isHardLimit: boolean('is_hard_limit').default(true).notNull(), // Block when exceeded
  allowOverage: boolean('allow_overage').default(false).notNull(),
  overageRate: decimal('overage_rate', { precision: 8, scale: 4 }), // Cost per unit over limit
  gracePeriodMinutes: integer('grace_period_minutes').default(0), // Grace period before blocking
  warningThreshold: integer('warning_threshold').default(80), // Percentage for warning
  criticalThreshold: integer('critical_threshold').default(95), // Percentage for critical alert
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'), // Additional quota metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_quota_limits_slug').on(table.slug),
  typeIdx: index('idx_quota_limits_type').on(table.type),
  periodIdx: index('idx_quota_limits_period').on(table.period),
  isActiveIdx: index('idx_quota_limits_is_active').on(table.isActive),
  createdAtIdx: index('idx_quota_limits_created_at').on(table.createdAt),
}))

// User Quota Limits table - User-specific quota overrides
export const userQuotaLimits = pgTable('user_quota_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  limit: integer('limit').notNull(),
  overrideReason: varchar('override_reason', { length: 500 }), // Why limit was overridden
  expiresAt: timestamp('expires_at'), // When override expires
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'), // Additional user quota metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_quota_limits_user_id').on(table.userId),
  quotaIdIdx: index('idx_user_quota_limits_quota_id').on(table.quotaId),
  isActiveIdx: index('idx_user_quota_limits_is_active').on(table.isActive),
  expiresAtIdx: index('idx_user_quota_limits_expires_at').on(table.expiresAt),
  uniqueUserQuota: index('idx_user_quota_limits_unique').on(table.userId, table.quotaId),
}))

// Usage Tracking table - Track real-time usage
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  usage: integer('usage').default(0).notNull(), // Current usage amount
  limit: integer('limit').notNull(), // Current limit
  period: quotaPeriodEnum('period').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  nextResetAt: timestamp('next_reset_at').notNull(), // When usage will reset
  lastUsedAt: timestamp('last_used_at'),
  warningSent: boolean('warning_sent').default(false).notNull(),
  criticalSent: boolean('critical_sent').default(false).notNull(),
  blockSent: boolean('block_sent').default(false).notNull(),
  overageAmount: integer('overage_amount').default(0), // Usage over limit
  overageCost: decimal('overage_cost', { precision: 10, scale: 2 }).default('0.00'), // Cost of overage
  metadata: jsonb('metadata'), // Additional usage metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_usage_tracking_user_id').on(table.userId),
  quotaIdIdx: index('idx_usage_tracking_quota_id').on(table.quotaId),
  periodIdx: index('idx_usage_tracking_period').on(table.period),
  periodStartIdx: index('idx_usage_tracking_period_start').on(table.periodStart),
  periodEndIdx: index('idx_usage_tracking_period_end').on(table.periodEnd),
  nextResetAtIdx: index('idx_usage_tracking_next_reset_at').on(table.nextResetAt),
  lastUsedAtIdx: index('idx_usage_tracking_last_used_at').on(table.lastUsedAt),
  warningSentIdx: index('idx_usage_tracking_warning_sent').on(table.warningSent),
  criticalSentIdx: index('idx_usage_tracking_critical_sent').on(table.criticalSent),
  blockSentIdx: index('idx_usage_tracking_block_sent').on(table.blockSent),
  uniqueUserQuotaPeriod: index('idx_usage_tracking_unique').on(table.userId, table.quotaId, table.period, table.periodStart),
}))

// Usage Events table - Track individual usage events
export const usageEvents = pgTable('usage_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // consume, release, reset, etc.
  amount: integer('amount').notNull(), // Positive for consumption, negative for release
  previousUsage: integer('previous_usage').notNull(),
  newUsage: integer('new_usage').notNull(),
  limit: integer('limit').notNull(),
  resource: varchar('resource', { length: 255 }), // API endpoint, file type, etc.
  resourceId: varchar('resource_id', { length: 255 }), // Specific resource identifier
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 255 }), // Request correlation ID
  sessionId: uuid('session_id'), // User session if available
  wasBlocked: boolean('was_blocked').default(false).notNull(), // Whether request was blocked
  blockReason: varchar('block_reason', { length: 255 }), // Why it was blocked
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0.00'), // Cost of usage
  metadata: jsonb('metadata'), // Additional event metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_usage_events_user_id').on(table.userId),
  quotaIdIdx: index('idx_usage_events_quota_id').on(table.quotaId),
  eventTypeIdx: index('idx_usage_events_event_type').on(table.eventType),
  amountIdx: index('idx_usage_events_amount').on(table.amount),
  resourceIdx: index('idx_usage_events_resource').on(table.resource),
  resourceIdIdx: index('idx_usage_events_resource_id').on(table.resourceId),
  ipAddressIdx: index('idx_usage_events_ip_address').on(table.ipAddress),
  requestIdIdx: index('idx_usage_events_request_id').on(table.requestId),
  wasBlockedIdx: index('idx_usage_events_was_blocked').on(table.wasBlocked),
  costIdx: index('idx_usage_events_cost').on(table.cost),
  createdAtIdx: index('idx_usage_events_created_at').on(table.createdAt),
  userQuotaCreatedAtIdx: index('idx_usage_events_user_quota_created_at').on(table.userId, table.quotaId, table.createdAt),
}))

// Quota Plans table - Quota templates for plans
export const quotaPlans = pgTable('quota_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  limit: integer('limit').notNull(),
  overridePeriod: quotaPeriodEnum('override_period'), // Override default period
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'), // Additional plan quota metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  planIdIdx: index('idx_quota_plans_plan_id').on(table.planId),
  quotaIdIdx: index('idx_quota_plans_quota_id').on(table.quotaId),
  isActiveIdx: index('idx_quota_plans_is_active').on(table.isActive),
  uniquePlanQuota: index('idx_quota_plans_unique').on(table.planId, table.quotaId),
}))

// Quota Alerts table - Alert configurations and history
export const quotaAlerts = pgTable('quota_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  alertType: varchar('alert_type', { length: 50 }).notNull(), // warning, critical, exceeded, etc.
  thresholdPercent: integer('threshold_percent'), // Percentage threshold
  currentValue: integer('current_value').notNull(),
  limitValue: integer('limit_value').notNull(),
  message: text('message').notNull(),
  channels: jsonb('channels'), // Channels to send alert through
  sentAt: timestamp('sent_at'),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedAt: timestamp('resolved_at'),
  requiresAction: boolean('requires_action').default(false).notNull(),
  actionTaken: varchar('action_taken', { length: 500 }), // What action was taken
  metadata: jsonb('metadata'), // Additional alert metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_quota_alerts_user_id').on(table.userId),
  quotaIdIdx: index('idx_quota_alerts_quota_id').on(table.quotaId),
  alertTypeIdx: index('idx_quota_alerts_alert_type').on(table.alertType),
  thresholdPercentIdx: index('idx_quota_alerts_threshold_percent').on(table.thresholdPercent),
  sentAtIdx: index('idx_quota_alerts_sent_at').on(table.sentAt),
  acknowledgedAtIdx: index('idx_quota_alerts_acknowledged_at').on(table.acknowledgedAt),
  resolvedAtIdx: index('idx_quota_alerts_resolved_at').on(table.resolvedAt),
  requiresActionIdx: index('idx_quota_alerts_requires_action').on(table.requiresAction),
  createdAtIdx: index('idx_quota_alerts_created_at').on(table.createdAt),
}))

// Quota Requests table - Request for quota increases
export const quotaRequests = pgTable('quota_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  requestedLimit: integer('requested_limit').notNull(),
  currentLimit: integer('current_limit').notNull(),
  reason: varchar('reason', { length: 1000 }).notNull(),
  justification: text('justification'),
  urgency: varchar('urgency', { length: 20, enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  status: varchar('status', { length: 20, enum: ['pending', 'approved', 'rejected', 'cancelled'] }).default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 255 }).references(() => users.id, { onDelete: 'set null' }),
  reviewComment: text('review_comment'),
  approvedLimit: integer('approved_limit'), // Limit that was approved
  temporary: boolean('temporary').default(false).notNull(), // Temporary increase?
  expiresAt: timestamp('expires_at'), // When temporary increase expires
  metadata: jsonb('metadata'), // Additional request metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  cancelledAt: timestamp('cancelled_at'),
}, (table) => ({
  userIdIdx: index('idx_quota_requests_user_id').on(table.userId),
  quotaIdIdx: index('idx_quota_requests_quota_id').on(table.quotaId),
  statusIdx: index('idx_quota_requests_status').on(table.status),
  urgencyIdx: index('idx_quota_requests_urgency').on(table.urgency),
  reviewedByIdx: index('idx_quota_requests_reviewed_by').on(table.reviewedBy),
  temporaryIdx: index('idx_quota_requests_temporary').on(table.temporary),
  expiresAtIdx: index('idx_quota_requests_expires_at').on(table.expiresAt),
  createdAtIdx: index('idx_quota_requests_created_at').on(table.createdAt),
  reviewedAtIdx: index('idx_quota_requests_reviewed_at').on(table.reviewedAt),
  approvedAtIdx: index('idx_quota_requests_approved_at').on(table.approvedAt),
  rejectedAtIdx: index('idx_quota_requests_rejected_at').on(table.rejectedAt),
}))

// Quota History table - Historical quota usage data
export const quotaHistory = pgTable('quota_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quotaId: uuid('quota_id').references(() => quotaLimits.id, { onDelete: 'cascade' }).notNull(),
  period: quotaPeriodEnum('period').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalUsage: integer('total_usage').default(0).notNull(),
  limit: integer('limit').notNull(),
  peakUsage: integer('peak_usage').default(0).notNull(),
  overageAmount: integer('overage_amount').default(0),
  overageCost: decimal('overage_cost', { precision: 10, scale: 2 }).default('0.00'),
  blockedEvents: integer('blocked_events').default(0),
  alertCount: integer('alert_count').default(0),
  metadata: jsonb('metadata'), // Additional history metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_quota_history_user_id').on(table.userId),
  quotaIdIdx: index('idx_quota_history_quota_id').on(table.quotaId),
  periodIdx: index('idx_quota_history_period').on(table.period),
  periodStartIdx: index('idx_quota_history_period_start').on(table.periodStart),
  periodEndIdx: index('idx_quota_history_period_end').on(table.periodEnd),
  totalUsageIdx: index('idx_quota_history_total_usage').on(table.totalUsage),
  blockedEventsIdx: index('idx_quota_history_blocked_events').on(table.blockedEvents),
  createdAtIdx: index('idx_quota_history_created_at').on(table.createdAt),
  uniqueUserQuotaPeriod: index('idx_quota_history_unique').on(table.userId, table.quotaId, table.period, table.periodStart),
}))

// Types
export type QuotaLimit = typeof quotaLimits.$inferSelect
export type NewQuotaLimit = typeof quotaLimits.$inferInsert
export type UserQuotaLimit = typeof userQuotaLimits.$inferSelect
export type NewUserQuotaLimit = typeof userQuotaLimits.$inferInsert
export type UsageTracking = typeof usageTracking.$inferSelect
export type NewUsageTracking = typeof usageTracking.$inferInsert
export type UsageEvent = typeof usageEvents.$inferSelect
export type NewUsageEvent = typeof usageEvents.$inferInsert
export type QuotaPlan = typeof quotaPlans.$inferSelect
export type NewQuotaPlan = typeof quotaPlans.$inferInsert
export type QuotaAlert = typeof quotaAlerts.$inferSelect
export type NewQuotaAlert = typeof quotaAlerts.$inferInsert
export type QuotaRequest = typeof quotaRequests.$inferSelect
export type NewQuotaRequest = typeof quotaRequests.$inferInsert
export type QuotaHistory = typeof quotaHistory.$inferSelect
export type NewQuotaHistory = typeof quotaHistory.$inferInsert
