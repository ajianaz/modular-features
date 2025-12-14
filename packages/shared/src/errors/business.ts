import { DomainError } from './base'

// Payment-related business errors
export class PaymentFailedError extends DomainError {
  private transactionId?: string
  private paymentMethod?: string
  private failureReason: string

  constructor(
    failureReason: string,
    transactionId?: string,
    paymentMethod?: string,
    context?: Record<string, any>
  ) {
    super(
      `Payment failed: ${failureReason}`,
      {
        ...context,
        transactionId,
        paymentMethod,
        failureReason,
      }
    )
    this.transactionId = transactionId
    this.paymentMethod = paymentMethod
    this.failureReason = failureReason
  }

  public get code(): string {
    return 'PAYMENT_FAILED'
  }

  public getTransactionId(): string | undefined {
    return this.transactionId
  }

  public getPaymentMethod(): string | undefined {
    return this.paymentMethod
  }

  public getFailureReason(): string {
    return this.failureReason
  }
}

export class InsufficientFundsError extends PaymentFailedError {
  private balance: number
  private amount: number

  constructor(
    balance: number,
    amount: number,
    transactionId?: string,
    paymentMethod?: string,
    context?: Record<string, any>
  ) {
    super(
      `Insufficient funds. Balance: ${balance}, attempted: ${amount}`,
      transactionId,
      paymentMethod,
      {
        ...context,
        balance,
        amount,
      }
    )
    this.balance = balance
    this.amount = amount
  }

  public get code(): string {
    return 'INSUFFICIENT_FUNDS'
  }

  public getBalance(): number {
    return this.balance
  }

  public getAmount(): number {
    return this.amount
  }
}

export class PaymentDeclinedError extends PaymentFailedError {
  private declineCode?: string

  constructor(
    declineReason: string,
    declineCode?: string,
    transactionId?: string,
    paymentMethod?: string,
    context?: Record<string, any>
  ) {
    super(
      `Payment declined: ${declineReason}`,
      transactionId,
      paymentMethod,
      {
        ...context,
        declineCode,
      }
    )
    this.declineCode = declineCode
  }

  public get code(): string {
    return 'PAYMENT_DECLINED'
  }

  public getDeclineCode(): string | undefined {
    return this.declineCode
  }
}

export class PaymentTimeoutError extends PaymentFailedError {
  private timeoutDuration: number

  constructor(
    timeoutDuration: number,
    transactionId?: string,
    paymentMethod?: string,
    context?: Record<string, any>
  ) {
    super(
      `Payment timed out after ${timeoutDuration} seconds`,
      transactionId,
      paymentMethod,
      {
        ...context,
        timeoutDuration,
      }
    )
    this.timeoutDuration = timeoutDuration
  }

  public get code(): string {
    return 'PAYMENT_TIMEOUT'
  }

  public getTimeoutDuration(): number {
    return this.timeoutDuration
  }
}

// Subscription-related business errors
export class SubscriptionExpiredError extends DomainError {
  private subscriptionId: string
  private expiredAt: Date

  constructor(
    subscriptionId: string,
    expiredAt: Date,
    context?: Record<string, any>
  ) {
    super(
      `Subscription ${subscriptionId} expired on ${expiredAt.toISOString()}`,
      {
        ...context,
        subscriptionId,
        expiredAt,
      }
    )
    this.subscriptionId = subscriptionId
    this.expiredAt = expiredAt
  }

  public get code(): string {
    return 'SUBSCRIPTION_EXPIRED'
  }

  public getSubscriptionId(): string {
    return this.subscriptionId
  }

  public getExpiredAt(): Date {
    return this.expiredAt
  }
}

export class SubscriptionInactiveError extends DomainError {
  private subscriptionId: string
  private status: string

  constructor(
    subscriptionId: string,
    status: string,
    context?: Record<string, any>
  ) {
    super(
      `Subscription ${subscriptionId} is inactive (status: ${status})`,
      {
        ...context,
        subscriptionId,
        status,
      }
    )
    this.subscriptionId = subscriptionId
    this.status = status
  }

  public get code(): string {
    return 'SUBSCRIPTION_INACTIVE'
  }

  public getSubscriptionId(): string {
    return this.subscriptionId
  }

  public getStatus(): string {
    return this.status
  }
}

export class QuotaExceededError extends DomainError {
  private quotaType: string
  private currentUsage: number
  private limit: number

  constructor(
    quotaType: string,
    currentUsage: number,
    limit: number,
    context?: Record<string, any>
  ) {
    super(
      `Quota exceeded for ${quotaType}. Current usage: ${currentUsage}, limit: ${limit}`,
      {
        ...context,
        quotaType,
        currentUsage,
        limit,
      }
    )
    this.quotaType = quotaType
    this.currentUsage = currentUsage
    this.limit = limit
  }

  public get code(): string {
    return 'QUOTA_EXCEEDED'
  }

  public getQuotaType(): string {
    return this.quotaType
  }

  public getCurrentUsage(): number {
    return this.currentUsage
  }

  public getLimit(): number {
    return this.limit
  }
}

export class PlanLimitExceededError extends QuotaExceededError {
  private planName: string
  private feature: string

  constructor(
    planName: string,
    feature: string,
    currentUsage: number,
    limit: number,
    context?: Record<string, any>
  ) {
    super(
      `plan_limit_${feature}`,
      currentUsage,
      limit,
      {
        ...context,
        planName,
        feature,
      }
    )
    this.planName = planName
    this.feature = feature
  }

  public get code(): string {
    return 'PLAN_LIMIT_EXCEEDED'
  }

  public getPlanName(): string {
    return this.planName
  }

  public getFeature(): string {
    return this.feature
  }
}

// Order-related business errors
export class OrderCannotBeCancelledError extends DomainError {
  private orderId: string
  private currentStatus: string

  constructor(
    orderId: string,
    currentStatus: string,
    context?: Record<string, any>
  ) {
    super(
      `Order ${orderId} cannot be cancelled. Current status: ${currentStatus}`,
      {
        ...context,
        orderId,
        currentStatus,
      }
    )
    this.orderId = orderId
    this.currentStatus = currentStatus
  }

  public get code(): string {
    return 'ORDER_CANNOT_BE_CANCELLED'
  }

  public getOrderId(): string {
    return this.orderId
  }

  public getCurrentStatus(): string {
    return this.currentStatus
  }
}

export class OrderCannotBeModifiedError extends DomainError {
  private orderId: string
  private currentStatus: string
  private reason: string

  constructor(
    orderId: string,
    currentStatus: string,
    reason: string,
    context?: Record<string, any>
  ) {
    super(
      `Order ${orderId} cannot be modified. Current status: ${currentStatus}. Reason: ${reason}`,
      {
        ...context,
        orderId,
        currentStatus,
        reason,
      }
    )
    this.orderId = orderId
    this.currentStatus = currentStatus
    this.reason = reason
  }

  public get code(): string {
    return 'ORDER_CANNOT_BE_MODIFIED'
  }

  public getOrderId(): string {
    return this.orderId
  }

  public getCurrentStatus(): string {
    return this.currentStatus
  }

  public getReason(): string {
    return this.reason
  }
}

export class InsufficientInventoryError extends DomainError {
  private productId: string
  private requestedQuantity: number
  private availableQuantity: number

  constructor(
    productId: string,
    requestedQuantity: number,
    availableQuantity: number,
    context?: Record<string, any>
  ) {
    super(
      `Insufficient inventory for product ${productId}. Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
      {
        ...context,
        productId,
        requestedQuantity,
        availableQuantity,
      }
    )
    this.productId = productId
    this.requestedQuantity = requestedQuantity
    this.availableQuantity = availableQuantity
  }

  public get code(): string {
    return 'INSUFFICIENT_INVENTORY'
  }

  public getProductId(): string {
    return this.productId
  }

  public getRequestedQuantity(): number {
    return this.requestedQuantity
  }

  public getAvailableQuantity(): number {
    return this.availableQuantity
  }
}

// Notification-related business errors
export class NotificationSendFailedError extends DomainError {
  private notificationId?: string
  private channel: string
  private reason: string

  constructor(
    channel: string,
    reason: string,
    notificationId?: string,
    context?: Record<string, any>
  ) {
    super(
      `Failed to send notification via ${channel}: ${reason}`,
      {
        ...context,
        notificationId,
        channel,
        reason,
      }
    )
    this.notificationId = notificationId
    this.channel = channel
    this.reason = reason
  }

  public get code(): string {
    return 'NOTIFICATION_SEND_FAILED'
  }

  public getNotificationId(): string | undefined {
    return this.notificationId
  }

  public getChannel(): string {
    return this.channel
  }

  public getReason(): string {
    return this.reason
  }
}

export class RateLimitExceededError extends DomainError {
  private resource: string
  private limit: number
  private resetTime?: Date

  constructor(
    resource: string,
    limit: number,
    resetTime?: Date,
    context?: Record<string, any>
  ) {
    super(
      `Rate limit exceeded for ${resource}. Limit: ${limit}. Reset time: ${resetTime?.toISOString() || 'unknown'}`,
      {
        ...context,
        resource,
        limit,
        resetTime,
      }
    )
    this.resource = resource
    this.limit = limit
    this.resetTime = resetTime
  }

  public get code(): string {
    return 'RATE_LIMIT_EXCEEDED'
  }

  public getStatusCode(): number {
    return 429
  }

  public getResource(): string {
    return this.resource
  }

  public getLimit(): number {
    return this.limit
  }

  public getResetTime(): Date | undefined {
    return this.resetTime
  }
}

// General business rule errors
export class BusinessRuleViolationError extends DomainError {
  private rule: string
  private details?: string

  constructor(
    rule: string,
    details?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Business rule violation: ${rule}${details ? ` - ${details}` : ''}`,
      {
        ...context,
        rule,
        details,
      }
    )
    this.rule = rule
    this.details = details
  }

  public get code(): string {
    return 'BUSINESS_RULE_VIOLATION'
  }

  public getRule(): string {
    return this.rule
  }

  public getDetails(): string | undefined {
    return this.details
  }
}

export class FeatureNotAvailableError extends BusinessRuleViolationError {
  private feature: string
  private plan?: string

  constructor(
    feature: string,
    plan?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      `feature_not_available`,
      plan ? `Feature '${feature}' not available in plan '${plan}'` : `Feature '${feature}' is not available`,
      message,
      {
        ...context,
        feature,
        plan,
      }
    )
    this.feature = feature
    this.plan = plan
  }

  public get code(): string {
    return 'FEATURE_NOT_AVAILABLE'
  }

  public getFeature(): string {
    return this.feature
  }

  public getPlan(): string | undefined {
    return this.plan
  }
}

export class MaintenanceModeError extends BusinessRuleViolationError {
  private service: string
  private maintenanceStartTime?: Date
  private maintenanceEndTime?: Date

  constructor(
    service: string,
    maintenanceStartTime?: Date,
    maintenanceEndTime?: Date,
    context?: Record<string, any>
  ) {
    super(
      'maintenance_mode',
      maintenanceStartTime && maintenanceEndTime 
        ? `Service '${service}' is under maintenance from ${maintenanceStartTime.toISOString()} to ${maintenanceEndTime.toISOString()}`
        : `Service '${service}' is currently under maintenance`,
      undefined,
      {
        ...context,
        service,
        maintenanceStartTime,
        maintenanceEndTime,
      }
    )
    this.service = service
    this.maintenanceStartTime = maintenanceStartTime
    this.maintenanceEndTime = maintenanceEndTime
  }

  public get code(): string {
    return 'MAINTENANCE_MODE'
  }

  public getService(): string {
    return this.service
  }

  public getMaintenanceStartTime(): Date | undefined {
    return this.maintenanceStartTime
  }

  public getMaintenanceEndTime(): Date | undefined {
    return this.maintenanceEndTime
  }
}

export {
  PaymentFailedError,
  InsufficientFundsError,
  PaymentDeclinedError,
  PaymentTimeoutError,
  SubscriptionExpiredError,
  SubscriptionInactiveError,
  QuotaExceededError,
  PlanLimitExceededError,
  OrderCannotBeCancelledError,
  OrderCannotBeModifiedError,
  InsufficientInventoryError,
  NotificationSendFailedError,
  RateLimitExceededError,
  BusinessRuleViolationError,
  FeatureNotAvailableError,
  MaintenanceModeError,
}
