// Export all schema tables
export * from './auth.schema'
export * from './users.schema'
export * from './payments.schema'
export * from './orders.schema'
export * from './subscriptions.schema'
export * from './notifications.schema'
export * from './audit.schema'
export * from './quota.schema'

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
} from './'

// Export all tables in a single object
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

// Export all enums
export * from './auth.schema'
export * from './orders.schema'
export * from './subscriptions.schema'
export * from './notifications.schema'
export * from './audit.schema'
export * from './quota.schema'

// Export all types
export * from './auth.schema'
export * from './users.schema'
export * from './payments.schema'
export * from './orders.schema'
export * from './subscriptions.schema'
export * from './notifications.schema'
export * from './audit.schema'
export * from './quota.schema'
