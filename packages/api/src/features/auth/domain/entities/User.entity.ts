import { z } from 'zod';

// User entity with business logic
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public passwordHash: string,
    public emailVerified: boolean = false,
    public username?: string,
    public avatar?: string,
    public role: 'user' | 'admin' | 'super_admin' = 'user',
    public status: 'active' | 'inactive' | 'suspended' = 'active',
    public metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method to create a new user
  static create(data: {
    email: string;
    name: string;
    passwordHash: string;
    username?: string;
    avatar?: string;
    role?: 'user' | 'admin' | 'super_admin';
    emailVerified?: boolean;
    metadata?: Record<string, any>;
  }): User {
    const id = crypto.randomUUID();
    const now = new Date();

    return new User(
      id,
      data.email.toLowerCase().trim(),
      data.name.trim(),
      data.passwordHash,
      data.emailVerified || false,
      data.username?.trim(),
      data.avatar?.trim(),
      data.role || 'user',
      'active',
      data.metadata,
      now,
      now
    );
  }

  // Business logic methods
  updateName(newName: string): User {
    return new User(
      this.id,
      this.email,
      newName.trim(),
      this.passwordHash,
      this.emailVerified,
      this.username,
      this.avatar,
      this.role,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updateEmail(newEmail: string): User {
    return new User(
      this.id,
      newEmail.toLowerCase().trim(),
      this.name,
      this.passwordHash,
      false, // Reset email verification when email changes
      this.username,
      this.avatar,
      this.role,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updatePassword(newPasswordHash: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      newPasswordHash,
      this.emailVerified,
      this.username,
      this.avatar,
      this.role,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      true,
      this.username,
      this.avatar,
      this.role,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updateRole(newRole: 'user' | 'admin' | 'super_admin'): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.emailVerified,
      this.username,
      this.avatar,
      newRole,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(newStatus: 'active' | 'inactive' | 'suspended'): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.emailVerified,
      this.username,
      this.avatar,
      this.role,
      newStatus,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updateAvatar(newAvatar: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.emailVerified,
      this.username,
      newAvatar.trim(),
      this.role,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  updateMetadata(newMetadata: Record<string, any>): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.emailVerified,
      this.username,
      this.avatar,
      this.role,
      this.status,
      { ...this.metadata, ...newMetadata },
      this.createdAt,
      new Date()
    );
  }

  // Business validation methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'super_admin';
  }

  isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }

  canLogin(): boolean {
    return this.isActive() && this.emailVerified;
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    email: z.string().email().max(255),
    name: z.string().min(1).max(255),
    passwordHash: z.string().min(1),
    emailVerified: z.boolean(),
    username: z.string().max(100).optional(),
    avatar: z.string().max(500).optional(),
    role: z.enum(['user', 'admin', 'super_admin']),
    status: z.enum(['active', 'inactive', 'suspended']),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    email: z.string().email().max(255),
    name: z.string().min(2).max(255),
    passwordHash: z.string().min(8),
    username: z.string().max(100).optional(),
    avatar: z.string().max(500).optional(),
    role: z.enum(['user', 'admin', 'super_admin']).optional().default('user'),
    emailVerified: z.boolean().optional().default(false),
    metadata: z.record(z.string(), z.any()).optional()
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = User.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = User.createSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Safe JSON serialization (excludes sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      emailVerified: this.emailVerified,
      username: this.username,
      avatar: this.avatar,
      role: this.role,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // For internal use (includes sensitive data)
  toInternalJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      passwordHash: this.passwordHash,
      emailVerified: this.emailVerified,
      username: this.username,
      avatar: this.avatar,
      role: this.role,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}