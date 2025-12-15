import { NotificationType, NotificationPriority, NotificationChannel } from '../../../domain/types';

export interface ScheduleNotificationRequest {
  recipientId: string;
  type: NotificationType;
  title: string;
  content: string;
  scheduledAt: Date;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  templateId?: string;
  templateVariables?: Record<string, any>;
  groupId?: string;
  metadata?: Record<string, any>;
}