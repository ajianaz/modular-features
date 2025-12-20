import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, keycloak, jwt } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';
import { users, sessions, oauthAccounts, emailVerifications } from '@modular-monolith/database';
import { RS256KeyManager } from './RS256KeyManager';
import * as crypto from 'crypto';

console.log('[BETTERAUTH] Initializing BetterAuth configuration...')
console.log('[BETTERAUTH] Database URL:', config.database.url)
console.log('[BETTERAUTH] BetterAuth URL:', config.auth.betterAuth.url)
console.log('[BETTERAUTH] Keycloak URL:', config.auth.keycloak.url)
console.log('[BETTERAUTH] Database instance available:', !!db)
console.log('[BETTERAUTH] RS256 tokens enabled:', process.env.ENABLE_RS256_TOKENS === 'true')
console.log('[BETTERAUTH] Keycloak as Source of Truth: ENABLED')

// RS256 Key Manager for Better Auth
const rs256KeyManager = new RS256KeyManager();

// BetterAuth configuration with Keycloak as Source of Truth
export const auth = betterAuth({
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

  // Disable email/password when using Keycloak as primary auth
  emailAndPassword: {
    enabled: process.env.ENABLE_EMAIL_PASSWORD_AUTH === 'true', // Disabled by default
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },

  plugins: [
    // JWT plugin with RS256 support
    ...(process.env.ENABLE_RS256_TOKENS === 'true' ? [{
      ...jwt(),
      jwks: {
        keyPairConfig: {
          alg: 'RS256',
          modulusLength: 2048
        },
        adapter: {
          getJwks: async () => {
            const publicKeyPem = rs256KeyManager.getPublicKey();
            const jwk = pemToJWK(publicKeyPem, rs256KeyManager.getKeyId());
            return { keys: [jwk] };
          },
          getLatestKey: async () => {
            const publicKeyPem = rs256KeyManager.getPublicKey();
            const jwk = pemToJWK(publicKeyPem, rs256KeyManager.getKeyId());
            return { keys: [jwk] };
          }
        }
      },
      jwt: {
        // IMPORTANT: sub must be Keycloak user ID (not local database ID)
        definePayload: ({ user, session }: any) => {
          return {
            sub: user.id, // This is Keycloak sub when user comes from Keycloak
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            auth_provider: user.authProvider || 'keycloak',
            auth_method: user.authMethod || 'oauth',
            session_id: session.id,
            type: 'access'
          };
        },
        issuer: 'modular-monolith',
        audience: 'modular-monolith-api',
        expirationTime: '3h'
      }
    }] : []),

    // Keycloak OAuth integration - wrapped in genericOAuth (CORRECT WAY!)
    ...(process.env.ENABLE_KEYCLOAK === 'true' ? [
      genericOAuth({
        config: [
          keycloak({
            clientId: process.env.KEYCLOAK_CLIENT_ID || config.auth.keycloak.clientId,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || config.auth.keycloak.clientSecret,
            issuer: process.env.KEYCLOAK_ISSUER || `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}`,
            scopes: ['openid', 'email', 'profile'],
            redirectURI: process.env.KEYCLOAK_REDIRECT_URI || `http://localhost:3000/api/auth/oauth/keycloak/callback`
          })
        ]
      })
    ] : [])
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },

  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false
      },
      username: {
        type: 'string',
        required: false,
        input: true
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'active',
        input: false
      },
      authProvider: {
        type: 'string',
        required: false,
        defaultValue: 'keycloak',
        input: false
      },
      authMethod: {
        type: 'string',
        required: false,
        defaultValue: 'oauth',
        input: false
      }
    }
  },

  account: {
    modelName: 'oauth_accounts',
    fields: {
      providerId: 'provider',
      accountId: 'providerAccountId',
      accessTokenExpiresAt: 'tokenExpiresAt',
    }
  },

  jwt: {
    expiresIn: 60 * 15,
    secret: config.auth.jwt.secret,
    ...(process.env.ENABLE_RS256_TOKENS === 'true' ? {
      algorithm: 'RS256',
      privateKey: rs256KeyManager.getPrivateKey(),
      publicKey: rs256KeyManager.getPublicKey(),
      keyId: rs256KeyManager.getKeyId()
    } : {})
  },

  // CRITICAL: Callbacks to ensure Keycloak sub becomes user ID
  callbacks: {
    // IMPORTANT: This callback ensures Keycloak sub is used as user ID
    signIn: async ({ user, account }: any) => {
      console.log('[BETTERAUTH-SIGNIN] Processing sign-in callback');
      console.log('[BETTERAUTH-SIGNIN] Account provider:', account?.provider);
      console.log('[BETTERAUTH-SIGNIN] User ID from provider:', user?.id);

      if (account?.provider === 'keycloak') {
        // CRITICAL: Use Keycloak sub as user ID
        // The user.id here is actually the Keycloak sub from the OAuth flow
        const keycloakSub = user.id;

        console.log('[BETTERAUTH-SIGNIN] Keycloak sub:', keycloakSub);
        console.log('[BETTERAUTH-SIGNIN] Using Keycloak sub as user ID');

        return {
          user: {
            id: keycloakSub, // Use Keycloak sub as primary key
            email: user.email,
            name: user.name,
            emailVerified: true,
            role: mapKeycloakRoleToSystemRole(user),
            username: user.preferred_username || user.email?.split('@')[0],
            status: 'active',
            authProvider: 'keycloak',
            authMethod: 'oauth'
          }
        };
      }

      // Fallback for other providers or email/password
      return {
        user: {
          ...user,
          role: user.role || 'user',
          status: user.status || 'active'
        }
      };
    },

    session: async ({ session, user }: any) => {
      console.log('[BETTERAUTH-SESSION] Creating session for user:', user.id);
      return {
        session: {
          userId: session.userId,
          expiresAt: session.expiresAt,
          lastAccessedAt: new Date()
        }
      };
    }
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false
    },
    generateId: false, // IMPORTANT: Don't generate IDs, use Keycloak sub
    cookiePrefix: 'better-auth',
    idGenerator: (provider: string) => {
      // When using Keycloak, return the Keycloak sub
      // This is called during account linking
      if (provider === 'keycloak') {
        // Return null to let BetterAuth use the account ID (Keycloak sub)
        return null;
      }
      // For other providers, generate UUID
      return crypto.randomUUID();
    }
  }
});

console.log('[BETTERAUTH] ✅ BetterAuth configuration completed successfully')
console.log('[BETTERAUTH] Keycloak is configured as Source of Truth')
console.log('[BETTERAUTH] User IDs will be Keycloak subs')

/**
 * Map Keycloak roles to system roles
 */
function mapKeycloakRoleToSystemRole(user: any): 'user' | 'admin' | 'super_admin' {
  // Check roles from Keycloak token or resource_access
  const roles = user.roles || user.realm_access?.roles || user.resource_access || [];

  if (Array.isArray(roles)) {
    if (roles.includes('super_admin') || roles.includes('administrator')) {
      return 'super_admin';
    }
    if (roles.includes('admin') || roles.includes('manager')) {
      return 'admin';
    }
  }

  // Default role
  return 'user';
}

/**
 * Convert PEM to JWK format
 */
function pemToJWK(pemKey: string, kid: string): any {
  try {
    const publicKeyObject = crypto.createPublicKey(pemKey);
    const publicKeyExport = publicKeyObject.export({
      format: 'jwk'
    });

    return {
      ...publicKeyExport,
      kid: kid,
      alg: 'RS256',
      use: 'sig'
    };
  } catch (error) {
    console.error('[BETTERAUTH] Error converting PEM to JWK:', error);
    return {
      kty: 'RSA',
      alg: 'RS256',
      use: 'sig',
      kid: kid,
      n: 'fallback_modulus',
      e: 'AQAB'
    };
  }
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

export default auth;
export { rs256KeyManager };
