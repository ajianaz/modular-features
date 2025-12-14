import { betterAuth } from 'better-auth';
import { genericOAuth, keycloak } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';

// BetterAuth configuration with Keycloak integration
export const auth = betterAuth({
  database: {
    provider: 'pg',
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/modular_monolith'
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.KEYCLOAK_CLIENT_ID || '',
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
          issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/master',
          scopes: ['openid', 'email', 'profile'],
          redirectURI: process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth2/callback/keycloak'
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
    secret: process.env.JWT_SECRET || 'your-secret-key'
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

// Export auth instance for use in routes and middleware
export default auth;