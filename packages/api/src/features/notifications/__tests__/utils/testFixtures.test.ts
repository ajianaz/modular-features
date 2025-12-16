import {
  Notification,
  NotificationTemplate,
  NotificationPreference,
  NotificationDelivery,
  NotificationGroup,
  NotificationRecipient,
  NotificationAnalytics
} from '../../domain/entities';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  NotificationFrequency
} from '../../domain/types';

// Test data fixtures
export const testNotificationIds = {
  validNotification1: '123e4567-e89b-12d3-a456-426614174001',
  validNotification2: '123e4567-e89b-12d3-a456-426614174002',
  validNotification3: '123e4567-e89b-12d3-a456-426614174003',
  nonExistentNotification: '123e4567-e89b-12d3-a456-426614174999'
};

export const testTemplateIds = {
  validTemplate1: '123e4567-e89b-12d3-a456-426614174101',
  validTemplate2: '123e4567-e89b-12d3-a456-426614174102',
  nonExistentTemplate: '123e4567-e89b-12d3-a456-426614174999'
};

export const testUserIds = {
  validUser1: '123e4567-e89b-12d3-a456-426614174201',
  validUser2: '123e4567-e89b-12d3-a456-426614174202',
  validUser3: '123e4567-e89b-12d3-a456-426614174203',
  nonExistentUser: '123e4567-e89b-12d3-a456-426614174999'
};

export const testGroupIds = {
  validGroup1: '123e4567-e89b-12d3-a456-426614174301',
  validGroup2: '123e4567-e89b-12d3-a456-426614174302',
  nonExistentGroup: '123e4567-e89b-12d3-a456-426614174999'
};

// Notification fixtures
export const createTestNotification = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: testNotificationIds.validNotification1,
    userId: testUserIds.validUser1,
    type: NotificationType.INFO,
    title: 'Test Notification',
    message: 'This is a test notification message',
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    status: NotificationStatus.PENDING,
    priority: NotificationPriority.NORMAL,
    templateId: testTemplateIds.validTemplate1,
    scheduledFor: new Date('2023-12-01T10:00:00.000Z'),
    sentAt: new Date('2023-12-01T10:01:00.000Z'),
    deliveredAt: new Date('2023-12-01T10:02:00.000Z'),
    readAt: new Date('2023-12-01T10:05:00.000Z'),
    expiresAt: new Date('2023-12-31T23:59:59.000Z'),
    metadata: { source: 'test', category: 'system' },
    deliveryData: { emailId: 'email-123', pushId: 'push-456' },
    retryCount: 0,
    maxRetries: 3,
    lastError: undefined,
    createdAt: new Date('2023-12-01T10:00:00.000Z'),
    updatedAt: new Date('2023-12-01T10:05:00.000Z')
  };

  const merged = { ...defaults, ...overrides };
  return new Notification(
    merged.id,
    merged.userId,
    merged.type,
    merged.title,
    merged.message,
    merged.channels,
    merged.status,
    merged.priority,
    merged.templateId,
    merged.scheduledFor,
    merged.sentAt,
    merged.deliveredAt,
    merged.readAt,
    merged.expiresAt,
    merged.metadata,
    merged.deliveryData,
    merged.retryCount,
    merged.maxRetries,
    merged.lastError,
    merged.createdAt,
    merged.updatedAt
  );
};

export const createMinimalNotification = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1,
    type: NotificationType.INFO,
    title: 'Minimal Test Notification',
    message: 'This is a minimal test notification',
    channels: [NotificationChannel.IN_APP]
  };

  return Notification.create({ ...defaults, ...overrides });
};

// NotificationTemplate fixtures
export const createTestNotificationTemplate = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: testTemplateIds.validTemplate1,
    name: 'Welcome Template',
    slug: 'welcome-template',
    type: NotificationType.INFO,
    channel: NotificationChannel.EMAIL,
    subject: 'Welcome to our platform!',
    template: 'Hello {{name}}, welcome to {{platform}}!',
    description: 'Template for welcome notifications',
    variables: { name: 'string', platform: 'string' },
    defaultValues: { name: 'User', platform: 'our platform' },
    isSystem: false,
    metadata: { version: '1.0', category: 'onboarding' },
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  const merged = { ...defaults, ...overrides };
  return new NotificationTemplate(
    merged.id,
    merged.name,
    merged.slug,
    merged.type,
    merged.channel,
    merged.template,
    merged.description,
    merged.variables,
    merged.defaultValues,
    merged.isSystem,
    merged.isActive,
    merged.metadata,
    merged.createdAt,
    merged.updatedAt,
    merged.subject
  );
};

export const createMinimalNotificationTemplate = (overrides: Partial<any> = {}) => {
  const defaults = {
    name: 'Minimal Template',
    slug: 'minimal-template',
    type: NotificationType.INFO,
    channel: NotificationChannel.EMAIL,
    template: 'Hello {{name}}!'
  };

  return NotificationTemplate.create({ ...defaults, ...overrides });
};

// NotificationPreference fixtures
export const createTestNotificationPreference = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: '123e4567-e89b-12d3-a456-426614174401',
    userId: testUserIds.validUser1,
    type: 'general',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: NotificationFrequency.IMMEDIATE,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'America/New_York',
    metadata: { preferences: 'custom' },
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  const merged = { ...defaults, ...overrides };
  return new NotificationPreference(
    merged.id,
    merged.userId,
    merged.type,
    merged.emailEnabled,
    merged.smsEnabled,
    merged.pushEnabled,
    merged.inAppEnabled,
    merged.frequency,
    merged.quietHoursEnabled,
    merged.quietHoursStart,
    merged.quietHoursEnd,
    merged.timezone,
    merged.metadata,
    merged.createdAt,
    merged.updatedAt
  );
};

export const createMinimalNotificationPreference = (overrides: Partial<any> = {}) => {
  const defaults = {
    userId: testUserIds.validUser1,
    type: 'general',
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true
  };

  return NotificationPreference.create({ ...defaults, ...overrides });
};

// NotificationDelivery fixtures
export const createTestNotificationDelivery = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: '123e4567-e89b-12d3-a456-426614174501',
    notificationId: testNotificationIds.validNotification1,
    channel: NotificationChannel.EMAIL,
    recipient: 'test@example.com',
    status: NotificationStatus.DELIVERED,
    messageId: 'msg-123456',
    provider: 'sendgrid',
    deliveryData: { response: 'success', messageId: 'sendgrid-123' },
    error: undefined,
    retryCount: 0,
    maxRetries: 3,
    sentAt: new Date('2023-12-01T10:01:00.000Z'),
    deliveredAt: new Date('2023-12-01T10:02:00.000Z'),
    createdAt: new Date('2023-12-01T10:00:00.000Z'),
    updatedAt: new Date('2023-12-01T10:02:00.000Z')
  };

  const merged = { ...defaults, ...overrides };
  // Convert NotificationStatus enum to string literal expected by NotificationDelivery constructor
  const statusValue = merged.status as NotificationStatus;
  const deliveryStatus = statusValue === NotificationStatus.PENDING ? 'pending' :
                        statusValue === NotificationStatus.SENT ? 'sent' :
                        statusValue === NotificationStatus.DELIVERED ? 'delivered' :
                        statusValue === NotificationStatus.FAILED ? 'failed' : 'pending';

  return new NotificationDelivery(
    merged.id,
    merged.notificationId,
    merged.channel,
    merged.recipient,
    deliveryStatus,
    merged.messageId,
    merged.error,
    merged.deliveryData,
    merged.sentAt,
    merged.deliveredAt,
    merged.createdAt,
    merged.updatedAt
  );
};

// NotificationGroup fixtures
export const createTestNotificationGroup = (overrides: Partial<any> = {}) => {
  const defaults = {
    id: testGroupIds.validGroup1,
    name: 'Test Group',
    description: 'A test notification group',
    metadata: { category: 'test', purpose: 'testing' },
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z')
  };

  const merged = { ...defaults, ...overrides };
  return new NotificationGroup(
    merged.id,
    merged.name,
    merged.description,
    merged.metadata,
    merged.createdAt,
    merged.updatedAt
  );
};

// NotificationRecipient fixtures
export const createTestNotificationRecipient = (overrides: Partial<any> = {}) => {
  const defaults = {
    notificationId: testNotificationIds.validNotification1,
    userId: testUserIds.validUser1,
    type: 'to' as const,
    email: 'test@example.com',
    phone: '+1234567890',
    deviceToken: 'device-token-123',
    metadata: { source: 'user_profile' }
  };

  const merged = { ...defaults, ...overrides };
  return new NotificationRecipient(
    crypto.randomUUID(), // Generate ID for recipients
    merged.notificationId,
    merged.userId,
    merged.type,
    merged.email,
    merged.phone,
    merged.deviceToken,
    merged.metadata,
    new Date(),
    new Date()
  );
};

// NotificationAnalytics fixtures
export const createTestNotificationAnalytics = (overrides: Partial<any> = {}) => {
  const defaults = {
    notificationId: testNotificationIds.validNotification1,
    event: 'delivered' as const,
    channel: NotificationChannel.EMAIL,
    timestamp: new Date('2023-12-01T10:02:00.000Z'),
    metadata: {
      messageId: 'msg-123456',
      provider: 'sendgrid',
      response: 'success'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ipAddress: '192.168.1.1'
  };

  const merged = { ...defaults, ...overrides };
  return new NotificationAnalytics(
    crypto.randomUUID(), // Generate ID for analytics
    merged.notificationId,
    merged.event,
    merged.channel,
    merged.timestamp,
    merged.metadata,
    merged.userAgent,
    merged.ipAddress,
    new Date(),
    new Date()
  );
};

// Mock data for repositories
export const mockNotificationData = {
  [testNotificationIds.validNotification1]: createTestNotification(),
  [testNotificationIds.validNotification2]: createTestNotification({
    id: testNotificationIds.validNotification2,
    userId: testUserIds.validUser2,
    type: NotificationType.SUCCESS
  }),
  [testNotificationIds.validNotification3]: createTestNotification({
    id: testNotificationIds.validNotification3,
    userId: testUserIds.validUser3,
    type: NotificationType.WARNING
  })
};

export const mockTemplateData = {
  [testTemplateIds.validTemplate1]: createTestNotificationTemplate(),
  [testTemplateIds.validTemplate2]: createTestNotificationTemplate({
    id: testTemplateIds.validTemplate2,
    name: 'Alert Template',
    slug: 'alert-template',
    type: NotificationType.WARNING
  })
};

export const mockPreferenceData = {
  [testUserIds.validUser1]: createTestNotificationPreference(),
  [testUserIds.validUser2]: createTestNotificationPreference({
    userId: testUserIds.validUser2,
    emailEnabled: false,
    smsEnabled: true
  }),
  [testUserIds.validUser3]: createTestNotificationPreference({
    userId: testUserIds.validUser3,
    frequency: NotificationFrequency.DAILY
  })
};

// Test request/response data
export const createTestSendNotificationRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    recipientId: testUserIds.validUser1,
    type: NotificationType.INFO,
    title: 'Test Notification',
    content: 'This is a test notification',
    data: { source: 'test' },
    priority: NotificationPriority.NORMAL,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    templateId: testTemplateIds.validTemplate1,
    templateVariables: { name: 'Test User' },
    metadata: { requestId: 'req-123' }
  };

  return { ...defaults, ...overrides };
};

export const createTestGetNotificationsRequest = (overrides: Partial<any> = {}) => {
  const defaults = {
    recipientId: testUserIds.validUser1,
    status: NotificationStatus.DELIVERED,
    type: NotificationType.INFO,
    read: false,
    limit: 20,
    offset: 0,
    startDate: new Date('2023-12-01T00:00:00.000Z'),
    endDate: new Date('2023-12-31T23:59:59.000Z')
  };

  return { ...defaults, ...overrides };
};

// Helper functions for testing
export const createDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0) => {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

// Async test helpers
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Validation helpers
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};