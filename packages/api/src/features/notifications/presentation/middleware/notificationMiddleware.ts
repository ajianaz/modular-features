import { Context, Next } from 'hono';
import { randomUUID } from 'crypto';

/**
 * Middleware to check if user is authenticated for notifications
 */
export async function notificationPermissionMiddleware(c: Context, next: Next): Promise<Response | void> {
  try {
    // Get user from context (set by auth middleware)
    const user = c.get('user');

    if (!user || !user.id) {
      return c.json({
        error: 'Authentication required'
      }, 401);
    }

    // Set authenticated user ID for use in controllers
    c.set('authenticatedUserId', user.id);

    await next();
    return;
  } catch (error) {
    console.error('Notification permission middleware error:', error);
    return c.json({
      error: 'Authentication error'
    }, 500);
  }
}

/**
 * Middleware to set notification context (request ID, timestamp, etc.)
 */
export async function notificationContextMiddleware(c: Context, next: Next): Promise<Response | void> {
  try {
    // Get user from context (set by auth middleware)
    const user = c.get('user');

    if (!user || !user.id) {
      return c.json({
        error: 'Authentication required'
      }, 401);
    }

    // Set notification context
    c.set('notificationContext', {
      userId: user.id,
      timestamp: new Date().toISOString(),
      requestId: randomUUID()
    });

    await next();
    return;
  } catch (error) {
    console.error('Notification context middleware error:', error);
    return c.json({
      error: 'Context setup error'
    }, 500);
  }
}

/**
 * Middleware to validate notification permissions for specific operations
 */
export async function notificationAccessMiddleware(c: Context, next: Next): Promise<Response | void> {
  try {
    // Get authenticated user ID
    const authenticatedUserId = c.get('authenticatedUserId');

    if (!authenticatedUserId) {
      return c.json({
        error: 'Authentication required'
      }, 401);
    }

    // Get target user ID from request if it exists
    const body = await c.req.json().catch(() => ({}));
    const targetUserId = body.userId || body.recipientId;

    // If target user is specified, check if authenticated user can access it
    if (targetUserId && targetUserId !== authenticatedUserId) {
      // For now, only allow users to access their own notifications
      // In the future, you might add admin/role checks here
      return c.json({
        error: 'Access denied'
      }, 403);
    }

    await next();
    return;
  } catch (error) {
    console.error('Notification access middleware error:', error);
    return c.json({
      error: 'Access validation error'
    }, 500);
  }
}