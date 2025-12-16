import { z } from 'zod';

export const CancelNotificationRequestSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID format'),
  recipientId: z.string().uuid('Invalid recipient ID format').optional(), // Optional: for authorization check
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

export interface CancelNotificationRequest {
  notificationId: string;
  recipientId?: string; // Optional: for authorization check
  reason?: string;
}