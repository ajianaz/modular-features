import { Context, Next, HonoRequest } from 'hono';
import { UnifiedRS256TokenGenerator } from '../lib/JWTTokenGenerator';
import { TokenPayload } from '../../domain/interfaces/ITokenGenerator';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Unified Token Validator for RS256 tokens
 * Supports both Bearer token and cookie-based authentication
 */
export class UnifiedTokenValidator {
  private tokenGenerator: UnifiedRS256TokenGenerator;

  constructor() {
    this.tokenGenerator = new UnifiedRS256TokenGenerator({});
  }

  /**
   * Validate Bearer token from Authorization header
   */
  async validateBearerToken(req: HonoRequest): Promise<ValidationResult> {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    return await this.tokenGenerator.verifyToken(token);
  }

  /**
   * Validate token from cookies
   */
  async validateCookieToken(req: HonoRequest): Promise<ValidationResult> {
    const cookieHeader = req.header('cookie');
    if (!cookieHeader) {
      return { valid: false, error: 'Missing authentication cookie' };
    }

    // Parse cookies manually
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['auth-token'];
    if (!token) {
      return { valid: false, error: 'Missing authentication cookie' };
    }

    return await this.tokenGenerator.verifyToken(token);
  }

  /**
   * Validate token from multiple sources (header first, then cookie)
   */
  async validateToken(req: HonoRequest | Request): Promise<ValidationResult> {
    // Try Bearer token first
    const bearerResult = await this.validateBearerToken(req as HonoRequest);
    if (bearerResult.valid) {
      return bearerResult;
    }

    // Fallback to cookie token
    return await this.validateCookieToken(req as HonoRequest);
  }

  /**
   * Check if token is of specific type (access/refresh)
   */
  async validateTokenType(token: string, expectedType: 'access' | 'refresh'): Promise<ValidationResult> {
    const result = await this.tokenGenerator.verifyToken(token);

    if (!result.valid) {
      return result;
    }

    if (result.payload?.type !== expectedType) {
      return {
        valid: false,
        error: `Token is not a ${expectedType} token`
      };
    }

    return result;
  }

  /**
   * Extract user information from validated token
   */
  extractUserInfo(payload: TokenPayload): {
    userId: string;
    email: string;
    name: string;
    role: string;
    authProvider?: string;
    sessionId?: string;
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      authProvider: payload.auth_provider,
      sessionId: payload.session_id
    };
  }

  /**
   * Check if user has required role
   */
  hasRequiredRole(userRole: string, requiredRole: 'user' | 'admin' | 'super_admin'): boolean {
    const roleHierarchy: Record<string, number> = {
      'user': 0,
      'admin': 1,
      'super_admin': 2
    };

    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  }

  /**
   * Check if user has required permission
   */
  hasPermission(payload: TokenPayload, requiredPermission: string): boolean {
    if (!payload.permissions || payload.permissions.length === 0) {
      return false;
    }

    return payload.permissions.includes(requiredPermission);
  }
}

/**
 * Create authentication middleware for Hono
 */
export function createAuthMiddleware(validator: UnifiedTokenValidator, options: {
  requiredRole?: 'user' | 'admin' | 'super_admin';
  requiredPermission?: string;
  tokenType?: 'access' | 'refresh';
} = {}) {
  return async (c: Context, next: Next) => {
    const result = await validator.validateToken(c.req);

    if (!result.valid) {
      return c.json({
        error: 'Authentication failed',
        message: result.error
      }, 401);
    }

    const payload = result.payload!;

    // Check token type if specified
    if (options.tokenType && payload.type !== options.tokenType) {
      return c.json({
        error: 'Invalid token type',
        message: `Expected ${options.tokenType} token, got ${payload.type}`
      }, 401);
    }

    // Check role requirements
    if (options.requiredRole) {
      if (!validator.hasRequiredRole(payload.role, options.requiredRole)) {
        return c.json({
          error: 'Insufficient permissions',
          message: `Requires ${options.requiredRole} role`
        }, 403);
      }
    }

    // Check permission requirements
    if (options.requiredPermission) {
      if (!validator.hasPermission(payload, options.requiredPermission)) {
        return c.json({
          error: 'Insufficient permissions',
          message: `Requires ${options.requiredPermission} permission`
        }, 403);
      }
    }

    // Set user context in the request
    const userInfo = validator.extractUserInfo(payload);
    c.set('user', payload);
    c.set('userId', userInfo.userId);
    c.set('userEmail', userInfo.email);
    c.set('userName', userInfo.name);
    c.set('userRole', userInfo.role);
    c.set('authProvider', userInfo.authProvider);
    c.set('sessionId', userInfo.sessionId);

    await next();
    return;
  };
}

/**
 * Create optional authentication middleware (doesn't fail if no token)
 */
export function createOptionalAuthMiddleware(validator: UnifiedTokenValidator) {
  return async (c: Context, next: Next) => {
    const result = await validator.validateToken(c.req);

    if (result.valid && result.payload) {
      const userInfo = validator.extractUserInfo(result.payload);
      c.set('user', result.payload);
      c.set('userId', userInfo.userId);
      c.set('userEmail', userInfo.email);
      c.set('userName', userInfo.name);
      c.set('userRole', userInfo.role);
      c.set('authProvider', userInfo.authProvider);
      c.set('sessionId', userInfo.sessionId);
    }

    await next();
  };
}

/**
 * Role-based middleware factory
 */
export function requireRole(role: 'user' | 'admin' | 'super_admin') {
  const validator = new UnifiedTokenValidator();
  return createAuthMiddleware(validator, { requiredRole: role });
}

/**
 * Permission-based middleware factory
 */
export function requirePermission(permission: string) {
  const validator = new UnifiedTokenValidator();
  return createAuthMiddleware(validator, { requiredPermission: permission });
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Super admin-only middleware
 */
export const requireSuperAdmin = requireRole('super_admin');

// Export default validator instance
export const defaultTokenValidator = new UnifiedTokenValidator();