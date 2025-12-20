import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  integer,
  jsonb,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

// Notification Type enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'success',
  'warning',
  'error',
  'system'
])

// Notification Channel enum
export const notificationChannelEnum = pgEnum('notification_channel', [
  'email',
  'sms',
  'push',
  'in_app',
  'webhook'
])

// Notification Status enum
export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'processing',
  'sent',
  'delivered',
  'failed',
  'cancelled'
])

// Notifications table - Main notification records
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  message: text('message').notNull(),
  channels: jsonb('channels'), // Array of channels to send through
  status: notificationStatusEnum('status').default('pending').notNull(),
  priority: varchar('priority', { length: 20, enum: ['low', 'normal', 'high', 'urgent'] }).default('normal').notNull(),
  templateId: varchar('template_id', { length: 255 }), // Reference to notification template
  scheduledFor: timestamp('scheduled_for'), // When to send notification
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  expiresAt: timestamp('expires_at'), // When notification expires
  metadata: jsonb('metadata'), // Additional notification data
  deliveryData: jsonb('delivery_data'), // Per-channel delivery info
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  lastError: text('last_error'), // Last error encountered
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_notifications_user_id').on(table.userId),
  typeIdx: index('idx_notifications_type').on(table.type),
  statusIdx: index('idx_notifications_status').on(table.status),
  priorityIdx: index('idx_notifications_priority').on(table.priority),
  templateIdIdx: index('idx_notifications_template_id').on(table.templateId),
  scheduledForIdx: index('idx_notifications_scheduled_for').on(table.scheduledFor),
  sentAtIdx: index('idx_notifications_sent_at').on(table.sentAt),
  deliveredAtIdx: index('idx_notifications_delivered_at').on(table.deliveredAt),
  readAtIdx: index('idx_notifications_read_at').on(table.readAt),
  expiresAtIdx: index('idx_notifications_expires_at').on(table.expiresAt),
  createdAtIdx: index('idx_notifications_created_at').on(table.createdAt),
}))

// Notification Templates table - Template definitions
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  subject: varchar('subject', { length: 500 }), // Email subject or push title
  template: text('template').notNull(), // Template with variables
  description: text('description'),
  variables: jsonb('variables'), // Template variables schema
  defaultValues: jsonb('default_values'), // Default variable values
  isSystem: boolean('is_system').default(false).notNull(), // System template (cannot be deleted)
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'), // Additional template data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_notification_templates_slug').on(table.slug),
  typeIdx: index('idx_notification_templates_type').on(table.type),
  channelIdx: index('idx_notification_templates_channel').on(table.channel),
  isActiveIdx: index('idx_notification_templates_is_active').on(table.isActive),
  isSystemIdx: index('idx_notification_templates_is_system').on(table.isSystem),
  createdAtIdx: index('idx_notification_templates_created_at').on(table.createdAt),
}))

// Notification Preferences table - User notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // Notification category
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  frequency: varchar('frequency', { length: 20, enum: ['immediate', 'hourly', 'daily', 'weekly'] }).default('immediate').notNull(),
  quietHoursEnabled: boolean('quiet_hours_enabled').default(false).notNull(),
  quietHoursStart: varchar('quiet_hours_start', { length: 5 }), // HH:MM format
  quietHoursEnd: varchar('quiet_hours_end', { length: 5 }), // HH:MM format
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  metadata: jsonb('metadata'), // Additional preference data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_notification_preferences_user_id').on(table.userId),
  typeIdx: index('idx_notification_preferences_type').on(table.type),
  frequencyIdx: index('idx_notification_preferences_frequency').on(table.frequency),
  quietHoursEnabledIdx: index('idx_notification_preferences_quiet_hours_enabled').on(table.quietHoursEnabled),
  uniqueUserType: index('idx_notification_preferences_unique').on(table.userId, table.type),
}))

// Notification Deliveries table - Track delivery attempts per channel
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').references(() => notifications.id, { onDelete: 'cascade' }).notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  recipient: varchar('recipient', { length: 500 }).notNull(), // Email, phone number, device token
  provider: varchar('provider', { length: 100 }), // SendGrid, Twilio, Firebase, etc.
  providerMessageId: varchar('provider_message_id', { length: 500 }), // External message ID
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'), // When user opened notification
  clickedAt: timestamp('clicked_at'), // When user clicked notification
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // Delivery-specific data
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  nextRetryAt: timestamp('next_retry_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  notificationIdIdx: index('idx_notification_deliveries_notification_id').on(table.notificationId),
  channelIdx: index('idx_notification_deliveries_channel').on(table.channel),
  statusIdx: index('idx_notification_deliveries_status').on(table.status),
  recipientIdx: index('idx_notification_deliveries_recipient').on(table.recipient),
  providerIdx: index('idx_notification_deliveries_provider').on(table.provider),
  providerMessageIdIdx: index('idx_notification_deliveries_provider_message_id').on(table.providerMessageId),
  sentAtIdx: index('idx_notification_deliveries_sent_at').on(table.sentAt),
  deliveredAtIdx: index('idx_notification_deliveries_delivered_at').on(table.deliveredAt),
  openedAtIdx: index('idx_notification_deliveries_opened_at').on(table.openedAt),
  clickedAtIdx: index('idx_notification_deliveries_clicked_at').on(table.clickedAt),
  failedAtIdx: index('idx_notification_deliveries_failed_at').on(table.failedAt),
  nextRetryAtIdx: index('idx_notification_deliveries_next_retry_at').on(table.nextRetryAt),
  createdAtIdx: index('idx_notification_deliveries_created_at').on(table.createdAt),
}))

// Notification Groups table - Group notifications for bulk operations
export const notificationGroups = pgTable('notification_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 100 }).notNull(), // Marketing, System, Transactional, etc.
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'), // Group-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_notification_groups_name').on(table.name),
  typeIdx: index('idx_notification_groups_type').on(table.type),
  isActiveIdx: index('idx_notification_groups_is_active').on(table.isActive),
  createdAtIdx: index('idx_notification_groups_created_at').on(table.createdAt),
}))

// Notification Recipients table - Track recipients in bulk notifications
export const notificationRecipients = pgTable('notification_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').references(() => notifications.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // Recipient-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  notificationIdIdx: index('idx_notification_recipients_notification_id').on(table.notificationId),
  userIdIdx: index('idx_notification_recipients_user_id').on(table.userId),
  statusIdx: index('idx_notification_recipients_status').on(table.status),
  sentAtIdx: index('idx_notification_recipients_sent_at').on(table.sentAt),
  deliveredAtIdx: index('idx_notification_recipients_delivered_at').on(table.deliveredAt),
  readAtIdx: index('idx_notification_recipients_read_at').on(table.readAt),
  openedAtIdx: index('idx_notification_recipients_opened_at').on(table.openedAt),
  clickedAtIdx: index('idx_notification_recipients_clicked_at').on(table.clickedAt),
  failedAtIdx: index('idx_notification_recipients_failed_at').on(table.failedAt),
  createdAtIdx: index('idx_notification_recipients_created_at').on(table.createdAt),
  uniqueNotificationUser: index('idx_notification_recipients_unique').on(table.notificationId, table.userId),
}))

// Notification Analytics table - Track notification performance metrics
export const notificationAnalytics = pgTable('notification_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').references(() => notifications.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50, enum: ['delivery', 'engagement', 'error'] }).notNull(),
  metric: varchar('metric', { length: 100 }).notNull(), // sent_rate, open_rate, click_rate, etc.
  value: varchar('value', { length: 50 }).notNull(), // Metric value
  count: integer('count').default(0).notNull(), // Sample count
  period: varchar('period', { length: 20 }).notNull(), // hour, day, week, month
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  metadata: jsonb('metadata'), // Analytics-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  notificationIdIdx: index('idx_notification_analytics_notification_id').on(table.notificationId),
  typeIdx: index('idx_notification_analytics_type').on(table.type),
  metricIdx: index('idx_notification_analytics_metric').on(table.metric),
  periodIdx: index('idx_notification_analytics_period').on(table.period),
  periodStartIdx: index('idx_notification_analytics_period_start').on(table.periodStart),
  periodEndIdx: index('idx_notification_analytics_period_end').on(table.periodEnd),
  createdAtIdx: index('idx_notification_analytics_created_at').on(table.createdAt),
  uniqueNotificationTypeMetric: index('idx_notification_analytics_unique').on(table.notificationId, table.type, table.metric, table.period),
}))

// Types
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type NotificationTemplate = typeof notificationTemplates.$inferSelect
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert
export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert
export type NotificationDelivery = typeof notificationDeliveries.$inferSelect
export type NewNotificationDelivery = typeof notificationDeliveries.$inferInsert
export type NotificationGroup = typeof notificationGroups.$inferSelect
export type NewNotificationGroup = typeof notificationGroups.$inferInsert
export type NotificationRecipient = typeof notificationRecipients.$inferSelect
export type NewNotificationRecipient = typeof notificationRecipients.$inferInsert
export type NotificationAnalytics = typeof notificationAnalytics.$inferSelect
export type NewNotificationAnalytics = typeof notificationAnalytics.$inferInsert
