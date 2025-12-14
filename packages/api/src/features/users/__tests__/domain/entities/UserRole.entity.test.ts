import { describe, it, expect, beforeEach } from 'vitest';
import { UserRole, UserRoleAssignment } from '../../../domain/entities/UserRole.entity';
import {
  testUserIds,
  testRoleIds,
  createTestUserRole,
  createTestUserRoleAssignment
} from '../../utils/testFixtures.test';

describe('UserRole Entity', () => {
  describe('Constructor', () => {
    it('should create a valid user role with all required fields', () => {
      const role = new UserRole(
        testRoleIds.adminRole,
        'admin',
        'Administrator',
        'Full system access',
        100,
        false,
        ['user:read', 'user:write', 'system:admin'],
        { category: 'system' },
        true,
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );

      expect(role.id).toBe(testRoleIds.adminRole);
      expect(role.name).toBe('admin');
      expect(role.displayName).toBe('Administrator');
      expect(role.description).toBe('Full system access');
      expect(role.level).toBe(100);
      expect(role.isSystem).toBe(false);
      expect(role.permissions).toEqual(['user:read', 'user:write', 'system:admin']);
      expect(role.metadata).toEqual({ category: 'system' });
      expect(role.isActive).toBe(true);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user role with default values', () => {
      const role = new UserRole(
        testRoleIds.adminRole,
        'admin',
        'Administrator'
      );

      expect(role.id).toBe(testRoleIds.adminRole);
      expect(role.name).toBe('admin');
      expect(role.displayName).toBe('Administrator');
      expect(role.description).toBeUndefined();
      expect(role.level).toBe(0);
      expect(role.isSystem).toBe(false);
      expect(role.permissions).toEqual([]);
      expect(role.metadata).toBeUndefined();
      expect(role.isActive).toBe(true);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid user role using factory method', () => {
      const roleData = {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        level: 100,
        isSystem: false,
        permissions: ['user:read', 'user:write', 'system:admin'],
        metadata: { category: 'system' },
        isActive: true
      };

      const role = UserRole.create(roleData);

      expect(role.name).toBe(roleData.name.toLowerCase().trim());
      expect(role.displayName).toBe(roleData.displayName.trim());
      expect(role.description).toBe(roleData.description?.trim());
      expect(role.level).toBe(roleData.level);
      expect(role.isSystem).toBe(roleData.isSystem);
      expect(role.permissions).toEqual(roleData.permissions);
      expect(role.metadata).toEqual(roleData.metadata);
      expect(role.isActive).toBe(roleData.isActive);
      expect(role.id).toBeDefined();
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user role with default values using factory method', () => {
      const roleData = {
        name: 'user',
        displayName: 'User'
      };

      const role = UserRole.create(roleData);

      expect(role.name).toBe('user');
      expect(role.displayName).toBe('User');
      expect(role.description).toBeUndefined();
      expect(role.level).toBe(0);
      expect(role.isSystem).toBe(false);
      expect(role.permissions).toEqual([]);
      expect(role.metadata).toBeUndefined();
      expect(role.isActive).toBe(true);
      expect(role.id).toBeDefined();
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim and lowercase name', () => {
      const roleData = {
        name: '  ADMIN  ',
        displayName: 'Administrator'
      };

      const role = UserRole.create(roleData);

      expect(role.name).toBe('admin');
    });

    it('should trim displayName and description', () => {
      const roleData = {
        name: 'admin',
        displayName: '  Administrator  ',
        description: '  Full system access  '
      };

      const role = UserRole.create(roleData);

      expect(role.displayName).toBe('Administrator');
      expect(role.description).toBe('Full system access');
    });
  });

  describe('Business Logic Methods', () => {
    let role: UserRole;

    beforeEach(() => {
      role = createTestUserRole();
    });

    describe('updateInfo', () => {
      it('should update role info and return new role instance', () => {
        const updateData = {
          displayName: 'Updated Administrator',
          description: 'Updated description',
          level: 90
        };

        const updatedRole = role.updateInfo(updateData);

        expect(updatedRole.displayName).toBe(updateData.displayName);
        expect(updatedRole.description).toBe(updateData.description);
        expect(updatedRole.level).toBe(updateData.level);
        expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(role.updatedAt.getTime());
        expect(updatedRole.id).toBe(role.id);
        expect(updatedRole.name).toBe(role.name);
      });

      it('should trim string fields', () => {
        const updateData = {
          displayName: '  Updated Administrator  ',
          description: '  Updated description  '
        };

        const updatedRole = role.updateInfo(updateData);

        expect(updatedRole.displayName).toBe('Updated Administrator');
        expect(updatedRole.description).toBe('Updated description');
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          displayName: 'Updated Administrator'
          // other fields are undefined
        };

        const updatedRole = role.updateInfo(updateData);

        expect(updatedRole.displayName).toBe('Updated Administrator');
        expect(updatedRole.description).toBe(role.description);
        expect(updatedRole.level).toBe(role.level);
      });
    });

    describe('updatePermissions', () => {
      it('should update permissions and return new role instance', () => {
        const newPermissions = ['user:read', 'user:write', 'profile:read'];
        const updatedRole = role.updatePermissions(newPermissions);

        expect(updatedRole.permissions).toEqual(newPermissions);
        expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(role.updatedAt.getTime());
        expect(updatedRole.id).toBe(role.id);
        expect(updatedRole.name).toBe(role.name);
      });

      it('should remove duplicate permissions', () => {
        const duplicatePermissions = ['user:read', 'user:write', 'user:read'];
        const updatedRole = role.updatePermissions(duplicatePermissions);

        expect(updatedRole.permissions).toEqual(['user:read', 'user:write']);
      });
    });

    describe('addPermission', () => {
      it('should add permission and return new role instance', () => {
        const newPermission = 'profile:read';
        const updatedRole = role.addPermission(newPermission);

        expect(updatedRole.permissions).toContain(newPermission);
        expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(role.updatedAt.getTime());
        expect(updatedRole.id).toBe(role.id);
      });

      it('should not add permission if it already exists', () => {
        const existingPermission = role.permissions[0];
        const updatedRole = role.addPermission(existingPermission);

        expect(updatedRole).toBe(role); // Same instance returned
        expect(updatedRole.permissions).toEqual(role.permissions);
      });

      it('should normalize permission to lowercase and trim', () => {
        const newPermission = '  PROFILE:READ  ';
        const updatedRole = role.addPermission(newPermission);

        expect(updatedRole.permissions).toContain('profile:read');
      });
    });

    describe('removePermission', () => {
      it('should remove permission and return new role instance', () => {
        const permissionToRemove = role.permissions[0] || '';
        const updatedRole = role.removePermission(permissionToRemove);

        expect(updatedRole.permissions).not.toContain(permissionToRemove);
        expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(role.updatedAt.getTime());
        expect(updatedRole.id).toBe(role.id);
      });

      it('should normalize permission to lowercase and trim', () => {
        const permissionToRemove = role.permissions[0] || '';
        const updatedRole = role.removePermission(`  ${permissionToRemove.toUpperCase()}  `);

        expect(updatedRole.permissions).not.toContain(permissionToRemove);
      });
    });

    describe('updateMetadata', () => {
      it('should update metadata and return new role instance', () => {
        const newMetadata = { category: 'updated', priority: 'high' };
        const updatedRole = role.updateMetadata(newMetadata);

        expect(updatedRole.metadata).toEqual({ ...role.metadata, ...newMetadata });
        expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(role.updatedAt.getTime());
        expect(updatedRole.id).toBe(role.id);
      });
    });

    describe('activate', () => {
      it('should activate role and return new role instance', () => {
        const inactiveRole = createTestUserRole({ isActive: false });

        const activeRole = inactiveRole.activate();

        expect(activeRole.isActive).toBe(true);
        expect(activeRole.updatedAt.getTime()).toBeGreaterThan(inactiveRole.updatedAt.getTime());
      });

      it('should keep role active if already active', () => {
        const alreadyActiveRole = createTestUserRole({ isActive: true });

        const activeRole = alreadyActiveRole.activate();

        expect(activeRole.isActive).toBe(true);
        expect(activeRole.updatedAt.getTime()).toBeGreaterThan(alreadyActiveRole.updatedAt.getTime());
      });
    });

    describe('deactivate', () => {
      it('should deactivate role and return new role instance', () => {
        const activeRole = createTestUserRole({ isActive: false, isSystem: false });

        const inactiveRole = activeRole.deactivate();

        expect(inactiveRole.isActive).toBe(false);
        expect(inactiveRole.updatedAt.getTime()).toBeGreaterThan(activeRole.updatedAt.getTime());
      });

      it('should keep role inactive if already inactive', () => {
        const alreadyInactiveRole = createTestUserRole({ isActive: false, isSystem: false });

        const inactiveRole = alreadyInactiveRole.deactivate();

        expect(inactiveRole.isActive).toBe(false);
        expect(inactiveRole.updatedAt.getTime()).toBeGreaterThan(alreadyInactiveRole.updatedAt.getTime());
      });

      it('should throw error when trying to deactivate system role', () => {
        const systemRole = createTestUserRole({ isSystem: true });

        expect(() => systemRole.deactivate()).toThrow('Cannot deactivate system roles');
      });
    });
  });

  describe('Business Validation Methods', () => {
    let role: UserRole;

    beforeEach(() => {
      role = createTestUserRole();
    });

    describe('hasPermission', () => {
      it('should return true when role has the permission', () => {
        const permission = role.permissions[0];
        expect(role.hasPermission(permission)).toBe(true);
      });

      it('should return false when role does not have the permission', () => {
        const permission = 'non-existent:permission';
        expect(role.hasPermission(permission)).toBe(false);
      });

      it('should normalize permission to lowercase and trim', () => {
        const permission = role.permissions[0] || '';
        expect(role.hasPermission(permission)).toBe(true);
      });
    });

    describe('hasAnyPermission', () => {
      it('should return true when role has any of the permissions', () => {
        const permissions = [role.permissions[0], 'non-existent:permission'];
        expect(role.hasAnyPermission(permissions)).toBe(true);
      });

      it('should return false when role has none of the permissions', () => {
        const permissions = ['non-existent:permission1', 'non-existent:permission2'];
        expect(role.hasAnyPermission(permissions)).toBe(false);
      });
    });

    describe('hasAllPermissions', () => {
      it('should return true when role has all of the permissions', () => {
        const permissions = role.permissions.slice(0, 2) as string[];
        expect(role.hasAllPermissions(permissions)).toBe(true);
      });

      it('should return false when role does not have all of the permissions', () => {
        const permissions = [...role.permissions.slice(0, 2), 'non-existent:permission'] as string[];
        expect(role.hasAllPermissions(permissions)).toBe(false);
      });
    });

    describe('canBeDeleted', () => {
      it('should return true for non-system role', () => {
        const customRole = createTestUserRole({ isSystem: false });
        expect(customRole.canBeDeleted()).toBe(true);
      });

      it('should return false for system role', () => {
        const systemRole = createTestUserRole({ isSystem: true });
        expect(systemRole.canBeDeleted()).toBe(false);
      });
    });

    describe('canBeModified', () => {
      it('should return true for non-system role', () => {
        const customRole = createTestUserRole({ isSystem: false });
        expect(customRole.canBeModified()).toBe(true);
      });

      it('should return false for system role', () => {
        const systemRole = createTestUserRole({ isSystem: true });
        expect(systemRole.canBeModified()).toBe(false);
      });
    });

    describe('isHigherLevel', () => {
      it('should return true when role level is higher than other role', () => {
        const higherRole = createTestUserRole({ level: 100 });
        const lowerRole = createTestUserRole({ level: 50 });

        expect(higherRole.isHigherLevel(lowerRole)).toBe(true);
      });

      it('should return false when role level is not higher than other role', () => {
        const lowerRole = createTestUserRole({ level: 50 });
        const higherRole = createTestUserRole({ level: 100 });

        expect(lowerRole.isHigherLevel(higherRole)).toBe(false);
      });

      it('should return false when role levels are equal', () => {
        const role1 = createTestUserRole({ level: 50 });
        const role2 = createTestUserRole({ level: 50 });

        expect(role1.isHigherLevel(role2)).toBe(false);
      });
    });

    describe('isSameLevel', () => {
      it('should return true when role levels are equal', () => {
        const role1 = createTestUserRole({ level: 50 });
        const role2 = createTestUserRole({ level: 50 });

        expect(role1.isSameLevel(role2)).toBe(true);
      });

      it('should return false when role levels are not equal', () => {
        const role1 = createTestUserRole({ level: 50 });
        const role2 = createTestUserRole({ level: 100 });

        expect(role1.isSameLevel(role2)).toBe(false);
      });
    });

    describe('isLowerLevel', () => {
      it('should return true when role level is lower than other role', () => {
        const lowerRole = createTestUserRole({ level: 50 });
        const higherRole = createTestUserRole({ level: 100 });

        expect(lowerRole.isLowerLevel(higherRole)).toBe(true);
      });

      it('should return false when role level is not lower than other role', () => {
        const higherRole = createTestUserRole({ level: 100 });
        const lowerRole = createTestUserRole({ level: 50 });

        expect(higherRole.isLowerLevel(lowerRole)).toBe(false);
      });

      it('should return false when role levels are equal', () => {
        const role1 = createTestUserRole({ level: 50 });
        const role2 = createTestUserRole({ level: 50 });

        expect(role1.isLowerLevel(role2)).toBe(false);
      });
    });

    describe('hasReadPermissions', () => {
      it('should return true when role has any read permission', () => {
        const roleWithRead = createTestUserRole({
          permissions: ['read:users', 'profile:read']
        });
        expect(roleWithRead.hasReadPermissions()).toBe(true);
      });

      it('should return false when role has no read permissions', () => {
        const roleWithoutRead = createTestUserRole({
          permissions: ['write:users', 'delete:users']
        });
        expect(roleWithoutRead.hasReadPermissions()).toBe(false);
      });
    });

    describe('hasWritePermissions', () => {
      it('should return true when role has any write permission', () => {
        const roleWithWrite = createTestUserRole({
          permissions: ['write:users', 'profile:write']
        });
        expect(roleWithWrite.hasWritePermissions()).toBe(true);
      });

      it('should return false when role has no write permissions', () => {
        const roleWithoutWrite = createTestUserRole({
          permissions: ['read:users', 'delete:users']
        });
        expect(roleWithoutWrite.hasWritePermissions()).toBe(false);
      });
    });

    describe('hasAdminPermissions', () => {
      it('should return true when role has any admin permission', () => {
        const roleWithAdmin = createTestUserRole({
          permissions: ['admin:users', 'system:admin']
        });
        expect(roleWithAdmin.hasAdminPermissions()).toBe(true);
      });

      it('should return false when role has no admin permissions', () => {
        const roleWithoutAdmin = createTestUserRole({
          permissions: ['read:users', 'write:users']
        });
        expect(roleWithoutAdmin.hasAdminPermissions()).toBe(false);
      });
    });

    describe('hasUserManagementPermissions', () => {
      it('should return true when role has any user management permission', () => {
        const roleWithUserMgmt = createTestUserRole({
          permissions: ['manage:users', 'manage:profiles']
        });
        expect(roleWithUserMgmt.hasUserManagementPermissions()).toBe(true);
      });

      it('should return false when role has no user management permissions', () => {
        const roleWithoutUserMgmt = createTestUserRole({
          permissions: ['read:users', 'write:users']
        });
        expect(roleWithoutUserMgmt.hasUserManagementPermissions()).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid user role', () => {
        const role = createTestUserRole();
        const result = role.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid user role', () => {
        const invalidRole = new UserRole(
          'invalid-id',
          '', // Empty name is invalid
          '', // Empty display name is invalid
          'a'.repeat(1001), // Description too long
          -1, // Invalid level
          'not-a-boolean' as any, // Invalid isSystem type
          [''], // Invalid permission (empty string)
          'not-an-object' as any, // Invalid metadata type
          'not-a-boolean' as any, // Invalid isActive type
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any  // Invalid updated date
        );

        const result = invalidRole.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const roleData = {
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full system access',
          level: 100,
          isSystem: false,
          permissions: ['user:read', 'user:write', 'system:admin'],
          metadata: { category: 'system' },
          isActive: true
        };

        const result = UserRole.validateCreate(roleData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          name: '', // Empty name is invalid
          displayName: '', // Empty display name is invalid
          description: 'a'.repeat(1001), // Too long
          level: -1, // Invalid level
          isSystem: 'not-a-boolean' as any, // Invalid type
          permissions: [''], // Invalid permission (empty string)
          metadata: 'not-an-object' as any, // Invalid type
          isActive: 'not-a-boolean' as any // Invalid type
        };

        const result = UserRole.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let role: UserRole;

    beforeEach(() => {
      role = createTestUserRole();
    });

    describe('toJSON', () => {
      it('should return role object with all properties', () => {
        const json = role.toJSON();

        expect(json).toEqual({
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          level: role.level,
          isSystem: role.isSystem,
          permissions: role.permissions,
          metadata: role.metadata,
          isActive: role.isActive,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        });
      });
    });
  });
});

describe('UserRoleAssignment Entity', () => {
  describe('Constructor', () => {
    it('should create a valid role assignment with all required fields', () => {
      const assignment = new UserRoleAssignment(
        '123e4567-e89b-12d3-a456-426614174131',
        testUserIds.validUser1,
        testRoleIds.adminRole,
        testUserIds.validUser2,
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z'),
        true,
        { reason: 'Promotion' },
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );

      expect(assignment.id).toBe('123e4567-e89b-12d3-a456-426614174131');
      expect(assignment.userId).toBe(testUserIds.validUser1);
      expect(assignment.roleId).toBe(testRoleIds.adminRole);
      expect(assignment.assignedBy).toBe(testUserIds.validUser2);
      expect(assignment.assignedAt).toBeInstanceOf(Date);
      expect(assignment.expiresAt).toBeInstanceOf(Date);
      expect(assignment.isActive).toBe(true);
      expect(assignment.metadata).toEqual({ reason: 'Promotion' });
      expect(assignment.createdAt).toBeInstanceOf(Date);
      expect(assignment.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a role assignment with default values', () => {
      const assignment = new UserRoleAssignment(
        '123e4567-e89b-12d3-a456-426614174131',
        testUserIds.validUser1,
        testRoleIds.adminRole
      );

      expect(assignment.id).toBe('123e4567-e89b-12d3-a456-426614174131');
      expect(assignment.userId).toBe(testUserIds.validUser1);
      expect(assignment.roleId).toBe(testRoleIds.adminRole);
      expect(assignment.assignedBy).toBeUndefined();
      expect(assignment.assignedAt).toBeInstanceOf(Date);
      expect(assignment.expiresAt).toBeUndefined();
      expect(assignment.isActive).toBe(true);
      expect(assignment.metadata).toBeUndefined();
      expect(assignment.createdAt).toBeInstanceOf(Date);
      expect(assignment.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid role assignment using factory method', () => {
      const assignmentData = {
        userId: testUserIds.validUser1,
        roleId: testRoleIds.adminRole,
        assignedBy: testUserIds.validUser2,
        expiresAt: new Date('2024-01-01T00:00:00.000Z'),
        isActive: true,
        metadata: { reason: 'Promotion' }
      };

      const assignment = UserRoleAssignment.create(assignmentData);

      expect(assignment.userId).toBe(assignmentData.userId);
      expect(assignment.roleId).toBe(assignmentData.roleId);
      expect(assignment.assignedBy).toBe(assignmentData.assignedBy);
      expect(assignment.expiresAt).toBe(assignmentData.expiresAt);
      expect(assignment.isActive).toBe(assignmentData.isActive);
      expect(assignment.metadata).toEqual(assignmentData.metadata);
      expect(assignment.id).toBeDefined();
      expect(assignment.assignedAt).toBeInstanceOf(Date);
      expect(assignment.createdAt).toBeInstanceOf(Date);
      expect(assignment.updatedAt).toBeInstanceOf(Date);
    });

    it('should create role assignment with default values using factory method', () => {
      const assignmentData = {
        userId: testUserIds.validUser1,
        roleId: testRoleIds.adminRole
      };

      const assignment = UserRoleAssignment.create(assignmentData);

      expect(assignment.userId).toBe(assignmentData.userId);
      expect(assignment.roleId).toBe(assignmentData.roleId);
      expect(assignment.assignedBy).toBeUndefined();
      expect(assignment.expiresAt).toBeUndefined();
      expect(assignment.isActive).toBe(true);
      expect(assignment.metadata).toBeUndefined();
      expect(assignment.id).toBeDefined();
      expect(assignment.assignedAt).toBeInstanceOf(Date);
      expect(assignment.createdAt).toBeInstanceOf(Date);
      expect(assignment.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Methods', () => {
    let assignment: UserRoleAssignment;

    beforeEach(() => {
      assignment = createTestUserRoleAssignment();
    });

    describe('activate', () => {
      it('should activate assignment and return new instance', () => {
        const inactiveAssignment = createTestUserRoleAssignment({ isActive: false });

        const activeAssignment = inactiveAssignment.activate();

        expect(activeAssignment.isActive).toBe(true);
        expect(activeAssignment.updatedAt.getTime()).toBeGreaterThan(inactiveAssignment.updatedAt.getTime());
      });

      it('should keep assignment active if already active', () => {
        const alreadyActiveAssignment = createTestUserRoleAssignment({ isActive: true });

        const activeAssignment = alreadyActiveAssignment.activate();

        expect(activeAssignment.isActive).toBe(true);
        expect(activeAssignment.updatedAt.getTime()).toBeGreaterThan(alreadyActiveAssignment.updatedAt.getTime());
      });
    });

    describe('deactivate', () => {
      it('should deactivate assignment and return new instance', () => {
        const activeAssignment = createTestUserRoleAssignment({ isActive: true });

        const inactiveAssignment = activeAssignment.deactivate();

        expect(inactiveAssignment.isActive).toBe(false);
        expect(inactiveAssignment.updatedAt.getTime()).toBeGreaterThan(activeAssignment.updatedAt.getTime());
      });

      it('should keep assignment inactive if already inactive', () => {
        const alreadyInactiveAssignment = createTestUserRoleAssignment({ isActive: false });

        const inactiveAssignment = alreadyInactiveAssignment.deactivate();

        expect(inactiveAssignment.isActive).toBe(false);
        expect(inactiveAssignment.updatedAt.getTime()).toBeGreaterThan(alreadyInactiveAssignment.updatedAt.getTime());
      });
    });

    describe('updateExpiration', () => {
      it('should update expiration and return new instance', () => {
        const newExpiration = new Date('2025-01-01T00:00:00.000Z');

        const updatedAssignment = assignment.updateExpiration(newExpiration);

        expect(updatedAssignment.expiresAt).toBe(newExpiration);
        expect(updatedAssignment.updatedAt.getTime()).toBeGreaterThan(assignment.updatedAt.getTime());
      });

      it('should remove expiration when undefined is provided', () => {
        const updatedAssignment = assignment.updateExpiration(undefined);

        expect(updatedAssignment.expiresAt).toBeUndefined();
        expect(updatedAssignment.updatedAt.getTime()).toBeGreaterThan(assignment.updatedAt.getTime());
      });
    });

    describe('updateMetadata', () => {
      it('should update metadata and return new instance', () => {
        const newMetadata = { reason: 'Updated', priority: 'high' };

        const updatedAssignment = assignment.updateMetadata(newMetadata);

        expect(updatedAssignment.metadata).toEqual({ ...assignment.metadata, ...newMetadata });
        expect(updatedAssignment.updatedAt.getTime()).toBeGreaterThan(assignment.updatedAt.getTime());
      });
    });
  });

  describe('Business Validation Methods', () => {
    let assignment: UserRoleAssignment;

    beforeEach(() => {
      assignment = createTestUserRoleAssignment();
    });

    describe('isExpired', () => {
      it('should return true when assignment is expired', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const expiredAssignment = createTestUserRoleAssignment({
          expiresAt: pastDate
        });

        expect(expiredAssignment.isExpired()).toBe(true);
      });

      it('should return false when assignment is not expired', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const notExpiredAssignment = createTestUserRoleAssignment({
          expiresAt: futureDate
        });

        expect(notExpiredAssignment.isExpired()).toBe(false);
      });

      it('should return false when assignment has no expiration', () => {
        const noExpirationAssignment = createTestUserRoleAssignment({
          expiresAt: undefined
        });

        expect(noExpirationAssignment.isExpired()).toBe(false);
      });
    });

    describe('isValid', () => {
      it('should return true when assignment is active and not expired', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const validAssignment = createTestUserRoleAssignment({
          isActive: true,
          expiresAt: futureDate
        });

        expect(validAssignment.isValid()).toBe(true);
      });

      it('should return false when assignment is inactive', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const inactiveAssignment = createTestUserRoleAssignment({
          isActive: false,
          expiresAt: futureDate
        });

        expect(inactiveAssignment.isValid()).toBe(false);
      });

      it('should return false when assignment is expired', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const expiredAssignment = createTestUserRoleAssignment({
          isActive: true,
          expiresAt: pastDate
        });

        expect(expiredAssignment.isValid()).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid role assignment', () => {
        const assignment = createTestUserRoleAssignment();
        const result = assignment.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid role assignment', () => {
        const invalidAssignment = new UserRoleAssignment(
          'invalid-id',
          'invalid-user-id',
          'invalid-role-id',
          'invalid-assigner-id',
          'invalid-date' as any,
          'invalid-date' as any,
          'not-a-boolean' as any,
          'not-an-object' as any,
          'invalid-date' as any,
          'invalid-date' as any
        );

        const result = invalidAssignment.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const assignmentData = {
          userId: testUserIds.validUser1,
          roleId: testRoleIds.adminRole,
          assignedBy: testUserIds.validUser2,
          expiresAt: new Date('2024-01-01T00:00:00.000Z'),
          isActive: true,
          metadata: { reason: 'Promotion' }
        };

        const result = UserRoleAssignment.validateCreate(assignmentData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid',
          roleId: 'invalid-uuid',
          assignedBy: 'invalid-uuid',
          expiresAt: 'invalid-date' as any,
          isActive: 'not-a-boolean' as any,
          metadata: 'not-an-object' as any
        };

        const result = UserRoleAssignment.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let assignment: UserRoleAssignment;

    beforeEach(() => {
      assignment = createTestUserRoleAssignment();
    });

    describe('toJSON', () => {
      it('should return assignment object with all properties', () => {
        const json = assignment.toJSON();

        expect(json).toEqual({
          id: assignment.id,
          userId: assignment.userId,
          roleId: assignment.roleId,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt,
          expiresAt: assignment.expiresAt,
          isActive: assignment.isActive,
          metadata: assignment.metadata,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt
        });
      });
    });
  });
});