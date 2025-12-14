import { Hono, Context } from 'hono';
import { GetUserController } from './controllers/GetUserController';
import { UpdateProfileController } from './controllers/UpdateProfileController';
import { SettingsController } from './controllers/SettingsController';
import { AvatarUploadController } from './controllers/AvatarUploadController';
import { authMiddleware } from '../../../middleware/auth';
import { validateJson, validateParam, validateQuery } from '../../../middleware/validation';
import {
  GetUserProfileRequestSchema,
  GetUserSettingsRequestSchema,
  UpdateUserProfileRequestSchema,
  UpdateUserSettingsRequestSchema,
  UploadAvatarRequestSchema
} from '../application/dtos/input';

// Initialize controllers
const getUserController = new GetUserController();
const updateProfileController = new UpdateProfileController();
const settingsController = new SettingsController();
const avatarUploadController = new AvatarUploadController();

// User routes
export const userRoutes = new Hono();

// Public routes (no authentication required)
// GET /api/users/:userId/profile - Get user profile by ID
userRoutes.get(
  '/:userId/profile',
  validateParam(GetUserProfileRequestSchema.pick({ userId: true })),
  async (c: Context) => {
    return await getUserController.getProfile(c);
  }
);

// GET /api/users/:userId/settings - Get user settings by ID (protected by auth in controller)
userRoutes.get(
  '/:userId/settings',
  validateParam(GetUserSettingsRequestSchema),
  async (c: Context) => {
    return await getUserController.getSettings(c);
  }
);

// Protected routes (authentication required)
userRoutes.use(authMiddleware);

// GET /api/users/me/profile - Get current user's profile
userRoutes.get(
  '/me/profile',
  async (c: Context) => {
    return await getUserController.getCurrentUserProfile(c);
  }
);

// GET /api/users/me/settings - Get current user's settings
userRoutes.get(
  '/me/settings',
  async (c: Context) => {
    return await getUserController.getCurrentUserSettings(c);
  }
);

// PUT /api/users/:userId/profile - Update user profile by ID
userRoutes.put(
  '/:userId/profile',
  validateParam(GetUserProfileRequestSchema.pick({ userId: true })),
  validateJson(UpdateUserProfileRequestSchema),
  async (c: Context) => {
    return await updateProfileController.updateProfile(c);
  }
);

// PUT /api/users/me/profile - Update current user's profile
userRoutes.put(
  '/me/profile',
  validateJson(UpdateUserProfileRequestSchema.partial()),
  async (c: Context) => {
    return await updateProfileController.updateCurrentUserProfile(c);
  }
);

// PUT /api/users/:userId/settings - Update user settings by ID
userRoutes.put(
  '/:userId/settings',
  validateParam(GetUserSettingsRequestSchema),
  validateJson(UpdateUserSettingsRequestSchema),
  async (c: Context) => {
    return await settingsController.updateSettings(c);
  }
);

// PUT /api/users/me/settings - Update current user's settings
userRoutes.put(
  '/me/settings',
  validateJson(UpdateUserSettingsRequestSchema.partial()),
  async (c: Context) => {
    return await settingsController.updateCurrentUserSettings(c);
  }
);

// Note: Avatar upload routes would need file upload middleware for Hono
// For now, we'll create basic routes that can be enhanced later

export default userRoutes;