import { Context } from 'hono';
import { GetUserProfileUseCase } from '../../application/usecases/GetUserProfileUseCase';
import { GetUserSettingsUseCase } from '../../application/usecases/GetUserSettingsUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { GetUserProfileResponse, GetUserProfileResponseSchema } from '../../application/dtos/output/GetUserProfileResponse';
import { GetUserSettingsResponse, GetUserSettingsResponseSchema } from '../../application/dtos/output/GetUserSettingsResponse';
import { GetUserProfileRequest } from '../../application/dtos/input/GetUserProfileRequest';
import { GetUserSettingsRequest } from '../../application/dtos/input/GetUserSettingsRequest';

/**
 * Controller for getting user profile and settings
 */
export class GetUserController {
  private getUserProfileUseCase: GetUserProfileUseCase;
  private getUserSettingsUseCase: GetUserSettingsUseCase;

  constructor() {
    const usersContainer = UsersContainer.getInstance();
    this.getUserProfileUseCase = usersContainer.getGetUserProfileUseCase();
    this.getUserSettingsUseCase = usersContainer.getGetUserSettingsUseCase();
  }

  /**
   * Get user profile by ID
   */
  async getProfile(c: Context): Promise<Response> {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      const includeSettings = c.req.query('includeSettings') === 'true';
      const includeRoles = c.req.query('includeRoles') === 'true';
      const includeActivity = c.req.query('includeActivity') === 'true';
      const activityLimit = c.req.query('activityLimit') ? parseInt(c.req.query('activityLimit') as string) : undefined;

      const request: GetUserProfileRequest = {
        userId,
        includeSettings,
        includeRoles,
        includeActivity,
        activityLimit
      };

      const result = await this.getUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserProfileResponseSchema.safeParse(result);
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
      console.error('GetUserController.getProfile error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        }, 400);
      }

      return c.json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
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
      console.error('GetUserController.getSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        }, 400);
      }

      return c.json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
    }
  }

  /**
   * Get current user's profile (from authenticated user)
   */
  async getCurrentUserProfile(c: Context): Promise<Response> {
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

      const includeSettings = c.req.query('includeSettings') === 'true';
      const includeRoles = c.req.query('includeRoles') === 'true';
      const includeActivity = c.req.query('includeActivity') === 'true';
      const activityLimit = c.req.query('activityLimit') ? parseInt(c.req.query('activityLimit') as string) : undefined;

      const request: GetUserProfileRequest = {
        userId,
        includeSettings,
        includeRoles,
        includeActivity,
        activityLimit
      };

      const result = await this.getUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserProfileResponseSchema.safeParse(result);
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
      console.error('GetUserController.getCurrentUserProfile error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        }, 400);
      }

      return c.json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
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
      console.error('GetUserController.getCurrentUserSettings error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
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