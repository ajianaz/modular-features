import { NotificationResponse } from './NotificationResponse';

export interface RetryFailedNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}