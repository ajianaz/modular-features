import { NotificationChannel, NotificationType } from '../../../domain/types';

export interface NotificationPreferenceResponse {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  frequency?: {
    maxPerHour?: number;
    maxPerDay?: number;
    maxPerWeek?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}