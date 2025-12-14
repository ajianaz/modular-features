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

// Order Status enum
export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'partially_refunded'
])

// Order Type enum
export const orderTypeEnum = pgEnum('order_type', [
  'purchase',
  'subscription',
  'donation',
  'gift',
  'refund'
])

// Orders table - Main order information
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: orderTypeEnum('type').notNull(),
  status: orderStatusEnum('status').default('draft').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00').notNull(),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0.00').notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'), // Additional order data
  shippingAddress: jsonb('shipping_address'), // Full shipping address
  billingAddress: jsonb('billing_address'), // Full billing address
  trackingNumbers: jsonb('tracking_numbers'), // Array of tracking numbers
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  transactionId: uuid('transaction_id'), // Reference to payment transaction
  invoiceId: uuid('invoice_id'), // Reference to invoice
  subscriptionId: uuid('subscription_id'), // Reference to subscription if applicable
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
}, (table) => ({
  userIdIdx: index('idx_orders_user_id').on(table.userId),
  orderNumberIdx: index('idx_orders_order_number').on(table.orderNumber),
  statusIdx: index('idx_orders_status').on(table.status),
  typeIdx: index('idx_orders_type').on(table.type),
  createdAtIdx: index('idx_orders_created_at').on(table.createdAt),
  transactionIdIdx: index('idx_orders_transaction_id').on(table.transactionId),
  invoiceIdIdx: index('idx_orders_invoice_id').on(table.invoiceId),
  subscriptionIdIdx: index('idx_orders_subscription_id').on(table.subscriptionId),
}))

// Order Items table - Individual items in an order
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  productName: varchar('product_name', { length: 500 }).notNull(),
  productDescription: text('product_description'),
  productSku: varchar('product_sku', { length: 100 }),
  productImage: varchar('product_image', { length: 1000 }),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00').notNull(),
  metadata: jsonb('metadata'), // Product-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index('idx_order_items_order_id').on(table.orderId),
  productIdIdx: index('idx_order_items_product_id').on(table.productId),
  productSkuIdx: index('idx_order_items_product_sku').on(table.productSku),
}))

// Order Status History table - Track status changes
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  previousStatus: orderStatusEnum('previous_status'),
  currentStatus: orderStatusEnum('current_status').notNull(),
  reason: varchar('reason', { length: 500 }), // Reason for status change
  notes: text('notes'), // Additional notes about the change
  changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }), // Who made the change
  metadata: jsonb('metadata'), // Additional status data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index('idx_order_status_history_order_id').on(table.orderId),
  currentStatusIdx: index('idx_order_status_history_current_status').on(table.currentStatus),
  createdAtIdx: index('idx_order_status_history_created_at').on(table.createdAt),
  changedByIdx: index('idx_order_status_history_changed_by').on(table.changedBy),
}))

// Order Fulfillment table - Track order fulfillment
export const orderFulfillment = pgTable('order_fulfillment', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  carrier: varchar('carrier', { length: 100 }), // Shipping carrier (FedEx, UPS, etc.)
  shippingMethod: varchar('shipping_method', { length: 100 }), // Standard, Express, etc.
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0.00').notNull(),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  pickupAddress: jsonb('pickup_address'), // Where the package was shipped from
  deliveryAddress: jsonb('delivery_address'), // Where the package was delivered
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, shipped, delivered, failed
  notes: text('notes'), // Fulfillment notes
  metadata: jsonb('metadata'), // Additional fulfillment data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
}, (table) => ({
  orderIdIdx: index('idx_order_fulfillment_order_id').on(table.orderId),
  trackingNumberIdx: index('idx_order_fulfillment_tracking_number').on(table.trackingNumber),
  carrierIdx: index('idx_order_fulfillment_carrier').on(table.carrier),
  statusIdx: index('idx_order_fulfillment_status').on(table.status),
  createdAtIdx: index('idx_order_fulfillment_created_at').on(table.createdAt),
}))

// Order Returns table - Handle order returns
export const orderReturns = pgTable('order_returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  returnNumber: varchar('return_number', { length: 100 }).notNull().unique(),
  reason: varchar('reason', { length: 255 }).notNull(), // Return reason
  condition: varchar('condition', { length: 255 }), // Condition of returned items
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).notNull(),
  refundMethod: varchar('refund_method', { length: 100 }), // How the refund was processed
  status: varchar('status', { length: 50 }).default('requested').notNull(), // requested, approved, received, processed
  trackingNumber: varchar('tracking_number', { length: 255 }), // Return shipping tracking
  notes: text('notes'), // Return notes
  metadata: jsonb('metadata'), // Additional return data
  requestedBy: uuid('requested_by').references(() => users.id, { onDelete: 'set null' }),
  processedBy: uuid('processed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  receivedAt: timestamp('received_at'),
  processedAt: timestamp('processed_at'),
}, (table) => ({
  orderIdIdx: index('idx_order_returns_order_id').on(table.orderId),
  returnNumberIdx: index('idx_order_returns_return_number').on(table.returnNumber),
  statusIdx: index('idx_order_returns_status').on(table.status),
  requestedByIdx: index('idx_order_returns_requested_by').on(table.requestedBy),
  processedByIdx: index('idx_order_returns_processed_by').on(table.processedBy),
  createdAtIdx: index('idx_order_returns_created_at').on(table.createdAt),
}))

// Order Reviews table - Customer reviews for orders
export const orderReviews = pgTable('order_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 rating
  title: varchar('title', { length: 255 }),
  review: text('review'), // Review text
  isVerified: boolean('is_verified').default(false).notNull(), // Verified purchase
  isPublic: boolean('is_public').default(true).notNull(), // Show publicly
  helpfulCount: integer('helpful_count').default(0).notNull(), // How many found it helpful
  metadata: jsonb('metadata'), // Additional review data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: index('idx_order_reviews_order_id').on(table.orderId),
  userIdIdx: index('idx_order_reviews_user_id').on(table.userId),
  ratingIdx: index('idx_order_reviews_rating').on(table.rating),
  isVerifiedIdx: index('idx_order_reviews_is_verified').on(table.isVerified),
  isPublicIdx: index('idx_order_reviews_is_public').on(table.isPublic),
  createdAtIdx: index('idx_order_reviews_created_at').on(table.createdAt),
  uniqueOrderReview: index('idx_order_reviews_unique').on(table.orderId, table.userId),
}))

// Types
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert
export type OrderFulfillment = typeof orderFulfillment.$inferSelect
export type NewOrderFulfillment = typeof orderFulfillment.$inferInsert
export type OrderReturn = typeof orderReturns.$inferSelect
export type NewOrderReturn = typeof orderReturns.$inferInsert
export type OrderReview = typeof orderReviews.$inferSelect
export type NewOrderReview = typeof orderReviews.$inferInsert
