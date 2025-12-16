import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SendNotificationUseCase } from '../../../application/usecases/SendNotificationUseCase';
import { Notification } from '../../../domain/entities/Notification.entity';
import { NotificationTemplate } from '../../../domain/entities/NotificationTemplate.entity';
import { NotificationPreference } from '../../../domain/entities/NotificationPreference.entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority
} from '../../../domain/types';
import {
  testUserIds,
  testTemplateIds,
  createTestNotification,
  createTestNotificationTemplate,
  createTestNotificationPreference,
  createTestSendNotificationRequest
} from '../../utils/testFixtures.test';

// Mock interfaces
const createMockNotificationRepository = () => ({
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  delete: vi.fn(),
  findPendingNotifications: vi.fn(),
  findScheduledNotifications: vi.fn(),
  findFailedNotifications: vi.fn(),
  countByStatus: vi.fn(),
  findByStatus: vi.fn(),
  findByType: vi.fn(),
  findByChannel: vi.fn(),
  findByPriority: vi.fn(),
  findExpired: vi.fn(),
  findScheduledForUser: vi.fn(),
  findUnreadByUser: vi.fn(),
  markAsRead: vi.fn(),
  markMultipleAsRead: vi.fn(),
  cancelScheduled: vi.fn(),
  deleteExpired: vi.fn(),
  deleteOlderThan: vi.fn()
});

const createMockTemplateRepository = () => ({
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
  findBySlug: vi.fn(),
  findByType: vi.fn(),
  findByChannel: vi.fn(),
  findActive: vi.fn(),
  findByTypeAndChannel: vi.fn(),
  findSystemTemplates: vi.fn(),
  findUserTemplates: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn()
});

const createMockPreferenceRepository = () => ({
  findByUserIdAndType: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findByType: vi.fn(),
  findByFrequency: vi.fn(),
  deleteByUserId: vi.fn(),
  findActive: vi.fn(),
  updateByUserIdAndType: vi.fn()
});

const createMockNotificationProvider = () => ({
  send: vi.fn(),
  isAvailable: vi.fn(),
  getName: vi.fn(),
  getType: vi.fn()
});

describe('SendNotificationUseCase', () => {
  let sendNotificationUseCase: SendNotificationUseCase;
  let mockNotificationRepository: ReturnType<typeof createMockNotificationRepository>;
  let mockTemplateRepository: ReturnType<typeof createMockTemplateRepository>;
  let mockPreferenceRepository: ReturnType<typeof createMockPreferenceRepository>;
  let mockProviders: Map<NotificationChannel, ReturnType<typeof createMockNotificationProvider>>;
  let mockEmailProvider: ReturnType<typeof createMockNotificationProvider>;
  let mockPushProvider: ReturnType<typeof createMockNotificationProvider>;

  beforeEach(() => {
    // Mock repositories
    mockNotificationRepository = createMockNotificationRepository();
    mockTemplateRepository = createMockTemplateRepository();
    mockPreferenceRepository = createMockPreferenceRepository();

    // Mock providers
    mockEmailProvider = createMockNotificationProvider();
    mockPushProvider = createMockNotificationProvider();

    mockProviders = new Map([
      [NotificationChannel.EMAIL, mockEmailProvider],
      [NotificationChannel.PUSH, mockPushProvider]
    ]);

    sendNotificationUseCase = new SendNotificationUseCase(
      mockNotificationRepository,
      mockTemplateRepository,
      mockPreferenceRepository,
      mockProviders
    );
  });

  describe('execute', () => {
    it('should send notification successfully without template', async () => {
      const request = createTestSendNotificationRequest({
        templateId: undefined
      });

      const mockNotification = createTestNotification();
      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      (mockEmailProvider.send as any).mockResolvedValue({ success: true, messageId: 'email-123' });
      (mockPushProvider.send as any).mockResolvedValue({ success: true, messageId: 'push-456' });

      const result = await sendNotificationUseCase.execute(request);

      expect(mockPreferenceRepository.findByUserIdAndType).toHaveBeenCalledWith(
        request.recipientId,
        request.type
      );
      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockEmailProvider.send).toHaveBeenCalled();
      expect(mockPushProvider.send).toHaveBeenCalled();
      expect(mockNotificationRepository.update).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.message).toBe('Notification sent successfully');
    });

    it('should send notification successfully with template', async () => {
      const mockTemplate = createTestNotificationTemplate();
      const request = createTestSendNotificationRequest({
        templateId: testTemplateIds.validTemplate1,
        templateVariables: { name: 'John Doe' }
      });

      const mockNotification = createTestNotification({
        title: mockTemplate.renderSubject({ name: 'John Doe' }) || request.title,
        message: mockTemplate.render({ name: 'John Doe' })
      });

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      (mockTemplateRepository.findById as any).mockResolvedValue(mockTemplate);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      vi.mocked(mockPushProvider.send).mockResolvedValue({ success: true, messageId: 'push-456' });

      const result = await sendNotificationUseCase.execute(request);

      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(testTemplateIds.validTemplate1);
      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockEmailProvider.send).toHaveBeenCalled();
      expect(mockPushProvider.send).toHaveBeenCalled();
      expect(mockNotificationRepository.update).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.message).toBe('Notification sent successfully');
    });

    it('should respect user preferences and filter channels', async () => {
      const userPreferences = [
        createTestNotificationPreference({
          type: 'general',
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: false
        })
      ];

      const request = createTestSendNotificationRequest({
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.PUSH, NotificationChannel.IN_APP]
      });

      const mockNotification = createTestNotification({
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH] // Only enabled channels
      });

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue(userPreferences);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      vi.mocked(mockPushProvider.send).mockResolvedValue({ success: true, messageId: 'push-456' });

      const result = await sendNotificationUseCase.execute(request);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH]
        })
      );
      expect(mockEmailProvider.send).toHaveBeenCalled();
      expect(mockPushProvider.send).toHaveBeenCalled();

      expect(result.success).toBe(true);
    });

    it('should return error when no enabled channels', async () => {
      const userPreferences = [
        createTestNotificationPreference({
          type: 'general',
          emailEnabled: false,
          smsEnabled: false,
          pushEnabled: false,
          inAppEnabled: false
        })
      ];

      const request = createTestSendNotificationRequest();

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue(userPreferences);

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No enabled notification channels for this user');
      expect(result.notification).toBeUndefined();
    });

    it('should return error when template not found', async () => {
      const request = createTestSendNotificationRequest({
        templateId: testTemplateIds.nonExistentTemplate
      });

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      vi.mocked(mockTemplateRepository.findById).mockResolvedValue(null);

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Notification template not found');
      expect(result.notification).toBeUndefined();
    });

    it('should return error when validation fails', async () => {
      const invalidRequest = {
        recipientId: 'invalid-uuid',
        type: 'invalid-type' as any,
        title: '',
        content: '',
        channels: []
      } as any;

      const result = await sendNotificationUseCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed:');
      expect(result.notification).toBeUndefined();
    });

    it('should handle partial provider failures', async () => {
      const request = createTestSendNotificationRequest();

      const mockNotification = createTestNotification();

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      vi.mocked(mockPushProvider.send).mockResolvedValue({ success: false, error: 'Push service unavailable' });

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Some notifications failed');
      expect(result.notification).toBeDefined();
    });

    it('should handle provider exceptions', async () => {
      const request = createTestSendNotificationRequest();

      const mockNotification = createTestNotification();

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      vi.mocked(mockPushProvider.send).mockRejectedValue(new Error('Network error'));

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Some notifications failed');
      expect(result.notification).toBeDefined();
    });

    it('should handle repository exceptions', async () => {
      const request = createTestSendNotificationRequest();

      (mockPreferenceRepository.findByUserIdAndType as any).mockRejectedValue(new Error('Database error'));

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.notification).toBeUndefined();
    });

    it('should use default values from template when variables not provided', async () => {
      const mockTemplate = createTestNotificationTemplate({
        template: 'Hello {{name}}, welcome to {{platform}}!',
        defaultValues: { name: 'User', platform: 'our platform' }
      });

      const request = createTestSendNotificationRequest({
        templateId: testTemplateIds.validTemplate1,
        templateVariables: {} // No variables provided
      });

      const mockNotification = createTestNotification({
        title: 'Hello User, welcome to our platform!',
        message: 'Hello User, welcome to our platform!'
      });

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      vi.mocked(mockTemplateRepository.findById).mockResolvedValue(mockTemplate);
      vi.mocked(mockNotificationRepository.create).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });

      const result = await sendNotificationUseCase.execute(request);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hello User, welcome to our platform!',
          message: 'Hello User, welcome to our platform!'
        })
      );

      expect(result.success).toBe(true);
    });

    it('should handle missing provider for channel', async () => {
      const request = createTestSendNotificationRequest({
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS]
      });

      const mockNotification = createTestNotification();

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      (mockNotificationRepository.create as any).mockResolvedValue(mockNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      // SMS provider is not in mockProviders map

      const result = await sendNotificationUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Some notifications failed');
      expect(result.notification).toBeDefined();
    });

    it('should mark notification as sent when all providers succeed', async () => {
      const request = createTestSendNotificationRequest();

      const pendingNotification = createTestNotification({ status: NotificationStatus.PENDING });
      const sentNotification = pendingNotification.markAsSent();

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      vi.mocked(mockNotificationRepository.create).mockResolvedValue(pendingNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: true, messageId: 'email-123' });
      vi.mocked(mockPushProvider.send).mockResolvedValue({ success: true, messageId: 'push-456' });
      vi.mocked(mockNotificationRepository.update).mockResolvedValue(sentNotification);

      const result = await sendNotificationUseCase.execute(request);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.SENT
        })
      );

      expect(result.success).toBe(true);
    });

    it('should mark notification as failed when all providers fail', async () => {
      const request = createTestSendNotificationRequest();

      const pendingNotification = createTestNotification({ status: NotificationStatus.PENDING });
      const failedNotification = pendingNotification.markAsFailed('Provider error');

      (mockPreferenceRepository.findByUserIdAndType as any).mockResolvedValue([]);
      vi.mocked(mockNotificationRepository.create).mockResolvedValue(pendingNotification);
      vi.mocked(mockEmailProvider.send).mockResolvedValue({ success: false, error: 'Email service down' });
      vi.mocked(mockPushProvider.send).mockResolvedValue({ success: false, error: 'Push service down' });
      vi.mocked(mockNotificationRepository.update).mockResolvedValue(failedNotification);

      const result = await sendNotificationUseCase.execute(request);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.FAILED,
          lastError: expect.stringContaining('Provider error')
        })
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Some notifications failed');
    });
  });
});