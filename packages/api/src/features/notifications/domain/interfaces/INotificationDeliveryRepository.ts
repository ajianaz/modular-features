import { NotificationDelivery } from '../entities/NotificationDelivery.entity';
import { NotificationChannel } from '../types';

export interface INotificationDeliveryRepository {
  findById(id: string): Promise<NotificationDelivery | null>;
  findByNotificationId(notificationId: string): Promise<NotificationDelivery[]>;
  create(delivery: NotificationDelivery): Promise<NotificationDelivery>;
  update(delivery: NotificationDelivery): Promise<NotificationDelivery>;
  delete(id: string): Promise<void>;
  deleteByNotificationId(notificationId: string): Promise<void>;
  findByChannel(channel: NotificationChannel): Promise<NotificationDelivery[]>;
  findByStatus(status: string): Promise<NotificationDelivery[]>;
  findByRecipient(recipient: string): Promise<NotificationDelivery[]>;
  findPending(): Promise<NotificationDelivery[]>;
  findFailed(): Promise<NotificationDelivery[]>;
  findDelivered(): Promise<NotificationDelivery[]>;
  countByStatus(notificationId: string): Promise<Record<string, number>>;
  markAsSent(id: string, messageId?: string): Promise<NotificationDelivery>;
  markAsDelivered(id: string): Promise<NotificationDelivery>;
  markAsFailed(id: string, error: string): Promise<NotificationDelivery>;
}