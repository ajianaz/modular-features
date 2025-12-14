// Keycloak OAuth Provider Configuration
export interface KeycloakConfig {
  clientId: string;
  clientSecret: string;
  issuer: string;
  domain: string;
  redirectUri: string;
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

        return {
          id: userData.sub,
          email: userData.email,
          name: userData.name || userData.preferred_username,
          emailVerified: userData.email_verified || false,
          role: mapKeycloakRole(userData),
          avatar: userData.picture,
          username: userData.preferred_username,
        };
      } catch (error) {
        console.error('Keycloak user info error:', error);
        throw new Error('Failed to get user info');
      }
    },
    mapProfileToUser: async (profile: any) => {
      // Map Keycloak profile to our user format
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name || profile.preferred_username,
        emailVerified: profile.email_verified || false,
        role: mapKeycloakRole(profile),
        avatar: profile.picture,
        username: profile.preferred_username,
      };
    },
  };
};

// Helper function to map Keycloak roles to our system roles
function mapKeycloakRole(userData: any): 'user' | 'admin' | 'super_admin' {
  const roles = userData.roles || [];

  if (roles.includes('super_admin') || roles.includes('administrator')) {
    return 'super_admin';
  }

  if (roles.includes('admin') || roles.includes('manager')) {
    return 'admin';
  }

  return 'user';
}

// Export default configuration function
export const createKeycloakProvider = (config: KeycloakConfig) => {
  return {
    keycloak: keycloakProvider(config)
  };
};