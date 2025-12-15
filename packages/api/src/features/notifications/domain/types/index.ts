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