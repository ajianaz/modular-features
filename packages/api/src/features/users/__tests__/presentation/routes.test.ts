import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userRoutes } from '../../presentation/routes';
import { GetUserController } from '../../presentation/controllers/GetUserController';
import { UpdateProfileController } from '../../presentation/controllers/UpdateProfileController';
import { SettingsController } from '../../presentation/controllers/SettingsController';
import { AvatarUploadController } from '../../presentation/controllers/AvatarUploadController';

// Mock the controllers
vi.mock('../controllers/GetUserController', () => ({
  GetUserController: vi.fn().mockImplementation(() => ({
    getProfile: vi.fn(),
    getCurrentUserProfile: vi.fn(),
    getSettings: vi.fn(),
    getCurrentUserSettings: vi.fn()
  }))
}));

vi.mock('../controllers/UpdateProfileController', () => ({
  UpdateProfileController: vi.fn().mockImplementation(() => ({
    updateProfile: vi.fn(),
    updateCurrentUserProfile: vi.fn()
  }))
}));

vi.mock('../controllers/SettingsController', () => ({
  SettingsController: vi.fn().mockImplementation(() => ({
    updateSettings: vi.fn(),
    updateCurrentUserSettings: vi.fn()
  }))
}));

vi.mock('../controllers/AvatarUploadController', () => ({
  AvatarUploadController: vi.fn().mockImplementation(() => ({
    uploadAvatar: vi.fn(),
    uploadCurrentUserAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    deleteCurrentUserAvatar: vi.fn()
  }))
}));

// Mock middleware
vi.mock('../../../middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => next())
}));

vi.mock('../../../middleware/validation', () => ({
  validateJson: vi.fn((schema: any) => (c: any, next: any) => next()),
  validateParam: vi.fn((schema: any) => (c: any, next: any) => next()),
  validateQuery: vi.fn((schema: any) => (c: any, next: any) => next())
}));

// Mock validation schemas
vi.mock('../application/dtos/input', () => ({
  GetUserProfileRequestSchema: {
    pick: vi.fn(() => ({ userId: 'string' }))
  },
  GetUserSettingsRequestSchema: {},
  UpdateUserProfileRequestSchema: {
    partial: vi.fn(() => ({ firstName: 'string' }))
  },
  UpdateUserSettingsRequestSchema: {
    partial: vi.fn(() => ({ theme: 'string' }))
  },
  UploadAvatarRequestSchema: {}
}));

import { Hono } from 'hono';

describe('User Routes', () => {
  let app: Hono;
  let mockGetUserController: any;
  let mockUpdateProfileController: any;
  let mockSettingsController: any;
  let mockAvatarUploadController: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Get mock instances
    mockGetUserController = new GetUserController();
    mockUpdateProfileController = new UpdateProfileController();
    mockSettingsController = new SettingsController();
    mockAvatarUploadController = new AvatarUploadController();

    // Create test app with user routes
    app = new Hono();
    app.route('/', userRoutes);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /:userId/profile', () => {
    it('should route to getProfile controller method', async () => {
      const mockResponse = { success: true, data: { id: '123', firstName: 'John' } };
      mockGetUserController.getProfile.mockResolvedValue(mockResponse);

      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/profile', {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      expect(mockGetUserController.getProfile).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Test with invalid UUID
      const response = await app.request('/invalid-uuid/profile', {
        method: 'GET'
      });

      // Should handle validation error (specific behavior depends on validation middleware)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /:userId/settings', () => {
    it('should route to getSettings controller method', async () => {
      const mockResponse = { success: true, data: { theme: 'dark', language: 'en' } };
      mockGetUserController.getSettings.mockResolvedValue(mockResponse);

      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/settings', {
        method: 'GET'
      });

      expect(response.status).toBe(200);
      expect(mockGetUserController.getSettings).toHaveBeenCalled();
    });
  });

  describe('GET /me/profile', () => {
    it('should route to getCurrentUserProfile controller method', async () => {
      const mockResponse = { success: true, data: { id: '123', firstName: 'John' } };
      mockGetUserController.getCurrentUserProfile.mockResolvedValue(mockResponse);

      const response = await app.request('/me/profile', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      expect(response.status).toBe(200);
      expect(mockGetUserController.getCurrentUserProfile).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      const response = await app.request('/me/profile', {
        method: 'GET'
      });

      // Should be handled by auth middleware
      expect(response.status).toBeGreaterThanOrEqual(401);
    });
  });

  describe('GET /me/settings', () => {
    it('should route to getCurrentUserSettings controller method', async () => {
      const mockResponse = { success: true, data: { theme: 'dark', language: 'en' } };
      mockGetUserController.getCurrentUserSettings.mockResolvedValue(mockResponse);

      const response = await app.request('/me/settings', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      expect(response.status).toBe(200);
      expect(mockGetUserController.getCurrentUserSettings).toHaveBeenCalled();
    });
  });

  describe('PUT /:userId/profile', () => {
    it('should route to updateProfile controller method', async () => {
      const mockResponse = { success: true, data: { id: '123', firstName: 'Updated' } };
      mockUpdateProfileController.updateProfile.mockResolvedValue(mockResponse);

      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      expect(mockUpdateProfileController.updateProfile).toHaveBeenCalled();
    });

    it('should validate request body', async () => {
      const invalidData = { firstName: 123 }; // Invalid type

      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(invalidData)
      });

      // Should handle validation error
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /me/profile', () => {
    it('should route to updateCurrentUserProfile controller method', async () => {
      const mockResponse = { success: true, data: { id: '123', firstName: 'Updated' } };
      mockUpdateProfileController.updateCurrentUserProfile.mockResolvedValue(mockResponse);

      const updateData = { firstName: 'Updated' };
      const response = await app.request('/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      expect(mockUpdateProfileController.updateCurrentUserProfile).toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      const mockResponse = { success: true, data: { id: '123' } };
      mockUpdateProfileController.updateCurrentUserProfile.mockResolvedValue(mockResponse);

      const partialData = { firstName: 'Updated' }; // Only one field
      const response = await app.request('/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(partialData)
      });

      expect(response.status).toBe(200);
      expect(mockUpdateProfileController.updateCurrentUserProfile).toHaveBeenCalled();
    });
  });

  describe('PUT /:userId/settings', () => {
    it('should route to updateSettings controller method', async () => {
      const mockResponse = { success: true, data: { theme: 'light', language: 'es' } };
      mockSettingsController.updateSettings.mockResolvedValue(mockResponse);

      const updateData = { theme: 'light', language: 'es' };
      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      expect(mockSettingsController.updateSettings).toHaveBeenCalled();
    });
  });

  describe('PUT /me/settings', () => {
    it('should route to updateCurrentUserSettings controller method', async () => {
      const mockResponse = { success: true, data: { theme: 'light' } };
      mockSettingsController.updateCurrentUserSettings.mockResolvedValue(mockResponse);

      const updateData = { theme: 'light' };
      const response = await app.request('/me/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      expect(mockSettingsController.updateCurrentUserSettings).toHaveBeenCalled();
    });

    it('should allow partial settings updates', async () => {
      const mockResponse = { success: true, data: { theme: 'light' } };
      mockSettingsController.updateCurrentUserSettings.mockResolvedValue(mockResponse);

      const partialData = { theme: 'light' }; // Only one setting
      const response = await app.request('/me/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(partialData)
      });

      expect(response.status).toBe(200);
      expect(mockSettingsController.updateCurrentUserSettings).toHaveBeenCalled();
    });
  });

  describe('Route Structure', () => {
    it('should have correct route paths defined', () => {
      // Check that routes are properly defined by testing route existence
      const routes = userRoutes.routes;

      // Public routes (before auth middleware)
      expect(routes.some((route: any) => route.path === '/:userId/profile' && route.method === 'GET')).toBe(true);
      expect(routes.some((route: any) => route.path === '/:userId/settings' && route.method === 'GET')).toBe(true);

      // Protected routes (after auth middleware)
      expect(routes.some((route: any) => route.path === '/me/profile' && route.method === 'GET')).toBe(true);
      expect(routes.some((route: any) => route.path === '/me/settings' && route.method === 'GET')).toBe(true);
      expect(routes.some((route: any) => route.path === '/:userId/profile' && route.method === 'PUT')).toBe(true);
      expect(routes.some((route: any) => route.path === '/me/profile' && route.method === 'PUT')).toBe(true);
      expect(routes.some((route: any) => route.path === '/:userId/settings' && route.method === 'PUT')).toBe(true);
      expect(routes.some((route: any) => route.path === '/me/settings' && route.method === 'PUT')).toBe(true);
    });

    it('should apply auth middleware to protected routes', async () => {
      // Test that protected routes require authentication
      const protectedRoutes = [
        '/me/profile',
        '/me/settings',
        '/123e4567-e89b-12d3-a456-426614174001/profile',
        '/123e4567-e89b-12d3-a456-426614174001/settings'
      ];

      for (const route of protectedRoutes) {
        const response = await app.request(route, {
          method: 'GET'
        });

        // Should be handled by auth middleware (401 or similar)
        expect(response.status).toBeGreaterThanOrEqual(401);
      }
    });

    it('should allow access to public routes without authentication', async () => {
      // Mock successful responses for public routes
      mockGetUserController.getProfile.mockResolvedValue({ success: true, data: {} });
      mockGetUserController.getSettings.mockResolvedValue({ success: true, data: {} });

      const publicRoutes = [
        '/123e4567-e89b-12d3-a456-426614174001/profile',
        '/123e4567-e89b-12d3-a456-426614174001/settings'
      ];

      for (const route of publicRoutes) {
        const response = await app.request(route, {
          method: 'GET'
        });

        // Should not require authentication
        expect(response.status).toBeLessThan(401);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      mockGetUserController.getProfile.mockRejectedValue(new Error('Database error'));

      const response = await app.request('/123e4567-e89b-12d3-a456-426614174001/profile', {
        method: 'GET'
      });

      expect(response.status).toBeGreaterThanOrEqual(500);
    });

    it('should handle validation middleware errors', async () => {
      const response = await app.request('/invalid-uuid/profile', {
        method: 'GET'
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle JSON parsing errors', async () => {
      const response = await app.request('/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: 'invalid-json'
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Content-Type Handling', () => {
    it('should accept JSON content type for PUT requests', async () => {
      mockUpdateProfileController.updateCurrentUserProfile.mockResolvedValue({ success: true, data: {} });

      const response = await app.request('/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({ firstName: 'Updated' })
      });

      expect(response.status).toBe(200);
    });

    it('should reject unsupported content types', async () => {
      const response = await app.request('/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': 'Bearer valid-token'
        },
        body: 'some text'
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Parameter Validation', () => {
    it('should validate userId parameter format', async () => {
      const invalidIds = [
        'not-a-uuid',
        '123-456-789',
        '',
        '123e4567-e89b-12d3-a456-426614174001-extra'
      ];

      for (const invalidId of invalidIds) {
        const response = await app.request(`/${invalidId}/profile`, {
          method: 'GET'
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should accept valid UUID format', async () => {
      mockGetUserController.getProfile.mockResolvedValue({ success: true, data: {} });

      const validId = '123e4567-e89b-12d3-a456-426614174001';
      const response = await app.request(`/${validId}/profile`, {
        method: 'GET'
      });

      expect(response.status).toBeLessThan(400);
    });
  });
});