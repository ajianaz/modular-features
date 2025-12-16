import { NotificationResponse } from './NotificationResponse';

export interface ScheduleNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}