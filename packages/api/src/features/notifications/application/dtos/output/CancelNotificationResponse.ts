import { NotificationResponse } from './NotificationResponse';

export interface CancelNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}