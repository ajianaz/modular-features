import { z } from 'zod'

// Business validation rules
export const BusinessRules = {
  // User-related rules
  userAge: {
    min: 13,
    max: 120,
    message: 'User must be between 13 and 120 years old',
  },
  
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores',
  },
  
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPatterns: [
      'password',
      '123456',
      'qwerty',
      'admin',
      'user',
    ],
    message: 'Password must be 8-128 characters with uppercase, lowercase, numbers, and special characters',
  },
  
  // Payment-related rules
  transactionAmount: {
    min: 0.01,
    max: 1000000,
    maxDecimalPlaces: 2,
    message: 'Transaction amount must be between $0.01 and $1,000,000',
  },
  
  cardExpiry: {
    maxYears: 20,
    message: 'Card expiry date must be within the next 20 years',
  },
  
  // Order-related rules
  orderQuantity: {
    min: 1,
    max: 10000,
    message: 'Order quantity must be between 1 and 10,000',
  },
  
  orderValue: {
    min: 0.01,
    max: 10000000,
    message: 'Order value must be between $0.01 and $10,000,000',
  },
  
  // Subscription-related rules
  subscriptionTrialDays: {
    min: 0,
    max: 365,
    message: 'Trial period must be between 0 and 365 days',
  },
  
  subscriptionMaxUsers: {
    individual: 1,
    business: 100,
    enterprise: 1000,
    message: 'Number of users exceeds plan limit',
  },
  
  // File-related rules
  fileUploadSize: {
    avatar: { max: 5 * 1024 * 1024 }, // 5MB
    document: { max: 50 * 1024 * 1024 }, // 50MB
    video: { max: 500 * 1024 * 1024 }, // 500MB
    message: 'File size exceeds maximum allowed size',
  },
  
  fileName: {
    maxLength: 255,
    forbiddenChars: /[<>:"/\\|?*]/,
    forbiddenNames: [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
    ],
    message: 'Invalid file name',
  },
  
  // API-related rules
  requestRate: {
    default: { max: 100, window: '1m' },
    upload: { max: 10, window: '1m' },
    auth: { max: 5, window: '1m' },
    message: 'Rate limit exceeded',
  },
  
  pagination: {
    maxLimit: 100,
    defaultLimit: 20,
    message: 'Pagination limit must be between 1 and 100',
  },
  
  searchQuery: {
    maxLength: 1000,
    minLength: 2,
    message: 'Search query must be between 2 and 1000 characters',
  },
  
  // Notification-related rules
  notificationRecipients: {
    max: 1000,
    message: 'Cannot send to more than 1000 recipients at once',
  },
  
  notificationFrequency: {
    min: 'immediate',
    max: 'weekly',
    message: 'Invalid notification frequency',
  },
  
  // Audit-related rules
  auditRetention: {
    default: 2555, // 7 years
    security: 3650, // 10 years
    financial: 3650, // 10 years
    message: 'Invalid audit retention period',
  },
  
  // Security-related rules
  sessionTimeout: {
    min: 300, // 5 minutes
    max: 86400, // 24 hours
    default: 3600, // 1 hour
    message: 'Session timeout must be between 5 minutes and 24 hours',
  },
  
  maxLoginAttempts: {
    min: 3,
    max: 10,
    default: 5,
    message: 'Maximum login attempts must be between 3 and 10',
  },
  
  accountLockoutDuration: {
    min: 60, // 1 minute
    max: 86400, // 24 hours
    default: 900, // 15 minutes
    message: 'Account lockout duration must be between 1 minute and 24 hours',
  },
}

// Validation rule creators
export const ValidationRuleCreators = {
  // Age validation rule
  age: (min: number, max: number, message?: string) => z.date().refine(
    (date) => {
      const now = new Date()
      const age = now.getFullYear() - date.getFullYear()
      return age >= min && age <= max
    },
    message || `Age must be between ${min} and ${max} years`
  ),
  
  // Username validation rule
  username: (options: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
  } = {}) => {
    const {
      minLength = BusinessRules.username.minLength,
      maxLength = BusinessRules.username.maxLength,
      pattern = BusinessRules.username.pattern,
      message = BusinessRules.username.message
    } = options
    
    return z.string()
      .min(minLength)
      .max(maxLength)
      .regex(pattern, message)
  },
  
  // Password validation rule
  password: (options: {
    minLength?: number
    maxLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
    forbiddenPatterns?: string[]
    message?: string
  } = {}) => {
    const {
      minLength = BusinessRules.password.minLength,
      maxLength = BusinessRules.password.maxLength,
      requireUppercase = BusinessRules.password.requireUppercase,
      requireLowercase = BusinessRules.password.requireLowercase,
      requireNumbers = BusinessRules.password.requireNumbers,
      requireSpecialChars = BusinessRules.password.requireSpecialChars,
      forbiddenPatterns = BusinessRules.password.forbiddenPatterns,
      message = BusinessRules.password.message
    } = options
    
    let schema = z.string()
      .min(minLength)
      .max(maxLength)
    
    if (requireUppercase) {
      schema = schema.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    }
    
    if (requireLowercase) {
      schema = schema.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    }
    
    if (requireNumbers) {
      schema = schema.regex(/\d/, 'Password must contain at least one number')
    }
    
    if (requireSpecialChars) {
      schema = schema.regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }
    
    if (forbiddenPatterns.length > 0) {
      schema = schema.refine(
        (password) => !forbiddenPatterns.some(pattern => 
          password.toLowerCase().includes(pattern.toLowerCase())
        ),
        'Password contains a forbidden pattern'
      )
    }
    
    return schema
  },
  
  // Transaction amount validation rule
  transactionAmount: (options: {
    min?: number
    max?: number
    maxDecimalPlaces?: number
    currency?: string
    message?: string
  } = {}) => {
    const {
      min = BusinessRules.transactionAmount.min,
      max = BusinessRules.transactionAmount.max,
      maxDecimalPlaces = BusinessRules.transactionAmount.maxDecimalPlaces,
      currency = 'USD',
      message = BusinessRules.transactionAmount.message
    } = options
    
    return z.number()
      .min(min)
      .max(max)
      .refine(
        (amount) => {
          const decimalPlaces = amount.toString().split('.')[1]?.length || 0
          return decimalPlaces <= maxDecimalPlaces
        },
        `Amount cannot have more than ${maxDecimalPlaces} decimal places`
      )
  },
  
  // Card expiry validation rule
  cardExpiry: (options: {
    maxYears?: number
    message?: string
  } = {}) => {
    const {
      maxYears = BusinessRules.cardExpiry.maxYears,
      message = BusinessRules.cardExpiry.message
    } = options
    
    return z.object({
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + maxYears),
    }).refine(
      (expiry) => {
        const now = new Date()
        const expiryDate = new Date(expiry.year, expiry.month - 1)
        return expiryDate > now
      },
      message
    )
  },
  
  // File validation rule
  file: (options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
    message?: string
  } = {}) => {
    const {
      maxSize,
      allowedTypes,
      allowedExtensions,
      message
    } = options
    
    return z.object({
      name: z.string()
        .max(BusinessRules.fileName.maxLength)
        .regex(/^[^<>:"/\\|?*]*$/, 'File name contains invalid characters')
        .refine(
          (name) => !BusinessRules.fileName.forbiddenNames.includes(name.toUpperCase().split('.')[0]),
          'File name is reserved'
        ),
      size: maxSize !== undefined 
        ? z.number().max(maxSize, `File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`)
        : z.number(),
      type: allowedTypes
        ? z.string().refine(
            (type) => allowedTypes.includes(type),
            `File type must be one of: ${allowedTypes.join(', ')}`
          )
        : z.string(),
      content: z.string(),
    })
  },
  
  // Pagination validation rule
  pagination: (options: {
    maxLimit?: number
    defaultLimit?: number
    message?: string
  } = {}) => {
    const {
      maxLimit = BusinessRules.pagination.maxLimit,
      defaultLimit = BusinessRules.pagination.defaultLimit,
      message = BusinessRules.pagination.message
    } = options
    
    return z.object({
      page: z.number().int().positive().default(1),
      limit: z.number()
        .int()
        .positive()
        .max(maxLimit, message)
        .default(defaultLimit),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
  },
  
  // Search query validation rule
  searchQuery: (options: {
    minLength?: number
    maxLength?: number
    message?: string
  } = {}) => {
    const {
      minLength = BusinessRules.searchQuery.minLength,
      maxLength = BusinessRules.searchQuery.maxLength,
      message = BusinessRules.searchQuery.message
    } = options
    
    return z.string()
      .min(minLength, `Search query must be at least ${minLength} characters`)
      .max(maxLength, `Search query must not exceed ${maxLength} characters`)
      .trim()
  },
  
  // Rate limit validation rule
  rateLimit: (options: {
    max: number
    window: string
    message?: string
  }) => {
    const { max, window, message = BusinessRules.requestRate.default.message } = options
    
    // This would typically be implemented as middleware or service
    // Here we just create the schema for configuration
    return z.object({
      max: z.number().int().positive(),
      window: z.string(),
      message: z.string(),
    }).default({
      max,
      window,
      message,
    })
  },
  
  // Session timeout validation rule
  sessionTimeout: (options: {
    min?: number
    max?: number
    message?: string
  } = {}) => {
    const {
      min = BusinessRules.sessionTimeout.min,
      max = BusinessRules.sessionTimeout.max,
      message = BusinessRules.sessionTimeout.message
    } = options
    
    return z.number()
      .int()
      .min(min, `Session timeout must be at least ${min} seconds`)
      .max(max, `Session timeout must not exceed ${max} seconds`)
  },
  
  // Audit retention validation rule
  auditRetention: (options: {
    min?: number
    max?: number
    default?: number
    message?: string
  } = {}) => {
    const {
      min = 30,
      max = BusinessRules.auditRetention.security,
      defaultValue = BusinessRules.auditRetention.default,
      message = BusinessRules.auditRetention.message
    } = options
    
    return z.number()
      .int()
      .min(min, `Retention period must be at least ${min} days`)
      .max(max, `Retention period must not exceed ${max} days`)
      .default(defaultValue)
  },
  
  // Notification frequency validation rule
  notificationFrequency: (options: {
    allowed?: string[]
    message?: string
  } = {}) => {
    const {
      allowed = ['immediate', 'hourly', 'daily', 'weekly'],
      message = BusinessRules.notificationFrequency.message
    } = options
    
    return z.enum(['immediate', 'hourly', 'daily', 'weekly'] as [string, ...string[]], {
      errorMap: () => ({ message })
    })
  },
  
  // Email domain validation rule
  emailDomain: (options: {
    allowedDomains?: string[]
    blockedDomains?: string[]
    message?: string
  } = {}) => {
    const { allowedDomains, blockedDomains } = options
    
    return z.string().email().refine(
      (email) => {
        const domain = email.split('@')[1].toLowerCase()
        
        if (blockedDomains && blockedDomains.some(blocked => 
          domain === blocked.toLowerCase() || domain.endsWith(`.${blocked.toLowerCase()}`)
        )) {
          return false
        }
        
        if (allowedDomains && !allowedDomains.some(allowed => 
          domain === allowed.toLowerCase() || domain.endsWith(`.${allowed.toLowerCase()}`)
        )) {
          return false
        }
        
        return true
      },
      'Email domain is not allowed'
    )
  },
  
  // IP address range validation rule
  ipAddressRange: (options: {
    allowedRanges?: string[]
    blockedRanges?: string[]
    message?: string
  } = {}) => {
    const { allowedRanges, blockedRanges } = options
    
    return z.string().refine(
      (ip) => {
        // Simple IP validation (in real implementation, use proper IP library)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
        
        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
          return false
        }
        
        // Range checking would be implemented with proper IP library
        if (blockedRanges) {
          // Check if IP is in blocked ranges
        }
        
        if (allowedRanges) {
          // Check if IP is in allowed ranges
        }
        
        return true
      },
      'IP address is not allowed'
    )
  },
  
  // Business hours validation rule
  businessHours: (options: {
    timezone?: string
    businessDays?: number[] // 0 = Sunday, 6 = Saturday
    startTime?: string // HH:mm
    endTime?: string // HH:mm
    message?: string
  } = {}) => {
    const {
      timezone = 'UTC',
      businessDays = [1, 2, 3, 4, 5], // Monday to Friday
      startTime = '09:00',
      endTime = '17:00',
      message = 'Operation is only allowed during business hours'
    } = options
    
    return z.date().refine(
      (date) => {
        const dayOfWeek = date.getDay()
        const time = date.getHours() * 60 + date.getMinutes()
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
        const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
        
        return businessDays.includes(dayOfWeek) && time >= startMinutes && time <= endMinutes
      },
      message
    )
  },
}

// Rule combination utilities
export const RuleCombiners = {
  // Combine multiple rules with AND logic
  and: <T>(rules: z.ZodSchema<T>[]): z.ZodSchema<T> => {
    return z.intersection(rules[0], rules.length > 1 ? RuleCombiners.and(rules.slice(1)) : z.any())
  },
  
  // Combine multiple rules with OR logic
  or: <T>(rules: z.ZodSchema<T>[]): z.ZodSchema<T> => {
    return z.union(rules)
  },
  
  // Combine multiple rules with XOR logic (exactly one must pass)
  xor: <T>(rules: z.ZodSchema<T>[]): z.ZodSchema<T> => {
    return z.any().refine(
      (data) => rules.filter(rule => rule.safeParse(data).success).length === 1,
      'Exactly one of the conditions must be met'
    )
  },
  
  // Negate a rule
  not: <T>(rule: z.ZodSchema<T>, message?: string): z.ZodSchema<T> => {
    return z.any().refine(
      (data) => !rule.safeParse(data).success,
      message || 'Condition must not be met'
    )
  },
  
  // Create conditional rule
  conditional: <T>(
    condition: (data: any) => boolean,
    ifTrue: z.ZodSchema<T>,
    ifFalse?: z.ZodSchema<T>
  ): z.ZodSchema<T> => {
    return z.union([ifTrue, ifFalse || z.any()]).refine(
      (data) => condition(data) ? ifTrue.safeParse(data).success : !ifFalse || ifFalse.safeParse(data).success,
      'Conditional validation failed'
    )
  },
}

export {
  BusinessRules,
  ValidationRuleCreators,
  RuleCombiners,
}
