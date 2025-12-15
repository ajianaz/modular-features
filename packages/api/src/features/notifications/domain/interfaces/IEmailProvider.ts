import { Notification } from '../entities/Notification.entity';
import { NotificationDeliveryResult, EmailOptions } from '../types';

export interface IEmailProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): string;
}