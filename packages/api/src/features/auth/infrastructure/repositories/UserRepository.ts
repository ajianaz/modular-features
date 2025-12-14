import { eq, and, or, desc, asc, ilike, getTableColumns, count } from 'drizzle-orm';
import { db } from '@modular-monolith/database';
import { users } from '@modular-monolith/database';
import type { User, NewUser } from '@modular-monolith/database';

// Type assertion to handle Drizzle ORM compatibility issues
const usersTable = users as any;

import {
  IUserRepository,
  UserNotFoundError
} from '../../domain';

import { User as UserEntity } from '../../domain/entities/User.entity';

export class UserRepository implements IUserRepository {
  // CRUD operations
  async findById(id: string): Promise<UserEntity | null> {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

    if (user.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(user[0]!);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (user.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(user[0]!);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);

    if (user.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(user[0]!);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser: NewUser = {
      email: user.email.toLowerCase().trim(),
      name: user.name.trim(),
      passwordHash: user.passwordHash,
      username: user.username?.trim(),
      avatar: user.avatar?.trim(),
      role: user.role,
      emailVerified: user.emailVerified,
      metadata: user.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [insertedUser] = await db.insert(usersTable).values(newUser).returning();

    return this.mapToDomainEntity(insertedUser!);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updateData = {
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      metadata: user.metadata,
      updatedAt: new Date()
    };

    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, user.id))
      .returning();

    if (!updatedUser) {
      throw new UserNotFoundError(`User with id ${user.id} not found`);
    }

    return this.mapToDomainEntity(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const deleteResult = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    return deleteResult.length > 0;
  }

  // Query operations
  async findAll(): Promise<UserEntity[]> {
    const userList = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    return userList.map(user => this.mapToDomainEntity(user));
  }

  async findMany(criteria: Partial<UserEntity>): Promise<UserEntity[]> {
    const conditions = Object.entries(criteria).map(([key, value]) => {
      if (value === undefined) return null;

      // Type-safe property access
      switch (key) {
        case 'id':
          return eq(usersTable.id, value as string);
        case 'email':
          return eq(usersTable.email, value as string);
        case 'name':
          return eq(usersTable.name, value as string);
        case 'passwordHash':
          return eq(usersTable.passwordHash, value as string);
        case 'emailVerified':
          return eq(usersTable.emailVerified, value as boolean);
        case 'username':
          return eq(usersTable.username, value as string);
        case 'avatar':
          return eq(usersTable.avatar, value as string);
        case 'role':
          return eq(usersTable.role, value as string);
        case 'status':
          return eq(usersTable.status, value as string);
        case 'metadata':
          return eq(usersTable.metadata, value as Record<string, any>);
        default:
          return null;
      }
    }).filter(Boolean) as any[];

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const userList = await db
      .select()
      .from(usersTable)
      .where(whereClause)
      .orderBy(desc(usersTable.createdAt));

    return userList.map(user => this.mapToDomainEntity(user));
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const userList = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, role))
      .orderBy(asc(usersTable.name));

    return userList.map(user => this.mapToDomainEntity(user));
  }

  async findByStatus(status: string): Promise<UserEntity[]> {
    const userList = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.status, status))
      .orderBy(asc(usersTable.name));

    return userList.map(user => this.mapToDomainEntity(user));
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    const activeUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.status, 'active'))
      .orderBy(asc(usersTable.name));

    return activeUsers.map(user => this.mapToDomainEntity(user));
  }

  async findAdmins(): Promise<UserEntity[]> {
    const adminUsers = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.status, 'active'),
          or(
            eq(usersTable.role, 'admin'),
            eq(usersTable.role, 'super_admin')
          )
        )
      )
      .orderBy(asc(usersTable.name));

    return adminUsers.map(user => this.mapToDomainEntity(user));
  }

  // Business specific operations
  async existsByEmail(email: string): Promise<boolean> {
    const user = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    return user.length > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const user = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return user.length > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    return user.length > 0;
  }

  // Authentication related operations
  async updatePassword(userId: string, passwordHash: string): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async updateEmailVerification(userId: string, verified: boolean): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        emailVerified: verified,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async updateLastLogin(userId: string): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({ updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  // Status and role management
  async activateUser(userId: string): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        status: 'active',
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async deactivateUser(userId: string): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        status: 'inactive',
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async suspendUser(userId: string): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        status: 'suspended',
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        role,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  // Profile management
  async updateProfile(userId: string, data: { name?: string; username?: string; avatar?: string }): Promise<UserEntity | null> {
    const updateData: any = { updatedAt: new Date() };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.username !== undefined) {
      updateData.username = data.username.trim();
    }
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar.trim();
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async updateMetadata(userId: string, metadata: Record<string, any>): Promise<UserEntity | null> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        metadata,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  // Private helper methods
  private mapToDomainEntity(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.name || '',
      user.passwordHash || '',
      user.emailVerified || false,
      user.username,
      user.avatar,
      user.role as 'user' | 'admin' | 'super_admin',
      user.status as 'active' | 'inactive' | 'suspended',
      user.metadata || {},
      user.createdAt || new Date(),
      user.updatedAt || new Date()
    );
  }
}