import { Context } from 'hono';
import { SendNotificationUseCase } from '../../application/usecases/SendNotificationUseCase';
import { SendNotificationResponse, SendNotificationResponseSchema } from '../../application/dtos/output/SendNotificationResponse';
import { SendNotificationRequest } from '../../application/dtos/input/SendNotificationRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationNotFoundError,
  NotificationSendError,
  NotificationDeliveryError,
  ProviderNotAvailableError,
  InvalidNotificationDataError
} from '../../domain/errors';

/**
 * Controller for sending notifications
 */
export class SendNotificationController {
  private sendNotificationUseCase: SendNotificationUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.sendNotificationUseCase = notificationsContainer.getSendNotificationUseCase();
  }

  /**
   * Send a notification
   */
  async send(c: Context): Promise<Response> {
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

      const body = await c.req.json() as SendNotificationRequest;

      // Add context metadata to the request
      body.metadata = {
        ...body.metadata,
        requestId: notificationContext?.requestId,
        timestamp: notificationContext?.timestamp
      };

      const result = await this.sendNotificationUseCase.execute(body);

      // Validate response against schema
      const validationResult = SendNotificationResponseSchema.safeParse(result);
      if (!validationResult.success) {
        console.error('Response validation failed:', validationResult.error);
        return c.json({
          success: false,
          message: 'Internal server error - response validation failed',
          error: 'RESPONSE_VALIDATION_ERROR'
        }, 500);
      }

      return c.json(validationResult.data);
    } catch (error) {
      console.error('SendNotificationController.send error:', error);

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