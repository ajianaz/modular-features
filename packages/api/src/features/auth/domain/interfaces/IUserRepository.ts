import { User } from '../entities/User';

// Repository interface for User entity
export interface IUserRepository {
  // CRUD operations
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(): Promise<User[]>;
  findMany(criteria: Partial<User>): Promise<User[]>;

  // Business specific operations
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}