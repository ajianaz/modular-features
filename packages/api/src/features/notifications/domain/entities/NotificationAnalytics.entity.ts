import { z } from 'zod';
import { NotificationType, NotificationChannel, NotificationStatus } from '../types';

export class NotificationAnalytics {
  constructor(
    public readonly id: string,
    public notificationId: string,
    public event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced',
    public channel?: NotificationChannel,
    public timestamp: Date = new Date(),
    public metadata: Record<string, any> = {},
    public userAgent?: string,
    public ipAddress?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: {
    notificationId: string;
    event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
    channel?: NotificationChannel;
    timestamp?: Date;
    metadata?: Record<string, any>;
    userAgent?: string;
    ipAddress?: string;
  }): NotificationAnalytics {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationAnalytics(
      id,
      data.notificationId,
      data.event,
      data.channel,
      data.timestamp || now,
      data.metadata || {},
      data.userAgent,
      data.ipAddress,
      now,
      now
    );
  }

  // Business logic methods
  updateMetadata(newMetadata: Record<string, any>): NotificationAnalytics {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationAnalytics(
      this.id,
      this.notificationId,
      this.event,
      this.channel,
      this.timestamp,
      { ...this.metadata, ...newMetadata },
      this.userAgent,
      this.ipAddress,
      this.createdAt,
      now
    );
  }

  // Helper methods
  isSent(): boolean {
    return this.event === 'sent';
  }

  isDelivered(): boolean {
    return this.event === 'delivered';
  }

  isOpened(): boolean {
    return this.event === 'opened';
  }

  isClicked(): boolean {
    return this.event === 'clicked';
  }

  isFailed(): boolean {
    return this.event === 'failed';
  }

  isBounced(): boolean {
    return this.event === 'bounced';
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    notificationId: z.string().uuid(),
    event: z.enum(['sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced']),
    channel: z.nativeEnum(NotificationChannel).optional(),
    timestamp: z.date(),
    metadata: z.record(z.string(), z.any()).optional(),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationAnalytics.schema.safeParse(this);
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
      event: this.event,
      channel: this.channel,
      timestamp: this.timestamp,
      metadata: this.metadata,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}