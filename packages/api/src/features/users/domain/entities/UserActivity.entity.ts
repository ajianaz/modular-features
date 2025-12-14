import { z } from 'zod';

// UserActivity entity for tracking user activities
export class UserActivity {
  constructor(
    public readonly id: string,
    public userId: string,
    public type: string, // login, logout, update, delete, etc.
    public action: string, // Specific action performed
    public description?: string,
    public resource?: string, // Resource that was acted upon
    public resourceId?: string, // ID of the resource
    public metadata?: Record<string, any>, // Additional data about the activity
    public ipAddress?: string, // IPv6 compatible
    public userAgent?: string,
    public sessionId?: string, // Related session if available
    public readonly createdAt: Date = new Date()
  ) {}

  // Factory method to create a new user activity
  static create(data: {
    userId: string;
    type: string;
    action: string;
    description?: string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): UserActivity {
    const id = crypto.randomUUID();

    return new UserActivity(
      id,
      data.userId,
      data.type.toLowerCase().trim(),
      data.action.toLowerCase().trim(),
      data.description?.trim(),
      data.resource?.toLowerCase().trim(),
      data.resourceId,
      data.metadata,
      data.ipAddress?.trim(),
      data.userAgent?.trim(),
      data.sessionId
    );
  }

  // Business logic methods
  updateDescription(description: string): UserActivity {
    return new UserActivity(
      this.id,
      this.userId,
      this.type,
      this.action,
      description.trim(),
      this.resource,
      this.resourceId,
      this.metadata,
      this.ipAddress,
      this.userAgent,
      this.sessionId,
      this.createdAt
    );
  }

  updateMetadata(metadata: Record<string, any>): UserActivity {
    return new UserActivity(
      this.id,
      this.userId,
      this.type,
      this.action,
      this.description,
      this.resource,
      this.resourceId,
      { ...this.metadata, ...metadata },
      this.ipAddress,
      this.userAgent,
      this.sessionId,
      this.createdAt
    );
  }

  // Business validation methods
  isAuthenticationActivity(): boolean {
    return ['login', 'logout', 'register', 'password_reset', 'mfa_setup'].includes(this.type);
  }

  isProfileActivity(): boolean {
    return ['profile_update', 'avatar_upload', 'profile_view'].includes(this.type);
  }

  isSettingsActivity(): boolean {
    return ['settings_update', 'preference_change', 'security_update'].includes(this.type);
  }

  isRoleActivity(): boolean {
    return ['role_assign', 'role_revoke', 'permission_change'].includes(this.type);
  }

  isSystemActivity(): boolean {
    return ['system_login', 'admin_action', 'system_config'].includes(this.type);
  }

  isSecurityActivity(): boolean {
    return ['login_attempt', 'password_change', 'mfa_verify', 'account_lock'].includes(this.type);
  }

  isRecent(minutes: number = 60): boolean {
    const now = new Date();
    const diffInMinutes = (now.getTime() - this.createdAt.getTime()) / (1000 * 60);
    return diffInMinutes <= minutes;
  }

  isToday(): boolean {
    const today = new Date();
    return (
      this.createdAt.getDate() === today.getDate() &&
      this.createdAt.getMonth() === today.getMonth() &&
      this.createdAt.getFullYear() === today.getFullYear()
    );
  }

  isThisWeek(): boolean {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    return this.createdAt >= weekStart;
  }

  isThisMonth(): boolean {
    const now = new Date();
    return (
      this.createdAt.getMonth() === now.getMonth() &&
      this.createdAt.getFullYear() === now.getFullYear()
    );
  }

  // Static factory methods for common activity types
  static createLoginActivity(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    success?: boolean;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'login',
      action: data.success ? 'success' : 'failed',
      description: data.success ? 'User logged in successfully' : 'User login attempt failed',
      resource: 'authentication',
      metadata: {
        ...data.metadata,
        success: data.success || false
      },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionId: data.sessionId
    });
  }

  static createLogoutActivity(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'logout',
      action: 'success',
      description: 'User logged out',
      resource: 'authentication',
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionId: data.sessionId
    });
  }

  static createProfileUpdateActivity(data: {
    userId: string;
    fieldsUpdated: string[];
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'profile_update',
      action: 'update',
      description: `User updated profile: ${data.fieldsUpdated.join(', ')}`,
      resource: 'profile',
      metadata: {
        ...data.metadata,
        fieldsUpdated: data.fieldsUpdated
      },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  }

  static createSettingsUpdateActivity(data: {
    userId: string;
    category: string;
    settingsChanged: string[];
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'settings_update',
      action: 'update',
      description: `User updated ${data.category} settings: ${data.settingsChanged.join(', ')}`,
      resource: 'settings',
      metadata: {
        ...data.metadata,
        category: data.category,
        settingsChanged: data.settingsChanged
      },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  }

  static createRoleAssignmentActivity(data: {
    userId: string;
    roleId: string;
    roleName: string;
    assignedBy: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'role_assign',
      action: 'assign',
      description: `Role "${data.roleName}" assigned to user`,
      resource: 'role',
      resourceId: data.roleId,
      metadata: {
        ...data.metadata,
        roleName: data.roleName,
        assignedBy: data.assignedBy
      },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  }

  static createAvatarUploadActivity(data: {
    userId: string;
    fileName: string;
    fileSize: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): UserActivity {
    return UserActivity.create({
      userId: data.userId,
      type: 'avatar_upload',
      action: 'upload',
      description: `User uploaded avatar: ${data.fileName}`,
      resource: 'avatar',
      metadata: {
        ...data.metadata,
        fileName: data.fileName,
        fileSize: data.fileSize
      },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.string().min(1).max(50),
    action: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    resource: z.string().max(255).optional(),
    resourceId: z.string().uuid().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    ipAddress: z.string().max(45).optional(), // IPv6 compatible
    userAgent: z.string().max(1000).optional(),
    sessionId: z.string().uuid().optional(),
    createdAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    type: z.string().min(1).max(50),
    action: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    resource: z.string().max(255).optional(),
    resourceId: z.string().uuid().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    ipAddress: z.string().max(45).optional(),
    userAgent: z.string().max(1000).optional(),
    sessionId: z.string().uuid().optional()
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = UserActivity.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = UserActivity.createSchema.safeParse(data);
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
      type: this.type,
      action: this.action,
      description: this.description,
      resource: this.resource,
      resourceId: this.resourceId,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
      createdAt: this.createdAt
    };
  }
}