import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, keycloak } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';

console.log('[BETTERAUTH] Initializing BetterAuth configuration...')
console.log('[BETTERAUTH] Database URL:', config.database.url)
console.log('[BETTERAUTH] BetterAuth URL:', config.auth.betterAuth.url)
console.log('[BETTERAUTH] Keycloak URL:', config.auth.keycloak.url)
console.log('[BETTERAUTH] Database instance available:', !!db)

// BetterAuth configuration with Keycloak integration
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
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
    }
  }
});

console.log('[BETTERAUTH] ✅ BetterAuth configuration completed successfully')

// Export auth instance for use in routes and middleware
export default auth;