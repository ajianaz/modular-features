import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, keycloak } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';
import { users, sessions, oauthAccounts, emailVerifications } from '@modular-monolith/database';

console.log('[BETTERAUTH] Initializing BetterAuth configuration...')
console.log('[BETTERAUTH] Database URL:', config.database.url)
console.log('[BETTERAUTH] BetterAuth URL:', config.auth.betterAuth.url)
console.log('[BETTERAUTH] Keycloak URL:', config.auth.keycloak.url)
console.log('[BETTERAUTH] Database instance available:', !!db)

// BetterAuth configuration with Keycloak integration
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false, // Use plural table names (users, sessions, etc.)
    schema: {
      user: users,
      session: sessions,
      oauthAccount: oauthAccounts,
      emailVerification: emailVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.KEYCLOAK_CLIENT_ID || config.auth.keycloak.clientId,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || config.auth.keycloak.clientSecret,
          issuer: process.env.KEYCLOAK_ISSUER || `${config.auth.keycloak.url}/realms/${config.auth.keycloak.realm}`,
          scopes: ['openid', 'email', 'profile'],
          redirectURI: process.env.KEYCLOAK_REDIRECT_URI || `${config.auth.betterAuth.url}/api/auth/oauth2/callback/keycloak`
        })
      ]
    })
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  user: {
    modelName: 'users', // Explicitly set table name
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
      }
    }
  },
  account: {
    modelName: 'oauth_accounts',
    fields: {
      providerId: 'provider', // Map BetterAuth's providerId to our provider field
      accountId: 'providerAccountId', // Map BetterAuth's accountId to our providerAccountId field
      accessTokenExpiresAt: 'tokenExpiresAt', // Map BetterAuth's accessTokenExpiresAt to our tokenExpiresAt field
    }
  },
  verification: {
    modelName: 'email_verifications',
    fields: {
      identifier: 'email', // Map BetterAuth's identifier to our email field
      value: 'token', // Map BetterAuth's value to our token field
    }
  },
  jwt: {
    expiresIn: 60 * 15, // 15 minutes
    secret: config.auth.jwt.secret
  },
  callbacks: {
    signIn: async ({ user, account }: any) => {
      // Sync user from external provider to local database
      if (account?.provider === 'keycloak') {
        // Update user with Keycloak data
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: true,
            role: user.role || 'user'
          }
        };
      }
      return { user };
    },
    session: async ({ session, user }: any) => {
      // Customize session data
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
    generateId: true, // BetterAuth will generate UUIDs that are compatible with our schema
    cookiePrefix: 'better-auth', // Custom cookie prefix
    idGenerator: 'uuid' // Use UUID generator for primary keys
  }
});

console.log('[BETTERAUTH] ✅ BetterAuth configuration completed successfully')

// Export auth instance for use in routes and middleware
export default auth;