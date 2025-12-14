import { Hono, Context } from 'hono';
import { LoginController } from './controllers/LoginController';
import { RegisterController } from './controllers/RegisterController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshTokenController } from './controllers/RefreshTokenController';

// Infrastructure dependencies
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { SessionRepository } from '../infrastructure/repositories/SessionRepository';
import { BcryptHashProvider } from '../infrastructure/lib/BcryptHashProvider';
import { JWTTokenGenerator } from '../infrastructure/lib/JWTTokenGenerator';

// Initialize dependencies
const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const hashProvider = new BcryptHashProvider();
const tokenGenerator = new JWTTokenGenerator({
  secretKey: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiry: 15 * 60, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
  issuer: 'modular-monolith',
  audience: 'modular-monolith-api'
});

// Auth routes
export const authRoutes = new Hono();


// Register route
authRoutes.post(
  '/register',
  async (c: Context) => {
    const controller = new RegisterController(userRepository, hashProvider);
    return await controller.handle(c);
  }
);

// Login route
authRoutes.post(
  '/login',
  async (c: Context) => {
    const controller = new LoginController(
      userRepository,
      sessionRepository,
      hashProvider,
      tokenGenerator
    );
    return await controller.handle(c);
  }
);

// Logout route
authRoutes.post(
  '/logout',
  async (c: Context) => {
    const controller = new LogoutController(sessionRepository);
    return await controller.handle(c);
  }
);

// Refresh token route
authRoutes.post(
  '/refresh-token',
  async (c: Context) => {
    const controller = new RefreshTokenController(
      userRepository,
      sessionRepository,
      tokenGenerator
    );
    return await controller.handle(c);
  }
);

export default authRoutes;