import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { userRoutes } from "./features/users/presentation/routes";
import { notificationRoutes } from "./features/notifications/presentation/routes";
import { auth, getJWKS, getPublicKeyPEM, validateKeys } from "./features/auth/infrastructure/lib/BetterAuthConfig";
import { errorHandler } from "./middleware/error";
import type { Context } from "hono";
import { config } from "@modular-monolith/shared";
import { db } from "@modular-monolith/database";
import * as crypto from "crypto";

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
    const originalUrl = c.req.url;
    const originalPath = c.req.path;

    console.log(`[BETTERAUTH] ${c.req.method} ${originalUrl}`);

    // BetterAuth uses the URL as-is for routing
    // No URL rewriting needed
    const request = new Request(originalUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      // Only include body for POST/PUT/PATCH requests
      body: ['POST', 'PUT', 'PATCH'].includes(c.req.method) ? c.req.raw.body : undefined,
      signal: AbortSignal.timeout(10000)
    });

    const response = await auth.handler(request);

    console.log(`[BETTERAUTH] Response status: ${response?.status}`);

    if (response) {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        // For JSON responses, parse and return with c.json()
        try {
          const jsonData = await response.json();
          // Set status code separately
          return c.json(jsonData, response.status as any);
        } catch {
          // If parsing fails, return empty JSON
          return c.json({}, response.status as any);
        }
      } else {
        // For text responses, use c.body()
        const textData = await response.text();
        return c.body(textData, response.status as any);
      }
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

// =============================================================================
// BETTER AUTH ROUTES (Keycloak as Source of Truth)
// =============================================================================

// Explicit OAuth callback handler (must be BEFORE catch-all)
app.get("/api/auth/oauth/:provider/callback", async (c: Context) => {
  const provider = c.req.param('provider');
  const state = c.req.query('state');
  const code = c.req.query('code');
  
  console.log(`[OAUTH-CALLBACK] Received callback for provider: ${provider}`);
  console.log(`[OAUTH-CALLBACK] State: ${state}`);
  console.log(`[OAUTH-CALLBACK] Code: ${code ? 'present' : 'missing'}`);

  try {
    // Manual OAuth callback handling for Keycloak
    if (provider === 'keycloak' && code) {
      console.log(`[OAUTH-CALLBACK] Processing Keycloak OAuth callback...`);
      
      // Exchange code for tokens
      // IMPORTANT: redirect_uri must match exactly what was sent to Keycloak
      // The correct redirect_uri is: http://localhost:3000/api/auth/oauth/keycloak/callback
      const redirectUri = `http://localhost:3000/api/auth/oauth/keycloak/callback`;
      
      console.log(`[OAUTH-CALLBACK] Exchanging code with redirect_uri: ${redirectUri}`);
      
      const tokenResponse = await fetch(`${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.auth.keycloak.clientId,
          client_secret: config.auth.keycloak.clientSecret,
          code: code,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[OAUTH-CALLBACK] Token exchange failed: ${tokenResponse.statusText}`);
        console.error(`[OAUTH-CALLBACK] Error response:`, errorText);
        console.error(`[OAUTH-CALLBACK] Redirect URI used:`, `${config.auth.betterAuth.url}/oauth/callback/keycloak`);
        console.error(`[OAUTH-CALLBACK] Expected redirect URI in Keycloak:`, `${config.auth.betterAuth.url}/api/auth/oauth/keycloak/callback`);
        return c.text(`Failed to exchange code for tokens: ${errorText}`, 500);
      }

      const tokens = await tokenResponse.json();
      console.log(`[OAUTH-CALLBACK] Tokens received:`, { access_token: !!tokens.access_token, id_token: !!tokens.id_token });

      // Get user info from Keycloak
      const userInfoResponse = await fetch(`${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}/protocol/openid-connect/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      if (!userInfoResponse.ok) {
        console.error(`[OAUTH-CALLBACK] Failed to get user info: ${userInfoResponse.statusText}`);
        return c.text('Failed to get user info', 500);
      }

      const keycloakUser = await userInfoResponse.json();
      console.log(`[OAUTH-CALLBACK] Keycloak user:`, { sub: keycloakUser.sub, email: keycloakUser.email });

      // Create or update user and session using BetterAuth API
      const { auth: betterAuth } = await import('./features/auth/infrastructure/lib/BetterAuthConfig');
      
      // Check if user exists
      const { db } = await import('@modular-monolith/database');
      const { users, eq } = await import('@modular-monolith/database');
      
      let user = await db.query.users.findFirst({
        where: eq(users.id, keycloakUser.sub)
      });

      // Create user if not exists
      if (!user) {
        console.log(`[OAUTH-CALLBACK] Creating new user:`, keycloakUser.sub);
        const newUsers = await db.insert(users).values({
          id: keycloakUser.sub,
          email: keycloakUser.email,
          name: keycloakUser.name || keycloakUser.preferred_username,
          username: keycloakUser.preferred_username,
          emailVerified: true,
          role: 'user',
          status: 'active',
        }).returning();
        user = newUsers[0];
      }

      // Create session using BetterAuth API
      // BetterAuth doesn't have createSession method, use signUp or signIn instead
      // Or directly insert into database
      
      console.log(`[OAUTH-CALLBACK] Creating session for user:`, user.id);
      
      const { sessions } = await import('@modular-monolith/database');
      
      // Generate session token
      const sessionToken = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
      
      // Insert session into database
      const newSessions = await db.insert(sessions).values({
        // id is auto-generated (serial), don't provide it
        userId: user.id,
        token: sessionToken,
        expiresAt: expiresAt,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown'
      }).returning();
      
      const session = newSessions[0];
      console.log(`[OAUTH-CALLBACK] Session created:`, session.id);

      // Set session cookie
      c.header('Set-Cookie', `better-auth.session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; MaxAge=${60 * 60 * 24 * 7}`);

      // Redirect to dashboard
      return c.redirect('/dashboard');
    }

    // Fallback: Forward to BetterAuth handler
    console.log(`[OAUTH-CALLBACK] Fallback to BetterAuth handler`);
    return handleBetterAuthRequest(c);
  } catch (error) {
    console.error(`[OAUTH-CALLBACK] Error:`, error);
    return c.text('OAuth callback failed', 500);
  }
});

app.all("/api/auth/oauth/*", handleBetterAuthRequest);

// Catch-all for all other /api/auth/* routes
app.all("/api/auth/*", handleBetterAuthRequest);

// =============================================================================
// API ROUTES
// =============================================================================

// Feature routes
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