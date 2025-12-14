import { Context, Next } from 'hono';
// import { auth } from '../features/auth';

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  // TODO: Implement proper authentication when auth module is ready
  // Check if user is authenticated
  // const session = await auth.api.getSession({
  //   headers: c.req.header()
  // });

  // if (!session) {
  //   return c.json({ error: 'Unauthorized' }, 401);
  // }

  // Set user context
  // c.set('user', session.user);
  // c.set('session', session.session);

  await next();
};

// Optional authentication (doesn't fail if not authenticated)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    // TODO: Implement proper authentication when auth module is ready
    // const session = await auth.api.getSession({
    //   headers: c.req.header()
    // });

    // if (session) {
    //   c.set('user', session.user);
    //   c.set('session', session.session);
    // }
  } catch (error) {
    // Ignore errors for optional auth
  }

  await next();
};