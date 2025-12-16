import { Notification } from '../entities/Notification.entity';
import { NotificationStatus, NotificationType, NotificationChannel, NotificationPriority, GetNotificationsOptions } from '../types';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, options?: GetNotificationsOptions): Promise<Notification[]>;
  create(notification: Notification): Promise<Notification>;
  update(notification: Notification): Promise<Notification>;
  delete(id: string): Promise<void>;
  findPendingNotifications(limit?: number): Promise<Notification[]>;
  findScheduledNotifications(before: Date): Promise<Notification[]>;
  findFailedNotifications(maxRetries?: number): Promise<Notification[]>;
  countByStatus(userId?: string): Promise<Record<NotificationStatus, number>>;
  findByStatus(status: NotificationStatus): Promise<Notification[]>;
  findByType(type: NotificationType): Promise<Notification[]>;
  findByChannel(channel: NotificationChannel): Promise<Notification[]>;
  findByPriority(priority: NotificationPriority): Promise<Notification[]>;
  findExpired(): Promise<Notification[]>;
  findScheduledForUser(userId: string): Promise<Notification[]>;
  findUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markMultipleAsRead(ids: string[]): Promise<Notification[]>;
  cancelScheduled(id: string): Promise<Notification>;
  deleteExpired(): Promise<number>;
  deleteOlderThan(date: Date): Promise<number>;
}