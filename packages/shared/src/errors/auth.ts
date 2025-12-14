import { DomainError } from './base'

// Authentication error base class
export abstract class AuthenticationError extends DomainError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context)
    this.name = 'AuthenticationError'
  }

  public get statusCode(): number {
    return 401
  }
}

// Invalid credentials error class
export class InvalidCredentialsError extends AuthenticationError {
  private username?: string

  constructor(
    username?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || 'Invalid username or password',
      {
        ...context,
        username,
        reason: 'invalid_credentials',
      }
    )
    this.username = username
  }

  public get code(): string {
    return 'INVALID_CREDENTIALS'
  }

  public getUsername(): string | undefined {
    return this.username
  }
}

// Token expired error class
export class TokenExpiredError extends AuthenticationError {
  private tokenType: string
  private expiredAt?: Date

  constructor(
    tokenType: string,
    expiredAt?: Date,
    context?: Record<string, any>
  ) {
    super(
      `${tokenType} token has expired`,
      {
        ...context,
        tokenType,
        expiredAt,
        reason: 'token_expired',
      }
    )
    this.tokenType = tokenType
    this.expiredAt = expiredAt
  }

  public get code(): string {
    return 'TOKEN_EXPIRED'
  }

  public getTokenType(): string {
    return this.tokenType
  }

  public getExpiredAt(): Date | undefined {
    return this.expiredAt
  }
}

// Token invalid error class
export class TokenInvalidError extends AuthenticationError {
  private tokenType: string
  private reason: string

  constructor(
    tokenType: string,
    reason: string,
    context?: Record<string, any>
  ) {
    super(
      `${tokenType} token is invalid: ${reason}`,
      {
        ...context,
        tokenType,
        tokenInvalidReason: reason,
        reason: 'token_invalid',
      }
    )
    this.tokenType = tokenType
    this.reason = reason
  }

  public get code(): string {
    return 'TOKEN_INVALID'
  }

  public getTokenType(): string {
    return this.tokenType
  }

  public getInvalidReason(): string {
    return this.reason
  }
}

// Session expired error class
export class SessionExpiredError extends AuthenticationError {
  private sessionId?: string
  private expiredAt?: Date

  constructor(
    sessionId?: string,
    expiredAt?: Date,
    context?: Record<string, any>
  ) {
    super(
      'Session has expired',
      {
        ...context,
        sessionId,
        expiredAt,
        reason: 'session_expired',
      }
    )
    this.sessionId = sessionId
    this.expiredAt = expiredAt
  }

  public get code(): string {
    return 'SESSION_EXPIRED'
  }

  public getSessionId(): string | undefined {
    return this.sessionId
  }

  public getExpiredAt(): Date | undefined {
    return this.expiredAt
  }
}

// Account locked error class
export class AccountLockedError extends AuthenticationError {
  private userId?: string
  private lockedAt?: Date
  private unlockAt?: Date
  private reason: string

  constructor(
    reason: string,
    userId?: string,
    lockedAt?: Date,
    unlockAt?: Date,
    context?: Record<string, any>
  ) {
    super(
      `Account is locked: ${reason}`,
      {
        ...context,
        userId,
        lockedAt,
        unlockAt,
        lockReason: reason,
        reason: 'account_locked',
      }
    )
    this.userId = userId
    this.lockedAt = lockedAt
    this.unlockAt = unlockAt
    this.reason = reason
  }

  public get code(): string {
    return 'ACCOUNT_LOCKED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getLockedAt(): Date | undefined {
    return this.lockedAt
  }

  public getUnlockAt(): Date | undefined {
    return this.unlockAt
  }

  public getLockReason(): string {
    return this.reason
  }
}

// Account disabled error class
export class AccountDisabledError extends AuthenticationError {
  private userId?: string
  private disabledAt?: Date
  private reason: string

  constructor(
    reason: string,
    userId?: string,
    disabledAt?: Date,
    context?: Record<string, any>
  ) {
    super(
      `Account is disabled: ${reason}`,
      {
        ...context,
        userId,
        disabledAt,
        disableReason: reason,
        reason: 'account_disabled',
      }
    )
    this.userId = userId
    this.disabledAt = disabledAt
    this.reason = reason
  }

  public get code(): string {
    return 'ACCOUNT_DISABLED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getDisabledAt(): Date | undefined {
    return this.disabledAt
  }

  public getDisableReason(): string {
    return this.reason
  }
}

// Email not verified error class
export class EmailNotVerifiedError extends AuthenticationError {
  private userId?: string
  private email?: string

  constructor(
    userId?: string,
    email?: string,
    context?: Record<string, any>
  ) {
    super(
      'Email address is not verified',
      {
        ...context,
        userId,
        email,
        reason: 'email_not_verified',
      }
    )
    this.userId = userId
    this.email = email
  }

  public get code(): string {
    return 'EMAIL_NOT_VERIFIED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getEmail(): string | undefined {
    return this.email
  }
}

// Two-factor authentication required error class
export class TwoFactorRequiredError extends AuthenticationError {
  private userId?: string
  private availableFactors: string[]

  constructor(
    userId?: string,
    availableFactors: string[] = [],
    context?: Record<string, any>
  ) {
    super(
      'Two-factor authentication is required',
      {
        ...context,
        userId,
        availableFactors,
        reason: '2fa_required',
      }
    )
    this.userId = userId
    this.availableFactors = availableFactors
  }

  public get code(): string {
    return 'TWO_FACTOR_REQUIRED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getAvailableFactors(): string[] {
    return [...this.availableFactors]
  }
}

// Two-factor authentication failed error class
export class TwoFactorFailedError extends AuthenticationError {
  private userId?: string
  private factor: string
  private reason: string

  constructor(
    factor: string,
    reason: string,
    userId?: string,
    context?: Record<string, any>
  ) {
    super(
      `Two-factor authentication failed for ${factor}: ${reason}`,
      {
        ...context,
        userId,
        factor,
        twoFactorFailureReason: reason,
        reason: '2fa_failed',
      }
    )
    this.userId = userId
    this.factor = factor
    this.reason = reason
  }

  public get code(): string {
    return 'TWO_FACTOR_FAILED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getFactor(): string {
    return this.factor
  }

  public getFailureReason(): string {
    return this.reason
  }
}

// Password reset required error class
export class PasswordResetRequiredError extends AuthenticationError {
  private userId?: string
  private reason: string

  constructor(
    reason: string,
    userId?: string,
    context?: Record<string, any>
  ) {
    super(
      `Password reset is required: ${reason}`,
      {
        ...context,
        userId,
        passwordResetReason: reason,
        reason: 'password_reset_required',
      }
    )
    this.userId = userId
    this.reason = reason
  }

  public get code(): string {
    return 'PASSWORD_RESET_REQUIRED'
  }

  public getUserId(): string | undefined {
    return this.userId
  }

  public getReason(): string {
    return this.reason
  }
}

// Too many login attempts error class
export class TooManyLoginAttemptsError extends AuthenticationError {
  private ipAddress?: string
  private username?: string
  private attempts: number
  private resetAt?: Date

  constructor(
    attempts: number,
    ipAddress?: string,
    username?: string,
    resetAt?: Date,
    context?: Record<string, any>
  ) {
    super(
      `Too many login attempts. Try again later.`,
      {
        ...context,
        ipAddress,
        username,
        attempts,
        resetAt,
        reason: 'too_many_attempts',
      }
    )
    this.ipAddress = ipAddress
    this.username = username
    this.attempts = attempts
    this.resetAt = resetAt
  }

  public get code(): string {
    return 'TOO_MANY_LOGIN_ATTEMPTS'
  }

  public getStatusCode(): number {
    return 429 // Rate limit exceeded
  }

  public getIpAddress(): string | undefined {
    return this.ipAddress
  }

  public getUsername(): string | undefined {
    return this.username
  }

  public getAttempts(): number {
    return this.attempts
  }

  public getResetAt(): Date | undefined {
    return this.resetAt
  }
}

// Invalid verification code error class
export class InvalidVerificationCodeError extends AuthenticationError {
  private codeType: string
  private attempts?: number

  constructor(
    codeType: string,
    attempts?: number,
    context?: Record<string, any>
  ) {
    super(
      `Invalid verification code for ${codeType}`,
      {
        ...context,
        codeType,
        attempts,
        reason: 'invalid_verification_code',
      }
    )
    this.codeType = codeType
    this.attempts = attempts
  }

  public get code(): string {
    return 'INVALID_VERIFICATION_CODE'
  }

  public getCodeType(): string {
    return this.codeType
  }

  public getAttempts(): number | undefined {
    return this.attempts
  }
}

// Social authentication error class
export class SocialAuthenticationError extends AuthenticationError {
  private provider: string
  private errorCode?: string
  private errorMessage?: string

  constructor(
    provider: string,
    errorMessage?: string,
    errorCode?: string,
    context?: Record<string, any>
  ) {
    super(
      `Social authentication failed with ${provider}: ${errorMessage || 'Unknown error'}`,
      {
        ...context,
        provider,
        socialErrorCode: errorCode,
        socialErrorMessage: errorMessage,
        reason: 'social_auth_failed',
      }
    )
    this.provider = provider
    this.errorCode = errorCode
    this.errorMessage = errorMessage
  }

  public get code(): string {
    return 'SOCIAL_AUTH_FAILED'
  }

  public getProvider(): string {
    return this.provider
  }

  public getErrorCode(): string | undefined {
    return this.errorCode
  }

  public getErrorMessage(): string | undefined {
    return this.errorMessage
  }
}

// Authentication context builder
export class AuthenticationContextBuilder {
  private context: Record<string, any> = {}

  static create(): AuthenticationContextBuilder {
    return new AuthenticationContextBuilder()
  }

  withUserId(userId: string): AuthenticationContextBuilder {
    this.context.userId = userId
    return this
  }

  withUsername(username: string): AuthenticationContextBuilder {
    this.context.username = username
    return this
  }

  withEmail(email: string): AuthenticationContextBuilder {
    this.context.email = email
    return this
  }

  withSessionId(sessionId: string): AuthenticationContextBuilder {
    this.context.sessionId = sessionId
    return this
  }

  withIpAddress(ipAddress: string): AuthenticationContextBuilder {
    this.context.ipAddress = ipAddress
    return this
  }

  withUserAgent(userAgent: string): AuthenticationContextBuilder {
    this.context.userAgent = userAgent
    return this
  }

  withRequestId(requestId: string): AuthenticationContextBuilder {
    this.context.requestId = requestId
    return this
  }

  withTimestamp(timestamp: Date = new Date()): AuthenticationContextBuilder {
    this.context.timestamp = timestamp
    return this
  }

  withAdditional(data: Record<string, any>): AuthenticationContextBuilder {
    this.context = { ...this.context, ...data }
    return this
  }

  build(): Record<string, any> {
    return { ...this.context }
  }
}

export {
  AuthenticationError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
  SessionExpiredError,
  AccountLockedError,
  AccountDisabledError,
  EmailNotVerifiedError,
  TwoFactorRequiredError,
  TwoFactorFailedError,
  PasswordResetRequiredError,
  TooManyLoginAttemptsError,
  InvalidVerificationCodeError,
  SocialAuthenticationError,
  AuthenticationContextBuilder,
}
