import { z } from 'zod';

export const DeleteAvatarResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().uuid()
});

export interface DeleteAvatarResponse {
  success: boolean;
  message: string;
  userId: string;
}