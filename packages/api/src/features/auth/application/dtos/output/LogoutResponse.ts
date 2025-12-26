import { z } from 'zod';

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1)
});

export interface LogoutResponse {
  success: boolean;
  message: string;
}