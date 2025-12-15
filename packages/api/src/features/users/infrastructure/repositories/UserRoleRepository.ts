import { UserRole, UserRoleAssignment } from '../../domain/entities/UserRole.entity';
import { IUserRoleRepository } from '../../domain/interfaces/IUserRoleRepository';
import {
  UserRoleNotFoundError,
  RoleAssignmentError
} from '../../domain/errors';
import { db } from '@modular-monolith/database';
import { userRoles, userRoleAssignments } from '@modular-monolith/database';
import type {
  UserRole as DBUserRole,
  NewUserRole,
  UserRoleAssignment as DBUserRoleAssignment,
  NewUserRoleAssignment
} from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull, count, inArray } from 'drizzle-orm';

export class UserRoleRepository implements IUserRoleRepository {
  // Role CRUD operations
  async findById(id: string): Promise<UserRole | null> {
    try {
      const result = await db.select().from(userRoles).where(eq(userRoles.id, id)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserRoleRepository.findById error:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<UserRole | null> {
    try {
      const result = await db.select().from(userRoles).where(eq(userRoles.name, name)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserRoleRepository.findByName error:', error);
      throw error;
    }
  }

  async create(role: UserRole): Promise<UserRole> {
    try {
      const newRoleData: NewUserRole = {
        name: role.name,
        displayName: role.displayName,
        description: role.description || null,
        level: role.level || 0,
        isSystem: role.isSystem || false,
        permissions: role.permissions || [],
        metadata: role.metadata || {},
        isActive: role.isActive !== undefined ? role.isActive : true
      };

      const [insertedRole] = await db.insert(userRoles).values(newRoleData).returning();

      return this.mapToDomainEntity(insertedRole!);
    } catch (error) {
      console.error('UserRoleRepository.create error:', error);
      throw error;
    }
  }

  async update(role: UserRole): Promise<UserRole> {
    try {
      const updateData = {
        name: role.name,
        displayName: role.displayName,
        description: role.description || null,
        level: role.level || 0,
        isSystem: role.isSystem || false,
        permissions: role.permissions || [],
        metadata: role.metadata || {},
        isActive: role.isActive !== undefined ? role.isActive : true,
        updatedAt: new Date()
      };

      const [updatedRole] = await db
        .update(userRoles)
        .set(updateData)
        .where(eq(userRoles.id, role.id))
        .returning();

      if (!updatedRole) {
        throw new UserRoleNotFoundError(`Role with id ${role.id} not found`);
      }

      return this.mapToDomainEntity(updatedRole!);
    } catch (error) {
      console.error('UserRoleRepository.update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoles)
        .where(eq(userRoles.id, id))
        .returning({ id: userRoles.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.delete error:', error);
      throw error;
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findAll error:', error);
      throw error;
    }
  }

  async findByLevel(level: number): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.level, level))
        .orderBy(desc(userRoles.name));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findByLevel error:', error);
      throw error;
    }
  }

  async findActive(): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.isActive, true))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findActive error:', error);
      throw error;
    }
  }

  async findSystem(): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.isSystem, true))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findSystem error:', error);
      throw error;
    }
  }

  async findCustom(): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.isSystem, false))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findCustom error:', error);
      throw error;
    }
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(
          or(
            ilike(userRoles.name, `%${query}%`),
            ilike(userRoles.displayName, `%${query}%`),
            ilike(userRoles.description, `%${query}%`)
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.search error:', error);
      throw error;
    }
  }

  async searchRoles(query: string, limit: number = 50, offset: number = 0): Promise<UserRole[]> {
    return this.search(query, limit, offset);
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoles.id })
        .from(userRoles)
        .where(eq(userRoles.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.existsById error:', error);
      throw error;
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoles.id })
        .from(userRoles)
        .where(eq(userRoles.name, name))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.existsByName error:', error);
      throw error;
    }
  }

  async createMany(roles: UserRole[]): Promise<UserRole[]> {
    try {
      const rolesData: NewUserRole[] = roles.map(role => ({
        name: role.name,
        displayName: role.displayName,
        description: role.description || null,
        level: role.level || 0,
        isSystem: role.isSystem || false,
        permissions: role.permissions || [],
        metadata: role.metadata || {},
        isActive: role.isActive !== undefined ? role.isActive : true
      }));

      const insertedRoles = await db.insert(userRoles).values(rolesData).returning();

      return insertedRoles.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.createMany error:', error);
      throw error;
    }
  }

  async updateMany(roles: UserRole[]): Promise<UserRole[]> {
    try {
      const updatePromises = roles.map(role => this.update(role));
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('UserRoleRepository.updateMany error:', error);
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoles)
        .where(inArray(userRoles.id, ids))
        .returning({ id: userRoles.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.deleteMany error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoles);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.count error:', error);
      throw error;
    }
  }

  async countActive(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoles)
        .where(eq(userRoles.isActive, true));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countActive error:', error);
      throw error;
    }
  }

  async countByLevel(level: number): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoles)
        .where(eq(userRoles.level, level));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countByLevel error:', error);
      throw error;
    }
  }

  // Role Assignment operations
  async findAssignmentById(id: string): Promise<UserRoleAssignment | null> {
    try {
      const result = await db.select().from(userRoleAssignments).where(eq(userRoleAssignments.id, id)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapAssignmentToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentById error:', error);
      throw error;
    }
  }

  async findAssignmentsByUserId(userId: string): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.userId, userId))
        .orderBy(desc(userRoleAssignments.assignedAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentsByUserId error:', error);
      throw error;
    }
  }

  async findAssignmentsByRoleId(roleId: string): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.roleId, roleId))
        .orderBy(desc(userRoleAssignments.assignedAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentsByRoleId error:', error);
      throw error;
    }
  }

  async findActiveAssignmentsByUserId(userId: string): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            eq(userRoleAssignments.userId, userId),
            eq(userRoleAssignments.isActive, true)
          )
        )
        .orderBy(desc(userRoleAssignments.assignedAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findActiveAssignmentsByUserId error:', error);
      throw error;
    }
  }

  async createAssignment(assignment: UserRoleAssignment): Promise<UserRoleAssignment> {
    try {
      const newAssignmentData: NewUserRoleAssignment = {
        userId: assignment.userId,
        roleId: assignment.roleId,
        assignedBy: assignment.assignedBy || null,
        assignedAt: assignment.assignedAt || new Date(),
        expiresAt: assignment.expiresAt || null,
        isActive: assignment.isActive !== undefined ? assignment.isActive : true,
        metadata: assignment.metadata || {}
      };

      const [insertedAssignment] = await db.insert(userRoleAssignments).values(newAssignmentData).returning();

      return this.mapAssignmentToDomainEntity(insertedAssignment!);
    } catch (error) {
      console.error('UserRoleRepository.createAssignment error:', error);
      throw error;
    }
  }

  async updateAssignment(assignment: UserRoleAssignment): Promise<UserRoleAssignment> {
    try {
      const updateData = {
        userId: assignment.userId,
        roleId: assignment.roleId,
        assignedBy: assignment.assignedBy || null,
        assignedAt: assignment.assignedAt || new Date(),
        expiresAt: assignment.expiresAt || null,
        isActive: assignment.isActive !== undefined ? assignment.isActive : true,
        metadata: assignment.metadata || {},
        updatedAt: new Date()
      };

      const [updatedAssignment] = await db
        .update(userRoleAssignments)
        .set(updateData)
        .where(eq(userRoleAssignments.id, assignment.id))
        .returning();

      if (!updatedAssignment) {
        throw new RoleAssignmentError(`Role assignment with id ${assignment.id} not found`);
      }

      return this.mapAssignmentToDomainEntity(updatedAssignment!);
    } catch (error) {
      console.error('UserRoleRepository.updateAssignment error:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoleAssignments)
        .where(eq(userRoleAssignments.id, id))
        .returning({ id: userRoleAssignments.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.deleteAssignment error:', error);
      throw error;
    }
  }

  async deleteAssignmentByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoleAssignments)
        .where(eq(userRoleAssignments.userId, userId))
        .returning({ id: userRoleAssignments.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.deleteAssignmentByUserId error:', error);
      throw error;
    }
  }

  async deleteAssignmentByRoleId(roleId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoleAssignments)
        .where(eq(userRoleAssignments.roleId, roleId))
        .returning({ id: userRoleAssignments.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.deleteAssignmentByRoleId error:', error);
      throw error;
    }
  }

  async assignmentExistsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoleAssignments.id })
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.assignmentExistsById error:', error);
      throw error;
    }
  }

  async existsAssignmentById(id: string): Promise<boolean> {
    return this.assignmentExistsById(id);
  }

  async existsAssignmentByUserIdAndRoleId(userId: string, roleId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoleAssignments.id })
        .from(userRoleAssignments)
        .where(
          and(
            eq(userRoleAssignments.userId, userId),
            eq(userRoleAssignments.roleId, roleId)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.existsAssignmentByUserIdAndRoleId error:', error);
      throw error;
    }
  }

  async countAssignments(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countAssignments error:', error);
      throw error;
    }
  }

  async countActiveAssignments(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.isActive, true));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countActiveAssignments error:', error);
      throw error;
    }
  }

  async countAssignmentsByUserId(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.userId, userId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countAssignmentsByUserId error:', error);
      throw error;
    }
  }

  async countAssignmentsByRoleId(roleId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.roleId, roleId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countAssignmentsByRoleId error:', error);
      throw error;
    }
  }

  async findExpiredAssignments(): Promise<UserRoleAssignment[]> {
    try {
      const now = new Date();
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt),
            lte(userRoleAssignments.expiresAt, now)
          )
        )
        .orderBy(desc(userRoleAssignments.expiresAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findExpiredAssignments error:', error);
      throw error;
    }
  }

  async findExpiringAssignments(withinHours: number): Promise<UserRoleAssignment[]> {
    try {
      const cutoffDate = new Date(Date.now() + withinHours * 60 * 60 * 1000);
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt),
            lte(userRoleAssignments.expiresAt, cutoffDate)
          )
        )
        .orderBy(asc(userRoleAssignments.expiresAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findExpiringAssignments error:', error);
      throw error;
    }
  }

  // Additional required methods from interface
  async findRoleById(id: string): Promise<UserRole | null> {
    return this.findById(id);
  }

  async findRoleByName(name: string): Promise<UserRole | null> {
    return this.findByName(name);
  }

  async findAllRoles(limit: number = 50, offset: number = 0): Promise<UserRole[]> {
    return this.findAll(limit, offset);
  }

  async findActiveRoles(limit: number = 50, offset: number = 0): Promise<UserRole[]> {
    return this.findActive().then(roles => roles.slice(offset, offset + limit));
  }

  async findSystemRoles(): Promise<UserRole[]> {
    return this.findSystem();
  }

  async findCustomRoles(): Promise<UserRole[]> {
    return this.findCustom();
  }

  async createRole(role: UserRole): Promise<UserRole> {
    return this.create(role);
  }

  async updateRole(role: UserRole): Promise<UserRole> {
    return this.update(role);
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findRolesByLevel(minLevel?: number, maxLevel?: number): Promise<UserRole[]> {
    try {
      let whereConditions = [];

      if (minLevel !== undefined) {
        whereConditions.push(gte(userRoles.level, minLevel));
      }

      if (maxLevel !== undefined) {
        whereConditions.push(lte(userRoles.level, maxLevel));
      }

      const result = await db
        .select()
        .from(userRoles)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRolesByLevel error:', error);
      throw error;
    }
  }

  async findRolesWithPermission(permission: string): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(
          ilike(userRoles.permissions, `%${permission}%`)
        )
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRolesWithPermission error:', error);
      throw error;
    }
  }

  async findRolesWithAnyPermission(permissions: string[]): Promise<UserRole[]> {
    try {
      const whereConditions = permissions.map(permission =>
        ilike(userRoles.permissions, `%${permission}%`)
      );

      const result = await db
        .select()
        .from(userRoles)
        .where(or(...whereConditions))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRolesWithAnyPermission error:', error);
      throw error;
    }
  }

  async findRolesWithAllPermissions(permissions: string[]): Promise<UserRole[]> {
    try {
      const whereConditions = permissions.map(permission =>
        ilike(userRoles.permissions, `%${permission}%`) as any
      );

      const result = await db
        .select()
        .from(userRoles)
        .where(and(...whereConditions))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRolesWithAllPermissions error:', error);
      throw error;
    }
  }

  async roleExistsById(id: string): Promise<boolean> {
    return this.existsById(id);
  }

  async roleExistsByName(name: string): Promise<boolean> {
    return this.existsByName(name);
  }

  async createRoles(roles: UserRole[]): Promise<UserRole[]> {
    return this.createMany(roles);
  }

  async updateRoles(roles: UserRole[]): Promise<UserRole[]> {
    return this.updateMany(roles);
  }

  async deleteRoles(ids: string[]): Promise<boolean> {
    return this.deleteMany(ids);
  }

  async countRoles(): Promise<number> {
    return this.count();
  }

  async countActiveRoles(): Promise<number> {
    return this.countActive();
  }

  async countSystemRoles(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoles)
        .where(eq(userRoles.isSystem, true));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countSystemRoles error:', error);
      throw error;
    }
  }

  async countCustomRoles(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoles)
        .where(eq(userRoles.isSystem, false));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countCustomRoles error:', error);
      throw error;
    }
  }

  async countRolesByLevel(level: number): Promise<number> {
    return this.countByLevel(level);
  }

  async findActiveAssignmentsByRoleId(roleId: string): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            eq(userRoleAssignments.roleId, roleId) as any,
            eq(userRoleAssignments.isActive, true) as any
          ) as any
        )
        .orderBy(desc(userRoleAssignments.assignedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findActiveAssignmentsByRoleId error:', error);
      throw error;
    }
  }

  async findAllAssignments(limit: number = 50, offset: number = 0): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userRoleAssignments.assignedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAllAssignments error:', error);
      throw error;
    }
  }

  async findAssignmentsByAssignedBy(assignedBy: string): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.assignedBy, assignedBy) as any)
        .orderBy(desc(userRoleAssignments.assignedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentsByAssignedBy error:', error);
      throw error;
    }
  }

  async findTemporaryAssignments(): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(isNotNull(userRoleAssignments.expiresAt) as any)
        .orderBy(desc(userRoleAssignments.assignedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findTemporaryAssignments error:', error);
      throw error;
    }
  }

  async findPermanentAssignments(): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(isNull(userRoleAssignments.expiresAt) as any)
        .orderBy(desc(userRoleAssignments.assignedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findPermanentAssignments error:', error);
      throw error;
    }
  }

  async findAssignmentsExpiringBefore(date: Date): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt) as any,
            lte(userRoleAssignments.expiresAt, date) as any
          ) as any
        )
        .orderBy(asc(userRoleAssignments.expiresAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentsExpiringBefore error:', error);
      throw error;
    }
  }

  async findAssignmentsExpiringAfter(date: Date): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt) as any,
            gte(userRoleAssignments.expiresAt, date) as any
          ) as any
        )
        .orderBy(asc(userRoleAssignments.expiresAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findAssignmentsExpiringAfter error:', error);
      throw error;
    }
  }

  async assignmentExists(userId: string, roleId: string): Promise<boolean> {
    return this.existsAssignmentByUserIdAndRoleId(userId, roleId);
  }

  async activeAssignmentExists(userId: string, roleId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoleAssignments.id })
        .from(userRoleAssignments)
        .where(
          and(
            eq(userRoleAssignments.userId, userId) as any,
            eq(userRoleAssignments.roleId, roleId) as any,
            eq(userRoleAssignments.isActive, true) as any
          ) as any
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.activeAssignmentExists error:', error);
      throw error;
    }
  }

  async createAssignments(assignments: UserRoleAssignment[]): Promise<UserRoleAssignment[]> {
    try {
      const assignmentsData: NewUserRoleAssignment[] = assignments.map(assignment => ({
        userId: assignment.userId,
        roleId: assignment.roleId,
        assignedBy: assignment.assignedBy || null,
        assignedAt: assignment.assignedAt || new Date(),
        expiresAt: assignment.expiresAt || null,
        isActive: assignment.isActive !== undefined ? assignment.isActive : true,
        metadata: assignment.metadata || {}
      }));

      const insertedAssignments = await db.insert(userRoleAssignments).values(assignmentsData as any).returning();

      return insertedAssignments.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.createAssignments error:', error);
      throw error;
    }
  }

  async updateAssignments(assignments: UserRoleAssignment[]): Promise<UserRoleAssignment[]> {
    try {
      const updatePromises = assignments.map(assignment => this.updateAssignment(assignment));
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('UserRoleRepository.updateAssignments error:', error);
      throw error;
    }
  }

  async deleteAssignments(ids: string[]): Promise<boolean> {
    try {
      const result = await db
        .delete(userRoleAssignments)
        .where(inArray(userRoleAssignments.id, ids))
        .returning({ id: userRoleAssignments.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.deleteAssignments error:', error);
      throw error;
    }
  }

  async deleteAssignmentsByUserId(userId: string): Promise<boolean> {
    return this.deleteAssignmentByUserId(userId);
  }

  async deleteAssignmentsByRoleId(roleId: string): Promise<boolean> {
    return this.deleteAssignmentByRoleId(roleId);
  }

  async deleteExpiredAssignments(): Promise<number> {
    try {
      const now = new Date();
      const result = await db
        .delete(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt) as any,
            lte(userRoleAssignments.expiresAt, now) as any
          ) as any
        )
        .returning({ id: userRoleAssignments.id });

      return result.length;
    } catch (error) {
      console.error('UserRoleRepository.deleteExpiredAssignments error:', error);
      throw error;
    }
  }

  async countExpiredAssignments(): Promise<number> {
    try {
      const now = new Date();
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt),
            lte(userRoleAssignments.expiresAt, now)
          )
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countExpiredAssignments error:', error);
      throw error;
    }
  }

  async countTemporaryAssignments(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(isNotNull(userRoleAssignments.expiresAt));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countTemporaryAssignments error:', error);
      throw error;
    }
  }

  async countPermanentAssignments(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(userRoleAssignments)
        .where(isNull(userRoleAssignments.expiresAt));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserRoleRepository.countPermanentAssignments error:', error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const result = await db
        .select({
          id: userRoles.id,
          name: userRoles.name,
          displayName: userRoles.displayName,
          description: userRoles.description,
          level: userRoles.level,
          isSystem: userRoles.isSystem,
          permissions: userRoles.permissions,
          metadata: userRoles.metadata,
          isActive: userRoles.isActive,
          createdAt: userRoles.createdAt,
          updatedAt: userRoles.updatedAt
        })
        .from(userRoles)
        .innerJoin(userRoleAssignments, eq(userRoles.id, userRoleAssignments.roleId) as any)
        .where(
          and(
            eq(userRoleAssignments.userId, userId),
            eq(userRoleAssignments.isActive, true)
          )
        )
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.getUserRoles error:', error);
      throw error;
    }
  }

  async getUserActiveRoles(userId: string): Promise<UserRole[]> {
    return this.getUserRoles(userId);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const roles = await this.getUserRoles(userId);
      const permissions = new Set<string>();

      roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => permissions.add(permission));
        }
      });

      return Array.from(permissions);
    } catch (error) {
      console.error('UserRoleRepository.getUserPermissions error:', error);
      throw error;
    }
  }

  async getUserHighestRoleLevel(userId: string): Promise<number> {
    try {
      const roles = await this.getUserRoles(userId);

      if (roles.length === 0) {
        return 0;
      }

      return Math.max(...roles.map(role => role.level || 0));
    } catch (error) {
      console.error('UserRoleRepository.getUserHighestRoleLevel error:', error);
      throw error;
    }
  }

  async hasUserRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userRoles.id })
        .from(userRoles)
        .innerJoin(userRoleAssignments, eq(userRoles.id, userRoleAssignments.roleId) as any)
        .where(
          and(
            eq(userRoleAssignments.userId, userId),
            eq(userRoles.name, roleName),
            eq(userRoleAssignments.isActive, true)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserRoleRepository.hasUserRole error:', error);
      throw error;
    }
  }

  async hasUserPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permission);
    } catch (error) {
      console.error('UserRoleRepository.hasUserPermission error:', error);
      throw error;
    }
  }

  async hasUserAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.some(permission => userPermissions.includes(permission));
    } catch (error) {
      console.error('UserRoleRepository.hasUserAnyPermission error:', error);
      throw error;
    }
  }

  async hasUserAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissions.every(permission => userPermissions.includes(permission));
    } catch (error) {
      console.error('UserRoleRepository.hasUserAllPermissions error:', error);
      throw error;
    }
  }

  async getAllPermissions(): Promise<string[]> {
    try {
      const result = await db
        .select({ permissions: userRoles.permissions })
        .from(userRoles)
        .where(eq(userRoles.isActive, true));

      const allPermissions = new Set<string>();

      result.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => allPermissions.add(permission));
        }
      });

      return Array.from(allPermissions);
    } catch (error) {
      console.error('UserRoleRepository.getAllPermissions error:', error);
      throw error;
    }
  }

  async getPermissionCategories(): Promise<{ category: string; permissions: string[] }[]> {
    try {
      const result = await db
        .select({ permissions: userRoles.permissions })
        .from(userRoles)
        .where(eq(userRoles.isActive, true));

      const categoryMap = new Map<string, Set<string>>();

      result.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            const category = permission.split(':')[0] || 'general';
            if (!categoryMap.has(category)) {
              categoryMap.set(category, new Set());
            }
            categoryMap.get(category)!.add(permission);
          });
        }
      });

      return Array.from(categoryMap.entries()).map(([category, permissions]) => ({
        category,
        permissions: Array.from(permissions)
      }));
    } catch (error) {
      console.error('UserRoleRepository.getPermissionCategories error:', error);
      throw error;
    }
  }

  async getPermissionsByCategory(category: string): Promise<string[]> {
    try {
      const result = await db
        .select({ permissions: userRoles.permissions })
        .from(userRoles)
        .where(eq(userRoles.isActive, true));

      const categoryPermissions = new Set<string>();

      result.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            const permissionCategory = permission.split(':')[0] || 'general';
            if (permissionCategory === category) {
              categoryPermissions.add(permission);
            }
          });
        }
      });

      return Array.from(categoryPermissions);
    } catch (error) {
      console.error('UserRoleRepository.getPermissionsByCategory error:', error);
      throw error;
    }
  }

  async getRoleHierarchy(): Promise<{ role: UserRole; children: UserRole[] }[]> {
    try {
      const roles = await this.findActive();
      const roleMap = new Map(roles.map(role => [role.id, role]));
      const hierarchy: { role: UserRole; children: UserRole[] }[] = [];

      // Group roles by level
      const rolesByLevel = new Map<number, UserRole[]>();
      roles.forEach(role => {
        const level = role.level || 0;
        if (!rolesByLevel.has(level)) {
          rolesByLevel.set(level, []);
        }
        rolesByLevel.get(level)!.push(role);
      });

      // Sort levels in descending order
      const sortedLevels = Array.from(rolesByLevel.keys()).sort((a, b) => b - a);

      sortedLevels.forEach(level => {
        const levelRoles = rolesByLevel.get(level)!;
        levelRoles.forEach(role => {
          hierarchy.push({
            role,
            children: []
          });
        });
      });

      return hierarchy;
    } catch (error) {
      console.error('UserRoleRepository.getRoleHierarchy error:', error);
      throw error;
    }
  }

  async getRolesAboveLevel(level: number): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(gte(userRoles.level, level))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.getRolesAboveLevel error:', error);
      throw error;
    }
  }

  async getRolesBelowLevel(level: number): Promise<UserRole[]> {
    try {
      const result = await db
        .select()
        .from(userRoles)
        .where(lte(userRoles.level, level))
        .orderBy(desc(userRoles.level));

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.getRolesBelowLevel error:', error);
      throw error;
    }
  }

  async getRoleUsageStatistics(): Promise<{ roleId: string; roleName: string; userCount: number }[]> {
    try {
      const result = await db
        .select({
          roleId: userRoleAssignments.roleId,
          userCount: count(userRoleAssignments.userId)
        })
        .from(userRoleAssignments)
        .where(eq(userRoleAssignments.isActive, true))
        .groupBy(userRoleAssignments.roleId);

      const statistics = await Promise.all(
        result.map(async (stat) => {
          const role = await this.findById(stat.roleId);
          return {
            roleId: stat.roleId,
            roleName: role?.name || 'Unknown',
            userCount: stat.userCount as number
          };
        })
      );

      return statistics;
    } catch (error) {
      console.error('UserRoleRepository.getRoleUsageStatistics error:', error);
      throw error;
    }
  }

  async getPermissionUsageStatistics(): Promise<{ permission: string; userCount: number; roleCount: number }[]> {
    try {
      const activeRoles = await this.findActive();
      const permissionStats = new Map<string, { userCount: number; roleCount: number }>();

      for (const role of activeRoles) {
        if (role.permissions && Array.isArray(role.permissions)) {
          const assignments = await this.findAssignmentsByRoleId(role.id);
          const activeAssignments = assignments.filter(a => a.isActive);
          const userCount = new Set(activeAssignments.map(a => a.userId)).size;

          role.permissions.forEach(permission => {
            if (!permissionStats.has(permission)) {
              permissionStats.set(permission, { userCount: 0, roleCount: 0 });
            }
            const stats = permissionStats.get(permission)!;
            stats.userCount += userCount;
            stats.roleCount += 1;
          });
        }
      }

      return Array.from(permissionStats.entries()).map(([permission, stats]) => ({
        permission,
        ...stats
      }));
    } catch (error) {
      console.error('UserRoleRepository.getPermissionUsageStatistics error:', error);
      throw error;
    }
  }

  async getAssignmentTrends(days: number): Promise<{ date: string; assignments: number; expirations: number }[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const assignmentsResult = await db
        .select({
          assignedAt: userRoleAssignments.assignedAt
        })
        .from(userRoleAssignments)
        .where(gte(userRoleAssignments.assignedAt, cutoffDate) as any);

      const expirationsResult = await db
        .select({
          expiresAt: userRoleAssignments.expiresAt
        })
        .from(userRoleAssignments)
        .where(
          and(
            isNotNull(userRoleAssignments.expiresAt),
            gte(userRoleAssignments.expiresAt, cutoffDate)
          )
        );

      // Group by date
      const trends = new Map<string, { assignments: number; expirations: number }>();

      assignmentsResult.forEach(row => {
        const dateStr = row.assignedAt.toISOString().split('T')[0];
        if (!trends.has(dateStr)) {
          trends.set(dateStr, { assignments: 0, expirations: 0 });
        }
        trends.get(dateStr)!.assignments++;
      });

      expirationsResult.forEach(row => {
        const dateStr = row.expiresAt.toISOString().split('T')[0];
        if (!trends.has(dateStr)) {
          trends.set(dateStr, { assignments: 0, expirations: 0 });
        }
        trends.get(dateStr)!.expirations++;
      });

      return Array.from(trends.entries()).map(([date, data]) => ({
        date,
        ...data
      }));
    } catch (error) {
      console.error('UserRoleRepository.getAssignmentTrends error:', error);
      throw error;
    }
  }

  async searchAssignments(query: string, limit: number = 50, offset: number = 0): Promise<UserRoleAssignment[]> {
    try {
      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(
          or(
            ilike(userRoleAssignments.userId, `%${query}%`),
            ilike(userRoleAssignments.roleId, `%${query}%`)
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userRoleAssignments.assignedAt));

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.searchAssignments error:', error);
      throw error;
    }
  }

  async findRecentlyCreatedRoles(hours: number): Promise<UserRole[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userRoles)
        .where(gte(userRoles.createdAt, cutoffDate) as any)
        .orderBy(desc(userRoles.createdAt) as any);

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRecentlyCreatedRoles error:', error);
      throw error;
    }
  }

  async findRecentlyUpdatedRoles(hours: number): Promise<UserRole[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userRoles)
        .where(gte(userRoles.updatedAt, cutoffDate) as any)
        .orderBy(desc(userRoles.updatedAt) as any);

      return result.map(role => this.mapToDomainEntity(role));
    } catch (error) {
      console.error('UserRoleRepository.findRecentlyUpdatedRoles error:', error);
      throw error;
    }
  }

  async findRecentlyCreatedAssignments(hours: number): Promise<UserRoleAssignment[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(gte(userRoleAssignments.createdAt, cutoffDate) as any)
        .orderBy(desc(userRoleAssignments.createdAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findRecentlyCreatedAssignments error:', error);
      throw error;
    }
  }

  async findRecentlyUpdatedAssignments(hours: number): Promise<UserRoleAssignment[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userRoleAssignments)
        .where(gte(userRoleAssignments.updatedAt, cutoffDate) as any)
        .orderBy(desc(userRoleAssignments.updatedAt) as any);

      return result.map(assignment => this.mapAssignmentToDomainEntity(assignment));
    } catch (error) {
      console.error('UserRoleRepository.findRecentlyUpdatedAssignments error:', error);
      throw error;
    }
  }

  // Private helper methods
  private mapToDomainEntity(role: DBUserRole): UserRole {
    return new UserRole(
      role.id,
      role.name,
      role.displayName,
      role.description || undefined,
      role.level || 0,
      role.isSystem || false,
      role.permissions || [],
      role.metadata || {},
      role.isActive !== undefined ? role.isActive : true,
      role.createdAt,
      role.updatedAt
    );
  }

  private mapAssignmentToDomainEntity(assignment: DBUserRoleAssignment): UserRoleAssignment {
    return new UserRoleAssignment(
      assignment.id,
      assignment.userId,
      assignment.roleId,
      assignment.assignedBy || undefined,
      assignment.assignedAt || new Date(),
      assignment.expiresAt || undefined,
      assignment.isActive !== undefined ? assignment.isActive : true,
      assignment.metadata || {},
      assignment.createdAt,
      assignment.updatedAt
    );
  }
}