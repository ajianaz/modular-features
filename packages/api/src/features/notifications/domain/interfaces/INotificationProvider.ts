import { Notification } from '../entities/Notification.entity';
import { NotificationDeliveryResult } from '../types';

export interface INotificationProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): string;
}