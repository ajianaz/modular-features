import { z } from 'zod';

export const LoginResponseSchema = z.object({
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
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    tokenType: z.string()
  }),
  session: z.object({
    id: z.string().uuid(),
    expiresAt: z.date(),
    lastAccessedAt: z.date()
  }).optional()
});

export interface LoginResponse {
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
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  session?: {
    id: string;
    expiresAt: Date;
    lastAccessedAt: Date;
  };
}