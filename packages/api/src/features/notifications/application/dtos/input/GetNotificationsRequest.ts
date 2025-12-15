import { NotificationStatus, NotificationType } from '../../../domain/types';

export interface GetNotificationsRequest {
  recipientId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  groupId?: string;
}