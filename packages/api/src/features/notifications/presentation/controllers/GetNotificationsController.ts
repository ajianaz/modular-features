import { Context } from 'hono';
import { GetNotificationsUseCase } from '../../application/usecases/GetNotificationsUseCase';
import { GetNotificationsResponse } from '../../application/dtos/output/GetNotificationsResponse';
import { GetNotificationsRequest } from '../../application/dtos/input/GetNotificationsRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  InvalidNotificationDataError
} from '../../domain/errors';

/**
 * Controller for getting notifications
 */
export class GetNotificationsController {
  private getNotificationsUseCase: GetNotificationsUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.getNotificationsUseCase = notificationsContainer.getGetNotificationsUseCase();
  }

  /**
   * Get user notifications
   */
  async getNotifications(c: Context): Promise<Response> {
    try {
      // Get user ID from authenticated request (set by notification middleware)
      const userId = c.get('authenticatedUserId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const limit = c.req.query('limit') ? parseInt(c.req.query('limit') as string) : 20;
      const offset = c.req.query('offset') ? parseInt(c.req.query('offset') as string) : 0;
      const status = c.req.query('status') as any;
      const type = c.req.query('type') as any;
      const unreadOnly = c.req.query('unreadOnly') === 'true';

      const request: GetNotificationsRequest = {
        recipientId: userId,
        limit,
        offset,
        status,
        type,
        read: !unreadOnly
      };

      const result = await this.getNotificationsUseCase.execute(request);

      return c.json(result);
    } catch (error) {
      console.error('GetNotificationsController.getNotifications error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code || 'VALIDATION_ERROR'
        }, (error.statusCode || 400) as any);
      }

      if (error instanceof InvalidNotificationDataError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'INVALID_NOTIFICATION_DATA'
        }, 400);
      }

      if (error instanceof NotificationNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'NOTIFICATION_NOT_FOUND'
        }, 404);
      }

      if (error instanceof NotificationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'NOTIFICATION_ERROR'
        }, 400);
      }

      return c.json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
    }
  }
}