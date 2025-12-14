// Base Error Classes

// Abstract base error class
export abstract class BaseError extends Error {
  public readonly timestamp: Date
  public readonly context?: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = new Date()
    this.context = context

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  public abstract get code(): string
  public abstract get statusCode(): number

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    }
  }

  public toString(): string {
    return `${this.name}: ${this.message} (Code: ${this.code}, Status: ${this.statusCode})`
  }
}

// Domain Error base class (DDD)
export abstract class DomainError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
    this.name = 'DomainError'
  }

  public get statusCode(): number {
    return 400
  }
}

// Application Error base class
export abstract class ApplicationError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
    this.name = 'ApplicationError'
  }

  public get statusCode(): number {
    return 500
  }
}

// Infrastructure Error base class
export abstract class InfrastructureError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
    this.name = 'InfrastructureError'
  }

  public get statusCode(): number {
    return 503
  }
}

// System Error base class
export abstract class SystemError extends BaseError {
  public readonly errorId: string
  public readonly severity: 'low' | 'medium' | 'high' | 'critical'

  constructor(
    message: string, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ) {
    super(message, context)
    this.name = 'SystemError'
    this.errorId = generateErrorId()
    this.severity = severity
  }

  public get statusCode(): number {
    return 500
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      errorId: this.errorId,
      severity: this.severity,
    }
  }
}

// Error factory for creating errors with context
export class ErrorFactory {
  static createDomainError(
    errorClass: new (message: string, context?: Record<string, any>) => DomainError,
    message: string,
    context?: Record<string, any>
  ): DomainError {
    return new errorClass(message, context)
  }

  static createApplicationError(
    errorClass: new (message: string, context?: Record<string, any>) => ApplicationError,
    message: string,
    context?: Record<string, any>
  ): ApplicationError {
    return new errorClass(message, context)
  }

  static createInfrastructureError(
    errorClass: new (message: string, context?: Record<string, any>) => InfrastructureError,
    message: string,
    context?: Record<string, any>
  ): InfrastructureError {
    return new errorClass(message, context)
  }

  static createSystemError(
    errorClass: new (
      message: string, 
      severity?: 'low' | 'medium' | 'high' | 'critical',
      context?: Record<string, any>
    ) => SystemError,
    message: string,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    context?: Record<string, any>
  ): SystemError {
    return new errorClass(message, severity, context)
  }
}

// Error logging utility
export class ErrorLogger {
  static log(error: Error, additionalContext?: Record<string, any>): void {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...additionalContext,
    }

    if (error instanceof BaseError) {
      console.error('Application Error:', {
        ...errorData,
        code: error.code,
        statusCode: error.statusCode,
        context: { ...error.context, ...additionalContext },
      })
    } else {
      console.error('Unexpected Error:', errorData)
    }
  }

  static async logAsync(error: Error, additionalContext?: Record<string, any>): Promise<void> {
    // For async logging to external services
    return this.log(error, additionalContext)
  }
}

// Error utility functions
export const isError = (value: any): value is Error => {
  return value instanceof Error
}

export const isDomainError = (value: any): value is DomainError => {
  return value instanceof DomainError
}

export const isApplicationError = (value: any): value is ApplicationError => {
  return value instanceof ApplicationError
}

export const isInfrastructureError = (value: any): value is InfrastructureError => {
  return value instanceof InfrastructureError
}

export const isSystemError = (value: any): value is SystemError => {
  return value instanceof SystemError
}

// Error builder for chaining error creation
export class ErrorBuilder {
  private errors: BaseError[] = []
  private context: Record<string, any> = {}

  static create(): ErrorBuilder {
    return new ErrorBuilder()
  }

  add(error: BaseError): ErrorBuilder {
    this.errors.push(error)
    return this
  }

  withContext(context: Record<string, any>): ErrorBuilder {
    this.context = { ...this.context, ...context }
    return this
  }

  build(): BaseError {
    if (this.errors.length === 0) {
      throw new Error('No errors added to builder')
    }

    if (this.errors.length === 1) {
      const error = this.errors[0]
      if (this.context) {
        error.context = { ...error.context, ...this.context }
      }
      return error
    }

    // For multiple errors, create an aggregate error
    return new AggregateError(this.errors, this.context)
  }

  buildAll(): BaseError[] {
    return this.errors.map(error => {
      if (this.context) {
        error.context = { ...error.context, ...this.context }
      }
      return error
    })
  }
}

// Aggregate Error for multiple errors
export class AggregateError extends DomainError {
  public readonly errors: BaseError[]

  constructor(errors: BaseError[], context?: Record<string, any>) {
    const message = `Multiple errors occurred: ${errors.map(e => e.message).join(', ')}`
    super(message, context)
    this.errors = errors
  }

  public get code(): string {
    return 'AGGREGATE_ERROR'
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      errors: this.errors.map(error => error.toJSON()),
    }
  }
}

// Error types enumeration
export enum ErrorType {
  DOMAIN = 'DOMAIN',
  APPLICATION = 'APPLICATION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SYSTEM = 'SYSTEM',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

// Error severity enumeration
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error category enumeration
export enum ErrorCategory {
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  AVAILABILITY = 'availability',
  DATA = 'data',
}

// Error context builder
export class ErrorContextBuilder {
  private context: Record<string, any> = {}

  static create(): ErrorContextBuilder {
    return new ErrorContextBuilder()
  }

  add(key: string, value: any): ErrorContextBuilder {
    this.context[key] = value
    return this
  }

  addUserId(userId: string): ErrorContextBuilder {
    return this.add('userId', userId)
  }

  addRequestId(requestId: string): ErrorContextBuilder {
    return this.add('requestId', requestId)
  }

  addOperation(operation: string): ErrorContextBuilder {
    return this.add('operation', operation)
  }

  addResource(resource: string, resourceId: string): ErrorContextBuilder {
    return this.add('resource', resource).add('resourceId', resourceId)
  }

  addDuration(duration: number): ErrorContextBuilder {
    return this.add('duration', duration)
  }

  addMetadata(metadata: Record<string, any>): ErrorContextBuilder {
    this.context = { ...this.context, ...metadata }
    return this
  }

  build(): Record<string, any> {
    return { ...this.context }
  }
}

// Utility function to generate unique error IDs
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Error metrics tracking
export class ErrorMetrics {
  private static errorCounts = new Map<string, number>()
  private static errorCountsByHour = new Map<string, Map<string, number>>()

  static track(error: BaseError): void {
    const errorType = error.constructor.name
    const currentHour = new Date().toISOString().slice(0, 13) // YYYY-MM-DDTHH

    // Increment total count
    this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1)

    // Increment hourly count
    if (!this.errorCountsByHour.has(currentHour)) {
      this.errorCountsByHour.set(currentHour, new Map())
    }
    const hourlyMap = this.errorCountsByHour.get(currentHour)!
    hourlyMap.set(errorType, (hourlyMap.get(errorType) || 0) + 1)
  }

  static getErrorCounts(): Map<string, number> {
    return new Map(this.errorCounts)
  }

  static getHourlyErrorCounts(): Map<string, Map<string, number>> {
    return new Map(this.errorCountsByHour)
  }

  static reset(): void {
    this.errorCounts.clear()
    this.errorCountsByHour.clear()
  }
}

export {
  BaseError,
  DomainError,
  ApplicationError,
  InfrastructureError,
  SystemError,
  ErrorFactory,
  ErrorLogger,
  ErrorBuilder,
  AggregateError,
  ErrorContextBuilder,
  ErrorMetrics,
}
