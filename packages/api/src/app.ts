import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { userRoutes } from "./features/users/presentation/routes";
import { notificationRoutes } from "./features/notifications/presentation/routes";
import { auth, getJWKS, getPublicKeyPEM, validateKeys } from "./features/auth/infrastructure/lib/BetterAuthConfig";
import { errorHandler } from "./middleware/error";
import type { Context } from "hono";

// Create Hono app instance
const app = new Hono();

// Global middleware
app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
		credentials: true,
	}),
);

// Error handling middleware
app.onError(errorHandler);

// Health check endpoint
app.get("/", (c) => {
	return c.text("OK");
});

// =============================================================================
// JWKS ENDPOINTS (for token verification) - MUST BE REGISTERED FIRST
// =============================================================================

// JWKS endpoint (for RS256 token verification)
app.get("/.well-known/jwks.json", async (c: Context) => {
  try {
    const jwks = await getJWKS();
    return c.json(jwks);
  } catch (error: any) {
    console.error('[JWKS] Error:', error);
    return c.json({ error: 'Failed to retrieve JWKS' }, 500);
  }
});

// Alternative JWKS endpoint
app.get("/api/auth/jwks", async (c: Context) => {
  try {
    const jwks = await getJWKS();
    return c.json(jwks);
  } catch (error: any) {
    console.error('[JWKS] Error:', error);
    return c.json({ error: 'Failed to retrieve JWKS' }, 500);
  }
});

// Public key endpoint (PEM format)
app.get("/api/auth/public-key", async (c: Context) => {
  try {
    const publicKey = getPublicKeyPEM();
    return c.text(publicKey, 200, {
      'Content-Type': 'text/plain'
    });
  } catch (error: any) {
    console.error('[PUBLIC-KEY] Error:', error);
    return c.json({ error: 'Failed to retrieve public key' }, 500);
  }
});

// Key validation endpoint
app.get("/api/auth/keys/validate", async (c: Context) => {
  try {
    const validation = validateKeys();
    return c.json(validation);
  } catch (error: any) {
    console.error('[KEYS-VALIDATE] Error:', error);
    return c.json({ 
      valid: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// BETTER AUTH HANDLER (Keycloak as Source of Truth)
// =============================================================================

// BetterAuth request handler function - MUST BE DEFINED BEFORE ROUTES!
async function handleBetterAuthRequest(c: Context) {
  try {
    console.log(`[BETTERAUTH] ${c.req.method} ${c.req.url}`);

    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body,
      signal: AbortSignal.timeout(10000)
    });

    const response = await auth.handler(request);

    console.log(`[BETTERAUTH] Response status: ${response?.status}`);

    if (response) {
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const contentType = response.headers.get('content-type');
      let body;

      if (contentType?.includes('application/json')) {
        try {
          body = await response.json();
        } catch {
          body = null;
        }
      } else {
        body = await response.text();
      }

      return c.body(body, response.status as any, headers);
    }

    return c.text('Not Found', 404);
  } catch (error: any) {
    console.error('BetterAuth middleware error:', error);

    if (error.name === 'AbortError') {
      return c.json({ error: 'BetterAuth request timeout' }, 504);
    }

    return c.json({
      error: 'Internal Server Error',
      message: error.message
    }, 500);
  }
}

// Register BetterAuth routes explicitly (function must be defined first!)
app.all("/api/auth/signin/*", handleBetterAuthRequest);
app.all("/api/auth/sign-out/*", handleBetterAuthRequest);
app.all("/api/auth/sign-up/*", handleBetterAuthRequest);
app.all("/api/auth/session/*", handleBetterAuthRequest);
app.all("/api/auth/oauth/*", handleBetterAuthRequest);
app.get("/api/auth/get-session", handleBetterAuthRequest);

// Catch-all for any other /api/auth/* routes
app.all("/api/auth/*", async (c: Context) => {
  const url = c.req.url;
  // Skip custom endpoints
  if (url.includes('/jwks') || url.includes('/public-key') || url.includes('/keys/validate')) {
    return c.text('Not Found', 404);
  }
  // Forward to BetterAuth handler
  return handleBetterAuthRequest(c);
});

// =============================================================================
// PROTECTED ROUTES (with BetterAuth session validation)
// =============================================================================

// API routes
app.route("/api/users", userRoutes);
app.route("/api/notifications", notificationRoutes);

// BetterAuth session middleware for protected routes
app.use("/api/users/*", async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.header()
    });

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Set user context
    c.set('user', session.user);
    c.set('session', session);
    
    await next();
  } catch (error: any) {
    console.error('[AUTH-MIDDLEWARE] Error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

app.use("/api/notifications/*", async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.header()
    });

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', session.user);
    c.set('session', session);
    
    await next();
  } catch (error: any) {
    console.error('[AUTH-MIDDLEWARE] Error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

export { app };
export type App = typeof app;
export default app;

// =============================================================================
// CUSTOM AUTH - DISABLED (can be enabled for rollback)
// =============================================================================
//
// The following custom auth routes are DISABLED in favor of BetterAuth.
// To re-enable custom auth, uncomment the following lines:
//
// import { authRoutes } from "./features/auth/presentation/routes";
// import { createAuthMiddleware, UnifiedTokenValidator } from "./features/auth/infrastructure/middleware/UnifiedTokenValidator";
//
// const tokenValidator = new UnifiedTokenValidator();
// app.route("/api/auth/custom", authRoutes);
// app.use("/api/users/*", createAuthMiddleware(tokenValidator));
// app.use("/api/notifications/*", createAuthMiddleware(tokenValidator));
//
// =============================================================================