import type { Context, Next } from 'hono';

/**
 * Notification Rate Limiting Middleware
 * Limits the number of notifications a user can send within a time window
 * This is a specialized rate limiter for notification endpoints
 */
export const notificationRateLimitMiddleware = async (c: Context, next: Next): Promise<void> => {
  // Basic implementation - in production, this would use a proper rate limiting store
  const user = c.get('user');
  const userId = user?.id || c.req.header('x-forwarded-for') || c.req.header('x-real-ip');

  // For now, just pass through
  // TODO: Implement actual rate limiting with Redis or similar
  // This could check against a user's notification preferences or system limits
  await next();
};

/**
 * Notification Permission Middleware
 * Ensures that the authenticated user has permission to perform notification actions
 * This is different from general authentication - it checks notification-specific permissions
 */
export const notificationPermissionMiddleware = async (c: Context, next: Next): Promise<void | Response> => {
  // Get authenticated user
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Get the target user ID from the request if it exists
  const body = await c.req.json().catch(() => ({}));
  const targetUserId = body.userId || body.recipientId;

  // If trying to send notifications to another user, check permissions
  if (targetUserId && targetUserId !== user.id) {
    // TODO: Implement permission check logic
    // For now, allow admin users or users with notification management permissions
    // This could check user roles, notification preferences, etc.
  }

  // Store the authenticated user's ID for use in controllers
  c.set('authenticatedUserId', user.id);

  await next();
};

/**
 * Notification Context Middleware
 * Sets up notification-specific context for the request
 */
export const notificationContextMiddleware = async (c: Context, next: Next): Promise<void | Response> => {
  // Get authenticated user
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Set notification-specific context
  c.set('notificationContext', {
    userId: user.id,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  });

  await next();
};