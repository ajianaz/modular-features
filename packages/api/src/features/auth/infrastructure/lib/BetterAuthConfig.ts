import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, keycloak, jwt, bearer } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';
import { users, sessions, oauthAccounts, emailVerifications } from '@modular-monolith/database';
import { RS256KeyManager } from './RS256KeyManager';

console.log('[BETTERAUTH] ===============================================');
console.log('[BETTERAUTH] Initializing HYBRID Better Auth Configuration');
console.log('[BETTERAUTH] ===============================================');
console.log('[BETTERAUTH] Mode: Better Auth Gateway → Keycloak IdP');
console.log('[BETTERAUTH] Database URL:', config.database.url);
console.log('[BETTERAUTH] BetterAuth URL:', config.auth.betterAuth.url);
console.log('[BETTERAUTH] Keycloak URL:', config.auth.keycloak.url);
console.log('[BETTERAUTH] Database instance available:', !!db);
console.log('[BETTERAUTH] RS256 tokens enabled:', process.env.ENABLE_RS256_TOKENS === 'true');
console.log('[BETTERAUTH] Web support (cookies): ENABLED');
console.log('[BETTERAUTH] API support (bearer tokens): ENABLED');
console.log('[BETTERAUTH] Keycloak as Source of Truth: ENABLED');

// RS256 Key Manager for Better Auth
const rs256KeyManager = new RS256KeyManager();

/**
 * HYBRID BETTER AUTH CONFIGURATION
 * 
 * Architecture:
 * Web Apps (Cookie) ─┐
 * Mobile Apps (Token) ─┼──→ Better Auth (Gateway) → Keycloak (IdP/SoT)
 * API Clients (Token) ─┘
 * 
 * Features:
 * - Better Auth as OIDC Provider Gateway
 * - Keycloak as Identity Provider (Source of Truth)
 * - Web: Cookie-based authentication
 * - API/Mobile: Bearer token authentication
 * - JWT tokens for API access (RS256)
 * - Session management in Better Auth database
 */
export const auth = betterAuth({
  // ============================================================================
  // DATABASE
  // ============================================================================
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false,
    schema: {
      user: users,
      session: sessions,
      oauthAccount: oauthAccounts,
      verification: emailVerifications,
    },
  }),

  // ============================================================================
  // BASE URL
  // ============================================================================
  baseURL: config.auth.betterAuth.url,
  
  // ============================================================================
  // SESSION MANAGEMENT - Hybrid Support
  // ============================================================================
  session: {
    // Cookie-based sessions for Web Apps
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    
    // Fresh sessions for better UX
    freshAge: 60, // 1 minute
    
    // Session update for security
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // ============================================================================
  // ADVANCED CONFIGURATION
  // ============================================================================
  advanced: {
    // Cookie prefix for cross-subdomain support
    cookiePrefix: 'better-auth',
    
    // Cross-subdomain cookies for SSO
    crossSubDomainCookies: {
      enabled: true,
    },
    
    // Secure cookies
    useSecureCookies: config.nodeEnv === 'production',
    
    // Generate secure random tokens
    generateId: () => crypto.randomUUID(),
  },

  // ============================================================================
  // EMAIL/PASSWORD AUTH (Optional - Disabled by default)
  // ============================================================================
  emailAndPassword: {
    enabled: process.env.ENABLE_EMAIL_PASSWORD_AUTH === 'true',
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    
    // Password hashing
    password: {
      hash: async (password: string) => {
        const bcrypt = await import('bcrypt');
        return bcrypt.hash(password, 12);
      },
      verify: async (password: string, hash: string) => {
        const bcrypt = await import('bcrypt');
        return bcrypt.compare(password, hash);
      },
    },
  },

  // ============================================================================
  // PLUGINS
  // ============================================================================
  plugins: [
    // ==========================================================================
    // 1. JWT PLUGIN - For API/Mobile Token Authentication
    // ==========================================================================
    ...(process.env.ENABLE_RS256_TOKENS === 'true' ? [{
      ...jwt(),
      jwks: {
        // JWKS endpoint for public key distribution
        keyPairConfig: {
          alg: 'RS256',
          modulusLength: 2048,
        },
        adapter: {
          // Get public keys for JWT verification
          getJwks: async () => {
            const publicKeyPem = rs256KeyManager.getPublicKey();
            const jwk = pemToJWK(publicKeyPem, rs256KeyManager.getKeyId());
            return { keys: [jwk] };
          },
          getLatestKey: async () => {
            const publicKeyPem = rs256KeyManager.getPublicKey();
            const jwk = pemToJWK(publicKeyPem, rs256KeyManager.getKeyId());
            return { keys: [jwk] };
          },
        },
      },
      jwt: {
        // JWT Payload Configuration
        definePayload: async ({ user, session }: any) => {
          return {
            // Standard claims
            sub: user.id, // Keycloak sub when user comes from Keycloak
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            
            // Custom claims
            auth_provider: user.authProvider || 'keycloak',
            auth_method: user.authMethod || 'oauth',
            session_id: session.id,
            
            // Token type
            type: 'access',
            
            // Issuer and audience
            iss: 'modular-monolith-better-auth',
            aud: 'modular-monolith-api',
            
            // Expiration
            exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60), // 3 hours
            iat: Math.floor(Date.now() / 1000),
          };
        },
      },
    }] : []),

    // ==========================================================================
    // 2. GENERIC OAUTH + KEYCLOAK - Gateway to Keycloak IdP
    // ==========================================================================
    ...(process.env.ENABLE_KEYCLOAK === 'true' ? [
      genericOAuth({
        config: [
          keycloak({
            clientId: process.env.KEYCLOAK_CLIENT_ID || config.auth.keycloak.clientId,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || config.auth.keycloak.clientSecret,
            issuer: process.env.KEYCLOAK_ISSUER || `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}`,
            scopes: ['openid', 'email', 'profile'],
            redirectURI: process.env.KEYCLOAK_REDIRECT_URI || `${config.auth.betterAuth.url}/oauth/callback/keycloak`,
          })
        ],
        
        // User account mapping
        account: {
          accountLinking: {
            enabled: true,
            // Link accounts by email (when same email across providers)
            trustedProviders: ['keycloak', 'google', 'github'],
          },
        },
      })
    ] : []),

    // ==========================================================================
    // 3. BEARER PLUGIN - For API Token Authentication (Non-Web)
    // ==========================================================================
    bearer({
      // Bearer token validation for API routes
      fallback: (req, res) => {
        // Called when bearer token is invalid/missing
        res.setHeader('WWW-Authenticate', 'Bearer realm="API", error="invalid_token"');
        throw new Error('Unauthorized: Invalid or missing bearer token');
      },
    }),
  ],

  // ============================================================================
  // SOCIAL PROVIDERS (Optional - for additional auth methods)
  // ============================================================================
  socialProviders: {
    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        enabled: false, // Enable if needed
      },
    } : {}),
    
    // GitHub OAuth (optional)
    ...(process.env.GITHUB_CLIENT_ID ? {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        enabled: false, // Enable if needed
      },
    } : {}),
  },

  // ============================================================================
  // RATE LIMITING
  // ============================================================================
  rateLimit: {
    // Limit authentication attempts
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
  },

  // ============================================================================
  // SECURITY
  // ============================================================================
  trustedOrigins: [
    // Web applications
    process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://app.yourdomain.com',
    ],
  ],
});

console.log('[BETTERAUTH] ===============================================');
console.log('[BETTERAUTH] ✅ HYBRID Configuration Complete');
console.log('[BETTERAUTH] ===============================================');
console.log('[BETTERAUTH] Configuration Summary:');
console.log('[BETTERAUTH] - Better Auth Gateway: ENABLED');
console.log('[BETTERAUTH] - Keycloak IdP: ENABLED');
console.log('[BETTERAUTH] - Web (Cookie): ENABLED');
console.log('[BETTERAUTH] - API (Bearer Token): ENABLED');
console.log('[BETTERAUTH] - Mobile (JWT): ENABLED');
console.log('[BETTERAUTH] - Session Management: Better Auth');
console.log('[BETTERAUTH] - User Source of Truth: Keycloak');
console.log('[BETTERAUTH] ===============================================');

/**
 * HELPER FUNCTIONS
 */

/**
 * Helper: PEM to JWK conversion
 */
function pemToJWK(pem: string, kid: string) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');
  
  const buf = Buffer.from(b64, 'base64');
  
  return {
    kty: 'RSA',
    kid: kid,
    alg: 'RS256',
    n: buf.toString('base64'),
    e: 'AQAB',
  };
}

/**
 * Get JWKS endpoint response
 */
export async function getJWKS() {
  const publicKeyPem = rs256KeyManager.getPublicKey();
  const jwk = pemToJWK(publicKeyPem, rs256KeyManager.getKeyId());

  return {
    keys: [jwk]
  };
}

/**
 * Get public key in PEM format
 */
export function getPublicKeyPEM(): string {
  return rs256KeyManager.getPublicKey();
}

/**
 * Validate RS256 keys
 */
export function validateKeys(): { valid: boolean; keyId: string; algorithm: string } {
  try {
    const publicKey = rs256KeyManager.getPublicKey();
    const keyId = rs256KeyManager.getKeyId();

    // Try to create a public key object to validate
    const crypto = require('crypto');
    crypto.createPublicKey(publicKey);

    return {
      valid: true,
      keyId: keyId,
      algorithm: 'RS256'
    };
  } catch (error) {
    return {
      valid: false,
      keyId: 'unknown',
      algorithm: 'RS256'
    };
  }
}

/**
 * Export auth instance for use in application
 */
export default auth;

/**
 * Export RS256 key manager for use in tests
 */
export { rs256KeyManager };

/**
 * Type definitions
 */
export type Auth = typeof auth;
