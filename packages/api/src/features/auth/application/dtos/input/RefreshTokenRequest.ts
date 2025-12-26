import { z } from 'zod';

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
});

export interface RefreshTokenRequest {
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}