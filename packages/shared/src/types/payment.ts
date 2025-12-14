import { z } from 'zod'
import { BaseEntity, PaymentStatus } from './base'
import { Money } from './domain'

// Payment method types
export type PaymentMethodType = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'stripe' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'bank_transfer' 
  | 'crypto' 
  | 'cash'

// Payment provider types
export type PaymentProvider = 
  | 'stripe' 
  | 'paypal' 
  | 'polar' 
  | 'midtrans' 
  | 'xendit' 
  | 'coinbase' 
  | 'square' 
  | 'adyen'

// Payment currency types
export type PaymentCurrency = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'JPY' 
  | 'CNY' 
  | 'INR' 
  | 'AUD' 
  | 'CAD' 
  | 'CHF' 
  | 'SEK' 
  | 'NOK' 
  | 'DKK'

// Transaction interface
export interface Transaction extends BaseEntity {
  userId: string
  orderId?: string | null
  invoiceId?: string | null
  subscriptionId?: string | null
  paymentMethodId?: string | null
  provider: PaymentProvider
  providerTransactionId?: string | null
  type: 'payment' | 'refund' | 'chargeback'
  status: PaymentStatus
  amount: number
  currency: PaymentCurrency
  fee?: number | null
  netAmount?: number | null
  description?: string | null
  metadata?: Record<string, any> | null
  failureReason?: string | null
  processingTime?: number | null
  ipAddress?: string | null
  userAgent?: string | null
  externalData?: Record<string, any> | null
  refundedAt?: Date | null
  chargebackAt?: Date | null
  settledAt?: Date | null
}

// Transaction schema
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  orderId: z.string().uuid().nullable().optional(),
  invoiceId: z.string().uuid().nullable().optional(),
  subscriptionId: z.string().uuid().nullable().optional(),
  paymentMethodId: z.string().uuid().nullable().optional(),
  provider: z.enum(['stripe', 'paypal', 'polar', 'midtrans', 'xendit', 'coinbase', 'square', 'adyen']),
  providerTransactionId: z.string().nullable().optional(),
  type: z.enum(['payment', 'refund', 'chargeback']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded']),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']),
  fee: z.number().nonnegative().nullable().optional(),
  netAmount: z.number().nonnegative().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  failureReason: z.string().nullable().optional(),
  processingTime: z.number().nonnegative().nullable().optional(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  externalData: z.record(z.any()).nullable().optional(),
  refundedAt: z.date().nullable().optional(),
  chargebackAt: z.date().nullable().optional(),
  settledAt: z.date().nullable().optional(),
})

// Payment Method interface
export interface PaymentMethod extends BaseEntity {
  userId: string
  type: PaymentMethodType
  provider: PaymentProvider
  providerMethodId?: string | null
  isDefault: boolean
  isActive: boolean
  isReusable: boolean
  lastUsed?: Date | null
  expiresAt?: Date | null
  billingAddress?: {
    line1: string
    line2?: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  card?: {
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
    fingerprint?: string | null
  } | null
  bank?: {
    accountHolderName: string
    accountNumberLast4: string
    bankName: string
    routingNumber?: string | null
  } | null
  digitalWallet?: {
    email?: string | null
    phone?: string | null
    accountHolder?: string | null
  } | null
  crypto?: {
    walletAddress: string
    blockchain: string
  } | null
  metadata?: Record<string, any> | null
}

// Payment Method schema
export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  type: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer', 'crypto', 'cash']),
  provider: z.enum(['stripe', 'paypal', 'polar', 'midtrans', 'xendit', 'coinbase', 'square', 'adyen']),
  providerMethodId: z.string().nullable().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  isReusable: z.boolean(),
  lastUsed: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  billingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }).nullable().optional(),
  card: z.object({
    brand: z.string(),
    last4: z.string().length(4),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number().min(2000).max(2100),
    fingerprint: z.string().nullable().optional(),
  }).nullable().optional(),
  bank: z.object({
    accountHolderName: z.string().min(1),
    accountNumberLast4: z.string().length(4),
    bankName: z.string().min(1),
    routingNumber: z.string().nullable().optional(),
  }).nullable().optional(),
  digitalWallet: z.object({
    email: z.string().email().nullable().optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/).nullable().optional(),
    accountHolder: z.string().nullable().optional(),
  }).nullable().optional(),
  crypto: z.object({
    walletAddress: z.string().min(1),
    blockchain: z.string().min(1),
  }).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Invoice interface
export interface Invoice extends BaseEntity {
  userId: string
  invoiceNumber: string
  orderId?: string | null
  subscriptionId?: string | null
  type: 'subscription' | 'one_time' | 'refund' | 'adjustment'
  status: 'draft' | 'sent' | 'paid' | 'failed' | 'refunded' | 'void'
  amount: number
  tax: number
  totalAmount: number
  currency: PaymentCurrency
  dueDate: Date
  paidAt?: Date | null
  failedAt?: Date | null
  refundedAt?: Date | null
  voidedAt?: Date | null
  paymentMethodId?: string | null
  transactionId?: string | null
  description?: string | null
  notes?: string | null
  items: InvoiceItem[]
  billingAddress?: {
    line1: string
    line2?: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  shippingAddress?: {
    line1: string
    line2?: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  metadata?: Record<string, any> | null
}

// Invoice schema
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  orderId: z.string().uuid().nullable().optional(),
  subscriptionId: z.string().uuid().nullable().optional(),
  type: z.enum(['subscription', 'one_time', 'refund', 'adjustment']),
  status: z.enum(['draft', 'sent', 'paid', 'failed', 'refunded', 'void']),
  amount: z.number().positive(),
  tax: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']),
  dueDate: z.date(),
  paidAt: z.date().nullable().optional(),
  failedAt: z.date().nullable().optional(),
  refundedAt: z.date().nullable().optional(),
  voidedAt: z.date().nullable().optional(),
  paymentMethodId: z.string().uuid().nullable().optional(),
  transactionId: z.string().uuid().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  items: z.array(InvoiceItemSchema),
  billingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }).nullable().optional(),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Invoice Item interface
export interface InvoiceItem {
  id: string
  name: string
  description?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number | null
  tax?: number | null
  metadata?: Record<string, any> | null
}

// Invoice Item schema
export const InvoiceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().nullable().optional(),
  tax: z.number().nonnegative().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Payment Webhook interface
export interface PaymentWebhook extends BaseEntity {
  provider: PaymentProvider
  eventType: string
  eventId: string
  data: Record<string, any>
  processed: boolean
  processedAt?: Date | null
  processingAttempts: number
  error?: string | null
  metadata?: Record<string, any> | null
}

// Payment Webhook schema
export const PaymentWebhookSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  provider: z.enum(['stripe', 'paypal', 'polar', 'midtrans', 'xendit', 'coinbase', 'square', 'adyen']),
  eventType: z.string().min(1),
  eventId: z.string().min(1),
  data: z.record(z.any()),
  processed: z.boolean(),
  processedAt: z.date().nullable().optional(),
  processingAttempts: z.number().nonnegative().default(0),
  error: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Payment Refund interface
export interface PaymentRefund extends BaseEntity {
  transactionId: string
  refundId?: string | null
  providerRefundId?: string | null
  amount: number
  currency: PaymentCurrency
  reason: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  metadata?: Record<string, any> | null
  processedAt?: Date | null
  failedAt?: Date | null
  cancelledAt?: Date | null
  failureReason?: string | null
}

// Payment Refund schema
export const PaymentRefundSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  transactionId: z.string().uuid(),
  refundId: z.string().nullable().optional(),
  providerRefundId: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']),
  reason: z.string().min(1).max(500),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  metadata: z.record(z.any()).nullable().optional(),
  processedAt: z.date().nullable().optional(),
  failedAt: z.date().nullable().optional(),
  cancelledAt: z.date().nullable().optional(),
  failureReason: z.string().nullable().optional(),
})

// Payment Dispute interface
export interface PaymentDispute extends BaseEntity {
  transactionId: string
  disputeId?: string | null
  providerDisputeId?: string | null
  type: string
  reason: string
  status: 'opened' | 'investigating' | 'resolved' | 'closed'
  amount: number
  currency: PaymentCurrency
  description?: string | null
  evidence?: Record<string, any> | null
  resolvedAt?: Date | null
  resolution?: string | null
  metadata?: Record<string, any> | null
}

// Payment Dispute schema
export const PaymentDisputeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  transactionId: z.string().uuid(),
  disputeId: z.string().nullable().optional(),
  providerDisputeId: z.string().nullable().optional(),
  type: z.string().min(1).max(100),
  reason: z.string().min(1).max(500),
  status: z.enum(['opened', 'investigating', 'resolved', 'closed']),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']),
  description: z.string().max(2000).nullable().optional(),
  evidence: z.record(z.any()).nullable().optional(),
  resolvedAt: z.date().nullable().optional(),
  resolution: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Payment configuration constants
export const PAYMENT_PROVIDERS = {
  stripe: {
    name: 'Stripe',
    supportedMethods: ['credit_card', 'debit_card', 'apple_pay', 'google_pay'],
    fees: {
      card: 0.029 + 0.30, // 2.9% + $0.30
      digitalWallet: 0.029 + 0.30,
    },
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK'],
  },
  paypal: {
    name: 'PayPal',
    supportedMethods: ['paypal', 'credit_card', 'debit_card'],
    fees: {
      paypal: 0.029 + 0.30, // Domestic rates
      international: 0.039 + 0.30,
    },
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK'],
  },
  polar: {
    name: 'Polar',
    supportedMethods: ['credit_card', 'bank_transfer'],
    fees: {
      card: 0.025 + 0.25,
      bank: 0.015 + 5.00,
    },
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
  },
  midtrans: {
    name: 'Midtrans',
    supportedMethods: ['credit_card', 'bank_transfer', 'crypto'],
    fees: {
      card: 0.025 + 0.25,
      bank: 5000, // Fixed fee in IDR
      crypto: 0.01,
    },
    currencies: ['IDR'],
  },
  xendit: {
    name: 'Xendit',
    supportedMethods: ['credit_card', 'bank_transfer', 'crypto'],
    fees: {
      card: 0.025 + 0.25,
      bank: 4000, // Fixed fee in IDR
      ewallet: 0.025 + 0.25,
    },
    currencies: ['IDR'],
  },
  coinbase: {
    name: 'Coinbase',
    supportedMethods: ['crypto'],
    fees: {
      crypto: 0.01, // 1%
    },
    currencies: ['USD', 'EUR', 'GBP', 'BTC', 'ETH'],
  },
} as const

export const PAYMENT_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
  EUR: { name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { name: 'British Pound', symbol: '£', decimals: 2 },
  JPY: { name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  CNY: { name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  INR: { name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  AUD: { name: 'Australian Dollar', symbol: '$', decimals: 2 },
  CAD: { name: 'Canadian Dollar', symbol: '$', decimals: 2 },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  SEK: { name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  DKK: { name: 'Danish Krone', symbol: 'kr', decimals: 2 },
} as const

// Payment event types
export const PAYMENT_EVENT_TYPES = {
  // Transaction events
  'transaction.created': 'Transaction created',
  'transaction.updated': 'Transaction updated',
  'transaction.completed': 'Transaction completed',
  'transaction.failed': 'Transaction failed',
  'transaction.refunded': 'Transaction refunded',
  'transaction.chargeback': 'Transaction chargeback received',
  
  // Payment method events
  'payment_method.created': 'Payment method created',
  'payment_method.updated': 'Payment method updated',
  'payment_method.deleted': 'Payment method deleted',
  'payment_method.expired': 'Payment method expired',
  
  // Invoice events
  'invoice.created': 'Invoice created',
  'invoice.sent': 'Invoice sent',
  'invoice.paid': 'Invoice paid',
  'invoice.failed': 'Invoice payment failed',
  'invoice.refunded': 'Invoice refunded',
  'invoice.due': 'Invoice due',
  'invoice.overdue': 'Invoice overdue',
  
  // Webhook events
  'webhook.received': 'Webhook received',
  'webhook.processed': 'Webhook processed',
  'webhook.failed': 'Webhook processing failed',
  
  // Dispute events
  'dispute.opened': 'Dispute opened',
  'dispute.investigating': 'Dispute under investigation',
  'dispute.resolved': 'Dispute resolved',
  'dispute.closed': 'Dispute closed',
} as const

export type PaymentEventType = keyof typeof PAYMENT_EVENT_TYPES

export type {
  Transaction,
  PaymentMethod,
  Invoice,
  InvoiceItem,
  PaymentWebhook,
  PaymentRefund,
  PaymentDispute,
  PaymentMethodType,
  PaymentProvider,
  PaymentCurrency,
  PaymentEventType,
}
