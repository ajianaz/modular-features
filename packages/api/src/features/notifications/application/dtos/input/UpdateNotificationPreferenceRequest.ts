import { z } from 'zod';
import { NotificationChannel, NotificationType } from '../../../domain/types';

export const UpdateNotificationPreferenceRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  enabled: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
    timezone: z.string().min(1, 'Timezone is required')
  }).optional(),
  frequency: z.object({
    maxPerHour: z.number().min(1).optional(),
    maxPerDay: z.number().min(1).optional(),
    maxPerWeek: z.number().min(1).optional()
  }).optional()
});

export interface UpdateNotificationPreferenceRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
    timezone: string;
  };
  frequency?: {
    maxPerHour?: number;
    maxPerDay?: number;
    maxPerWeek?: number;
  };
}