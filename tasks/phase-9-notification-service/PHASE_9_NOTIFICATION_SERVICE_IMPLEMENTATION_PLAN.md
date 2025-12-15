# Phase 9.0: Notification Service Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for Phase 9.0 (Notification Service) following the established clean architecture patterns from the authentication feature. The notification service will support multi-channel notifications (email, SMS, push, in-app), template management, user preferences, delivery tracking, and analytics.

## 1. Architecture Overview

### Clean Architecture Implementation

The notification service will follow strict clean architecture with clear separation of concerns:

```
packages/api/src/features/notifications/
├── domain/           # Business logic and entities (innermost layer)
├── application/       # Use cases and application logic
├── infrastructure/    # External dependencies and data access
├── presentation/      # HTTP controllers and routes
└── __tests__/         # Comprehensive test suite
```

### Key Principles

- **Dependency Inversion**: Domain layer defines interfaces, infrastructure implements them
- **Single Responsibility**: Each class has a single, well-defined purpose
- **Open/Closed**: Entities are open for extension, closed for modification
- **Dependency Injection**: Container manages all dependencies
- **Testability**: All components are easily testable with proper abstractions

## 2. Directory Structure

### Complete Directory Layout

```
packages/api/src/features/notifications/
├── index.ts                           # Feature barrel export
├── domain/
│   ├── index.ts                       # Domain barrel export
│   ├── entities/
│   │   ├── index.ts                   # Entity barrel export
│   │   ├── Notification.entity.ts
│   │   ├── NotificationTemplate.entity.ts
│   │   ├── NotificationPreference.entity.ts
│   │   ├── NotificationDelivery.entity.ts
│   │   ├── NotificationGroup.entity.ts
│   │   ├── NotificationRecipient.entity.ts
│   │   └── NotificationAnalytics.entity.ts
│   ├── interfaces/
│   │   ├── index.ts                   # Interface barrel export
│   │   ├── INotificationRepository.ts
│   │   ├── INotificationTemplateRepository.ts
│   │   ├── INotificationPreferenceRepository.ts
│   │   ├── INotificationDeliveryRepository.ts
│   │   ├── INotificationGroupRepository.ts
│   │   ├── INotificationRecipientRepository.ts
│   │   ├── INotificationAnalyticsRepository.ts
│   │   ├── INotificationProvider.ts
│   │   ├── IEmailProvider.ts
│   │   ├── ISmsProvider.ts
│   │   ├── IPushProvider.ts
│   │   ├── IInAppProvider.ts
│   │   ├── ITemplateRenderer.ts
│   │   └── INotificationScheduler.ts
│   └── errors/
│       ├── index.ts                   # Error barrel export
│       ├── NotificationError.ts
│       ├── NotificationNotFoundError.ts
│       ├── NotificationSendError.ts
│       ├── TemplateNotFoundError.ts
│       ├── TemplateValidationError.ts
│       ├── InvalidNotificationDataError.ts
│       ├── NotificationDeliveryError.ts
│       ├── ProviderNotAvailableError.ts
│       └── NotificationPreferencesError.ts
├── application/
│   ├── index.ts                       # Application barrel export
│   ├── usecases/
│   │   ├── index.ts                   # Use case barrel export
│   │   ├── SendNotificationUseCase.ts
│   │   ├── CreateNotificationUseCase.ts
│   │   ├── GetNotificationsUseCase.ts
│   │   ├── MarkNotificationReadUseCase.ts
│   │   ├── UpdateNotificationPreferenceUseCase.ts
│   │   ├── CreateNotificationTemplateUseCase.ts
│   │   ├── UpdateNotificationTemplateUseCase.ts
│   │   ├── GetNotificationTemplatesUseCase.ts
│   │   ├── BulkNotificationUseCase.ts
│   │   ├── ScheduleNotificationUseCase.ts
│   │   ├── CancelNotificationUseCase.ts
│   │   ├── GetNotificationAnalyticsUseCase.ts
│   │   ├── RetryFailedNotificationUseCase.ts
│   │   └── ProcessNotificationQueueUseCase.ts
│   ├── dtos/
│   │   ├── index.ts                   # DTO barrel export
│   │   ├── input/
│   │   │   ├── index.ts               # Input DTO barrel export
│   │   │   ├── SendNotificationRequest.ts
│   │   │   ├── CreateNotificationRequest.ts
│   │   │   ├── GetNotificationsRequest.ts
│   │   │   ├── MarkNotificationReadRequest.ts
│   │   │   ├── UpdateNotificationPreferenceRequest.ts
│   │   │   ├── CreateNotificationTemplateRequest.ts
│   │   │   ├── UpdateNotificationTemplateRequest.ts
│   │   │   ├── GetNotificationTemplatesRequest.ts
│   │   │   ├── BulkNotificationRequest.ts
│   │   │   ├── ScheduleNotificationRequest.ts
│   │   │   ├── CancelNotificationRequest.ts
│   │   │   ├── GetNotificationAnalyticsRequest.ts
│   │   │   └── RetryFailedNotificationRequest.ts
│   │   └── output/
│   │       ├── index.ts               # Output DTO barrel export
│   │       ├── SendNotificationResponse.ts
│   │       ├── CreateNotificationResponse.ts
│   │       ├── GetNotificationsResponse.ts
│   │       ├── MarkNotificationReadResponse.ts
│   │       ├── UpdateNotificationPreferenceResponse.ts
│   │       ├── CreateNotificationTemplateResponse.ts
│   │       ├── UpdateNotificationTemplateResponse.ts
│   │       ├── GetNotificationTemplatesResponse.ts
│   │       ├── BulkNotificationResponse.ts
│   │       ├── ScheduleNotificationResponse.ts
│   │       ├── CancelNotificationResponse.ts
│   │       ├── GetNotificationAnalyticsResponse.ts
│   │       ├── RetryFailedNotificationResponse.ts
│   │       └── NotificationResponse.ts
│   ├── mappers/
│   │   ├── index.ts                   # Mapper barrel export
│   │   ├── NotificationMapper.ts
│   │   ├── NotificationTemplateMapper.ts
│   │   ├── NotificationPreferenceMapper.ts
│   │   ├── NotificationDeliveryMapper.ts
│   │   └── NotificationAnalyticsMapper.ts
│   └── services/
│       ├── index.ts                   # Service barrel export
│       ├── NotificationService.ts
│       ├── TemplateService.ts
│       ├── PreferenceService.ts
│       └── AnalyticsService.ts
├── infrastructure/
│   ├── index.ts                       # Infrastructure barrel export
│   ├── repositories/
│   │   ├── index.ts                   # Repository barrel export
│   │   ├── NotificationRepository.ts
│   │   ├── NotificationTemplateRepository.ts
│   │   ├── NotificationPreferenceRepository.ts
│   │   ├── NotificationDeliveryRepository.ts
│   │   ├── NotificationGroupRepository.ts
│   │   ├── NotificationRecipientRepository.ts
│   │   └── NotificationAnalyticsRepository.ts
│   ├── lib/
│   │   ├── index.ts                   # Library barrel export
│   │   ├── providers/
│   │   │   ├── index.ts               # Provider barrel export
│   │   │   ├── BaseNotificationProvider.ts
│   │   │   ├── EmailProvider.ts
│   │   │   ├── SendGridEmailProvider.ts
│   │   │   ├── SmsProvider.ts
│   │   │   ├── TwilioSmsProvider.ts
│   │   │   ├── PushProvider.ts
│   │   │   ├── FirebasePushProvider.ts
│   │   │   ├── InAppProvider.ts
│   │   │   └── WebhookProvider.ts
│   │   ├── TemplateRenderer.ts
│   │   ├── NotificationScheduler.ts
│   │   ├── NotificationQueue.ts
│   │   ├── NotificationSender.ts
│   │   └── NotificationAnalytics.ts
│   ├── container/
│   │   ├── index.ts                   # Container barrel export
│   │   └── NotificationContainer.ts
│   └── config/
│       ├── index.ts                   # Config barrel export
│       └── NotificationConfig.ts
├── presentation/
│   ├── index.ts                       # Presentation barrel export
│   ├── controllers/
│   │   ├── index.ts                   # Controller barrel export
│   │   ├── SendNotificationController.ts
│   │   ├── GetNotificationsController.ts
│   │   ├── MarkNotificationReadController.ts
│   │   ├── UpdateNotificationPreferenceController.ts
│   │   ├── TemplateController.ts
│   │   ├── BulkNotificationController.ts
│   │   ├── ScheduleNotificationController.ts
│   │   ├── CancelNotificationController.ts
│   │   ├── AnalyticsController.ts
│   │   └── WebhookController.ts
│   ├── routes.ts                      # Route definitions
│   └── middleware/
│       ├── index.ts                   # Middleware barrel export
│       ├── NotificationMiddleware.ts
│       └── RateLimitMiddleware.ts
└── __tests__/
    ├── domain/
    │   ├── entities/
    │   │   ├── Notification.entity.test.ts
    │   │   ├── NotificationTemplate.entity.test.ts
    │   │   ├── NotificationPreference.entity.test.ts
    │   │   ├── NotificationDelivery.entity.test.ts
    │   │   ├── NotificationGroup.entity.test.ts
    │   │   ├── NotificationRecipient.entity.test.ts
    │   │   └── NotificationAnalytics.entity.test.ts
    │   └── errors/
    │       ├── NotificationError.test.ts
    │       ├── NotificationNotFoundError.test.ts
    │       └── NotificationSendError.test.ts
    ├── application/
    │   ├── usecases/
    │   │   ├── SendNotificationUseCase.test.ts
    │   │   ├── CreateNotificationUseCase.test.ts
    │   │   ├── GetNotificationsUseCase.test.ts
    │   │   ├── MarkNotificationReadUseCase.test.ts
    │   │   ├── UpdateNotificationPreferenceUseCase.test.ts
    │   │   ├── CreateNotificationTemplateUseCase.test.ts
    │   │   ├── BulkNotificationUseCase.test.ts
    │   │   └── ScheduleNotificationUseCase.test.ts
    │   ├── dtos/
    │   │   ├── input/
    │   │   │   ├── SendNotificationRequest.test.ts
    │   │   │   └── GetNotificationsRequest.test.ts
    │   │   └── output/
    │   │       └── SendNotificationResponse.test.ts
    │   └── services/
    │       ├── NotificationService.test.ts
    │       └── TemplateService.test.ts
    ├── infrastructure/
    │   ├── repositories/
    │   │   ├── NotificationRepository.test.ts
    │   │   └── NotificationTemplateRepository.test.ts
    │   ├── lib/
    │   │   ├── providers/
    │   │   │   ├── SendGridEmailProvider.test.ts
    │   │   │   ├── TwilioSmsProvider.test.ts
    │   │   │   └── FirebasePushProvider.test.ts
    │   │   ├── TemplateRenderer.test.ts
    │   │   └── NotificationScheduler.test.ts
    │   └── container/
    │       └── NotificationContainer.test.ts
    ├── presentation/
    │   ├── controllers/
    │   │   ├── SendNotificationController.test.ts
    │   │   ├── GetNotificationsController.test.ts
    │   │   └── TemplateController.test.ts
    │   └── routes.test.ts
    └── integration/
        ├── notification-flow.test.ts
        ├── template-management.test.ts
        ├── preference-management.test.ts
        └── analytics-tracking.test.ts
```

## 3. Domain Layer Implementation

### 3.1 Entities

#### Notification Entity
```typescript
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
    // Validation and business logic
    return new Notification(/* ... */);
  }

  // Business logic methods
  markAsSent(): Notification {
    return new Notification(
      this.id, this.userId, this.type, this.title, this.message,
      this.channels, NotificationStatus.SENT, this.priority,
      this.templateId, this.scheduledFor, new Date(),
      this.deliveredAt, this.readAt, this.expiresAt,
      this.metadata, this.deliveryData, this.retryCount,
      this.maxRetries, this.lastError, this.createdAt, new Date()
    );
  }

  markAsDelivered(): Notification {
    return new Notification(
      this.id, this.userId, this.type, this.title, this.message,
      this.channels, NotificationStatus.DELIVERED, this.priority,
      this.templateId, this.scheduledFor, this.sentAt, new Date(),
      this.readAt, this.expiresAt, this.metadata, this.deliveryData,
      this.retryCount, this.maxRetries, this.lastError, this.createdAt, new Date()
    );
  }

  markAsRead(): Notification {
    return new Notification(
      this.id, this.userId, this.type, this.title, this.message,
      this.channels, NotificationStatus.DELIVERED, this.priority,
      this.templateId, this.scheduledFor, this.sentAt, this.deliveredAt,
      new Date(), this.expiresAt, this.metadata, this.deliveryData,
      this.retryCount, this.maxRetries, this.lastError, this.createdAt, new Date()
    );
  }

  incrementRetry(error?: string): Notification {
    return new Notification(
      this.id, this.userId, this.type, this.title, this.message,
      this.channels, NotificationStatus.FAILED, this.priority,
      this.templateId, this.scheduledFor, this.sentAt, this.deliveredAt,
      this.readAt, this.expiresAt, this.metadata, this.deliveryData,
      this.retryCount + 1, this.maxRetries, error, this.createdAt, new Date()
    );
  }

  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === NotificationStatus.FAILED;
  }

  isScheduled(): boolean {
    return this.scheduledFor ? this.scheduledFor > new Date() : false;
  }

  // Validation
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.title || this.title.trim().length === 0) errors.push('Title is required');
    if (!this.message || this.message.trim().length === 0) errors.push('Message is required');
    if (!this.channels || this.channels.length === 0) errors.push('At least one channel is required');

    return {
      isValid: errors.length === 0,
      errors
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
```

#### NotificationTemplate Entity
```typescript
export class NotificationTemplate {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public type: NotificationType,
    public channel: NotificationChannel,
    public subject?: string,
    public template: string,
    public description?: string,
    public variables: Record<string, any> = {},
    public defaultValues: Record<string, any> = {},
    public isSystem: boolean = false,
    public isActive: boolean = true,
    public metadata: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: CreateNotificationTemplateData): NotificationTemplate {
    // Validation and business logic
    return new NotificationTemplate(/* ... */);
  }

  // Business logic methods
  render(variables: Record<string, any>): string {
    // Template rendering logic
    let rendered = this.template;

    // Replace variables in template
    Object.entries({ ...this.defaultValues, ...variables }).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) errors.push('Name is required');
    if (!this.slug || this.slug.trim().length === 0) errors.push('Slug is required');
    if (!this.template || this.template.trim().length === 0) errors.push('Template is required');

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(this.slug)) errors.push('Slug must contain only lowercase letters, numbers, and hyphens');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      type: this.type,
      channel: this.channel,
      subject: this.subject,
      template: this.template,
      description: this.description,
      variables: this.variables,
      defaultValues: this.defaultValues,
      isSystem: this.isSystem,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

#### NotificationPreference Entity
```typescript
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
    return new NotificationPreference(/* ... */);
  }

  // Business logic methods
  isChannelEnabled(channel: NotificationChannel): boolean {
    switch (channel) {
      case NotificationChannel.EMAIL: return this.emailEnabled;
      case NotificationChannel.SMS: return this.smsEnabled;
      case NotificationChannel.PUSH: return this.pushEnabled;
      case NotificationChannel.IN_APP: return this.inAppEnabled;
      default: return true;
    }
  }

  isInQuietHours(): boolean {
    if (!this.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = this.formatTime(now.getHours(), now.getMinutes());

    if (!this.quietHoursStart || !this.quietHoursEnd) return false;

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

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.type || this.type.trim().length === 0) errors.push('Notification type is required');

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (this.quietHoursStart && !timeRegex.test(this.quietHoursStart)) {
      errors.push('Quiet hours start must be in HH:MM format');
    }
    if (this.quietHoursEnd && !timeRegex.test(this.quietHoursEnd)) {
      errors.push('Quiet hours end must be in HH:MM format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

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
```

### 3.2 Enums and Types

```typescript
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

// Types for creation data
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  templateId?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface CreateNotificationTemplateData {
  name: string;
  slug: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string;
  description?: string;
  variables?: Record<string, any>;
  defaultValues?: Record<string, any>;
  isSystem?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateNotificationPreferenceData {
  userId: string;
  type: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  frequency?: NotificationFrequency;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
  metadata?: Record<string, any>;
}
```

### 3.3 Domain Interfaces

```typescript
// Repository interfaces
export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, options?: GetNotificationsOptions): Promise<Notification[]>;
  create(notification: Notification): Promise<Notification>;
  update(notification: Notification): Promise<Notification>;
  delete(id: string): Promise<void>;
  findPendingNotifications(limit?: number): Promise<Notification[]>;
  findScheduledNotifications(before: Date): Promise<Notification[]>;
  findFailedNotifications(maxRetries?: number): Promise<Notification[]>;
  countByStatus(userId?: string): Promise<Record<NotificationStatus, number>>;
}

export interface INotificationTemplateRepository {
  findById(id: string): Promise<NotificationTemplate | null>;
  findBySlug(slug: string): Promise<NotificationTemplate | null>;
  findByType(type: NotificationType): Promise<NotificationTemplate[]>;
  findByChannel(channel: NotificationChannel): Promise<NotificationTemplate[]>;
  create(template: NotificationTemplate): Promise<NotificationTemplate>;
  update(template: NotificationTemplate): Promise<NotificationTemplate>;
  delete(id: string): Promise<void>;
  findActive(): Promise<NotificationTemplate[]>;
}

export interface INotificationPreferenceRepository {
  findById(id: string): Promise<NotificationPreference | null>;
  findByUserId(userId: string): Promise<NotificationPreference[]>;
  findByUserIdAndType(userId: string, type: string): Promise<NotificationPreference | null>;
  create(preference: NotificationPreference): Promise<NotificationPreference>;
  update(preference: NotificationPreference): Promise<NotificationPreference>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

// Provider interfaces
export interface INotificationProvider {
  send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  getType(): NotificationChannel;
}

export interface IEmailProvider extends INotificationProvider {
  sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult>;
}

export interface ISmsProvider extends INotificationProvider {
  sendSms(to: string, message: string, options?: SmsOptions): Promise<NotificationDeliveryResult>;
}

export interface IPushProvider extends INotificationProvider {
  sendPush(to: string, title: string, message: string, options?: PushOptions): Promise<NotificationDeliveryResult>;
}

export interface IInAppProvider extends INotificationProvider {
  sendInApp(userId: string, title: string, message: string, options?: InAppOptions): Promise<NotificationDeliveryResult>;
}

// Service interfaces
export interface ITemplateRenderer {
  render(template: string, variables: Record<string, any>): string;
  validateTemplate(template: string): { isValid: boolean; errors: string[] };
}

export interface INotificationScheduler {
  schedule(notification: Notification, scheduledFor: Date): Promise<void>;
  cancel(notificationId: string): Promise<void>;
  getScheduledNotifications(): Promise<Notification[]>;
}

// Types
export interface GetNotificationsOptions {
  status?: NotificationStatus;
  type?: NotificationType;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'sentAt' | 'deliveredAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface EmailOptions {
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  html?: boolean;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SmsOptions {
  from?: string;
  mediaUrl?: string;
}

export interface PushOptions {
  icon?: string;
  badge?: string;
  sound?: string;
  data?: Record<string, any>;
  actions?: PushAction[];
}

export interface PushAction {
  action: string;
  title: string;
  icon?: string;
}

export interface InAppOptions {
  category?: string;
  data?: Record<string, any>;
  actions?: InAppAction[];
  expiresAt?: Date;
}

export interface InAppAction {
  id: string;
  title: string;
  url?: string;
  action?: string;
}
```

### 3.4 Domain Errors

```typescript
export class NotificationError extends DomainError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code || 'NOTIFICATION_ERROR', statusCode || 500);
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(id: string) {
    super(`Notification with id ${id} not found`, 'NOTIFICATION_NOT_FOUND', 404);
  }
}

export class NotificationSendError extends NotificationError {
  constructor(message: string) {
    super(`Failed to send notification: ${message}`, 'NOTIFICATION_SEND_ERROR', 500);
  }
}

export class TemplateNotFoundError extends NotificationError {
  constructor(slug: string) {
    super(`Template with slug ${slug} not found`, 'TEMPLATE_NOT_FOUND', 404);
  }
}

export class TemplateValidationError extends NotificationError {
  constructor(errors: string[]) {
    super(`Template validation failed: ${errors.join(', ')}`, 'TEMPLATE_VALIDATION_ERROR', 400);
  }
}

export class InvalidNotificationDataError extends NotificationError {
  constructor(errors: string[]) {
    super(`Invalid notification data: ${errors.join(', ')}`, 'INVALID_NOTIFICATION_DATA', 400);
  }
}

export class NotificationDeliveryError extends NotificationError {
  constructor(message: string) {
    super(`Notification delivery failed: ${message}`, 'NOTIFICATION_DELIVERY_ERROR', 500);
  }
}

export class ProviderNotAvailableError extends NotificationError {
  constructor(provider: string) {
    super(`Provider ${provider} is not available`, 'PROVIDER_NOT_AVAILABLE', 503);
  }
}

export class NotificationPreferencesError extends NotificationError {
  constructor(message: string) {
    super(`Notification preferences error: ${message}`, 'NOTIFICATION_PREFERENCES_ERROR', 400);
  }
}
```

## 4. Application Layer Implementation

### 4.1 Use Cases

#### SendNotificationUseCase
```typescript
export class SendNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private templateRepository: INotificationTemplateRepository,
    private preferenceRepository: INotificationPreferenceRepository,
    private emailProvider: IEmailProvider,
    private smsProvider: ISmsProvider,
    private pushProvider: IPushProvider,
    private inAppProvider: IInAppProvider,
    private templateRenderer: ITemplateRenderer
  ) {}

  async execute(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    // Validate request
    const validation = request.validate();
    if (!validation.isValid) {
      throw new InvalidNotificationDataError(validation.errors);
    }

    // Create notification
    const notification = Notification.create({
      userId: request.userId,
      type: request.type,
      title: request.title,
      message: request.message,
      channels: request.channels,
      priority: request.priority,
      templateId: request.templateId,
      scheduledFor: request.scheduledFor,
      expiresAt: request.expiresAt,
      metadata: request.metadata
    });

    // Apply template if provided
    if (request.templateId) {
      const template = await this.templateRepository.findById(request.templateId);
      if (!template) {
        throw new TemplateNotFoundError(request.templateId);
      }

      // Render template
      const renderedMessage = this.templateRenderer.render(template.template, request.templateVariables || {});
      const renderedSubject = template.subject ? this.templateRenderer.render(template.subject, request.templateVariables || {}) : undefined;

      notification.message = renderedMessage;
      if (renderedSubject) {
        notification.title = renderedSubject;
      }
    }

    // Check user preferences
    const preferences = await this.preferenceRepository.findByUserId(request.userId);
    const filteredChannels = this.filterChannelsByPreferences(notification.channels, preferences, notification.type);

    if (filteredChannels.length === 0) {
      throw new NotificationPreferencesError('No enabled channels found for this notification type');
    }

    notification.channels = filteredChannels;

    // Save notification
    const savedNotification = await this.notificationRepository.create(notification);

    // Send notification (if not scheduled)
    if (!notification.isScheduled()) {
      await this.sendNotification(savedNotification);
    }

    return new SendNotificationResponse(savedNotification);
  }

  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    preferences: NotificationPreference[],
    notificationType: string
  ): NotificationChannel[] {
    // Find preference for this notification type
    const preference = preferences.find(p => p.type === notificationType);

    if (!preference) {
      // Use default preferences
      return channels.filter(channel => {
        switch (channel) {
          case NotificationChannel.EMAIL:
          case NotificationChannel.PUSH:
          case NotificationChannel.IN_APP:
            return true;
          case NotificationChannel.SMS:
          default:
            return false;
        }
      });
    }

    // Filter based on user preferences
    return channels.filter(channel => {
      // Check if channel is enabled
      if (!preference.isChannelEnabled(channel)) {
        return false;
      }

      // Check quiet hours
      if (preference.isInQuietHours()) {
        // Only allow urgent notifications during quiet hours
        return false; // This would be more sophisticated in real implementation
      }

      return true;
    });
  }

  private async sendNotification(notification: Notification): Promise<void> {
    // Update status to processing
    const processingNotification = new Notification(
      notification.id, notification.userId, notification.type, notification.title,
      notification.message, notification.channels, NotificationStatus.PROCESSING,
      notification.priority, notification.templateId, notification.scheduledFor,
      notification.sentAt, notification.deliveredAt, notification.readAt,
      notification.expiresAt, notification.metadata, notification.deliveryData,
      notification.retryCount, notification.maxRetries, notification.lastError,
      notification.createdAt, new Date()
    );

    await this.notificationRepository.update(processingNotification);

    // Get user recipient information (this would come from user service)
    const recipient = await this.getUserRecipient(notification.userId);

    // Send through each channel
    const deliveryPromises = notification.channels.map(channel => {
      return this.sendThroughChannel(notification, channel, recipient);
    });

    await Promise.allSettled(deliveryPromises);

    // Update notification status based on results
    // This would be more sophisticated in real implementation
    await this.notificationRepository.update(notification.markAsSent());
  }

  private async sendThroughChannel(
    notification: Notification,
    channel: NotificationChannel,
    recipient: any
  ): Promise<void> {
    try {
      let result: NotificationDeliveryResult;

      switch (channel) {
        case NotificationChannel.EMAIL:
          result = await this.emailProvider.sendEmail(
            recipient.email,
            notification.title,
            notification.message
          );
          break;
        case NotificationChannel.SMS:
          result = await this.smsProvider.sendSms(
            recipient.phone,
            notification.message
          );
          break;
        case NotificationChannel.PUSH:
          result = await this.pushProvider.sendPush(
            recipient.deviceToken,
            notification.title,
            notification.message
          );
          break;
        case NotificationChannel.IN_APP:
          result = await this.inAppProvider.sendInApp(
            notification.userId,
            notification.title,
            notification.message
          );
          break;
        default:
          throw new NotificationDeliveryError(`Unsupported channel: ${channel}`);
      }

      if (!result.success) {
        throw new NotificationDeliveryError(result.error || 'Unknown error');
      }

      // Log successful delivery
      await this.logDelivery(notification.id, channel, result);

    } catch (error) {
      // Log failed delivery
      await this.logDeliveryFailure(notification.id, channel, error);
      throw error;
    }
  }

  private async getUserRecipient(userId: string): Promise<any> {
    // This would integrate with user service
    // For now, return mock data
    return {
      email: 'user@example.com',
      phone: '+1234567890',
      deviceToken: 'device-token'
    };
  }

  private async logDelivery(notificationId: string, channel: NotificationChannel, result: NotificationDeliveryResult): Promise<void> {
    // This would log to notification_deliveries table
    // Implementation would depend on the delivery repository
  }

  private async logDeliveryFailure(notificationId: string, channel: NotificationChannel, error: any): Promise<void> {
    // This would log to notification_deliveries table
    // Implementation would depend on the delivery repository
  }
}
```

#### GetNotificationsUseCase
```typescript
export class GetNotificationsUseCase {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async execute(request: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    // Validate request
    const validation = request.validate();
    if (!validation.isValid) {
      throw new InvalidNotificationDataError(validation.errors);
    }

    // Get notifications
    const notifications = await this.notificationRepository.findByUserId(
      request.userId,
      {
        status: request.status,
        type: request.type,
        channel: request.channel,
        priority: request.priority,
        limit: request.limit,
        offset: request.offset,
        sortBy: request.sortBy,
        sortOrder: request.sortOrder
      }
    );

    // Get count by status
    const countByStatus = await this.notificationRepository.countByStatus(request.userId);

    return new GetNotificationsResponse(notifications, countByStatus);
  }
}
```

#### MarkNotificationReadUseCase
```typescript
export class MarkNotificationReadUseCase {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async execute(request: MarkNotificationReadRequest): Promise<MarkNotificationReadResponse> {
    // Validate request
    const validation = request.validate();
    if (!validation.isValid) {
      throw new InvalidNotificationDataError(validation.errors);
    }

    // Get notification
    const notification = await this.notificationRepository.findById(request.notificationId);
    if (!notification) {
      throw new NotificationNotFoundError(request.notificationId);
    }

    // Check if notification belongs to user
    if (notification.userId !== request.userId) {
      throw new NotificationError('Notification does not belong to user', 'UNAUTHORIZED_ACCESS', 403);
    }

    // Mark as read
    const updatedNotification = notification.markAsRead();
    await this.notificationRepository.update(updatedNotification);

    return new MarkNotificationReadResponse(updatedNotification);
  }
}
```

#### UpdateNotificationPreferenceUseCase
```typescript
export class UpdateNotificationPreferenceUseCase {
  constructor(
    private preferenceRepository: INotificationPreferenceRepository
  ) {}

  async execute(request: UpdateNotificationPreferenceRequest): Promise<UpdateNotificationPreferenceResponse> {
    // Validate request
    const validation = request.validate();
    if (!validation.isValid) {
      throw new NotificationPreferencesError(validation.errors.join(', '));
    }

    // Get existing preference
    let preference = await this.preferenceRepository.findByUserIdAndType(
      request.userId,
      request.type
    );

    if (preference) {
      // Update existing preference
      preference = new NotificationPreference(
        preference.id,
        preference.userId,
        preference.type,
        request.emailEnabled ?? preference.emailEnabled,
        request.smsEnabled ?? preference.smsEnabled,
        request.pushEnabled ?? preference.pushEnabled,
        request.inAppEnabled ?? preference.inAppEnabled,
        request.frequency ?? preference.frequency,
        request.quietHoursEnabled ?? preference.quietHoursEnabled,
        request.quietHoursStart ?? preference.quietHoursStart,
        request.quietHoursEnd ?? preference.quietHoursEnd,
        request.timezone ?? preference.timezone,
        request.metadata ?? preference.metadata,
        preference.createdAt,
        new Date()
      );
    } else {
      // Create new preference
      preference = NotificationPreference.create({
        userId: request.userId,
        type: request.type,
        emailEnabled: request.emailEnabled,
        smsEnabled: request.smsEnabled,
        pushEnabled: request.pushEnabled,
        inAppEnabled: request.inAppEnabled,
        frequency: request.frequency,
        quietHoursEnabled: request.quietHoursEnabled,
        quietHoursStart: request.quietHoursStart,
        quietHoursEnd: request.quietHoursEnd,
        timezone: request.timezone,
        metadata: request.metadata
      });
    }

    // Validate preference
    const validation = preference.validate();
    if (!validation.isValid) {
      throw new NotificationPreferencesError(validation.errors.join(', '));
    }

    // Save preference
    const savedPreference = await this.preferenceRepository.create(preference);

    return new UpdateNotificationPreferenceResponse(savedPreference);
  }
}
```

### 4.2 DTOs (Data Transfer Objects)

#### Input DTOs

```typescript
// SendNotificationRequest.ts
export class SendNotificationRequest {
  constructor(
    public userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public channels: NotificationChannel[],
    public priority?: NotificationPriority,
    public templateId?: string,
    public templateVariables?: Record<string, any>,
    public scheduledFor?: Date,
    public expiresAt?: Date,
    public metadata?: Record<string, any>
  ) {}

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.type) errors.push('Type is required');
    if (!this.title || this.title.trim().length === 0) errors.push('Title is required');
    if (!this.message || this.message.trim().length === 0) errors.push('Message is required');
    if (!this.channels || this.channels.length === 0) errors.push('At least one channel is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// GetNotificationsRequest.ts
export class GetNotificationsRequest {
  constructor(
    public userId: string,
    public status?: NotificationStatus,
    public type?: NotificationType,
    public channel?: NotificationChannel,
    public priority?: NotificationPriority,
    public limit?: number,
    public offset?: number,
    public sortBy?: 'createdAt' | 'sentAt' | 'deliveredAt' | 'readAt',
    public sortOrder?: 'asc' | 'desc'
  ) {}

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (this.limit && this.limit <= 0) errors.push('Limit must be greater than 0');
    if (this.offset && this.offset < 0) errors.push('Offset must be non-negative');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// MarkNotificationReadRequest.ts
export class MarkNotificationReadRequest {
  constructor(
    public userId: string,
    public notificationId: string
  ) {}

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.notificationId) errors.push('Notification ID is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// UpdateNotificationPreferenceRequest.ts
export class UpdateNotificationPreferenceRequest {
  constructor(
    public userId: string,
    public type: string,
    public emailEnabled?: boolean,
    public smsEnabled?: boolean,
    public pushEnabled?: boolean,
    public inAppEnabled?: boolean,
    public frequency?: NotificationFrequency,
    public quietHoursEnabled?: boolean,
    public quietHoursStart?: string,
    public quietHoursEnd?: string,
    public timezone?: string,
    public metadata?: Record<string, any>
  ) {}

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.type || this.type.trim().length === 0) errors.push('Type is required');

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (this.quietHoursStart && !timeRegex.test(this.quietHoursStart)) {
      errors.push('Quiet hours start must be in HH:MM format');
    }
    if (this.quietHoursEnd && !timeRegex.test(this.quietHoursEnd)) {
      errors.push('Quiet hours end must be in HH:MM format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

#### Output DTOs

```typescript
// SendNotificationResponse.ts
export class SendNotificationResponse {
  constructor(
    public notification: Notification
  ) {}

  toJSON() {
    return {
      notification: this.notification.toJSON()
    };
  }
}

// GetNotificationsResponse.ts
export class GetNotificationsResponse {
  constructor(
    public notifications: Notification[],
    public countByStatus: Record<NotificationStatus, number>
  ) {}

  toJSON() {
    return {
      notifications: this.notifications.map(n => n.toJSON()),
      countByStatus: this.countByStatus
    };
  }
}

// MarkNotificationReadResponse.ts
export class MarkNotificationReadResponse {
  constructor(
    public notification: Notification
  ) {}

  toJSON() {
    return {
      notification: this.notification.toJSON()
    };
  }
}

// UpdateNotificationPreferenceResponse.ts
export class UpdateNotificationPreferenceResponse {
  constructor(
    public preference: NotificationPreference
  ) {}

  toJSON() {
    return {
      preference: this.preference.toJSON()
    };
  }
}
```

## 5. Infrastructure Layer Implementation

### 5.1 Repository Implementations

#### NotificationRepository
```typescript
export class NotificationRepository implements INotificationRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<Notification | null> {
    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByUserId(userId: string, options?: GetNotificationsOptions): Promise<Notification[]> {
    let query = this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    // Apply filters
    if (options?.status) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.status, options.status)));
    }
    if (options?.type) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.type, options.type)));
    }
    if (options?.channel) {
      query = query.where(and(eq(notifications.userId, userId), sql`${options.channel} = ANY(${notifications.channels})`));
    }
    if (options?.priority) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.priority, options.priority)));
    }

    // Apply sorting
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    if (sortOrder === 'desc') {
      query = query.orderBy(desc(notifications[sortBy]));
    } else {
      query = query.orderBy(asc(notifications[sortBy]));
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query;
    return results.map(row => this.mapToEntity(row));
  }

  async create(notification: Notification): Promise<Notification> {
    const data = this.mapToDatabase(notification);
    const result = await this.db
      .insert(notifications)
      .values(data)
      .returning();

    return this.mapToEntity(result[0]);
  }

  async update(notification: Notification): Promise<Notification> {
    const data = this.mapToDatabase(notification);
    const result = await this.db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, notification.id))
      .returning();

    return this.mapToEntity(result[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(notifications)
      .where(eq(notifications.id, id));
  }

  async findPendingNotifications(limit = 100): Promise<Notification[]> {
    const results = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.status, NotificationStatus.PENDING))
      .orderBy(asc(notifications.createdAt))
      .limit(limit);

    return results.map(row => this.mapToEntity(row));
  }

  async findScheduledNotifications(before: Date): Promise<Notification[]> {
    const results = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, NotificationStatus.PENDING),
          lte(notifications.scheduledFor, before)
        )
      )
      .orderBy(asc(notifications.scheduledFor));

    return results.map(row => this.mapToEntity(row));
  }

  async findFailedNotifications(maxRetries = 3): Promise<Notification[]> {
    const results = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, NotificationStatus.FAILED),
          lt(notifications.retryCount, maxRetries)
        )
      )
      .orderBy(asc(notifications.updatedAt));

    return results.map(row => this.mapToEntity(row));
  }

  async countByStatus(userId?: string): Promise<Record<NotificationStatus, number>> {
    let query = this.db
      .select({
        status: notifications.status,
        count: count(notifications.id)
      })
      .from(notifications);

    if (userId) {
      query = query.where(eq(notifications.userId, userId));
    }

    const results = await query.groupBy(notifications.status);

    // Initialize with all statuses
    const counts: Record<NotificationStatus, number> = {
      [NotificationStatus.PENDING]: 0,
      [NotificationStatus.PROCESSING]: 0,
      [NotificationStatus.SENT]: 0,
      [NotificationStatus.DELIVERED]: 0,
      [NotificationStatus.FAILED]: 0,
      [NotificationStatus.CANCELLED]: 0
    };

    // Fill with actual counts
    results.forEach(row => {
      counts[row.status as NotificationStatus] = Number(row.count);
    });

    return counts;
  }

  private mapToEntity(row: any): Notification {
    return new Notification(
      row.id,
      row.user_id,
      row.type,
      row.title,
      row.message,
      row.channels,
      row.status,
      row.priority,
      row.template_id,
      row.scheduled_for,
      row.sent_at,
      row.delivered_at,
      row.read_at,
      row.expires_at,
      row.metadata || {},
      row.delivery_data || {},
      row.retry_count,
      row.max_retries,
      row.last_error,
      row.created_at,
      row.updated_at
    );
  }

  private mapToDatabase(notification: Notification): any {
    return {
      id: notification.id,
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      channels: notification.channels,
      status: notification.status,
      priority: notification.priority,
      template_id: notification.templateId,
      scheduled_for: notification.scheduledFor,
      sent_at: notification.sentAt,
      delivered_at: notification.deliveredAt,
      read_at: notification.readAt,
      expires_at: notification.expiresAt,
      metadata: notification.metadata,
      delivery_data: notification.deliveryData,
      retry_count: notification.retryCount,
      max_retries: notification.maxRetries,
      last_error: notification.lastError,
      created_at: notification.createdAt,
      updated_at: notification.updatedAt
    };
  }
}
```

### 5.2 Provider Implementations

#### SendGridEmailProvider
```typescript
export class SendGridEmailProvider implements IEmailProvider {
  constructor(
    private apiKey: string,
    private fromEmail: string,
    private fromName: string
  ) {}

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      const response = await this.sendEmail(recipient, notification.title, notification.message);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);

      const msg = {
        to,
        from: {
          email: options?.from || this.fromEmail,
          name: this.fromName
        },
        subject,
        text: content,
        html: options?.html ? content : undefined,
        replyTo: options?.replyTo,
        attachments: options?.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.contentType,
          disposition: 'attachment'
        }))
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'],
        metadata: {
          provider: 'sendgrid',
          response: response[0]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'sendgrid'
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - could be more sophisticated
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);

      // Test API access
      await sgMail.getRequest({
        url: '/v3/user/account',
        method: 'GET'
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'SendGrid';
  }

  getType(): NotificationChannel {
    return NotificationChannel.EMAIL;
  }
}
```

#### TwilioSmsProvider
```typescript
export class TwilioSmsProvider implements ISmsProvider {
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string
  ) {}

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      const response = await this.sendSms(recipient, notification.message);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendSms(to: string, message: string, options?: SmsOptions): Promise<NotificationDeliveryResult> {
    try {
      const twilio = require('twilio');
      const client = twilio(this.accountSid, this.authToken);

      const response = await client.messages.create({
        body: message,
        from: options?.from || this.fromNumber,
        to,
        mediaUrl: options?.mediaUrl
      });

      return {
        success: true,
        messageId: response.sid,
        metadata: {
          provider: 'twilio',
          response: response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'twilio'
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const twilio = require('twilio');
      const client = twilio(this.accountSid, this.authToken);

      // Test API access
      await client.api.accounts(this.accountSid).fetch();

      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'Twilio';
  }

  getType(): NotificationChannel {
    return NotificationChannel.SMS;
  }
}
```

#### FirebasePushProvider
```typescript
export class FirebasePushProvider implements IPushProvider {
  constructor(
    private serviceAccountKey: any,
    private app: any
  ) {}

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      const response = await this.sendPush(recipient, notification.title, notification.message);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendPush(to: string, title: string, message: string, options?: PushOptions): Promise<NotificationDeliveryResult> {
    try {
      const admin = require('firebase-admin');

      const payload: any = {
        notification: {
          title,
          body: message,
          icon: options?.icon,
          badge: options?.badge,
          sound: options?.sound
        },
        data: options?.data || {},
        token: to
      };

      if (options?.actions && options.actions.length > 0) {
        payload.notification.actions = options.actions;
      }

      const response = await admin.messaging().send(payload);

      return {
        success: true,
        messageId: response,
        metadata: {
          provider: 'firebase',
          response: response
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'firebase'
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const admin = require('firebase-admin');

      // Test app initialization
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(this.serviceAccountKey)
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'Firebase';
  }

  getType(): NotificationChannel {
    return NotificationChannel.PUSH;
  }
}
```

### 5.3 Dependency Injection Container

#### NotificationContainer
```typescript
export class NotificationContainer {
  private static instance: NotificationContainer;

  private notificationRepository: INotificationRepository;
  private templateRepository: INotificationTemplateRepository;
  private preferenceRepository: INotificationPreferenceRepository;
  private deliveryRepository: INotificationDeliveryRepository;

  private emailProvider: IEmailProvider;
  private smsProvider: ISmsProvider;
  private pushProvider: IPushProvider;
  private inAppProvider: IInAppProvider;

  private templateRenderer: ITemplateRenderer;
  private notificationScheduler: INotificationScheduler;

  private sendNotificationUseCase: SendNotificationUseCase;
  private getNotificationsUseCase: GetNotificationsUseCase;
  private markNotificationReadUseCase: MarkNotificationReadUseCase;
  private updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase;
  private createNotificationTemplateUseCase: CreateNotificationTemplateUseCase;
  private getNotificationTemplatesUseCase: GetNotificationTemplatesUseCase;
  private bulkNotificationUseCase: BulkNotificationUseCase;
  private scheduleNotificationUseCase: ScheduleNotificationUseCase;

  private constructor() {
    this.initializeRepositories();
    this.initializeProviders();
    this.initializeServices();
    this.initializeUseCases();
  }

  public static getInstance(): NotificationContainer {
    if (!NotificationContainer.instance) {
      NotificationContainer.instance = new NotificationContainer();
    }
    return NotificationContainer.instance;
  }

  private initializeRepositories(): void {
    const db = getDatabase(); // Get database instance

    this.notificationRepository = new NotificationRepository(db);
    this.templateRepository = new NotificationTemplateRepository(db);
    this.preferenceRepository = new NotificationPreferenceRepository(db);
    this.deliveryRepository = new NotificationDeliveryRepository(db);
  }

  private initializeProviders(): void {
    const config = getNotificationConfig();

    this.emailProvider = new SendGridEmailProvider(
      config.sendgrid.apiKey,
      config.sendgrid.fromEmail,
      config.sendgrid.fromName
    );

    this.smsProvider = new TwilioSmsProvider(
      config.twilio.accountSid,
      config.twilio.authToken,
      config.twilio.fromNumber
    );

    this.pushProvider = new FirebasePushProvider(
      config.firebase.serviceAccountKey,
      config.firebase.app
    );

    this.inAppProvider = new InAppProvider(db);
  }

  private initializeServices(): void {
    this.templateRenderer = new TemplateRenderer();
    this.notificationScheduler = new NotificationScheduler(this.notificationRepository);
  }

  private initializeUseCases(): void {
    this.sendNotificationUseCase = new SendNotificationUseCase(
      this.notificationRepository,
      this.templateRepository,
      this.preferenceRepository,
      this.emailProvider,
      this.smsProvider,
      this.pushProvider,
      this.inAppProvider,
      this.templateRenderer
    );

    this.getNotificationsUseCase = new GetNotificationsUseCase(
      this.notificationRepository
    );

    this.markNotificationReadUseCase = new MarkNotificationReadUseCase(
      this.notificationRepository
    );

    this.updateNotificationPreferenceUseCase = new UpdateNotificationPreferenceUseCase(
      this.preferenceRepository
    );

    this.createNotificationTemplateUseCase = new CreateNotificationTemplateUseCase(
      this.templateRepository
    );

    this.getNotificationTemplatesUseCase = new GetNotificationTemplatesUseCase(
      this.templateRepository
    );

    this.bulkNotificationUseCase = new BulkNotificationUseCase(
      this.notificationRepository,
      this.templateRepository,
      this.preferenceRepository,
      this.emailProvider,
      this.smsProvider,
      this.pushProvider,
      this.inAppProvider,
      this.templateRenderer
    );

    this.scheduleNotificationUseCase = new ScheduleNotificationUseCase(
      this.notificationRepository,
      this.templateRepository,
      this.preferenceRepository,
      this.emailProvider,
      this.smsProvider,
      this.pushProvider,
      this.inAppProvider,
      this.templateRenderer,
      this.notificationScheduler
    );
  }

  // Getter methods for dependencies
  public getSendNotificationUseCase(): SendNotificationUseCase {
    return this.sendNotificationUseCase;
  }

  public getGetNotificationsUseCase(): GetNotificationsUseCase {
    return this.getNotificationsUseCase;
  }

  public getMarkNotificationReadUseCase(): MarkNotificationReadUseCase {
    return this.markNotificationReadUseCase;
  }

  public getUpdateNotificationPreferenceUseCase(): UpdateNotificationPreferenceUseCase {
    return this.updateNotificationPreferenceUseCase;
  }

  public getCreateNotificationTemplateUseCase(): CreateNotificationTemplateUseCase {
    return this.createNotificationTemplateUseCase;
  }

  public getGetNotificationTemplatesUseCase(): GetNotificationTemplatesUseCase {
    return this.getNotificationTemplatesUseCase;
  }

  public getBulkNotificationUseCase(): BulkNotificationUseCase {
    return this.bulkNotificationUseCase;
  }

  public getScheduleNotificationUseCase(): ScheduleNotificationUseCase {
    return this.scheduleNotificationUseCase;
  }

  public getNotificationRepository(): INotificationRepository {
    return this.notificationRepository;
  }

  public getTemplateRepository(): INotificationTemplateRepository {
    return this.templateRepository;
  }

  public getPreferenceRepository(): INotificationPreferenceRepository {
    return this.preferenceRepository;
  }

  public getEmailProvider(): IEmailProvider {
    return this.emailProvider;
  }

  public getSmsProvider(): ISmsProvider {
    return this.smsProvider;
  }

  public getPushProvider(): IPushProvider {
    return this.pushProvider;
  }

  public getInAppProvider(): IInAppProvider {
    return this.inAppProvider;
  }

  public getTemplateRenderer(): ITemplateRenderer {
    return this.templateRenderer;
  }

  public getNotificationScheduler(): INotificationScheduler {
    return this.notificationScheduler;
  }
}
```

## 6. Presentation Layer Implementation

### 6.1 Controllers

#### SendNotificationController
```typescript
export class SendNotificationController {
  constructor(
    private sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const userId = c.get('userId'); // From auth middleware

      const request = new SendNotificationRequest(
        body.userId || userId,
        body.type,
        body.title,
        body.message,
        body.channels,
        body.priority,
        body.templateId,
        body.templateVariables,
        body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        body.expiresAt ? new Date(body.expiresAt) : undefined,
        body.metadata
      );

      const response = await this.sendNotificationUseCase.execute(request);

      return c.json({
        success: true,
        data: response.toJSON()
      }, 201);
    } catch (error) {
      if (error instanceof InvalidNotificationDataError) {
        return c.json({
          success: false,
          error: error.message,
          code: error.code
        }, 400);
      }

      if (error instanceof NotificationSendError) {
        return c.json({
          success: false,
          error: error.message,
          code: error.code
        }, 500);
      }

      return c.json({
        success: false,
        error: 'Internal server error'
      }, 500);
    }
  }
}
```

#### GetNotificationsController
```typescript
export class GetNotificationsController {
  constructor(
    private getNotificationsUseCase: GetNotificationsUseCase
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      const userId = c.get('userId'); // From auth middleware
      const query = c.req.query();

      const request = new GetNotificationsRequest(
        userId,
        query.status as NotificationType,
        query.type as NotificationType,
        query.channel as NotificationChannel,
        query.priority as NotificationPriority,
        query.limit ? parseInt(query.limit) : undefined,
        query.offset ? parseInt(query.offset) : undefined,
        query.sortBy as any,
        query.sortOrder as any
      );

      const response = await this.getNotificationsUseCase.execute(request);

      return c.json({
        success: true,
        data: response.toJSON()
      });
    } catch (error) {
      if (error instanceof InvalidNotificationDataError) {
        return c.json({
          success: false,
          error: error.message,
          code: error.code
        }, 400);
      }

      return c.json({
        success: false,
        error: 'Internal server error'
      }, 500);
    }
  }
}
```

#### MarkNotificationReadController
```typescript
export class MarkNotificationReadController {
  constructor(
    private markNotificationReadUseCase: MarkNotificationReadUseCase
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      const userId = c.get('userId'); // From auth middleware
      const notificationId = c.param('id');

      if (!notificationId) {
        return c.json({
          success: false,
          error: 'Notification ID is required'
        }, 400);
      }

      const request = new MarkNotificationReadRequest(userId, notificationId);
      const response = await this.markNotificationReadUseCase.execute(request);

      return c.json({
        success: true,
        data: response.toJSON()
      });
    } catch (error) {
      if (error instanceof NotificationNotFoundError) {
        return c.json({
          success: false,
          error: error.message,
          code: error.code
        }, 404);
      }

      if (error instanceof NotificationError && error.statusCode === 403) {
        return c.json({
          success: false,
          error: error.message,
          code: error.code
        }, 403);
      }

      return c.json({
        success: false,
        error: 'Internal server error'
      }, 500);
    }
  }
}
```

### 6.2 Routes

```typescript
import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import { validationMiddleware } from '../../middleware/validation';
import { SendNotificationController } from './controllers/SendNotificationController';
import { GetNotificationsController } from './controllers/GetNotificationsController';
import { MarkNotificationReadController } from './controllers/MarkNotificationReadController';
import { UpdateNotificationPreferenceController } from './controllers/UpdateNotificationPreferenceController';
import { TemplateController } from './controllers/TemplateController';
import { BulkNotificationController } from './controllers/BulkNotificationController';
import { ScheduleNotificationController } from './controllers/ScheduleNotificationController';
import { AnalyticsController } from './controllers/AnalyticsController';
import { NotificationContainer } from '../infrastructure/container/NotificationContainer';

const notificationRoutes = new Hono();
const container = NotificationContainer.getInstance();

// Apply authentication middleware to all routes
notificationRoutes.use('*', authMiddleware);

// Initialize controllers
const sendNotificationController = new SendNotificationController(container.getSendNotificationUseCase());
const getNotificationsController = new GetNotificationsController(container.getGetNotificationsUseCase());
const markNotificationReadController = new MarkNotificationReadController(container.getMarkNotificationReadUseCase());
const updateNotificationPreferenceController = new UpdateNotificationPreferenceController(container.getUpdateNotificationPreferenceUseCase());
const templateController = new TemplateController(container.getCreateNotificationTemplateUseCase(), container.getGetNotificationTemplatesUseCase());
const bulkNotificationController = new BulkNotificationController(container.getBulkNotificationUseCase());
const scheduleNotificationController = new ScheduleNotificationController(container.getScheduleNotificationUseCase());
const analyticsController = new AnalyticsController(container.getGetNotificationAnalyticsUseCase());

// Notification routes
notificationRoutes.post('/send', sendNotificationController.handle.bind(sendNotificationController));
notificationRoutes.get('/', getNotificationsController.handle.bind(getNotificationsController));
notificationRoutes.patch('/:id/read', markNotificationReadController.handle.bind(markNotificationReadController));

// Preference routes
notificationRoutes.get('/preferences', updateNotificationPreferenceController.getPreferences.bind(updateNotificationPreferenceController));
notificationRoutes.put('/preferences', updateNotificationPreferenceController.handle.bind(updateNotificationPreferenceController));

// Template routes
notificationRoutes.post('/templates', templateController.create.bind(templateController));
notificationRoutes.get('/templates', templateController.getAll.bind(templateController));
notificationRoutes.get('/templates/:id', templateController.getById.bind(templateController));
notificationRoutes.put('/templates/:id', templateController.update.bind(templateController));
notificationRoutes.delete('/templates/:id', templateController.delete.bind(templateController));

// Bulk notification routes
notificationRoutes.post('/bulk', bulkNotificationController.handle.bind(bulkNotificationController));

// Scheduled notification routes
notificationRoutes.post('/schedule', scheduleNotificationController.handle.bind(scheduleNotificationController));
notificationRoutes.delete('/schedule/:id', scheduleNotificationController.cancel.bind(scheduleNotificationController));

// Analytics routes
notificationRoutes.get('/analytics', analyticsController.handle.bind(analyticsController));

// Webhook routes (for provider callbacks)
notificationRoutes.post('/webhooks/email', analyticsController.emailWebhook.bind(analyticsController));
notificationRoutes.post('/webhooks/sms', analyticsController.smsWebhook.bind(analyticsController));
notificationRoutes.post('/webhooks/push', analyticsController.pushWebhook.bind(analyticsController));

export default notificationRoutes;
```

## 7. Testing Strategy

### 7.1 Unit Tests

#### Entity Tests
```typescript
// Notification.entity.test.ts
describe('Notification Entity', () => {
  describe('Factory Method - create', () => {
    it('should create a valid notification using factory method', () => {
      const data = {
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
      };

      const notification = Notification.create(data);

      expect(notification.userId).toBe(data.userId);
      expect(notification.type).toBe(data.type);
      expect(notification.title).toBe(data.title);
      expect(notification.message).toBe(data.message);
      expect(notification.channels).toEqual(data.channels);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
    });
  });

  describe('Business Logic Methods', () => {
    it('should mark notification as sent', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const sentNotification = notification.markAsSent();

      expect(sentNotification.status).toBe(NotificationStatus.SENT);
      expect(sentNotification.sentAt).toBeDefined();
      expect(sentNotification.updatedAt).not.toEqual(notification.updatedAt);
    });

    it('should mark notification as delivered', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const deliveredNotification = notification.markAsDelivered();

      expect(deliveredNotification.status).toBe(NotificationStatus.DELIVERED);
      expect(deliveredNotification.deliveredAt).toBeDefined();
      expect(deliveredNotification.updatedAt).not.toEqual(notification.updatedAt);
    });

    it('should mark notification as read', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const readNotification = notification.markAsRead();

      expect(readNotification.readAt).toBeDefined();
      expect(readNotification.updatedAt).not.toEqual(notification.updatedAt);
    });

    it('should increment retry count on failure', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const failedNotification = notification.incrementRetry('Connection timeout');

      expect(failedNotification.status).toBe(NotificationStatus.FAILED);
      expect(failedNotification.retryCount).toBe(1);
      expect(failedNotification.lastError).toBe('Connection timeout');
    });
  });

  describe('Validation', () => {
    it('should validate a valid notification', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const validation = notification.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation with missing user ID', () => {
      const notification = Notification.create({
        userId: '',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const validation = notification.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('User ID is required');
    });

    it('should fail validation with empty title', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: '',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      const validation = notification.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });

    it('should fail validation with no channels', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: []
      });

      const validation = notification.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('At least one channel is required');
    });
  });

  describe('Helper Methods', () => {
    it('should check if notification is expired', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL],
        expiresAt: pastDate
      });

      expect(notification.isExpired()).toBe(true);
    });

    it('should check if notification can be retried', () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      expect(notification.canRetry()).toBe(false);

      const failedNotification = notification.incrementRetry();
      expect(failedNotification.canRetry()).toBe(true);

      const maxRetriesNotification = new Notification(
        notification.id,
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.channels,
        NotificationStatus.FAILED,
        notification.priority,
        notification.templateId,
        notification.scheduledFor,
        notification.sentAt,
        notification.deliveredAt,
        notification.readAt,
        notification.expiresAt,
        notification.metadata,
        notification.deliveryData,
        3, // retryCount
        3, // maxRetries
        notification.lastError,
        notification.createdAt,
        notification.updatedAt
      );

      expect(maxRetriesNotification.canRetry()).toBe(false);
    });

    it('should check if notification is scheduled', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL],
        scheduledFor: futureDate
      });

      expect(notification.isScheduled()).toBe(true);
    });
  });
});
```

#### Use Case Tests
```typescript
// SendNotificationUseCase.test.ts
describe('SendNotificationUseCase', () => {
  let mockNotificationRepository: INotificationRepository;
  let mockTemplateRepository: INotificationTemplateRepository;
  let mockPreferenceRepository: INotificationPreferenceRepository;
  let mockEmailProvider: IEmailProvider;
  let mockSmsProvider: ISmsProvider;
  let mockPushProvider: IPushProvider;
  let mockInAppProvider: IInAppProvider;
  let mockTemplateRenderer: ITemplateRenderer;
  let sendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    mockNotificationRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findPendingNotifications: vi.fn(),
      findScheduledNotifications: vi.fn(),
      findFailedNotifications: vi.fn(),
      countByStatus: vi.fn()
    } as any;

    mockTemplateRepository = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findByType: vi.fn(),
      findByChannel: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findActive: vi.fn()
    } as any;

    mockPreferenceRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndType: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByUserId: vi.fn()
    } as any;

    mockEmailProvider = {
      send: vi.fn(),
      sendEmail: vi.fn(),
      isAvailable: vi.fn(),
      getName: vi.fn(),
      getType: vi.fn()
    } as any;

    mockSmsProvider = {
      send: vi.fn(),
      sendSms: vi.fn(),
      isAvailable: vi.fn(),
      getName: vi.fn(),
      getType: vi.fn()
    } as any;

    mockPushProvider = {
      send: vi.fn(),
      sendPush: vi.fn(),
      isAvailable: vi.fn(),
      getName: vi.fn(),
      getType: vi.fn()
    } as any;

    mockInAppProvider = {
      send: vi.fn(),
      sendInApp: vi.fn(),
      isAvailable: vi.fn(),
      getName: vi.fn(),
      getType: vi.fn()
    } as any;

    mockTemplateRenderer = {
      render: vi.fn(),
      validateTemplate: vi.fn()
    } as any;

    sendNotificationUseCase = new SendNotificationUseCase(
      mockNotificationRepository,
      mockTemplateRepository,
      mockPreferenceRepository,
      mockEmailProvider,
      mockSmsProvider,
      mockPushProvider,
      mockInAppProvider,
      mockTemplateRenderer
    );
  });

  it('should send notification successfully', async () => {
    // Arrange
    const request = new SendNotificationRequest(
      'user-123',
      NotificationType.INFO,
      'Test Notification',
      'This is a test notification',
      [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
    );

    const mockNotification = Notification.create({
      userId: 'user-123',
      type: NotificationType.INFO,
      title: 'Test Notification',
      message: 'This is a test notification',
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
    });

    const mockPreferences = [
      NotificationPreference.create({
        userId: 'user-123',
        type: 'info',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
      })
    ];

    (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
    (mockPreferenceRepository.findByUserId as any).mockResolvedValue(mockPreferences);
    (mockEmailProvider.sendEmail as any).mockResolvedValue({
      success: true,
      messageId: 'email-123'
    });
    (mockInAppProvider.sendInApp as any).mockResolvedValue({
      success: true,
      messageId: 'inapp-123'
    });

    // Act
    const result = await sendNotificationUseCase.execute(request);

    // Assert
    expect(result).toBeDefined();
    expect(result.notification).toBeDefined();
    expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.any(Notification));
    expect(mockPreferenceRepository.findByUserId).toHaveBeenCalledWith('user-123');
    expect(mockEmailProvider.sendEmail).toHaveBeenCalled();
    expect(mockInAppProvider.sendInApp).toHaveBeenCalled();
  });

  it('should use template when templateId is provided', async () => {
    // Arrange
    const request = new SendNotificationRequest(
      'user-123',
      NotificationType.INFO,
      'Test Notification',
      'This is a test notification',
      [NotificationChannel.EMAIL],
      undefined,
      'template-123',
      { userName: 'John' }
    );

    const mockTemplate = NotificationTemplate.create({
      name: 'Welcome Template',
      slug: 'welcome',
      type: NotificationType.INFO,
      channel: NotificationChannel.EMAIL,
      subject: 'Welcome {{userName}}',
      template: 'Hello {{userName}}, welcome to our platform!'
    });

    const mockNotification = Notification.create({
      userId: 'user-123',
      type: NotificationType.INFO,
      title: 'Welcome John',
      message: 'Hello John, welcome to our platform!',
      channels: [NotificationChannel.EMAIL]
    });

    (mockTemplateRepository.findById as any).mockResolvedValue(mockTemplate);
    (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
    (mockPreferenceRepository.findByUserId as any).mockResolvedValue([]);
    (mockEmailProvider.sendEmail as any).mockResolvedValue({
      success: true,
      messageId: 'email-123'
    });

    (mockTemplateRenderer.render as any)
      .mockReturnValueOnce('Hello John, welcome to our platform!')
      .mockReturnValueOnce('Welcome John');

    // Act
    const result = await sendNotificationUseCase.execute(request);

    // Assert
    expect(mockTemplateRepository.findById).toHaveBeenCalledWith('template-123');
    expect(mockTemplateRenderer.render).toHaveBeenCalledWith('Hello {{userName}}, welcome to our platform!', { userName: 'John' });
    expect(mockTemplateRenderer.render).toHaveBeenCalledWith('Welcome {{userName}}', { userName: 'John' });
    expect(result.notification.message).toBe('Hello John, welcome to our platform!');
    expect(result.notification.title).toBe('Welcome John');
  });

  it('should throw error when template not found', async () => {
    // Arrange
    const request = new SendNotificationRequest(
      'user-123',
      NotificationType.INFO,
      'Test Notification',
      'This is a test notification',
      [NotificationChannel.EMAIL],
      undefined,
      'non-existent-template'
    );

    (mockTemplateRepository.findById as any).mockResolvedValue(null);

    // Act & Assert
    await expect(sendNotificationUseCase.execute(request)).rejects.toThrow(TemplateNotFoundError);
  });

  it('should throw error when no enabled channels found', async () => {
    // Arrange
    const request = new SendNotificationRequest(
      'user-123',
      NotificationType.INFO,
      'Test Notification',
      'This is a test notification',
      [NotificationChannel.EMAIL]
    );

    const mockPreferences = [
      NotificationPreference.create({
        userId: 'user-123',
        type: 'info',
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: false
      })
    ];

    (mockPreferenceRepository.findByUserId as any).mockResolvedValue(mockPreferences);

    // Act & Assert
    await expect(sendNotificationUseCase.execute(request)).rejects.toThrow(NotificationPreferencesError);
  });

  it('should throw error for invalid request', async () => {
    // Arrange
    const request = new SendNotificationRequest(
      '', // Invalid user ID
      NotificationType.INFO,
      'Test Notification',
      'This is a test notification',
      [NotificationChannel.EMAIL]
    );

    // Act & Assert
    await expect(sendNotificationUseCase.execute(request)).rejects.toThrow(InvalidNotificationDataError);
  });
});
```

### 7.2 Integration Tests

```typescript
// notification-flow.test.ts
describe('Notification Flow Integration', () => {
  let app: Hono;
  let testDb: any;
  let container: NotificationContainer;

  beforeAll(async () => {
    // Setup test database
    testDb = await setupTestDatabase();

    // Setup test container
    container = new NotificationContainer();

    // Setup test app
    app = new Hono();
    app.route('/api/notifications', notificationRoutes);
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  beforeEach(async () => {
    await clearTestData(testDb);
  });

  it('should send notification through email and in-app channels', async () => {
    // Arrange
    const user = await createTestUser(testDb);
    const notificationData = {
      userId: user.id,
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification',
      channels: ['email', 'in_app']
    };

    // Act
    const response = await app.request('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(notificationData)
    });

    // Assert
    expect(response.status).toBe(201);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.notification).toBeDefined();

    // Verify notification in database
    const notification = await testDb.query.notifications.findFirst({
      where: eq(notifications.userId, user.id)
    });
    expect(notification).toBeDefined();
    expect(notification.status).toBe('sent');
  });

  it('should respect user notification preferences', async () => {
    // Arrange
    const user = await createTestUser(testDb);

    // Create user preference to disable email
    await testDb.insert(notificationPreferences).values({
      userId: user.id,
      type: 'info',
      emailEnabled: false,
      pushEnabled: true,
      inAppEnabled: true
    });

    const notificationData = {
      userId: user.id,
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification',
      channels: ['email', 'push', 'in_app']
    };

    // Act
    const response = await app.request('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(notificationData)
    });

    // Assert
    expect(response.status).toBe(201);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Verify notification was sent only through enabled channels
    const deliveries = await testDb.query.notificationDeliveries.findMany({
      where: eq(notificationDeliveries.notificationId, responseData.data.notification.id)
    });

    const channels = deliveries.map(d => d.channel);
    expect(channels).not.toContain('email');
    expect(channels).toContain('push');
    expect(channels).toContain('in_app');
  });

  it('should schedule notification for future delivery', async () => {
    // Arrange
    const user = await createTestUser(testDb);
    const scheduledFor = new Date();
    scheduledFor.setHours(scheduledFor.getHours() + 1);

    const notificationData = {
      userId: user.id,
      type: 'info',
      title: 'Scheduled Notification',
      message: 'This is a scheduled notification',
      channels: ['email'],
      scheduledFor: scheduledFor.toISOString()
    };

    // Act
    const response = await app.request('/api/notifications/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(notificationData)
    });

    // Assert
    expect(response.status).toBe(201);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Verify notification is scheduled
    const notification = await testDb.query.notifications.findFirst({
      where: eq(notifications.id, responseData.data.notification.id)
    });
    expect(notification.status).toBe('pending');
    expect(notification.scheduledFor).toEqual(scheduledFor);
  });

  it('should mark notification as read', async () => {
    // Arrange
    const user = await createTestUser(testDb);
    const notification = await createTestNotification(testDb, user.id);

    // Act
    const response = await app.request(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    // Assert
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.notification.readAt).toBeDefined();

    // Verify notification is marked as read in database
    const updatedNotification = await testDb.query.notifications.findFirst({
      where: eq(notifications.id, notification.id)
    });
    expect(updatedNotification.readAt).toBeDefined();
  });

  it('should update notification preferences', async () => {
    // Arrange
    const user = await createTestUser(testDb);
    const preferenceData = {
      type: 'marketing',
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      frequency: 'daily'
    };

    // Act
    const response = await app.request('/api/notifications/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(preferenceData)
    });

    // Assert
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.preference.emailEnabled).toBe(false);
    expect(responseData.data.preference.pushEnabled).toBe(true);

    // Verify preference in database
    const preference = await testDb.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, user.id),
        eq(notificationPreferences.type, 'marketing')
      )
    });
    expect(preference.emailEnabled).toBe(false);
    expect(preference.pushEnabled).toBe(true);
  });
});
```

## 8. Integration Points

### 8.1 Database Integration

The notification service integrates with the existing database schema defined in `packages/database/src/schema/notifications.schema.ts`. The repositories use Drizzle ORM for type-safe database operations.

### 8.2 Shared Package Integration

The notification service uses shared utilities and error classes from `@modular-monolith/shared`:

- `DomainError` base class for custom error types
- Validation utilities and schemas
- Common types and interfaces

### 8.3 Authentication Integration

The notification service integrates with the authentication middleware:

- All routes require authentication via `authMiddleware`
- User ID is extracted from JWT token for authorization
- Permission-based access control for admin operations

### 8.4 External Service Integration

The notification service integrates with external services:

- **SendGrid** for email delivery
- **Twilio** for SMS delivery
- **Firebase** for push notifications
- **Webhooks** for provider callbacks

### 8.5 User Service Integration

The notification service needs to integrate with the user service to:

- Get user contact information (email, phone, device tokens)
- Validate user existence
- Handle user preferences

### 8.6 Analytics Integration

The notification service tracks delivery and engagement metrics:

- Delivery status tracking
- Open and click tracking
- Performance analytics
- Error tracking

## 9. Configuration

### 9.1 Environment Variables

```typescript
// NotificationConfig.ts
export interface NotificationConfig {
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  firebase: {
    serviceAccountKey: any;
    app: any;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  queue: {
    concurrency: number;
    maxRetries: number;
    retryDelay: number;
  };
  scheduler: {
    enabled: boolean;
    interval: number;
  };
}

export function getNotificationConfig(): NotificationConfig {
  return {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
      fromName: process.env.SENDGRID_FROM_NAME || ''
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || ''
    },
    firebase: {
      serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : {},
      app: null // Will be initialized
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    },
    queue: {
      concurrency: parseInt(process.env.NOTIFICATION_QUEUE_CONCURRENCY || '10'),
      maxRetries: parseInt(process.env.NOTIFICATION_QUEUE_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.NOTIFICATION_QUEUE_RETRY_DELAY || '5000')
    },
    scheduler: {
      enabled: process.env.NOTIFICATION_SCHEDULER_ENABLED === 'true',
      interval: parseInt(process.env.NOTIFICATION_SCHEDULER_INTERVAL || '60000')
    }
  };
}
```

### 9.2 Database Configuration

The notification service uses the existing database configuration from `packages/database/src/connection/db.ts`. The schema is already defined in `packages/database/src/schema/notifications.schema.ts`.

## 10. Deployment Considerations

### 10.1 Database Migrations

The notification schema is already defined in the database package. Ensure migrations are run before deploying the notification service.

### 10.2 Environment Setup

Set up the following environment variables:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourapp.com
SENDGRID_FROM_NAME=Your App

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project"}'

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Queue Configuration
NOTIFICATION_QUEUE_CONCURRENCY=10
NOTIFICATION_QUEUE_MAX_RETRIES=3
NOTIFICATION_QUEUE_RETRY_DELAY=5000

# Scheduler Configuration
NOTIFICATION_SCHEDULER_ENABLED=true
NOTIFICATION_SCHEDULER_INTERVAL=60000
```

### 10.3 Monitoring and Logging

Set up monitoring for:

- Notification delivery rates
- Provider API response times
- Queue processing times
- Error rates and types
- Database query performance

## 11. Security Considerations

### 11.1 Data Protection

- Encrypt sensitive notification content in database
- Sanitize user input to prevent XSS
- Validate all input data
- Use parameterized queries to prevent SQL injection

### 11.2 Access Control

- Authenticate all API endpoints
- Authorize users to access only their notifications
- Implement rate limiting to prevent abuse
- Validate user permissions for admin operations

### 11.3 Privacy Compliance

- Respect user notification preferences
- Provide opt-out mechanisms
- Implement data retention policies
- Log access to notification data

## 12. Performance Optimization

### 12.1 Database Optimization

- Use proper indexes on frequently queried columns
- Implement connection pooling
- Use read replicas for analytics queries
- Archive old notifications regularly

### 12.2 Caching Strategy

- Cache user preferences in Redis
- Cache notification templates
- Cache frequently accessed notifications
- Use CDN for static notification assets

### 12.3 Queue Processing

- Use message queues for async processing
- Implement priority queues for urgent notifications
- Batch process bulk notifications
- Monitor queue health and performance

## 13. Implementation Tasks Breakdown

### 13.1 Domain Layer Tasks

1. **Create Notification Entity** (2 days)
   - Implement Notification class with business logic
   - Add validation methods
   - Create factory methods
   - Add serialization methods

2. **Create NotificationTemplate Entity** (1 day)
   - Implement NotificationTemplate class
   - Add template rendering logic
   - Add validation methods

3. **Create NotificationPreference Entity** (1 day)
   - Implement NotificationPreference class
   - Add preference checking logic
   - Add quiet hours logic

4. **Create Domain Interfaces** (1 day)
   - Define repository interfaces
   - Define provider interfaces
   - Define service interfaces

5. **Create Domain Errors** (0.5 day)
   - Implement custom error classes
   - Add error codes and status codes

### 13.2 Application Layer Tasks

1. **Create Use Cases** (5 days)
   - SendNotificationUseCase (1 day)
   - GetNotificationsUseCase (0.5 day)
   - MarkNotificationReadUseCase (0.5 day)
   - UpdateNotificationPreferenceUseCase (1 day)
   - CreateNotificationTemplateUseCase (0.5 day)
   - BulkNotificationUseCase (1 day)
   - ScheduleNotificationUseCase (1 day)

2. **Create DTOs** (2 days)
   - Input DTOs (1 day)
   - Output DTOs (1 day)

3. **Create Mappers** (1 day)
   - Entity to DTO mappers
   - Database to entity mappers

### 13.3 Infrastructure Layer Tasks

1. **Create Repository Implementations** (4 days)
   - NotificationRepository (1 day)
   - NotificationTemplateRepository (0.5 day)
   - NotificationPreferenceRepository (0.5 day)
   - NotificationDeliveryRepository (1 day)
   - NotificationAnalyticsRepository (1 day)

2. **Create Provider Implementations** (4 days)
   - SendGridEmailProvider (1 day)
   - TwilioSmsProvider (1 day)
   - FirebasePushProvider (1 day)
   - InAppProvider (1 day)

3. **Create Services** (2 days)
   - TemplateRenderer (0.5 day)
   - NotificationScheduler (1 day)
   - NotificationQueue (0.5 day)

4. **Create Dependency Injection Container** (1 day)
   - NotificationContainer implementation
   - Dependency wiring

### 13.4 Presentation Layer Tasks

1. **Create Controllers** (3 days)
   - SendNotificationController (0.5 day)
   - GetNotificationsController (0.5 day)
   - MarkNotificationReadController (0.5 day)
   - UpdateNotificationPreferenceController (0.5 day)
   - TemplateController (0.5 day)
   - BulkNotificationController (0.5 day)
   - ScheduleNotificationController (0.5 day)

2. **Create Routes** (1 day)
   - Route definitions
   - Middleware integration

### 13.5 Testing Tasks

1. **Unit Tests** (5 days)
   - Entity tests (2 days)
   - Use case tests (2 days)
   - Repository tests (1 day)

2. **Integration Tests** (3 days)
   - API endpoint tests (2 days)
   - Provider integration tests (1 day)

3. **E2E Tests** (2 days)
   - Notification flow tests
   - Performance tests

### 13.6 Documentation Tasks

1. **API Documentation** (1 day)
   - OpenAPI/Swagger documentation
   - Request/response examples

2. **Feature Documentation** (1 day)
   - Architecture documentation
   - Usage examples

## 14. Timeline

| Week | Tasks |
|-------|-------|
| Week 1 | Domain Layer (Entities, Interfaces, Errors) |
| Week 2 | Application Layer (Use Cases, DTOs, Mappers) |
| Week 3 | Infrastructure Layer (Repositories, Providers) |
| Week 4 | Presentation Layer (Controllers, Routes) + Testing |
| Week 5 | Integration Testing, Documentation, Deployment |

## 15. Success Criteria

### 15.1 Functional Requirements

- [ ] Send notifications through multiple channels (email, SMS, push, in-app)
- [ ] Create and manage notification templates
- [ ] Respect user notification preferences
- [ ] Schedule notifications for future delivery
- [ ] Track delivery status and analytics
- [ ] Handle bulk notifications
- [ ] Implement retry mechanism for failed notifications

### 15.2 Non-Functional Requirements

- [ ] 99.9% uptime for notification delivery
- [ ] Response time < 100ms for API endpoints
- [ ] Support for 10,000 notifications per minute
- [ ] 99.99% data accuracy for delivery tracking
- [ ] Comprehensive test coverage (>90%)

### 15.3 Integration Requirements

- [ ] Seamless integration with existing authentication system
- [ ] Integration with user management system
- [ ] Integration with external notification providers
- [ ] Integration with existing monitoring and logging

## 16. Conclusion

This implementation plan provides a comprehensive blueprint for implementing Phase 9.0 (Notification Service) following the established clean architecture patterns from the authentication feature. The plan includes detailed specifications for all layers, testing strategies, integration points, and deployment considerations.

By following this plan, the notification service will:

1. Maintain architectural consistency with existing features
2. Provide robust multi-channel notification capabilities
3. Ensure scalability and performance
4. Maintain high code quality and testability
5. Integrate seamlessly with existing infrastructure

The implementation should be completed in approximately 5 weeks, with proper testing and documentation throughout the development process.