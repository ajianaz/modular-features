import { InfrastructureError } from './base'

// Database-related errors
export class DatabaseError extends InfrastructureError {
  private query?: string
  private operation?: string

  constructor(
    message: string,
    query?: string,
    operation?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        query,
        operation,
        errorType: 'database',
      }
    )
    this.query = query
    this.operation = operation
  }

  public get code(): string {
    return 'DATABASE_ERROR'
  }

  public getQuery(): string | undefined {
    return this.query
  }

  public getOperation(): string | undefined {
    return this.operation
  }
}

export class ConnectionError extends DatabaseError {
  private host?: string
  private port?: number
  private database?: string

  constructor(
    message: string = 'Database connection failed',
    host?: string,
    port?: number,
    database?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      undefined,
      'connect',
      {
        ...context,
        host,
        port,
        database,
        errorType: 'connection',
      }
    )
    this.host = host
    this.port = port
    this.database = database
  }

  public get code(): string {
    return 'CONNECTION_ERROR'
  }

  public getHost(): string | undefined {
    return this.host
  }

  public getPort(): number | undefined {
    return this.port
  }

  public getDatabase(): string | undefined {
    return this.database
  }
}

export class QueryError extends DatabaseError {
  private errorCode?: string

  constructor(
    message: string,
    query: string,
    errorCode?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      query,
      'query',
      {
        ...context,
        errorCode,
        errorType: 'query',
      }
    )
    this.query = query
    this.errorCode = errorCode
  }

  public get code(): string {
    return 'QUERY_ERROR'
  }

  public getErrorCode(): string | undefined {
    return this.errorCode
  }
}

export class TransactionError extends DatabaseError {
  private transactionId?: string

  constructor(
    message: string,
    transactionId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      undefined,
      'transaction',
      {
        ...context,
        transactionId,
        errorType: 'transaction',
      }
    )
    this.transactionId = transactionId
  }

  public get code(): string {
    return 'TRANSACTION_ERROR'
  }

  public getTransactionId(): string | undefined {
    return this.transactionId
  }
}

// Network-related errors
export class NetworkError extends InfrastructureError {
  private url?: string
  private method?: string
  private statusCode?: number

  constructor(
    message: string,
    url?: string,
    method?: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        url,
        method,
        statusCode,
        errorType: 'network',
      }
    )
    this.url = url
    this.method = method
    this.statusCode = statusCode
  }

  public get code(): string {
    return 'NETWORK_ERROR'
  }

  public getUrl(): string | undefined {
    return this.url
  }

  public getMethod(): string | undefined {
    return this.method
  }

  public getStatusCode(): number | undefined {
    return this.statusCode
  }
}

export class TimeoutError extends NetworkError {
  private timeout: number
  private operation?: string

  constructor(
    operation: string,
    timeout: number,
    url?: string,
    context?: Record<string, any>
  ) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      url,
      undefined,
      undefined,
      {
        ...context,
        timeout,
        operation,
        errorType: 'timeout',
      }
    )
    this.timeout = timeout
    this.operation = operation
  }

  public get code(): string {
    return 'TIMEOUT_ERROR'
  }

  public getStatusCode(): number {
    return 408 // Request Timeout
  }

  public getTimeout(): number {
    return this.timeout
  }

  public getOperation(): string | undefined {
    return this.operation
  }
}

export class ServiceUnavailableError extends NetworkError {
  private serviceName: string
  private retryAfter?: number

  constructor(
    serviceName: string,
    message?: string,
    retryAfter?: number,
    url?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Service '${serviceName}' is unavailable`,
      url,
      undefined,
      503,
      {
        ...context,
        serviceName,
        retryAfter,
        errorType: 'service_unavailable',
      }
    )
    this.serviceName = serviceName
    this.retryAfter = retryAfter
  }

  public get code(): string {
    return 'SERVICE_UNAVAILABLE'
  }

  public getStatusCode(): number {
    return 503
  }

  public getServiceName(): string {
    return this.serviceName
  }

  public getRetryAfter(): number | undefined {
    return this.retryAfter
  }
}

// External service errors
export class ExternalServiceError extends InfrastructureError {
  private serviceName: string
  private operation?: string
  private serviceErrorCode?: string
  private serviceErrorMessage?: string

  constructor(
    serviceName: string,
    message: string,
    operation?: string,
    serviceErrorCode?: string,
    serviceErrorMessage?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        serviceName,
        operation,
        serviceErrorCode,
        serviceErrorMessage,
        errorType: 'external_service',
      }
    )
    this.serviceName = serviceName
    this.operation = operation
    this.serviceErrorCode = serviceErrorCode
    this.serviceErrorMessage = serviceErrorMessage
  }

  public get code(): string {
    return 'EXTERNAL_SERVICE_ERROR'
  }

  public getServiceName(): string {
    return this.serviceName
  }

  public getOperation(): string | undefined {
    return this.operation
  }

  public getServiceErrorCode(): string | undefined {
    return this.serviceErrorCode
  }

  public getServiceErrorMessage(): string | undefined {
    return this.serviceErrorMessage
  }
}

export class ThirdPartyApiError extends ExternalServiceError {
  private url?: string
  private method?: string
  private requestPayload?: any

  constructor(
    serviceName: string,
    message: string,
    url?: string,
    method?: string,
    serviceErrorCode?: string,
    serviceErrorMessage?: string,
    requestPayload?: any,
    context?: Record<string, any>
  ) {
    super(
      serviceName,
      message,
      'api_call',
      serviceErrorCode,
      serviceErrorMessage,
      {
        ...context,
        url,
        method,
        requestPayload,
        errorType: 'third_party_api',
      }
    )
    this.url = url
    this.method = method
    this.requestPayload = requestPayload
  }

  public get code(): string {
    return 'THIRD_PARTY_API_ERROR'
  }

  public getUrl(): string | undefined {
    return this.url
  }

  public getMethod(): string | undefined {
    return this.method
  }

  public getRequestPayload(): any {
    return this.requestPayload
  }
}

// Cache-related errors
export class CacheError extends InfrastructureError {
  private cacheType?: string
  private key?: string
  private operation?: string

  constructor(
    message: string,
    cacheType?: string,
    key?: string,
    operation?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        cacheType,
        key,
        operation,
        errorType: 'cache',
      }
    )
    this.cacheType = cacheType
    this.key = key
    this.operation = operation
  }

  public get code(): string {
    return 'CACHE_ERROR'
  }

  public getCacheType(): string | undefined {
    return this.cacheType
  }

  public getKey(): string | undefined {
    return this.key
  }

  public getOperation(): string | undefined {
    return this.operation
  }
}

// File system errors
export class FileSystemError extends InfrastructureError {
  private path?: string
  private operation?: string

  constructor(
    message: string,
    path?: string,
    operation?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        path,
        operation,
        errorType: 'file_system',
      }
    )
    this.path = path
    this.operation = operation
  }

  public get code(): string {
    return 'FILE_SYSTEM_ERROR'
  }

  public getPath(): string | undefined {
    return this.path
  }

  public getOperation(): string | undefined {
    return this.operation
  }
}

export class FileNotFoundError extends FileSystemError {
  constructor(
    path: string,
    context?: Record<string, any>
  ) {
    super(
      `File not found: ${path}`,
      path,
      'read',
      {
        ...context,
        errorType: 'file_not_found',
      }
    )
  }

  public get code(): string {
    return 'FILE_NOT_FOUND'
  }
}

export class FilePermissionError extends FileSystemError {
  constructor(
    path: string,
    operation: string,
    context?: Record<string, any>
  ) {
    super(
      `Permission denied for operation '${operation}' on: ${path}`,
      path,
      operation,
      {
        ...context,
        errorType: 'file_permission',
      }
    )
  }

  public get code(): string {
    return 'FILE_PERMISSION_ERROR'
  }
}

// Queue/message system errors
export class QueueError extends InfrastructureError {
  private queueName?: string
  private operation?: string
  private messageId?: string

  constructor(
    message: string,
    queueName?: string,
    operation?: string,
    messageId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        queueName,
        operation,
        messageId,
        errorType: 'queue',
      }
    )
    this.queueName = queueName
    this.operation = operation
    this.messageId = messageId
  }

  public get code(): string {
    return 'QUEUE_ERROR'
  }

  public getQueueName(): string | undefined {
    return this.queueName
  }

  public getOperation(): string | undefined {
    return this.operation
  }

  public getMessageId(): string | undefined {
    return this.messageId
  }
}

export class MessagePublishError extends QueueError {
  private topic?: string
  private payload?: any

  constructor(
    queueName: string,
    message: string,
    topic?: string,
    payload?: any,
    context?: Record<string, any>
  ) {
    super(
      message,
      queueName,
      'publish',
      undefined,
      {
        ...context,
        topic,
        payload,
        errorType: 'message_publish',
      }
    )
    this.topic = topic
    this.payload = payload
  }

  public get code(): string {
    return 'MESSAGE_PUBLISH_ERROR'
  }

  public getTopic(): string | undefined {
    return this.topic
  }

  public getPayload(): any {
    return this.payload
  }
}

export class MessageProcessingError extends QueueError {
  private payload?: any
  private processingTime?: number

  constructor(
    queueName: string,
    messageId: string,
    message: string,
    payload?: any,
    processingTime?: number,
    context?: Record<string, any>
  ) {
    super(
      message,
      queueName,
      'process',
      messageId,
      {
        ...context,
        payload,
        processingTime,
        errorType: 'message_processing',
      }
    )
    this.payload = payload
    this.processingTime = processingTime
  }

  public get code(): string {
    return 'MESSAGE_PROCESSING_ERROR'
  }

  public getPayload(): any {
    return this.payload
  }

  public getProcessingTime(): number | undefined {
    return this.processingTime
  }
}

// Configuration errors
export class ConfigurationError extends InfrastructureError {
  private configKey?: string
  private configValue?: any

  constructor(
    message: string,
    configKey?: string,
    configValue?: any,
    context?: Record<string, any>
  ) {
    super(
      message,
      {
        ...context,
        configKey,
        configValue,
        errorType: 'configuration',
      }
    )
    this.configKey = configKey
    this.configValue = configValue
  }

  public get code(): string {
    return 'CONFIGURATION_ERROR'
  }

  public getConfigKey(): string | undefined {
    return this.configKey
  }

  public getConfigValue(): any {
    return this.configValue
  }
}

// Infrastructure context builder
export class InfrastructureContextBuilder {
  private context: Record<string, any> = {}

  static create(): InfrastructureContextBuilder {
    return new InfrastructureContextBuilder()
  }

  withHost(host: string): InfrastructureContextBuilder {
    this.context.host = host
    return this
  }

  withPort(port: number): InfrastructureContextBuilder {
    this.context.port = port
    return this
  }

  withDatabase(database: string): InfrastructureContextBuilder {
    this.context.database = database
    return this
  }

  withUrl(url: string): InfrastructureContextBuilder {
    this.context.url = url
    return this
  }

  withMethod(method: string): InfrastructureContextBuilder {
    this.context.method = method
    return this
  }

  withOperation(operation: string): InfrastructureContextBuilder {
    this.context.operation = operation
    return this
  }

  withQuery(query: string): InfrastructureContextBuilder {
    this.context.query = query
    return this
  }

  withTimeout(timeout: number): InfrastructureContextBuilder {
    this.context.timeout = timeout
    return this
  }

  withServiceName(serviceName: string): InfrastructureContextBuilder {
    this.context.serviceName = serviceName
    return this
  }

  withCacheType(cacheType: string): InfrastructureContextBuilder {
    this.context.cacheType = cacheType
    return this
  }

  withKey(key: string): InfrastructureContextBuilder {
    this.context.key = key
    return this
  }

  withPath(path: string): InfrastructureContextBuilder {
    this.context.path = path
    return this
  }

  withQueueName(queueName: string): InfrastructureContextBuilder {
    this.context.queueName = queueName
    return this
  }

  withMessageId(messageId: string): InfrastructureContextBuilder {
    this.context.messageId = messageId
    return this
  }

  withTopic(topic: string): InfrastructureContextBuilder {
    this.context.topic = topic
    return this
  }

  withConfigKey(configKey: string): InfrastructureContextBuilder {
    this.context.configKey = configKey
    return this
  }

  withAdditional(data: Record<string, any>): InfrastructureContextBuilder {
    this.context = { ...this.context, ...data }
    return this
  }

  build(): Record<string, any> {
    return { ...this.context }
  }
}

export {
  DatabaseError,
  ConnectionError,
  QueryError,
  TransactionError,
  NetworkError,
  TimeoutError,
  ServiceUnavailableError,
  ExternalServiceError,
  ThirdPartyApiError,
  CacheError,
  FileSystemError,
  FileNotFoundError,
  FilePermissionError,
  QueueError,
  MessagePublishError,
  MessageProcessingError,
  ConfigurationError,
  InfrastructureContextBuilder,
}
