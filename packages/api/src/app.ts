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

      // Set session cookie (for web clients using cookie-based auth)
      c.header('Set-Cookie', `better-auth.session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; MaxAge=${60 * 60 * 24 * 7}`);

      // Check if client wants JWT response (for non-web clients)
      const returnType = c.req.query('return_type') || c.req.header('X-Auth-Return-Type') || 'redirect';

      if (returnType === 'json' || returnType === 'jwt') {
        // Non-web client: return JSON with JWT
        const jwtResponse = await fetch(`${config.auth.betterAuth.url}/api/auth/jwt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `better-auth.session_token=${sessionToken}`
          }
        });

        let jwt = null;
        if (jwtResponse.ok) {
          const jwtData = await jwtResponse.json();
          jwt = jwtData.token;
          console.log(`[OAUTH-CALLBACK] JWT generated for non-web client`);
        }

        return c.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          session: {
            id: session.id,
            token: sessionToken,
            expires_at: session.expiresAt
          },
          jwt: jwt,  // JWT for non-web clients
          note: "Use JWT token in Authorization header: Bearer <jwt>"
        });
      }

      // Web client: generate JWT and redirect to dashboard
      const jwtResponse = await fetch(`${config.auth.betterAuth.url}/api/auth/jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `better-auth.session_token=${sessionToken}`
        }
      });

      let jwt = null;
      if (jwtResponse.ok) {
        const jwtData = await jwtResponse.json();
        jwt = jwtData.token;
        console.log(`[OAUTH-CALLBACK] JWT generated:`, jwt ? 'present' : 'missing');
      }

      // Redirect to dashboard with JWT as query parameter (for testing)
      const redirectUrl = jwt 
        ? `/dashboard?token=${encodeURIComponent(jwt)}&session_created=true`
        : `/dashboard?session_created=true`;
      
      console.log(`[OAUTH-CALLBACK] Redirecting to:`, redirectUrl);
      return c.redirect(redirectUrl);
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
// HYBRID AUTHENTICATION MIDDLEWARE (Cookie + JWT)
// =============================================================================

/**
 * Hybrid authentication function
 * Tries cookie authentication first, then JWT authentication
 * 
 * @returns { success: boolean, user?: any, method?: 'cookie' | 'jwt', error?: string }
 */
async function hybridAuth(c: Context) {
  // Try cookie authentication first (for web clients)
  try {
    const session = await auth.api.getSession({
      headers: c.req.header()
    });

    if (session && session.user) {
      console.log(`[HYBRID-AUTH] ✅ Cookie authentication successful for user:`, session.user.email);
      return {
        success: true,
        user: session.user,
        method: 'cookie' as const
      };
    }
  } catch (error) {
    console.log(`[HYBRID-AUTH] ❌ Cookie authentication failed:`, error.message);
  }

  // Try JWT authentication (for non-web clients)
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify JWT using BetterAuth JWKS endpoint
      const verifyResponse = await fetch(`${config.auth.betterAuth.url}/api/auth/verify-jwt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        
        if (verifyData.valid && verifyData.user) {
          console.log(`[HYBRID-AUTH] ✅ JWT authentication successful for user:`, verifyData.user.email);
          return {
            success: true,
            user: verifyData.user,
            method: 'jwt' as const
          };
        }
      }

      console.log(`[HYBRID-AUTH] ❌ JWT authentication failed: Invalid token`);
      return {
        success: false,
        error: 'Invalid JWT token'
      };
    } catch (error: any) {
      console.error(`[HYBRID-AUTH] ❌ JWT authentication error:`, error.message);
      return {
        success: false,
        error: `JWT verification failed: ${error.message}`
      };
    }
  }

  console.log(`[HYBRID-AUTH] ❌ No valid authentication found`);
  return {
    success: false,
    error: 'No valid session or JWT token found'
  };
}

// =============================================================================
// API ROUTES
// =============================================================================

// Get JWT token endpoint (for non-web clients)
// Use this to exchange session cookie for JWT token
app.get("/api/auth/jwt", async (c: Context) => {
  try {
    // Get session from cookie
    const session = await auth.api.getSession({
      headers: c.req.header()
    });

    if (!session) {
      return c.json({ error: 'Unauthorized - No valid session' }, 401);
    }

    // Generate JWT using BetterAuth
    const jwtResponse = await fetch(`${config.auth.betterAuth.url}/api/auth/jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': c.req.header('Cookie') || ''
      }
    });

    if (!jwtResponse.ok) {
      return c.json({ error: 'Failed to generate JWT' }, 500);
    }

    const jwtData = await jwtResponse.json();

    return c.json({
      success: true,
      jwt: jwtData.token,
      user: session.user,
      note: "Use this JWT in Authorization header: Bearer <jwt>"
    });
  } catch (error: any) {
    console.error('[JWT-ENDPOINT] Error:', error);
    return c.json({ error: 'Failed to get JWT' }, 500);
  }
});

// Dashboard route for testing (protected with hybrid auth)
app.get("/dashboard", async (c: Context) => {
  try {
    // Hybrid authentication: try cookie first, then JWT
    const authResult = await hybridAuth(c);

    if (!authResult.success) {
      return c.json({
        message: "Unauthorized",
        error: authResult.error
      }, 401);
    }

    const token = c.req.query('token');

    return c.json({
      message: "Welcome to Dashboard!",
      authenticated: true,
      auth_method: authResult.method,  // 'cookie' or 'jwt'
      user: authResult.user,
      jwt_token: token || null,
      note: "You can use either cookie-based auth or JWT token"
    });
  } catch (error: any) {
    return c.json({
      message: "Welcome to Dashboard!",
      authenticated: false,
      error: error.message
    }, 401);
  }
});

// Feature routes
app.route("/api/users", userRoutes);
app.route("/api/notifications", notificationRoutes);

// Hybrid authentication middleware for protected routes
// Supports both cookie (web) and JWT (non-web) authentication
app.use("/api/users/*", async (c, next) => {
  const authResult = await hybridAuth(c);

  if (!authResult.success) {
    return c.json({ 
      error: 'Unauthorized',
      message: authResult.error,
      hint: 'Use session cookie or Authorization: Bearer <jwt> header'
    }, 401);
  }

  // Set user context
  c.set('user', authResult.user);
  c.set('authMethod', authResult.method);
  
  console.log(`[AUTH-MIDDLEWARE] ✅ User authenticated via ${authResult.method}:`, authResult.user.email);
  await next();
});

app.use("/api/notifications/*", async (c, next) => {
  const authResult = await hybridAuth(c);

  if (!authResult.success) {
    return c.json({ 
      error: 'Unauthorized',
      message: authResult.error,
      hint: 'Use session cookie or Authorization: Bearer <jwt> header'
    }, 401);
  }

  c.set('user', authResult.user);
  c.set('authMethod', authResult.method);
  
  console.log(`[AUTH-MIDDLEWARE] ✅ User authenticated via ${authResult.method}:`, authResult.user.email);
  await next();
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