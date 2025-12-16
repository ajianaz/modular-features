import { Context } from 'hono';
import { ScheduleNotificationUseCase } from '../../application/usecases/ScheduleNotificationUseCase';
import { ScheduleNotificationResponse } from '../../application/dtos/output/ScheduleNotificationResponse';
import { ScheduleNotificationRequest } from '../../application/dtos/input/ScheduleNotificationRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  InvalidNotificationDataError,
  NotificationSendError
} from '../../domain/errors';

/**
 * Controller for scheduling notifications
 */
export class ScheduleNotificationController {
  private scheduleNotificationUseCase: ScheduleNotificationUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.scheduleNotificationUseCase = notificationsContainer.getScheduleNotificationUseCase();
  }

  /**
   * Schedule a notification
   */
  async schedule(c: Context): Promise<Response> {
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

      const body = await c.req.json() as ScheduleNotificationRequest;

      // Set the recipientId from the authenticated user if not provided
      if (!body.recipientId) {
        body.recipientId = userId;
      }

      // Add context metadata
      body.metadata = {
        ...body.metadata,
        requestId: notificationContext?.requestId,
        timestamp: notificationContext?.timestamp,
        scheduledBy: userId
      };

      const result = await this.scheduleNotificationUseCase.execute(body);

      return c.json(result);
    } catch (error) {
      console.error('ScheduleNotificationController.schedule error:', error);

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