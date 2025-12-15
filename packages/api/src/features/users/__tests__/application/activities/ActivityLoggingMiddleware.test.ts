import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logActivity,
  logProfileActivity,
  logSettingsActivity,
  logRoleActivity,
  logAuthActivity,
  logFileActivity,
  logActivityIf,
  createEndpointActivityLogger
} from '../../../application/activities/ActivityLoggingMiddleware';
import { UserActivity } from '../../../domain/entities';
import { createTestUserActivity } from '../../utils/testFixtures.test';

describe('ActivityLoggingMiddleware', () => {
  let testActivity: UserActivity;

  beforeEach(() => {
    testActivity = createTestUserActivity();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logActivity', () => {
    it('should log activity successfully', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testActivity.userId,
          type: testActivity.type,
          description: testActivity.description,
          metadata: expect.objectContaining({
            url: '/api/test',
            method: 'GET'
          })
        })
      );
    });

    it('should log activity with additional metadata', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware with additional metadata
      const additionalMetadata = { resourceId: 'test-resource-id', action: 'test-action' };
      const middleware = logActivity(
        testActivity.type,
        testActivity.description,
        undefined,
        undefined,
        additionalMetadata
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testActivity.userId,
          type: testActivity.type,
          description: testActivity.description,
          metadata: expect.objectContaining({
            url: '/api/test',
            method: 'GET',
            resourceId: 'test-resource-id',
            action: 'test-action'
          })
        })
      );
    });

    it('should not log activity when user is not authenticated', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context without authenticated user
      const mockContext = {
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called but no activity was logged
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Mock the user activity repository to throw an error
      const mockUserActivityRepository = {
        create: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called despite the error
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalled();
    });
  });

  describe('logActivityAfter', () => {
    it('should log activity after the next function is called', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testActivity.userId,
          type: testActivity.type,
          description: testActivity.description,
          metadata: expect.objectContaining({
            url: '/api/test',
            method: 'GET'
          })
        })
      );
    });

    it('should not log activity when user is not authenticated', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context without authenticated user
      const mockContext = {
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called but no activity was logged
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Mock the user activity repository to throw an error
      const mockUserActivityRepository = {
        create: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = logActivity(
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called despite the error
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalled();
    });
  });

  describe('logActivityIf', () => {
    it('should log activity when condition is true', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware with condition that returns true
      const middleware = ActivityLoggingMiddleware.logActivityIf(
        () => true,
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called and activity was logged
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testActivity.userId,
          type: testActivity.type,
          description: testActivity.description
        })
      );
    });

    it('should not log activity when condition is false', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware with condition that returns false
      const middleware = logActivityIf(
        () => false,
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called but no activity was logged
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).not.toHaveBeenCalled();
    });

    it('should pass context to condition function', async () => {
      // Mock the user activity repository
      const mockUserActivityRepository = {
        create: vi.fn().mockResolvedValue(testActivity)
      };

      // Mock the UsersContainer and user activity repository
      const mockUsersContainer = {
        getUserActivityRepository: vi.fn().mockReturnValue(mockUserActivityRepository)
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware with condition that checks context
      const condition = vi.fn().mockReturnValue(true);
      const middleware = logActivityIf(
        condition,
        testActivity.type,
        testActivity.description
      );

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testActivity.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn(),
          url: vi.fn().mockReturnValue('/api/test'),
          method: vi.fn().mockReturnValue('GET'),
          header: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify condition was called with context
      expect(condition).toHaveBeenCalledWith(mockContext);
      expect(next).toHaveBeenCalled();
      expect(mockUserActivityRepository.create).toHaveBeenCalled();
    });
  });

  describe('logProfileActivity', () => {
    it('should create a profile activity logger', () => {
      const middleware = logProfileActivity('update', 'Updated profile information');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('logSettingsActivity', () => {
    it('should create a settings activity logger', () => {
      const middleware = logSettingsActivity('update', 'Updated user settings');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('logRoleActivity', () => {
    it('should create a role activity logger', () => {
      const middleware = logRoleActivity('assign', 'Assigned new role to user');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('logAuthActivity', () => {
    it('should create an auth activity logger', () => {
      const middleware = logAuthActivity('login', 'User logged in');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('logFileActivity', () => {
    it('should create a file activity logger', () => {
      const middleware = logFileActivity('upload', 'User uploaded a file');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('createEndpointActivityLogger', () => {
    it('should create an endpoint activity logger with default method', () => {
      const middleware = createEndpointActivityLogger('/users/profile');
      expect(typeof middleware).toBe('function');
    });

    it('should create an endpoint activity logger with custom method', () => {
      const middleware = createEndpointActivityLogger('/users/profile', 'POST');
      expect(typeof middleware).toBe('function');
    });
  });
});