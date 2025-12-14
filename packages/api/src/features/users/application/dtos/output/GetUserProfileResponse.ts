import { z } from 'zod';

export const GetUserProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    profile: z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      displayName: z.string().optional(),
      bio: z.string().optional(),
      website: z.string().optional(),
      location: z.string().optional(),
      timezone: z.string(),
      language: z.string(),
      gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
      dateOfBirth: z.date().optional(),
      phoneNumber: z.string().optional(),
      isPhoneVerified: z.boolean(),
      socialLinks: z.record(z.string(), z.string()).optional(),
      preferences: z.record(z.string(), z.any()).optional(),
      createdAt: z.date(),
      updatedAt: z.date()
    }),
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
    }).optional(),
    roles: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      displayName: z.string(),
      description: z.string().optional(),
      level: z.number(),
      isSystem: z.boolean(),
      permissions: z.array(z.string()),
      isActive: z.boolean(),
      assignedAt: z.date(),
      expiresAt: z.date().optional()
    })).optional(),
    activity: z.array(z.object({
      id: z.string().uuid(),
      type: z.string(),
      action: z.string(),
      description: z.string().optional(),
      resource: z.string().optional(),
      resourceId: z.string().uuid().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      sessionId: z.string().uuid().optional(),
      createdAt: z.date()
    })).optional()
  })
});

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: string;
      userId: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
      bio?: string;
      website?: string;
      location?: string;
      timezone: string;
      language: string;
      gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
      dateOfBirth?: Date;
      phoneNumber?: string;
      isPhoneVerified: boolean;
      socialLinks?: Record<string, string>;
      preferences?: Record<string, any>;
      createdAt: Date;
      updatedAt: Date;
    };
    settings?: {
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
    roles?: Array<{
      id: string;
      name: string;
      displayName: string;
      description?: string;
      level: number;
      isSystem: boolean;
      permissions: string[];
      isActive: boolean;
      assignedAt: Date;
      expiresAt?: Date;
    }>;
    activity?: Array<{
      id: string;
      type: string;
      action: string;
      description?: string;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      createdAt: Date;
    }>;
  };
}