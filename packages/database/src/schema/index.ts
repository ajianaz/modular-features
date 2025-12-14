// Export all schema tables
export * from './auth.schema'
export * from './users.schema'
export * from './payments.schema'
export * from './orders.schema'
export * from './subscriptions.schema'
export * from './notifications.schema'
export * from './audit.schema'
export * from './quota.schema'

// Export drizzle operators
export { eq } from 'drizzle-orm'

// Combine all tables for schema exports
import {
  // Auth schema
  users,
  sessions,
  oauthAccounts,
  passwordResets,
  emailVerifications,
  mfaSettings,
  loginAttempts,
} from './auth.schema'
import {
  // User management schema
  userProfiles,
  userSettings,
  userRoles,
  userRoleAssignments,
  userActivity,
  userStats,
  userPreferences,
} from './users.schema'
import {
  // Payment schema
  transactions,
  paymentMethods,
  invoices,
  paymentWebhooks,
  paymentRefunds,
  paymentDisputes,
} from './payments.schema'
import {
  // Order schema
  orders,
  orderItems,
  orderStatusHistory,
  orderFulfillment,
  orderReturns,
  orderReviews,
} from './orders.schema'
import {
  // Subscription schema
  subscriptionPlans,
  subscriptions,
  subscriptionUsage,
  subscriptionInvoices,
  subscriptionEvents,
  subscriptionAddons,
  userSubscriptionAddons,
} from './subscriptions.schema'
import {
  // Notification schema
  notifications,
  notificationTemplates,
  notificationPreferences,
  notificationDeliveries,
  notificationGroups,
  notificationRecipients,
  notificationAnalytics,
} from './notifications.schema'
import {
  // Audit schema
  auditLogs,
  auditEvents,
  systemLogs,
  complianceReports,
  dataAccessLogs,
  securityEvents,
} from './audit.schema'
import {
  // Quota schema
  quotaLimits,
  userQuotaLimits,
  usageTracking,
  usageEvents,
  quotaPlans,
  quotaAlerts,
  quotaRequests,
  quotaHistory,
} from './quota.schema'

// Export all tables as a schema object
export const schema = {
  // Auth schema
  users,
  sessions,
  oauthAccounts,
  passwordResets,
  emailVerifications,
  mfaSettings,
  loginAttempts,

  // User management schema
  userProfiles,
  userSettings,
  userRoles,
  userRoleAssignments,
  userActivity,
  userStats,
  userPreferences,

  // Payment schema
  transactions,
  paymentMethods,
  invoices,
  paymentWebhooks,
  paymentRefunds,
  paymentDisputes,

  // Order schema
  orders,
  orderItems,
  orderStatusHistory,
  orderFulfillment,
  orderReturns,
  orderReviews,

  // Subscription schema
  subscriptionPlans,
  subscriptions,
  subscriptionUsage,
  subscriptionInvoices,
  subscriptionEvents,
  subscriptionAddons,
  userSubscriptionAddons,

  // Notification schema
  notifications,
  notificationTemplates,
  notificationPreferences,
  notificationDeliveries,
  notificationGroups,
  notificationRecipients,
  notificationAnalytics,

  // Audit schema
  auditLogs,
  auditEvents,
  systemLogs,
  complianceReports,
  dataAccessLogs,
  securityEvents,

  // Quota schema
  quotaLimits,
  userQuotaLimits,
  usageTracking,
  usageEvents,
  quotaPlans,
  quotaAlerts,
  quotaRequests,
  quotaHistory,
}

// Default export for convenience
export default schema
