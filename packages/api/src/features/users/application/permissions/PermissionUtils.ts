import { UserRole } from '../../domain/entities';

/**
 * System permissions available in the application
 */
export enum SystemPermission {
  // User management permissions
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  USER_ADMIN = 'user:admin',

  // Profile management permissions
  PROFILE_READ = 'profile:read',
  PROFILE_WRITE = 'profile:write',
  PROFILE_DELETE = 'profile:delete',

  // Settings management permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',

  // Role management permissions
  ROLE_READ = 'role:read',
  ROLE_WRITE = 'role:write',
  ROLE_DELETE = 'role:delete',
  ROLE_ASSIGN = 'role:assign',

  // Activity tracking permissions
  ACTIVITY_READ = 'activity:read',
  ACTIVITY_WRITE = 'activity:write',
  ACTIVITY_DELETE = 'activity:delete',

  // System administration permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor',

  // Content management permissions
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_MODERATE = 'content:moderate',

  // File management permissions
  FILE_UPLOAD = 'file:upload',
  FILE_READ = 'file:read',
  FILE_DELETE = 'file:delete'
}

/**
 * Permission levels for hierarchical access control
 */
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ADMIN = 3,
  SYSTEM = 4
}

/**
 * Permission utility class for checking user permissions
 */
export class PermissionUtils {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRoles: UserRole[], permission: SystemPermission): boolean {
    return userRoles.some(role =>
      role.isActive && role.permissions.includes(permission)
    );
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRoles: UserRole[], permissions: SystemPermission[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(userRoles, permission)
    );
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRoles: UserRole[], permissions: SystemPermission[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(userRoles, permission)
    );
  }

  /**
   * Check if a user has a specific role
   */
  static hasRole(userRoles: UserRole[], roleName: string): boolean {
    return userRoles.some(role =>
      role.isActive && role.name === roleName
    );
  }

  /**
   * Get the highest permission level for a user
   */
  static getHighestPermissionLevel(userRoles: UserRole[]): PermissionLevel {
    if (userRoles.length === 0) {
      return PermissionLevel.NONE;
    }

    const activeRoles = userRoles.filter(role => role.isActive);
    if (activeRoles.length === 0) {
      return PermissionLevel.NONE;
    }

    const highestLevel = Math.max(...activeRoles.map(role => role.level));

    // Map role levels to permission levels
    if (highestLevel >= 100) {
      return PermissionLevel.SYSTEM;
    } else if (highestLevel >= 80) {
      return PermissionLevel.ADMIN;
    } else if (highestLevel >= 40) {
      return PermissionLevel.WRITE;
    } else if (highestLevel >= 20) {
      return PermissionLevel.READ;
    } else {
      return PermissionLevel.NONE;
    }
  }

  /**
   * Check if a user can access a resource based on ownership and permissions
   */
  static canAccessResource(
    userRoles: UserRole[],
    resourceOwnerId: string,
    currentUserId: string,
    requiredPermission: SystemPermission
  ): boolean {
    // User can always access their own resources
    if (resourceOwnerId === currentUserId) {
      return true;
    }

    // Otherwise, check if they have the required permission
    return this.hasPermission(userRoles, requiredPermission);
  }

  /**
   * Get all permissions for a user (including inherited from roles)
   */
  static getAllPermissions(userRoles: UserRole[]): Set<SystemPermission> {
    const permissions = new Set<SystemPermission>();

    userRoles
      .filter(role => role.isActive)
      .forEach(role => {
        role.permissions.forEach((permission: SystemPermission) => {
          permissions.add(permission);
        });
      });

    return permissions;
  }

  /**
   * Check if a user can perform an action on a specific resource type
   */
  static canPerformAction(
    userRoles: UserRole[],
    action: 'create' | 'read' | 'update' | 'delete',
    resourceType: 'user' | 'profile' | 'settings' | 'role' | 'activity' | 'content' | 'file'
  ): boolean {
    const permissionMap = {
      user: {
        create: SystemPermission.USER_WRITE,
        read: SystemPermission.USER_READ,
        update: SystemPermission.USER_WRITE,
        delete: SystemPermission.USER_DELETE
      },
      profile: {
        create: SystemPermission.PROFILE_WRITE,
        read: SystemPermission.PROFILE_READ,
        update: SystemPermission.PROFILE_WRITE,
        delete: SystemPermission.PROFILE_DELETE
      },
      settings: {
        create: SystemPermission.SETTINGS_WRITE,
        read: SystemPermission.SETTINGS_READ,
        update: SystemPermission.SETTINGS_WRITE,
        delete: SystemPermission.SETTINGS_WRITE
      },
      role: {
        create: SystemPermission.ROLE_WRITE,
        read: SystemPermission.ROLE_READ,
        update: SystemPermission.ROLE_WRITE,
        delete: SystemPermission.ROLE_DELETE
      },
      activity: {
        create: SystemPermission.ACTIVITY_WRITE,
        read: SystemPermission.ACTIVITY_READ,
        update: SystemPermission.ACTIVITY_WRITE,
        delete: SystemPermission.ACTIVITY_DELETE
      },
      content: {
        create: SystemPermission.CONTENT_CREATE,
        read: SystemPermission.CONTENT_READ,
        update: SystemPermission.CONTENT_UPDATE,
        delete: SystemPermission.CONTENT_DELETE
      },
      file: {
        create: SystemPermission.FILE_UPLOAD,
        read: SystemPermission.FILE_READ,
        update: SystemPermission.FILE_UPLOAD, // Reuse upload for update
        delete: SystemPermission.FILE_DELETE
      }
    };

    const requiredPermission = permissionMap[resourceType]?.[action];
    if (!requiredPermission) {
      return false;
    }

    return this.hasPermission(userRoles, requiredPermission);
  }
}