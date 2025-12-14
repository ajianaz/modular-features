import { Hono, Context } from 'hono';
import { CreateUserController } from './controllers/CreateUserController';

// Auth routes
export const authRoutes = new Hono();

// Create user route
authRoutes.post(
  '/users',
  async (c: Context) => {
    const controller = new CreateUserController(c);
    return await controller.handle(c);
  }
);

export default authRoutes;