import { z } from 'zod';

export const UpdateUserSettingsRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(1).max(168).optional(), // 1 hour to 1 week
  autoSaveDrafts: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
  customSettings: z.record(z.string(), z.any()).optional()
});

export interface UpdateUserSettingsRequest {
  userId: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
  autoSaveDrafts?: boolean;
  showOnlineStatus?: boolean;
  profileVisibility?: 'public' | 'private' | 'friends';
  customSettings?: Record<string, any>;
}