import { NotificationError } from './NotificationError';

export class NotificationNotFoundError extends NotificationError {
  constructor(id: string) {
    super(`Notification with id ${id} not found`, 'NOTIFICATION_NOT_FOUND', 404);
  }
}