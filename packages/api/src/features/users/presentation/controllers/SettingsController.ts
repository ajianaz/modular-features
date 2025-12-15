import { Context } from 'hono';
import { GetUserSettingsUseCase } from '../../application/usecases/GetUserSettingsUseCase';
import { UpdateUserSettingsUseCase } from '../../application/usecases/UpdateUserSettingsUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { GetUserSettingsResponse, GetUserSettingsResponseSchema } from '../../application/dtos/output/GetUserSettingsResponse';
import { UpdateUserSettingsResponse, UpdateUserSettingsResponseSchema } from '../../application/dtos/output/UpdateUserSettingsResponse';
import { GetUserSettingsRequest } from '../../application/dtos/input/GetUserSettingsRequest';
import { UpdateUserSettingsRequest } from '../../application/dtos/input/UpdateUserSettingsRequest';
import {
  UserSettingsNotFoundError,
  InvalidUserSettingsError,
  DuplicateSettingsError,
  PermissionDeniedError
} from '../../domain/errors/UserManagementError';

/**
 * Controller for user settings CRUD operations
 */
export class SettingsController {
  private getUserSettingsUseCase: GetUserSettingsUseCase;
  private updateUserSettingsUseCase: UpdateUserSettingsUseCase;

  constructor(getUserSettingsUseCase?: GetUserSettingsUseCase, updateUserSettingsUseCase?: UpdateUserSettingsUseCase) {
    if (getUserSettingsUseCase && updateUserSettingsUseCase) {
      this.getUserSettingsUseCase = getUserSettingsUseCase;
      this.updateUserSettingsUseCase = updateUserSettingsUseCase;
    } else {
      const usersContainer = UsersContainer.getInstance();
      this.getUserSettingsUseCase = usersContainer.getGetUserSettingsUseCase();
      this.updateUserSettingsUseCase = usersContainer.getUpdateUserSettingsUseCase();
    }
  }

  /**
   * Get user settings by user ID
   */
  async getSettings(c: Context): Promise<Response> {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      const request: GetUserSettingsRequest = { userId };
      const result = await this.getUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.getSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserSettingsNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof PermissionDeniedError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, permission: error.message }
        }, 403);
      }

      return c.json({
        success: false,
        message: 'Failed to retrieve user settings',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Update user settings by user ID
   */
  async updateSettings(c: Context): Promise<Response> {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      const request: UpdateUserSettingsRequest = {
        userId,
        ...await c.req.json()
      };

      const result = await this.updateUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.updateSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserSettingsNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof InvalidUserSettingsError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Invalid settings data provided' }
        }, 400);
      }

      if (error instanceof DuplicateSettingsError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 409);
      }

      if (error instanceof PermissionDeniedError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, permission: error.message }
        }, 403);
      }

      return c.json({
        success: false,
        message: 'Failed to update user settings',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Get current user's settings (from authenticated user)
   */
  async getCurrentUserSettings(c: Context): Promise<Response> {
    try {
      // Get user ID from authenticated request (assuming it's attached by auth middleware)
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const request: GetUserSettingsRequest = { userId };
      const result = await this.getUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.getCurrentUserSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserSettingsNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof PermissionDeniedError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, permission: error.message }
        }, 403);
      }

      return c.json({
        success: false,
        message: 'Failed to retrieve current user settings',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Update current user's settings (from authenticated user)
   */
  async updateCurrentUserSettings(c: Context): Promise<Response> {
    try {
      // Get user ID from authenticated request (assuming it's attached by auth middleware)
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const request: UpdateUserSettingsRequest = {
        userId,
        ...await c.req.json()
      };

      const result = await this.updateUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.updateCurrentUserSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserSettingsNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof InvalidUserSettingsError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Invalid settings data provided' }
        }, 400);
      }

      if (error instanceof DuplicateSettingsError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 409);
      }

      if (error instanceof PermissionDeniedError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, permission: error.message }
        }, 403);
      }

      return c.json({
        success: false,
        message: 'Failed to update current user settings',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }
}