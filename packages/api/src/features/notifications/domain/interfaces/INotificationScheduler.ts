import { Notification } from '../entities/Notification.entity';

export interface INotificationScheduler {
  schedule(notification: Notification, scheduledFor: Date): Promise<void>;
  cancel(notificationId: string): Promise<void>;
  getScheduledNotifications(): Promise<Notification[]>;
  processScheduledNotifications(): Promise<void>;
  isAvailable(): Promise<boolean>;
}