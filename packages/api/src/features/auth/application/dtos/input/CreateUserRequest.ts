import { z } from 'zod';

export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}