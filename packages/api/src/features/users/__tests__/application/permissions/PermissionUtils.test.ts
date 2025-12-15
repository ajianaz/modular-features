import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PermissionUtils, SystemPermission, PermissionLevel } from '../../../application/permissions/PermissionUtils';
import { UserRole } from '../../../domain/entities';
import { createTestUserRole } from '../../utils/testFixtures.test';

describe('PermissionUtils', () => {
  let testRole: UserRole;

  beforeEach(() => {
    testRole = createTestUserRole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      const permission = testRole.permissions[0];
      if (permission) {
        const result = PermissionUtils.hasPermission([testRole], permission);

        expect(result).toBe(true);
      }
    });

    it('should return false when user does not have the permission', () => {
      const permission = SystemPermission.USER_READ; // Use a valid permission for testing negative case
      const result = PermissionUtils.hasPermission([testRole], permission);

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const permission = testRole.permissions[0];
      if (permission) {
        const result = PermissionUtils.hasPermission([], permission);

        expect(result).toBe(false);
      }
    });

    it('should return false when role has no permissions', () => {
      const roleWithoutPermissions = UserRole.create({
        name: 'empty-role',
        displayName: 'Empty Role',
        permissions: []
      });

      const permission = SystemPermission.USER_READ; // Use a valid permission for testing negative case
      const result = PermissionUtils.hasPermission([roleWithoutPermissions], permission);

      expect(result).toBe(false);
    });

    it('should handle inactive roles', () => {
      const inactiveRole = UserRole.create({
        name: 'inactive-role',
        displayName: 'Inactive Role',
        permissions: testRole.permissions,
        isActive: false
      });

      const permission = SystemPermission.USER_READ; // Use a valid permission
      const result = PermissionUtils.hasPermission([inactiveRole], permission);

      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one of the permissions', () => {
      const permissions = [testRole.permissions[0], testRole.permissions[1], SystemPermission.USER_READ].filter(Boolean) as SystemPermission[];
      if (permissions.length > 0) {
        const result = PermissionUtils.hasAnyPermission([testRole], permissions);

        expect(result).toBe(true);
      }
    });

    it('should return false when user has none of the permissions', () => {
      const permissions = ['nonexistent-permission-1' as SystemPermission, 'nonexistent-permission-2' as SystemPermission];
      const result = PermissionUtils.hasAnyPermission([testRole], permissions);

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all of the permissions', () => {
      const permissions = [testRole.permissions[0], testRole.permissions[1]].filter(Boolean) as SystemPermission[];
      if (permissions.length === 2) {
        const result = PermissionUtils.hasAllPermissions([testRole], permissions);

        expect(result).toBe(true);
      }
    });

    it('should return false when user does not have all of the permissions', () => {
      // Create a role with limited permissions for testing
      const limitedRole = UserRole.create({
        name: 'limited-role',
        displayName: 'Limited Role',
        permissions: [SystemPermission.USER_READ] // Only has USER_READ, not USER_WRITE or USER_DELETE
      });

      const permissions = [SystemPermission.USER_READ, SystemPermission.USER_WRITE, SystemPermission.USER_DELETE].filter(Boolean) as SystemPermission[];
      if (permissions.length > 0) {
        const result = PermissionUtils.hasAllPermissions([limitedRole], permissions);

        expect(result).toBe(false);
      }
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const result = PermissionUtils.hasRole([testRole], testRole.name);

      expect(result).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const result = PermissionUtils.hasRole([testRole], 'nonexistent-role');

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const result = PermissionUtils.hasRole([], 'any-role');

      expect(result).toBe(false);
    });

    it('should handle inactive roles', () => {
      const inactiveRole = UserRole.create({
        name: 'inactive-role',
        displayName: 'Inactive Role',
        isActive: false
      });

      const result = PermissionUtils.hasRole([inactiveRole], 'inactive-role');

      expect(result).toBe(false);
    });
  });

  describe('getHighestPermissionLevel', () => {
    it('should return the highest role level from roles', () => {
      const lowLevelRole = UserRole.create({
        name: 'low-level-role',
        displayName: 'Low Level Role',
        level: 1
      });

      const highLevelRole = UserRole.create({
        name: 'high-level-role',
        displayName: 'High Level Role',
        level: 10
      });

      const result = PermissionUtils.getHighestPermissionLevel([lowLevelRole, highLevelRole]);

      expect(result).toBe(PermissionLevel.READ);
    });

    it('should return NONE when user has no roles', () => {
      const result = PermissionUtils.getHighestPermissionLevel([]);

      expect(result).toBe(PermissionLevel.NONE);
    });

    it('should filter out inactive roles', () => {
      const activeRole = UserRole.create({
        name: 'active-role',
        displayName: 'Active Role',
        level: 20 // Use level 20 to map to PermissionLevel.READ
      });

      const inactiveRole = UserRole.create({
        name: 'inactive-role',
        displayName: 'Inactive Role',
        level: 40, // Use level 40 to map to PermissionLevel.WRITE
        isActive: false
      });

      const result = PermissionUtils.getHighestPermissionLevel([activeRole, inactiveRole]);

      expect(result).toBe(PermissionLevel.READ);
    });

    it('should map role levels to permission levels correctly', () => {
      const readRole = UserRole.create({
        name: 'read-role',
        displayName: 'Read Role',
        level: 20
      });

      const writeRole = UserRole.create({
        name: 'write-role',
        displayName: 'Write Role',
        level: 40
      });

      const adminRole = UserRole.create({
        name: 'admin-role',
        displayName: 'Admin Role',
        level: 80
      });

      const systemRole = UserRole.create({
        name: 'system-role',
        displayName: 'System Role',
        level: 100
      });

      expect(PermissionUtils.getHighestPermissionLevel([readRole])).toBe(PermissionLevel.READ);
      expect(PermissionUtils.getHighestPermissionLevel([writeRole])).toBe(PermissionLevel.WRITE);
      expect(PermissionUtils.getHighestPermissionLevel([adminRole])).toBe(PermissionLevel.ADMIN);
      expect(PermissionUtils.getHighestPermissionLevel([systemRole])).toBe(PermissionLevel.SYSTEM);
    });
  });

  describe('canAccessResource', () => {
    it('should return true when user can access their own resource', () => {
      const result = PermissionUtils.canAccessResource([testRole], testRole.id, testRole.id, SystemPermission.USER_READ);

      expect(result).toBe(true);
    });

    it('should return true when user has the required permission', () => {
      const roleWithPermission = UserRole.create({
        name: 'admin-role',
        displayName: 'Admin Role',
        permissions: [SystemPermission.USER_READ]
      });

      const result = PermissionUtils.canAccessResource([roleWithPermission], roleWithPermission.id, 'different-user-id', SystemPermission.USER_READ);

      expect(result).toBe(true);
    });

    it('should return false when user does not have the required permission', () => {
      const roleWithoutPermission = UserRole.create({
        name: 'user-role',
        displayName: 'User Role',
        permissions: [SystemPermission.PROFILE_READ]
      });

      const result = PermissionUtils.canAccessResource([roleWithoutPermission], roleWithoutPermission.id, 'different-user-id', SystemPermission.USER_READ);

      expect(result).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions from active roles', () => {
      const role1 = UserRole.create({
        name: 'role1',
        displayName: 'Role 1',
        permissions: [SystemPermission.USER_READ, SystemPermission.PROFILE_READ]
      });

      const role2 = UserRole.create({
        name: 'role2',
        displayName: 'Role 2',
        permissions: [SystemPermission.USER_WRITE, SystemPermission.PROFILE_WRITE]
      });

      const permissions = PermissionUtils.getAllPermissions([role1, role2]);

      expect(permissions.size).toBe(4);
      expect(permissions.has(SystemPermission.USER_READ)).toBe(true);
      expect(permissions.has(SystemPermission.PROFILE_READ)).toBe(true);
      expect(permissions.has(SystemPermission.USER_WRITE)).toBe(true);
      expect(permissions.has(SystemPermission.PROFILE_WRITE)).toBe(true);
    });

    it('should filter out permissions from inactive roles', () => {
      const activeRole = UserRole.create({
        name: 'active-role',
        displayName: 'Active Role',
        permissions: [SystemPermission.USER_READ]
      });

      const inactiveRole = UserRole.create({
        name: 'inactive-role',
        displayName: 'Inactive Role',
        permissions: [SystemPermission.USER_WRITE],
        isActive: false
      });

      const permissions = PermissionUtils.getAllPermissions([activeRole, inactiveRole]);

      expect(permissions.size).toBe(1);
      expect(permissions.has(SystemPermission.USER_READ)).toBe(true);
      expect(permissions.has(SystemPermission.USER_WRITE)).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should return true when user has the required permission for the action', () => {
      const roleWithPermission = UserRole.create({
        name: 'admin-role',
        displayName: 'Admin Role',
        permissions: [SystemPermission.USER_WRITE]
      });

      const result = PermissionUtils.canPerformAction([roleWithPermission], 'update', 'user');

      expect(result).toBe(true);
    });

    it('should return false when user does not have the required permission', () => {
      const roleWithoutPermission = UserRole.create({
        name: 'user-role',
        displayName: 'User Role',
        permissions: [SystemPermission.PROFILE_READ]
      });

      const result = PermissionUtils.canPerformAction([roleWithoutPermission], 'delete', 'user');

      expect(result).toBe(false);
    });

    it('should return false for unsupported resource type', () => {
      const roleWithPermission = UserRole.create({
        name: 'admin-role',
        displayName: 'Admin Role',
        permissions: [SystemPermission.USER_WRITE]
      });

      const result = PermissionUtils.canPerformAction([roleWithPermission], 'create', 'unsupported-resource' as any);

      expect(result).toBe(false);
    });

    it('should map actions to permissions correctly for all resource types', () => {
      const adminRole = UserRole.create({
        name: 'admin-role',
        displayName: 'Admin Role',
        permissions: [
          SystemPermission.USER_READ,
          SystemPermission.USER_WRITE,
          SystemPermission.USER_DELETE,
          SystemPermission.PROFILE_READ,
          SystemPermission.PROFILE_WRITE,
          SystemPermission.PROFILE_DELETE,
          SystemPermission.SETTINGS_READ,
          SystemPermission.SETTINGS_WRITE,
          SystemPermission.ROLE_READ,
          SystemPermission.ROLE_WRITE,
          SystemPermission.ROLE_DELETE,
          SystemPermission.ACTIVITY_READ,
          SystemPermission.ACTIVITY_WRITE,
          SystemPermission.ACTIVITY_DELETE,
          SystemPermission.CONTENT_CREATE,
          SystemPermission.CONTENT_READ,
          SystemPermission.CONTENT_UPDATE,
          SystemPermission.CONTENT_DELETE,
          SystemPermission.FILE_UPLOAD,
          SystemPermission.FILE_READ,
          SystemPermission.FILE_DELETE
        ]
      });

      // Test all resource types and actions
      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'user')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'user')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'user')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'user')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'profile')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'profile')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'profile')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'profile')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'settings')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'settings')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'settings')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'settings')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'role')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'role')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'role')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'role')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'activity')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'activity')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'activity')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'activity')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'content')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'content')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'content')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'content')).toBe(true);

      expect(PermissionUtils.canPerformAction([adminRole], 'read', 'file')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'update', 'file')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'delete', 'file')).toBe(true);
      expect(PermissionUtils.canPerformAction([adminRole], 'create', 'file')).toBe(true);
    });
  });
});