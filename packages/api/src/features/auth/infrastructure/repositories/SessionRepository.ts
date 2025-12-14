import { eq, and, or, desc, asc, lt } from 'drizzle-orm';
import { db } from '@modular-monolith/database';
import { sessions } from '@modular-monolith/database';
import type { Session, NewSession } from '@modular-monolith/database';

import {
  ISessionRepository,
  SessionNotFoundError,
  InvalidTokenError
} from '../../domain';

import { Session as SessionEntity } from '../../domain/entities/Session.entity';

export class SessionRepository implements ISessionRepository {
  // CRUD operations
  async findById(id: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByToken(token: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessions).where(eq(sessions.refreshToken, refreshToken)).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));

    return userSessions.map(session => this.mapToDomainEntity(session));
  }

  async create(session: SessionEntity): Promise<SessionEntity> {
    const newSession: NewSession = {
      userId: session.userId,
      token: session.token,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [insertedSession] = await db.insert(sessions).values(newSession).returning();

    return this.mapToDomainEntity(insertedSession!);
  }

  async update(session: SessionEntity): Promise<SessionEntity> {
    const updateData = {
      userId: session.userId,
      token: session.token,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      isActive: session.isActive,
      expiresAt: session.expiresAt,
      lastAccessedAt: session.lastAccessedAt,
      updatedAt: new Date()
    };

    const [updatedSession] = await db
      .update(sessions)
      .set(updateData)
      .where(eq(sessions.id, session.id))
      .returning();

    if (!updatedSession) {
      throw new SessionNotFoundError(`Session with id ${session.id} not found`);
    }

    return this.mapToDomainEntity(updatedSession);
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning({ id: sessions.id });

    return deleteResult.length > 0;
  }

  // Query operations
  async findAll(): Promise<SessionEntity[]> {
    const sessionList = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
    return sessionList.map(session => this.mapToDomainEntity(session));
  }

  async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isActive, true)
        )
      )
      .orderBy(desc(sessions.lastAccessedAt));

    return activeSessions.map(session => this.mapToDomainEntity(session));
  }

  async findExpired(): Promise<SessionEntity[]> {
    const expiredSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.isActive, true),
          lt(sessions.expiresAt, new Date())
        )
      )
      .orderBy(asc(sessions.expiresAt));

    return expiredSessions.map(session => this.mapToDomainEntity(session));
  }

  // Business specific operations
  async existsByToken(token: string): Promise<boolean> {
    const session = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    return session.length > 0;
  }

  async existsByRefreshToken(refreshToken: string): Promise<boolean> {
    const session = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken))
      .limit(1);

    return session.length > 0;
  }

  async deactivateByUserId(userId: string): Promise<boolean> {
    const result = await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.userId, userId))
      .returning({ id: sessions.id });

    return result.length > 0;
  }

  async deactivateById(id: string): Promise<boolean> {
    const result = await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, id))
      .returning({ id: sessions.id });

    return result.length > 0;
  }

  async cleanupExpired(): Promise<number> {
    // First find expired sessions
    const expiredSessions = await this.findExpired();

    if (expiredSessions.length === 0) {
      return 0;
    }

    // Delete expired sessions
    const expiredIds = expiredSessions.map(session => session.id);
    const deleteResult = await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.isActive, true),
          lt(sessions.expiresAt, new Date())
        )
      )
      .returning({ id: sessions.id });

    return deleteResult.length;
  }

  // Session management
  async refreshSession(sessionId: string, newToken: string, newRefreshToken: string, newExpiresAt: Date): Promise<SessionEntity | null> {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))
      .returning();

    return updatedSession ? this.mapToDomainEntity(updatedSession) : null;
  }

  async updateLastAccessed(sessionId: string): Promise<SessionEntity | null> {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))
      .returning();

    return updatedSession ? this.mapToDomainEntity(updatedSession) : null;
  }

  // Security operations
  async revokeAllUserSessions(userId: string): Promise<boolean> {
    const result = await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.userId, userId))
      .returning({ id: sessions.id });

    return result.length > 0;
  }

  async revokeSessionById(sessionId: string): Promise<boolean> {
    const result = await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))
      .returning({ id: sessions.id });

    return result.length > 0;
  }

  // Private helper methods
  private mapToDomainEntity(session: Session): SessionEntity {
    return new SessionEntity(
      session.id,
      session.userId,
      session.token,
      session.refreshToken || '',
      session.expiresAt,
      session.lastAccessedAt,
      session.createdAt,
      session.updatedAt,
      session.userAgent || undefined,
      session.ipAddress || undefined,
      session.isActive
    );
  }
}