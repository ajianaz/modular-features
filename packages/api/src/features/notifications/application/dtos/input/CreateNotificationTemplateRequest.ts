import { z } from 'zod';
import { NotificationType, NotificationChannel } from '../../../domain/types';

export const CreateNotificationTemplateRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  variables: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional().default(true)
});

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