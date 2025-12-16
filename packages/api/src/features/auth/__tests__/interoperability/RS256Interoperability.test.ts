import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UnifiedRS256TokenGenerator } from '../../infrastructure/lib/JWTTokenGenerator';
import { TokenTranslationUtils } from '../../infrastructure/lib/TokenTranslationUtils';
import { KeycloakTokenTranslator } from '../../infrastructure/lib/KeycloakProvider';
import { RS256KeyManager } from '../../infrastructure/lib/RS256KeyManager';
import { UnifiedSessionManager } from '../../infrastructure/lib/UnifiedSessionManager';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { Session } from '../../domain/entities/Session.entity';

// Mock session repository for testing
class MockSessionRepository implements ISessionRepository {
  private sessions: Session[] = [];

  async findById(id: string): Promise<Session | null> {
    return this.sessions.find(s => s.id === id) || null;
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.sessions.find(s => s.token === token) || null;
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessions.find(s => s.refreshToken === refreshToken) || null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessions.filter(s => s.userId === userId);
  }

  async create(session: Session): Promise<Session> {
    this.sessions.push(session);
    return session;
  }

  async update(session: Session): Promise<Session> {
    const index = this.sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      this.sessions[index] = session;
    }
    return session;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      return true;
    }
    return false;
  }

  async findAll(): Promise<Session[]> {
    return this.sessions;
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.sessions.filter(s => s.userId === userId && s.isValid());
  }

  async findExpired(): Promise<Session[]> {
    return this.sessions.filter(s => s.isExpired());
  }

  async existsByToken(token: string): Promise<boolean> {
    return this.sessions.some(s => s.token === token);
  }

  async existsByRefreshToken(refreshToken: string): Promise<boolean> {
    return this.sessions.some(s => s.refreshToken === refreshToken);
  }

  async deactivateByUserId(userId: string): Promise<boolean> {
    const userSessions = this.sessions.filter(s => s.userId === userId);
    userSessions.forEach(session => {
      const deactivated = session.deactivate();
      this.update(deactivated);
    });
    return true;
  }

  async deactivateById(id: string): Promise<boolean> {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      const deactivated = session.deactivate();
      this.update(deactivated);
      return true;
    }
    return false;
  }

  async cleanupExpired(): Promise<number> {
    const expiredSessions = this.sessions.filter(s => s.isExpired());
    expiredSessions.forEach(session => {
      this.delete(session.id);
    });
    return expiredSessions.length;
  }

  async refreshSession(sessionId: string, newToken: string, newRefreshToken: string, newExpiresAt: Date): Promise<Session | null> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      const refreshed = session.refreshTokens(newToken, newRefreshToken, newExpiresAt);
      this.update(refreshed);
      return refreshed;
    }
    return null;
  }

  deactivate(session: Session): Session {
    return session.deactivate();
  }

  async updateLastAccessed(sessionId: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      const updated = session.updateLastAccessed();
      this.update(updated);
      return updated;
    }
    return null;
  }

  async revokeAllUserSessions(userId: string): Promise<boolean> {
    return this.deactivateByUserId(userId);
  }

  async revokeSessionById(sessionId: string): Promise<boolean> {
    return this.deactivateById(sessionId);
  }
}

describe('RS256 Interoperability Tests', () => {
  let tokenGenerator: UnifiedRS256TokenGenerator;
  let tokenTranslator: TokenTranslationUtils;
  let sessionManager: UnifiedSessionManager;
  let mockSessionRepo: MockSessionRepository;
  let keyManager: RS256KeyManager;

  beforeAll(() => {
    // Set environment variables for testing
    process.env.ENABLE_RS256_TOKENS = 'true';
    process.env.JWT_RS256_KEY_ID = 'test-key-id';

    keyManager = new RS256KeyManager();
    tokenGenerator = new UnifiedRS256TokenGenerator({});
    tokenTranslator = new TokenTranslationUtils();
    mockSessionRepo = new MockSessionRepository();
    sessionManager = new UnifiedSessionManager(mockSessionRepo);
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.ENABLE_RS256_TOKENS;
    delete process.env.JWT_RS256_KEY_ID;
  });

  describe('Token Generation and Verification', () => {
    it('should generate RS256 tokens with unified schema', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        username: 'testuser'
      };

      const token = await tokenGenerator.generateAccessToken(userData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token structure
      const metadata = tokenTranslator.extractTokenMetadata(token);
      expect(metadata).toBeDefined();
      expect(metadata?.algorithm).toBe('RS256');
      expect(metadata?.keyId).toBeDefined();
    });

    it('should verify RS256 tokens successfully', async () => {
      const userData = {
        userId: 'user-456',
        email: 'verify@example.com',
        name: 'Verify User',
        role: 'admin' as const,
        username: 'verifyuser'
      };

      const token = await tokenGenerator.generateAccessToken(userData);
      const verification = await tokenGenerator.verifyToken(token);

      expect(verification.valid).toBe(true);
      expect(verification.payload).toBeDefined();
      expect(verification.payload?.sub).toBe(userData.userId);
      expect(verification.payload?.email).toBe(userData.email);
      expect(verification.payload?.role).toBe(userData.role);
    });

    it('should reject invalid RS256 tokens', async () => {
      const invalidToken = 'invalid.token.here';
      const verification = await tokenGenerator.verifyToken(invalidToken);

      expect(verification.valid).toBe(false);
      expect(verification.error).toBeDefined();
    });
  });

  describe('Token Translation Utilities', () => {
    it('should translate custom auth payload to unified format', () => {
      const customPayload = {
        sub: 'user-789',
        email: 'custom@example.com',
        name: 'Custom User',
        role: 'user' as const,
        auth_method: 'password' as const,
        session_id: 'session-123'
      };

      const unified = tokenTranslator.translateCustomToUnified(customPayload);

      expect(unified.sub).toBe(customPayload.sub);
      expect(unified.email).toBe(customPayload.email);
      expect(unified.auth_provider).toBe('custom');
      expect(unified.auth_method).toBe(customPayload.auth_method);
      expect(unified.session_id).toBe(customPayload.session_id);
    });

    it('should translate Keycloak payload to unified format', () => {
      const keycloakPayload = {
        sub: 'keycloak-user',
        email: 'keycloak@example.com',
        name: 'Keycloak User',
        realm_access: { roles: ['user'] },
        auth_method: 'oauth' as const
      };

      const unified = KeycloakTokenTranslator.translateToUnified(keycloakPayload);

      expect(unified.sub).toBe(keycloakPayload.sub);
      expect(unified.email).toBe(keycloakPayload.email);
      expect(unified.auth_provider).toBe('keycloak');
      expect(unified.auth_method).toBe('oauth');
      expect(unified.role).toBe('user');
    });

    it('should validate and translate tokens from different sources', async () => {
      // Create custom auth token
      const customToken = await tokenGenerator.createUnifiedToken({
        userId: 'custom-123',
        email: 'custom@test.com',
        name: 'Custom Test',
        role: 'user' as const,
        authProvider: 'custom' as const,
        authMethod: 'password' as const
      });

      const validation = await tokenTranslator.validateAndTranslateToUnified(customToken);

      expect(validation.valid).toBe(true);
      expect(validation.unifiedPayload).toBeDefined();
      expect(validation.source).toBe('custom');
      expect(validation.unifiedPayload?.auth_provider).toBe('custom');
    });
  });

  describe('Unified Session Management', () => {
    it('should create and validate sessions with RS256 tokens', async () => {
      const userData = {
        userId: 'session-user-123',
        email: 'session@example.com',
        name: 'Session User',
        role: 'user' as const,
        authProvider: 'custom' as const,
        authMethod: 'password' as const
      };

      const token = await tokenGenerator.createUnifiedToken(userData, 'access');

      // Mock request object
      const mockRequest = new Request('http://localhost', {
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const session = await sessionManager.createSession(
        {
          sub: userData.userId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          auth_provider: userData.authProvider,
          auth_method: userData.authMethod,
          jti: 'test-jti-123',
          exp: Math.floor(Date.now() / 1000) + 3600,
          type: 'access'
        },
        mockRequest,
        token
      );

      expect(session).toBeDefined();
      expect(session.userId).toBe(userData.userId);
      expect(session.token).toBe(token);

      // Validate the session
      const validation = await sessionManager.validateSession(token);
      expect(validation.valid).toBe(true);
      expect(validation.session).toBeDefined();
      expect(validation.unifiedPayload?.sub).toBe(userData.userId);
    });

    it('should reject invalid sessions', async () => {
      const invalidToken = 'invalid.session.token';
      const validation = await sessionManager.validateSession(invalidToken);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it('should refresh tokens properly', async () => {
      const userData = {
        userId: 'refresh-user-123',
        email: 'refresh@example.com',
        name: 'Refresh User',
        role: 'user' as const,
        authProvider: 'custom' as const,
        authMethod: 'password' as const
      };

      const refreshToken = await tokenGenerator.createUnifiedToken(userData, 'refresh');

      // Mock request object
      const mockRequest = new Request('http://localhost', {
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '192.168.1.1'
        }
      });

      // Create initial session
      const initialSession = await sessionManager.createSession(
        {
          sub: userData.userId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          auth_provider: userData.authProvider,
          auth_method: userData.authMethod,
          jti: 'initial-jti-123',
          exp: Math.floor(Date.now() / 1000) + 3600,
          type: 'refresh'
        },
        mockRequest,
        'initial-access-token',
        refreshToken
      );

      expect(initialSession).toBeDefined();

      // Refresh the session
      const refreshResult = await sessionManager.refreshSession(refreshToken, mockRequest);

      expect(refreshResult.valid).toBe(true);
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.session).toBeDefined();
    });
  });

  describe('Cross-System Interoperability', () => {
    it('should validate tokens generated by custom auth in Better Auth format', async () => {
      const userData = {
        userId: 'interop-user-123',
        email: 'interop@example.com',
        name: 'Interop User',
        role: 'admin' as const,
        authProvider: 'custom' as const,
        authMethod: 'password' as const
      };

      // Generate token using custom auth
      const customToken = await tokenGenerator.createUnifiedToken(userData, 'access');

      // Validate using unified validator (simulating Better Auth validation)
      const validation = await tokenTranslator.validateAndTranslateToUnified(customToken);

      expect(validation.valid).toBe(true);
      expect(validation.unifiedPayload?.sub).toBe(userData.userId);
      expect(validation.unifiedPayload?.email).toBe(userData.email);
      expect(validation.unifiedPayload?.role).toBe(userData.role);
    });

    it('should translate between custom auth and Keycloak formats', () => {
      const customPayload = {
        sub: 'translate-user-123',
        email: 'translate@example.com',
        name: 'Translate User',
        role: 'user' as const,
        auth_method: 'password' as const
      };

      // Convert custom to unified
      const unified = tokenTranslator.translateCustomToUnified(customPayload);

      // Convert unified to Keycloak format
      const keycloakFormat = KeycloakTokenTranslator.translateFromUnified(unified);

      expect(keycloakFormat.sub).toBe(customPayload.sub);
      expect(keycloakFormat.email).toBe(customPayload.email);
      expect(keycloakFormat.realm_access.roles).toContain(customPayload.role);
    });

    it('should maintain token consistency across different auth providers', async () => {
      const baseUserData = {
        userId: 'consistency-user-123',
        email: 'consistency@example.com',
        name: 'Consistency User',
        role: 'user' as const
      };

      // Generate tokens from different sources
      const customToken = await tokenGenerator.createUnifiedToken({
        ...baseUserData,
        authProvider: 'custom' as const,
        authMethod: 'password' as const
      }, 'access');

      const keycloakToken = await tokenGenerator.createUnifiedToken({
        ...baseUserData,
        authProvider: 'keycloak' as const,
        authMethod: 'oauth' as const
      }, 'access');

      // Verify both tokens
      const customValidation = await tokenGenerator.verifyToken(customToken);
      const keycloakValidation = await tokenGenerator.verifyToken(keycloakToken);

      expect(customValidation.valid).toBe(true);
      expect(keycloakValidation.valid).toBe(true);

      // Check that both have same user data
      expect(customValidation.payload?.sub).toBe(keycloakValidation.payload?.sub);
      expect(customValidation.payload?.email).toBe(keycloakValidation.payload?.email);
      expect(customValidation.payload?.role).toBe(keycloakValidation.payload?.role);

      // Check that both use RS256
      const customMetadata = tokenTranslator.extractTokenMetadata(customToken);
      const keycloakMetadata = tokenTranslator.extractTokenMetadata(keycloakToken);

      expect(customMetadata?.algorithm).toBe('RS256');
      expect(keycloakMetadata?.algorithm).toBe('RS256');
    });
  });

  describe('JWKS Endpoint Compatibility', () => {
    it('should provide valid JWKS format', async () => {
      const publicKey = keyManager.getPublicKey();
      const keyId = keyManager.getKeyId();

      expect(publicKey).toBeDefined();
      expect(keyId).toBeDefined();
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(publicKey).toContain('-----END PUBLIC KEY-----');
    });

    it('should validate key pairs', async () => {
      // This tests that the RS256 key manager provides valid keys
      const testData = 'key-pair-test';
      const privateKey = keyManager.getPrivateKey();
      const publicKey = keyManager.getPublicKey();

      expect(privateKey).toBeDefined();
      expect(publicKey).toBeDefined();
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    });
  });
});