import { NotificationRecipient } from '../entities/NotificationRecipient.entity';

export interface INotificationRecipientRepository {
  findById(id: string): Promise<NotificationRecipient | null>;
  findByNotificationId(notificationId: string): Promise<NotificationRecipient[]>;
  findByUserId(userId: string): Promise<NotificationRecipient[]>;
  create(recipient: NotificationRecipient): Promise<NotificationRecipient>;
  update(recipient: NotificationRecipient): Promise<NotificationRecipient>;
  delete(id: string): Promise<void>;
  deleteByNotificationId(notificationId: string): Promise<void>;
  findByEmail(email: string): Promise<NotificationRecipient[]>;
  findByPhone(phone: string): Promise<NotificationRecipient[]>;
  findByDeviceToken(deviceToken: string): Promise<NotificationRecipient[]>;
  findByType(type: 'to' | 'cc' | 'bcc'): Promise<NotificationRecipient[]>;
  findActive(): Promise<NotificationRecipient[]>;
}