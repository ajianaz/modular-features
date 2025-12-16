import { NotificationError } from './NotificationError';

export class NotificationSendError extends NotificationError {
  constructor(message: string) {
    super(`Failed to send notification: ${message}`, 'NOTIFICATION_SEND_ERROR', 500);
  }
}