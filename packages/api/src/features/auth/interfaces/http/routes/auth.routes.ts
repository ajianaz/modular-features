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
 * JWKS ENDPOINT (For JWT Verification)
 * ============================================================================
 */

/**
 * GET /.well-known/jwks.json
 * JWKS endpoint for JWT verification - Mobile clients use this to verify JWT tokens
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
 * BETTER AUTH HANDLER (Forward all requests to BetterAuth)
 * ============================================================================
 */

/**
 * All other auth endpoints are handled by BetterAuth
 * This includes:
 * - /signin, /signout, /session (web)
 * - /me (API/Mobile)
 * - OAuth callbacks
 * - Token management
 */
router.all('/*', async (c) => {
  console.log(`[AUTH] Handling ${c.req.method} ${c.req.url}`);

  try {
    // Forward to BetterAuth handler
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: ['POST', 'PUT', 'PATCH'].includes(c.req.method) ? c.req.raw.body : undefined,
    });

    const response = await auth.handler(request);

    if (response) {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const jsonData = await response.json();
        return c.json(jsonData, response.status as any);
      } else {
        const textData = await response.text();
        return c.body(textData, response.status as any);
      }
    }

    return c.text('Not Found', 404);
  } catch (error: any) {
    console.error('[AUTH] Error:', error);
    return c.json({
      error: 'Authentication failed',
      message: error?.message || 'Unknown error'
    }, 500);
  }
});

export default router;
