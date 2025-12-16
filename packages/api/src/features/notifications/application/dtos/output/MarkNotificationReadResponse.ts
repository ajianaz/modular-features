import { NotificationResponse } from './NotificationResponse';

export interface MarkNotificationReadResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}