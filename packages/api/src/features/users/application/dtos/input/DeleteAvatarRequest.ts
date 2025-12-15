import { z } from 'zod';

export const DeleteAvatarRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export interface DeleteAvatarRequest {
  userId: string;
}