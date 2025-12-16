import { Context } from 'hono';
import { CreateNotificationUseCase } from '../../application/usecases/CreateNotificationUseCase';
import { CreateNotificationResponse } from '../../application/dtos/output/CreateNotificationResponse';
import { CreateNotificationRequest } from '../../application/dtos/input/CreateNotificationRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  InvalidNotificationDataError,
  NotificationSendError
} from '../../domain/errors';

/**
 * Controller for creating notifications
 */
export class CreateNotificationController {
  private createNotificationUseCase: CreateNotificationUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.createNotificationUseCase = notificationsContainer.getCreateNotificationUseCase();
  }

  /**
   * Create a notification
   */
  async create(c: Context): Promise<Response> {
    try {
      // Get user ID from authenticated request (set by notification middleware)
      const userId = c.get('authenticatedUserId');
      const notificationContext = c.get('notificationContext');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const body = await c.req.json() as CreateNotificationRequest;

      // Set the recipientId from the authenticated user
      body.recipientId = userId;

      // Add context metadata
      body.metadata = {
        ...body.metadata,
        requestId: notificationContext?.requestId,
        timestamp: notificationContext?.timestamp
      };

      const result = await this.createNotificationUseCase.execute(body);

      return c.json(result);
    } catch (error) {
      console.error('CreateNotificationController.create error:', error);

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

      if (error instanceof NotificationSendError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'NOTIFICATION_SEND_ERROR'
        }, 400);
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