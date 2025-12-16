import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context } from 'hono';
import { GetNotificationsController } from '../../../presentation/controllers/GetNotificationsController';
import { GetNotificationsUseCase } from '../../../application/usecases/GetNotificationsUseCase';
import { GetNotificationsRequest } from '../../../application/dtos/input/GetNotificationsRequest';
import { GetNotificationsResponse } from '../../../application/dtos/output/GetNotificationsResponse';
import {
  NotificationStatus,
  NotificationType
} from '../../../domain/types';
import {
  testUserIds,
  createTestGetNotificationsRequest
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

describe('GetNotificationsController', () => {
  let getNotificationsController: GetNotificationsController;
  let mockGetNotificationsUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock the GetNotificationsUseCase
    mockGetNotificationsUseCase = {
      execute: vi.fn()
    };

    // Create controller instance with mocked dependencies
    getNotificationsController = new GetNotificationsController();

    // Mock the NotificationsContainer.getInstance() method
    vi.spyOn(getNotificationsController as any, 'constructor').mockImplementation(() => {
      (getNotificationsController as any).getNotificationsUseCase = mockGetNotificationsUseCase;
    });
  });

  describe('getNotifications', () => {
    it('should get notifications successfully', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          return undefined;
        })
      });

      const request = createTestGetNotificationsRequest();
      const expectedResponse: GetNotificationsResponse = {
        success: true,
        notifications: [
          {
            id: 'notification-1',
            userId: testUserIds.validUser1,
            type: NotificationType.INFO,
            title: 'Test Notification 1',
            message: 'This is a test notification 1',
            channels: ['in_app'] as any,
            status: 'delivered' as any,
            priority: 'normal' as any,
            retryCount: 0,
            maxRetries: 3,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'notification-2',
            userId: testUserIds.validUser1,
            type: NotificationType.INFO,
            title: 'Test Notification 2',
            message: 'This is a test notification 2',
            channels: ['email'] as any,
            status: 'delivered' as any,
            priority: 'normal' as any,
            retryCount: 0,
            maxRetries: 3,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (mockGetNotificationsUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockContext.get).toHaveBeenCalledWith('authenticatedUserId');
      expect(mockContext.req.query).toHaveBeenCalledWith('limit');
      expect(mockContext.req.query).toHaveBeenCalledWith('offset');
      expect(mockContext.req.query).toHaveBeenCalledWith('status');
      expect(mockContext.req.query).toHaveBeenCalledWith('type');
      expect(mockContext.req.query).toHaveBeenCalledWith('unreadOnly');

      expect(result).toEqual(expectedResponse);
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockContext = createMockContext({
        get: vi.fn(() => undefined)
      });

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      }, 401);
    });

    it('should parse query parameters correctly', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          return undefined;
        }),
        req: {
          query: vi.fn((param: string) => {
            switch (param) {
              case 'limit': return '10';
              case 'offset': return '20';
              case 'status': return 'delivered';
              case 'type': return 'info';
              case 'unreadOnly': return 'true';
              default: return undefined;
            }
          }) as any
        } as any
      });

      const expectedRequest: GetNotificationsRequest = {
        recipientId: testUserIds.validUser1,
        limit: 10,
        offset: 20,
        status: 'delivered' as NotificationStatus,
        type: 'info' as NotificationType,
        read: false
      };

      const expectedResponse: GetNotificationsResponse = {
        success: true,
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false
      };

      (mockGetNotificationsUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockGetNotificationsUseCase.execute).toHaveBeenCalledWith(expectedRequest);
      expect(result).toEqual(expectedResponse);
    });

    it('should use default values when query parameters are missing', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          return undefined;
        }),
        req: {
          query: vi.fn(() => undefined as any)
        } as any
      });

      const expectedRequest: GetNotificationsRequest = {
        recipientId: testUserIds.validUser1
      };

      const expectedResponse: GetNotificationsResponse = {
        success: true,
        notifications: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (mockGetNotificationsUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockGetNotificationsUseCase.execute).toHaveBeenCalledWith(expectedRequest);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle use case exceptions', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          return undefined;
        })
      });

      (mockGetNotificationsUseCase.execute as any).mockRejectedValue(new Error('Use case error'));

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      }, 500);
    });

    it('should handle boolean query parameter correctly', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'authenticatedUserId') {
            return testUserIds.validUser1;
          }
          return undefined;
        }),
        req: {
          query: vi.fn((param: string) => {
            if (param === 'unreadOnly') {
              return 'true';
            }
            return undefined;
          }) as any
        } as any
      });

      const expectedRequest: GetNotificationsRequest = {
        recipientId: testUserIds.validUser1,
        read: false // unreadOnly=true means read=false
      };

      const expectedResponse: GetNotificationsResponse = {
        success: true,
        notifications: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false
      };

      (mockGetNotificationsUseCase.execute as any).mockResolvedValue(expectedResponse);

      const result = await getNotificationsController.getNotifications(mockContext as any);

      expect(mockGetNotificationsUseCase.execute).toHaveBeenCalledWith(expectedRequest);
      expect(result).toEqual(expectedResponse);
    });
  });
});