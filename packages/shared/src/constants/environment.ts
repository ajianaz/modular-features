// Environment constants

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
} as const

export const NODE_ENVIRONMENTS = {
  DEVELOPMENT: 'dev',
  PRODUCTION: 'prod',
  TEST: 'test',
} as const

export const ENVIRONMENT_VARIABLES = {
  // Core environment
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',
  DEBUG: 'DEBUG',

  // Database configuration
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_HOST: 'DATABASE_HOST',
  DATABASE_PORT: 'DATABASE_PORT',
  DATABASE_NAME: 'DATABASE_NAME',
  DATABASE_USER: 'DATABASE_USER',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
  DATABASE_SSL: 'DATABASE_SSL',
  DATABASE_POOL_SIZE: 'DATABASE_POOL_SIZE',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',

  // Redis configuration
  REDIS_URL: 'REDIS_URL',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  REDIS_DB: 'REDIS_DB',
  REDIS_TTL: 'REDIS_TTL',
  REDIS_MAX_MEMORY: 'REDIS_MAX_MEMORY',

  // JWT configuration
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRY: 'JWT_EXPIRY',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRY: 'JWT_REFRESH_EXPIRY',
  JWT_ISSUER: 'JWT_ISSUER',
  JWT_AUDIENCE: 'JWT_AUDIENCE',

  // OAuth configuration
  OAUTH_CLIENT_ID: 'OAUTH_CLIENT_ID',
  OAUTH_CLIENT_SECRET: 'OAUTH_CLIENT_SECRET',
  OAUTH_REDIRECT_URI: 'OAUTH_REDIRECT_URI',
  OAUTH_SCOPE: 'OAUTH_SCOPE',
  OAUTH_STATE: 'OAUTH_STATE',
  KEYCLOAK_URL: 'KEYCLOAK_URL',
  KEYCLOAK_REALM: 'KEYCLOAK_REALM',

  // Email configuration
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
  SMTP_FROM_NAME: 'SMTP_FROM_NAME',
  SMTP_TLS: 'SMTP_TLS',
  SMTP_SSL: 'SMTP_SSL',
  SENDGRID_API_KEY: 'SENDGRID_API_KEY',
  SENDGRID_FROM_EMAIL: 'SENDGRID_FROM_EMAIL',
  SENDGRID_FROM_NAME: 'SENDGRID_FROM_NAME',

  // SMS configuration
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_PHONE_NUMBER: 'TWILIO_PHONE_NUMBER',
  TWILIO_MESSAGING_SERVICE_SID: 'TWILIO_MESSAGING_SERVICE_SID',

  // File storage configuration
  STORAGE_TYPE: 'STORAGE_TYPE',
  STORAGE_BUCKET: 'STORAGE_BUCKET',
  STORAGE_REGION: 'STORAGE_REGION',
  STORAGE_ACCESS_KEY: 'STORAGE_ACCESS_KEY',
  STORAGE_SECRET_KEY: 'STORAGE_SECRET_KEY',
  STORAGE_ENDPOINT: 'STORAGE_ENDPOINT',
  STORAGE_SSL: 'STORAGE_SSL',
  UPLOAD_MAX_SIZE: 'UPLOAD_MAX_SIZE',
  UPLOAD_ALLOWED_TYPES: 'UPLOAD_ALLOWED_TYPES',

  // Payment provider configuration
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  STRIPE_PUBLISHABLE_KEY: 'STRIPE_PUBLISHABLE_KEY',
  STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
  MIDTRANS_SERVER_KEY: 'MIDTRANS_SERVER_KEY',
  MIDTRANS_CLIENT_KEY: 'MIDTRANS_CLIENT_KEY',
  XENDIT_SECRET_KEY: 'XENDIT_SECRET_KEY',
  XENDIT_PUBLISHABLE_KEY: 'XENDIT_PUBLISHABLE_KEY',
  COINBASE_API_KEY: 'COINBASE_API_KEY',
  COINBASE_API_SECRET: 'COINBASE_API_SECRET',
  COINBASE_WEBHOOK_SECRET: 'COINBASE_WEBHOOK_SECRET',

  // External services configuration
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  FACEBOOK_APP_ID: 'FACEBOOK_APP_ID',
  FACEBOOK_APP_SECRET: 'FACEBOOK_APP_SECRET',
  GITHUB_CLIENT_ID: 'GITHUB_CLIENT_ID',
  GITHUB_CLIENT_SECRET: 'GITHUB_CLIENT_SECRET',
  LINKEDIN_CLIENT_ID: 'LINKEDIN_CLIENT_ID',
  LINKEDIN_CLIENT_SECRET: 'LINKEDIN_CLIENT_SECRET',

  // Logging configuration
  LOG_LEVEL: 'LOG_LEVEL',
  LOG_FORMAT: 'LOG_FORMAT',
  LOG_FILE: 'LOG_FILE',
  LOG_MAX_SIZE: 'LOG_MAX_SIZE',
  LOG_MAX_FILES: 'LOG_MAX_FILES',
  SENTRY_DSN: 'SENTRY_DSN',
  SENTRY_ENVIRONMENT: 'SENTRY_ENVIRONMENT',

  // Monitoring configuration
  METRICS_ENABLED: 'METRICS_ENABLED',
  METRICS_PORT: 'METRICS_PORT',
  PROMETHEUS_ENABLED: 'PROMETHEUS_ENABLED',
  PROMETHEUS_PORT: 'PROMETHEUS_PORT',
  HEALTH_CHECK_PATH: 'HEALTH_CHECK_PATH',
  METRICS_PATH: 'METRICS_PATH',

  // Security configuration
  CORS_ORIGIN: 'CORS_ORIGIN',
  CORS_METHODS: 'CORS_METHODS',
  CORS_HEADERS: 'CORS_HEADERS',
  CORS_CREDENTIALS: 'CORS_CREDENTIALS',
  CSP_ENABLED: 'CSP_ENABLED',
  CSP_DIRECTIVES: 'CSP_DIRECTIVES',
  RATE_LIMIT_ENABLED: 'RATE_LIMIT_ENABLED',
  RATE_LIMIT_WINDOW: 'RATE_LIMIT_WINDOW',
  RATE_LIMIT_MAX_REQUESTS: 'RATE_LIMIT_MAX_REQUESTS',
  BCRYPT_ROUNDS: 'BCRYPT_ROUNDS',
  SESSION_SECRET: 'SESSION_SECRET',

  // Feature flags
  FEATURE_OAUTH: 'FEATURE_OAUTH',
  FEATURE_EMAIL_VERIFICATION: 'FEATURE_EMAIL_VERIFICATION',
  FEATURE_TWO_FACTOR: 'FEATURE_TWO_FACTOR',
  FEATURE_FILE_UPLOAD: 'FEATURE_FILE_UPLOAD',
  FEATURE_NOTIFICATIONS: 'FEATURE_NOTIFICATIONS',
  FEATURE_AUDIT_LOG: 'FEATURE_AUDIT_LOG',
  FEATURE_RATE_LIMITING: 'FEATURE_RATE_LIMITING',
  FEATURE_MONITORING: 'FEATURE_MONITORING',
  FEATURE_BILLING: 'FEATURE_BILLING',
  FEATURE_SUBSCRIPTIONS: 'FEATURE_SUBSCRIPTIONS',

  // Application configuration
  APP_NAME: 'APP_NAME',
  APP_VERSION: 'APP_VERSION',
  APP_DESCRIPTION: 'APP_DESCRIPTION',
  APP_URL: 'APP_URL',
  APP_BASE_URL: 'APP_BASE_URL',
  APP_DOMAIN: 'APP_DOMAIN',
  APP_LOGO: 'APP_LOGO',
  APP_FAVICON: 'APP_FAVICON',

  // Admin configuration
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  ADMIN_PASSWORD: 'ADMIN_PASSWORD',
  ADMIN_USERNAME: 'ADMIN_USERNAME',
  ADMIN_FIRST_NAME: 'ADMIN_FIRST_NAME',
  ADMIN_LAST_NAME: 'ADMIN_LAST_NAME',

  // External API configuration
  WEATHER_API_KEY: 'WEATHER_API_KEY',
  GOOGLE_MAPS_API_KEY: 'GOOGLE_MAPS_API_KEY',
  RECAPTCHA_SECRET_KEY: 'RECAPTCHA_SECRET_KEY',
  RECAPTCHA_SITE_KEY: 'RECAPTCHA_SITE_KEY',

  // Performance configuration
  CACHE_TTL: 'CACHE_TTL',
  CACHE_SIZE: 'CACHE_SIZE',
  ENABLE_COMPRESSION: 'ENABLE_COMPRESSION',
  COMPRESSION_LEVEL: 'COMPRESSION_LEVEL',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  RESPONSE_TIMEOUT: 'RESPONSE_TIMEOUT',

  // Development configuration
  DEV_MOCK_EXTERNAL_APIS: 'DEV_MOCK_EXTERNAL_APIS',
  DEV_SEED_DATA: 'DEV_SEED_DATA',
  DEV_VERBOSE_LOGGING: 'DEV_VERBOSE_LOGGING',
  DEV_DEBUG_SQL: 'DEV_DEBUG_SQL',
  DEV_HOT_RELOAD: 'DEV_HOT_RELOAD',
} as const

// Environment validation patterns
export const ENVIRONMENT_VALIDATION = {
  // Required patterns
  PATTERNS: {
    URL: /^https?:\/\/.+/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s-()]+$/,
    PORT: /^(0|[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    DATABASE_URL: /^(postgres|mysql|mongodb):\/\/.+/,
    REDIS_URL: /^redis:\/\/.+/,
    JWT_SECRET: /^.{32,}$/,
    SEMVER: /^\d+\.\d+\.\d+(-.*)?$/,
  },

  // Required variables by environment
  REQUIRED: {
    [ENVIRONMENTS.PRODUCTION]: [
      ENVIRONMENT_VARIABLES.NODE_ENV,
      ENVIRONMENT_VARIABLES.DATABASE_URL,
      ENVIRONMENT_VARIABLES.JWT_SECRET,
      ENVIRONMENT_VARIABLES.STORAGE_TYPE,
      ENVIRONMENT_VARIABLES.LOG_LEVEL,
      ENVIRONMENT_VARIABLES.CORS_ORIGIN,
    ],
    [ENVIRONMENTS.STAGING]: [
      ENVIRONMENT_VARIABLES.NODE_ENV,
      ENVIRONMENT_VARIABLES.DATABASE_URL,
      ENVIRONMENT_VARIABLES.JWT_SECRET,
      ENVIRONMENT_VARIABLES.LOG_LEVEL,
    ],
    [ENVIRONMENTS.DEVELOPMENT]: [
      ENVIRONMENT_VARIABLES.NODE_ENV,
      ENVIRONMENT_VARIABLES.LOG_LEVEL,
    ],
    [ENVIRONMENTS.TESTING]: [
      ENVIRONMENT_VARIABLES.NODE_ENV,
      ENVIRONMENT_VARIABLES.DATABASE_URL,
      ENVIRONMENT_VARIABLES.LOG_LEVEL,
    ],
  },

  // Variable type mapping
  TYPES: {
    [ENVIRONMENT_VARIABLES.PORT]: 'number',
    [ENVIRONMENT_VARIABLES.DATABASE_PORT]: 'number',
    [ENVIRONMENT_VARIABLES.REDIS_PORT]: 'number',
    [ENVIRONMENT_VARIABLES.REDIS_DB]: 'number',
    [ENVIRONMENT_VARIABLES.DATABASE_POOL_SIZE]: 'number',
    [ENVIRONMENT_VARIABLES.DATABASE_TIMEOUT]: 'number',
    [ENVIRONMENT_VARIABLES.JWT_EXPIRY]: 'string',
    [ENVIRONMENT_VARIABLES.JWT_REFRESH_EXPIRY]: 'string',
    [ENVIRONMENT_VARIABLES.BCRYPT_ROUNDS]: 'number',
    [ENVIRONMENT_VARIABLES.UPLOAD_MAX_SIZE]: 'number',
    [ENVIRONMENT_VARIABLES.ENABLE_COMPRESSION]: 'boolean',
    [ENVIRONMENT_VARIABLES.CORS_CREDENTIALS]: 'boolean',
    [ENVIRONMENT_VARIABLES.DATABASE_SSL]: 'boolean',
    [ENVIRONMENT_VARIABLES.STORAGE_SSL]: 'boolean',
    [ENVIRONMENT_VARIABLES.SMTP_PORT]: 'number',
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_ENABLED]: 'boolean',
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_WINDOW]: 'number',
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_MAX_REQUESTS]: 'number',
    [ENVIRONMENT_VARIABLES.METRICS_ENABLED]: 'boolean',
    [ENVIRONMENT_VARIABLES.PROMETHEUS_ENABLED]: 'boolean',
  },

  // Default values
  DEFAULTS: {
    [ENVIRONMENT_VARIABLES.NODE_ENV]: ENVIRONMENTS.DEVELOPMENT,
    [ENVIRONMENT_VARIABLES.PORT]: 3000,
    [ENVIRONMENT_VARIABLES.HOST]: '0.0.0.0',
    [ENVIRONMENT_VARIABLES.DATABASE_PORT]: 5432,
    [ENVIRONMENT_VARIABLES.REDIS_PORT]: 6379,
    [ENVIRONMENT_VARIABLES.REDIS_DB]: 0,
    [ENVIRONMENT_VARIABLES.DATABASE_POOL_SIZE]: 10,
    [ENVIRONMENT_VARIABLES.DATABASE_TIMEOUT]: 30000,
    [ENVIRONMENT_VARIABLES.REDIS_TTL]: 3600,
    [ENVIRONMENT_VARIABLES.JWT_EXPIRY]: '1h',
    [ENVIRONMENT_VARIABLES.JWT_REFRESH_EXPIRY]: '7d',
    [ENVIRONMENT_VARIABLES.BCRYPT_ROUNDS]: 12,
    [ENVIRONMENT_VARIABLES.LOG_LEVEL]: 'info',
    [ENVIRONMENT_VARIABLES.LOG_FORMAT]: 'json',
    [ENVIRONMENT_VARIABLES.UPLOAD_MAX_SIZE]: 10485760, // 10MB
    [ENVIRONMENT_VARIABLES.CORS_ORIGIN]: '*',
    [ENVIRONMENT_VARIABLES.CORS_METHODS]: 'GET,POST,PUT,DELETE,OPTIONS',
    [ENVIRONMENT_VARIABLES.CORS_HEADERS]: 'Content-Type,Authorization',
    [ENVIRONMENT_VARIABLES.CORS_CREDENTIALS]: 'false',
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_ENABLED]: 'true',
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_WINDOW]: 60000, // 1 minute
    [ENVIRONMENT_VARIABLES.RATE_LIMIT_MAX_REQUESTS]: 100,
    [ENVIRONMENT_VARIABLES.STORAGE_TYPE]: 'local',
    [ENVIRONMENT_VARIABLES.CACHE_TTL]: 3600,
    [ENVIRONMENT_VARIABLES.CACHE_SIZE]: 100,
    [ENVIRONMENT_VARIABLES.ENABLE_COMPRESSION]: 'true',
    [ENVIRONMENT_VARIABLES.COMPRESSION_LEVEL]: 6,
    [ENVIRONMENT_VARIABLES.REQUEST_TIMEOUT]: 30000,
    [ENVIRONMENT_VARIABLES.RESPONSE_TIMEOUT]: 30000,
    [ENVIRONMENT_VARIABLES.HEALTH_CHECK_PATH]: '/health',
    [ENVIRONMENT_VARIABLES.METRICS_PATH]: '/metrics',
    [ENVIRONMENT_VARIABLES.METRICS_PORT]: 9090,
    [ENVIRONMENT_VARIABLES.METRICS_ENABLED]: 'true',
    [ENVIRONMENT_VARIABLES.PROMETHEUS_ENABLED]: 'true',
  },
} as const

// Environment detection utilities
export const EnvironmentUtils = {
  // Check if current environment is development
  isDevelopment(): boolean {
    return process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT ||
           process.env.NODE_ENV === ENVIRONMENTS.TESTING ||
           !process.env.NODE_ENV
  },

  // Check if current environment is staging
  isStaging(): boolean {
    return process.env.NODE_ENV === ENVIRONMENTS.STAGING
  },

  // Check if current environment is production
  isProduction(): boolean {
    return process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION
  },

  // Check if current environment is testing
  isTesting(): boolean {
    return process.env.NODE_ENV === ENVIRONMENTS.TESTING
  },

  // Get current environment
  getCurrentEnvironment(): keyof typeof ENVIRONMENTS {
    const nodeEnv = process.env.NODE_ENV
    switch (nodeEnv) {
      case ENVIRONMENTS.PRODUCTION:
        return 'PRODUCTION'
      case ENVIRONMENTS.STAGING:
        return 'STAGING'
      case ENVIRONMENTS.TESTING:
        return 'TESTING'
      case ENVIRONMENTS.DEVELOPMENT:
        return 'DEVELOPMENT'
      default:
        return 'DEVELOPMENT'
    }
  },

  // Check if debugging is enabled
  isDebug(): boolean {
    return process.env.DEBUG === 'true' ||
           process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT ||
           process.env.LOG_LEVEL === 'debug'
  },

  // Get environment variable with type conversion
  getEnv<T = string>(
    key: string,
    defaultValue?: T,
    type?: 'string' | 'number' | 'boolean'
  ): T | undefined {
    const value = process.env[key]
    
    if (value === undefined) {
      return defaultValue
    }

    switch (type) {
      case 'number':
        const num = parseInt(value, 10)
        return isNaN(num) ? defaultValue : (num as T)
      case 'boolean':
        return (value === 'true' || value === '1') ? (true as T) : (false as T)
      default:
        return value as T
    }
  },

  // Validate environment variable
  validateEnv(
    key: string,
    pattern?: RegExp,
    required: boolean = false
  ): { valid: boolean; value?: string; error?: string } {
    const value = process.env[key]

    if (!value) {
      if (required) {
        return { valid: false, error: `Required environment variable ${key} is missing` }
      }
      return { valid: true }
    }

    if (pattern && !pattern.test(value)) {
      return { valid: false, error: `Environment variable ${key} has invalid format` }
    }

    return { valid: true, value }
  },

  // Validate all required environment variables
  validateEnvironment(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const currentEnv = this.getCurrentEnvironment()
    const requiredVars = ENVIRONMENT_VALIDATION.REQUIRED[currentEnv]

    for (const varName of requiredVars) {
      const validation = this.validateEnv(varName, undefined, true)
      if (!validation.valid) {
        errors.push(varName)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Get environment configuration
  getEnvironmentConfig(): {
    environment: keyof typeof ENVIRONMENTS
    isDevelopment: boolean
    isStaging: boolean
    isProduction: boolean
    isTesting: boolean
    isDebug: boolean
  } {
    return {
      environment: this.getCurrentEnvironment(),
      isDevelopment: this.isDevelopment(),
      isStaging: this.isStaging(),
      isProduction: this.isProduction(),
      isTesting: this.isTesting(),
      isDebug: this.isDebug(),
    }
  },

  // Get feature flags from environment
  getFeatureFlags(): Record<string, boolean> {
    return {
      oauth: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_OAUTH, 'true', 'boolean')!,
      emailVerification: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_EMAIL_VERIFICATION, 'true', 'boolean')!,
      twoFactor: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_TWO_FACTOR, 'true', 'boolean')!,
      fileUpload: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_FILE_UPLOAD, 'true', 'boolean')!,
      notifications: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_NOTIFICATIONS, 'true', 'boolean')!,
      auditLog: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_AUDIT_LOG, 'true', 'boolean')!,
      rateLimiting: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_RATE_LIMITING, 'true', 'boolean')!,
      monitoring: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_MONITORING, 'true', 'boolean')!,
      billing: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_BILLING, 'true', 'boolean')!,
      subscriptions: this.getEnv(ENVIRONMENT_VARIABLES.FEATURE_SUBSCRIPTIONS, 'true', 'boolean')!,
    }
  },

  // Get database configuration
  getDatabaseConfig(): {
    url?: string
    host?: string
    port?: number
    name?: string
    user?: string
    password?: string
    ssl?: boolean
    poolSize?: number
    timeout?: number
  } {
    return {
      url: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_URL),
      host: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_HOST, 'localhost'),
      port: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_PORT, 5432, 'number'),
      name: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_NAME),
      user: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_USER),
      password: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_PASSWORD),
      ssl: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_SSL, 'false', 'boolean')!,
      poolSize: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_POOL_SIZE, 10, 'number'),
      timeout: this.getEnv(ENVIRONMENT_VARIABLES.DATABASE_TIMEOUT, 30000, 'number'),
    }
  },

  // Get Redis configuration
  getRedisConfig(): {
    url?: string
    host?: string
    port?: number
    password?: string
    db?: number
    ttl?: number
    maxMemory?: string
  } {
    return {
      url: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_URL),
      host: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_HOST, 'localhost'),
      port: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_PORT, 6379, 'number'),
      password: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_PASSWORD),
      db: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_DB, 0, 'number'),
      ttl: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_TTL, 3600, 'number'),
      maxMemory: this.getEnv(ENVIRONMENT_VARIABLES.REDIS_MAX_MEMORY),
    }
  },

  // Get JWT configuration
  getJWTConfig(): {
    secret?: string
    expiry?: string
    refreshSecret?: string
    refreshExpiry?: string
    issuer?: string
    audience?: string
  } {
    return {
      secret: this.getEnv(ENVIRONMENT_VARIABLES.JWT_SECRET),
      expiry: this.getEnv(ENVIRONMENT_VARIABLES.JWT_EXPIRY, '1h'),
      refreshSecret: this.getEnv(ENVIRONMENT_VARIABLES.JWT_REFRESH_SECRET),
      refreshExpiry: this.getEnv(ENVIRONMENT_VARIABLES.JWT_REFRESH_EXPIRY, '7d'),
      issuer: this.getEnv(ENVIRONMENT_VARIABLES.JWT_ISSUER),
      audience: this.getEnv(ENVIRONMENT_VARIABLES.JWT_AUDIENCE),
    }
  },

  // Get CORS configuration
  getCORSConfig(): {
    origin?: string
    methods?: string
    headers?: string
    credentials?: boolean
  } {
    return {
      origin: this.getEnv(ENVIRONMENT_VARIABLES.CORS_ORIGIN, '*'),
      methods: this.getEnv(ENVIRONMENT_VARIABLES.CORS_METHODS, 'GET,POST,PUT,DELETE,OPTIONS'),
      headers: this.getEnv(ENVIRONMENT_VARIABLES.CORS_HEADERS, 'Content-Type,Authorization'),
      credentials: this.getEnv(ENVIRONMENT_VARIABLES.CORS_CREDENTIALS, 'false', 'boolean')!,
    }
  },

  // Get logging configuration
  getLoggingConfig(): {
    level?: string
    format?: string
    file?: string
    maxSize?: string
    maxFiles?: number
    sentryDsn?: string
    sentryEnvironment?: string
  } {
    return {
      level: this.getEnv(ENVIRONMENT_VARIABLES.LOG_LEVEL, 'info'),
      format: this.getEnv(ENVIRONMENT_VARIABLES.LOG_FORMAT, 'json'),
      file: this.getEnv(ENVIRONMENT_VARIABLES.LOG_FILE),
      maxSize: this.getEnv(ENVIRONMENT_VARIABLES.LOG_MAX_SIZE),
      maxFiles: this.getEnv(ENVIRONMENT_VARIABLES.LOG_MAX_FILES, undefined, 'number'),
      sentryDsn: this.getEnv(ENVIRONMENT_VARIABLES.SENTRY_DSN),
      sentryEnvironment: this.getEnv(ENVIRONMENT_VARIABLES.SENTRY_ENVIRONMENT),
    }
  },

  // Get rate limiting configuration
  getRateLimitConfig(): {
    enabled?: boolean
    window?: number
    maxRequests?: number
  } {
    return {
      enabled: this.getEnv(ENVIRONMENT_VARIABLES.RATE_LIMIT_ENABLED, 'true', 'boolean')!,
      window: this.getEnv(ENVIRONMENT_VARIABLES.RATE_LIMIT_WINDOW, 60000, 'number'),
      maxRequests: this.getEnv(ENVIRONMENT_VARIABLES.RATE_LIMIT_MAX_REQUESTS, 100, 'number'),
    }
  },

  // Get storage configuration
  getStorageConfig(): {
    type?: string
    bucket?: string
    region?: string
    accessKey?: string
    secretKey?: string
    endpoint?: string
    ssl?: boolean
    maxSize?: number
    allowedTypes?: string
  } {
    return {
      type: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_TYPE, 'local'),
      bucket: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_BUCKET),
      region: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_REGION),
      accessKey: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_ACCESS_KEY),
      secretKey: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_SECRET_KEY),
      endpoint: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_ENDPOINT),
      ssl: this.getEnv(ENVIRONMENT_VARIABLES.STORAGE_SSL, 'true', 'boolean')!,
      maxSize: this.getEnv(ENVIRONMENT_VARIABLES.UPLOAD_MAX_SIZE, 10485760, 'number'),
      allowedTypes: this.getEnv(ENVIRONMENT_VARIABLES.UPLOAD_ALLOWED_TYPES),
    }
  },

  // Get application configuration
  getAppConfig(): {
    name?: string
    version?: string
    description?: string
    url?: string
    baseUrl?: string
    domain?: string
    logo?: string
    favicon?: string
  } {
    return {
      name: this.getEnv(ENVIRONMENT_VARIABLES.APP_NAME),
      version: this.getEnv(ENVIRONMENT_VARIABLES.APP_VERSION),
      description: this.getEnv(ENVIRONMENT_VARIABLES.APP_DESCRIPTION),
      url: this.getEnv(ENVIRONMENT_VARIABLES.APP_URL),
      baseUrl: this.getEnv(ENVIRONMENT_VARIABLES.APP_BASE_URL),
      domain: this.getEnv(ENVIRONMENT_VARIABLES.APP_DOMAIN),
      logo: this.getEnv(ENVIRONMENT_VARIABLES.APP_LOGO),
      favicon: this.getEnv(ENVIRONMENT_VARIABLES.APP_FAVICON),
    }
  },
}

export default {
  ENVIRONMENTS,
  NODE_ENVIRONMENTS,
  ENVIRONMENT_VARIABLES,
  ENVIRONMENT_VALIDATION,
  EnvironmentUtils,
}
