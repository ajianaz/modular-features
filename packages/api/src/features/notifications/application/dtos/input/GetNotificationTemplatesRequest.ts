import { NotificationType, NotificationChannel } from '../../../domain/types';

export interface GetNotificationTemplatesRequest {
  type?: NotificationType;
  channel?: NotificationChannel;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  search?: string; // Search by name or subject
}