import { z } from 'zod';

export const UpdateUserProfileRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(255).optional(),
  bio: z.string().max(1000).optional(),
  website: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  dateOfBirth: z.coerce.date().optional(),
  phoneNumber: z.string().max(20).optional(),
  socialLinks: z.record(z.string(), z.string().max(500)).optional(),
  preferences: z.record(z.string(), z.any()).optional()
});

export interface UpdateUserProfileRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: Date;
  phoneNumber?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}