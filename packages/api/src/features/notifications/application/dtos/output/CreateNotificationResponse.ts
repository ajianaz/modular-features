import { NotificationResponse } from './NotificationResponse';

export interface CreateNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}