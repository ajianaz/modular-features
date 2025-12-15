import { NotificationType, NotificationPriority, NotificationChannel } from '../../../domain/types';

export interface CreateNotificationRequest {
  recipientId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  scheduledAt?: Date;
  templateId?: string;
  templateVariables?: Record<string, any>;
  groupId?: string;
  metadata?: Record<string, any>;
}