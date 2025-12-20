import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  jsonb,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

// Subscription Status enum
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trial',
  'active',
  'grace_period',
  'past_due',
  'cancelled',
  'expired'
])

// Billing Cycle enum
export const billingCycleEnum = pgEnum('billing_cycle', [
  'monthly',
  'quarterly',
  'bi_annual',
  'annual',
  'lifetime'
])

// Subscription Plans table - Available subscription plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  trialDays: integer('trial_days').default(0).notNull(),
  features: jsonb('features'), // List of features included
  limits: jsonb('limits'), // Usage limits for the plan
  isPopular: boolean('is_popular').default(false).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata'), // Additional plan data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'), // When plan was archived
}, (table) => ({
  slugIdx: index('idx_subscription_plans_slug').on(table.slug),
  isVisibleIdx: index('idx_subscription_plans_is_visible').on(table.isVisible),
  sortOrderIdx: index('idx_subscription_plans_sort_order').on(table.sortOrder),
  billingCycleIdx: index('idx_subscription_plans_billing_cycle').on(table.billingCycle),
  priceIdx: index('idx_subscription_plans_price').on(table.price),
}))

// Subscriptions table - User subscription instances
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: varchar('plan_id', { length: 255 }).references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  status: subscriptionStatusEnum('status').default('trial').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  trialEndDate: timestamp('trial_end_date'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  nextBillingDate: timestamp('next_billing_date'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: varchar('cancel_reason', { length: 500 }),
  paymentMethodId: uuid('payment_method_id'), // Reference to payment method
  externalId: varchar('external_id', { length: 255 }), // External provider ID
  metadata: jsonb('metadata'), // Additional subscription data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_subscriptions_user_id').on(table.userId),
  planIdIdx: index('idx_subscriptions_plan_id').on(table.planId),
  statusIdx: index('idx_subscriptions_status').on(table.status),
  currentPeriodEndIdx: index('idx_subscriptions_current_period_end').on(table.currentPeriodEnd),
  nextBillingDateIdx: index('idx_subscriptions_next_billing_date').on(table.nextBillingDate),
  externalIdIdx: index('idx_subscriptions_external_id').on(table.externalId),
  createdAtIdx: index('idx_subscriptions_created_at').on(table.createdAt),
  autoRenewIdx: index('idx_subscriptions_auto_renew').on(table.autoRenew),
  uniqueUserPlan: index('idx_subscriptions_unique_user_plan').on(table.userId, table.planId),
}))

// Subscription Usage table - Track usage against limits
export const subscriptionUsage = pgTable('subscription_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  metric: varchar('metric', { length: 100 }).notNull(), // API calls, storage, bandwidth, etc.
  currentUsage: integer('current_usage').default(0).notNull(),
  limit: integer('limit'), // Usage limit (null for unlimited)
  unit: varchar('unit', { length: 50 }), // bytes, calls, requests, etc.
  period: varchar('period', { length: 20 }).default('current'), // current, last_month, etc.
  resetDate: timestamp('reset_date'), // When usage will reset
  metadata: jsonb('metadata'), // Additional usage data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  subscriptionIdIdx: index('idx_subscription_usage_subscription_id').on(table.subscriptionId),
  metricIdx: index('idx_subscription_usage_metric').on(table.metric),
  periodIdx: index('idx_subscription_usage_period').on(table.period),
  resetDateIdx: index('idx_subscription_usage_reset_date').on(table.resetDate),
  uniqueSubscriptionMetric: index('idx_subscription_usage_unique').on(table.subscriptionId, table.metric, table.period),
}))

// Subscription Invoices table - Billing invoices for subscriptions
export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20, enum: ['draft', 'sent', 'paid', 'failed', 'refunded'] }).default('draft').notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  failedAt: timestamp('failed_at'),
  refundedAt: timestamp('refunded_at'),
  periodStartDate: timestamp('period_start_date').notNull(),
  periodEndDate: timestamp('period_end_date').notNull(),
  paymentMethodId: uuid('payment_method_id'), // Reference to payment method
  transactionId: uuid('transaction_id'), // Reference to payment transaction
  externalInvoiceId: varchar('external_invoice_id', { length: 255 }), // External provider ID
  description: text('description'),
  notes: text('notes'),
  metadata: jsonb('metadata'), // Additional invoice data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  subscriptionIdIdx: index('idx_subscription_invoices_subscription_id').on(table.subscriptionId),
  invoiceNumberIdx: index('idx_subscription_invoices_invoice_number').on(table.invoiceNumber),
  statusIdx: index('idx_subscription_invoices_status').on(table.status),
  dueDateIdx: index('idx_subscription_invoices_due_date').on(table.dueDate),
  periodStartDateIdx: index('idx_subscription_invoices_period_start_date').on(table.periodStartDate),
  periodEndDateIdx: index('idx_subscription_invoices_period_end_date').on(table.periodEndDate),
  externalInvoiceIdIdx: index('idx_subscription_invoices_external_invoice_id').on(table.externalInvoiceId),
  createdAtIdx: index('idx_subscription_invoices_created_at').on(table.createdAt),
}))

// Subscription Events table - Track subscription lifecycle events
export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: varchar('subscription_id', { length: 255 }).references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(), // created, upgraded, downgraded, cancelled, renewed, etc.
  previousStatus: subscriptionStatusEnum('previous_status'),
  currentStatus: subscriptionStatusEnum('current_status'),
  previousPlanId: varchar('previous_plan_id', { length: 255 }).references(() => subscriptionPlans.id),
  currentPlanId: varchar('current_plan_id', { length: 255 }).references(() => subscriptionPlans.id),
  reason: varchar('reason', { length: 500 }), // Reason for the event
  description: text('description'),
  metadata: jsonb('metadata'), // Event-specific data
  processedBy: varchar('processed_by', { length: 255 }).references(() => users.id, { onDelete: 'set null' }), // Who processed the event
  externalEventId: varchar('external_event_id', { length: 255 }), // External provider event ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  subscriptionIdIdx: index('idx_subscription_events_subscription_id').on(table.subscriptionId),
  eventTypeIdx: index('idx_subscription_events_event_type').on(table.eventType),
  previousStatusIdx: index('idx_subscription_events_previous_status').on(table.previousStatus),
  currentStatusIdx: index('idx_subscription_events_current_status').on(table.currentStatus),
  processedByIdx: index('idx_subscription_events_processed_by').on(table.processedBy),
  externalEventIdIdx: index('idx_subscription_events_external_event_id').on(table.externalEventId),
  createdAtIdx: index('idx_subscription_events_created_at').on(table.createdAt),
}))

// Subscription Add-ons table - Additional features for subscriptions
export const subscriptionAddons = pgTable('subscription_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  features: jsonb('features'), // List of add-on features
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  requiredPlanIds: jsonb('required_plan_ids'), // Plans this add-on is available for
  metadata: jsonb('metadata'), // Additional add-on data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'), // When add-on was archived
}, (table) => ({
  slugIdx: index('idx_subscription_addons_slug').on(table.slug),
  isVisibleIdx: index('idx_subscription_addons_is_visible').on(table.isVisible),
  sortOrderIdx: index('idx_subscription_addons_sort_order').on(table.sortOrder),
  priceIdx: index('idx_subscription_addons_price').on(table.price),
  billingCycleIdx: index('idx_subscription_addons_billing_cycle').on(table.billingCycle),
}))

// User Subscription Add-ons table - User's active add-ons
export const userSubscriptionAddons = pgTable('user_subscription_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 255 }).references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  addonId: varchar('addon_id', { length: 255 }).references(() => subscriptionAddons.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20, enum: ['active', 'cancelled', 'expired'] }).default('active').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  nextBillingDate: timestamp('next_billing_date'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  cancelledAt: timestamp('cancelled_at'),
  externalId: varchar('external_id', { length: 255 }), // External provider ID
  metadata: jsonb('metadata'), // Additional add-on data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_subscription_addons_user_id').on(table.userId),
  subscriptionIdIdx: index('idx_user_subscription_addons_subscription_id').on(table.subscriptionId),
  addonIdIdx: index('idx_user_subscription_addons_addon_id').on(table.addonId),
  statusIdx: index('idx_user_subscription_addons_status').on(table.status),
  currentPeriodEndIdx: index('idx_user_subscription_addons_current_period_end').on(table.currentPeriodEnd),
  nextBillingDateIdx: index('idx_user_subscription_addons_next_billing_date').on(table.nextBillingDate),
  externalIdIdx: index('idx_user_subscription_addons_external_id').on(table.externalId),
  createdAtIdx: index('idx_user_subscription_addons_created_at').on(table.createdAt),
  uniqueSubscriptionAddon: index('idx_user_subscription_addons_unique').on(table.subscriptionId, table.addonId),
}))

// Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect
export type NewSubscriptionUsage = typeof subscriptionUsage.$inferInsert
export type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect
export type NewSubscriptionInvoice = typeof subscriptionInvoices.$inferInsert
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect
export type NewSubscriptionEvent = typeof subscriptionEvents.$inferInsert
export type SubscriptionAddon = typeof subscriptionAddons.$inferSelect
export type NewSubscriptionAddon = typeof subscriptionAddons.$inferInsert
export type UserSubscriptionAddon = typeof userSubscriptionAddons.$inferSelect
export type NewUserSubscriptionAddon = typeof userSubscriptionAddons.$inferInsert
