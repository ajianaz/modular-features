import { eq, and, or, desc, asc, lt, db } from '@modular-monolith/database';
import { sessions } from '@modular-monolith/database';
import type { Session, NewSession } from '@modular-monolith/database';

// Type assertion to handle Drizzle ORM compatibility issues
const sessionsTable = sessions as any;

import {
  ISessionRepository,
  SessionNotFoundError,
  InvalidTokenError
} from '../../domain';

import { Session as SessionEntity } from '../../domain/entities/Session.entity';

export class SessionRepository implements ISessionRepository {
  // CRUD operations
  async findById(id: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id) as any).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByToken(token: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token) as any).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const session = await db.select().from(sessionsTable).where(eq(sessionsTable.refreshToken, refreshToken) as any).limit(1);

    if (session.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(session[0]!);
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    const userSessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId) as any)
      .orderBy(desc(sessionsTable.createdAt) as any);

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

    const [insertedSession] = await db.insert(sessionsTable).values(newSession as any).returning();

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
      .update(sessionsTable)
      .set(updateData as any)
      .where(eq(sessionsTable.id, session.id) as any)
      .returning();

    if (!updatedSession) {
      throw new SessionNotFoundError(`Session with id ${session.id} not found`);
    }

    return this.mapToDomainEntity(updatedSession);
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, id) as any)
      .returning({ id: sessionsTable.id });

    return deleteResult.length > 0;
  }

  // Query operations
  async findAll(): Promise<SessionEntity[]> {
    const sessionList = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.createdAt) as any);
    return sessionList.map(session => this.mapToDomainEntity(session));
  }

  async findActiveByUserId(userId: string): Promise<SessionEntity[]> {
    const activeSessions = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, userId) as any,
          eq(sessionsTable.isActive, true) as any
        ) as any
      )
      .orderBy(desc(sessionsTable.lastAccessedAt) as any);

    return activeSessions.map(session => this.mapToDomainEntity(session));
  }

  async findExpired(): Promise<SessionEntity[]> {
    const expiredSessions = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.isActive, true) as any,
          lt(sessionsTable.expiresAt, new Date()) as any
        ) as any
      )
      .orderBy(asc(sessionsTable.expiresAt) as any);

    return expiredSessions.map(session => this.mapToDomainEntity(session));
  }

  // Business specific operations
  async existsByToken(token: string): Promise<boolean> {
    const session = await db
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(eq(sessionsTable.token, token) as any)
      .limit(1);

    return session.length > 0;
  }

  async existsByRefreshToken(refreshToken: string): Promise<boolean> {
    const session = await db
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(eq(sessionsTable.refreshToken, refreshToken) as any)
      .limit(1);

    return session.length > 0;
  }

  async deactivateByUserId(userId: string): Promise<boolean> {
    const result = await db
      .update(sessionsTable)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.userId, userId) as any)
      .returning({ id: sessionsTable.id });

    return result.length > 0;
  }

  async deactivateById(id: string): Promise<boolean> {
    const result = await db
      .update(sessionsTable)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.id, id) as any)
      .returning({ id: sessionsTable.id });

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
      .delete(sessionsTable)
      .where(
        and(
          eq(sessionsTable.isActive, true) as any,
          lt(sessionsTable.expiresAt, new Date()) as any
        ) as any
      )
      .returning({ id: sessionsTable.id });

    return deleteResult.length;
  }

  // Session management
  async refreshSession(sessionId: string, newToken: string, newRefreshToken: string, newExpiresAt: Date): Promise<SessionEntity | null> {
    const [updatedSession] = await db
      .update(sessionsTable)
      .set({
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.id, sessionId) as any)
      .returning();

    return updatedSession ? this.mapToDomainEntity(updatedSession) : null;
  }

  async updateLastAccessed(sessionId: string): Promise<SessionEntity | null> {
    const [updatedSession] = await db
      .update(sessionsTable)
      .set({
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.id, sessionId) as any)
      .returning();

    return updatedSession ? this.mapToDomainEntity(updatedSession) : null;
  }

  // Security operations
  async revokeAllUserSessions(userId: string): Promise<boolean> {
    const result = await db
      .update(sessionsTable)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.userId, userId) as any)
      .returning({ id: sessionsTable.id });

    return result.length > 0;
  }

  async revokeSessionById(sessionId: string): Promise<boolean> {
    const result = await db
      .update(sessionsTable)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessionsTable.id, sessionId) as any)
      .returning({ id: sessionsTable.id });

    return result.length > 0;
  }

  // Deactivate session (synchronous operation for domain logic)
  deactivate(session: SessionEntity): SessionEntity {
    // Create a new session entity with isActive set to false
    return new SessionEntity(
      session.id,
      session.userId,
      session.token,
      session.refreshToken,
      session.expiresAt,
      session.lastAccessedAt,
      session.createdAt,
      new Date(), // Update updatedAt to current time
      session.userAgent,
      session.ipAddress,
      false // Set isActive to false
    );
  }

  // Private helper methods
  private mapToDomainEntity(session: any): SessionEntity {
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