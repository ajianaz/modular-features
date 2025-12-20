/**
 * Notification Entity Exports
 * 
 * Central export point for all notification-related entities from database schema
 */

// Re-export from database schema
export {
  notifications,
  notificationTemplates,
  notificationPreferences,
  notificationDeliveries,
  notificationGroups,
  notificationRecipients,
  notificationAnalytics,
  notificationTypeEnum,
  notificationChannelEnum,
  notificationStatusEnum
} from '@modular-monolith/database/src/schema/notifications.schema';

// Re-export types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type NewNotificationDelivery = typeof notificationDeliveries.$inferInsert;
export type NotificationGroup = typeof notificationGroups.$inferSelect;
export type NewNotificationGroup = typeof notificationGroups.$inferInsert;
export type NotificationRecipient = typeof notificationRecipients.$inferSelect;
export type NewNotificationRecipient = typeof notificationRecipients.$inferInsert;
export type NotificationAnalytics = typeof notificationAnalytics.$inferSelect;
export type NewNotificationAnalytics = typeof notificationAnalytics.$inferInsert;
