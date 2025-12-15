import { Context } from 'hono';
import { MarkNotificationReadUseCase } from '../../application/usecases/MarkNotificationReadUseCase';
import { MarkNotificationReadResponse } from '../../application/dtos/output/MarkNotificationReadResponse';
import { MarkNotificationReadRequest } from '../../application/dtos/input/MarkNotificationReadRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  InvalidNotificationDataError
} from '../../domain/errors';

/**
 * Controller for marking notifications as read
 */
export class MarkNotificationReadController {
  private markNotificationReadUseCase: MarkNotificationReadUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.markNotificationReadUseCase = notificationsContainer.getMarkNotificationReadUseCase();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(c: Context): Promise<Response> {
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

      // Get notification ID from route parameters
      const notificationId = c.req.param('notificationId');

      if (!notificationId) {
        return c.json({
          success: false,
          message: 'Notification ID is required',
          error: 'MISSING_NOTIFICATION_ID'
        }, 400);
      }

      const body = await c.req.json().catch(() => ({})) || {};

      const request: MarkNotificationReadRequest = {
        notificationId,
        recipientId: userId,
        ...body
      };

      const result = await this.markNotificationReadUseCase.execute(request);

      return c.json(result);
    } catch (error) {
      console.error('MarkNotificationReadController.markAsRead error:', error);

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