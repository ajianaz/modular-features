// HTTP status codes and constants

export const HTTP_STATUS_CODES = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  SWITCH_PROXY: 306,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const

// HTTP status code categories
export const HTTP_STATUS_CATEGORIES = {
  INFORMATIONAL: '1xx',
  SUCCESS: '2xx',
  REDIRECTION: '3xx',
  CLIENT_ERROR: '4xx',
  SERVER_ERROR: '5xx',
} as const

// HTTP status messages
export const HTTP_STATUS_MESSAGES = {
  [HTTP_STATUS_CODES.OK]: 'OK',
  [HTTP_STATUS_CODES.CREATED]: 'Created',
  [HTTP_STATUS_CODES.ACCEPTED]: 'Accepted',
  [HTTP_STATUS_CODES.NO_CONTENT]: 'No Content',
  [HTTP_STATUS_CODES.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HTTP_STATUS_CODES.FOUND]: 'Found',
  [HTTP_STATUS_CODES.TEMPORARY_REDIRECT]: 'Temporary Redirect',
  [HTTP_STATUS_CODES.BAD_REQUEST]: 'Bad Request',
  [HTTP_STATUS_CODES.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS_CODES.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS_CODES.NOT_FOUND]: 'Not Found',
  [HTTP_STATUS_CODES.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HTTP_STATUS_CODES.CONFLICT]: 'Conflict',
  [HTTP_STATUS_CODES.GONE]: 'Gone',
  [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HTTP_STATUS_CODES.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTP_STATUS_CODES.NOT_IMPLEMENTED]: 'Not Implemented',
  [HTTP_STATUS_CODES.SERVICE_UNAVAILABLE]: 'Service Unavailable',
} as const

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  CONNECT: 'CONNECT',
} as const

// HTTP headers
export const HTTP_HEADERS = {
  // Request headers
  ACCEPT: 'Accept',
  ACCEPT_CHARSET: 'Accept-Charset',
  ACCEPT_ENCODING: 'Accept-Encoding',
  ACCEPT_LANGUAGE: 'Accept-Language',
  ACCEPT_RANGES: 'Accept-Ranges',
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
  CONNECTION: 'Connection',
  CONTENT_ENCODING: 'Content-Encoding',
  CONTENT_LANGUAGE: 'Content-Language',
  CONTENT_LENGTH: 'Content-Length',
  CONTENT_LOCATION: 'Content-Location',
  CONTENT_MD5: 'Content-MD5',
  CONTENT_RANGE: 'Content-Range',
  CONTENT_TYPE: 'Content-Type',
  COOKIE: 'Cookie',
  DATE: 'Date',
  EXPECT: 'Expect',
  FORWARDED: 'Forwarded',
  FROM: 'From',
  HOST: 'Host',
  IF_MATCH: 'If-Match',
  IF_MODIFIED_SINCE: 'If-Modified-Since',
  IF_NONE_MATCH: 'If-None-Match',
  IF_RANGE: 'If-Range',
  IF_UNMODIFIED_SINCE: 'If-Unmodified-Since',
  LAST_MODIFIED: 'Last-Modified',
  MAX_FORWARDS: 'Max-Forwards',
  PRAGMA: 'Pragma',
  PROXY_AUTHORIZATION: 'Proxy-Authorization',
  RANGE: 'Range',
  REFERER: 'Referer',
  TE: 'TE',
  TRAILER: 'Trailer',
  TRANSFER_ENCODING: 'Transfer-Encoding',
  UPGRADE: 'Upgrade',
  USER_AGENT: 'User-Agent',
  VIA: 'Via',
  WARNING: 'Warning',
  X_FORWARDED_FOR: 'X-Forwarded-For',
  X_FORWARDED_HOST: 'X-Forwarded-Host',
  X_FORWARDED_PROTO: 'X-Forwarded-Proto',
  X_REAL_IP: 'X-Real-IP',
  X_REQUESTED_WITH: 'X-Requested-With',
  X_API_KEY: 'X-API-Key',
  X_RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
  X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  X_REQUEST_ID: 'X-Request-ID',
  X_CORRELATION_ID: 'X-Correlation-ID',
  X_TRACE_ID: 'X-Trace-ID',

  // Response headers
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_CREDENTIALS: 'Access-Control-Allow-Credentials',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_EXPOSE_HEADERS: 'Access-Control-Expose-Headers',
  ACCESS_CONTROL_MAX_AGE: 'Access-Control-Max-Age',
  AGE: 'Age',
  ALLOW: 'Allow',
  CONTENT_DISPOSITION: 'Content-Disposition',
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  CONTENT_SECURITY_POLICY_REPORT_ONLY: 'Content-Security-Policy-Report-Only',
  DNT: 'DNT',
  ETAG: 'ETag',
  EXPIRES: 'Expires',
  LOCATION: 'Location',
  P3P: 'P3P',
  PROXY_AUTHENTICATE: 'Proxy-Authenticate',
  REFRESH: 'Refresh',
  RETRY_AFTER: 'Retry-After',
  SERVER: 'Server',
  SET_COOKIE: 'Set-Cookie',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  VARY: 'Vary',
  WWW_AUTHENTICATE: 'WWW-Authenticate',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
} as const

// Content types
export const CONTENT_TYPES = {
  // Text types
  TEXT_HTML: 'text/html',
  TEXT_CSS: 'text/css',
  TEXT_JAVASCRIPT: 'text/javascript',
  TEXT_PLAIN: 'text/plain',
  TEXT_XML: 'text/xml',
  TEXT_CSV: 'text/csv',
  TEXT_MARKDOWN: 'text/markdown',

  // Application types
  APPLICATION_JSON: 'application/json',
  APPLICATION_XML: 'application/xml',
  APPLICATION_JAVASCRIPT: 'application/javascript',
  APPLICATION_OCTET_STREAM: 'application/octet-stream',
  APPLICATION_FORM_URLENCODED: 'application/x-www-form-urlencoded',
  APPLICATION_MULTIPART_FORM_DATA: 'multipart/form-data',
  APPLICATION_PDF: 'application/pdf',
  APPLICATION_ZIP: 'application/zip',
  APPLICATION_GZIP: 'application/gzip',
  APPLICATION_VND_API_JSON: 'application/vnd.api+json',
  APPLICATION_HAL_JSON: 'application/hal+json',
  APPLICATION_LDP_JSON: 'application/ld+json',
  APPLICATION_MERGE_PATCH_JSON: 'application/merge-patch+json',
  APPLICATION_PROBLEM_JSON: 'application/problem+json',
  APPLICATION_PATCH_JSON: 'application/patch+json',
  APPLICATION_SPARQL_RESULTS_JSON: 'application/sparql-results+json',

  // Image types
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
  IMAGE_SVG_XML: 'image/svg+xml',
  IMAGE_ICO: 'image/x-icon',
  IMAGE_BMP: 'image/bmp',
  IMAGE_TIFF: 'image/tiff',

  // Audio types
  AUDIO_MP3: 'audio/mpeg',
  AUDIO_MP4: 'audio/mp4',
  AUDIO_OGG: 'audio/ogg',
  AUDIO_WEBM: 'audio/webm',
  AUDIO_WAV: 'audio/wav',
  AUDIO_FLAC: 'audio/flac',
  AUDIO_AAC: 'audio/aac',

  // Video types
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  VIDEO_OGG: 'video/ogg',
  VIDEO_QUICKTIME: 'video/quicktime',
  VIDEO_X_MSVIDEO: 'video/x-msvideo',
  VIDEO_X_MS_WMV: 'video/x-ms-wmv',
  VIDEO_X_FLV: 'video/x-flv',

  // Font types
  FONT_WOFF: 'font/woff',
  FONT_WOFF2: 'font/woff2',
  FONT_TTF: 'font/ttf',
  FONT_OTF: 'font/otf',
  FONT_EOT: 'application/vnd.ms-fontobject',
  FONT_SVG: 'image/svg+xml',
} as const

// Character encodings
export const CHARSETS = {
  UTF8: 'utf-8',
  UTF16: 'utf-16',
  UTF32: 'utf-32',
  ASCII: 'ascii',
  ISO_8859_1: 'iso-8859-1',
  ISO_8859_15: 'iso-8859-15',
  WINDOWS_1252: 'windows-1252',
} as const

// Rate limiting defaults
export const RATE_LIMIT_DEFAULTS = {
  DEFAULT_LIMIT: 100,
  DEFAULT_WINDOW: 60 * 1000, // 1 minute
  AUTH_LIMIT: 5,
  AUTH_WINDOW: 15 * 60 * 1000, // 15 minutes
  UPLOAD_LIMIT: 10,
  UPLOAD_WINDOW: 60 * 1000, // 1 minute
  RETRY_AFTER_HEADER: 'Retry-After',
} as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT: 'id',
  DEFAULT_ORDER: 'desc',
} as const

// API versioning
export const API_VERSIONS = {
  CURRENT: 'v1',
  SUPPORTED: ['v1'],
  DEPRECATED: [],
  END_OF_LIFE: [],
} as const

// Cache control directives
export const CACHE_CONTROL_DIRECTIVES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  PROXY_REVALIDATE: 'proxy-revalidate',
  MAX_AGE: 'max-age',
  S_MAXAGE: 's-maxage',
  NO_TRANSFORM: 'no-transform',
  IMMUTABLE: 'immutable',
} as const

// Security headers
export const SECURITY_HEADERS = {
  X_FRAME_OPTIONS: {
    DENY: 'DENY',
    SAMEORIGIN: 'SAMEORIGIN',
    ALLOW_FROM: 'ALLOW-FROM',
  },
  X_XSS_PROTECTION: {
    DISABLE: '0',
    ENABLE_BLOCK: '1; mode=block',
    ENABLE: '1',
  },
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  STRICT_TRANSPORT_SECURITY: {
    DEFAULT: 'max-age=31536000; includeSubDomains',
    INCLUDE_SUBDOMAINS: 'max-age=31536000; includeSubDomains',
    PRELOAD: 'max-age=31536000; includeSubDomains; preload',
  },
  CONTENT_SECURITY_POLICY: {
    DEFAULT: "default-src 'self'",
    SCRIPT_SRC: "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    STYLE_SRC: "style-src 'self' 'unsafe-inline'",
    IMG_SRC: "img-src 'self' data: https:",
    FONT_SRC: "font-src 'self'",
    CONNECT_SRC: "connect-src 'self'",
    MEDIA_SRC: "media-src 'self'",
    OBJECT_SRC: "object-src 'none'",
    CHILD_SRC: "child-src 'self'",
    FORM_ACTION: "form-action 'self'",
    FRAME_ANCESTORS: "frame-ancestors 'self'",
    BASE_URI: "base-uri 'self'",
    UPGRADE_INSECURE_REQUESTS: "upgrade-insecure-requests",
  },
  REFERRER_POLICY: {
    NO_REFERRER: 'no-referrer',
    NO_REFERRER_WHEN_DOWNGRADE: 'no-referrer-when-downgrade',
    ORIGIN: 'origin',
    ORIGIN_WHEN_CROSS_ORIGIN: 'origin-when-cross-origin',
    SAME_ORIGIN: 'same-origin',
    STRICT_ORIGIN: 'strict-origin',
    STRICT_ORIGIN_WHEN_CROSS_ORIGIN: 'strict-origin-when-cross-origin',
    UNSAFE_URL: 'unsafe-url',
  },
} as const

// HTTP client defaults
export const HTTP_CLIENT_DEFAULTS = {
  TIMEOUT: 30000, // 30 seconds
  MAX_REDIRECTS: 5,
  FOLLOW_REDIRECTS: true,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF: 2,
} as const

// HTTP server defaults
export const HTTP_SERVER_DEFAULTS = {
  HOST: '0.0.0.0',
  PORT: 3000,
  TIMEOUT: 120000, // 2 minutes
  KEEP_ALIVE_TIMEOUT: 5000, // 5 seconds
  HEADERS_TIMEOUT: 60000, // 1 minute
  MAX_REQUEST_SIZE: '10mb',
  BODY_LIMIT: '10mb',
  PARAMETER_LIMIT: 1000,
} as const

// WebSocket status codes
export const WEBSOCKET_STATUS_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MANDATORY_EXTENSION: 1010,
  INTERNAL_SERVER_ERROR: 1011,
  TLS_HANDSHAKE: 1015,
} as const

// Utility functions
export const HttpUtils = {
  // Check if status code is successful
  isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300
  },

  // Check if status code is informational
  isInformational(statusCode: number): boolean {
    return statusCode >= 100 && statusCode < 200
  },

  // Check if status code is redirection
  isRedirection(statusCode: number): boolean {
    return statusCode >= 300 && statusCode < 400
  },

  // Check if status code is client error
  isClientError(statusCode: number): boolean {
    return statusCode >= 400 && statusCode < 500
  },

  // Check if status code is server error
  isServerError(statusCode: number): boolean {
    return statusCode >= 500 && statusCode < 600
  },

  // Check if status code is error
  isError(statusCode: number): boolean {
    return statusCode >= 400
  },

  // Get status code category
  getCategory(statusCode: number): keyof typeof HTTP_STATUS_CATEGORIES {
    if (statusCode >= 500) return 'SERVER_ERROR'
    if (statusCode >= 400) return 'CLIENT_ERROR'
    if (statusCode >= 300) return 'REDIRECTION'
    if (statusCode >= 200) return 'SUCCESS'
    return 'INFORMATIONAL'
  },

  // Get status code message
  getMessage(statusCode: number): string {
    return HTTP_STATUS_MESSAGES[statusCode as keyof typeof HTTP_STATUS_MESSAGES] || 'Unknown'
  },

  // Check if HTTP method is safe
  isSafeMethod(method: string): boolean {
    const safeMethods = [HTTP_METHODS.GET, HTTP_METHODS.HEAD, HTTP_METHODS.OPTIONS, HTTP_METHODS.TRACE]
    return safeMethods.includes(method as any)
  },

  // Check if HTTP method is idempotent
  isIdempotentMethod(method: string): boolean {
    const idempotentMethods = [HTTP_METHODS.GET, HTTP_METHODS.HEAD, HTTP_METHODS.OPTIONS, HTTP_METHODS.PUT, HTTP_METHODS.DELETE]
    return idempotentMethods.includes(method as any)
  },

  // Check if HTTP method allows body
  allowsBody(method: string): boolean {
    const bodyMethods = [HTTP_METHODS.POST, HTTP_METHODS.PUT, HTTP_METHODS.PATCH]
    return bodyMethods.includes(method as any)
  },

  // Check if content type is JSON
  isJSON(contentType: string): boolean {
    return contentType.includes('application/json')
  },

  // Check if content type is form data
  isFormData(contentType: string): boolean {
    return contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')
  },

  // Check if content type is text
  isText(contentType: string): boolean {
    return contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml')
  },

  // Get content type from file extension
  getContentTypeFromExtension(extension: string): string {
    const extensionToType: Record<string, string> = {
      '.html': CONTENT_TYPES.TEXT_HTML,
      '.css': CONTENT_TYPES.TEXT_CSS,
      '.js': CONTENT_TYPES.TEXT_JAVASCRIPT,
      '.json': CONTENT_TYPES.APPLICATION_JSON,
      '.xml': CONTENT_TYPES.APPLICATION_XML,
      '.pdf': CONTENT_TYPES.APPLICATION_PDF,
      '.zip': CONTENT_TYPES.APPLICATION_ZIP,
      '.jpg': CONTENT_TYPES.IMAGE_JPEG,
      '.jpeg': CONTENT_TYPES.IMAGE_JPEG,
      '.png': CONTENT_TYPES.IMAGE_PNG,
      '.gif': CONTENT_TYPES.IMAGE_GIF,
      '.webp': CONTENT_TYPES.IMAGE_WEBP,
      '.svg': CONTENT_TYPES.IMAGE_SVG_XML,
      '.ico': CONTENT_TYPES.IMAGE_ICO,
      '.mp4': CONTENT_TYPES.VIDEO_MP4,
      '.webm': CONTENT_TYPES.VIDEO_WEBM,
      '.mp3': CONTENT_TYPES.AUDIO_MP3,
      '.wav': CONTENT_TYPES.AUDIO_WAV,
      '.ogg': CONTENT_TYPES.AUDIO_OGG,
    }
    return extensionToType[extension.toLowerCase()] || CONTENT_TYPES.APPLICATION_OCTET_STREAM
  },
}

export default {
  HTTP_STATUS_CODES,
  HTTP_STATUS_CATEGORIES,
  HTTP_STATUS_MESSAGES,
  HTTP_METHODS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  CHARSETS,
  RATE_LIMIT_DEFAULTS,
  PAGINATION_DEFAULTS,
  API_VERSIONS,
  CACHE_CONTROL_DIRECTIVES,
  SECURITY_HEADERS,
  HTTP_CLIENT_DEFAULTS,
  HTTP_SERVER_DEFAULTS,
  WEBSOCKET_STATUS_CODES,
  HttpUtils,
}
