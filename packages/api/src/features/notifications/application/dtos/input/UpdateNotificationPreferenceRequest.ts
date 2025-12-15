import { NotificationChannel, NotificationType } from '../../../domain/types';

export interface UpdateNotificationPreferenceRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
    timezone: string;
  };
  frequency?: {
    maxPerHour?: number;
    maxPerDay?: number;
    maxPerWeek?: number;
  };
}