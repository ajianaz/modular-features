import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRoleRepository } from '../../../infrastructure/repositories/UserRoleRepository';
import { UserRole, UserRoleAssignment } from '../../../domain/entities';
import {
  createTestUserRole,
  createTestUserRoleAssignment
} from '../../utils/testFixtures.test';

// Mock the database module
vi.mock('@modular-monolith/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  userRoles: {},
  userRoleAssignments: {}
}));

// Mock the drizzle-orm module
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  or: vi.fn(),
  ilike: vi.fn(),
  desc: vi.fn(),
  asc: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  isNull: vi.fn(),
  isNotNull: vi.fn()
}));

import { db } from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from 'drizzle-orm';

describe('UserRoleRepository', () => {
  let repository: UserRoleRepository;
  let testRole: UserRole;
  let testRoleAssignment: UserRoleAssignment;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserRoleRepository();
    testRole = createTestUserRole();
    testRoleAssignment = createTestUserRoleAssignment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findRoleById', () => {
    it('should find a role by ID', async () => {
      const mockResult = [{
        id: testRole.id,
        name: testRole.name,
        displayName: testRole.displayName,
        description: testRole.description,
        level: testRole.level,
        permissions: testRole.permissions,
        isActive: testRole.isActive,
        isSystem: testRole.isSystem,
        createdAt: testRole.createdAt,
        updatedAt: testRole.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findRoleById(testRole.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testRole.id);
      expect(result!.name).toBe(testRole.name);
      expect(result!.displayName).toBe(testRole.displayName);
    });

    it('should return null when role is not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findRoleById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('findRoleByName', () => {
    it('should find a role by name', async () => {
      const mockResult = [{
        id: testRole.id,
        name: testRole.name,
        displayName: testRole.displayName,
        description: testRole.description,
        level: testRole.level,
        permissions: testRole.permissions,
        isActive: testRole.isActive,
        isSystem: testRole.isSystem,
        createdAt: testRole.createdAt,
        updatedAt: testRole.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findRoleByName(testRole.name);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.name).toBe(testRole.name);
    });

    it('should return null when role is not found by name', async () => {
      const nonExistentName = 'nonexistent-role';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findRoleByName(nonExistentName);

      expect(result).toBeNull();
    });
  });

  describe('findAllRoles', () => {
    it('should find all roles', async () => {
      const mockResult = [{
        id: testRole.id,
        name: testRole.name,
        displayName: testRole.displayName,
        description: testRole.description,
        level: testRole.level,
        permissions: testRole.permissions,
        isActive: testRole.isActive,
        isSystem: testRole.isSystem,
        createdAt: testRole.createdAt,
        updatedAt: testRole.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.findAllRoles();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testRole.id);
    });

    it('should return empty array when no roles exist', async () => {
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.findAllRoles();

      expect(result).toHaveLength(0);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const mockResult = [{
        id: testRole.id,
        name: testRole.name,
        displayName: testRole.displayName,
        description: testRole.description,
        level: testRole.level,
        permissions: testRole.permissions,
        isActive: testRole.isActive,
        isSystem: testRole.isSystem,
        createdAt: testRole.createdAt,
        updatedAt: testRole.updatedAt
      }];

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.insert as any).mockImplementation(() => ({
        values: mockValues,
        returning: mockReturning
      }));

      const result = await repository.createRole(testRole);

      expect(db.insert).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testRole.id);
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const updatedRole = UserRole.create({
        ...testRole,
        displayName: 'Updated Display Name',
        description: 'Updated Description'
      });

      const mockResult = [{
        id: updatedRole.id,
        name: updatedRole.name,
        displayName: updatedRole.displayName,
        description: updatedRole.description,
        level: updatedRole.level,
        permissions: updatedRole.permissions,
        isActive: updatedRole.isActive,
        isSystem: updatedRole.isSystem,
        createdAt: updatedRole.createdAt,
        updatedAt: updatedRole.updatedAt
      }];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.update as any).mockImplementation(() => ({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.updateRole(updatedRole);

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.displayName).toBe('Updated Display Name');
      expect(result!.description).toBe('Updated Description');
    });
  });

  describe('deleteRole', () => {
    it('should delete a role by ID', async () => {
      const mockResult = [{ id: testRole.id }];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.deleteRole(testRole.id);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when role is not found for deletion', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.deleteRole(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('findAssignmentById', () => {
    it('should find a role assignment by ID', async () => {
      const mockResult = [{
        id: testRoleAssignment.id,
        userId: testRoleAssignment.userId,
        roleId: testRoleAssignment.roleId,
        assignedBy: testRoleAssignment.assignedBy,
        assignedAt: testRoleAssignment.assignedAt,
        expiresAt: testRoleAssignment.expiresAt,
        isActive: testRoleAssignment.isActive,
        metadata: testRoleAssignment.metadata,
        createdAt: testRoleAssignment.createdAt,
        updatedAt: testRoleAssignment.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findAssignmentById(testRoleAssignment.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testRoleAssignment.id);
      expect(result!.userId).toBe(testRoleAssignment.userId);
      expect(result!.roleId).toBe(testRoleAssignment.roleId);
    });

    it('should return null when role assignment is not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findAssignmentById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('findAssignmentsByUserId', () => {
    it('should find role assignments by user ID', async () => {
      const mockResult = [{
        id: testRoleAssignment.id,
        userId: testRoleAssignment.userId,
        roleId: testRoleAssignment.roleId,
        assignedBy: testRoleAssignment.assignedBy,
        assignedAt: testRoleAssignment.assignedAt,
        expiresAt: testRoleAssignment.expiresAt,
        isActive: testRoleAssignment.isActive,
        metadata: testRoleAssignment.metadata,
        createdAt: testRoleAssignment.createdAt,
        updatedAt: testRoleAssignment.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere
      }));

      const result = await repository.findAssignmentsByUserId(testRoleAssignment.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testRoleAssignment.userId);
    });

    it('should return empty array when no assignments found for user', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere
      }));

      const result = await repository.findAssignmentsByUserId(nonExistentUserId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findActiveAssignmentsByUserId', () => {
    it('should find active role assignments by user ID', async () => {
      const mockResult = [{
        id: testRoleAssignment.id,
        userId: testRoleAssignment.userId,
        roleId: testRoleAssignment.roleId,
        assignedBy: testRoleAssignment.assignedBy,
        assignedAt: testRoleAssignment.assignedAt,
        expiresAt: testRoleAssignment.expiresAt,
        isActive: testRoleAssignment.isActive,
        metadata: testRoleAssignment.metadata,
        createdAt: testRoleAssignment.createdAt,
        updatedAt: testRoleAssignment.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere
      }));

      const result = await repository.findActiveAssignmentsByUserId(testRoleAssignment.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(testRoleAssignment.userId);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('createAssignment', () => {
    it('should create a new role assignment', async () => {
      const mockResult = [{
        id: testRoleAssignment.id,
        userId: testRoleAssignment.userId,
        roleId: testRoleAssignment.roleId,
        assignedBy: testRoleAssignment.assignedBy,
        assignedAt: testRoleAssignment.assignedAt,
        expiresAt: testRoleAssignment.expiresAt,
        isActive: testRoleAssignment.isActive,
        metadata: testRoleAssignment.metadata,
        createdAt: testRoleAssignment.createdAt,
        updatedAt: testRoleAssignment.updatedAt
      }];

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.insert as any).mockImplementation(() => ({
        values: mockValues,
        returning: mockReturning
      }));

      const result = await repository.createAssignment(testRoleAssignment);

      expect(db.insert).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testRoleAssignment.id);
    });
  });

  describe('updateAssignment', () => {
    it('should update an existing role assignment', async () => {
      const updatedAssignment = UserRoleAssignment.create({
        ...testRoleAssignment,
        isActive: false,
        metadata: { notes: 'Updated notes' }
      });

      const mockResult = [{
        id: updatedAssignment.id,
        userId: updatedAssignment.userId,
        roleId: updatedAssignment.roleId,
        assignedBy: updatedAssignment.assignedBy,
        assignedAt: updatedAssignment.assignedAt,
        expiresAt: updatedAssignment.expiresAt,
        isActive: updatedAssignment.isActive,
        metadata: updatedAssignment.metadata,
        createdAt: updatedAssignment.createdAt,
        updatedAt: updatedAssignment.updatedAt
      }];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.update as any).mockImplementation(() => ({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.updateAssignment(updatedAssignment);

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.isActive).toBe(false);
      expect(result!.metadata?.notes).toBe('Updated notes');
    });
  });

  describe('deleteAssignment', () => {
    it('should delete a role assignment by ID', async () => {
      const mockResult = [{ id: testRoleAssignment.id }];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.deleteAssignment(testRoleAssignment.id);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when role assignment is not found for deletion', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.deleteAssignment(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should get user roles', async () => {
      const mockResult = [{
        id: testRole.id,
        name: testRole.name,
        displayName: testRole.displayName,
        description: testRole.description,
        level: testRole.level,
        permissions: testRole.permissions,
        isActive: testRole.isActive,
        isSystem: testRole.isSystem,
        createdAt: testRole.createdAt,
        updatedAt: testRole.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.getUserRoles(testRoleAssignment.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testRole.id);
    });
  });

  describe('getUserPermissions', () => {
    it('should get user permissions', async () => {
      const mockResult = [{
        permissions: testRole.permissions
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.getUserPermissions(testRoleAssignment.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(testRole.permissions);
    });
  });

  describe('hasUserRole', () => {
    it('should check if user has a specific role', async () => {
      const mockResult = [{ count: 1 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.hasUserRole(testRoleAssignment.userId, testRole.name);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when user does not have the role', async () => {
      const mockResult = [{ count: 0 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.hasUserRole(testRoleAssignment.userId, 'nonexistent-role');

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('hasUserPermission', () => {
    it('should check if user has a specific permission', async () => {
      const mockResult = [{ count: 1 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const permission = testRole.permissions[0];
      if (permission) {
        const mockResult = [{ count: 1 }];

        const mockSelect = vi.fn().mockReturnThis();
        const mockFrom = vi.fn().mockResolvedValue(mockResult);

        (db.select as any).mockImplementation(() => ({
          from: mockFrom
        }));

        const result = await repository.hasUserPermission(testRoleAssignment.userId, permission);

        expect(db.select).toHaveBeenCalled();
        expect(result).toBe(true);
      }
    });

    it('should return false when user does not have the permission', async () => {
      const mockResult = [{ count: 0 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.hasUserPermission(testRoleAssignment.userId, 'nonexistent-permission');

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('roleExistsById', () => {
    it('should return true when role exists by ID', async () => {
      const mockResult = [{ id: testRole.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.roleExistsById(testRole.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when role does not exist by ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.roleExistsById(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('roleExistsByName', () => {
    it('should return true when role exists by name', async () => {
      const mockResult = [{ id: testRole.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.roleExistsByName(testRole.name);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when role does not exist by name', async () => {
      const nonExistentName = 'nonexistent-role';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.roleExistsByName(nonExistentName);

      expect(result).toBe(false);
    });
  });
});