import { z } from 'zod'
import { StringValidators, NumberValidators, DateValidators, ArrayValidators } from './validators'

// Common schemas
export const CommonSchemas = {
  // ID schemas
  uuid: StringValidators.uuid(),
  stringId: StringValidators.alphaNumeric().min(3),
  numericId: NumberValidators.positive().integer(),
  
  // Basic schemas
  name: StringValidators.alphaNumeric().min(1).max(100),
  description: StringValidators.minLength(1).maxLength(1000),
  email: StringValidators.email(),
  phone: StringValidators.phone(),
  url: StringValidators.url(),
  
  // Timestamp schemas
  timestamp: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  
  // Status schemas
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  isPublic: z.boolean(),
  
  // Pagination schemas
  page: NumberValidators.positive().integer().default(1),
  limit: NumberValidators.positive().integer().max(100).default(20),
  offset: NumberValidators.nonNegative().integer(),
  sortBy: StringValidators.alphaNumeric().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Search schemas
  search: StringValidators.nonEmpty().optional(),
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  
  // Metadata schemas
  metadata: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
}

// User schemas
export const UserSchemas = {
  // Basic user info
  firstName: StringValidators.firstName(),
  lastName: StringValidators.lastName(),
  fullName: StringValidators.fullName(),
  username: StringValidators.username(),
  bio: StringValidators.maxLength(500),
  
  // Password schemas
  password: StringValidators.password({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  }),
  passwordConfirm: z.string(),
  currentPassword: z.string(),
  
  // Email schemas
  emailConfirm: z.string().email(),
  primaryEmail: StringValidators.email(),
  secondaryEmail: StringValidators.email().optional(),
  
  // Profile schemas
  avatar: StringValidators.url().optional(),
  coverImage: StringValidators.url().optional(),
  website: StringValidators.url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    facebook: z.string().optional(),
  }).optional(),
  
  // Preference schemas
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  
  // Security schemas
  twoFactorCode: StringValidators.minLength(6).maxLength(6),
  resetToken: StringValidators.minLength(32),
  verificationToken: StringValidators.minLength(32),
  apiKey: StringValidators.minLength(32),
  
  // Complete user schema
  createUser: z.object({
    firstName: StringValidators.firstName(),
    lastName: StringValidators.lastName(),
    email: StringValidators.email(),
    username: StringValidators.username(),
    password: StringValidators.password(),
    passwordConfirm: z.string(),
    acceptTerms: z.boolean(),
  }).refine(
    (data) => data.password === data.passwordConfirm,
    {
      message: "Passwords don't match",
      path: ['passwordConfirm']
    }
  ),
  
  updateUser: z.object({
    firstName: StringValidators.firstName().optional(),
    lastName: StringValidators.lastName().optional(),
    username: StringValidators.username().optional(),
    bio: StringValidators.maxLength(500).optional(),
    avatar: StringValidators.url().optional(),
    website: StringValidators.url().optional(),
  }),
  
  updatePassword: z.object({
    currentPassword: z.string(),
    newPassword: StringValidators.password(),
    confirmNewPassword: z.string(),
  }).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
      message: "Passwords don't match",
      path: ['confirmNewPassword']
    }
  ),
  
  login: z.object({
    email: StringValidators.email(),
    password: z.string(),
    rememberMe: z.boolean().default(false),
  }),
  
  register: z.object({
    firstName: StringValidators.firstName(),
    lastName: StringValidators.lastName(),
    email: StringValidators.email(),
    username: StringValidators.username(),
    password: StringValidators.password(),
    passwordConfirm: z.string(),
    acceptTerms: z.boolean(),
    acceptPrivacy: z.boolean(),
  }).refine(
    (data) => data.password === data.passwordConfirm,
    {
      message: "Passwords don't match",
      path: ['passwordConfirm']
    }
  ),
}

// Payment schemas
export const PaymentSchemas = {
  // Money schemas
  amount: NumberValidators.positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK']),
  price: NumberValidators.nonNegative(),
  fee: NumberValidators.nonNegative(),
  discount: NumberValidators.nonNegative(),
  total: NumberValidators.nonNegative(),
  
  // Card schemas
  cardNumber: CustomValidators.creditCard(),
  cardHolderName: StringValidators.nonEmpty(),
  expiryMonth: NumberValidators.range(1, 12),
  expiryYear: NumberValidators.min(new Date().getFullYear()),
  cvv: StringValidators.minLength(3).maxLength(4),
  
  // Bank account schemas
  accountNumber: StringValidators.numeric(),
  routingNumber: StringValidators.numeric(),
  accountHolderName: StringValidators.nonEmpty(),
  bankName: StringValidators.nonEmpty(),
  swiftCode: BusinessValidators.swift(),
  iban: BusinessValidators.iban(),
  
  // Transaction schemas
  transactionId: StringValidators.alphaNumeric(),
  transactionType: z.enum(['payment', 'refund', 'chargeback']),
  transactionStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded']),
  
  // Payment method schemas
  paymentMethodType: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer', 'crypto']),
  paymentMethodStatus: z.enum(['active', 'inactive', 'expired', 'failed']),
  
  // Billing address schemas
  billingAddress: z.object({
    line1: StringValidators.nonEmpty(),
    line2: z.string().optional(),
    city: StringValidators.nonEmpty(),
    state: StringValidators.nonEmpty(),
    postalCode: StringValidators.nonEmpty(),
    country: StringValidators.minLength(2).maxLength(2),
  }),
  
  // Invoice schemas
  invoiceNumber: StringValidators.alphaNumeric(),
  invoiceType: z.enum(['subscription', 'one_time', 'refund', 'adjustment']),
  invoiceStatus: z.enum(['draft', 'sent', 'paid', 'failed', 'refunded', 'void']),
  dueDate: DateValidators.future(),
  tax: NumberValidators.nonNegative(),
  
  // Complete payment schemas
  createPaymentMethod: z.object({
    type: PaymentSchemas.paymentMethodType,
    billingAddress: PaymentSchemas.billingAddress,
    card: z.object({
      number: PaymentSchemas.cardNumber,
      holderName: PaymentSchemas.cardHolderName,
      expiryMonth: PaymentSchemas.expiryMonth,
      expiryYear: PaymentSchemas.expiryYear,
      cvv: PaymentSchemas.cvv,
    }).optional(),
    bank: z.object({
      accountNumber: PaymentSchemas.accountNumber,
      routingNumber: PaymentSchemas.routingNumber,
      holderName: PaymentSchemas.accountHolderName,
      bankName: PaymentSchemas.bankName,
    }).optional(),
    isDefault: z.boolean().default(false),
  }),
  
  createTransaction: z.object({
    amount: PaymentSchemas.amount,
    currency: PaymentSchemas.currency,
    paymentMethodId: CommonSchemas.uuid,
    description: z.string().max(500).optional(),
    metadata: CommonSchemas.metadata,
  }),
  
  createInvoice: z.object({
    userId: CommonSchemas.uuid,
    type: PaymentSchemas.invoiceType,
    amount: PaymentSchemas.amount,
    tax: PaymentSchemas.tax,
    currency: PaymentSchemas.currency,
    dueDate: PaymentSchemas.dueDate,
    description: z.string().max(1000).optional(),
    items: z.array(z.object({
      name: StringValidators.nonEmpty(),
      description: z.string().max(2000).optional(),
      quantity: NumberValidators.positive(),
      unitPrice: PaymentSchemas.price,
    })),
    billingAddress: PaymentSchemas.billingAddress.optional(),
  }),
}

// Order schemas
export const OrderSchemas = {
  // Order schemas
  orderStatus: z.enum(['draft', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  orderType: z.enum(['online', 'in_store', 'phone', 'subscription']),
  
  // Order item schemas
  orderItem: z.object({
    productId: CommonSchemas.uuid,
    name: StringValidators.nonEmpty(),
    description: z.string().max(2000).optional(),
    quantity: NumberValidators.positive(),
    unitPrice: PaymentSchemas.price,
    totalPrice: PaymentSchemas.price,
    discount: NumberValidators.nonNegative().optional(),
    tax: NumberValidators.nonNegative().optional(),
  }),
  
  // Shipping address schemas
  shippingAddress: PaymentSchemas.billingAddress.extend({
    recipientName: StringValidators.nonEmpty(),
    instructions: z.string().max(500).optional(),
  }),
  
  // Order fulfillment schemas
  fulfillment: z.object({
    type: z.enum(['shipping', 'pickup', 'digital']),
    trackingNumber: StringValidators.alphaNumeric().optional(),
    carrier: StringValidators.nonEmpty().optional(),
    estimatedDelivery: DateValidators.future().optional(),
    actualDelivery: DateValidators.past().optional(),
  }),
  
  // Complete order schemas
  createOrder: z.object({
    userId: CommonSchemas.uuid,
    type: OrderSchemas.orderType,
    items: z.array(OrderSchemas.orderItem).min(1),
    shippingAddress: OrderSchemas.shippingAddress,
    billingAddress: PaymentSchemas.billingAddress,
    currency: PaymentSchemas.currency,
    discount: NumberValidators.nonNegative().optional(),
    tax: NumberValidators.nonNegative().optional(),
    shipping: NumberValidators.nonNegative().optional(),
    notes: z.string().max(1000).optional(),
  }),
  
  updateOrderStatus: z.object({
    status: OrderSchemas.orderStatus,
    reason: z.string().max(500).optional(),
    fulfillment: OrderSchemas.fulfillment.optional(),
  }),
}

// Subscription schemas
export const SubscriptionSchemas = {
  // Subscription schemas
  subscriptionStatus: z.enum(['trial', 'active', 'grace_period', 'past_due', 'cancelled', 'expired']),
  subscriptionType: z.enum(['individual', 'business', 'enterprise', 'free']),
  
  // Plan schemas
  planName: StringValidators.nonEmpty(),
  planDescription: StringValidators.maxLength(1000),
  planPrice: PaymentSchemas.price,
  planCurrency: PaymentSchemas.currency,
  planInterval: z.enum(['monthly', 'quarterly', 'annually']),
  planFeatures: z.array(z.string()),
  
  // Usage schemas
  usageMetric: z.string(),
  usageValue: NumberValidators.nonNegative(),
  usageLimit: NumberValidators.positive(),
  usagePeriod: z.enum(['day', 'week', 'month', 'year']),
  
  // Complete subscription schemas
  createSubscriptionPlan: z.object({
    name: SubscriptionSchemas.planName,
    description: SubscriptionSchemas.planDescription,
    price: SubscriptionSchemas.planPrice,
    currency: SubscriptionSchemas.planCurrency,
    interval: SubscriptionSchemas.planInterval,
    features: SubscriptionSchemas.planFeatures,
    isActive: z.boolean().default(true),
    metadata: CommonSchemas.metadata,
  }),
  
  createSubscription: z.object({
    userId: CommonSchemas.uuid,
    planId: CommonSchemas.uuid,
    paymentMethodId: CommonSchemas.uuid,
    trialDays: NumberValidators.nonNegative().optional(),
    discountCode: z.string().optional(),
  }),
  
  recordUsage: z.object({
    subscriptionId: CommonSchemas.uuid,
    metric: SubscriptionSchemas.usageMetric,
    value: SubscriptionSchemas.usageValue,
    timestamp: z.date().optional(),
  }),
}

// Notification schemas
export const NotificationSchemas = {
  // Notification schemas
  notificationType: z.enum(['info', 'success', 'warning', 'error', 'system']),
  notificationChannel: z.enum(['email', 'sms', 'push', 'in_app', 'webhook']),
  notificationStatus: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']),
  notificationPriority: z.enum(['low', 'normal', 'high', 'urgent']),
  
  // Template schemas
  templateName: StringValidators.nonEmpty(),
  templateSlug: StringValidators.slug(),
  templateContent: StringValidators.nonEmpty(),
  templateSubject: z.string().max(500).optional(),
  
  // Preference schemas
  preferenceType: z.string(),
  preferenceFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  
  // Complete notification schemas
  createNotification: z.object({
    userId: CommonSchemas.uuid,
    type: NotificationSchemas.notificationType,
    title: StringValidators.nonEmpty(),
    message: StringValidators.nonEmpty(),
    channels: z.array(NotificationSchemas.notificationChannel),
    priority: NotificationSchemas.notificationPriority,
    templateId: CommonSchemas.uuid.optional(),
    scheduledFor: z.date().optional(),
    expiresAt: z.date().optional(),
    metadata: CommonSchemas.metadata,
  }),
  
  createTemplate: z.object({
    name: NotificationSchemas.templateName,
    slug: NotificationSchemas.templateSlug,
    type: NotificationSchemas.notificationType,
    channel: NotificationSchemas.notificationChannel,
    subject: NotificationSchemas.templateSubject,
    template: NotificationSchemas.templateContent,
    description: z.string().max(1000).optional(),
    variables: z.record(z.any()),
    isSystem: z.boolean().default(false),
    isActive: z.boolean().default(true),
  }),
  
  updatePreferences: z.object({
    type: NotificationSchemas.preferenceType,
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
    frequency: NotificationSchemas.preferenceFrequency,
    quietHoursEnabled: z.boolean(),
    quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  }),
}

// File schemas
export const FileSchemas = {
  // File schemas
  fileName: StringValidators.nonEmpty(),
  fileMime: z.string(),
  fileSize: NumberValidators.positive(),
  fileHash: StringValidators.hexColor().length(40),
  
  // Image schemas
  imageWidth: NumberValidators.positive(),
  imageHeight: NumberValidators.positive(),
  imageFormat: z.enum(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']),
  
  // Complete file schemas
  uploadFile: z.object({
    name: FileSchemas.fileName,
    type: FileSchemas.fileMime,
    size: FileSchemas.fileSize,
    content: z.string().base64(),
    metadata: CommonSchemas.metadata,
  }),
  
  uploadImage: z.object({
    name: FileSchemas.fileName,
    type: z.string().regex(/^image\//),
    size: FileSchemas.fileSize.max(10 * 1024 * 1024), // 10MB
    content: z.string().base64(),
    width: FileSchemas.imageWidth,
    height: FileSchemas.imageHeight,
    format: FileSchemas.imageFormat,
  }),
}

// API schemas
export const APISchemas = {
  // Request schemas
  requestId: StringValidators.alphaNumeric().min(10),
  sessionId: CommonSchemas.uuid,
  apiVersion: CustomValidators.semver(),
  
  // Response schemas
  success: z.boolean(),
  message: z.string().max(500).optional(),
  code: z.string(),
  
  // Complete API schemas
  apiResponse: z.object({
    success: APISchemas.success,
    data: z.any().optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional(),
    }).optional(),
    message: APISchemas.message,
    meta: z.object({
      version: APISchemas.apiVersion.optional(),
      pagination: z.object({
        page: CommonSchemas.page,
        limit: CommonSchemas.limit,
        total: NumberValidators.nonNegative(),
        totalPages: NumberValidators.nonNegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }).optional(),
      timestamp: z.date(),
      requestId: APISchemas.requestId.optional(),
    }),
  }),
  
  errorResponse: z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      field: z.string().optional(),
      details: z.record(z.any()).optional(),
    }),
    message: z.string(),
    timestamp: z.date(),
    requestId: APISchemas.requestId.optional(),
  }),
}

// Configuration schemas
export const ConfigSchemas = {
  // Database config
  database: z.object({
    host: z.string(),
    port: NumberValidators.range(1, 65535),
    database: z.string(),
    username: z.string(),
    password: z.string(),
    ssl: z.boolean(),
    poolSize: NumberValidators.range(1, 100).default(10),
  }),
  
  // Redis config
  redis: z.object({
    host: z.string(),
    port: NumberValidators.range(1, 65535),
    password: z.string().optional(),
    database: NumberValidators.range(0, 15).default(0),
    ttl: NumberValidators.positive().default(3600),
  }),
  
  // Email config
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'ses', 'mailgun']),
    host: z.string().optional(),
    port: NumberValidators.range(1, 65535).optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional(),
    fromEmail: StringValidators.email(),
    fromName: StringValidators.nonEmpty(),
  }),
  
  // Security config
  security: z.object({
    jwtSecret: StringValidators.minLength(32),
    jwtExpiresIn: StringValidators.nonEmpty(),
    bcryptRounds: NumberValidators.range(10, 15).default(12),
    sessionTimeout: NumberValidators.positive().default(86400),
    maxLoginAttempts: NumberValidators.range(3, 10).default(5),
    lockoutDuration: NumberValidators.positive().default(900),
  }),
  
  // File storage config
  storage: z.object({
    provider: z.enum(['local', 's3', 'gcs', 'azure']),
    bucket: z.string().optional(),
    region: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    baseUrl: StringValidators.url().optional(),
    maxSize: NumberValidators.positive(),
    allowedTypes: z.array(z.string()),
  }),
}

// Utility schemas
export const UtilitySchemas = {
  // Date range schema
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).refine(
    (data) => data.from <= data.to,
    {
      message: "End date must be after start date",
      path: ['to']
    }
  ),
  
  // Version schema
  version: CustomValidators.semver(),
  
  // JSON schema
  json: CustomValidators.jsonString(),
  
  // Base64 schema
  base64: CustomValidators.base64(),
  
  // ID schema (UUID or string ID)
  id: z.union([CommonSchemas.uuid, CommonSchemas.stringId, CommonSchemas.numericId]),
  
  // Pagination schema
  pagination: z.object({
    page: CommonSchemas.page,
    limit: CommonSchemas.limit,
    sortBy: CommonSchemas.sortBy.optional(),
    sortOrder: CommonSchemas.sortOrder,
  }),
  
  // Search schema
  search: z.object({
    query: CommonSchemas.search,
    filters: CommonSchemas.filters,
    page: CommonSchemas.page,
    limit: CommonSchemas.limit,
    sortBy: CommonSchemas.sortBy.optional(),
    sortOrder: CommonSchemas.sortOrder,
  }),
}

export {
  CommonSchemas,
  UserSchemas,
  PaymentSchemas,
  OrderSchemas,
  SubscriptionSchemas,
  NotificationSchemas,
  FileSchemas,
  APISchemas,
  ConfigSchemas,
  UtilitySchemas,
}
