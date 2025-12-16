import { z } from 'zod';

export const MarkNotificationReadRequestSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID format'),
  recipientId: z.string().uuid('Invalid recipient ID format')
});

export interface MarkNotificationReadRequest {
  notificationId: string;
  recipientId: string;
}