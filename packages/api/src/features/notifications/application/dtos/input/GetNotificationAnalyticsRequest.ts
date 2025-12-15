import { NotificationType, NotificationChannel, NotificationStatus } from '../../../domain/types';

export interface GetNotificationAnalyticsRequest {
  startDate: Date;
  endDate: Date;
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  recipientId?: string;
  groupId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'type' | 'channel' | 'status';
}