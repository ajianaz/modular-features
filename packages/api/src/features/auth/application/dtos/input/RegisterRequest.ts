import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  username?: string;
  userAgent?: string;
  ipAddress?: string;
}