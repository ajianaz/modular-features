import { Context } from 'hono';
import { UploadAvatarUseCase } from '../../application/usecases/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/usecases/DeleteAvatarUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { UploadAvatarResponse, UploadAvatarResponseSchema } from '../../application/dtos/output/UploadAvatarResponse';
import { DeleteAvatarResponse, DeleteAvatarResponseSchema } from '../../application/dtos/output/DeleteAvatarResponse';
import { UploadAvatarRequest, UploadAvatarRequestSchema } from '../../application/dtos/input/UploadAvatarRequest';
import { DeleteAvatarRequest, DeleteAvatarRequestSchema } from '../../application/dtos/input/DeleteAvatarRequest';
import {
  UserProfileNotFoundError,
  AvatarUploadError,
  InvalidAvatarFormatError,
  AvatarTooLargeError,
  PermissionDeniedError
} from '../../domain/errors/UserManagementError';

/**
 * Controller for avatar upload with file handling
 */
export class AvatarUploadController {
  private uploadAvatarUseCase: UploadAvatarUseCase;
  private deleteAvatarUseCase: DeleteAvatarUseCase;

  constructor(uploadAvatarUseCase?: UploadAvatarUseCase, deleteAvatarUseCase?: DeleteAvatarUseCase) {
    const usersContainer = UsersContainer.getInstance();

    if (uploadAvatarUseCase) {
      this.uploadAvatarUseCase = uploadAvatarUseCase;
    } else {
      this.uploadAvatarUseCase = usersContainer.getUploadAvatarUseCase();
    }

    if (deleteAvatarUseCase) {
      this.deleteAvatarUseCase = deleteAvatarUseCase;
    } else {
      this.deleteAvatarUseCase = usersContainer.getDeleteAvatarUseCase();
    }
  }

  /**
   * Upload avatar for user by ID
   */
  async uploadAvatar(c: Context): Promise<Response> {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      // Check if file is uploaded
      const file = (c.req as any).file;
      if (!file) {
        return c.json({
          success: false,
          message: 'Avatar file is required',
          error: 'MISSING_AVATAR_FILE'
        }, 400);
      }

      // Get form data for optional parameters
      const body = await c.req.parseBody({ all: true });

      // Create request object with proper type conversion
      const requestRaw: UploadAvatarRequest = {
        userId,
        file,
        maxWidth: body.maxWidth ? (() => {
          const parsed = parseInt(body.maxWidth);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined,
        maxHeight: body.maxHeight ? (() => {
          const parsed = parseInt(body.maxHeight);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined,
        quality: body.quality ? (() => {
          const parsed = parseFloat(body.quality);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined
      };

      // Validate request against schema
      const validationResult = UploadAvatarRequestSchema.safeParse(requestRaw);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return c.json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          error: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }, 400);
      }

      const request: UploadAvatarRequest = validationResult.data;

      const result = await this.uploadAvatarUseCase.execute(request);

      // Validate response against schema
      const validationResult = UploadAvatarResponseSchema.safeParse(result);
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
      console.error('AvatarUploadController.uploadAvatar error:', error);

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

      if (error instanceof AvatarUploadError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Upload processing failed' }
        }, 400);
      }

      if (error instanceof InvalidAvatarFormatError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, supportedFormats: ['jpg', 'jpeg', 'png', 'webp'] }
        }, 400);
      }

      if (error instanceof AvatarTooLargeError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, maxSize: '5MB' }
        }, 400);
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
        message: 'Failed to upload avatar',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Upload avatar for current user (from authenticated user)
   */
  async uploadCurrentUserAvatar(c: Context): Promise<Response> {
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

      // Check if file is uploaded
      const file = (c.req as any).file;
      if (!file) {
        return c.json({
          success: false,
          message: 'Avatar file is required',
          error: 'MISSING_AVATAR_FILE'
        }, 400);
      }

      // Get form data for optional parameters
      const body = await c.req.parseBody({ all: true });

      // Create request object with proper type conversion
      const requestRaw: UploadAvatarRequest = {
        userId,
        file,
        maxWidth: body.maxWidth ? (() => {
          const parsed = parseInt(body.maxWidth);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined,
        maxHeight: body.maxHeight ? (() => {
          const parsed = parseInt(body.maxHeight);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined,
        quality: body.quality ? (() => {
          const parsed = parseFloat(body.quality);
          return isNaN(parsed) ? undefined : parsed;
        })() : undefined
      };

      // Validate request against schema
      const validationResult = UploadAvatarRequestSchema.safeParse(requestRaw);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return c.json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          error: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }, 400);
      }

      const request: UploadAvatarRequest = validationResult.data;

      const result = await this.uploadAvatarUseCase.execute(request);

      // Validate response against schema
      const validationResult = UploadAvatarResponseSchema.safeParse(result);
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
      console.error('AvatarUploadController.uploadCurrentUserAvatar error:', error);

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

      if (error instanceof AvatarUploadError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Upload processing failed' }
        }, 400);
      }

      if (error instanceof InvalidAvatarFormatError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, supportedFormats: ['jpg', 'jpeg', 'png', 'webp'] }
        }, 400);
      }

      if (error instanceof AvatarTooLargeError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, maxSize: '5MB' }
        }, 400);
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
        message: 'Failed to upload avatar',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Delete avatar for user by ID
   */
  async deleteAvatar(c: Context): Promise<Response> {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        }, 400);
      }

      // Validate request
      const request: DeleteAvatarRequest = { userId };
      const validationResult = DeleteAvatarRequestSchema.safeParse(request);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return c.json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          error: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }, 400);
      }

      const result = await this.deleteAvatarUseCase.execute(request);

      // Validate response against schema
      const responseValidation = DeleteAvatarResponseSchema.safeParse(result);
      if (!responseValidation.success) {
        console.error('Response validation failed:', responseValidation.error);
        return c.json({
          success: false,
          message: 'Internal server error - response validation failed',
          error: 'RESPONSE_VALIDATION_ERROR'
        }, 500);
      }

      return c.json(responseValidation.data);
    } catch (error) {
      console.error('AvatarUploadController.deleteAvatar error:', error);

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

      if (error instanceof AvatarUploadError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Avatar deletion failed' }
        }, 400);
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
        message: 'Failed to delete avatar',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }

  /**
   * Delete avatar for current user (from authenticated user)
   */
  async deleteCurrentUserAvatar(c: Context): Promise<Response> {
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

      // Validate request
      const request: DeleteAvatarRequest = { userId };
      const validationResult = DeleteAvatarRequestSchema.safeParse(request);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return c.json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          error: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }, 400);
      }

      const result = await this.deleteAvatarUseCase.execute(request);

      // Validate response against schema
      const responseValidation = DeleteAvatarResponseSchema.safeParse(result);
      if (!responseValidation.success) {
        console.error('Response validation failed:', responseValidation.error);
        return c.json({
          success: false,
          message: 'Internal server error - response validation failed',
          error: 'RESPONSE_VALIDATION_ERROR'
        }, 500);
      }

      return c.json(responseValidation.data);
    } catch (error) {
      console.error('AvatarUploadController.deleteCurrentUserAvatar error:', error);

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

      if (error instanceof AvatarUploadError) {
        return c.json({
          success: false,
          message: error.message,
          error: error.code,
          details: { userId, reason: 'Avatar deletion failed' }
        }, 400);
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
        message: 'Failed to delete avatar',
        error: 'INTERNAL_SERVER_ERROR',
        details: { userId, timestamp: new Date().toISOString() }
      }, 500);
    }
  }
}
