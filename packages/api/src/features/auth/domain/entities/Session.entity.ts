import { z } from 'zod';

// Session entity with token management
export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date,
    public readonly lastAccessedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
    public isActive: boolean = true
  ) {}

  // Factory method to create a new session
  static create(data: {
    userId: string;
    token: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Session {
    const id = crypto.randomUUID();
    const now = new Date();

    return new Session(
      id,
      data.userId,
      data.token,
      data.refreshToken,
      data.expiresAt,
      now, // lastAccessedAt
      now, // createdAt
      now, // updatedAt
      data.userAgent,
      data.ipAddress,
      true // isActive
    );
  }

  // Business logic methods
  deactivate(): Session {
    return new Session(
      this.id,
      this.userId,
      this.token,
      this.refreshToken,
      this.expiresAt,
      this.lastAccessedAt,
      this.createdAt,
      new Date(), // updatedAt
      this.userAgent,
      this.ipAddress,
      false // isActive
    );
  }

  updateLastAccessed(): Session {
    return new Session(
      this.id,
      this.userId,
      this.token,
      this.refreshToken,
      this.expiresAt,
      new Date(), // lastAccessedAt
      this.createdAt,
      new Date(), // updatedAt
      this.userAgent,
      this.ipAddress,
      this.isActive
    );
  }

  refreshTokens(newToken: string, newRefreshToken: string, newExpiresAt: Date): Session {
    return new Session(
      this.id,
      this.userId,
      newToken,
      newRefreshToken,
      newExpiresAt,
      new Date(), // lastAccessedAt
      this.createdAt,
      new Date(), // updatedAt
      this.userAgent,
      this.ipAddress,
      this.isActive
    );
  }

  // Business validation methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  isExpiringSoon(minutesThreshold: number = 15): boolean {
    const thresholdTime = new Date();
    thresholdTime.setMinutes(thresholdTime.getMinutes() + minutesThreshold);
    return this.expiresAt <= thresholdTime;
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    token: z.string().min(1),
    refreshToken: z.string().min(1),
    userAgent: z.string().optional(),
    ipAddress: z.string().max(45).optional(), // IPv6 compatible
    isActive: z.boolean(),
    expiresAt: z.date(),
    lastAccessedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    token: z.string().min(1),
    refreshToken: z.string().min(1),
    userAgent: z.string().optional(),
    ipAddress: z.string().max(45).optional(),
    expiresAt: z.date().min(new Date())
  });

  // Validation methods
  validate(): { isValid: boolean; errors: string[] } {
    const result = Session.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = Session.createSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Safe JSON serialization
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      isActive: this.isActive,
      expiresAt: this.expiresAt,
      lastAccessedAt: this.lastAccessedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // For internal use (includes tokens)
  toInternalJSON() {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      refreshToken: this.refreshToken,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      isActive: this.isActive,
      expiresAt: this.expiresAt,
      lastAccessedAt: this.lastAccessedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}