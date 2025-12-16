import { NotificationType, NotificationChannel } from '../../../domain/types';

export interface UpdateNotificationTemplateRequest {
  templateId: string;
  name?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  subject?: string;
  content?: string;
  variables?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}