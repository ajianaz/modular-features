// Business logic constants

export const BUSINESS_RULES = {
  // User management rules
  USER: {
    MIN_AGE: 13,
    MAX_AGE: 120,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_EXPIRY_DAYS: 90,
    INACTIVE_ACCOUNT_DAYS: 365,
    PROFILE_PICTURE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    PROFILE_PICTURE_ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    SUPPORTED_LOCALES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh-CN', 'zh-TW'],
    DEFAULT_LOCALE: 'en',
    MAX_PROFILES_PER_USER: 5,
  },

  // Payment rules
  PAYMENT: {
    MIN_TRANSACTION_AMOUNT: 0.01,
    MAX_TRANSACTION_AMOUNT: 1000000,
    MAX_DECIMAL_PLACES: 2,
    SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK'],
    DEFAULT_CURRENCY: 'USD',
    MAX_REFUND_DAYS: 365,
    CHARGEBACK_DISPUTE_DAYS: 120,
    PAYMENT_TIMEOUT_MINUTES: 30,
    MAX_PAYMENT_ATTEMPTS: 3,
    MAX_PAYMENTS_PER_HOUR: 10,
    MAX_PAYMENTS_PER_DAY: 100,
    MIN_CARD_EXPIRY_MONTHS: 1,
    MAX_CARD_EXPIRY_YEARS: 20,
    SUPPORTED_CARD_BRANDS: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb'],
    MIN_INVOICE_AMOUNT: 0.01,
    MAX_INVOICE_AMOUNT: 1000000,
    INVOICE_DUE_DAYS: 30,
    INVOICE_OVERDUE_DAYS: 60,
    INVOICE_REMINDER_DAYS: [7, 14, 21, 28],
    MAX_PAYMENT_METHODS_PER_USER: 10,
    DEFAULT_PAYMENT_METHOD: 'card',
  },

  // Order rules
  ORDER: {
    MIN_ORDER_AMOUNT: 0.01,
    MAX_ORDER_AMOUNT: 1000000,
    MIN_ORDER_QUANTITY: 1,
    MAX_ORDER_QUANTITY: 10000,
    MAX_ITEMS_PER_ORDER: 100,
    MAX_ORDERS_PER_DAY: 50,
    ORDER_TIMEOUT_MINUTES: 30,
    ORDER_CANCELLATION_HOURS: 24,
    ORDER_RETURN_DAYS: 30,
    ORDER_SHIPPING_DAYS_MAX: 30,
    MIN_SHIPPING_WEIGHT_KG: 0.01,
    MAX_SHIPPING_WEIGHT_KG: 1000,
    MIN_SHIPPING_DIMENSIONS_CM: 1,
    MAX_SHIPPING_DIMENSIONS_CM: 200,
    SUPPORTED_SHIPPING_METHODS: ['standard', 'express', 'overnight', 'international', 'pickup'],
    DEFAULT_SHIPPING_METHOD: 'standard',
    ORDER_STATUS_TRANSITIONS: {
      draft: ['pending_payment', 'cancelled'],
      pending_payment: ['paid', 'cancelled', 'expired'],
      paid: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned', 'completed'],
      returned: ['refunded', 'cancelled'],
      cancelled: [],
      completed: [],
      expired: [],
      refunded: [],
    },
  },

  // Subscription rules
  SUBSCRIPTION: {
    MIN_TRIAL_DAYS: 0,
    MAX_TRIAL_DAYS: 365,
    DEFAULT_TRIAL_DAYS: 14,
    MIN_GRACE_PERIOD_DAYS: 0,
    MAX_GRACE_PERIOD_DAYS: 30,
    DEFAULT_GRACE_PERIOD_DAYS: 7,
    MIN_SUBSCRIPTION_DURATION_DAYS: 1,
    MAX_SUBSCRIPTION_DURATION_DAYS: 3650, // 10 years
    SUPPORTED_BILLING_CYCLES: ['monthly', 'quarterly', 'annually'],
    DEFAULT_BILLING_CYCLE: 'monthly',
    MIN_PLANS_PER_USER: 1,
    MAX_PLANS_PER_USER: 10,
    PLAN_CHANGE_COOLDOWN_DAYS: 7,
    CANCELLATION_REFUND_POLICY: {
      monthly: 'partial',
      quarterly: 'partial',
      annually: 'partial',
    },
    USAGE_TRACKING_INTERVAL_MINUTES: 15,
    USAGE_RETENTION_DAYS: 90,
    MAX_USAGE_RECORDS_PER_DAY: 1000,
  },

  // Notification rules
  NOTIFICATION: {
    MAX_RECIPIENTS_PER_BATCH: 1000,
    MAX_NOTIFICATIONS_PER_MINUTE: 100,
    MAX_NOTIFICATIONS_PER_HOUR: 1000,
    MAX_NOTIFICATIONS_PER_DAY: 10000,
    NOTIFICATION_RETRY_ATTEMPTS: 3,
    NOTIFICATION_RETRY_DELAY_MINUTES: 5,
    EMAIL_DELIVERY_TIMEOUT_MINUTES: 30,
    SMS_DELIVERY_TIMEOUT_MINUTES: 10,
    PUSH_NOTIFICATION_EXPIRY_SECONDS: 3600, // 1 hour
    IN_APP_NOTIFICATION_RETENTION_DAYS: 30,
    MAX_TEMPLATE_VARIABLES: 50,
    MAX_TEMPLATE_LENGTH: 10000,
    SUPPORTED_CHANNELS: ['email', 'sms', 'push', 'in_app', 'webhook'],
    DEFAULT_CHANNELS: ['email', 'in_app'],
    NOTIFICATION_PREFERENCES: {
      email: { default: true, required: false },
      sms: { default: false, required: false },
      push: { default: true, required: false },
      in_app: { default: true, required: true },
    },
    QUIET_HOURS_DEFAULT: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC',
    },
  },

  // File and storage rules
  FILE: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILES_PER_USER: 10000,
    MAX_STORAGE_PER_USER: 10 * 1024 * 1024 * 1024, // 10GB
    MAX_FILES_PER_FOLDER: 1000,
    MAX_FOLDER_DEPTH: 10,
    MAX_FILENAME_LENGTH: 255,
    FORBIDDEN_FILENAMES: [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
    ],
    ALLOWED_FILE_EXTENSIONS: [
      // Documents
      'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'odp',
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff',
      // Audio
      'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma',
      // Video
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v',
      // Archives
      'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
      // Code
      'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'less', 'py', 'java', 'cpp', 'c',
      // Other
      'md', 'yaml', 'yml', 'json', 'xml',
    ],
    IMAGE_MAX_DIMENSIONS: 10000, // pixels
    IMAGE_MAX_SIZE_MB: 50,
    VIDEO_MAX_SIZE_MB: 500,
    AUDIO_MAX_SIZE_MB: 100,
    DOCUMENT_MAX_SIZE_MB: 50,
  },

  // Rate limiting rules
  RATE_LIMITING: {
    DEFAULT_LIMIT_PER_MINUTE: 100,
    DEFAULT_LIMIT_PER_HOUR: 1000,
    DEFAULT_LIMIT_PER_DAY: 10000,
    AUTH_LIMIT_PER_MINUTE: 5,
    AUTH_LIMIT_PER_HOUR: 20,
    SEARCH_LIMIT_PER_MINUTE: 60,
    SEARCH_LIMIT_PER_HOUR: 1000,
    UPLOAD_LIMIT_PER_HOUR: 10,
    UPLOAD_LIMIT_PER_DAY: 100,
    API_KEY_LIMIT_PER_MINUTE: 1000,
    WEBHOOK_LIMIT_PER_MINUTE: 100,
    EMAIL_LIMIT_PER_MINUTE: 50,
    SMS_LIMIT_PER_MINUTE: 10,
    PUSH_LIMIT_PER_MINUTE: 100,
    PAYMENT_LIMIT_PER_HOUR: 5,
    ORDER_LIMIT_PER_HOUR: 20,
    INVITE_LIMIT_PER_DAY: 10,
    PASSWORD_RESET_LIMIT_PER_HOUR: 3,
    EMAIL_CHANGE_LIMIT_PER_DAY: 3,
  },

  // Audit and compliance rules
  AUDIT: {
    LOG_RETENTION_DAYS: 2555, // 7 years
    AUDIT_LOG_RETENTION_DAYS: 3650, // 10 years
    SECURITY_LOG_RETENTION_DAYS: 3650, // 10 years
    ACCESS_LOG_RETENTION_DAYS: 90,
    MAX_LOG_SIZE_MB: 100,
    LOG_ROTATION_INTERVAL_HOURS: 24,
    AUDIT_TRAIL_REQUIRED_ACTIONS: [
      'user_login', 'user_logout', 'user_register', 'user_delete',
      'password_change', 'email_change', 'permission_change',
      'payment_initiated', 'payment_completed', 'payment_refunded',
      'order_created', 'order_cancelled', 'order_shipped',
      'subscription_created', 'subscription_cancelled', 'subscription_changed',
      'admin_action', 'security_event', 'data_export', 'data_import',
    ],
    DATA_EXPORT_RETENTION_DAYS: 30,
    COMPLIANCE_REPORT_RETENTION_DAYS: 2555, // 7 years
    MAX_AUDIT_EVENTS_PER_REQUEST: 10,
  },

  // API rules
  API: {
    MAX_REQUEST_SIZE_MB: 10,
    MAX_RESPONSE_SIZE_MB: 100,
    REQUEST_TIMEOUT_SECONDS: 30,
    MAX_QUERY_PARAMETERS: 100,
    MAX_PATH_LENGTH: 2000,
    MAX_HEADER_SIZE_BYTES: 8192,
    SUPPORTED_API_VERSIONS: ['v1'],
    DEPRECATED_API_VERSIONS: [],
    API_VERSION_EOL_NOTIFICATION_DAYS: 90,
    MAX_CONCURRENT_REQUESTS_PER_USER: 10,
    MAX_REQUESTS_PER_SECOND: 100,
    PAGINATION_MAX_LIMIT: 1000,
    PAGINATION_DEFAULT_LIMIT: 20,
    SEARCH_MAX_RESULTS: 10000,
    BULK_OPERATION_MAX_SIZE: 1000,
    WEBHOOK_TIMEOUT_SECONDS: 10,
    WEBHOOK_MAX_ATTEMPTS: 3,
    WEBHOOK_RETRY_DELAY_SECONDS: 60,
  },

  // Security rules
  SECURITY: {
    MIN_PASSWORD_STRENGTH: 'medium',
    PASSWORD_HISTORY_COUNT: 5,
    PASSWORD_REUSE_DAYS: 90,
    MIN_SESSION_IDLE_MINUTES: 30,
    MAX_SESSION_DURATION_DAYS: 30,
    MFA_REQUIRED_FOR_SENSITIVE_ACTIONS: true,
    MFA_SETUP_GRACE_PERIOD_DAYS: 7,
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
    REQUIRED_HEADERS: ['User-Agent', 'Accept'],
    ALLOWED_ORIGINS: [], // Configured per environment
    CSP_DEFAULT: "default-src 'self'",
    CORS_MAX_AGE_SECONDS: 86400, // 24 hours
    SESSION_COOKIE_SECURE: true,
    SESSION_COOKIE_HTTP_ONLY: true,
    SESSION_COOKIE_SAME_SITE: 'strict',
    CSRF_TOKEN_EXPIRY_MINUTES: 60,
    JWT_EXPIRY_MINUTES: 60,
    JWT_REFRESH_EXPIRY_DAYS: 7,
  },

  // Business hours rules
  BUSINESS_HOURS: {
    DEFAULT_TIMEZONE: 'UTC',
    BUSINESS_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
    BUSINESS_HOURS_START: '09:00',
    BUSINESS_HOURS_END: '17:00',
    EXCLUDED_HOLIDAYS: [], // Configured per country
    EMERGENCY_CONTACT_AVAILABLE: true,
    SUPPORT_RESPONSE_TIME_HOURS: 24,
    CRITICAL_SUPPORT_RESPONSE_TIME_MINUTES: 30,
  },

  // Data retention rules
  DATA_RETENTION: {
    USER_DATA_RETENTION_DAYS: 3650, // 10 years
    INACTIVE_USER_DELETION_DAYS: 2555, // 7 years
    TRANSACTION_DATA_RETENTION_DAYS: 2555, // 7 years
    ORDER_DATA_RETENTION_DAYS: 2555, // 7 years
    SUBSCRIPTION_DATA_RETENTION_DAYS: 3650, // 10 years
    NOTIFICATION_DATA_RETENTION_DAYS: 90,
    LOG_DATA_RETENTION_DAYS: 2555, // 7 years
    CACHE_DATA_RETENTION_DAYS: 30,
    TEMPORARY_DATA_RETENTION_HOURS: 24,
    BACKUP_RETENTION_DAYS: 90,
    GDPR_ANONYMIZATION_DAYS: 2555, // 7 years
  },

  // Performance rules
  PERFORMANCE: {
    MAX_RESPONSE_TIME_MS: 5000,
    MAX_DB_QUERY_TIME_MS: 1000,
    MAX_EXTERNAL_API_TIME_MS: 10000,
    MAX_FILE_PROCESSING_TIME_SECONDS: 300, // 5 minutes
    MAX_CONCURRENT_USERS: 10000,
    MAX_CONCURRENT_OPERATIONS_PER_USER: 5,
    CACHE_EXPIRY_MINUTES: 60,
    SLOW_QUERY_THRESHOLD_MS: 500,
    MEMORY_USAGE_THRESHOLD_PERCENT: 80,
    CPU_USAGE_THRESHOLD_PERCENT: 80,
    DISK_USAGE_THRESHOLD_PERCENT: 80,
  },
} as const

// Business status constants
export const BUSINESS_STATUS = {
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending_verification',
    DEACTIVATED: 'deactivated',
    DELETED: 'deleted',
  },

  PAYMENT: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
    CHARGED_BACK: 'charged_back',
  },

  ORDER: {
    DRAFT: 'draft',
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
    EXPIRED: 'expired',
    REFUNDED: 'refunded',
  },

  SUBSCRIPTION: {
    TRIAL: 'trial',
    ACTIVE: 'active',
    GRACE_PERIOD: 'grace_period',
    PAST_DUE: 'past_due',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended',
  },

  NOTIFICATION: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    BOUNCED: 'bounced',
    OPENED: 'opened',
    CLICKED: 'clicked',
  },

  FILE: {
    UPLOADING: 'uploading',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    DELETED: 'deleted',
  },

  AUDIT: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SECURITY: 'security',
    COMPLIANCE: 'compliance',
  },
} as const

// Business metrics constants
export const BUSINESS_METRICS = {
  USER: {
    REGISTRATION_RATE: 'user_registration_rate',
    LOGIN_RATE: 'user_login_rate',
    ACTIVE_USERS: 'active_users',
    CHURN_RATE: 'user_churn_rate',
    LIFETIME_VALUE: 'user_lifetime_value',
  },

  PAYMENT: {
    REVENUE: 'payment_revenue',
    SUCCESS_RATE: 'payment_success_rate',
    FAILURE_RATE: 'payment_failure_rate',
    REFUND_RATE: 'payment_refund_rate',
    CHARGEBACK_RATE: 'payment_chargeback_rate',
    AVERAGE_ORDER_VALUE: 'average_order_value',
  },

  ORDER: {
    COMPLETION_RATE: 'order_completion_rate',
    CANCELLATION_RATE: 'order_cancellation_rate',
    RETURN_RATE: 'order_return_rate',
    PROCESSING_TIME: 'order_processing_time',
    DELIVERY_TIME: 'order_delivery_time',
  },

  SUBSCRIPTION: {
    CONVERSION_RATE: 'subscription_conversion_rate',
    CANCELLATION_RATE: 'subscription_cancellation_rate',
    RETENTION_RATE: 'subscription_retention_rate',
    UPGRADE_RATE: 'subscription_upgrade_rate',
    DOWNGRADE_RATE: 'subscription_downgrade_rate',
  },

  NOTIFICATION: {
    DELIVERY_RATE: 'notification_delivery_rate',
    OPEN_RATE: 'notification_open_rate',
    CLICK_RATE: 'notification_click_rate',
    BOUNCE_RATE: 'notification_bounce_rate',
  },

  PERFORMANCE: {
    RESPONSE_TIME: 'response_time',
    THROUGHPUT: 'throughput',
    ERROR_RATE: 'error_rate',
    AVAILABILITY: 'availability',
    RESOURCE_USAGE: 'resource_usage',
  },
} as const

// Business workflow constants
export const BUSINESS_WORKFLOWS = {
  USER_ONBOARDING: [
    'registration',
    'email_verification',
    'profile_creation',
    'preferences_setup',
    'welcome_notification',
  ],

  USER_OFFBOARDING: [
    'account_deactivation',
    'data_export',
    'subscription_cancellation',
    'payment_method_removal',
    'account_deletion',
  ],

  PAYMENT_PROCESSING: [
    'payment_initiation',
    'payment_validation',
    'payment_authorization',
    'payment_capture',
    'payment_completion',
  ],

  ORDER_FULFILLMENT: [
    'order_placement',
    'payment_processing',
    'inventory_allocation',
    'packaging',
    'shipping',
    'delivery',
    'order_completion',
  ],

  SUBSCRIPTION_LIFECYCLE: [
    'trial_start',
    'trial_conversion',
    'regular_billing',
    'renewal',
    'cancellation',
    'expiration',
  ],

  NOTIFICATION_SENDING: [
    'template_rendering',
    'recipient_validation',
    'delivery_attempt',
    'delivery_confirmation',
    'failure_handling',
    'retry_logic',
  ],
} as const

// Business validation constants
export const BUSINESS_VALIDATION = {
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]{3,30}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[\d\s-()]+$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  CURRENCY_PATTERN: /^[A-Z]{3}$/,
  URL_PATTERN: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  IPV4_PATTERN: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  HEX_COLOR_PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const

// Business calculation constants
export const BUSINESS_CALCULATIONS = {
  TAX_RATES: {
    US: 0.08, // 8% average
    EU: 0.21, // 21% average
    UK: 0.20, // 20%
    CA: 0.05, // 5% GST
    AU: 0.10, // 10% GST
  },
  SHIPPING_RATES: {
    standard: { base: 5.99, per_kg: 2.00 },
    express: { base: 12.99, per_kg: 4.00 },
    overnight: { base: 24.99, per_kg: 8.00 },
    international: { base: 29.99, per_kg: 10.00 },
  },
  DISCOUNT_RULES: {
    EARLY_BIRD: { percentage: 0.20, days_before: 30 },
    BULK_ORDER: { percentage: 0.15, min_quantity: 10 },
    LOYALTY: { percentage: 0.10, min_months: 12 },
    REFERRAL: { percentage: 0.25, first_order_only: true },
  },
  COMMISSION_RATES: {
    PLATFORM: { percentage: 0.029, flat_fee: 0.30 },
    AFFILIATE: { percentage: 0.10, recurring: false },
    PARTNER: { percentage: 0.15, recurring: true },
  },
  PENALTY_RATES: {
    LATE_PAYMENT: { percentage: 0.05, per_month: true },
    ORDER_CANCELLATION: { percentage: 0.10, per_order: true },
    SUBSCRIPTION_CANCELLATION: { percentage: 0.25, early_termination: true },
  },
} as const

// Utility functions
export const BusinessUtils = {
  // Check if business hours
  isBusinessHours(date: Date = new Date(), timezone: string = 'UTC'): boolean {
    // Simplified implementation - in real app, use proper timezone library
    const dayOfWeek = date.getDay()
    const hour = date.getUTCHours()
    
    const businessDays = BUSINESS_RULES.BUSINESS_HOURS.BUSINESS_DAYS
    const startHour = parseInt(BUSINESS_RULES.BUSINESS_HOURS.BUSINESS_HOURS_START.split(':')[0])
    const endHour = parseInt(BUSINESS_RULES.BUSINESS_HOURS.BUSINESS_HOURS_END.split(':')[0])
    
    return businessDays.includes(dayOfWeek) && hour >= startHour && hour < endHour
  },

  // Calculate business days between dates
  getBusinessDays(startDate: Date, endDate: Date): number {
    let businessDays = 0
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      if (BUSINESS_RULES.BUSINESS_HOURS.BUSINESS_DAYS.includes(dayOfWeek)) {
        businessDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return businessDays
  },

  // Check if age is valid
  isValidAge(birthDate: Date): boolean {
    const now = new Date()
    const age = now.getFullYear() - birthDate.getFullYear()
    const minAge = BUSINESS_RULES.USER.MIN_AGE
    const maxAge = BUSINESS_RULES.USER.MAX_AGE
    
    return age >= minAge && age <= maxAge
  },

  // Check if password strength meets requirements
  getPasswordStrength(password: string): {
    score: number
    strength: 'weak' | 'fair' | 'good' | 'strong'
    requirements: {
      length: boolean
      lowercase: boolean
      uppercase: boolean
      numbers: boolean
      symbols: boolean
    }
  } {
    const minLength = BUSINESS_RULES.USER.MIN_PASSWORD_LENGTH
    const requirements = {
      length: password.length >= minLength,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[@$!%*?&]/.test(password),
    }
    
    const metRequirements = Object.values(requirements).filter(Boolean).length
    const score = (metRequirements / 5) * 100
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 80) strength = 'strong'
    else if (score >= 60) strength = 'good'
    else if (score >= 40) strength = 'fair'
    
    return { score, strength, requirements }
  },

  // Calculate tax amount
  calculateTax(amount: number, country: string, taxRate?: number): number {
    const rate = taxRate || BUSINESS_CALCULATIONS.TAX_RATES[country as keyof typeof BUSINESS_CALCULATIONS.TAX_RATES] || 0
    return amount * rate
  },

  // Calculate shipping cost
  calculateShippingCost(
    weight: number, 
    method: keyof typeof BUSINESS_CALCULATIONS.SHIPPING_RATES
  ): number {
    const rates = BUSINESS_CALCULATIONS.SHIPPING_RATES[method]
    if (!rates) throw new Error(`Invalid shipping method: ${method}`)
    
    return rates.base + (weight * rates.per_kg)
  },

  // Apply discount
  applyDiscount(
    amount: number, 
    discountType: keyof typeof BUSINESS_CALCULATIONS.DISCOUNT_RULES
  ): number {
    const discount = BUSINESS_CALCULATIONS.DISCOUNT_RULES[discountType]
    if (!discount) return amount
    
    return amount * (1 - discount.percentage)
  },

  // Calculate commission
  calculateCommission(
    amount: number, 
    commissionType: keyof typeof BUSINESS_CALCULATIONS.COMMISSION_RATES
  ): number {
    const commission = BUSINESS_CALCULATIONS.COMMISSION_RATES[commissionType]
    if (!commission) return 0
    
    return (amount * commission.percentage) + commission.flat_fee
  },

  // Apply penalty
  applyPenalty(
    amount: number, 
    penaltyType: keyof typeof BUSINESS_CALCULATIONS.PENALTY_RATES
  ): number {
    const penalty = BUSINESS_CALCULATIONS.PENALTY_RATES[penaltyType]
    if (!penalty) return amount
    
    return amount * (1 + penalty.percentage)
  },

  // Get next business day
  getNextBusinessDay(date: Date = new Date()): Date {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Keep adding days until we hit a business day
    while (!BUSINESS_RULES.BUSINESS_HOURS.BUSINESS_DAYS.includes(nextDay.getDay())) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    
    return nextDay
  },

  // Check if transition is allowed
  isStatusTransitionAllowed(
    currentStatus: string, 
    newStatus: string, 
    transitions: Record<string, string[]>
  ): boolean {
    const allowedTransitions = transitions[currentStatus] || []
    return allowedTransitions.includes(newStatus)
  },

  // Format currency
  formatCurrency(amount: number, currency: string = BUSINESS_RULES.PAYMENT.DEFAULT_CURRENCY): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },
}

export default {
  BUSINESS_RULES,
  BUSINESS_STATUS,
  BUSINESS_METRICS,
  BUSINESS_WORKFLOWS,
  BUSINESS_VALIDATION,
  BUSINESS_CALCULATIONS,
  BusinessUtils,
}
