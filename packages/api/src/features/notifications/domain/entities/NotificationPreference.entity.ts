import { z } from 'zod';
import {
  NotificationChannel,
  NotificationFrequency,
  CreateNotificationPreferenceData
} from '../types';

export class NotificationPreference {
  constructor(
    public readonly id: string,
    public userId: string,
    public type: string,
    public emailEnabled: boolean = true,
    public smsEnabled: boolean = false,
    public pushEnabled: boolean = true,
    public inAppEnabled: boolean = true,
    public frequency: NotificationFrequency = NotificationFrequency.IMMEDIATE,
    public quietHoursEnabled: boolean = false,
    public quietHoursStart?: string,
    public quietHoursEnd?: string,
    public timezone: string = 'UTC',
    public metadata: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: CreateNotificationPreferenceData): NotificationPreference {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationPreference(
      id,
      data.userId,
      data.type,
      data.emailEnabled ?? true,
      data.smsEnabled ?? false,
      data.pushEnabled ?? true,
      data.inAppEnabled ?? true,
      data.frequency ?? NotificationFrequency.IMMEDIATE,
      data.quietHoursEnabled ?? false,
      data.quietHoursStart,
      data.quietHoursEnd,
      data.timezone ?? 'UTC',
      data.metadata || {},
      now,
      now
    );
  }

  // Business logic methods
  isChannelEnabled(channel: NotificationChannel): boolean {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return this.emailEnabled;
      case NotificationChannel.SMS:
        return this.smsEnabled;
      case NotificationChannel.PUSH:
        return this.pushEnabled;
      case NotificationChannel.IN_APP:
        return this.inAppEnabled;
      default:
        return true;
    }
  }

  isInQuietHours(): boolean {
    if (!this.quietHoursEnabled) {
      return false;
    }

    const now = new Date(Date.now());
    const currentTime = this.formatTime(now.getHours(), now.getMinutes());

    if (!this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    return this.isTimeInRange(currentTime, this.quietHoursStart, this.quietHoursEnd);
  }

  private formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private isTimeInRange(current: string, start: string, end: string): boolean {
    if (start > end) {
      // Overnight range (e.g., 22:00 to 06:00)
      return current >= start || current <= end;
    } else {
      // Same day range
      return current >= start && current <= end;
    }
  }

  // Update methods
  updateEmailEnabled(enabled: boolean): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      enabled,
      this.smsEnabled,
      this.pushEnabled,
      this.inAppEnabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateSmsEnabled(enabled: boolean): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      enabled,
      this.pushEnabled,
      this.inAppEnabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updatePushEnabled(enabled: boolean): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      enabled,
      this.inAppEnabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateInAppEnabled(enabled: boolean): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      this.pushEnabled,
      enabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateFrequency(frequency: NotificationFrequency): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      this.pushEnabled,
      this.inAppEnabled,
      frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateQuietHours(enabled: boolean, start?: string, end?: string): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      this.pushEnabled,
      this.inAppEnabled,
      this.frequency,
      enabled,
      start,
      end,
      this.timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateTimezone(timezone: string): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      this.pushEnabled,
      this.inAppEnabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      timezone,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateMetadata(metadata: Record<string, any>): NotificationPreference {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationPreference(
      this.id,
      this.userId,
      this.type,
      this.emailEnabled,
      this.smsEnabled,
      this.pushEnabled,
      this.inAppEnabled,
      this.frequency,
      this.quietHoursEnabled,
      this.quietHoursStart,
      this.quietHoursEnd,
      this.timezone,
      { ...this.metadata, ...metadata }, // Merge metadata
      this.createdAt,
      now
    );
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.string().min(1).max(100),
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
    frequency: z.nativeEnum(NotificationFrequency),
    quietHoursEnabled: z.boolean(),
    quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().min(1).max(50),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    type: z.string().min(1).max(100),
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
    frequency: z.nativeEnum(NotificationFrequency).optional(),
    quietHoursEnabled: z.boolean().optional(),
    quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().min(1).max(50).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationPreference.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = NotificationPreference.createSchema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Safe serialization
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      emailEnabled: this.emailEnabled,
      smsEnabled: this.smsEnabled,
      pushEnabled: this.pushEnabled,
      inAppEnabled: this.inAppEnabled,
      frequency: this.frequency,
      quietHoursEnabled: this.quietHoursEnabled,
      quietHoursStart: this.quietHoursStart,
      quietHoursEnd: this.quietHoursEnd,
      timezone: this.timezone,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}