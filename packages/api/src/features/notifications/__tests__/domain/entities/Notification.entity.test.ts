import { describe, it, expect, beforeEach } from 'vitest';
import { Notification } from '../../../domain/entities/Notification.entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority
} from '../../../domain/types';
import {
  testNotificationIds,
  testUserIds,
  createTestNotification,
  createMinimalNotification
} from '../../utils/testFixtures.test';

describe('Notification Entity', () => {
  describe('Constructor', () => {
    it('should create a valid notification with all required fields', () => {
      const notification = new Notification(
        testNotificationIds.validNotification1,
        testUserIds.validUser1,
        NotificationType.INFO,
        'Test Notification',
        'This is a test notification',
        [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        NotificationStatus.PENDING,
        NotificationPriority.NORMAL,
        testNotificationIds.validNotification1,
        new Date('2023-12-01T10:00:00.000Z'),
        new Date('2023-12-01T10:01:00.000Z'),
        new Date('2023-12-01T10:02:00.000Z'),
        new Date('2023-12-01T10:05:00.000Z'),
        new Date('2023-12-31T23:59:59.000Z'),
        { source: 'test', category: 'system' },
        { emailId: 'email-123', pushId: 'push-456' },
        0,
        3,
        undefined,
        new Date('2023-12-01T10:00:00.000Z'),
        new Date('2023-12-01T10:05:00.000Z')
      );

      expect(notification.id).toBe(testNotificationIds.validNotification1);
      expect(notification.userId).toBe(testUserIds.validUser1);
      expect(notification.type).toBe(NotificationType.INFO);
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test notification');
      expect(notification.channels).toEqual([NotificationChannel.IN_APP, NotificationChannel.EMAIL]);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
      expect(notification.templateId).toBe(testNotificationIds.validNotification1);
      expect(notification.scheduledFor).toEqual(new Date('2023-12-01T10:00:00.000Z'));
      expect(notification.sentAt).toEqual(new Date('2023-12-01T10:01:00.000Z'));
      expect(notification.deliveredAt).toEqual(new Date('2023-12-01T10:02:00.000Z'));
      expect(notification.readAt).toEqual(new Date('2023-12-01T10:05:00.000Z'));
      expect(notification.expiresAt).toEqual(new Date('2023-12-31T23:59:59.000Z'));
      expect(notification.metadata).toEqual({ source: 'test', category: 'system' });
      expect(notification.deliveryData).toEqual({ emailId: 'email-123', pushId: 'push-456' });
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
      expect(notification.lastError).toBeUndefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a notification with default values', () => {
      const notification = new Notification(
        testNotificationIds.validNotification1,
        testUserIds.validUser1,
        NotificationType.INFO,
        'Test Notification',
        'This is a test notification',
        [NotificationChannel.IN_APP]
      );

      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
      expect(notification.templateId).toBeUndefined();
      expect(notification.scheduledFor).toBeUndefined();
      expect(notification.sentAt).toBeUndefined();
      expect(notification.deliveredAt).toBeUndefined();
      expect(notification.readAt).toBeUndefined();
      expect(notification.expiresAt).toBeUndefined();
      expect(notification.metadata).toEqual({});
      expect(notification.deliveryData).toEqual({});
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
      expect(notification.lastError).toBeUndefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid notification using factory method', () => {
      const notificationData = {
        userId: testUserIds.validUser1,
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        priority: NotificationPriority.HIGH,
        templateId: testNotificationIds.validNotification1,
        scheduledFor: new Date('2023-12-01T10:00:00.000Z'),
        expiresAt: new Date('2023-12-31T23:59:59.000Z'),
        metadata: { source: 'test', category: 'system' }
      };

      const notification = Notification.create(notificationData);

      expect(notification.userId).toBe(notificationData.userId);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.title).toBe(notificationData.title);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.channels).toEqual(notificationData.channels);
      expect(notification.priority).toBe(notificationData.priority);
      expect(notification.templateId).toBe(notificationData.templateId);
      expect(notification.scheduledFor).toBe(notificationData.scheduledFor);
      expect(notification.expiresAt).toBe(notificationData.expiresAt);
      expect(notification.metadata).toEqual(notificationData.metadata);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
      expect(notification.id).toBeDefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should create notification with default values using factory method', () => {
      const notificationData = {
        userId: testUserIds.validUser1,
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test notification',
        channels: [NotificationChannel.IN_APP]
      };

      const notification = Notification.create(notificationData);

      expect(notification.userId).toBe(notificationData.userId);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.title).toBe(notificationData.title);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.channels).toEqual(notificationData.channels);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.priority).toBe(NotificationPriority.NORMAL);
      expect(notification.templateId).toBeUndefined();
      expect(notification.scheduledFor).toBeUndefined();
      expect(notification.expiresAt).toBeUndefined();
      expect(notification.metadata).toEqual({});
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
      expect(notification.id).toBeDefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Methods', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = createTestNotification();
    });

    describe('markAsSent', () => {
      it('should mark notification as sent and return new instance', () => {
        const sentNotification = notification.markAsSent();

        expect(sentNotification.status).toBe(NotificationStatus.SENT);
        expect(sentNotification.sentAt).toBeInstanceOf(Date);
        expect(sentNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(sentNotification.id).toBe(notification.id);
        expect(sentNotification.userId).toBe(notification.userId);
        expect(sentNotification.type).toBe(notification.type);
        expect(sentNotification.title).toBe(notification.title);
        expect(sentNotification.message).toBe(notification.message);
      });
    });

    describe('markAsDelivered', () => {
      it('should mark notification as delivered and return new instance', () => {
        const deliveredNotification = notification.markAsDelivered();

        expect(deliveredNotification.status).toBe(NotificationStatus.DELIVERED);
        expect(deliveredNotification.deliveredAt).toBeInstanceOf(Date);
        expect(deliveredNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(deliveredNotification.id).toBe(notification.id);
        expect(deliveredNotification.userId).toBe(notification.userId);
      });
    });

    describe('markAsRead', () => {
      it('should mark notification as read and return new instance', () => {
        const readNotification = notification.markAsRead();

        expect(readNotification.status).toBe(NotificationStatus.DELIVERED);
        expect(readNotification.readAt).toBeInstanceOf(Date);
        expect(readNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(readNotification.id).toBe(notification.id);
        expect(readNotification.userId).toBe(notification.userId);
      });
    });

    describe('markAsProcessing', () => {
      it('should mark notification as processing and return new instance', () => {
        const processingNotification = notification.markAsProcessing();

        expect(processingNotification.status).toBe(NotificationStatus.PROCESSING);
        expect(processingNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(processingNotification.id).toBe(notification.id);
        expect(processingNotification.userId).toBe(notification.userId);
      });
    });

    describe('markAsFailed', () => {
      it('should mark notification as failed with error and return new instance', () => {
        const errorMessage = 'Provider error occurred';
        const failedNotification = notification.markAsFailed(errorMessage);

        expect(failedNotification.status).toBe(NotificationStatus.FAILED);
        expect(failedNotification.lastError).toBe(errorMessage);
        expect(failedNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(failedNotification.id).toBe(notification.id);
        expect(failedNotification.userId).toBe(notification.userId);
      });

      it('should mark notification as failed without error and return new instance', () => {
        const failedNotification = notification.markAsFailed();

        expect(failedNotification.status).toBe(NotificationStatus.FAILED);
        expect(failedNotification.lastError).toBeUndefined();
        expect(failedNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(failedNotification.id).toBe(notification.id);
        expect(failedNotification.userId).toBe(notification.userId);
      });
    });

    describe('incrementRetry', () => {
      it('should increment retry count and mark as failed', () => {
        const errorMessage = 'Retry attempt failed';
        const retriedNotification = notification.incrementRetry(errorMessage);

        expect(retriedNotification.status).toBe(NotificationStatus.FAILED);
        expect(retriedNotification.retryCount).toBe(1);
        expect(retriedNotification.lastError).toBe(errorMessage);
        expect(retriedNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(retriedNotification.id).toBe(notification.id);
        expect(retriedNotification.userId).toBe(notification.userId);
      });
    });

    describe('markAsCancelled', () => {
      it('should mark notification as cancelled and return new instance', () => {
        const cancelledNotification = notification.markAsCancelled();

        expect(cancelledNotification.status).toBe(NotificationStatus.CANCELLED);
        expect(cancelledNotification.updatedAt.getTime()).toBeGreaterThan(notification.updatedAt.getTime());
        expect(cancelledNotification.id).toBe(notification.id);
        expect(cancelledNotification.userId).toBe(notification.userId);
      });
    });
  });

  describe('Helper Methods', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = createTestNotification();
    });

    describe('isExpired', () => {
      it('should return true for expired notification', () => {
        const expiredNotification = createTestNotification({
          expiresAt: new Date(Date.now() - 1000) // Past date
        });
        expect(expiredNotification.isExpired()).toBe(true);
      });

      it('should return false for non-expired notification', () => {
        const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
        const nonExpiredNotification = createTestNotification({
          expiresAt: futureDate
        });
        expect(nonExpiredNotification.isExpired()).toBe(false);
      });

      it('should return false when expiresAt is not set', () => {
        const notificationWithoutExpiry = createTestNotification({
          expiresAt: undefined
        });
        expect(notificationWithoutExpiry.isExpired()).toBe(false);
      });
    });

    describe('canRetry', () => {
      it('should return true for failed notification with retries available', () => {
        const failedNotification = createTestNotification({
          status: NotificationStatus.FAILED,
          retryCount: 1,
          maxRetries: 3
        });
        expect(failedNotification.canRetry()).toBe(true);
      });

      it('should return false for failed notification with max retries reached', () => {
        const failedNotification = createTestNotification({
          status: NotificationStatus.FAILED,
          retryCount: 3,
          maxRetries: 3
        });
        expect(failedNotification.canRetry()).toBe(false);
      });

      it('should return false for non-failed notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.canRetry()).toBe(false);
      });
    });

    describe('isScheduled', () => {
      it('should return true for scheduled notification', () => {
        const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
        const scheduledNotification = createTestNotification({
          scheduledFor: futureDate
        });
        expect(scheduledNotification.isScheduled()).toBe(true);
      });

      it('should return false for immediate notification', () => {
        const immediateNotification = createTestNotification({
          scheduledFor: undefined
        });
        expect(immediateNotification.isScheduled()).toBe(false);
      });

      it('should return false for past scheduled date', () => {
        const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
        const pastScheduledNotification = createTestNotification({
          scheduledFor: pastDate
        });
        expect(pastScheduledNotification.isScheduled()).toBe(false);
      });
    });

    describe('isRead', () => {
      it('should return true for read notification', () => {
        const readNotification = createTestNotification({
          readAt: new Date()
        });
        expect(readNotification.isRead()).toBe(true);
      });

      it('should return false for unread notification', () => {
        const unreadNotification = createTestNotification({
          readAt: undefined
        });
        expect(unreadNotification.isRead()).toBe(false);
      });
    });

    describe('isDelivered', () => {
      it('should return true for delivered notification', () => {
        const deliveredNotification = createTestNotification({
          status: NotificationStatus.DELIVERED
        });
        expect(deliveredNotification.isDelivered()).toBe(true);
      });

      it('should return false for non-delivered notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isDelivered()).toBe(false);
      });
    });

    describe('isSent', () => {
      it('should return true for sent notification', () => {
        const sentNotification = createTestNotification({
          status: NotificationStatus.SENT
        });
        expect(sentNotification.isSent()).toBe(true);
      });

      it('should return false for non-sent notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isSent()).toBe(false);
      });
    });

    describe('isFailed', () => {
      it('should return true for failed notification', () => {
        const failedNotification = createTestNotification({
          status: NotificationStatus.FAILED
        });
        expect(failedNotification.isFailed()).toBe(true);
      });

      it('should return false for non-failed notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isFailed()).toBe(false);
      });
    });

    describe('isPending', () => {
      it('should return true for pending notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isPending()).toBe(true);
      });

      it('should return false for non-pending notification', () => {
        const sentNotification = createTestNotification({
          status: NotificationStatus.SENT
        });
        expect(sentNotification.isPending()).toBe(false);
      });
    });

    describe('isProcessing', () => {
      it('should return true for processing notification', () => {
        const processingNotification = createTestNotification({
          status: NotificationStatus.PROCESSING
        });
        expect(processingNotification.isProcessing()).toBe(true);
      });

      it('should return false for non-processing notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isProcessing()).toBe(false);
      });
    });

    describe('isCancelled', () => {
      it('should return true for cancelled notification', () => {
        const cancelledNotification = createTestNotification({
          status: NotificationStatus.CANCELLED
        });
        expect(cancelledNotification.isCancelled()).toBe(true);
      });

      it('should return false for non-cancelled notification', () => {
        const pendingNotification = createTestNotification({
          status: NotificationStatus.PENDING
        });
        expect(pendingNotification.isCancelled()).toBe(false);
      });
    });

    describe('hasChannel', () => {
      it('should return true for notification that has the channel', () => {
        const notificationWithEmail = createTestNotification({
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
        });
        expect(notificationWithEmail.hasChannel(NotificationChannel.EMAIL)).toBe(true);
        expect(notificationWithEmail.hasChannel(NotificationChannel.IN_APP)).toBe(true);
      });

      it('should return false for notification that does not have the channel', () => {
        const notificationWithEmail = createTestNotification({
          channels: [NotificationChannel.EMAIL]
        });
        expect(notificationWithEmail.hasChannel(NotificationChannel.SMS)).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid notification', () => {
        const notification = createTestNotification();
        const result = notification.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid notification', () => {
        const invalidNotification = new Notification(
          'invalid-id',
          testUserIds.validUser1,
          NotificationType.INFO,
          '', // Empty title
          '', // Empty message
          [], // Empty channels
          'invalid-status' as any, // Invalid status
          'invalid-priority' as any, // Invalid priority
          'invalid-template-id', // Invalid template ID
          'invalid-date' as any, // Invalid scheduled date
          'invalid-date' as any, // Invalid sent date
          'invalid-date' as any, // Invalid delivered date
          'invalid-date' as any, // Invalid read date
          'invalid-date' as any, // Invalid expires date
          'invalid-metadata' as any, // Invalid metadata
          'invalid-delivery-data' as any, // Invalid delivery data
          -1, // Invalid retry count
          -1, // Invalid max retries
          'invalid-last-error', // Invalid last error type
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any  // Invalid updated date
        );

        const result = invalidNotification.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const notificationData = {
          userId: testUserIds.validUser1,
          type: NotificationType.INFO,
          title: 'Test Notification',
          message: 'This is a test notification',
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          priority: NotificationPriority.NORMAL,
          templateId: testNotificationIds.validNotification1,
          scheduledFor: new Date('2023-12-01T10:00:00.000Z'),
          expiresAt: new Date('2023-12-31T23:59:59.000Z'),
          metadata: { source: 'test', category: 'system' }
        };

        const result = Notification.validateCreate(notificationData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid', // Invalid UUID
          type: 'invalid-type' as any, // Invalid type
          title: '', // Empty title
          message: '', // Empty message
          channels: [], // Empty channels
          priority: 'invalid-priority' as any, // Invalid priority
          templateId: 'invalid-template-id', // Invalid template ID
          scheduledFor: 'invalid-date' as any, // Invalid scheduled date
          expiresAt: 'invalid-date' as any, // Invalid expires date
          metadata: 'invalid-metadata' as any // Invalid metadata type
        };

        const result = Notification.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = createTestNotification();
    });

    describe('toJSON', () => {
      it('should return notification object with all properties', () => {
        const json = notification.toJSON();

        expect(json).toEqual({
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          channels: notification.channels,
          status: notification.status,
          priority: notification.priority,
          templateId: notification.templateId,
          scheduledFor: notification.scheduledFor,
          sentAt: notification.sentAt,
          deliveredAt: notification.deliveredAt,
          readAt: notification.readAt,
          expiresAt: notification.expiresAt,
          metadata: notification.metadata,
          deliveryData: notification.deliveryData,
          retryCount: notification.retryCount,
          maxRetries: notification.maxRetries,
          lastError: notification.lastError,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt
        });
      });
    });
  });
});