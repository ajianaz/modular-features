import { NotificationResponse } from './NotificationResponse';

export interface SendNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}