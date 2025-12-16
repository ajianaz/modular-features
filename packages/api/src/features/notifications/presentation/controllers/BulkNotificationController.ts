import { Context } from 'hono';
import { BulkNotificationUseCase } from '../../application/usecases/BulkNotificationUseCase';
import { BulkNotificationResponse } from '../../application/dtos/output/BulkNotificationResponse';
import { BulkNotificationRequest } from '../../application/dtos/input/BulkNotificationRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  InvalidNotificationDataError,
  NotificationSendError,
  NotificationDeliveryError,
  ProviderNotAvailableError
} from '../../domain/errors';

/**
 * Controller for sending bulk notifications
 */
export class BulkNotificationController {
  private bulkNotificationUseCase: BulkNotificationUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.bulkNotificationUseCase = notificationsContainer.getBulkNotificationUseCase();
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(c: Context): Promise<Response> {
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

      const body = await c.req.json() as BulkNotificationRequest;

      // Add context metadata to the bulk request
      body.metadata = {
        ...body.metadata,
        requestId: notificationContext?.requestId,
        timestamp: notificationContext?.timestamp,
        initiatedBy: userId
      };

      const result = await this.bulkNotificationUseCase.execute(body);

      return c.json(result);
    } catch (error) {
      console.error('BulkNotificationController.sendBulk error:', error);

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