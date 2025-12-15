import { z } from 'zod';
import { NotificationStatus, NotificationType } from '../../../domain/types';

export const GetNotificationsRequestSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID format').optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  read: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupId: z.string().uuid('Invalid group ID format').optional()
});

export interface GetNotificationsRequest {
  recipientId?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  groupId?: string;
}