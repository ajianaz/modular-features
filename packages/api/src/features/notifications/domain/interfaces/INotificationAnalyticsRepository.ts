import { NotificationAnalytics } from '../entities/NotificationAnalytics.entity';
import { NotificationChannel } from '../types';

export interface INotificationAnalyticsRepository {
  findById(id: string): Promise<NotificationAnalytics | null>;
  findByNotificationId(notificationId: string): Promise<NotificationAnalytics[]>;
  create(analytics: NotificationAnalytics): Promise<NotificationAnalytics>;
  update(analytics: NotificationAnalytics): Promise<NotificationAnalytics>;
  delete(id: string): Promise<void>;
  deleteByNotificationId(notificationId: string): Promise<void>;
  findByChannel(channel: NotificationChannel): Promise<NotificationAnalytics[]>;
  findByEvent(event: string): Promise<NotificationAnalytics[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<NotificationAnalytics[]>;
  findSent(): Promise<NotificationAnalytics[]>;
  findDelivered(): Promise<NotificationAnalytics[]>;
  findOpened(): Promise<NotificationAnalytics[]>;
  findClicked(): Promise<NotificationAnalytics[]>;
  findFailed(): Promise<NotificationAnalytics[]>;
  findBounced(): Promise<NotificationAnalytics[]>;
  countByEvent(notificationId: string): Promise<Record<string, number>>;
  countByChannel(startDate: Date, endDate: Date): Promise<Record<NotificationChannel, number>>;
}