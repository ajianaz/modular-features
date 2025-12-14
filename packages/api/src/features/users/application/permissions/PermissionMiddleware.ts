import { Context, Next } from 'hono';
import { PermissionUtils, SystemPermission } from './PermissionUtils';
import { IUserRoleRepository } from '../../domain/interfaces';
import { UsersContainer } from '../../infrastructure/container/UsersContainer';
import { UserRole } from '../../domain/entities';

/**
 * Middleware factory for checking user permissions
 */
export const requirePermission = (permission: SystemPermission) => {
  return async (c: Context, next: Next) => {
    try {
      // Get user ID from context (set by auth middleware)
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      // Get user roles from repository
      const usersContainer = UsersContainer.getInstance();
      const userRoleRepository = usersContainer.getUserRoleRepository();
      const userRoles = await userRoleRepository.findActiveAssignmentsByUserId(userId);

      // Extract actual role objects
      const roles = await Promise.all(
        userRoles.map(async (assignment) => {
          const role = await userRoleRepository.findRoleById(assignment.roleId);
          return role || null;
        })
      ).then(roles => roles.filter((role): role is UserRole => role !== null));

      // Check if user has the required permission
      if (!PermissionUtils.hasPermission(roles, permission)) {
        return c.json({
          success: false,
          message: 'Insufficient permissions',
          error: 'INSUFFICIENT_PERMISSIONS',
          required: permission
        }, 403);
      }

      // Store user roles in context for later use
      c.set('userRoles', roles);

      await next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return c.json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      }, 500);
    }
  };
};

/**
 * Middleware factory for checking any of multiple permissions
 */
export const requireAnyPermission = (permissions: SystemPermission[]) => {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const usersContainer = UsersContainer.getInstance();
      const userRoleRepository = usersContainer.getUserRoleRepository();
      const userRoles = await userRoleRepository.findActiveAssignmentsByUserId(userId);

      const roles = await Promise.all(
        userRoles.map(async (assignment) => {
          const role = await userRoleRepository.findRoleById(assignment.roleId);
          return role || null;
        })
      ).then(roles => roles.filter((role): role is UserRole => role !== null));

      // Check if user has any of the required permissions
      if (!PermissionUtils.hasAnyPermission(roles, permissions)) {
        return c.json({
          success: false,
          message: 'Insufficient permissions',
          error: 'INSUFFICIENT_PERMISSIONS',
          required: permissions
        }, 403);
      }

      c.set('userRoles', roles);

      await next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return c.json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      }, 500);
    }
  };
};

/**
 * Middleware factory for checking all of multiple permissions
 */
export const requireAllPermissions = (permissions: SystemPermission[]) => {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const usersContainer = UsersContainer.getInstance();
      const userRoleRepository = usersContainer.getUserRoleRepository();
      const userRoles = await userRoleRepository.findActiveAssignmentsByUserId(userId);

      const roles = await Promise.all(
        userRoles.map(async (assignment) => {
          const role = await userRoleRepository.findRoleById(assignment.roleId);
          return role || null;
        })
      ).then(roles => roles.filter((role): role is UserRole => role !== null));

      // Check if user has all of the required permissions
      if (!PermissionUtils.hasAllPermissions(roles, permissions)) {
        return c.json({
          success: false,
          message: 'Insufficient permissions',
          error: 'INSUFFICIENT_PERMISSIONS',
          required: permissions
        }, 403);
      }

      c.set('userRoles', roles);

      await next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return c.json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      }, 500);
    }
  };
};

/**
 * Middleware factory for checking resource ownership
 */
export const requireOwnershipOrPermission = (
  resourceOwnerIdParam: string,
  permission: SystemPermission
) => {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      // Get resource owner ID from route parameters
      const resourceOwnerId = c.req.param(resourceOwnerIdParam);

      if (!resourceOwnerId) {
        return c.json({
          success: false,
          message: 'Resource owner ID not found',
          error: 'RESOURCE_OWNER_NOT_FOUND'
        }, 400);
      }

      const usersContainer = UsersContainer.getInstance();
      const userRoleRepository = usersContainer.getUserRoleRepository();
      const userRoles = await userRoleRepository.findActiveAssignmentsByUserId(userId);

      const roles = await Promise.all(
        userRoles.map(async (assignment) => {
          const role = await userRoleRepository.findRoleById(assignment.roleId);
          return role || null;
        })
      ).then(roles => roles.filter((role): role is UserRole => role !== null));

      // Check if user owns the resource or has the required permission
      if (!PermissionUtils.canAccessResource(roles, resourceOwnerId, userId, permission)) {
        return c.json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED',
          reason: 'You do not own this resource and lack the required permissions'
        }, 403);
      }

      c.set('userRoles', roles);

      await next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return c.json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      }, 500);
    }
  };
};

/**
 * Middleware for checking role-based access
 */
export const requireRole = (roleName: string) => {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get('userId');

      if (!userId) {
        return c.json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        }, 401);
      }

      const usersContainer = UsersContainer.getInstance();
      const userRoleRepository = usersContainer.getUserRoleRepository();
      const userRoles = await userRoleRepository.findActiveAssignmentsByUserId(userId);

      const roles = await Promise.all(
        userRoles.map(async (assignment) => {
          const role = await userRoleRepository.findRoleById(assignment.roleId);
          return role || null;
        })
      ).then(roles => roles.filter((role): role is UserRole => role !== null));

      // Check if user has the required role
      if (!PermissionUtils.hasRole(roles, roleName)) {
        return c.json({
          success: false,
          message: 'Insufficient permissions',
          error: 'INSUFFICIENT_ROLE',
          required: roleName
        }, 403);
      }

      c.set('userRoles', roles);

      await next();
    } catch (error) {
      console.error('Permission middleware error:', error);

      return c.json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      }, 500);
    }
  };
};
