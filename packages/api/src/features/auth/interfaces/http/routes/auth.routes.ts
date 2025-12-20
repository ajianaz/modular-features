/**
 * AUTHENTICATION ROUTES
 * 
 * Hybrid Better Auth + Keycloak Gateway
 * Supports: Web (cookie), API (bearer), Mobile (JWT)
 */

import { Hono } from 'hono';
import { auth } from '../../../infrastructure/lib/BetterAuthConfig';

const router = new Hono();

/**
 * ============================================================================
 * HEALTH CHECK ENDPOINT
 * ============================================================================
 */

router.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    mode: 'hybrid',
    gateway: 'better-auth',
    idp: 'keycloak',
    web_support: 'cookie',
    api_support: 'bearer_token',
    jwt_support: 'RS256',
  });
});

/**
 * ============================================================================
 * WEB AUTHENTICATION (Cookie-Based)
 * ============================================================================
 */

/**
 * GET /signin
 * Initiate Keycloak OAuth flow for web apps
 */
router.get('/signin', async (c) => {
  console.log('[AUTH-WEB] Initiating Keycloak sign-in flow');
  return auth.api.handler(c);
});

/**
 * GET /signout
 * Sign out and clear session cookie
 */
router.get('/signout', async (c) => {
  console.log('[AUTH-WEB] Processing sign-out');
  return auth.api.handler(c);
});

/**
 * GET /session
 * Get current session from cookie
 */
router.get('/session', async (c) => {
  console.log('[AUTH-WEB] Fetching session from cookie');
  return auth.api.handler(c);
});

/**
 * ============================================================================
 * API/MOBILE AUTHENTICATION (Token-Based)
 * ============================================================================
 */

/**
 * GET /me
 * Get current user from bearer token
 */
router.get('/me', async (c) => {
  console.log('[AUTH-API] Fetching user from bearer token');
  return auth.api.handler(c);
});

/**
 * POST /signout
 * Sign out and invalidate token
 */
router.post('/signout', async (c) => {
  console.log('[AUTH-API] Processing API sign-out');
  return auth.api.handler(c);
});

/**
 * ============================================================================
 * JWKS ENDPOINT
 * ============================================================================
 */

/**
 * GET /.well-known/jwks.json
 * JWKS endpoint for JWT verification
 */
router.get('/.well-known/jwks.json', async (c) => {
  console.log('[AUTH-JWKS] Serving JWKS');
  
  try {
    const { getJWKS } = await import('../../infrastructure/lib/BetterAuthConfig');
    const jwks = await getJWKS();
    return c.json(jwks);
  } catch (error) {
    console.error('[AUTH-JWKS] Error serving JWKS:', error);
    return c.json({ keys: [] }, 500);
  }
});

/**
 * ============================================================================
 * BETTER AUTH HANDLER (Catch-all for other auth endpoints)
 * ============================================================================
 */

router.all('/*', async (c) => {
  console.log(`[AUTH] Handling ${c.req.method} ${c.req.url}`);
  return auth.api.handler(c);
});

export default router;
