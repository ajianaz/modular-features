import { NotificationType, NotificationChannel } from '../../../domain/types';

export interface CreateNotificationTemplateRequest {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables?: string[]; // List of variable names used in template
  metadata?: Record<string, any>;
  isActive?: boolean;
}