import { z } from 'zod';

// UserRole entity with permission system
export class UserRole {
  constructor(
    public readonly id: string,
    public name: string,
    public displayName: string,
    public description?: string,
    public level: number = 0, // Higher level = more permissions
    public isSystem: boolean = false, // System roles cannot be deleted
    public permissions: string[] = [],
    public metadata?: Record<string, any>,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method to create a new user role
  static create(data: {
    name: string;
    displayName: string;
    description?: string;
    level?: number;
    isSystem?: boolean;
    permissions?: string[];
    metadata?: Record<string, any>;
    isActive?: boolean;
  }): UserRole {
    const id = crypto.randomUUID();
    const now = new Date();

    return new UserRole(
      id,
      data.name.toLowerCase().trim(),
      data.displayName.trim(),
      data.description?.trim(),
      data.level || 0,
      data.isSystem || false,
      data.permissions || [],
      data.metadata,
      data.isActive !== undefined ? data.isActive : true,
      now,
      now
    );
  }

  // Business logic methods
  updateInfo(data: {
    displayName?: string;
    description?: string;
    level?: number;
  }): UserRole {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRole(
      this.id,
      this.name,
      data.displayName?.trim() || this.displayName,
      data.description?.trim() || this.description,
      data.level !== undefined ? data.level : this.level,
      this.isSystem,
      this.permissions,
      this.metadata,
      this.isActive,
      this.createdAt,
      now
    );
  }

  updatePermissions(permissions: string[]): UserRole {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRole(
      this.id,
      this.name,
      this.displayName,
      this.description,
      this.level,
      this.isSystem,
      [...new Set(permissions)], // Remove duplicates
      this.metadata,
      this.isActive,
      this.createdAt,
      now
    );
  }

  addPermission(permission: string): UserRole {
    const normalizedPermission = permission.toLowerCase().trim();
    if (this.hasPermission(normalizedPermission)) {
      return this; // Permission already exists
    }

    return this.updatePermissions([...this.permissions, normalizedPermission]);
  }

  removePermission(permission: string): UserRole {
    const normalizedPermission = permission.toLowerCase().trim();
    const updatedPermissions = this.permissions.filter(p => p !== normalizedPermission);

    return this.updatePermissions(updatedPermissions);
  }

  updateMetadata(metadata: Record<string, any>): UserRole {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRole(
      this.id,
      this.name,
      this.displayName,
      this.description,
      this.level,
      this.isSystem,
      this.permissions,
      { ...this.metadata, ...metadata },
      this.isActive,
      this.createdAt,
      now
    );
  }

  activate(): UserRole {
    if (this.isActive) return this;

    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRole(
      this.id,
      this.name,
      this.displayName,
      this.description,
      this.level,
      this.isSystem,
      this.permissions,
      this.metadata,
      true,
      this.createdAt,
      now
    );
  }

  deactivate(): UserRole {
    if (!this.isActive) return this;
    if (this.isSystem) {
      throw new Error('Cannot deactivate system roles');
    }

    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRole(
      this.id,
      this.name,
      this.displayName,
      this.description,
      this.level,
      this.isSystem,
      this.permissions,
      this.metadata,
      false,
      this.createdAt,
      now
    );
  }

  // Business validation methods
  hasPermission(permission: string): boolean {
    const normalizedPermission = permission.toLowerCase().trim();
    return this.permissions.includes(normalizedPermission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canBeDeleted(): boolean {
    return !this.isSystem;
  }

  canBeModified(): boolean {
    return !this.isSystem;
  }

  isHigherLevel(otherRole: UserRole): boolean {
    return this.level > otherRole.level;
  }

  isSameLevel(otherRole: UserRole): boolean {
    return this.level === otherRole.level;
  }

  isLowerLevel(otherRole: UserRole): boolean {
    return this.level < otherRole.level;
  }

  // Permission categories for common patterns
  hasReadPermissions(): boolean {
    return this.hasAnyPermission([
      'read:users',
      'read:profiles',
      'read:settings',
      'read:roles',
      'read:activities'
    ]);
  }

  hasWritePermissions(): boolean {
    return this.hasAnyPermission([
      'write:users',
      'write:profiles',
      'write:settings',
      'write:roles',
      'write:activities'
    ]);
  }

  hasAdminPermissions(): boolean {
    return this.hasAnyPermission([
      'admin:users',
      'admin:system',
      'admin:roles',
      'admin:settings'
    ]);
  }

  hasUserManagementPermissions(): boolean {
    return this.hasAnyPermission([
      'manage:users',
      'manage:profiles',
      'manage:settings',
      'manage:roles'
    ]);
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    displayName: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    level: z.number().min(0).max(1000),
    isSystem: z.boolean(),
    permissions: z.array(z.string().min(1)),
    metadata: z.record(z.string(), z.any()).optional(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    name: z.string().min(1).max(100),
    displayName: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    level: z.number().min(0).max(1000).default(0),
    isSystem: z.boolean().default(false),
    permissions: z.array(z.string().min(1)).default([]),
    metadata: z.record(z.string(), z.any()).optional(),
    isActive: z.boolean().default(true)
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = UserRole.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = UserRole.createSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // JSON serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      level: this.level,
      isSystem: this.isSystem,
      permissions: this.permissions,
      metadata: this.metadata,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// UserRoleAssignment entity for managing user-role relationships
export class UserRoleAssignment {
  constructor(
    public readonly id: string,
    public userId: string,
    public roleId: string,
    public assignedBy?: string,
    public readonly assignedAt: Date = new Date(),
    public expiresAt?: Date,
    public isActive: boolean = true,
    public metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method to create a new role assignment
  static create(data: {
    userId: string;
    roleId: string;
    assignedBy?: string;
    expiresAt?: Date;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }): UserRoleAssignment {
    const id = crypto.randomUUID();
    const now = new Date();

    return new UserRoleAssignment(
      id,
      data.userId,
      data.roleId,
      data.assignedBy,
      now,
      data.expiresAt,
      data.isActive !== undefined ? data.isActive : true,
      data.metadata,
      now,
      now
    );
  }

  // Business logic methods
  activate(): UserRoleAssignment {
    if (this.isActive) return this;

    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRoleAssignment(
      this.id,
      this.userId,
      this.roleId,
      this.assignedBy,
      this.assignedAt,
      this.expiresAt,
      true,
      this.metadata,
      this.createdAt,
      now
    );
  }

  deactivate(): UserRoleAssignment {
    if (!this.isActive) return this;

    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRoleAssignment(
      this.id,
      this.userId,
      this.roleId,
      this.assignedBy,
      this.assignedAt,
      this.expiresAt,
      false,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateExpiration(expiresAt?: Date): UserRoleAssignment {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRoleAssignment(
      this.id,
      this.userId,
      this.roleId,
      this.assignedBy,
      this.assignedAt,
      expiresAt,
      this.isActive,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateMetadata(metadata: Record<string, any>): UserRoleAssignment {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserRoleAssignment(
      this.id,
      this.userId,
      this.roleId,
      this.assignedBy,
      this.assignedAt,
      this.expiresAt,
      this.isActive,
      { ...this.metadata, ...metadata },
      this.createdAt,
      now
    );
  }

  // Business validation methods
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    assignedBy: z.string().uuid().optional(),
    assignedAt: z.date(),
    expiresAt: z.date().optional(),
    isActive: z.boolean(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    assignedBy: z.string().uuid().optional(),
    expiresAt: z.date().optional(),
    isActive: z.boolean().default(true),
    metadata: z.record(z.string(), z.any()).optional()
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = UserRoleAssignment.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = UserRoleAssignment.createSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // JSON serialization
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}