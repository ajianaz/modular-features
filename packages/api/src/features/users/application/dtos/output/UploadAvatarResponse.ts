import { z } from 'zod';

export const UploadAvatarResponseSchema = z.object({
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
      avatar: z.string().optional(), // Avatar URL
      createdAt: z.date(),
      updatedAt: z.date()
    }),
    fileInfo: z.object({
      originalName: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
      url: z.string(),
      dimensions: z.object({
        width: z.number(),
        height: z.number()
      }).optional()
    })
  })
});

export interface UploadAvatarResponse {
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
      avatar?: string; // Avatar URL
      createdAt: Date;
      updatedAt: Date;
    };
    fileInfo: {
      originalName: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      url: string;
      dimensions?: {
        width: number;
        height: number;
      };
    };
  };
}