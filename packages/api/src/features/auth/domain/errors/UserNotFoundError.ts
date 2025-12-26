import { DomainError } from '@modular-features/shared';

// Domain specific error for user not found
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}

// Domain specific error for user not found by email
export class UserByEmailNotFoundError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} not found`, 'USER_BY_EMAIL_NOT_FOUND', 404);
  }
}

// Domain specific error for user already exists
export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS', 409);
  }
}