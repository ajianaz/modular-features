import { DomainError } from '@modular-monolith/shared';

// Authentication related errors
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
}

export class AccountNotVerifiedError extends DomainError {
  constructor(email: string) {
    super(`Account with email ${email} is not verified`, 'ACCOUNT_NOT_VERIFIED', 401);
  }
}

export class AccountSuspendedError extends DomainError {
  constructor(email: string) {
    super(`Account with email ${email} is suspended`, 'ACCOUNT_SUSPENDED', 403);
  }
}

export class AccountInactiveError extends DomainError {
  constructor(email: string) {
    super(`Account with email ${email} is inactive`, 'ACCOUNT_INACTIVE', 403);
  }
}

export class InvalidTokenError extends DomainError {
  constructor() {
    super('Invalid authentication token', 'INVALID_TOKEN', 401);
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('Authentication token has expired', 'TOKEN_EXPIRED', 401);
  }
}

export class RefreshTokenRevokedError extends DomainError {
  constructor() {
    super('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED', 401);
  }
}

export class SessionExpiredError extends DomainError {
  constructor() {
    super('User session has expired', 'SESSION_EXPIRED', 401);
  }
}

export class SessionNotFoundError extends DomainError {
  constructor(sessionId: string) {
    super(`Session with ID ${sessionId} not found`, 'SESSION_NOT_FOUND', 404);
  }
}

export class TooManyLoginAttemptsError extends DomainError {
  constructor(attempts: number, lockoutMinutes: number) {
    super(`Too many login attempts (${attempts}). Account locked for ${lockoutMinutes} minutes`, 'TOO_MANY_LOGIN_ATTEMPTS', 429);
  }
}

export class PasswordResetRequiredError extends DomainError {
  constructor(email: string) {
    super(`Password reset required for account ${email}`, 'PASSWORD_RESET_REQUIRED', 428);
  }
}

export class MfaRequiredError extends DomainError {
  constructor() {
    super('Multi-factor authentication is required', 'MFA_REQUIRED', 428);
  }
}

export class InvalidMfaCodeError extends DomainError {
  constructor() {
    super('Invalid multi-factor authentication code', 'INVALID_MFA_CODE', 401);
  }
}

export class MfaSetupRequiredError extends DomainError {
  constructor() {
    super('Multi-factor authentication setup is required', 'MFA_SETUP_REQUIRED', 428);
  }
}