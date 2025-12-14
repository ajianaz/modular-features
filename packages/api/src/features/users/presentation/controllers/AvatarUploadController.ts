import { Request, Response } from 'express';
import { UploadAvatarUseCase } from '../../application/usecases/UploadAvatarUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { UploadAvatarResponse, UploadAvatarResponseSchema } from '../../application/dtos/output/UploadAvatarResponse';
import { UploadAvatarRequest } from '../../application/dtos/input/UploadAvatarRequest';

/**
 * Controller for avatar upload with file handling
 */
export class AvatarUploadController {
  private uploadAvatarUseCase: UploadAvatarUseCase;

  constructor() {
    const usersContainer = UsersContainer.getInstance();
    this.uploadAvatarUseCase = usersContainer.getUploadAvatarUseCase();
  }

  /**
   * Upload avatar for user by ID
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        });
        return;
      }

      // Check if file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Avatar file is required',
          error: 'MISSING_AVATAR_FILE'
        });
        return;
      }

      const request: UploadAvatarRequest = {
        userId,
        file: req.file,
        maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth) : undefined,
        maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight) : undefined,
        quality: req.body.quality ? parseFloat(req.body.quality) : undefined
      };

      const result = await this.uploadAvatarUseCase.execute(request);

      // Validate response against schema
      const validationResult = UploadAvatarResponseSchema.safeParse(result);
      if (!validationResult.success) {
        console.error('Response validation failed:', validationResult.error);
        res.status(500).json({
          success: false,
          message: 'Internal server error - response validation failed',
          error: 'RESPONSE_VALIDATION_ERROR'
        });
        return;
      }

      res.status(200).json(validationResult.data);
    } catch (error) {
      console.error('AvatarUploadController.uploadAvatar error:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Upload avatar for current user (from authenticated user)
   */
  async uploadCurrentUserAvatar(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated request (assuming it's attached by auth middleware)
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      // Check if file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Avatar file is required',
          error: 'MISSING_AVATAR_FILE'
        });
        return;
      }

      const request: UploadAvatarRequest = {
        userId,
        file: req.file,
        maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth) : undefined,
        maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight) : undefined,
        quality: req.body.quality ? parseFloat(req.body.quality) : undefined
      };

      const result = await this.uploadAvatarUseCase.execute(request);

      // Validate response against schema
      const validationResult = UploadAvatarResponseSchema.safeParse(result);
      if (!validationResult.success) {
        console.error('Response validation failed:', validationResult.error);
        res.status(500).json({
          success: false,
          message: 'Internal server error - response validation failed',
          error: 'RESPONSE_VALIDATION_ERROR'
        });
        return;
      }

      res.status(200).json(validationResult.data);
    } catch (error) {
      console.error('AvatarUploadController.uploadCurrentUserAvatar error:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Delete avatar for user by ID
   */
  async deleteAvatar(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'MISSING_USER_ID'
        });
        return;
      }

      // For deletion, we need to handle this differently since file is required
      // Let's modify the use case to handle deletion separately
      // For now, we'll return an error indicating this endpoint is not implemented
      res.status(501).json({
        success: false,
        message: 'Avatar deletion not implemented through this endpoint',
        error: 'NOT_IMPLEMENTED'
      });
      return;
    } catch (error) {
      console.error('AvatarUploadController.deleteAvatar error:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Delete avatar for current user (from authenticated user)
   */
  async deleteCurrentUserAvatar(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated request (assuming it's attached by auth middleware)
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      // For deletion, we need to handle this differently since file is required
      // Let's modify the use case to handle deletion separately
      // For now, we'll return an error indicating this endpoint is not implemented
      res.status(501).json({
        success: false,
        message: 'Avatar deletion not implemented through this endpoint',
        error: 'NOT_IMPLEMENTED'
      });
      return;
    } catch (error) {
      console.error('AvatarUploadController.deleteCurrentUserAvatar error:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}