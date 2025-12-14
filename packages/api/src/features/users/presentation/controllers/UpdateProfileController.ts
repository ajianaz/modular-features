import { Request, Response } from 'express';
import { UpdateUserProfileUseCase } from '../../application/usecases/UpdateUserProfileUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { UpdateUserProfileResponse, UpdateUserProfileResponseSchema } from '../../application/dtos/output/UpdateUserProfileResponse';
import { UpdateUserProfileRequest } from '../../application/dtos/input/UpdateUserProfileRequest';

/**
 * Controller for updating user profile
 */
export class UpdateProfileController {
  private updateUserProfileUseCase: UpdateUserProfileUseCase;

  constructor() {
    const usersContainer = UsersContainer.getInstance();
    this.updateUserProfileUseCase = usersContainer.getUpdateUserProfileUseCase();
  }

  /**
   * Update user profile by ID
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
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

      const request: UpdateUserProfileRequest = {
        userId,
        ...req.body
      };

      const result = await this.updateUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserProfileResponseSchema.safeParse(result);
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
      console.error('UpdateProfileController.updateProfile error:', error);

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
   * Update current user's profile (from authenticated user)
   */
  async updateCurrentUserProfile(req: Request, res: Response): Promise<void> {
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

      const request: UpdateUserProfileRequest = {
        userId,
        ...req.body
      };

      const result = await this.updateUserProfileUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserProfileResponseSchema.safeParse(result);
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
      console.error('UpdateProfileController.updateCurrentUserProfile error:', error);

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