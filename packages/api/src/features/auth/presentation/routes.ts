import { Hono, Context } from 'hono';
import { LoginController } from './controllers/LoginController';
import { RegisterController } from './controllers/RegisterController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshTokenController } from './controllers/RefreshTokenController';

// Infrastructure dependencies
import { AuthContainer } from '../infrastructure/container/AuthContainer';

// Initialize dependencies
const authContainer = AuthContainer.getInstance();

// Auth routes
export const authRoutes = new Hono();


// Register route
authRoutes.post(
  '/register',
  async (c: Context) => {
    const controller = new RegisterController(authContainer.getRegisterUseCase());
    return await controller.handle(c);
  }
);

// Login route
authRoutes.post(
  '/login',
  async (c: Context) => {
    const controller = new LoginController(authContainer.getLoginUseCase());
    return await controller.handle(c);
  }
);

// Logout route
authRoutes.post(
  '/logout',
  async (c: Context) => {
    const controller = new LogoutController(authContainer.getLogoutUseCase());
    return await controller.handle(c);
  }
);

// Refresh token route
authRoutes.post(
  '/refresh-token',
  async (c: Context) => {
    const controller = new RefreshTokenController(authContainer.getRefreshTokenUseCase());
    return await controller.handle(c);
  }
);

export default authRoutes;