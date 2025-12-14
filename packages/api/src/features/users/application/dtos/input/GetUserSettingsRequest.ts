import { z } from 'zod';

export const GetUserSettingsRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export interface GetUserSettingsRequest {
  userId: string;
}