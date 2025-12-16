// Keycloak OAuth Provider Configuration
export interface KeycloakConfig {
  clientId: string;
  clientSecret: string;
  issuer: string;
  domain: string;
  redirectUri: string;
}

// Unified token payload interface for interoperability
export interface UnifiedTokenPayload {
  sub: string;           // User ID (UUID)
  iss: string;           // Issuer (modular-monolith)
  aud: string;           // Audience (api/web)
  exp: number;           // Expiration time
  iat: number;           // Issued at
  jti: string;           // JWT ID (unique identifier)
  nbf?: number;          // Not before

  // User Information
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  username?: string;

  // Authentication Context
  auth_provider: 'custom' | 'keycloak' | 'oauth';
  auth_method: 'password' | 'oauth' | 'sso';
  session_id?: string;    // For session tracking

  // Token Specific
  type: 'access' | 'refresh';
  scope?: string;         // OAuth scopes if applicable

  // Application Specific
  tenant_id?: string;     // Multi-tenancy support
  permissions?: string[];  // Fine-grained permissions
}

// Keycloak OAuth Provider for BetterAuth using Generic OAuth plugin
export const keycloakProvider = (config: KeycloakConfig): any => {
  const keycloakBaseUrl = `${config.issuer}/realms/${config.domain}`;

  return {
    providerId: 'keycloak',
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    issuer: config.issuer,
    discoveryUrl: `${keycloakBaseUrl}/.well-known/openid-configuration`,
    authorizationUrl: `${keycloakBaseUrl}/protocol/openid-connect/auth`,
    tokenUrl: `${keycloakBaseUrl}/protocol/openid-connect/token`,
    userInfoUrl: `${keycloakBaseUrl}/protocol/openid-connect/userinfo`,
    redirectUri: config.redirectUri,
    scopes: ['openid', 'email', 'profile'],
    pkce: true,
    getUserInfo: async (tokens: any) => {
      try {
        console.log('[KEYCLOAK] Fetching user info from Keycloak');

        // Get user info from Keycloak
        const userResponse = await fetch(`${keycloakBaseUrl}/protocol/openid-connect/userinfo`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user info from Keycloak');
        }

        const userData = await userResponse.json();
        console.log('[KEYCLOAK] User data received:', userData);

        // Map to unified token payload structure
        const unifiedUser = {
          id: userData.sub,
          email: userData.email,
          name: userData.name || userData.preferred_username,
          emailVerified: userData.email_verified || false,
          role: mapKeycloakRole(userData),
          avatar: userData.picture,
          username: userData.preferred_username,
          // Add unified schema fields
          auth_provider: 'keycloak' as const,
          auth_method: 'oauth' as const,
          scope: tokens.scope || 'openid email profile'
        };

        console.log('[KEYCLOAK] Mapped to unified format:', unifiedUser);
        return unifiedUser;
      } catch (error) {
        console.error('[KEYCLOAK] User info error:', error);
        throw new Error('Failed to get user info');
      }
    },
    mapProfileToUser: async (profile: any) => {
      console.log('[KEYCLOAK] Mapping profile to unified format:', profile);

      // Map Keycloak profile to our unified user format
      const unifiedProfile = {
        id: profile.sub,
        email: profile.email,
        name: profile.name || profile.preferred_username,
        emailVerified: profile.email_verified || false,
        role: mapKeycloakRole(profile),
        avatar: profile.picture,
        username: profile.preferred_username,
        // Add unified schema fields
        auth_provider: 'keycloak' as const,
        auth_method: 'oauth' as const,
        scope: profile.scope || 'openid email profile'
      };

      console.log('[KEYCLOAK] Profile mapped to unified format:', unifiedProfile);
      return unifiedProfile;
    },
    // Add token translation for interoperability
    translateToken: async (keycloakToken: any) => {
      console.log('[KEYCLOAK] Translating Keycloak token to unified format');

      // Extract user info from Keycloak token
      const keycloakPayload = keycloakToken.id_token ?
        JSON.parse(Buffer.from(keycloakToken.id_token.split('.')[1], 'base64').toString()) :
        keycloakToken;

      // Create unified token payload
      const unifiedPayload: UnifiedTokenPayload = {
        // Standard JWT claims
        sub: keycloakPayload.sub,
        iss: 'modular-monolith',
        aud: 'modular-monolith-api',
        exp: keycloakPayload.exp || Math.floor(Date.now() / 1000) + (3 * 60 * 60), // 3 hours default
        iat: keycloakPayload.iat || Math.floor(Date.now() / 1000),
        jti: keycloakPayload.jti || `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nbf: keycloakPayload.nbf,

        // User information
        email: keycloakPayload.email,
        name: keycloakPayload.name || keycloakPayload.preferred_username,
        role: mapKeycloakRole(keycloakPayload),
        username: keycloakPayload.preferred_username,

        // Authentication context
        auth_provider: 'keycloak',
        auth_method: 'oauth',
        session_id: keycloakPayload.session_state || keycloakPayload.sid,

        // Token specific
        type: 'access',
        scope: keycloakPayload.scope || 'openid email profile',

        // Application specific
        tenant_id: keycloakPayload.tenant_id,
        permissions: keycloakPayload.permissions || []
      };

      console.log('[KEYCLOAK] Token translated to unified format');
      return unifiedPayload;
    }
  };
};

// Helper function to map Keycloak roles to our system roles
function mapKeycloakRole(userData: any): 'user' | 'admin' | 'super_admin' {
  // Check multiple possible role sources in Keycloak
  const roles = userData.roles || userData.realm_access?.roles || userData.resource_access?.roles || [];

  console.log('[KEYCLOAK] Mapping roles:', roles);

  if (roles.includes('super_admin') || roles.includes('administrator') || roles.includes('root')) {
    console.log('[KEYCLOAK] Mapped role: super_admin');
    return 'super_admin';
  }

  if (roles.includes('admin') || roles.includes('manager') || roles.includes('moderator')) {
    console.log('[KEYCLOAK] Mapped role: admin');
    return 'admin';
  }

  console.log('[KEYCLOAK] Mapped role: user');
  return 'user';
}

// Token translation utilities for Better Auth interoperability
export class KeycloakTokenTranslator {
  /**
   * Translate Keycloak token to unified format
   */
  static translateToUnified(keycloakToken: any): UnifiedTokenPayload {
    console.log('[KEYCLOAK-TRANSLATOR] Translating Keycloak token to unified format');

    // Parse ID token if present
    let keycloakPayload = keycloakToken;
    if (keycloakToken.id_token) {
      try {
        const payload = keycloakToken.id_token.split('.')[1];
        keycloakPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      } catch (error) {
        console.error('[KEYCLOAK-TRANSLATOR] Failed to parse ID token:', error);
        keycloakPayload = keycloakToken;
      }
    }

    const unifiedPayload: UnifiedTokenPayload = {
      // Standard JWT claims
      sub: keycloakPayload.sub,
      iss: 'modular-monolith',
      aud: 'modular-monolith-api',
      exp: keycloakPayload.exp || Math.floor(Date.now() / 1000) + (3 * 60 * 60),
      iat: keycloakPayload.iat || Math.floor(Date.now() / 1000),
      jti: keycloakPayload.jti || `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nbf: keycloakPayload.nbf,

      // User information
      email: keycloakPayload.email,
      name: keycloakPayload.name || keycloakPayload.preferred_username,
      role: mapKeycloakRole(keycloakPayload),
      username: keycloakPayload.preferred_username,

      // Authentication context
      auth_provider: 'keycloak',
      auth_method: 'oauth',
      session_id: keycloakPayload.session_state || keycloakPayload.sid,

      // Token specific
      type: 'access',
      scope: keycloakPayload.scope || 'openid email profile',

      // Application specific
      tenant_id: keycloakPayload.tenant_id,
      permissions: keycloakPayload.permissions || []
    };

    console.log('[KEYCLOAK-TRANSLATOR] Token translated successfully');
    return unifiedPayload;
  }

  /**
   * Translate unified format to Keycloak-compatible format
   */
  static translateFromUnified(unifiedPayload: UnifiedTokenPayload): any {
    console.log('[KEYCLOAK-TRANSLATOR] Translating unified format to Keycloak format');

    const keycloakFormat = {
      // Standard JWT claims
      sub: unifiedPayload.sub,
      iss: unifiedPayload.iss,
      aud: unifiedPayload.aud,
      exp: unifiedPayload.exp,
      iat: unifiedPayload.iat,
      jti: unifiedPayload.jti,
      nbf: unifiedPayload.nbf,

      // User information
      email: unifiedPayload.email,
      name: unifiedPayload.name,
      preferred_username: unifiedPayload.username,
      email_verified: true,

      // Keycloak specific
      realm_access: {
        roles: [unifiedPayload.role]
      },
      scope: unifiedPayload.scope || 'openid email profile',

      // Application specific
      tenant_id: unifiedPayload.tenant_id,
      permissions: unifiedPayload.permissions || []
    };

    console.log('[KEYCLOAK-TRANSLATOR] Format translation completed');
    return keycloakFormat;
  }
}

// Export default configuration function
export const createKeycloakProvider = (config: KeycloakConfig) => {
  return {
    keycloak: keycloakProvider(config)
  };
};
