import { z } from 'zod';

export const RegisterResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    emailVerified: z.boolean(),
    username: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(['user', 'admin', 'super_admin']),
    status: z.enum(['active', 'inactive', 'suspended']),
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  message: z.string(),
  requiresEmailVerification: z.boolean()
});

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    username?: string;
    avatar?: string;
    role: 'user' | 'admin' | 'super_admin';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
  };
  message: string;
  requiresEmailVerification: boolean;
}