import { Context, Next } from 'hono';
import { JWTTokenGenerator } from '../features/auth/infrastructure/lib/JWTTokenGenerator';
import { SessionRepository } from '../features/auth/infrastructure/repositories/SessionRepository';
import { UserRepository } from '../features/auth/infrastructure/repositories/UserRepository';
import { InvalidTokenError, TokenExpiredError } from '../features/auth/domain/errors/AuthenticationError';
import { AuthContainer } from '../features/auth/infrastructure/container/AuthContainer';

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next): Promise<void | Response> => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Initialize dependencies
    const authContainer = AuthContainer.getInstance();
    const tokenGenerator = authContainer.getTokenGenerator();
    const sessionRepository = authContainer.getSessionRepository();
    const userRepository = authContainer.getUserRepository();

    // Verify JWT token
    const verification = await tokenGenerator.verifyToken(token);
    if (!verification.valid || !verification.payload) {
      return c.json({ error: verification.error || 'Invalid token' }, 401);
    }

    // Find session by token
    const session = await sessionRepository.findByToken(token);
    if (!session || !session.isValid()) {
      return c.json({ error: 'Session expired or invalid' }, 401);
    }

    // Find user
    const user = await userRepository.findById(session.userId);
    if (!user || !user.canLogin()) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }

    // Update last accessed time
    await sessionRepository.updateLastAccessed(session.id);

    // Set user and session context
    c.set('user', user);
    c.set('session', session);
    c.set('userId', user.id);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error instanceof InvalidTokenError || error instanceof TokenExpiredError) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Optional authentication (doesn't fail if not authenticated)
export const optionalAuthMiddleware = async (c: Context, next: Next): Promise<void> => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Initialize dependencies
    const authContainer = AuthContainer.getInstance();
    const tokenGenerator = authContainer.getTokenGenerator();
    const sessionRepository = authContainer.getSessionRepository();
    const userRepository = authContainer.getUserRepository();

    // Verify JWT token
    const verification = await tokenGenerator.verifyToken(token);
    if (!verification.valid || !verification.payload) {
      await next();
      return;
    }

    // Find session by token
    const session = await sessionRepository.findByToken(token);
    if (!session || !session.isValid()) {
      await next();
      return;
    }

    // Find user
    const user = await userRepository.findById(session.userId);
    if (!user || !user.canLogin()) {
      await next();
      return;
    }

    // Update last accessed time
    await sessionRepository.updateLastAccessed(session.id);

    // Set user and session context
    c.set('user', user);
    c.set('session', session);
    c.set('userId', user.id);
  } catch (error) {
    // Ignore errors for optional auth
    console.error('Optional auth middleware error:', error);
  }

  await next();
};