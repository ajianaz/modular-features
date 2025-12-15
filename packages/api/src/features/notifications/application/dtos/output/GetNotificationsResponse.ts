import { NotificationResponse } from './NotificationResponse';

export interface GetNotificationsResponse {
  success: boolean;
  notifications: NotificationResponse[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  error?: string;
}