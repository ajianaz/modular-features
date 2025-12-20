import { Hono, Context } from 'hono';
import { LoginController } from './controllers/LoginController';
import { RegisterController } from './controllers/RegisterController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshTokenController } from './controllers/RefreshTokenController';
import { JWKSController } from './controllers/JWKSController';
import { KeycloakSyncController } from './controllers/KeycloakSyncController';

// Infrastructure dependencies
import { AuthContainer } from '../infrastructure/container/AuthContainer';
import { createAuthMiddleware, UnifiedTokenValidator } from '../infrastructure/middleware/UnifiedTokenValidator';

// Initialize dependencies
const authContainer = AuthContainer.getInstance();
const tokenValidator = new UnifiedTokenValidator();
const jwksController = new JWKSController();

// Auth routes
export const authRoutes = new Hono();

// Register route (public)
authRoutes.post(
  '/register',
  async (c: Context) => {
    const controller = new RegisterController(authContainer.getRegisterUseCase());
    return await controller.handle(c);
  }
);

// Login route (public)
authRoutes.post(
  '/login',
  async (c: Context) => {
    const controller = new LoginController(authContainer.getLoginUseCase());
    return await controller.handle(c);
  }
);

// Refresh token route (public)
authRoutes.post(
  '/refresh-token',
  async (c: Context) => {
    const controller = new RefreshTokenController(authContainer.getRefreshTokenUseCase());
    return await controller.handle(c);
  }
);

// Logout route (requires authentication)
authRoutes.post(
  '/logout',
  createAuthMiddleware(tokenValidator),
  async (c: Context) => {
    const controller = new LogoutController(authContainer.getLogoutUseCase());
    return await controller.handle(c);
  }
);

// JWKS endpoints (public)
authRoutes.get(
  '/.well-known/jwks.json',
  async (c: Context) => {
    return await jwksController.getJWKS(c);
  }
);

// Alternative JWKS endpoint
authRoutes.get(
  '/jwks',
  async (c: Context) => {
    return await jwksController.getJWKS(c);
  }
);

// Public key endpoint (PEM format)
authRoutes.get(
  '/public-key',
  async (c: Context) => {
    return await jwksController.getPublicKey(c);
  }
);

// Key validation endpoint
authRoutes.get(
  '/keys/validate',
  async (c: Context) => {
    return await jwksController.validateKeys(c);
  }
);

// Keycloak sync endpoint (public)
// Syncs Keycloak JWT to BetterAuth session
authRoutes.post(
  '/sign-in/keycloak',
  async (c: Context) => {
    return await KeycloakSyncController.signIn(c);
  }
);

export default authRoutes;