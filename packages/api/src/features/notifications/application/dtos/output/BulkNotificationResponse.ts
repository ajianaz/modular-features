import { NotificationResponse } from './NotificationResponse';

export interface BulkNotificationResponse {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  notifications?: NotificationResponse[];
  errors?: Array<{
    recipientId: string;
    error: string;
  }>;
  message?: string;
}