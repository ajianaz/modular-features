import { z } from 'zod'
import { BaseEntity } from './base'

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'webhook'
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// Notification interface
export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  message: string
  channels: NotificationChannel[]
  status: NotificationStatus
  priority: NotificationPriority
  templateId?: string | null
  scheduledFor?: Date | null
  sentAt?: Date | null
  deliveredAt?: Date | null
  readAt?: Date | null
  expiresAt?: Date | null
  metadata?: Record<string, any> | null
  deliveryData?: Record<string, any> | null
  retryCount: number
  maxRetries: number
  lastError?: string | null
  externalId?: string | null
}

// Notification schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  type: z.enum(['info', 'success', 'warning', 'error', 'system']),
  title: z.string().min(1).max(500),
  message: z.string().min(1).max(5000),
  channels: z.array(z.enum(['email', 'sms', 'push', 'in_app', 'webhook'])),
  status: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  templateId: z.string().uuid().nullable().optional(),
  scheduledFor: z.date().nullable().optional(),
  sentAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  readAt: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  deliveryData: z.record(z.any()).nullable().optional(),
  retryCount: z.number().nonnegative().default(0),
  maxRetries: z.number().nonnegative().default(3),
  lastError: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
})

// Notification Template interface
export interface NotificationTemplate extends BaseEntity {
  name: string
  slug: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string | null
  template: string
  description?: string | null
  variables: Record<string, any>
  defaultValues?: Record<string, any> | null
  isSystem: boolean
  isActive: boolean
  metadata?: Record<string, any> | null
}

// Notification Template schema
export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  type: z.enum(['info', 'success', 'warning', 'error', 'system']),
  channel: z.enum(['email', 'sms', 'push', 'in_app', 'webhook']),
  subject: z.string().max(500).nullable().optional(),
  template: z.string().min(1).max(10000),
  description: z.string().max(1000).nullable().optional(),
  variables: z.record(z.any()),
  defaultValues: z.record(z.any()).nullable().optional(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Notification Preference interface
export interface NotificationPreference extends BaseEntity {
  userId: string
  type: string
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quietHoursEnabled: boolean
  quietHoursStart?: string | null
  quietHoursEnd?: string | null
  timezone?: string | null
  metadata?: Record<string, any> | null
}

// Notification Preference schema
export const NotificationPreferenceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  type: z.string().min(1).max(100),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
  timezone: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Notification Delivery interface
export interface NotificationDelivery extends BaseEntity {
  notificationId: string
  channel: NotificationChannel
  status: NotificationStatus
  recipient: string
  provider?: string | null
  providerMessageId?: string | null
  sentAt?: Date | null
  deliveredAt?: Date | null
  openedAt?: Date | null
  clickedAt?: Date | null
  failedAt?: Date | null
  errorMessage?: string | null
  metadata?: Record<string, any> | null
  retryCount: number
  maxRetries: number
  nextRetryAt?: Date | null
}

// Notification Delivery schema
export const NotificationDeliverySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notificationId: z.string().uuid(),
  channel: z.enum(['email', 'sms', 'push', 'in_app', 'webhook']),
  status: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']),
  recipient: z.string().min(1).max(500),
  provider: z.string().max(100).nullable().optional(),
  providerMessageId: z.string().max(500).nullable().optional(),
  sentAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  openedAt: z.date().nullable().optional(),
  clickedAt: z.date().nullable().optional(),
  failedAt: z.date().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  retryCount: z.number().nonnegative().default(0),
  maxRetries: z.number().nonnegative().default(3),
  nextRetryAt: z.date().nullable().optional(),
})

// Notification Group interface
export interface NotificationGroup extends BaseEntity {
  name: string
  description?: string | null
  type: string
  isActive: boolean
  metadata?: Record<string, any> | null
}

// Notification Group schema
export const NotificationGroupSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  type: z.string().min(1).max(100),
  isActive: z.boolean(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Notification Recipient interface (for bulk notifications)
export interface NotificationRecipient extends BaseEntity {
  notificationId: string
  userId: string
  status: NotificationStatus
  sentAt?: Date | null
  deliveredAt?: Date | null
  readAt?: Date | null
  openedAt?: Date | null
  clickedAt?: Date | null
  failedAt?: Date | null
  errorMessage?: string | null
  metadata?: Record<string, any> | null
}

// Notification Recipient schema
export const NotificationRecipientSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']),
  sentAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  readAt: z.date().nullable().optional(),
  openedAt: z.date().nullable().optional(),
  clickedAt: z.date().nullable().optional(),
  failedAt: z.date().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Notification Analytics interface
export interface NotificationAnalytics extends BaseEntity {
  notificationId?: string | null
  type: 'delivery' | 'engagement' | 'error'
  metric: string
  value: number
  count: number
  period: string
  periodStart: Date
  periodEnd: Date
  metadata?: Record<string, any> | null
}

// Notification Analytics schema
export const NotificationAnalyticsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  notificationId: z.string().uuid().nullable().optional(),
  type: z.enum(['delivery', 'engagement', 'error']),
  metric: z.string().min(1).max(100),
  value: z.number(),
  count: z.number().nonnegative(),
  period: z.string().min(1).max(20),
  periodStart: z.date(),
  periodEnd: z.date(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Notification configuration constants
export const NOTIFICATION_CHANNELS = {
  email: {
    name: 'Email',
    description: 'Send notifications via email',
    supportedTypes: ['info', 'success', 'warning', 'error'],
    maxSize: 25000000, // 25MB
    supportedFormats: ['html', 'text'],
  },
  sms: {
    name: 'SMS',
    description: 'Send notifications via SMS',
    supportedTypes: ['info', 'success', 'warning', 'error'],
    maxSize: 1600, // 1600 characters
    supportedFormats: ['text'],
  },
  push: {
    name: 'Push',
    description: 'Send push notifications',
    supportedTypes: ['info', 'success', 'warning', 'error', 'system'],
    maxSize: 4096, // 4KB
    supportedFormats: ['json'],
  },
  in_app: {
    name: 'In-App',
    description: 'Show notifications within the application',
    supportedTypes: ['info', 'success', 'warning', 'error', 'system'],
    maxSize: 10000, // 10KB
    supportedFormats: ['json'],
  },
  webhook: {
    name: 'Webhook',
    description: 'Send notifications via webhook',
    supportedTypes: ['info', 'success', 'warning', 'error', 'system'],
    maxSize: 100000, // 100KB
    supportedFormats: ['json'],
  },
} as const

export const NOTIFICATION_TYPES = {
  info: {
    name: 'Information',
    description: 'General information notifications',
    color: '#007bff',
    icon: 'info',
  },
  success: {
    name: 'Success',
    description: 'Success notifications',
    color: '#28a745',
    icon: 'check-circle',
  },
  warning: {
    name: 'Warning',
    description: 'Warning notifications',
    color: '#ffc107',
    icon: 'exclamation-triangle',
  },
  error: {
    name: 'Error',
    description: 'Error notifications',
    color: '#dc3545',
    icon: 'times-circle',
  },
  system: {
    name: 'System',
    description: 'System notifications',
    color: '#6c757d',
    icon: 'cog',
  },
} as const

export const NOTIFICATION_FREQUENCIES = {
  immediate: {
    name: 'Immediate',
    description: 'Send notifications immediately',
  },
  hourly: {
    name: 'Hourly',
    description: 'Send notifications once per hour',
  },
  daily: {
    name: 'Daily',
    description: 'Send notifications once per day',
  },
  weekly: {
    name: 'Weekly',
    description: 'Send notifications once per week',
  },
} as const

// Notification event types
export const NOTIFICATION_EVENT_TYPES = {
  // Notification events
  'notification.created': 'Notification created',
  'notification.sent': 'Notification sent',
  'notification.delivered': 'Notification delivered',
  'notification.read': 'Notification read',
  'notification.failed': 'Notification failed',
  'notification.cancelled': 'Notification cancelled',
  'notification.expired': 'Notification expired',
  
  // Template events
  'template.created': 'Template created',
  'template.updated': 'Template updated',
  'template.deleted': 'Template deleted',
  'template.activated': 'Template activated',
  'template.deactivated': 'Template deactivated',
  
  // Preference events
  'preference.updated': 'Preference updated',
  'preference.muted': 'Preference muted',
  'preference.unmuted': 'Preference unmuted',
  
  // Delivery events
  'delivery.started': 'Delivery started',
  'delivery.completed': 'Delivery completed',
  'delivery.retried': 'Delivery retried',
  'delivery.max_retries_reached': 'Max retries reached',
  
  // Analytics events
  'analytics.generated': 'Analytics generated',
  'analytics.updated': 'Analytics updated',
} as const

export type NotificationEventType = keyof typeof NOTIFICATION_EVENT_TYPES

// Notification provider types
export type NotificationProvider = 
  | 'sendgrid' 
  | 'twilio' 
  | 'firebase' 
  | 'pushbullet' 
  | 'slack' 
  | 'discord' 
  | 'telegram' 
  | 'whatsapp' 
  | 'custom'

export const NOTIFICATION_PROVIDERS = {
  sendgrid: {
    name: 'SendGrid',
    channels: ['email'],
    features: ['templates', 'analytics', 'bounce_handling'],
  },
  twilio: {
    name: 'Twilio',
    channels: ['sms'],
    features: ['templates', 'analytics', 'mms_support'],
  },
  firebase: {
    name: 'Firebase Cloud Messaging',
    channels: ['push'],
    features: ['topics', 'analytics', 'apns_support'],
  },
  pushbullet: {
    name: 'Pushbullet',
    channels: ['push'],
    features: ['real_time', 'file_sharing', 'device_sync'],
  },
  slack: {
    name: 'Slack',
    channels: ['webhook'],
    features: ['rich_formatting', 'channels', 'attachments'],
  },
  discord: {
    name: 'Discord',
    channels: ['webhook'],
    features: ['rich_formatting', 'embeds', 'mentions'],
  },
  telegram: {
    name: 'Telegram',
    channels: ['webhook'],
    features: ['inline_buttons', 'media_support', 'location_sharing'],
  },
  whatsapp: {
    name: 'WhatsApp',
    channels: ['sms'],
    features: ['rich_media', 'interactive_buttons', 'business_api'],
  },
  custom: {
    name: 'Custom Provider',
    channels: ['email', 'sms', 'push', 'webhook'],
    features: ['full_customization', 'private_integration'],
  },
} as const

export type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  NotificationTemplate,
  NotificationPreference,
  NotificationDelivery,
  NotificationGroup,
  NotificationRecipient,
  NotificationAnalytics,
  NotificationProvider,
  NotificationEventType,
}
