import { Request, Response } from 'express';
import { GetUserSettingsUseCase } from '../../application/usecases/GetUserSettingsUseCase';
import { UpdateUserSettingsUseCase } from '../../application/usecases/UpdateUserSettingsUseCase';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { ValidationError } from '@modular-monolith/shared';
import { GetUserSettingsResponse, GetUserSettingsResponseSchema } from '../../application/dtos/output/GetUserSettingsResponse';
import { UpdateUserSettingsResponse, UpdateUserSettingsResponseSchema } from '../../application/dtos/output/UpdateUserSettingsResponse';
import { GetUserSettingsRequest } from '../../application/dtos/input/GetUserSettingsRequest';
import { UpdateUserSettingsRequest } from '../../application/dtos/input/UpdateUserSettingsRequest';

/**
 * Controller for user settings CRUD operations
 */
export class SettingsController {
  private getUserSettingsUseCase: GetUserSettingsUseCase;
  private updateUserSettingsUseCase: UpdateUserSettingsUseCase;

  constructor() {
    const usersContainer = UsersContainer.getInstance();
    this.getUserSettingsUseCase = usersContainer.getGetUserSettingsUseCase();
    this.updateUserSettingsUseCase = usersContainer.getUpdateUserSettingsUseCase();
  }

  /**
   * Get user settings by user ID
   */
  async getSettings(req: Request, res: Response): Promise<void> {
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

      const request: GetUserSettingsRequest = { userId };
      const result = await this.getUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.getSettings error:', error);

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
   * Update user settings by user ID
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
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

      const request: UpdateUserSettingsRequest = {
        userId,
        ...req.body
      };

      const result = await this.updateUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.updateSettings error:', error);

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
   * Get current user's settings (from authenticated user)
   */
  async getCurrentUserSettings(req: Request, res: Response): Promise<void> {
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

      const request: GetUserSettingsRequest = { userId };
      const result = await this.getUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = GetUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.getCurrentUserSettings error:', error);

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
   * Update current user's settings (from authenticated user)
   */
  async updateCurrentUserSettings(req: Request, res: Response): Promise<void> {
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

      const request: UpdateUserSettingsRequest = {
        userId,
        ...req.body
      };

      const result = await this.updateUserSettingsUseCase.execute(request);

      // Validate response against schema
      const validationResult = UpdateUserSettingsResponseSchema.safeParse(result);
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
      console.error('SettingsController.updateCurrentUserSettings error:', error);

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