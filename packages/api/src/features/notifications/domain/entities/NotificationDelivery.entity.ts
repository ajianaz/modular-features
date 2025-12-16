import { z } from 'zod';
import { NotificationChannel } from '../types';

export class NotificationDelivery {
  constructor(
    public readonly id: string,
    public notificationId: string,
    public channel: NotificationChannel,
    public recipient: string,
    public status: 'pending' | 'sent' | 'delivered' | 'failed' = 'pending',
    public messageId?: string,
    public error?: string,
    public metadata: Record<string, any> = {},
    public sentAt?: Date,
    public deliveredAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: {
    notificationId: string;
    channel: NotificationChannel;
    recipient: string;
  }): NotificationDelivery {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationDelivery(
      id,
      data.notificationId,
      data.channel,
      data.recipient,
      'pending',
      undefined, // messageId
      undefined, // error
      {}, // metadata
      undefined, // sentAt
      undefined, // deliveredAt
      now,
      now
    );
  }

  // Business logic methods
  markAsSent(messageId?: string): NotificationDelivery {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationDelivery(
      this.id,
      this.notificationId,
      this.channel,
      this.recipient,
      'sent',
      messageId,
      this.error,
      this.metadata,
      now,
      this.deliveredAt,
      this.createdAt,
      now
    );
  }

  markAsDelivered(): NotificationDelivery {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationDelivery(
      this.id,
      this.notificationId,
      this.channel,
      this.recipient,
      'delivered',
      this.messageId,
      this.error,
      this.metadata,
      this.sentAt,
      now,
      this.createdAt,
      now
    );
  }

  markAsFailed(error: string): NotificationDelivery {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationDelivery(
      this.id,
      this.notificationId,
      this.channel,
      this.recipient,
      'failed',
      this.messageId,
      error,
      this.metadata,
      this.sentAt,
      this.deliveredAt,
      this.createdAt,
      now
    );
  }

  // Helper methods
  isPending(): boolean {
    return this.status === 'pending';
  }

  isSent(): boolean {
    return this.status === 'sent';
  }

  isDelivered(): boolean {
    return this.status === 'delivered';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    notificationId: z.string().uuid(),
    channel: z.nativeEnum(NotificationChannel),
    recipient: z.string().min(1).max(500),
    status: z.enum(['pending', 'sent', 'delivered', 'failed']),
    messageId: z.string().optional(),
    error: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    sentAt: z.date().optional(),
    deliveredAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationDelivery.schema.safeParse(this);
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
      channel: this.channel,
      recipient: this.recipient,
      status: this.status,
      messageId: this.messageId,
      error: this.error,
      metadata: this.metadata,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}