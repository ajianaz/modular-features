import { Context } from 'hono';
import { UpdateNotificationPreferenceUseCase } from '../../application/usecases/UpdateNotificationPreferenceUseCase';
import { UpdateNotificationPreferenceResponse } from '../../application/dtos/output/UpdateNotificationPreferenceResponse';
import { UpdateNotificationPreferenceRequest } from '../../application/dtos/input/UpdateNotificationPreferenceRequest';
import { NotificationsContainer } from '../../infrastructure/container/NotificationsContainer';
import { ValidationError } from '@modular-monolith/shared';
import {
  NotificationError,
  NotificationPreferencesError
} from '../../domain/errors';

/**
 * Controller for updating notification preferences
 */
export class UpdateNotificationPreferenceController {
  private updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase;

  constructor() {
    const notificationsContainer = NotificationsContainer.getInstance();
    this.updateNotificationPreferenceUseCase = notificationsContainer.getUpdateNotificationPreferenceUseCase();
  }

  /**
   * Update notification preferences
   */
  async update(c: Context): Promise<Response> {
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

      const body = await c.req.json() as UpdateNotificationPreferenceRequest;

      // Set the userId from the authenticated user
      body.userId = userId;

      const result = await this.updateNotificationPreferenceUseCase.execute(body);

      return c.json(result);
    } catch (error) {
      console.error('UpdateNotificationPreferenceController.update error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code || 'VALIDATION_ERROR'
        }, (error.statusCode || 400) as any);
      }

      if (error instanceof NotificationPreferencesError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'NOTIFICATION_PREFERENCES_ERROR'
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