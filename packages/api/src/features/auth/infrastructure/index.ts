export { UserRepository } from './repositories/UserRepository';
export { SessionRepository } from './repositories/SessionRepository';
export { BcryptHashProvider } from './lib/BcryptHashProvider';
export { JWTTokenGenerator, UnifiedRS256TokenGenerator } from './lib/JWTTokenGenerator';
export { RS256KeyManager } from './lib/RS256KeyManager';
export { AuthContainer } from './container/AuthContainer';
export { auth } from './lib/BetterAuthConfig';
export {
  UnifiedTokenValidator,
  createAuthMiddleware,
  createOptionalAuthMiddleware,
  requireRole,
  requirePermission,
  requireAdmin,
  requireSuperAdmin,
  defaultTokenValidator
} from './middleware/UnifiedTokenValidator';