import { Context } from 'hono';
import { GetNotificationAnalyticsUseCase } from '../../application/usecases/GetNotificationAnalyticsUseCase';
import { GetNotificationAnalyticsResponse } from '../../application/dtos/output/GetNotificationAnalyticsResponse';
import { GetNotificationAnalyticsRequest } from '../../application/dtos/input/GetNotificationAnalyticsRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  InvalidNotificationDataError
} from '../../domain/errors';

/**
 * Controller for getting notification analytics
 */
export class GetNotificationAnalyticsController {
  private getNotificationAnalyticsUseCase: GetNotificationAnalyticsUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.getNotificationAnalyticsUseCase = notificationsContainer.getGetNotificationAnalyticsUseCase();
  }

  /**
   * Get notification analytics
   */
  async getAnalytics(c: Context): Promise<Response> {
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

      const query = c.req.query();

      const request: GetNotificationAnalyticsRequest = {
        startDate: new Date(query.startDate || ''),
        endDate: new Date(query.endDate || ''),
        type: query.type as any,
        channel: query.channel as any,
        status: query.status as any,
        recipientId: query.recipientId || userId,
        groupId: query.groupId,
        groupBy: query.groupBy as any
      };

      const result = await this.getNotificationAnalyticsUseCase.execute(request);

      return c.json(result);
    } catch (error) {
      console.error('GetNotificationAnalyticsController.getAnalytics error:', error);

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