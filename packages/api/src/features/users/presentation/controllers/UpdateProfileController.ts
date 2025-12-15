import { Context } from 'hono';
import { UpdateUserProfileUseCase } from '../../application/usecases/UpdateUserProfileUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { UpdateUserProfileResponse, UpdateUserProfileResponseSchema } from '../../application/dtos/output/UpdateUserProfileResponse';
import { UpdateUserProfileRequest } from '../../application/dtos/input/UpdateUserProfileRequest';
import {
  UserProfileNotFoundError,
  InvalidUserProfileError,
  DuplicateProfileError,
  PermissionDeniedError
} from '../../domain/errors/UserManagementError';

/**
 * Controller for updating user profile
 */
export class UpdateProfileController {
  private updateUserProfileUseCase: UpdateUserProfileUseCase;

  constructor(updateUserProfileUseCase?: UpdateUserProfileUseCase) {
    if (updateUserProfileUseCase) {
      this.updateUserProfileUseCase = updateUserProfileUseCase;
    } else {
      const usersContainer = UsersContainer.getInstance();
      this.updateUserProfileUseCase = usersContainer.getUpdateUserProfileUseCase();
    }
  }

  /**
   * Update user profile by ID
   */
  async updateProfile(c: Context): Promise<Response> {
    // Declare variables outside try block to make them accessible in catch block
    let userId: string | undefined;

    try {
      userId = c.req.param().userId;

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      const requestBody = await c.req.json();
      const { userId: bodyUserId, ...profileData } = requestBody;

      const request: UpdateUserProfileRequest = {
        userId,
        ...profileData
      };

      const result = await this.updateUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserProfileResponseSchema.safeParse(result);
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
      console.error('UpdateProfileController.updateProfile error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserProfileNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof InvalidUserProfileError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Invalid profile data provided' }
        }, 400);
      }

      if (error instanceof DuplicateProfileError) {
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
        message: 'Failed to update user profile',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Update current user's profile (from authenticated user)
   */
  async updateCurrentUserProfile(c: Context): Promise<Response> {
    // Declare variables outside try block to make them accessible in catch block
    let userId: string | undefined;

    try {
      // Get user ID from authenticated request (assuming it's attached by auth middleware)
      userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const requestBody = await c.req.json();
      const { userId: bodyUserId, ...profileData } = requestBody;

      const request: UpdateUserProfileRequest = {
        userId,
        ...profileData
      };

      const result = await this.updateUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserProfileResponseSchema.safeParse(result);
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
      console.error('UpdateProfileController.updateCurrentUserProfile error:', error);

      if (error instanceof ValidationError) {
        return c.json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR',
          details: error.details
        }, 400);
      }

      if (error instanceof UserProfileNotFoundError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId }
        }, 404);
      }

      if (error instanceof InvalidUserProfileError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Invalid profile data provided' }
        }, 400);
      }

      if (error instanceof DuplicateProfileError) {
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
        message: 'Failed to update current user profile',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }
}