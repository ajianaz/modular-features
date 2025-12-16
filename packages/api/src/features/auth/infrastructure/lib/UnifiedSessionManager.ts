import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { Session } from '../../domain/entities/Session.entity';
import { UnifiedTokenPayload } from './KeycloakProvider';
import { TokenTranslationUtils } from './TokenTranslationUtils';
import { RS256KeyManager } from './RS256KeyManager';

/**
 * Unified Session Manager for RS256 tokens
 * Handles sessions for both custom auth and Better Auth with unified token schema
 */
export interface UnifiedSessionInfo {
  id: string;
  userId: string;
  tokenJTI: string;
  authProvider: 'custom' | 'keycloak' | 'oauth';
  authMethod: 'password' | 'oauth' | 'sso';
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  tenantId?: string;
  permissions?: string[];
}

export class UnifiedSessionManager {
  private tokenTranslationUtils: TokenTranslationUtils;
  private keyManager: RS256KeyManager;

  constructor(
    private sessionRepository: ISessionRepository
  ) {
    this.tokenTranslationUtils = new TokenTranslationUtils();
    this.keyManager = new RS256KeyManager();
  }

  /**
   * Create a new session with unified token
   */
  async createSession(
    unifiedPayload: UnifiedTokenPayload,
    request: Request,
    accessToken: string,
    refreshToken?: string
  ): Promise<Session> {
    console.log('[SESSION-MANAGER] Creating new unified session');

    const session = Session.create({
      userId: unifiedPayload.sub,
      token: accessToken,
      refreshToken: refreshToken || '',
      userAgent: this.getUserAgent(request),
      ipAddress: this.getClientIP(request),
      expiresAt: new Date(unifiedPayload.exp * 1000)
    });

    // Store session in database
    await this.sessionRepository.create(session);

    console.log('[SESSION-MANAGER] Session created successfully:', {
      sessionId: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt
    });

    return session;
  }

  /**
   * Validate session and token
   */
  async validateSession(token: string): Promise<{
    valid: boolean;
    session?: Session;
    unifiedPayload?: UnifiedTokenPayload;
    error?: string;
  }> {
    console.log('[SESSION-MANAGER] Validating session and token');

    try {
      // First validate the token
      const tokenValidation = await this.tokenTranslationUtils.validateAndTranslateToUnified(token);

      if (!tokenValidation.valid) {
        console.log('[SESSION-MANAGER] Token validation failed:', tokenValidation.error);
        return {
          valid: false,
          error: tokenValidation.error || 'Token validation failed'
        };
      }

      const unifiedPayload = tokenValidation.unifiedPayload!;

      // Check if token is expired
      if (unifiedPayload.exp && unifiedPayload.exp < Math.floor(Date.now() / 1000)) {
        console.log('[SESSION-MANAGER] Token is expired');
        return {
          valid: false,
          error: 'Token expired'
        };
      }

      // Find session by token
      const session = await this.sessionRepository.findByToken(token);

      if (!session) {
        console.log('[SESSION-MANAGER] Session not found for token');
        return {
          valid: false,
          error: 'Session not found'
        };
      }

      // Check if session is active
      if (!session.isValid()) {
        console.log('[SESSION-MANAGER] Session is inactive or expired');
        return {
          valid: false,
          error: 'Session inactive or expired'
        };
      }

      // Update last accessed time
      await this.sessionRepository.updateLastAccessed(session.id);

      console.log('[SESSION-MANAGER] Session validated successfully:', {
        sessionId: session.id,
        userId: session.userId
      });

      return {
        valid: true,
        session,
        unifiedPayload
      };

    } catch (error) {
      console.error('[SESSION-MANAGER] Error validating session:', error);
      return {
        valid: false,
        error: 'Session validation failed'
      };
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    console.log('[SESSION-MANAGER] Revoking session:', sessionId);

    try {
      const session = await this.sessionRepository.findById(sessionId);
      if (session) {
        const deactivatedSession = session.deactivate();
        await this.sessionRepository.update(deactivatedSession);
      }

      console.log('[SESSION-MANAGER] Session revoked successfully');
    } catch (error) {
      console.error('[SESSION-MANAGER] Error revoking session:', error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<void> {
    console.log('[SESSION-MANAGER] Revoking all sessions for user:', userId);

    try {
      const sessions = await this.sessionRepository.findByUserId(userId);

      for (const session of sessions) {
        if (session.id !== excludeSessionId && session.isActive) {
          await this.revokeSession(session.id);
        }
      }

      console.log('[SESSION-MANAGER] All user sessions revoked successfully');
    } catch (error) {
      console.error('[SESSION-MANAGER] Error revoking user sessions:', error);
      throw error;
    }
  }

  /**
   * Refresh session with new tokens
   */
  async refreshSession(refreshToken: string, request: Request): Promise<{
    valid: boolean;
    accessToken?: string;
    refreshToken?: string;
    session?: Session;
    error?: string;
  }> {
    console.log('[SESSION-MANAGER] Refreshing session');

    try {
      // Validate refresh token
      const tokenValidation = await this.tokenTranslationUtils.validateAndTranslateToUnified(refreshToken);

      if (!tokenValidation.valid) {
        console.log('[SESSION-MANAGER] Refresh token validation failed:', tokenValidation.error);
        return {
          valid: false,
          error: tokenValidation.error || 'Invalid refresh token'
        };
      }

      const unifiedPayload = tokenValidation.unifiedPayload!;

      // Check if it's a refresh token
      if (unifiedPayload.type !== 'refresh') {
        console.log('[SESSION-MANAGER] Token is not a refresh token');
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Find existing session by refresh token
      const existingSession = await this.sessionRepository.findByRefreshToken(refreshToken);

      if (!existingSession || !existingSession.isValid()) {
        console.log('[SESSION-MANAGER] No active session found for refresh token');
        return {
          valid: false,
          error: 'Invalid session'
        };
      }

      // Revoke old session
      await this.revokeSession(existingSession.id);

      // Create new unified payload for refreshed tokens
      const newUnifiedPayload: UnifiedTokenPayload = {
        ...unifiedPayload,
        iat: Math.floor(Date.now() / 1000),
        jti: this.generateJTI(),
        exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60), // 3 hours for access token
        type: 'access' // This will be overridden for refresh token
      };

      // Generate new token pair
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.tokenTranslationUtils.createUnifiedToken({
          userId: newUnifiedPayload.sub,
          email: newUnifiedPayload.email,
          name: newUnifiedPayload.name,
          role: newUnifiedPayload.role,
          username: newUnifiedPayload.username,
          authProvider: newUnifiedPayload.auth_provider,
          authMethod: newUnifiedPayload.auth_method,
          tenantId: newUnifiedPayload.tenant_id,
          permissions: newUnifiedPayload.permissions
        }, 'access'),
        this.tokenTranslationUtils.createUnifiedToken({
          userId: newUnifiedPayload.sub,
          email: newUnifiedPayload.email,
          name: newUnifiedPayload.name,
          role: newUnifiedPayload.role,
          username: newUnifiedPayload.username,
          authProvider: newUnifiedPayload.auth_provider,
          authMethod: newUnifiedPayload.auth_method,
          tenantId: newUnifiedPayload.tenant_id,
          permissions: newUnifiedPayload.permissions
        }, 'refresh')
      ]);

      // Create new session
      const newSession = await this.createSession(
        {
          ...newUnifiedPayload,
          jti: this.extractJTI(newAccessToken)
        },
        request,
        newAccessToken,
        newRefreshToken
      );

      console.log('[SESSION-MANAGER] Session refreshed successfully');

      return {
        valid: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        session: newSession
      };

    } catch (error) {
      console.error('[SESSION-MANAGER] Error refreshing session:', error);
      return {
        valid: false,
        error: 'Session refresh failed'
      };
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<Session[]> {
    console.log('[SESSION-MANAGER] Getting active sessions for user:', userId);

    try {
      const sessions = await this.sessionRepository.findActiveByUserId(userId);
      console.log('[SESSION-MANAGER] Found active sessions:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('[SESSION-MANAGER] Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    console.log('[SESSION-MANAGER] Cleaning up expired sessions');

    try {
      await this.sessionRepository.cleanupExpired();
      console.log('[SESSION-MANAGER] Expired sessions cleanup completed');
    } catch (error) {
      console.error('[SESSION-MANAGER] Error cleaning up sessions:', error);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate JWT ID
   */
  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract JTI from token
   */
  private extractJTI(token: string): string {
    try {
      const metadata = this.tokenTranslationUtils.extractTokenMetadata(token);
      return metadata?.payload?.jti || this.generateJTI();
    } catch (error) {
      return this.generateJTI();
    }
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(request: Request): string {
    // Try various headers for client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = request.headers.get('x-client-ip');

    if (forwarded) {
      return forwarded!.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    if (clientIP) {
      return clientIP;
    }

    // Fallback to a default
    return 'unknown';
  }

  /**
   * Get user agent from request
   */
  private getUserAgent(request: Request): string {
    return request.headers.get('user-agent') || 'unknown';
  }
}