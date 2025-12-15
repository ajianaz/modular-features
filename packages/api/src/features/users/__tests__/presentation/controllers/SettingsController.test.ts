import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsController } from '../../../presentation/controllers/SettingsController';
import { UpdateUserSettingsUseCase } from '../../../application/usecases/UpdateUserSettingsUseCase';
import { UserSettings } from '../../../domain/entities';
import {
  createTestUserSettings,
  createTestUpdateUserSettingsRequest
} from '../../utils/testFixtures.test';

describe('SettingsController', () => {
  let updateUserSettingsUseCase: UpdateUserSettingsUseCase;
  let settingsController: SettingsController;
  let testUserSettings: UserSettings;

  beforeEach(() => {
    // Mock the use case
    updateUserSettingsUseCase = {
      execute: vi.fn()
    } as any;

    testUserSettings = createTestUserSettings();

    // Create the controller with mocked dependencies
    settingsController = new SettingsController(updateUserSettingsUseCase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateSettings', () => {
    it('should update user settings successfully', async () => {
      // Mock the use case to return updated settings
      const updatedSettings = createTestUserSettings();
      updateUserSettingsUseCase.execute.mockResolvedValue({
        success: true,
        data: updatedSettings
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await settingsController.updateSettings(mockContext as any);

      // Verify the use case was called with correct request
      expect(updateUserSettingsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id'
        })
      );

      // Verify the response
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        data: updatedSettings
      });
    });

    it('should handle validation error', async () => {
      // Mock the use case to return a validation error
      updateUserSettingsUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid settings data',
          statusCode: 400
        }
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await settingsController.updateSettings(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(400);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid settings data'
        }
      });
    });

    it('should handle settings not found error', async () => {
      // Mock the use case to return a not found error
      updateUserSettingsUseCase.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'SETTINGS_NOT_FOUND',
          message: 'Settings not found',
          statusCode: 404
        }
      });

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await settingsController.updateSettings(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(404);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SETTINGS_NOT_FOUND',
          message: 'Settings not found'
        }
      });
    });

    it('should handle server error', async () => {
      // Mock the use case to throw an error
      updateUserSettingsUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

      // Create a mock context
      const mockContext = {
        get: vi.fn().mockReturnValue({ id: 'test-user-id' }),
        json: vi.fn().mockReturnValue({}),
        status: vi.fn().mockReturnThis(),
        req: {
          query: vi.fn().mockReturnValue({}),
          param: vi.fn()
        }
      };

      // Call the controller method
      await settingsController.updateSettings(mockContext as any);

      // Verify the response
      expect(mockContext.status).toHaveBeenCalledWith(500);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      });
    });
  });
});