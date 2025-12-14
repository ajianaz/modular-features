import { z } from 'zod';

// UserSettings entity with business logic
export class UserSettings {
  constructor(
    public readonly id: string,
    public userId: string,
    public theme: 'light' | 'dark' | 'auto' = 'auto',
    public language: string = 'en',
    public timezone: string = 'UTC',
    public emailNotifications: boolean = true,
    public pushNotifications: boolean = true,
    public smsNotifications: boolean = false,
    public marketingEmails: boolean = false,
    public twoFactorEnabled: boolean = false,
    public sessionTimeout: number = 24, // hours
    public autoSaveDrafts: boolean = true,
    public showOnlineStatus: boolean = true,
    public profileVisibility: 'public' | 'private' | 'friends' = 'public',
    public customSettings?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method to create new user settings
  static create(data: {
    userId: string;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
    autoSaveDrafts?: boolean;
    showOnlineStatus?: boolean;
    profileVisibility?: 'public' | 'private' | 'friends';
    customSettings?: Record<string, any>;
  }): UserSettings {
    const id = crypto.randomUUID();
    const now = new Date();

    return new UserSettings(
      id,
      data.userId,
      data.theme || 'auto',
      data.language || 'en',
      data.timezone || 'UTC',
      data.emailNotifications !== undefined ? data.emailNotifications : true,
      data.pushNotifications !== undefined ? data.pushNotifications : true,
      data.smsNotifications !== undefined ? data.smsNotifications : false,
      data.marketingEmails !== undefined ? data.marketingEmails : false,
      data.twoFactorEnabled || false,
      data.sessionTimeout || 24,
      data.autoSaveDrafts !== undefined ? data.autoSaveDrafts : true,
      data.showOnlineStatus !== undefined ? data.showOnlineStatus : true,
      data.profileVisibility || 'public',
      data.customSettings,
      now,
      now
    );
  }

  // Business logic methods
  updateAppearance(data: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
  }): UserSettings {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserSettings(
      this.id,
      this.userId,
      data.theme || this.theme,
      data.language || this.language,
      data.timezone || this.timezone,
      this.emailNotifications,
      this.pushNotifications,
      this.smsNotifications,
      this.marketingEmails,
      this.twoFactorEnabled,
      this.sessionTimeout,
      this.autoSaveDrafts,
      this.showOnlineStatus,
      this.profileVisibility,
      this.customSettings,
      this.createdAt,
      now
    );
  }

  updateNotifications(data: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  }): UserSettings {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserSettings(
      this.id,
      this.userId,
      this.theme,
      this.language,
      this.timezone,
      data.emailNotifications !== undefined ? data.emailNotifications : this.emailNotifications,
      data.pushNotifications !== undefined ? data.pushNotifications : this.pushNotifications,
      data.smsNotifications !== undefined ? data.smsNotifications : this.smsNotifications,
      data.marketingEmails !== undefined ? data.marketingEmails : this.marketingEmails,
      this.twoFactorEnabled,
      this.sessionTimeout,
      this.autoSaveDrafts,
      this.showOnlineStatus,
      this.profileVisibility,
      this.customSettings,
      this.createdAt,
      now
    );
  }

  updateSecurity(data: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
  }): UserSettings {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserSettings(
      this.id,
      this.userId,
      this.theme,
      this.language,
      this.timezone,
      this.emailNotifications,
      this.pushNotifications,
      this.smsNotifications,
      this.marketingEmails,
      data.twoFactorEnabled !== undefined ? data.twoFactorEnabled : this.twoFactorEnabled,
      data.sessionTimeout || this.sessionTimeout,
      this.autoSaveDrafts,
      this.showOnlineStatus,
      this.profileVisibility,
      this.customSettings,
      this.createdAt,
      now
    );
  }

  updatePrivacy(data: {
    showOnlineStatus?: boolean;
    profileVisibility?: 'public' | 'private' | 'friends';
  }): UserSettings {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserSettings(
      this.id,
      this.userId,
      this.theme,
      this.language,
      this.timezone,
      this.emailNotifications,
      this.pushNotifications,
      this.smsNotifications,
      this.marketingEmails,
      this.twoFactorEnabled,
      this.sessionTimeout,
      this.autoSaveDrafts,
      data.showOnlineStatus !== undefined ? data.showOnlineStatus : this.showOnlineStatus,
      data.profileVisibility || this.profileVisibility,
      this.customSettings,
      this.createdAt,
      now
    );
  }

  updatePreferences(data: {
    autoSaveDrafts?: boolean;
    customSettings?: Record<string, any>;
  }): UserSettings {
    const now = new Date();
    // Ensure updatedAt is different from the original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new UserSettings(
      this.id,
      this.userId,
      this.theme,
      this.language,
      this.timezone,
      this.emailNotifications,
      this.pushNotifications,
      this.smsNotifications,
      this.marketingEmails,
      this.twoFactorEnabled,
      this.sessionTimeout,
      data.autoSaveDrafts !== undefined ? data.autoSaveDrafts : this.autoSaveDrafts,
      this.showOnlineStatus,
      this.profileVisibility,
      data.customSettings || this.customSettings,
      this.createdAt,
      now
    );
  }

  enableTwoFactor(): UserSettings {
    return this.updateSecurity({ twoFactorEnabled: true });
  }

  disableTwoFactor(): UserSettings {
    return this.updateSecurity({ twoFactorEnabled: false });
  }

  // Business validation methods
  isSecureSession(): boolean {
    return this.sessionTimeout <= 24; // Consider 24 hours or less as secure
  }

  hasEmailNotifications(): boolean {
    return this.emailNotifications || this.marketingEmails;
  }

  hasPushNotifications(): boolean {
    return this.pushNotifications;
  }

  isPrivateProfile(): boolean {
    return this.profileVisibility === 'private';
  }

  isPublicProfile(): boolean {
    return this.profileVisibility === 'public';
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().max(10),
    timezone: z.string().max(50),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    marketingEmails: z.boolean(),
    twoFactorEnabled: z.boolean(),
    sessionTimeout: z.number().min(1).max(168), // 1 hour to 1 week
    autoSaveDrafts: z.boolean(),
    showOnlineStatus: z.boolean(),
    profileVisibility: z.enum(['public', 'private', 'friends']),
    customSettings: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().max(10).default('en'),
    timezone: z.string().max(50).default('UTC'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    marketingEmails: z.boolean().default(false),
    twoFactorEnabled: z.boolean().default(false),
    sessionTimeout: z.number().min(1).max(168).default(24),
    autoSaveDrafts: z.boolean().default(true),
    showOnlineStatus: z.boolean().default(true),
    profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
    customSettings: z.record(z.string(), z.any()).optional()
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = UserSettings.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = UserSettings.createSchema.safeParse(data);
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
      theme: this.theme,
      language: this.language,
      timezone: this.timezone,
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
      smsNotifications: this.smsNotifications,
      marketingEmails: this.marketingEmails,
      twoFactorEnabled: this.twoFactorEnabled,
      sessionTimeout: this.sessionTimeout,
      autoSaveDrafts: this.autoSaveDrafts,
      showOnlineStatus: this.showOnlineStatus,
      profileVisibility: this.profileVisibility,
      customSettings: this.customSettings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}