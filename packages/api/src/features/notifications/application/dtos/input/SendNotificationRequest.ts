import { z } from 'zod';
import { NotificationType, NotificationPriority, NotificationChannel } from '../../../domain/types';

export const SendNotificationRequestSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID format'),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  data: z.record(z.string(), z.any()).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  scheduledAt: z.string().datetime().optional(),
  templateId: z.string().uuid('Invalid template ID format').optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  groupId: z.string().uuid('Invalid group ID format').optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export interface SendNotificationRequest {
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