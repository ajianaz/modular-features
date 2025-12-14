import { describe, it, expect, beforeEach } from 'vitest';
import { Session } from '../../domain/entities';

describe('Session Entity', () => {
  const validSessionData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '456e7890-e89b-12d3-a456-426614174001',
    token: 'session-token',
    refreshToken: 'refresh-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccessedAt: new Date(),
    isActive: true,
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.1'
  };

  describe('Constructor', () => {
    it('should create a valid session with all required fields', () => {
      const session = new Session(
        validSessionData.id,
        validSessionData.userId,
        validSessionData.token,
        validSessionData.refreshToken,
        validSessionData.expiresAt,
        validSessionData.lastAccessedAt,
        validSessionData.createdAt,
        validSessionData.updatedAt,
        validSessionData.userAgent,
        validSessionData.ipAddress,
        validSessionData.isActive
      );

      expect(session.id).toBe(validSessionData.id);
      expect(session.userId).toBe(validSessionData.userId);
      expect(session.token).toBe(validSessionData.token);
      expect(session.refreshToken).toBe(validSessionData.refreshToken);
      expect(session.expiresAt).toBe(validSessionData.expiresAt);
      expect(session.lastAccessedAt).toBe(validSessionData.lastAccessedAt);
      expect(session.createdAt).toBe(validSessionData.createdAt);
      expect(session.updatedAt).toBe(validSessionData.updatedAt);
      expect(session.userAgent).toBe(validSessionData.userAgent);
      expect(session.ipAddress).toBe(validSessionData.ipAddress);
      expect(session.isActive).toBe(validSessionData.isActive);
    });

    it('should create a session with default values', () => {
      const session = new Session(
        validSessionData.id,
        validSessionData.userId,
        validSessionData.token,
        validSessionData.refreshToken,
        validSessionData.expiresAt,
        validSessionData.lastAccessedAt,
        validSessionData.createdAt,
        validSessionData.updatedAt
      );

      expect(session.isActive).toBe(true);
      expect(session.userAgent).toBeUndefined();
      expect(session.ipAddress).toBeUndefined();
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid session using factory method', () => {
      const sessionData = {
        userId: validSessionData.userId,
        token: validSessionData.token,
        refreshToken: validSessionData.refreshToken,
        userAgent: validSessionData.userAgent,
        ipAddress: validSessionData.ipAddress,
        expiresAt: validSessionData.expiresAt
      };

      const session = Session.create(sessionData);

      expect(session.userId).toBe(sessionData.userId);
      expect(session.token).toBe(sessionData.token);
      expect(session.refreshToken).toBe(sessionData.refreshToken);
      expect(session.userAgent).toBe(sessionData.userAgent);
      expect(session.ipAddress).toBe(sessionData.ipAddress);
      expect(session.expiresAt).toBe(sessionData.expiresAt);
      expect(session.isActive).toBe(true);
      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should create session with default values using factory method', () => {
      const sessionData = {
        userId: validSessionData.userId,
        token: validSessionData.token,
        refreshToken: validSessionData.refreshToken,
        expiresAt: validSessionData.expiresAt
      };

      const session = Session.create(sessionData);

      expect(session.userId).toBe(sessionData.userId);
      expect(session.token).toBe(sessionData.token);
      expect(session.refreshToken).toBe(sessionData.refreshToken);
      expect(session.expiresAt).toBe(sessionData.expiresAt);
      expect(session.isActive).toBe(true);
      expect(session.userAgent).toBeUndefined();
      expect(session.ipAddress).toBeUndefined();
    });
  });

  describe('Business Logic Methods', () => {
    let session: Session;

    beforeEach(() => {
      session = new Session(
        validSessionData.id,
        validSessionData.userId,
        validSessionData.token,
        validSessionData.refreshToken,
        validSessionData.expiresAt,
        validSessionData.lastAccessedAt,
        validSessionData.createdAt,
        validSessionData.updatedAt,
        validSessionData.userAgent,
        validSessionData.ipAddress,
        validSessionData.isActive
      );
    });

    describe('updateLastAccessed', () => {
      it('should update last accessed time and return new session instance', () => {
        const originalUpdatedAt = session.updatedAt;
        const originalLastAccessedAt = session.lastAccessedAt;

        const updatedSession = session.updateLastAccessed();

        expect(updatedSession.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(originalLastAccessedAt.getTime());
        expect(updatedSession.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
        expect(updatedSession.id).toBe(session.id);
        expect(updatedSession.token).toBe(session.token);
      });
    });

    describe('deactivate', () => {
      it('should deactivate session and return new session instance', () => {
        const originalUpdatedAt = session.updatedAt;
        const deactivatedSession = session.deactivate();

        expect(deactivatedSession.isActive).toBe(false);
        expect(deactivatedSession.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      });

      it('should keep session deactivated if already deactivated', () => {
        const alreadyDeactivated = session.deactivate();
        const stillDeactivated = alreadyDeactivated.deactivate();

        expect(stillDeactivated.isActive).toBe(false);
      });
    });

    describe('refreshTokens', () => {
      it('should refresh tokens and return new session instance', () => {
        const newToken = 'new-session-token';
        const newRefreshToken = 'new-refresh-token';
        const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
        const originalUpdatedAt = session.updatedAt;

        const refreshedSession = session.refreshTokens(newToken, newRefreshToken, newExpiresAt);

        expect(refreshedSession.token).toBe(newToken);
        expect(refreshedSession.refreshToken).toBe(newRefreshToken);
        expect(refreshedSession.expiresAt).toBe(newExpiresAt);
        expect(refreshedSession.updatedAt).not.toEqual(originalUpdatedAt);
        expect(refreshedSession.lastAccessedAt).not.toEqual(session.lastAccessedAt);
      });
    });
  });

  describe('Business Validation Methods', () => {
    let session: Session;

    beforeEach(() => {
      session = new Session(
        validSessionData.id,
        validSessionData.userId,
        validSessionData.token,
        validSessionData.refreshToken,
        validSessionData.expiresAt,
        validSessionData.lastAccessedAt,
        validSessionData.createdAt,
        validSessionData.updatedAt,
        validSessionData.userAgent,
        validSessionData.ipAddress,
        validSessionData.isActive
      );
    });

    describe('isExpired', () => {
      it('should return false for non-expired session', () => {
        expect(session.isExpired()).toBe(false);
      });

      it('should return true for expired session', () => {
        const pastDate = new Date(Date.now() - 1000);
        const expiredSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          pastDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(expiredSession.isExpired()).toBe(true);
      });

      it('should return true for session expiring now', () => {
        // Set expiry time to slightly in the past to ensure it's considered expired
        const pastDate = new Date(Date.now() - 100);
        const expiringSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          pastDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(expiringSession.isExpired()).toBe(true);
      });
    });

    describe('isValid', () => {
      it('should return true for valid session', () => {
        expect(session.isValid()).toBe(true);
      });

      it('should return false for inactive session', () => {
        const inactiveSession = session.deactivate();
        expect(inactiveSession.isValid()).toBe(false);
      });

      it('should return false for expired session', () => {
        const pastDate = new Date(Date.now() - 1000);
        const expiredSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          pastDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(expiredSession.isValid()).toBe(false);
      });

      it('should return false for inactive and expired session', () => {
        const pastDate = new Date(Date.now() - 1000);
        const invalidSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          pastDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          false
        );

        expect(invalidSession.isValid()).toBe(false);
      });
    });

    describe('isExpiringSoon', () => {
      it('should return true for session expiring soon', () => {
        const soonExpiringDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        const soonExpiringSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          soonExpiringDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(soonExpiringSession.isExpiringSoon()).toBe(true);
      });

      it('should return false for session with plenty of time left', () => {
        expect(session.isExpiringSoon()).toBe(false);
      });

      it('should return true for custom threshold', () => {
        const soonExpiringDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
        const soonExpiringSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          soonExpiringDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(soonExpiringSession.isExpiringSoon(30)).toBe(true);
        expect(soonExpiringSession.isExpiringSoon(15)).toBe(false);
      });

      it('should return false for expired session', () => {
        const pastDate = new Date(Date.now() - 1000);
        const expiredSession = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          pastDate,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        expect(expiredSession.isExpiringSoon()).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid session', () => {
        const session = new Session(
          validSessionData.id,
          validSessionData.userId,
          validSessionData.token,
          validSessionData.refreshToken,
          validSessionData.expiresAt,
          validSessionData.lastAccessedAt,
          validSessionData.createdAt,
          validSessionData.updatedAt,
          validSessionData.userAgent,
          validSessionData.ipAddress,
          validSessionData.isActive
        );

        const result = session.validate();
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid session', () => {
        const invalidSession = new Session(
          'invalid-id',
          'invalid-uuid',
          '',
          '',
          new Date(),
          new Date(),
          new Date(),
          new Date(),
          '',
          '',
          'invalid-boolean' as any
        );

        const result = invalidSession.validate();
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const sessionData = {
          userId: validSessionData.userId,
          token: validSessionData.token,
          refreshToken: validSessionData.refreshToken,
          expiresAt: validSessionData.expiresAt
        };

        const result = Session.validateCreate(sessionData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid',
          token: '',
          refreshToken: '',
          expiresAt: new Date(Date.now() - 1000) // Past date
        };

        const result = Session.validateCreate(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let session: Session;

    beforeEach(() => {
      session = new Session(
        validSessionData.id,
        validSessionData.userId,
        validSessionData.token,
        validSessionData.refreshToken,
        validSessionData.expiresAt,
        validSessionData.lastAccessedAt,
        validSessionData.createdAt,
        validSessionData.updatedAt,
        validSessionData.userAgent,
        validSessionData.ipAddress,
        validSessionData.isActive
      );
    });

    describe('toJSON', () => {
      it('should return session object without sensitive data', () => {
        const json = session.toJSON();

        expect(json).toEqual({
          id: validSessionData.id,
          userId: validSessionData.userId,
          userAgent: validSessionData.userAgent,
          ipAddress: validSessionData.ipAddress,
          isActive: validSessionData.isActive,
          expiresAt: validSessionData.expiresAt,
          lastAccessedAt: validSessionData.lastAccessedAt,
          createdAt: validSessionData.createdAt,
          updatedAt: validSessionData.updatedAt
        });
        expect(json).not.toHaveProperty('token');
        expect(json).not.toHaveProperty('refreshToken');
      });
    });

    describe('toInternalJSON', () => {
      it('should return session object with sensitive data', () => {
        const json = session.toInternalJSON();

        expect(json).toEqual({
          id: validSessionData.id,
          userId: validSessionData.userId,
          token: validSessionData.token,
          refreshToken: validSessionData.refreshToken,
          userAgent: validSessionData.userAgent,
          ipAddress: validSessionData.ipAddress,
          isActive: validSessionData.isActive,
          expiresAt: validSessionData.expiresAt,
          lastAccessedAt: validSessionData.lastAccessedAt,
          createdAt: validSessionData.createdAt,
          updatedAt: validSessionData.updatedAt
        });
      });
    });
  });
});