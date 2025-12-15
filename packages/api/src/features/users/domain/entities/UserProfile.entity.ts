import { z } from 'zod';

// UserProfile entity with business logic
export class UserProfile {
  constructor(
    public readonly id: string,
    public userId: string,
    public firstName?: string,
    public lastName?: string,
    public displayName?: string,
    public bio?: string,
    public website?: string,
    public location?: string,
    public timezone: string = 'UTC',
    public language: string = 'en',
    public gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say',
    public dateOfBirth?: Date,
    public phoneNumber?: string,
    public isPhoneVerified: boolean = false,
    public socialLinks?: Record<string, string>,
    public preferences?: Record<string, any>,
    public isEmailVerified: boolean = false,
    public avatarUrl?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Factory method to create a new user profile
  static create(data: {
    userId: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    website?: string;
    location?: string;
    timezone?: string;
    language?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    dateOfBirth?: Date;
    phoneNumber?: string;
    isPhoneVerified?: boolean;
    socialLinks?: Record<string, string>;
    preferences?: Record<string, any>;
    avatarUrl?: string;
    isEmailVerified?: boolean;
  }): UserProfile {
    const id = crypto.randomUUID();
    const now = new Date();

    // Generate displayName from firstName and lastName if not provided
    let displayName = data.displayName;
    if (!displayName && (data.firstName || data.lastName)) {
      const parts = [data.firstName, data.lastName].filter(Boolean);
      displayName = parts.join(' ');
    }

    return new UserProfile(
      id,
      data.userId,
      data.firstName?.trim(),
      data.lastName?.trim(),
      displayName?.trim(),
      data.bio?.trim(),
      data.website?.trim(),
      data.location?.trim(),
      data.timezone || 'UTC',
      data.language || 'en',
      data.gender,
      data.dateOfBirth,
      data.phoneNumber?.trim(),
      data.isPhoneVerified || false,
      data.socialLinks || {},
      data.preferences || {},
      data.isEmailVerified || false,
      data.avatarUrl,
      now,
      now
    );
  }

  // Business logic methods
  updatePersonalInfo(data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    website?: string;
    location?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    dateOfBirth?: Date;
  }): UserProfile {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() <= this.updatedAt.getTime()) {
      now.setTime(this.updatedAt.getTime() + 1);
    }

    // Generate displayName from firstName and lastName if not provided
    let displayName = data.displayName;
    if (!displayName && (data.firstName || data.lastName)) {
      const parts = [data.firstName, data.lastName].filter(Boolean);
      displayName = parts.join(' ');
    }

    return new UserProfile(
      this.id,
      this.userId,
      data.firstName?.trim() || this.firstName,
      data.lastName?.trim() || this.lastName,
      displayName?.trim() || this.displayName,
      data.bio?.trim() || this.bio,
      data.website?.trim() || this.website,
      data.location?.trim() || this.location,
      this.timezone,
      this.language,
      data.gender || this.gender,
      data.dateOfBirth || this.dateOfBirth,
      this.phoneNumber,
      this.isPhoneVerified,
      this.socialLinks,
      this.preferences,
      this.isEmailVerified,
      this.avatarUrl,
      this.createdAt,
      now
    );
  }

  updateContactInfo(data: {
    phoneNumber?: string;
    isPhoneVerified?: boolean;
  }): UserProfile {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() <= this.updatedAt.getTime()) {
      now.setTime(this.updatedAt.getTime() + 1);
    }

    return new UserProfile(
      this.id,
      this.userId,
      this.firstName,
      this.lastName,
      this.displayName,
      this.bio,
      this.website,
      this.location,
      this.timezone,
      this.language,
      this.gender,
      this.dateOfBirth,
      data.phoneNumber?.trim() || this.phoneNumber,
      data.isPhoneVerified !== undefined ? data.isPhoneVerified : this.isPhoneVerified,
      this.socialLinks,
      this.preferences,
      this.isEmailVerified,
      this.avatarUrl,
      this.createdAt,
      now
    );
  }

  updatePreferences(data: {
    timezone?: string;
    language?: string;
    socialLinks?: Record<string, string>;
    preferences?: Record<string, any>;
  }): UserProfile {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() <= this.updatedAt.getTime()) {
      now.setTime(this.updatedAt.getTime() + 1);
    }

    return new UserProfile(
      this.id,
      this.userId,
      this.firstName,
      this.lastName,
      this.displayName,
      this.bio,
      this.website,
      this.location,
      data.timezone || this.timezone,
      data.language || this.language,
      this.gender,
      this.dateOfBirth,
      this.phoneNumber,
      this.isPhoneVerified,
      data.socialLinks || this.socialLinks,
      data.preferences || this.preferences,
      this.isEmailVerified,
      this.avatarUrl,
      this.createdAt,
      now
    );
  }

  verifyPhoneNumber(): UserProfile {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() <= this.updatedAt.getTime()) {
      now.setTime(this.updatedAt.getTime() + 1);
    }

    return new UserProfile(
      this.id,
      this.userId,
      this.firstName,
      this.lastName,
      this.displayName,
      this.bio,
      this.website,
      this.location,
      this.timezone,
      this.language,
      this.gender,
      this.dateOfBirth,
      this.phoneNumber,
      true, // Set phone as verified
      this.socialLinks,
      this.preferences,
      this.isEmailVerified,
      this.avatarUrl,
      this.createdAt,
      now
    );
  }

  updateAvatar(avatarUrl: string): UserProfile {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() <= this.updatedAt.getTime()) {
      now.setTime(this.updatedAt.getTime() + 1);
    }

    return new UserProfile(
      this.id,
      this.userId,
      this.firstName,
      this.lastName,
      this.displayName,
      this.bio,
      this.website,
      this.location,
      this.timezone,
      this.language,
      this.gender,
      this.dateOfBirth,
      this.phoneNumber,
      this.isPhoneVerified,
      this.socialLinks,
      this.preferences,
      this.isEmailVerified,
      avatarUrl,
      this.createdAt,
      now
    );
  }

  // Business validation methods
  getFullName(): string {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.join(' ');
  }

  getDisplayName(): string {
    return this.displayName || this.getFullName() || 'Unknown User';
  }

  hasValidWebsite(): boolean {
    if (!this.website) return true; // No website is valid
    try {
      new URL(this.website);
      return true;
    } catch {
      return false;
    }
  }

  isAdult(): boolean {
    if (!this.dateOfBirth) return false;
    const today = new Date();
    const age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    displayName: z.string().max(255).optional(),
    bio: z.string().max(1000).optional(),
    website: z.string().max(500).optional(),
    location: z.string().max(255).optional(),
    timezone: z.string().max(50),
    language: z.string().max(10),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    dateOfBirth: z.date().optional(),
    phoneNumber: z.string().max(20).optional(),
    isPhoneVerified: z.boolean(),
    socialLinks: z.record(z.string(), z.string()).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
    avatarUrl: z.string().optional(),
    isEmailVerified: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    displayName: z.string().max(255).optional(),
    bio: z.string().max(1000).optional(),
    website: z.string().max(500).optional(),
    location: z.string().max(255).optional(),
    timezone: z.string().max(50).default('UTC'),
    language: z.string().max(10).default('en'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    dateOfBirth: z.date().optional(),
    phoneNumber: z.string().max(20).optional(),
    isPhoneVerified: z.boolean().default(false),
    socialLinks: z.record(z.string(), z.string()).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
    avatarUrl: z.string().optional(),
    isEmailVerified: z.boolean()
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = UserProfile.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = UserProfile.createSchema.safeParse(data);
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
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      bio: this.bio,
      website: this.website,
      location: this.location,
      timezone: this.timezone,
      language: this.language,
      gender: this.gender,
      dateOfBirth: this.dateOfBirth,
      phoneNumber: this.phoneNumber,
      isPhoneVerified: this.isPhoneVerified,
      socialLinks: this.socialLinks,
      preferences: this.preferences,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}