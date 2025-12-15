import { DomainError } from '@modular-monolith/shared';

export class NotificationError extends DomainError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code || 'NOTIFICATION_ERROR', statusCode || 500);
  }
}