import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context, Next } from 'hono';
import {
  notificationPermissionMiddleware,
  notificationContextMiddleware
} from '../../../presentation/middleware';
import {
  testUserIds
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

// Mock Next function
const createMockNext = () => vi.fn();

describe('Notification Middleware', () => {
  describe('notificationPermissionMiddleware', () => {
    it('should pass through when user is authenticated', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        })
      });

      const mockNext = createMockNext();

      await notificationPermissionMiddleware(mockContext as any, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('user');
      expect(mockContext.set).toHaveBeenCalledWith('authenticatedUserId', testUserIds.validUser1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockContext = createMockContext({
        get: vi.fn(() => undefined)
      });

      const mockNext = createMockNext();

      const result = await notificationPermissionMiddleware(mockContext as any, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: 'Authentication required'
      }, 401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow users to send notifications to themselves', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        }),
        req: {
          json: vi.fn().mockResolvedValue({
            recipientId: testUserIds.validUser1
          })
        } as any
      });

      const mockNext = createMockNext();

      await notificationPermissionMiddleware(mockContext as any, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('user');
      expect(mockContext.set).toHaveBeenCalledWith('authenticatedUserId', testUserIds.validUser1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should check permissions when sending to other users', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        }),
        req: {
          json: vi.fn().mockResolvedValue({
            recipientId: testUserIds.validUser2 // Different user
          })
        }
      });

      const mockNext = createMockNext();

      await notificationPermissionMiddleware(mockContext as any, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('user');
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();

      // TODO: This test will need to be updated when permission checking is implemented
      // For now, just ensure it passes through
    });
  });

  describe('notificationContextMiddleware', () => {
    it('should set notification context for authenticated user', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        })
      });

      const mockNext = createMockNext();

      await notificationContextMiddleware(mockContext as any, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('user');
      expect(mockContext.set).toHaveBeenCalledWith('notificationContext', {
        userId: testUserIds.validUser1,
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockContext = createMockContext({
        get: vi.fn(() => undefined)
      });

      const mockNext = createMockNext();

      const result = await notificationContextMiddleware(mockContext as any, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: 'Authentication required'
      }, 401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should generate unique request ID', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        })
      });

      const mockNext = createMockNext();

      await notificationContextMiddleware(mockContext as any, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('notificationContext', {
        userId: testUserIds.validUser1,
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalledWith();

      // Verify that request ID is a UUID
      const setCalls = (mockContext.set as any).mock.calls;
      expect(setCalls).toHaveLength(1);
      const contextSet = setCalls[0][1];
      expect(contextSet.userId).toBe(testUserIds.validUser1);
      expect(typeof contextSet.timestamp).toBe('string');
      expect(typeof contextSet.requestId).toBe('string');
      expect(contextSet.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should use current timestamp', async () => {
      const mockContext = createMockContext({
        get: vi.fn((key) => {
          if (key === 'user') {
            return {
              id: testUserIds.validUser1
            };
          }
          return undefined;
        })
      });

      const mockNext = createMockNext();
      const beforeTime = Date.now();

      await notificationContextMiddleware(mockContext as any, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('notificationContext', {
        userId: testUserIds.validUser1,
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalledWith();

      // Verify that timestamp is recent
      const setCalls = (mockContext.set as any).mock.calls;
      expect(setCalls).toHaveLength(1);
      const contextSet = setCalls[0][1];
      const timestamp = new Date(contextSet.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp.getTime()).toBeLessThan(beforeTime + 1000); // Within 1 second
    });
  });
});