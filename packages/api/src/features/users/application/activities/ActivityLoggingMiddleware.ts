import { Context, Next } from 'hono';
import { UserActivity } from '../../domain/entities';
import { IUserActivityRepository } from '../../domain/interfaces';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';

/**
 * Activity logging middleware for tracking user actions
 */
export const logActivity = (
  activityType: string,
  action: string,
  description?: string,
  resource?: string,
  resourceId?: string
) => {
  return async (c: Context, next: Next) => {
    try {
      // Get user ID and session from context (set by auth middleware)
      const userId = c.get('userId');
      const sessionId = c.get('session')?.id;

      // Only log activity for authenticated users
      if (!userId) {
        await next();
        return;
      }

      // Get request information
      const method = c.req.method;
      const url = c.req.url;
      const userAgent = c.req.header('User-Agent');
      const ipAddress = c.req.header('X-Forwarded-For') ||
                     c.req.header('X-Real-IP') ||
                     c.req.header('X-Client-IP') ||
                     'unknown';

      // Create activity record
      const activity = UserActivity.create({
        userId,
        type: activityType,
        action,
        description: description || `${method} ${url}`,
        resource,
        resourceId: resourceId ? resourceId : undefined,
        metadata: {
          method,
          url,
          userAgent,
          query: c.req.query(),
          body: method !== 'GET' ? c.req.raw.body : undefined
        },
        ipAddress,
        userAgent,
        sessionId
      });

      // Save activity to repository
      const usersContainer = UsersContainer.getInstance();
      const activityRepository = usersContainer.getUserActivityRepository();
      await activityRepository.create(activity);

      // Store activity in context for potential use in controllers
      c.set('activity', activity);

      await next();
    } catch (error) {
      console.error('Activity logging middleware error:', error);

      // Don't block the request if activity logging fails
      await next();
    }
  };
};

/**
 * Middleware for logging profile-related activities
 */
export const logProfileActivity = (action: string, description?: string) => {
  return logActivity('profile', action, description, 'profile');
};

/**
 * Middleware for logging settings-related activities
 */
export const logSettingsActivity = (action: string, description?: string) => {
  return logActivity('settings', action, description, 'settings');
};

/**
 * Middleware for logging role-related activities
 */
export const logRoleActivity = (action: string, description?: string) => {
  return logActivity('role', action, description, 'role');
};

/**
 * Middleware for logging authentication-related activities
 */
export const logAuthActivity = (action: string, description?: string) => {
  return logActivity('auth', action, description, 'auth');
};

/**
 * Middleware for logging file-related activities
 */
export const logFileActivity = (action: string, description?: string) => {
  return logActivity('file', action, description, 'file');
};

/**
 * Middleware for conditional activity logging
 * Only logs activity if the condition is met
 */
export const logActivityIf = (
  condition: (c: Context) => boolean,
  activityType: string,
  action: string,
  description?: string,
  resource?: string,
  resourceId?: string
) => {
  return async (c: Context, next: Next) => {
    try {
      // Check if condition is met
      if (!condition(c)) {
        await next();
        return;
      }

      // If condition is met, log the activity
      const activityLogger = logActivity(activityType, action, description, resource, resourceId);
      await activityLogger(c, next);
    } catch (error) {
      console.error('Conditional activity logging middleware error:', error);
      await next();
    }
  };
};

/**
 * Helper function to create activity logger for specific endpoints
 */
export const createEndpointActivityLogger = (
  endpoint: string,
  method: string = 'GET'
) => {
  return logActivity(
    'api',
    `${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
    `Accessed ${method} ${endpoint}`
  );
};