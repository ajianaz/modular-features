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
  enum as pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

// Payment Providers enum
export const paymentProviderEnum = pgEnum('payment_provider', [
  'polar',
  'midtrans',
  'xendit',
  'coinbase',
  'stripe',
  'paypal'
])

// Transaction Status enum
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded'
])

// Payment Methods enum
export const paymentMethodEnum = pgEnum('payment_method', [
  'credit_card',
  'debit_card',
  'bank_transfer',
  'e_wallet',
  'crypto',
  'cash',
  'check',
  'other'
])

// Transactions table - Main payment transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id'), // Reference to order if applicable
  invoiceId: uuid('invoice_id'), // Reference to invoice if applicable
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }), // Provider's transaction ID
  provider: paymentProviderEnum('provider').notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'), // Additional provider-specific data
  failureReason: text('failure_reason'), // Reason for failure
  fees: decimal('fees', { precision: 10, scale: 2 }).default('0.00').notNull(),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }), // Amount after fees
  refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  refundedAt: timestamp('refunded_at'),
}, (table) => ({
  userIdIdx: index('idx_transactions_user_id').on(table.userId),
  orderIdIdx: index('idx_transactions_order_id').on(table.orderId),
  invoiceIdIdx: index('idx_transactions_invoice_id').on(table.invoiceId),
  providerIdx: index('idx_transactions_provider').on(table.provider),
  statusIdx: index('idx_transactions_status').on(table.status),
  amountIdx: index('idx_transactions_amount').on(table.amount),
  createdAtIdx: index('idx_transactions_created_at').on(table.createdAt),
}))

// Payment Methods table - User's saved payment methods
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: paymentMethodEnum('type').notNull(),
  provider: paymentProviderEnum('provider').notNull(),
  providerMethodId: varchar('provider_method_id', { length: 255 }), // Provider's method ID
  nickname: varchar('nickname', { length: 100 }), // User-friendly name
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  cardLast4: varchar('card_last4', { length: 4 }), // Last 4 digits of card
  cardBrand: varchar('card_brand', { length: 50 }), // Visa, MasterCard, etc.
  cardExpiryMonth: integer('card_expiry_month'),
  cardExpiryYear: integer('card_expiry_year'),
  bankName: varchar('bank_name', { length: 255 }),
  accountLast4: varchar('account_last4', { length: 4 }),
  walletProvider: varchar('wallet_provider', { length: 100 }), // GoPay, OVO, etc.
  cryptoAddress: varchar('crypto_address', { length: 255 }), // Blockchain address
  metadata: jsonb('metadata'), // Additional method data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'), // Method expiration
}, (table) => ({
  userIdIdx: index('idx_payment_methods_user_id').on(table.userId),
  typeIdx: index('idx_payment_methods_type').on(table.type),
  providerIdx: index('idx_payment_methods_provider').on(table.provider),
  isDefaultIdx: index('idx_payment_methods_is_default').on(table.isDefault),
  isActiveIdx: index('idx_payment_methods_is_active').on(table.isActive),
  lastUsedAtIdx: index('idx_payment_methods_last_used_at').on(table.lastUsedAt),
}))

// Invoices table - Billing invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  orderId: uuid('order_id'), // Related order
  subscriptionId: uuid('subscription_id'), // Related subscription
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'] }).default('draft').notNull(),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
  description: text('description'),
  notes: text('notes'),
  metadata: jsonb('metadata'), // Invoice line items, etc.
  pdfUrl: varchar('pdf_url', { length: 500 }), // Invoice PDF URL
  sentToUser: boolean('sent_to_user').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_invoices_user_id').on(table.userId),
  invoiceNumberIdx: index('idx_invoices_invoice_number').on(table.invoiceNumber),
  orderIdIdx: index('idx_invoices_order_id').on(table.orderId),
  subscriptionIdIdx: index('idx_invoices_subscription_id').on(table.subscriptionId),
  statusIdx: index('idx_invoices_status').on(table.status),
  dueDateIdx: index('idx_invoices_due_date').on(table.dueDate),
  paidAtIdx: index('idx_invoices_paid_at').on(table.paidAt),
  createdAtIdx: index('idx_invoices_created_at').on(table.createdAt),
}))

// Payment Webhooks table - Store incoming webhook events
export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: paymentProviderEnum('provider').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(), // payment.completed, charge.failed, etc.
  eventId: varchar('event_id', { length: 255 }), // Provider's event ID
  transactionId: uuid('transaction_id'), // Related transaction
  payload: jsonb('payload').notNull(), // Full webhook payload
  isProcessed: boolean('is_processed').default(false).notNull(),
  processingAttempts: integer('processing_attempts').default(0).notNull(),
  lastProcessedAt: timestamp('last_processed_at'),
  errorMessage: text('error_message'),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  signature: text('signature'), // Webhook signature for verification
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  providerIdx: index('idx_payment_webhooks_provider').on(table.provider),
  eventTypeIdx: index('idx_payment_webhooks_event_type').on(table.eventType),
  eventIdIdx: index('idx_payment_webhooks_event_id').on(table.eventId),
  transactionIdIdx: index('idx_payment_webhooks_transaction_id').on(table.transactionId),
  isProcessedIdx: index('idx_payment_webhooks_is_processed').on(table.isProcessed),
  createdAtIdx: index('idx_payment_webhooks_created_at').on(table.createdAt),
}))

// Payment Refunds table - Refund transactions
export const paymentRefunds = pgTable('payment_refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  refundId: varchar('refund_id', { length: 255 }), // Provider's refund ID
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 255 }), // Reason for refund
  status: varchar('status', { length: 20, enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending').notNull(),
  metadata: jsonb('metadata'), // Additional refund data
  processedBy: uuid('processed_by').references(() => users.id, { onDelete: 'set null' }), // Who processed the refund
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  transactionIdIdx: index('idx_payment_refunds_transaction_id').on(table.transactionId),
  refundIdIdx: index('idx_payment_refunds_refund_id').on(table.refundId),
  statusIdx: index('idx_payment_refunds_status').on(table.status),
  createdAtIdx: index('idx_payment_refunds_created_at').on(table.createdAt),
}))

// Payment Disputes table - Chargeback disputes
export const paymentDisputes = pgTable('payment_disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  disputeId: varchar('dispute_id', { length: 255 }), // Provider's dispute ID
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 100 }), // Reason for dispute
  status: varchar('status', { length: 20, enum: ['opened', 'under_review', 'resolved', 'lost', 'won'] }).default('opened').notNull(),
  evidence: jsonb('evidence'), // Evidence submitted
  outcome: varchar('outcome', { length: 100 }), // Final outcome
  metadata: jsonb('metadata'), // Additional dispute data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
}, (table) => ({
  transactionIdIdx: index('idx_payment_disputes_transaction_id').on(table.transactionId),
  disputeIdIdx: index('idx_payment_disputes_dispute_id').on(table.disputeId),
  statusIdx: index('idx_payment_disputes_status').on(table.status),
  createdAtIdx: index('idx_payment_disputes_created_at').on(table.createdAt),
}))

// Types
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type PaymentWebhook = typeof paymentWebhooks.$inferSelect
export type NewPaymentWebhook = typeof paymentWebhooks.$inferInsert
export type PaymentRefund = typeof paymentRefunds.$inferSelect
export type NewPaymentRefund = typeof paymentRefunds.$inferInsert
export type PaymentDispute = typeof paymentDisputes.$inferSelect
export type NewPaymentDispute = typeof paymentDisputes.$inferInsert
