import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context } from 'hono';
import { SendNotificationController } from '../../../presentation/controllers/SendNotificationController';
import { SendNotificationUseCase } from '../../../application/usecases/SendNotificationUseCase';
import { SendNotificationRequest } from '../../../application/dtos/input/SendNotificationRequest';
import { SendNotificationResponse } from '../../../application/dtos/output/SendNotificationResponse';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority
} from '../../../domain/types';
import {
  testUserIds,
  testTemplateIds,
  createTestSendNotificationRequest
} from '../../utils/testFixtures.test';

// Mock Hono Context
const createMockContext = (overrides: Partial<Context> = {}) => {
  const context: Partial<Context> = {
    req: {
      json: vi.fn(),
      query: vi.fn(() => ({} as any)),
      header: vi.fn(() => ('' as any))
    } as any,
    json: vi.fn() as any,
    get: vi.fn(),
    set: vi.fn()
  };

  return {
    ...context,
    ...overrides
  } as Context;
};

describe('SendNotificationController', () => {
  let sendNotificationController: SendNotificationController;
  let mockSendNotificationUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock the SendNotificationUseCase
    mockSendNotificationUseCase = {
      execute: vi.fn()
    };

    // Create controller instance with mocked dependencies
    sendNotificationController = new SendNotificationController();

    // Mock the NotificationsContainer.getInstance() method
    vi.spyOn(sendNotificationController as any, 'constructor').mockImplementation(() => {
      (sendNotificationController as any).sendNotificationUseCase = mockSendNotificationUseCase;
    });
  });

  describe('send', () => {
    it('should send notification successfully', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const request = createTestSendNotificationRequest();
      const expectedResponse: SendNotificationResponse = {
        success: true,
        notification: {
          id: 'notification-123',
          userId: testUserIds.validUser1,
          type: NotificationType.INFO,
          title: 'Test Notification',
          message: 'This is a test notification',
          content: 'This is a test notification',
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          status: 'sent' as any,
          priority: NotificationPriority.NORMAL,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        message: 'Notification sent successfully'
      };

      (mockSendNotificationUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await sendNotificationController.send(mockContext as any);

      expect(mockContext.get).toHaveBeenCalledWith('authenticatedUserId');
      expect(mockContext.get).toHaveBeenCalledWith('notificationContext');
      expect(mockContext.req.json).toHaveBeenCalled();

      expect(result).toEqual(expectedResponse);
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockContext = createMockContext({
        get: vi.fn(() => undefined)
      });

      const result = await sendNotificationController.send(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      }, 401);
    });

    it('should handle validation errors', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const invalidRequest = {
        recipientId: 'invalid-uuid',
        type: 'invalid-type' as any,
        title: '',
        content: '',
        channels: []
      };

      (mockContext.req.json as any).mockResolvedValue(invalidRequest);

      const expectedResponse = {
        success: false,
        error: 'Validation failed: recipientId: Invalid uuid',
        notification: undefined
      };

      (mockSendNotificationUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await sendNotificationController.send(mockContext as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should handle template not found error', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const request = createTestSendNotificationRequest({
        templateId: testTemplateIds.nonExistentTemplate
      });

      const expectedResponse = {
        success: false,
        error: 'Notification template not found',
        notification: undefined
      };

      (mockContext.req.json as any).mockResolvedValue(request);
      (mockSendNotificationUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await sendNotificationController.send(mockContext as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should add notification context metadata to request', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const request = createTestSendNotificationRequest({
        metadata: { source: 'test' }
      });

      const expectedRequestWithMetadata = {
        ...request,
        metadata: {
          source: 'test',
          requestId: 'test-request-id',
          timestamp: '2023-12-01T10:00:00.000Z'
        }
      };

      const expectedResponse = {
        success: true,
        notification: {
          id: 'notification-123',
          userId: testUserIds.validUser1,
          type: NotificationType.INFO,
          title: 'Test Notification',
          message: 'This is a test notification',
          content: 'This is a test notification',
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          status: 'sent',
          priority: NotificationPriority.NORMAL,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        message: 'Notification sent successfully'
      };

      (mockContext.req.json as any).mockResolvedValue(request);
      (mockSendNotificationUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await sendNotificationController.send(mockContext as any);

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expectedRequestWithMetadata);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle partial provider failures', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const request = createTestSendNotificationRequest();

      const expectedResponse = {
        success: false,
        notification: {
          id: 'notification-123',
          userId: testUserIds.validUser1,
          type: NotificationType.INFO,
          title: 'Test Notification',
          message: 'This is a test notification',
          content: 'This is a test notification',
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          status: 'failed',
          priority: NotificationPriority.NORMAL,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        message: 'Some notifications failed'
      };

      (mockContext.req.json as any).mockResolvedValue(request);
      (mockSendNotificationUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await sendNotificationController.send(mockContext as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should handle use case exceptions', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          if (key === 'notificationContext') {
            return {
              requestId: 'test-request-id',
              timestamp: '2023-12-01T10:00:00.000Z'
            };
          }
          return undefined;
        })
      });

      const request = createTestSendNotificationRequest();

      (mockContext.req.json as any).mockResolvedValue(request);
      (mockSendNotificationUseCase.execute as any).mockRejectedValue(new Error('Use case error'));

      const result = await sendNotificationController.send(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
    });
  });
});