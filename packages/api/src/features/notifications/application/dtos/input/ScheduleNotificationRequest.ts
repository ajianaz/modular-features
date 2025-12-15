import { z } from 'zod';
import { NotificationType, NotificationPriority, NotificationChannel } from '../../../domain/types';

export const ScheduleNotificationRequestSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID format'),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  scheduledAt: z.string().datetime('Invalid datetime format for scheduledAt'),
  data: z.record(z.string(), z.any()).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  templateId: z.string().uuid('Invalid template ID format').optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  groupId: z.string().uuid('Invalid group ID format').optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

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