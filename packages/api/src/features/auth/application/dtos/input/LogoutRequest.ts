import { z } from 'zod';

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export interface LogoutRequest {
  refreshToken: string;
}