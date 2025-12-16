import { Notification } from '../entities/Notification.entity';
import { NotificationDeliveryResult, SmsOptions } from '../types';

export interface ISmsProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  sendSms(to: string, message: string, options?: SmsOptions): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): string;
}