import { z } from 'zod';

export const RetryFailedNotificationRequestSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID format'),
  recipientId: z.string().uuid('Invalid recipient ID format').optional(), // Optional: for authorization check
  force: z.boolean().optional().default(false) // Force retry even if max attempts reached
});

export interface RetryFailedNotificationRequest {
  notificationId: string;
  recipientId?: string; // Optional: for authorization check
  force?: boolean; // Force retry even if max attempts reached
}