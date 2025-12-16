import { NotificationResponse } from './NotificationResponse';
import { z } from 'zod';

export interface SendNotificationResponse {
  success: boolean;
  notification?: NotificationResponse;
  error?: string;
  message?: string;
}

export const SendNotificationResponseSchema = z.object({
  success: z.boolean(),
  notification: z.object({
    id: z.string(),
    userId: z.string(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    status: z.string(),
    channels: z.array(z.string()),
    priority: z.string().optional(),
    templateId: z.string().optional(),
    scheduledFor: z.string().optional(),
    sentAt: z.string().optional(),
    readAt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    metadata: z.record(z.string(), z.any()).optional()
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional()
});