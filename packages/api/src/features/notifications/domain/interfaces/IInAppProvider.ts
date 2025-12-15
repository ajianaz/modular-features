import { Notification } from '../entities/Notification.entity';
import { NotificationDeliveryResult, InAppOptions } from '../types';

export interface IInAppProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  sendInApp(userId: string, title: string, message: string, options?: InAppOptions): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): string;
}