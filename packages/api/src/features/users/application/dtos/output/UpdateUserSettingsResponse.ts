import { z } from 'zod';

export const UpdateUserSettingsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    settings: z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      theme: z.enum(['light', 'dark', 'auto']),
      language: z.string(),
      timezone: z.string(),
      emailNotifications: z.boolean(),
      pushNotifications: z.boolean(),
      smsNotifications: z.boolean(),
      marketingEmails: z.boolean(),
      twoFactorEnabled: z.boolean(),
      sessionTimeout: z.number(),
      autoSaveDrafts: z.boolean(),
      showOnlineStatus: z.boolean(),
      profileVisibility: z.enum(['public', 'private', 'friends']),
      customSettings: z.record(z.string(), z.any()).optional(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  })
});

export interface UpdateUserSettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: {
      id: string;
      userId: string;
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
      twoFactorEnabled: boolean;
      sessionTimeout: number;
      autoSaveDrafts: boolean;
      showOnlineStatus: boolean;
      profileVisibility: 'public' | 'private' | 'friends';
      customSettings?: Record<string, any>;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}