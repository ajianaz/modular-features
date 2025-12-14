import { BaseError } from './base'

// API Error base class
export abstract class APIError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
    this.name = 'APIError'
  }
}

// Bad request error class
export class BadRequestError extends APIError {
  private details?: Record<string, any>

  constructor(
    message: string = 'Bad request',
    details?: Record<string, any>,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      details,
    })
    this.details = details
  }

  public get code(): string {
    return 'BAD_REQUEST'
  }

  public get statusCode(): number {
    return 400
  }

  public getDetails(): Record<string, any> | undefined {
    return this.details
  }
}

// Unauthorized error class
export class UnauthorizedError extends APIError {
  private authType?: string

  constructor(
    message: string = 'Unauthorized',
    authType?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      authType,
    })
    this.authType = authType
  }

  public get code(): string {
    return 'UNAUTHORIZED'
  }

  public get statusCode(): number {
    return 401
  }

  public getAuthType(): string | undefined {
    return this.authType
  }
}

// Forbidden error class
export class ForbiddenError extends APIError {
  private requiredPermission?: string
  private userPermission?: string

  constructor(
    message: string = 'Forbidden',
    requiredPermission?: string,
    userPermission?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      requiredPermission,
      userPermission,
    })
    this.requiredPermission = requiredPermission
    this.userPermission = userPermission
  }

  public get code(): string {
    return 'FORBIDDEN'
  }

  public get statusCode(): number {
    return 403
  }

  public getRequiredPermission(): string | undefined {
    return this.requiredPermission
  }

  public getUserPermission(): string | undefined {
    return this.userPermission
  }
}

// Not found error class
export class NotFoundError extends APIError {
  private resource?: string
  private resourceId?: string

  constructor(
    message: string = 'Not found',
    resource?: string,
    resourceId?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      resource,
      resourceId,
    })
    this.resource = resource
    this.resourceId = resourceId
  }

  public get code(): string {
    return 'NOT_FOUND'
  }

  public get statusCode(): number {
    return 404
  }

  public getResource(): string | undefined {
    return this.resource
  }

  public getResourceId(): string | undefined {
    return this.resourceId
  }
}

// Method not allowed error class
export class MethodNotAllowedError extends APIError {
  private method?: string
  private allowedMethods?: string[]

  constructor(
    message: string = 'Method not allowed',
    method?: string,
    allowedMethods?: string[],
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      method,
      allowedMethods,
    })
    this.method = method
    this.allowedMethods = allowedMethods
  }

  public get code(): string {
    return 'METHOD_NOT_ALLOWED'
  }

  public get statusCode(): number {
    return 405
  }

  public getMethod(): string | undefined {
    return this.method
  }

  public getAllowedMethods(): string[] | undefined {
    return this.allowedMethods
  }
}

// Conflict error class
export class ConflictError extends APIError {
  private resource?: string
  private conflictReason?: string

  constructor(
    message: string = 'Conflict',
    resource?: string,
    conflictReason?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      resource,
      conflictReason,
    })
    this.resource = resource
    this.conflictReason = conflictReason
  }

  public get code(): string {
    return 'CONFLICT'
  }

  public get statusCode(): number {
    return 409
  }

  public getResource(): string | undefined {
    return this.resource
  }

  public getConflictReason(): string | undefined {
    return this.conflictReason
  }
}

// Payload too large error class
export class PayloadTooLargeError extends APIError {
  private maxSize?: number
  private actualSize?: number

  constructor(
    message: string = 'Payload too large',
    maxSize?: number,
    actualSize?: number,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      maxSize,
      actualSize,
    })
    this.maxSize = maxSize
    this.actualSize = actualSize
  }

  public get code(): string {
    return 'PAYLOAD_TOO_LARGE'
  }

  public get statusCode(): number {
    return 413
  }

  public getMaxSize(): number | undefined {
    return this.maxSize
  }

  public getActualSize(): number | undefined {
    return this.actualSize
  }
}

// Unsupported media type error class
export class UnsupportedMediaTypeError extends APIError {
  private supportedTypes?: string[]
  private actualType?: string

  constructor(
    message: string = 'Unsupported media type',
    supportedTypes?: string[],
    actualType?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      supportedTypes,
      actualType,
    })
    this.supportedTypes = supportedTypes
    this.actualType = actualType
  }

  public get code(): string {
    return 'UNSUPPORTED_MEDIA_TYPE'
  }

  public get statusCode(): number {
    return 415
  }

  public getSupportedTypes(): string[] | undefined {
    return this.supportedTypes
  }

  public getActualType(): string | undefined {
    return this.actualType
  }
}

// Too many requests error class
export class TooManyRequestsError extends APIError {
  private limit?: number
  private resetTime?: Date
  private retryAfter?: number

  constructor(
    message: string = 'Too many requests',
    limit?: number,
    resetTime?: Date,
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      limit,
      resetTime,
      retryAfter,
    })
    this.limit = limit
    this.resetTime = resetTime
    this.retryAfter = retryAfter
  }

  public get code(): string {
    return 'TOO_MANY_REQUESTS'
  }

  public get statusCode(): number {
    return 429
  }

  public getLimit(): number | undefined {
    return this.limit
  }

  public getResetTime(): Date | undefined {
    return this.resetTime
  }

  public getRetryAfter(): number | undefined {
    return this.retryAfter
  }
}

// Internal server error class
export class InternalServerError extends APIError {
  private errorId?: string

  constructor(
    message: string = 'Internal server error',
    errorId?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      errorId,
    })
    this.errorId = errorId
  }

  public get code(): string {
    return 'INTERNAL_SERVER_ERROR'
  }

  public get statusCode(): number {
    return 500
  }

  public getErrorId(): string | undefined {
    return this.errorId
  }
}

// Not implemented error class
export class NotImplementedError extends APIError {
  private feature?: string

  constructor(
    message: string = 'Not implemented',
    feature?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      feature,
    })
    this.feature = feature
  }

  public get code(): string {
    return 'NOT_IMPLEMENTED'
  }

  public get statusCode(): number {
    return 501
  }

  public getFeature(): string | undefined {
    return this.feature
  }
}

// Service unavailable error class
export class ServiceUnavailableError extends APIError {
  private service?: string
  private retryAfter?: number

  constructor(
    message: string = 'Service unavailable',
    service?: string,
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      service,
      retryAfter,
    })
    this.service = service
    this.retryAfter = retryAfter
  }

  public get code(): string {
    return 'SERVICE_UNAVAILABLE'
  }

  public get statusCode(): number {
    return 503
  }

  public getService(): string | undefined {
    return this.service
  }

  public getRetryAfter(): number | undefined {
    return this.retryAfter
  }
}

// Gateway timeout error class
export class GatewayTimeoutError extends APIError {
  private timeout?: number

  constructor(
    message: string = 'Gateway timeout',
    timeout?: number,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      timeout,
    })
    this.timeout = timeout
  }

  public get code(): string {
    return 'GATEWAY_TIMEOUT'
  }

  public get statusCode(): number {
    return 504
  }

  public getTimeout(): number | undefined {
    return this.timeout
  }
}

// Version not supported error class
export class VersionNotSupportedError extends APIError {
  private currentVersion?: string
  private supportedVersions?: string[]
  private minSupportedVersion?: string

  constructor(
    message: string = 'Version not supported',
    currentVersion?: string,
    supportedVersions?: string[],
    minSupportedVersion?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      currentVersion,
      supportedVersions,
      minSupportedVersion,
    })
    this.currentVersion = currentVersion
    this.supportedVersions = supportedVersions
    this.minSupportedVersion = minSupportedVersion
  }

  public get code(): string {
    return 'VERSION_NOT_SUPPORTED'
  }

  public get statusCode(): number {
    return 400
  }

  public getCurrentVersion(): string | undefined {
    return this.currentVersion
  }

  public getSupportedVersions(): string[] | undefined {
    return this.supportedVersions
  }

  public getMinSupportedVersion(): string | undefined {
    return this.minSupportedVersion
  }
}

// Deprecation warning error class
export class DeprecationWarningError extends APIError {
  private deprecatedFeature?: string
  private deprecationDate?: Date
  private removalDate?: Date
  private alternative?: string

  constructor(
    message: string = 'Deprecated feature used',
    deprecatedFeature?: string,
    deprecationDate?: Date,
    removalDate?: Date,
    alternative?: string,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      deprecatedFeature,
      deprecationDate,
      removalDate,
      alternative,
    })
    this.deprecatedFeature = deprecatedFeature
    this.deprecationDate = deprecationDate
    this.removalDate = removalDate
    this.alternative = alternative
  }

  public get code(): string {
    return 'DEPRECATION_WARNING'
  }

  public get statusCode(): number {
    return 200 // Still successful but with warning
  }

  public getDeprecatedFeature(): string | undefined {
    return this.deprecatedFeature
  }

  public getDeprecationDate(): Date | undefined {
    return this.deprecationDate
  }

  public getRemovalDate(): Date | undefined {
    return this.removalDate
  }

  public getAlternative(): string | undefined {
    return this.alternative
  }
}

// Rate limit headers builder
export class RateLimitHeadersBuilder {
  private limit?: number
  private remaining?: number
  private reset?: number
  private retryAfter?: number

  static create(): RateLimitHeadersBuilder {
    return new RateLimitHeadersBuilder()
  }

  withLimit(limit: number): RateLimitHeadersBuilder {
    this.limit = limit
    return this
  }

  withRemaining(remaining: number): RateLimitHeadersBuilder {
    this.remaining = remaining
    return this
  }

  withReset(reset: number): RateLimitHeadersBuilder {
    this.reset = reset
    return this
  }

  withRetryAfter(retryAfter: number): RateLimitHeadersBuilder {
    this.retryAfter = retryAfter
    return this
  }

  build(): Record<string, string> {
    const headers: Record<string, string> = {}
    
    if (this.limit !== undefined) {
      headers['X-RateLimit-Limit'] = this.limit.toString()
    }
    if (this.remaining !== undefined) {
      headers['X-RateLimit-Remaining'] = this.remaining.toString()
    }
    if (this.reset !== undefined) {
      headers['X-RateLimit-Reset'] = this.reset.toString()
    }
    if (this.retryAfter !== undefined) {
      headers['Retry-After'] = this.retryAfter.toString()
    }
    
    return headers
  }
}

// API error context builder
export class APIErrorContextBuilder {
  private context: Record<string, any> = {}

  static create(): APIErrorContextBuilder {
    return new APIErrorContextBuilder()
  }

  withRequestId(requestId: string): APIErrorContextBuilder {
    this.context.requestId = requestId
    return this
  }

  withUserId(userId: string): APIErrorContextBuilder {
    this.context.userId = userId
    return this
  }

  withEndpoint(endpoint: string): APIErrorContextBuilder {
    this.context.endpoint = endpoint
    return this
  }

  withMethod(method: string): APIErrorContextBuilder {
    this.context.method = method
    return this
  }

  withStatusCode(statusCode: number): APIErrorContextBuilder {
    this.context.statusCode = statusCode
    return this
  }

  withTimestamp(timestamp: Date = new Date()): APIErrorContextBuilder {
    this.context.timestamp = timestamp
    return this
  }

  withUserAgent(userAgent: string): APIErrorContextBuilder {
    this.context.userAgent = userAgent
    return this
  }

  withIpAddress(ipAddress: string): APIErrorContextBuilder {
    this.context.ipAddress = ipAddress
    return this
  }

  withVersion(version: string): APIErrorContextBuilder {
    this.context.version = version
    return this
  }

  withAdditional(data: Record<string, any>): APIErrorContextBuilder {
    this.context = { ...this.context, ...data }
    return this
  }

  build(): Record<string, any> {
    return { ...this.context }
  }
}

export {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  TooManyRequestsError,
  InternalServerError,
  NotImplementedError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  VersionNotSupportedError,
  DeprecationWarningError,
  RateLimitHeadersBuilder,
  APIErrorContextBuilder,
}
