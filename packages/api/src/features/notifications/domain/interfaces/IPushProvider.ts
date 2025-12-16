import { Notification } from '../entities/Notification.entity';
import { NotificationDeliveryResult, PushOptions } from '../types';

export interface IPushProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  sendPush(to: string, title: string, message: string, options?: PushOptions): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): string;
}