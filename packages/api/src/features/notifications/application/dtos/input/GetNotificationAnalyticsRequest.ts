import { z } from 'zod';
import { NotificationType, NotificationChannel, NotificationStatus } from '../../../domain/types';

export const GetNotificationAnalyticsRequestSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  recipientId: z.string().uuid('Invalid recipient ID format').optional(),
  groupId: z.string().uuid('Invalid group ID format').optional(),
  groupBy: z.enum(['day', 'week', 'month', 'type', 'channel', 'status']).optional().default('day')
});

export interface GetNotificationAnalyticsRequest {
  startDate: Date;
  endDate: Date;
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  recipientId?: string;
  groupId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'type' | 'channel' | 'status';
}