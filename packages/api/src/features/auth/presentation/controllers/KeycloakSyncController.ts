import { Context } from 'hono';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { db } from '@modular-monolith/database';
import { users } from '@modular-monolith/database';
import { eq } from 'drizzle-orm';
import { config } from '@modular-monolith/shared';

/**
 * Keycloak Sync Controller
 * Handles syncing Keycloak JWT to BetterAuth session using JWKS endpoint
 */
export class KeycloakSyncController {
  // JWKS client for fetching Keycloak public keys
  private static client = jwksClient({
    jwksUri: `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}/protocol/openid-connect/certs`,
    cache: true,
    cacheMaxAge: 600000, // 10 minutes
    rateLimit: true,
    jwksRequestsPerMinute: 10
  });

  /**
   * Get signing key from JWKS endpoint
   */
  private static getSigningKey = (header: jwt.JwtHeader, callback: any) => {
    this.client.getSigningKey(header.kid, (err: any, key: any) => {
      if (err) {
        console.error('[KEYCLOAK-JWKS] Error getting signing key:', err);
        return callback(err, undefined);
      }
      
      const signingKey = key.publicKey || key.rsaPublicKey;
      console.log('[KEYCLOAK-JWKS] Successfully retrieved signing key');
      callback(null, signingKey);
    });
  };

  /**
   * Sign in with Keycloak JWT
   * POST /api/auth/sign-in/keycloak
   *
   * Flow:
   * 1. Validate Keycloak JWT using JWKS
   * 2. Extract user info (sub, email)
   * 3. Create/update user in database
   * 4. Create BetterAuth session
   * 5. Return session cookie or JWT
   */
  static async signIn(c: Context) {
    try {
      // Get Authorization header
      const authHeader = c.req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization token required' }, 401);
      }

      const keycloakJwt = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify Keycloak JWT using JWKS endpoint
      let decoded: any;
      try {
        decoded = jwt.verify(keycloakJwt, this.getSigningKey, {
          algorithms: ['RS256'],
          issuer: `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}`,
          audience: config.auth.keycloak.clientId
        });

        console.log('[KEYCLOAK-SYNC] JWT verified successfully:', {
          sub: decoded.sub,
          email: decoded.email,
          exp: decoded.exp
        });
      } catch (error: any) {
        console.error('[KEYCLOAK-SYNC] JWT verification failed:', error.message);
        return c.json({ 
          error: 'Invalid Keycloak token', 
          details: error.message 
        }, 401);
      }

      // Extract user info from JWT
      const keycloakSub = decoded.sub;
      const email = decoded.email;
      const name = decoded.name || decoded.preferred_username || email;
      const preferred_username = decoded.preferred_username || email?.split('@')[0];

      if (!keycloakSub || !email) {
        return c.json({ error: 'Invalid token: missing sub or email' }, 400);
      }

      console.log('[KEYCLOAK-SYNC] Syncing user:', { keycloakSub, email, name });

      // Check if user exists in database
      let user = await db.query.users.findFirst({
        where: eq(users.id, keycloakSub)
      });

      // Import BetterAuth
      const { auth: betterAuth } = await import('../../infrastructure/lib/BetterAuthConfig');

      // Create user if not exists
      if (!user) {
        console.log('[KEYCLOAK-SYNC] Creating new user with BetterAuth API');
        
        // Use BetterAuth API to create user
        const createUserResult = await betterAuth.api.signUp({
          body: {
            email: email,
            name: name,
            username: preferred_username,
            // Keycloak will handle password, so set random
            password: Math.random().toString(36).repeat(10),
          }
        });

        if (createUserResult?.user) {
          user = createUserResult.user;
        } else {
          // Fallback: create user directly in database
          const newUsers = await db.insert(users).values({
            id: keycloakSub,
            email: email,
            name: name,
            username: preferred_username,
            emailVerified: true,
            role: 'user',
            status: 'active',
          }).returning();
          
          user = newUsers[0];
        }
      }

      // Create BetterAuth session
      const session = await betterAuth.api.createSession({
        body: {
          userId: user.id,
        }
      });

      if (!session) {
        return c.json({ error: 'Failed to create session' }, 500);
      }

      // Return success
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
          expiresAt: session.expiresAt,
          token: session.token // JWT from BetterAuth
        },
        message: 'Successfully synced Keycloak token to BetterAuth session'
      }, 200);
    } catch (error: any) {
      console.error('[KEYCLOAK-SYNC] Error:', error);
      return c.json({
        error: 'Authentication failed',
        message: error.message
      }, 500);
    }
  }
}
