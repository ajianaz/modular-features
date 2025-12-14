// Cache constants

export const CACHE_KEYS = {
  // User cache keys
  USER: {
    PROFILE: (userId: string) => `user:profile:${userId}`,
    SETTINGS: (userId: string) => `user:settings:${userId}`,
    PERMISSIONS: (userId: string) => `user:permissions:${userId}`,
    ROLES: (userId: string) => `user:roles:${userId}`,
    SESSION: (sessionId: string) => `session:${sessionId}`,
    TOKEN: (tokenId: string) => `token:${tokenId}`,
    LOGIN_ATTEMPTS: (identifier: string) => `auth:login_attempts:${identifier}`,
    PASSWORD_RESET: (token: string) => `auth:password_reset:${token}`,
    EMAIL_VERIFICATION: (token: string) => `auth:email_verification:${token}`,
    TWO_FACTOR: (userId: string) => `auth:2fa:${userId}`,
  },

  // Payment cache keys
  PAYMENT: {
    TRANSACTION: (transactionId: string) => `payment:transaction:${transactionId}`,
    INVOICE: (invoiceId: string) => `payment:invoice:${invoiceId}`,
    PAYMENT_METHODS: (userId: string) => `payment:methods:${userId}`,
    SUBSCRIPTION: (subscriptionId: string) => `payment:subscription:${subscriptionId}`,
    SUBSCRIPTION_PLANS: 'payment:subscription_plans',
    EXCHANGE_RATES: 'payment:exchange_rates',
    WEBHOOK_PROCESSED: (webhookId: string) => `payment:webhook:${webhookId}`,
  },

  // Order cache keys
  ORDER: {
    ORDER: (orderId: string) => `order:${orderId}`,
    ORDERS_BY_USER: (userId: string, page: number = 1) => `order:user:${userId}:page:${page}`,
    ORDER_STATUS: (orderId: string) => `order:${orderId}:status`,
    ORDER_ITEMS: (orderId: string) => `order:${orderId}:items`,
    SHIPPING_RATES: 'order:shipping_rates',
    INVENTORY: (productId: string) => `order:inventory:${productId}`,
  },

  // Notification cache keys
  NOTIFICATION: {
    NOTIFICATION: (notificationId: string) => `notification:${notificationId}`,
    TEMPLATES: 'notification:templates',
    USER_PREFERENCES: (userId: string) => `notification:preferences:${userId}`,
    DELIVERY_STATUS: (notificationId: string) => `notification:delivery:${notificationId}`,
    RATE_LIMIT: (userId: string, channel: string) => `notification:rate:${userId}:${channel}`,
  },

  // File cache keys
  FILE: {
    METADATA: (fileId: string) => `file:metadata:${fileId}`,
    CONTENT: (fileId: string) => `file:content:${fileId}`,
    THUMBNAIL: (fileId: string) => `file:thumbnail:${fileId}`,
    UPLOAD_URL: (uploadId: string) => `file:upload:${uploadId}`,
    PROCESSING_STATUS: (fileId: string) => `file:processing:${fileId}`,
  },

  // System cache keys
  SYSTEM: {
    CONFIGURATION: 'system:configuration',
    FEATURE_FLAGS: 'system:feature_flags',
    MAINTENANCE_MODE: 'system:maintenance',
    RATE_LIMITS: 'system:rate_limits',
    HEALTH_CHECK: 'system:health',
    METRICS: 'system:metrics',
    LOGS: 'system:logs',
  },

  // Database cache keys
  DATABASE: {
    QUERY_RESULT: (queryHash: string) => `db:query:${queryHash}`,
    TABLE_SCHEMA: (tableName: string) => `db:schema:${tableName}`,
    FOREIGN_KEYS: (tableName: string) => `db:foreign_keys:${tableName}`,
    INDEXES: (tableName: string) => `db:indexes:${tableName}`,
    ROW: (tableName: string, id: string) => `db:row:${tableName}:${id}`,
  },

  // API cache keys
  API: {
    RESPONSE: (endpoint: string, params: string) => `api:response:${endpoint}:${params}`,
    RATE_LIMIT: (clientId: string, endpoint: string) => `api:rate:${clientId}:${endpoint}`,
    API_VERSION: 'api:version',
    ENDPOINTS: 'api:endpoints',
    SCHEMA: 'api:schema',
  },

  // Audit cache keys
  AUDIT: {
    LOG: (logId: string) => `audit:log:${logId}`,
    SEARCH: (searchId: string) => `audit:search:${searchId}`,
    REPORT: (reportId: string) => `audit:report:${reportId}`,
    STATISTICS: 'audit:statistics',
    COMPLIANCE_REPORT: 'audit:compliance_report',
  },

  // External service cache keys
  EXTERNAL: {
    WEATHER: (location: string) => `external:weather:${location}`,
    EXCHANGE_RATES: 'external:exchange_rates',
    STOCK_PRICE: (symbol: string) => `external:stock:${symbol}`,
    GEOLOCATION: (ip: string) => `external:geo:${ip}`,
    VERIFICATION: (service: string, value: string) => `external:verify:${service}:${value}`,
  },

  // Session cache keys
  SESSION: {
    USER: (sessionId: string) => `session:user:${sessionId}`,
    CSRF: (sessionId: string) => `session:csrf:${sessionId}`,
    LAST_ACTIVITY: (sessionId: string) => `session:activity:${sessionId}`,
    CART: (sessionId: string) => `session:cart:${sessionId}`,
    FLASH_MESSAGES: (sessionId: string) => `session:flash:${sessionId}`,
  },
} as const

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  // Very short TTL (seconds)
  VERY_SHORT: 30, // 30 seconds
  SHORT: 60, // 1 minute
  SHORT_2: 300, // 5 minutes

  // Medium TTL (minutes to hours)
  MEDIUM: 900, // 15 minutes
  MEDIUM_2: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  HOUR_2: 7200, // 2 hours
  HOUR_6: 21600, // 6 hours

  // Long TTL (hours to days)
  LONG: 43200, // 12 hours
  LONG_2: 86400, // 1 day
  LONG_3: 172800, // 2 days
  WEEK: 604800, // 1 week
  WEEK_2: 1209600, // 2 weeks

  // Very long TTL (weeks to months)
  MONTH: 2592000, // 30 days
  MONTH_3: 7776000, // 90 days
  YEAR: 31536000, // 365 days

  // Specific TTLs for different data types
  USER_SESSION: 86400, // 1 day
  USER_PROFILE: 1800, // 30 minutes
  USER_PERMISSIONS: 3600, // 1 hour
  PASSWORD_RESET: 3600, // 1 hour
  EMAIL_VERIFICATION: 3600, // 1 hour
  LOGIN_ATTEMPTS: 900, // 15 minutes
  TWO_FACTOR: 300, // 5 minutes

  PAYMENT_TRANSACTION: 3600, // 1 hour
  PAYMENT_INVOICE: 7200, // 2 hours
  SUBSCRIPTION_PLANS: 86400, // 1 day
  EXCHANGE_RATES: 3600, // 1 hour

  ORDER_STATUS: 1800, // 30 minutes
  ORDER_ITEMS: 3600, // 1 hour
  SHIPPING_RATES: 86400, // 1 day
  INVENTORY: 300, // 5 minutes

  NOTIFICATION_TEMPLATES: 86400, // 1 day
  USER_NOTIFICATION_PREFERENCES: 3600, // 1 hour
  NOTIFICATION_RATE_LIMIT: 60, // 1 minute

  FILE_METADATA: 3600, // 1 hour
  FILE_CONTENT: 86400, // 1 day
  FILE_THUMBNAIL: 86400, // 1 day
  UPLOAD_URL: 300, // 5 minutes

  SYSTEM_CONFIGURATION: 3600, // 1 hour
  FEATURE_FLAGS: 300, // 5 minutes
  MAINTENANCE_MODE: 60, // 1 minute
  SYSTEM_HEALTH: 30, // 30 seconds

  DATABASE_QUERY_RESULT: 1800, // 30 minutes
  DATABASE_SCHEMA: 86400, // 1 day

  API_RESPONSE: 300, // 5 minutes
  API_RATE_LIMIT: 60, // 1 minute

  AUDIT_LOG: 86400, // 1 day
  AUDIT_STATISTICS: 3600, // 1 hour
  COMPLIANCE_REPORT: 86400, // 1 day

  EXTERNAL_WEATHER: 1800, // 30 minutes
  EXTERNAL_EXCHANGE_RATES: 3600, // 1 hour
  EXTERNAL_STOCK_PRICE: 60, // 1 minute
  EXTERNAL_GEOLOCATION: 86400, // 1 day
  EXTERNAL_VERIFICATION: 300, // 5 minutes

  FLASH_MESSAGES: 300, // 5 minutes
  CSRF_TOKEN: 3600, // 1 hour
  CART: 86400, // 1 day
  LAST_ACTIVITY: 300, // 5 minutes
} as const

// Cache size limits
export const CACHE_SIZE_LIMITS = {
  MAX_KEY_LENGTH: 250, // characters
  MAX_VALUE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_MEMORY_USAGE: 1024 * 1024 * 1024, // 1GB
  MAX_ENTRIES: 1000000, // 1 million entries
  MAX_MEMORY_PER_ENTRY: 1024 * 1024, // 1MB per entry
} as const

// Cache providers
export const CACHE_PROVIDERS = {
  MEMORY: 'memory',
  REDIS: 'redis',
  MEMCACHED: 'memcached',
  DYNAMODB: 'dynamodb',
  ELASTICACHE: 'elasticache',
} as const

// Cache strategies
export const CACHE_STRATEGIES = {
  CACHE_ASIDE: 'cache_aside',
  READ_THROUGH: 'read_through',
  WRITE_THROUGH: 'write_through',
  WRITE_BEHIND: 'write_behind',
  REFRESH_AHEAD: 'refresh_ahead',
} as const

// Cache eviction policies
export const CACHE_EVICTION_POLICIES = {
  LRU: 'lru', // Least Recently Used
  LFU: 'lfu', // Least Frequently Used
  FIFO: 'fifo', // First In First Out
  LIFO: 'lifo', // Last In First Out
  RANDOM: 'random', // Random
  TTL: 'ttl', // Time To Live
} as const

// Cache consistency levels
export const CACHE_CONSISTENCY_LEVELS = {
  EVENTUAL: 'eventual',
  STRONG: 'strong',
  WEAK: 'weak',
  READ_YOUR_WRITES: 'read_your_writes',
  MONOTONIC_READS: 'monotonic_reads',
  MONOTONIC_WRITES: 'monotonic_writes',
  CAUSAL: 'causal',
} as const

// Cache compression algorithms
export const CACHE_COMPRESSION = {
  NONE: 'none',
  GZIP: 'gzip',
  BROTLI: 'brotli',
  LZ4: 'lz4',
  SNAPPY: 'snappy',
} as const

// Cache serialization formats
export const CACHE_SERIALIZATION = {
  JSON: 'json',
  MSGPACK: 'msgpack',
  PROTOBUF: 'protobuf',
  AVRO: 'avro',
  CBOR: 'cbor',
} as const

// Cache tag patterns
export const CACHE_TAGS = {
  USER: 'user',
  ADMIN: 'admin',
  PUBLIC: 'public',
  PRIVATE: 'private',
  SENSITIVE: 'sensitive',
  TEMPORARY: 'temporary',
  PERSISTENT: 'persistent',
  FREQUENTLY_ACCESSED: 'frequent',
  RARELY_ACCESSED: 'rare',
  LARGE_DATA: 'large',
  SMALL_DATA: 'small',
} as const

// Cache monitoring metrics
export const CACHE_METRICS = {
  HITS: 'cache_hits',
  MISSES: 'cache_misses',
  HIT_RATE: 'cache_hit_rate',
  MISS_RATE: 'cache_miss_rate',
  EVICTIONS: 'cache_evictions',
  EXPIRATIONS: 'cache_expirations',
  SIZE_BYTES: 'cache_size_bytes',
  ENTRY_COUNT: 'cache_entry_count',
  MEMORY_USAGE: 'cache_memory_usage',
  CPU_USAGE: 'cache_cpu_usage',
  LATENCY: 'cache_latency',
  ERROR_RATE: 'cache_error_rate',
  THROUGHPUT: 'cache_throughput',
} as const

// Cache configuration defaults
export const CACHE_CONFIG_DEFAULTS = {
  PROVIDER: CACHE_PROVIDERS.MEMORY,
  TTL: CACHE_TTL.HOUR,
  STRATEGY: CACHE_STRATEGIES.CACHE_ASIDE,
  EVICTION_POLICY: CACHE_EVICTION_POLICIES.LRU,
  COMPRESSION: CACHE_COMPRESSION.NONE,
  SERIALIZATION: CACHE_SERIALIZATION.JSON,
  CONSISTENCY_LEVEL: CACHE_CONSISTENCY_LEVELS.EVENTUAL,
  MAX_SIZE: CACHE_SIZE_LIMITS.MAX_MEMORY_USAGE,
  MAX_ENTRIES: CACHE_SIZE_LIMITS.MAX_ENTRIES,
  ENABLE_METRICS: true,
  ENABLE_LOGGING: true,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
  CONNECTION_TIMEOUT: 5000, // milliseconds
  COMMAND_TIMEOUT: 3000, // milliseconds
  IDLE_TIMEOUT: 300000, // milliseconds (5 minutes)
} as const

// Utility functions
export const CacheUtils = {
  // Generate cache key with namespace
  generateKey(namespace: string, identifier: string): string {
    return `${namespace}:${identifier}`
  },

  // Generate cache key with multiple identifiers
  generateKeyWithNamespace(namespace: string, ...identifiers: string[]): string {
    return [namespace, ...identifiers].join(':')
  },

  // Validate cache key
  validateKey(key: string): { valid: boolean; error?: string } {
    if (!key || typeof key !== 'string') {
      return { valid: false, error: 'Key must be a non-empty string' }
    }

    if (key.length > CACHE_SIZE_LIMITS.MAX_KEY_LENGTH) {
      return { valid: false, error: `Key must not exceed ${CACHE_SIZE_LIMITS.MAX_KEY_LENGTH} characters` }
    }

    // Check for invalid characters
    if (/[^\w\-:.]/.test(key)) {
      return { valid: false, error: 'Key contains invalid characters' }
    }

    return { valid: true }
  },

  // Get TTL in seconds from string format
  parseTTL(ttl: string | number): number {
    if (typeof ttl === 'number') {
      return ttl
    }

    const ttlMap: Record<string, number> = {
      '30s': 30,
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '2h': 7200,
      '6h': 21600,
      '12h': 43200,
      '1d': 86400,
      '2d': 172800,
      '1w': 604800,
      '2w': 1209600,
      '1M': 2592000,
      '3M': 7776000,
      '1y': 31536000,
    }

    return ttlMap[ttl] || CACHE_TTL.HOUR
  },

  // Format TTL for display
  formatTTL(ttl: number): string {
    const minutes = Math.floor(ttl / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else {
      return `${minutes}m`
    }
  },

  // Check if TTL has expired
  isExpired(createdAt: Date, ttl: number): boolean {
    const now = new Date()
    const expiryTime = createdAt.getTime() + (ttl * 1000)
    return now.getTime() > expiryTime
  },

  // Get expiry time from TTL
  getExpiryTime(ttl: number): Date {
    const now = new Date()
    return new Date(now.getTime() + (ttl * 1000))
  },

  // Calculate cache hit rate
  calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses
    return total > 0 ? (hits / total) * 100 : 0
  },

  // Calculate cache miss rate
  calculateMissRate(hits: number, misses: number): number {
    const total = hits + misses
    return total > 0 ? (misses / total) * 100 : 0
  },

  // Generate cache key pattern
  generateKeyPattern(namespace: string, pattern: string): string {
    return `${namespace}:${pattern}`
  },

  // Extract namespace from cache key
  extractNamespace(key: string): string {
    const parts = key.split(':')
    return parts[0] || ''
  },

  // Extract identifier from cache key
  extractIdentifier(key: string): string {
    const parts = key.split(':')
    return parts.slice(1).join(':')
  },

  // Check if key matches pattern
  matchesPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace('*', '.*'))
    return regex.test(key)
  },

  // Validate cache value
  validateValue(value: any): { valid: boolean; error?: string } {
    if (value === null || value === undefined) {
      return { valid: false, error: 'Value cannot be null or undefined' }
    }

    const serializedSize = JSON.stringify(value).length
    if (serializedSize > CACHE_SIZE_LIMITS.MAX_VALUE_SIZE) {
      return { valid: false, error: `Value size exceeds ${CACHE_SIZE_LIMITS.MAX_VALUE_SIZE} bytes` }
    }

    return { valid: true }
  },

  // Compress value if needed
  async compressValue(
    value: any,
    compression: keyof typeof CACHE_COMPRESSION
  ): Promise<Buffer> {
    if (compression === CACHE_COMPRESSION.NONE) {
      return Buffer.from(JSON.stringify(value))
    }

    const zlib = await import('zlib')
    const jsonString = JSON.stringify(value)

    switch (compression) {
      case CACHE_COMPRESSION.GZIP:
        return zlib.gzip(jsonString)
      case CACHE_COMPRESSION.BROTLI:
        return zlib.brotliCompress(jsonString)
      default:
        return Buffer.from(jsonString)
    }
  },

  // Decompress value if needed
  async decompressValue(
    buffer: Buffer,
    compression: keyof typeof CACHE_COMPRESSION
  ): Promise<any> {
    if (compression === CACHE_COMPRESSION.NONE) {
      return JSON.parse(buffer.toString())
    }

    const zlib = await import('zlib')
    let jsonString: string

    switch (compression) {
      case CACHE_COMPRESSION.GZIP:
        jsonString = await zlib.gunzip(buffer).then(b => b.toString())
        break
      case CACHE_COMPRESSION.BROTLI:
        jsonString = await zlib.brotliDecompress(buffer).then(b => b.toString())
        break
      default:
        jsonString = buffer.toString()
    }

    return JSON.parse(jsonString)
  },

  // Serialize value based on format
  serializeValue(
    value: any,
    serialization: keyof typeof CACHE_SERIALIZATION
  ): Buffer {
    switch (serialization) {
      case CACHE_SERIALIZATION.JSON:
        return Buffer.from(JSON.stringify(value))
      case CACHE_SERIALIZATION.MSGPACK:
        // This would require msgpack library
        throw new Error('MSGPACK serialization not implemented')
      case CACHE_SERIALIZATION.PROTOBUF:
        // This would require protobuf library
        throw new Error('Protobuf serialization not implemented')
      default:
        return Buffer.from(JSON.stringify(value))
    }
  },

  // Deserialize value based on format
  deserializeValue(
    buffer: Buffer,
    serialization: keyof typeof CACHE_SERIALIZATION
  ): any {
    switch (serialization) {
      case CACHE_SERIALIZATION.JSON:
        return JSON.parse(buffer.toString())
      case CACHE_SERIALIZATION.MSGPACK:
        // This would require msgpack library
        throw new Error('MSGPACK deserialization not implemented')
      case CACHE_SERIALIZATION.PROTOBUF:
        // This would require protobuf library
        throw new Error('Protobuf deserialization not implemented')
      default:
        return JSON.parse(buffer.toString())
    }
  },
}

export default {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_SIZE_LIMITS,
  CACHE_PROVIDERS,
  CACHE_STRATEGIES,
  CACHE_EVICTION_POLICIES,
  CACHE_CONSISTENCY_LEVELS,
  CACHE_COMPRESSION,
  CACHE_SERIALIZATION,
  CACHE_TAGS,
  CACHE_METRICS,
  CACHE_CONFIG_DEFAULTS,
  CacheUtils,
}
