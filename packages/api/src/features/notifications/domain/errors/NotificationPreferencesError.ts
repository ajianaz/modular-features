import { NotificationError } from './NotificationError';

export class NotificationPreferencesError extends NotificationError {
  constructor(message: string) {
    super(`Notification preferences error: ${message}`, 'NOTIFICATION_PREFERENCES_ERROR', 400);
  }
}