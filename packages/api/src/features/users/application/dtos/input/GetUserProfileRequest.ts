import { z } from 'zod';

export const GetUserProfileRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  includeSettings: z.boolean().optional().default(false),
  includeRoles: z.boolean().optional().default(false),
  includeActivity: z.boolean().optional().default(false),
  activityLimit: z.number().min(1).max(100).optional().default(10)
});

export interface GetUserProfileRequest {
  userId: string;
  includeSettings?: boolean;
  includeRoles?: boolean;
  includeActivity?: boolean;
  activityLimit?: number;
}