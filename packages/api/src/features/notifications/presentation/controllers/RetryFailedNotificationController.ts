import { Context } from 'hono';
import { RetryFailedNotificationUseCase } from '../../application/usecases/RetryFailedNotificationUseCase';
import { RetryFailedNotificationResponse } from '../../application/dtos/output/RetryFailedNotificationResponse';
import { RetryFailedNotificationRequest } from '../../application/dtos/input/RetryFailedNotificationRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  InvalidNotificationDataError,
  NotificationSendError,
  NotificationDeliveryError,
  ProviderNotAvailableError
} from '../../domain/errors';

/**
 * Controller for retrying failed notifications
 */
export class RetryFailedNotificationController {
  private retryFailedNotificationUseCase: RetryFailedNotificationUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.retryFailedNotificationUseCase = notificationsContainer.getRetryFailedNotificationUseCase();
  }

  /**
   * Retry a failed notification
   */
  async retry(c: Context): Promise<Response> {
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

      const request: RetryFailedNotificationRequest = {
        notificationId,
        recipientId: userId,
        ...body
      };

      const result = await this.retryFailedNotificationUseCase.execute(request);

      return c.json(result);
    } catch (error) {
      console.error('RetryFailedNotificationController.retry error:', error);

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

      if (error instanceof NotificationDeliveryError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'NOTIFICATION_DELIVERY_ERROR'
        }, 503);
      }

      if (error instanceof ProviderNotAvailableError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'PROVIDER_NOT_AVAILABLE'
        }, 503);
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