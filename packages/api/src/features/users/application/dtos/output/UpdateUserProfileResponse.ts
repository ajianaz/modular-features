import { z } from 'zod';

export const UpdateUserProfileResponseSchema = z.object({
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
    })
  })
});

export interface UpdateUserProfileResponse {
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
  };
}