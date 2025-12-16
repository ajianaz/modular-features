import { NotificationError } from './NotificationError';

export class InvalidNotificationDataError extends NotificationError {
  constructor(errors: string[]) {
    super(`Invalid notification data: ${errors.join(', ')}`, 'INVALID_NOTIFICATION_DATA', 400);
  }
}