import { NotificationChannel, NotificationType } from '../../../domain/types';

export interface NotificationTemplateResponse {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}