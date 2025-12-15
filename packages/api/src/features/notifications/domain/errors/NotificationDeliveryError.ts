import { NotificationError } from './NotificationError';

export class NotificationDeliveryError extends NotificationError {
  constructor(message: string) {
    super(`Notification delivery failed: ${message}`, 'NOTIFICATION_DELIVERY_ERROR', 500);
  }
}