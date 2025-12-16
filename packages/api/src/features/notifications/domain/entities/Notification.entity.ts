import { z } from 'zod';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  CreateNotificationData,
  NotificationDeliveryResult,
  GetNotificationsOptions
} from '../types';

export class Notification {
  constructor(
    public readonly id: string,
    public userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public channels: NotificationChannel[],
    public status: NotificationStatus = NotificationStatus.PENDING,
    public priority: NotificationPriority = NotificationPriority.NORMAL,
    public templateId?: string,
    public scheduledFor?: Date,
    public sentAt?: Date,
    public deliveredAt?: Date,
    public readAt?: Date,
    public expiresAt?: Date,
    public metadata: Record<string, any> = {},
    public deliveryData: Record<string, any> = {},
    public retryCount: number = 0,
    public maxRetries: number = 3,
    public lastError?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method for creation
  static create(data: CreateNotificationData): Notification {
    const id = crypto.randomUUID();
    const now = new Date();

    return new Notification(
      id,
      data.userId,
      data.type,
      data.title,
      data.message,
      data.channels,
      NotificationStatus.PENDING,
      data.priority || NotificationPriority.NORMAL,
      data.templateId,
      data.scheduledFor,
      undefined, // sentAt
      undefined, // deliveredAt
      undefined, // readAt
      data.expiresAt,
      data.metadata || {},
      {}, // deliveryData
      0, // retryCount
      3, // maxRetries
      undefined, // lastError
      now,
      now
    );
  }

  // Business logic methods
  markAsSent(): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.SENT,
      this.priority,
      this.templateId,
      this.scheduledFor,
      now,
      this.deliveredAt,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      this.lastError,
      this.createdAt,
      now
    );
  }

  markAsDelivered(): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.DELIVERED,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      now,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      this.lastError,
      this.createdAt,
      now
    );
  }

  markAsRead(): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.DELIVERED,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      this.deliveredAt,
      now,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      this.lastError,
      this.createdAt,
      now
    );
  }

  markAsProcessing(): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.PROCESSING,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      this.deliveredAt,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      this.lastError,
      this.createdAt,
      now
    );
  }

  markAsFailed(error?: string): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.FAILED,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      this.deliveredAt,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      error,
      this.createdAt,
      now
    );
  }

  incrementRetry(error?: string): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.FAILED,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      this.deliveredAt,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount + 1,
      this.maxRetries,
      error,
      this.createdAt,
      now
    );
  }

  markAsCancelled(): Notification {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.message,
      this.channels,
      NotificationStatus.CANCELLED,
      this.priority,
      this.templateId,
      this.scheduledFor,
      this.sentAt,
      this.deliveredAt,
      this.readAt,
      this.expiresAt,
      this.metadata,
      this.deliveryData,
      this.retryCount,
      this.maxRetries,
      this.lastError,
      this.createdAt,
      now
    );
  }

  // Helper methods
  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === NotificationStatus.FAILED;
  }

  isScheduled(): boolean {
    return this.scheduledFor ? this.scheduledFor > new Date() : false;
  }

  isRead(): boolean {
    return this.readAt !== undefined;
  }

  isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED;
  }

  isSent(): boolean {
    return this.status === NotificationStatus.SENT;
  }

  isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === NotificationStatus.PROCESSING;
  }

  isCancelled(): boolean {
    return this.status === NotificationStatus.CANCELLED;
  }

  hasChannel(channel: NotificationChannel): boolean {
    return this.channels.includes(channel);
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1),
    status: z.nativeEnum(NotificationStatus),
    priority: z.nativeEnum(NotificationPriority),
    templateId: z.string().uuid().optional(),
    scheduledFor: z.date().optional(),
    sentAt: z.date().optional(),
    deliveredAt: z.date().optional(),
    readAt: z.date().optional(),
    expiresAt: z.date().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    deliveryData: z.record(z.string(), z.any()).optional(),
    retryCount: z.number().int().min(0),
    maxRetries: z.number().int().min(0),
    lastError: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    userId: z.string().uuid(),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1),
    priority: z.nativeEnum(NotificationPriority).optional(),
    templateId: z.string().uuid().optional(),
    scheduledFor: z.date().optional(),
    expiresAt: z.date().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = Notification.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = Notification.createSchema.safeParse(data);
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
      title: this.title,
      message: this.message,
      channels: this.channels,
      status: this.status,
      priority: this.priority,
      templateId: this.templateId,
      scheduledFor: this.scheduledFor,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      readAt: this.readAt,
      expiresAt: this.expiresAt,
      metadata: this.metadata,
      deliveryData: this.deliveryData,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      lastError: this.lastError,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}