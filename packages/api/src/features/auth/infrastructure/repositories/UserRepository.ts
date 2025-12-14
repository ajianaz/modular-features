import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';
import { db, users, eq } from '@modular-monolith/database';
import { and, like } from 'drizzle-orm';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, id as any)
    });

    if (!userRecord) {
      return null;
    }

    return new User(
      userRecord.id,
      userRecord.email,
      userRecord.name || '',
      userRecord.passwordHash || '',
      userRecord.createdAt,
      userRecord.updatedAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email as any)
    });

    if (!userRecord) {
      return null;
    }

    return new User(
      userRecord.id,
      userRecord.email,
      userRecord.name || '',
      userRecord.passwordHash || '',
      userRecord.createdAt,
      userRecord.updatedAt
    );
  }

  async findAll(): Promise<User[]> {
    const userRecords = await db.query.users.findMany();

    return userRecords.map((userRecord: any) =>
      new User(
        userRecord.id,
        userRecord.email,
        userRecord.name || '',
        userRecord.passwordHash || '',
        userRecord.createdAt,
        userRecord.updatedAt
      )
    );
  }

  async findMany(criteria: Partial<User>): Promise<User[]> {
    // For simplicity, we'll use findAll and filter in memory
    // In a real application, you would want to build proper SQL queries
    const allUsers = await this.findAll();

    return allUsers.filter(user => {
      if (criteria.id && user.id !== criteria.id) {
        return false;
      }
      if (criteria.email && user.email !== criteria.email) {
        return false;
      }
      if (criteria.name && !user.name?.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  async create(user: User): Promise<User> {
    const [newUser] = await db.insert(users).values({
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }).returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return new User(
      newUser.id,
      newUser.email,
      newUser.name || '',
      newUser.passwordHash || '',
      newUser.createdAt,
      newUser.updatedAt
    );
  }

  async update(user: User): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id as any))
      .returning();

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return new User(
      updatedUser.id,
      updatedUser.email,
      updatedUser.name || '',
      updatedUser.passwordHash || '',
      updatedUser.createdAt,
      updatedUser.updatedAt
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id as any));
    return (result as any).length > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async existsById(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }
}