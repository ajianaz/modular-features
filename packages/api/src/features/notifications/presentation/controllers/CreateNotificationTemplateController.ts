import { Context } from 'hono';
import { CreateNotificationTemplateUseCase } from '../../application/usecases/CreateNotificationTemplateUseCase';
import { CreateNotificationTemplateResponse } from '../../application/dtos/output/CreateNotificationTemplateResponse';
import { CreateNotificationTemplateRequest } from '../../application/dtos/input/CreateNotificationTemplateRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  TemplateNotFoundError,
  TemplateValidationError
} from '../../domain/errors';

/**
 * Controller for creating notification templates
 */
export class CreateNotificationTemplateController {
  private createNotificationTemplateUseCase: CreateNotificationTemplateUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.createNotificationTemplateUseCase = notificationsContainer.getCreateNotificationTemplateUseCase();
  }

  /**
   * Create a notification template
   */
  async create(c: Context): Promise<Response> {
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

      const body = await c.req.json() as CreateNotificationTemplateRequest;

      const result = await this.createNotificationTemplateUseCase.execute(body);

      return c.json(result);
    } catch (error) {
      console.error('CreateNotificationTemplateController.create error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code || 'VALIDATION_ERROR'
        }, (error.statusCode || 400) as any);
      }

      if (error instanceof TemplateValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'TEMPLATE_VALIDATION_ERROR'
        }, 400);
      }

      if (error instanceof TemplateNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'TEMPLATE_NOT_FOUND'
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