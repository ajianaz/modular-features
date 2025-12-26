import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
});

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
}