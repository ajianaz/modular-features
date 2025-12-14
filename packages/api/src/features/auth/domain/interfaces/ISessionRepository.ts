import { Session } from '../entities/Session.entity';

// Repository interface for Session entity
export interface ISessionRepository {
  // CRUD operations
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByRefreshToken(refreshToken: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  create(session: Session): Promise<Session>;
  update(session: Session): Promise<Session>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(): Promise<Session[]>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  findExpired(): Promise<Session[]>;

  // Business specific operations
  existsByToken(token: string): Promise<boolean>;
  existsByRefreshToken(refreshToken: string): Promise<boolean>;
  deactivateByUserId(userId: string): Promise<boolean>;
  deactivateById(id: string): Promise<boolean>;
  cleanupExpired(): Promise<number>; // Returns count of deleted sessions

  // Session management
  refreshSession(sessionId: string, newToken: string, newRefreshToken: string, newExpiresAt: Date): Promise<Session | null>;
  deactivate(session: Session): Session;
  updateLastAccessed(sessionId: string): Promise<Session | null>;

  // Security operations
  revokeAllUserSessions(userId: string): Promise<boolean>;
  revokeSessionById(sessionId: string): Promise<boolean>;
}