import { z } from 'zod';

export class NotificationRecipient {
  constructor(
    public readonly id: string,
    public notificationId: string,
    public userId: string,
    public type: 'to' | 'cc' | 'bcc' = 'to',
    public email?: string,
    public phone?: string,
    public deviceToken?: string,
    public metadata: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: {
    notificationId: string;
    userId: string;
    type?: 'to' | 'cc' | 'bcc';
    email?: string;
    phone?: string;
    deviceToken?: string;
    metadata?: Record<string, any>;
  }): NotificationRecipient {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationRecipient(
      id,
      data.notificationId,
      data.userId,
      data.type || 'to',
      data.email,
      data.phone,
      data.deviceToken,
      data.metadata || {},
      now,
      now
    );
  }

  // Business logic methods
  updateEmail(newEmail?: string): NotificationRecipient {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationRecipient(
      this.id,
      this.notificationId,
      this.userId,
      this.type,
      newEmail?.trim(),
      this.phone,
      this.deviceToken,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updatePhone(newPhone?: string): NotificationRecipient {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationRecipient(
      this.id,
      this.notificationId,
      this.userId,
      this.type,
      this.email,
      newPhone?.trim(),
      this.deviceToken,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateDeviceToken(newDeviceToken?: string): NotificationRecipient {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationRecipient(
      this.id,
      this.notificationId,
      this.userId,
      this.type,
      this.email,
      this.phone,
      newDeviceToken?.trim(),
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateMetadata(newMetadata: Record<string, any>): NotificationRecipient {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationRecipient(
      this.id,
      this.notificationId,
      this.userId,
      this.type,
      this.email,
      this.phone,
      this.deviceToken,
      { ...this.metadata, ...newMetadata },
      this.createdAt,
      now
    );
  }

  // Helper methods
  hasEmail(): boolean {
    return this.email !== undefined && this.email.length > 0;
  }

  hasPhone(): boolean {
    return this.phone !== undefined && this.phone.length > 0;
  }

  hasDeviceToken(): boolean {
    return this.deviceToken !== undefined && this.deviceToken.length > 0;
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    notificationId: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.enum(['to', 'cc', 'bcc']),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    deviceToken: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationRecipient.schema.safeParse(this);
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
      notificationId: this.notificationId,
      userId: this.userId,
      type: this.type,
      email: this.email,
      phone: this.phone,
      deviceToken: this.deviceToken,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}