import { User } from '../entities/User.entity';

// Repository interface for User entity
export interface IUserRepository {
  // CRUD operations
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(): Promise<User[]>;
  findMany(criteria: Partial<User>): Promise<User[]>;
  findByRole(role: string): Promise<User[]>;
  findByStatus(status: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findAdmins(): Promise<User[]>;

  // Business specific operations
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;

  // Authentication related operations
  updatePassword(userId: string, passwordHash: string): Promise<User | null>;
  updateEmailVerification(userId: string, verified: boolean): Promise<User | null>;
  updateLastLogin(userId: string): Promise<User | null>;

  // Status and role management
  activateUser(userId: string): Promise<User | null>;
  deactivateUser(userId: string): Promise<User | null>;
  suspendUser(userId: string): Promise<User | null>;
  updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<User | null>;

  // Profile management
  updateProfile(userId: string, data: { name?: string; username?: string; avatar?: string }): Promise<User | null>;
  updateMetadata(userId: string, metadata: Record<string, any>): Promise<User | null>;
}