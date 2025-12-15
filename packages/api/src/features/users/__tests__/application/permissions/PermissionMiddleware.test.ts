import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireOwnershipOrPermission,
  requireRole
} from '../../../application/permissions/PermissionMiddleware';
import { UserRole, UserRoleAssignment } from '../../../domain/entities';
import { createTestUserRole, createTestUserRoleAssignment } from '../../utils/testFixtures.test';

describe('PermissionMiddleware', () => {
  let testRole: UserRole;
  let testRoleAssignment: UserRoleAssignment;

  beforeEach(() => {
    testRole = createTestUserRole();
    testRoleAssignment = createTestUserRoleAssignment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requirePermission', () => {
    it('should allow access when user has the required permission', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requirePermission(testRole.permissions[0]!);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should deny access when user does not have the required permission', async () => {
      // Create a role without the required permission
      const roleWithoutPermission = UserRole.create({
        name: 'user-role',
        displayName: 'User Role',
        permissions: []
      });

      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(roleWithoutPermission)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requirePermission(testRole.permissions[0]!);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: testRole.permissions[0]
      });
    });

    it('should deny access when user is not authenticated', async () => {
      // Create middleware
      const middleware = requirePermission(testRole.permissions[0]!);

      // Mock the request context without authenticated user
      const mockContext = {
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      });
    });
  });

  describe('requireRole', () => {
    it('should allow access when user has the required role', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireRole(testRole.name);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should deny access when user does not have the required role', async () => {
      // Create a role with a different name
      const differentRole = UserRole.create({
        name: 'different-role',
        displayName: 'Different Role'
      });

      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(differentRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireRole(testRole.name);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_ROLE',
        required: testRole.name
      });
    });
  });

  describe('requireAnyPermission', () => {
    it('should allow access when user has at least one of the required permissions', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireAnyPermission(testRole.permissions);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should deny access when user has none of the required permissions', async () => {
      // Create a role without the required permissions
      const roleWithoutPermissions = UserRole.create({
        name: 'user-role',
        displayName: 'User Role',
        permissions: []
      });

      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(roleWithoutPermissions)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware with permissions that the user doesn't have
      const middleware = requireAnyPermission(['nonexistent-permission' as any]);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: ['nonexistent-permission']
      });
    });
  });

  describe('requireAllPermissions', () => {
    it('should allow access when user has all of the required permissions', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireAllPermissions(testRole.permissions);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should deny access when user does not have all of the required permissions', async () => {
      // Create a role with only some of the required permissions
      const roleWithPartialPermissions = UserRole.create({
        name: 'partial-role',
        displayName: 'Partial Role',
        permissions: testRole.permissions.slice(0, 1) // Only the first permission
      });

      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(roleWithPartialPermissions)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireAllPermissions(testRole.permissions);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn()
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: testRole.permissions
      });
    });
  });

  describe('requireOwnershipOrPermission', () => {
    it('should allow access when user owns the resource', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireOwnershipOrPermission('userId', testRole.permissions[0]!);

      // Mock the request context with authenticated user
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn().mockReturnValue(testRoleAssignment.userId)
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should allow access when user has the required permission for someone else\'s resource', async () => {
      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(testRole)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireOwnershipOrPermission('userId', testRole.permissions[0]!);

      // Mock the request context with authenticated user trying to access someone else's resource
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn().mockReturnValue('different-user-id')
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was called (access granted)
      expect(next).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith('userRoles', [testRole]);
    });

    it('should deny access when user does not own the resource and lacks permission', async () => {
      // Create a role without the required permission
      const roleWithoutPermission = UserRole.create({
        name: 'user-role',
        displayName: 'User Role',
        permissions: []
      });

      // Mock the UsersContainer and user role repository
      const mockUsersContainer = {
        getUserRoleRepository: vi.fn().mockReturnValue({
          findActiveAssignmentsByUserId: vi.fn().mockResolvedValue([testRoleAssignment]),
          findRoleById: vi.fn().mockResolvedValue(roleWithoutPermission)
        })
      };

      // Mock the UsersContainer.getInstance method
      const mockGetInstance = vi.fn().mockReturnValue(mockUsersContainer);
      vi.doMock('../../../infrastructure/container/UsersContainer', () => ({
        UsersContainer: {
          getInstance: mockGetInstance
        }
      }));

      // Create middleware
      const middleware = requireOwnershipOrPermission('userId', testRole.permissions[0]!);

      // Mock the request context with authenticated user trying to access someone else's resource
      const mockContext = {
        get: vi.fn().mockImplementation((key) => {
          if (key === 'userId') return testRoleAssignment.userId;
          return undefined;
        }),
        set: vi.fn(),
        json: vi.fn().mockReturnValue({}),
        req: {
          param: vi.fn().mockReturnValue('different-user-id')
        }
      };

      // Execute the middleware
      const next = vi.fn();
      await middleware(mockContext as any, next);

      // Verify next was not called (access denied)
      expect(next).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
        reason: 'You do not own this resource and lack the required permissions'
      });
    });
  });
});