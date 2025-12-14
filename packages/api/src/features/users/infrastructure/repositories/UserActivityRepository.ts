import { UserActivity } from '../../domain/entities/UserActivity.entity';
import { IUserActivityRepository } from '../../domain/interfaces/IUserActivityRepository';
import {
  UserActivityNotFoundError
} from '../../domain/errors';
import { db } from '@modular-monolith/database';
import { userActivity } from '@modular-monolith/database';
import type {
  UserActivity as DBUserActivity,
  NewUserActivity
} from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from 'drizzle-orm';

// Type assertion to handle Drizzle ORM compatibility issues
const userActivityTable = userActivity as any;

export class UserActivityRepository implements IUserActivityRepository {
  async findById(id: string): Promise<UserActivity | null> {
    try {
      const result = await db.select().from(userActivityTable).where(eq(userActivityTable.id, id) as any).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserActivityRepository.findById error:', error);
      throw error;
    }
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.userId, userId) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByUserId error:', error);
      throw error;
    }
  }

  async create(activity: UserActivity): Promise<UserActivity> {
    try {
      const newActivityData: NewUserActivity = {
        userId: activity.userId,
        type: activity.type,
        action: activity.action,
        description: activity.description || null,
        resource: activity.resource || null,
        resourceId: activity.resourceId || null,
        metadata: activity.metadata || {},
        ipAddress: activity.ipAddress || null,
        userAgent: activity.userAgent || null,
        sessionId: activity.sessionId || null
      };

      const [insertedActivity] = await db.insert(userActivityTable).values(newActivityData as any).returning();

      return this.mapToDomainEntity(insertedActivity!);
    } catch (error) {
      console.error('UserActivityRepository.create error:', error);
      throw error;
    }
  }

  async update(activity: UserActivity): Promise<UserActivity> {
    try {
      const updateData = {
        userId: activity.userId,
        type: activity.type,
        action: activity.action,
        description: activity.description || null,
        resource: activity.resource || null,
        resourceId: activity.resourceId || null,
        metadata: activity.metadata || {},
        ipAddress: activity.ipAddress || null,
        userAgent: activity.userAgent || null,
        sessionId: activity.sessionId || null
      };

      const [updatedActivity] = await db
        .update(userActivityTable)
        .set(updateData as any)
        .where(eq(userActivityTable.id, activity.id) as any)
        .returning();

      if (!updatedActivity) {
        throw new UserActivityNotFoundError(`User activity with id ${activity.id} not found`);
      }

      return this.mapToDomainEntity(updatedActivity!);
    } catch (error) {
      console.error('UserActivityRepository.update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userActivityTable)
        .where(eq(userActivityTable.id, id) as any)
        .returning({ id: userActivityTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserActivityRepository.delete error:', error);
      throw error;
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userActivityTable)
        .where(eq(userActivityTable.userId, userId) as any)
        .returning({ id: userActivityTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserActivityRepository.deleteByUserId error:', error);
      throw error;
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findAll error:', error);
      throw error;
    }
  }

  async findByType(type: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.type, type) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByType error:', error);
      throw error;
    }
  }

  async findByAction(action: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.action, action) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByAction error:', error);
      throw error;
    }
  }

  async findByResource(resource: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.resource, resource) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByResource error:', error);
      throw error;
    }
  }

  async findByResourceId(resourceId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.resourceId, resourceId) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByResourceId error:', error);
      throw error;
    }
  }

  async findBySessionId(sessionId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.sessionId, sessionId) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findBySessionId error:', error);
      throw error;
    }
  }

  async findByIpAddress(ipAddress: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(eq(userActivityTable.ipAddress, ipAddress) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByIpAddress error:', error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            gte(userActivityTable.createdAt, startDate) as any,
            lte(userActivityTable.createdAt, endDate) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByDateRange error:', error);
      throw error;
    }
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          or(
            ilike(userActivityTable.type, `%${query}%`),
            ilike(userActivityTable.action, `%${query}%`),
            ilike(userActivityTable.description, `%${query}%`),
            ilike(userActivityTable.resource, `%${query}%`)
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.search error:', error);
      throw error;
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.id, id) as any)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserActivityRepository.existsById error:', error);
      throw error;
    }
  }

  async createMany(activities: UserActivity[]): Promise<UserActivity[]> {
    try {
      const activitiesData: NewUserActivity[] = activities.map(activity => ({
        userId: activity.userId,
        type: activity.type,
        action: activity.action,
        description: activity.description || null,
        resource: activity.resource || null,
        resourceId: activity.resourceId || null,
        metadata: activity.metadata || {},
        ipAddress: activity.ipAddress || null,
        userAgent: activity.userAgent || null,
        sessionId: activity.sessionId || null
      }));

      const insertedActivities = await db.insert(userActivityTable).values(activitiesData as any).returning();

      return insertedActivities.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.createMany error:', error);
      throw error;
    }
  }

  async updateMany(activities: UserActivity[]): Promise<UserActivity[]> {
    try {
      const updatePromises = activities.map(activity => this.update(activity));
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('UserActivityRepository.updateMany error:', error);
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      const result = await db
        .delete(userActivityTable)
        .where(eq(userActivityTable.id, ids) as any)
        .returning({ id: userActivityTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserActivityRepository.deleteMany error:', error);
      throw error;
    }
  }

  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const result = await db
        .delete(userActivityTable)
        .where(lte(userActivityTable.createdAt, date) as any)
        .returning({ id: userActivityTable.id });

      return result.length;
    } catch (error) {
      console.error('UserActivityRepository.deleteOlderThan error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.count error:', error);
      throw error;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.userId, userId) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByUserId error:', error);
      throw error;
    }
  }

  async countByType(type: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.type, type) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByType error:', error);
      throw error;
    }
  }

  async countByAction(action: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.action, action) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByAction error:', error);
      throw error;
    }
  }

  async countByResource(resource: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.resource, resource) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByResource error:', error);
      throw error;
    }
  }

  async countByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            gte(userActivityTable.createdAt, startDate) as any,
            lte(userActivityTable.createdAt, endDate) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByDateRange error:', error);
      throw error;
    }
  }

  async findRecentByUserId(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRecentByUserId error:', error);
      throw error;
    }
  }

  async findFailedLogins(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            eq(userActivityTable.type, 'login') as any,
            ilike(userActivityTable.description, '%failed%') as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findFailedLogins error:', error);
      throw error;
    }
  }

  async findPasswordChanges(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            eq(userActivityTable.action, 'password_change') as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findPasswordChanges error:', error);
      throw error;
    }
  }

  async findProfileUpdates(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            eq(userActivityTable.action, 'profile_update') as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findProfileUpdates error:', error);
      throw error;
    }
  }

  async findSettingsChanges(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            eq(userActivityTable.action, 'settings_change') as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSettingsChanges error:', error);
      throw error;
    }
  }

  async getActivitySummary(userId?: string, days: number = 30): Promise<{
    total: number;
    authentication: number;
    profile: number;
    settings: number;
    roles: number;
    system: number;
    security: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let result;
      if (userId) {
        result = await db
          .select({
            type: userActivityTable.type
          })
          .from(userActivityTable)
          .where(
            and(
              eq(userActivityTable.userId, userId) as any,
              gte(userActivityTable.createdAt, cutoffDate) as any
            )
          );
      } else {
        result = await db
          .select({
            type: userActivityTable.type
          })
          .from(userActivityTable)
          .where(gte(userActivityTable.createdAt, cutoffDate) as any);
      }

      const summary = {
        total: result.length,
        authentication: 0,
        profile: 0,
        settings: 0,
        roles: 0,
        system: 0,
        security: 0
      };

      // Group by type
      result.forEach(activity => {
        const type = activity.type.toLowerCase();
        if (type.includes('auth') || type.includes('login') || type.includes('logout')) {
          summary.authentication++;
        } else if (type.includes('profile')) {
          summary.profile++;
        } else if (type.includes('settings')) {
          summary.settings++;
        } else if (type.includes('role')) {
          summary.roles++;
        } else if (type.includes('system')) {
          summary.system++;
        } else if (type.includes('security')) {
          summary.security++;
        } else {
          summary.system++; // Default to system for unknown types
        }
      });

      return summary;
    } catch (error) {
      console.error('UserActivityRepository.getActivitySummary error:', error);
      throw error;
    }
  }

  // Additional required methods from interface
  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startDate) as any,
            lte(userActivityTable.createdAt, endDate) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findByUserIdAndDateRange error:', error);
      throw error;
    }
  }

  async findRecent(hours: number, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, cutoffDate) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRecent error:', error);
      throw error;
    }
  }

  async findToday(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            gte(userActivityTable.createdAt, today) as any,
            lte(userActivityTable.createdAt, tomorrow) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findToday error:', error);
      throw error;
    }
  }

  async findTodayByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, today) as any,
            lte(userActivityTable.createdAt, tomorrow) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findTodayByUserId error:', error);
      throw error;
    }
  }

  async findThisWeek(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, startOfWeek) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findThisWeek error:', error);
      throw error;
    }
  }

  async findThisWeekByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startOfWeek) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findThisWeekByUserId error:', error);
      throw error;
    }
  }

  async findThisMonth(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, startOfMonth) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findThisMonth error:', error);
      throw error;
    }
  }

  async findThisMonthByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startOfMonth) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findThisMonthByUserId error:', error);
      throw error;
    }
  }

  async findWithFilters(filters: {
    userId?: string;
    type?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    sessionId?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UserActivity[]> {
    try {
      const whereConditions = [];

      if (filters.userId) {
        whereConditions.push(eq(userActivityTable.userId, filters.userId) as any);
      }

      if (filters.type) {
        whereConditions.push(eq(userActivityTable.type, filters.type) as any);
      }

      if (filters.action) {
        whereConditions.push(eq(userActivityTable.action, filters.action) as any);
      }

      if (filters.resource) {
        whereConditions.push(eq(userActivityTable.resource, filters.resource) as any);
      }

      if (filters.resourceId) {
        whereConditions.push(eq(userActivityTable.resourceId, filters.resourceId) as any);
      }

      if (filters.sessionId) {
        whereConditions.push(eq(userActivityTable.sessionId, filters.sessionId) as any);
      }

      if (filters.ipAddress) {
        whereConditions.push(eq(userActivityTable.ipAddress, filters.ipAddress) as any);
      }

      if (filters.startDate) {
        whereConditions.push(gte(userActivityTable.createdAt, filters.startDate) as any);
      }

      if (filters.endDate) {
        whereConditions.push(lte(userActivityTable.createdAt, filters.endDate) as any);
      }

      const result = await db
        .select()
        .from(userActivityTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findWithFilters error:', error);
      throw error;
    }
  }

  async findAuthenticationActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          or(
            ilike(userActivityTable.type, '%auth%') as any,
            ilike(userActivityTable.type, '%login%') as any,
            ilike(userActivityTable.type, '%logout%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findAuthenticationActivities error:', error);
      throw error;
    }
  }

  async findAuthenticationActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            or(
              ilike(userActivityTable.type, '%auth%') as any,
              ilike(userActivityTable.type, '%login%') as any,
              ilike(userActivityTable.type, '%logout%') as any
            ) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findAuthenticationActivitiesByUserId error:', error);
      throw error;
    }
  }

  async findProfileActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.type, '%profile%') as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findProfileActivities error:', error);
      throw error;
    }
  }

  async findProfileActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            ilike(userActivityTable.type, '%profile%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findProfileActivitiesByUserId error:', error);
      throw error;
    }
  }

  async findSettingsActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.type, '%settings%') as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSettingsActivities error:', error);
      throw error;
    }
  }

  async findSettingsActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            ilike(userActivityTable.type, '%settings%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSettingsActivitiesByUserId error:', error);
      throw error;
    }
  }

  async findRoleActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.type, '%role%') as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRoleActivities error:', error);
      throw error;
    }
  }

  async findRoleActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            ilike(userActivityTable.type, '%role%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRoleActivitiesByUserId error:', error);
      throw error;
    }
  }

  async findSystemActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.type, '%system%') as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSystemActivities error:', error);
      throw error;
    }
  }

  async findSecurityActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.type, '%security%') as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSecurityActivities error:', error);
      throw error;
    }
  }

  async findSecurityActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            ilike(userActivityTable.type, '%security%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSecurityActivitiesByUserId error:', error);
      throw error;
    }
  }

  async searchByDescription(description: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(ilike(userActivityTable.description, `%${description}%`) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.searchByDescription error:', error);
      throw error;
    }
  }

  async searchByUserId(userId: string, query: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            or(
              ilike(userActivityTable.type, `%${query}%`) as any,
              ilike(userActivityTable.action, `%${query}%`) as any,
              ilike(userActivityTable.description, `%${query}%`) as any
            ) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.searchByUserId error:', error);
      throw error;
    }
  }

  async countByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startDate) as any,
            lte(userActivityTable.createdAt, endDate) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countByUserIdAndDateRange error:', error);
      throw error;
    }
  }

  async countRecent(hours: number): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, cutoffDate) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countRecent error:', error);
      throw error;
    }
  }

  async countRecentByUserId(userId: string, hours: number): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countRecentByUserId error:', error);
      throw error;
    }
  }

  async countToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            gte(userActivityTable.createdAt, today) as any,
            lte(userActivityTable.createdAt, tomorrow) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countToday error:', error);
      throw error;
    }
  }

  async countTodayByUserId(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, today) as any,
            lte(userActivityTable.createdAt, tomorrow) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countTodayByUserId error:', error);
      throw error;
    }
  }

  async countThisWeek(): Promise<number> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, startOfWeek) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countThisWeek error:', error);
      throw error;
    }
  }

  async countThisWeekByUserId(userId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startOfWeek) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countThisWeekByUserId error:', error);
      throw error;
    }
  }

  async countThisMonth(): Promise<number> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, startOfMonth) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countThisMonth error:', error);
      throw error;
    }
  }

  async countThisMonthByUserId(userId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const result = await db
        .select({ count: userActivityTable.id })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, startOfMonth) as any
          ) as any
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserActivityRepository.countThisMonthByUserId error:', error);
      throw error;
    }
  }

  async getActivityTrends(days: number): Promise<{
    date: string;
    total: number;
    authentication: number;
    profile: number;
    settings: number;
    roles: number;
    system: number;
    security: number;
  }[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await db
        .select({
          type: userActivityTable.type,
          createdAt: userActivityTable.createdAt
        })
        .from(userActivityTable)
        .where(gte(userActivityTable.createdAt, cutoffDate) as any)
        .orderBy(desc(userActivityTable.createdAt) as any);

      // Group by date and type
      const trends: Record<string, {
        total: number;
        authentication: number;
        profile: number;
        settings: number;
        roles: number;
        system: number;
        security: number;
      }> = {};

      result.forEach(activity => {
        const dateStr = activity.createdAt.toISOString().split('T')[0];
        if (!trends[dateStr]) {
          trends[dateStr] = {
            total: 0,
            authentication: 0,
            profile: 0,
            settings: 0,
            roles: 0,
            system: 0,
            security: 0
          };
        }

        trends[dateStr].total++;
        const type = activity.type.toLowerCase();
        if (type.includes('auth') || type.includes('login') || type.includes('logout')) {
          trends[dateStr].authentication++;
        } else if (type.includes('profile')) {
          trends[dateStr].profile++;
        } else if (type.includes('settings')) {
          trends[dateStr].settings++;
        } else if (type.includes('role')) {
          trends[dateStr].roles++;
        } else if (type.includes('security')) {
          trends[dateStr].security++;
        } else {
          trends[dateStr].system++;
        }
      });

      // Convert to array format
      return Object.entries(trends).map(([date, data]) => ({
        date,
        ...data
      }));
    } catch (error) {
      console.error('UserActivityRepository.getActivityTrends error:', error);
      throw error;
    }
  }

  async getTopActivities(limit: number = 10): Promise<{ action: string; count: number }[]> {
    try {
      const result = await db
        .select({
          action: userActivityTable.action,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .groupBy(userActivityTable.action)
        .orderBy(desc(userActivityTable.id) as any)
        .limit(limit);

      return result.map(row => ({
        action: row.action as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.getTopActivities error:', error);
      throw error;
    }
  }

  async getTopActivitiesByUserId(userId: string, limit: number = 10): Promise<{ action: string; count: number }[]> {
    try {
      const result = await db
        .select({
          action: userActivityTable.action,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .where(eq(userActivityTable.userId, userId) as any)
        .groupBy(userActivityTable.action)
        .orderBy(desc(userActivityTable.id) as any)
        .limit(limit);

      return result.map(row => ({
        action: row.action as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.getTopActivitiesByUserId error:', error);
      throw error;
    }
  }

  async getTopResources(limit: number = 10): Promise<{ resource: string; count: number }[]> {
    try {
      const result = await db
        .select({
          resource: userActivityTable.resource,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .where(isNotNull(userActivityTable.resource) as any)
        .groupBy(userActivityTable.resource)
        .orderBy(desc(userActivityTable.id) as any)
        .limit(limit);

      return result.map(row => ({
        resource: row.resource as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.getTopResources error:', error);
      throw error;
    }
  }

  async getTopResourcesByUserId(userId: string, limit: number = 10): Promise<{ resource: string; count: number }[]> {
    try {
      const result = await db
        .select({
          resource: userActivityTable.resource,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            isNotNull(userActivityTable.resource) as any
          ) as any
        )
        .groupBy(userActivityTable.resource)
        .orderBy(desc(userActivityTable.id) as any)
        .limit(limit);

      return result.map(row => ({
        resource: row.resource as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.getTopResourcesByUserId error:', error);
      throw error;
    }
  }

  async getUserActivityPatterns(userId: string, days: number = 30): Promise<{
    hourOfDay: { hour: number; count: number }[];
    dayOfWeek: { day: number; count: number }[];
    mostActiveHour: number;
    mostActiveDay: number;
    averageActivitiesPerDay: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await db
        .select({
          createdAt: userActivityTable.createdAt
        })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        );

      const patterns = {
        hourOfDay: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 })),
        dayOfWeek: Array.from({ length: 7 }, (_, day) => ({ day, count: 0 })),
        mostActiveHour: 0,
        mostActiveDay: 0,
        averageActivitiesPerDay: result.length / days
      };

      result.forEach(activity => {
        const date = new Date(activity.createdAt);
        const hour = date.getHours();
        const day = date.getDay();

        patterns.hourOfDay[hour].count++;
        patterns.dayOfWeek[day].count++;
      });

      // Find most active hour and day
      patterns.mostActiveHour = patterns.hourOfDay.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      ).hour;

      patterns.mostActiveDay = patterns.dayOfWeek.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      ).day;

      return patterns;
    } catch (error) {
      console.error('UserActivityRepository.getUserActivityPatterns error:', error);
      throw error;
    }
  }

  async findSuspiciousActivities(limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      // Look for activities with suspicious patterns
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          or(
            ilike(userActivityTable.description, '%failed%') as any,
            ilike(userActivityTable.description, '%suspicious%') as any,
            ilike(userActivityTable.description, '%blocked%') as any,
            ilike(userActivityTable.action, '%failed%') as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSuspiciousActivities error:', error);
      throw error;
    }
  }

  async findSuspiciousActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserActivity[]> {
    try {
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            or(
              ilike(userActivityTable.description, '%failed%') as any,
              ilike(userActivityTable.description, '%suspicious%') as any,
              ilike(userActivityTable.description, '%blocked%') as any,
              ilike(userActivityTable.action, '%failed%') as any
            ) as any
          ) as any
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findSuspiciousActivitiesByUserId error:', error);
      throw error;
    }
  }

  async findFailedLoginAttempts(userId?: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      let result;
      if (userId) {
        result = await db
          .select()
          .from(userActivityTable)
          .where(
            and(
              eq(userActivityTable.userId, userId) as any,
              eq(userActivityTable.action, 'login_failed') as any,
              gte(userActivityTable.createdAt, cutoffDate) as any
            ) as any
          );
      } else {
        result = await db
          .select()
          .from(userActivityTable)
          .where(
            and(
              eq(userActivityTable.action, 'login_failed') as any,
              gte(userActivityTable.createdAt, cutoffDate) as any
            ) as any
          );
      }

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findFailedLoginAttempts error:', error);
      throw error;
    }
  }

  async findMultipleIpAddresses(userId: string, hours: number = 24): Promise<{ ipAddress: string; count: number }[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select({
          ipAddress: userActivityTable.ipAddress,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            isNotNull(userActivityTable.ipAddress) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .groupBy(userActivityTable.ipAddress)
        .orderBy(desc(userActivityTable.id) as any);

      return result.map(row => ({
        ipAddress: row.ipAddress as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.findMultipleIpAddresses error:', error);
      throw error;
    }
  }

  async findUnusualLoginTimes(userId: string, days: number = 30): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Find login activities outside normal hours (e.g., before 6 AM or after 10 PM)
      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            eq(userActivityTable.action, 'login') as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        );

      // Filter for unusual hours in application logic
      const unusualActivities = result.filter(activity => {
        const hour = new Date(activity.createdAt).getHours();
        return hour < 6 || hour > 22;
      });

      return unusualActivities.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findUnusualLoginTimes error:', error);
      throw error;
    }
  }

  async deleteByUserIdOlderThan(userId: string, date: Date): Promise<number> {
    try {
      const result = await db
        .delete(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            lte(userActivityTable.createdAt, date) as any
          ) as any
        )
        .returning({ id: userActivityTable.id });

      return result.length;
    } catch (error) {
      console.error('UserActivityRepository.deleteByUserIdOlderThan error:', error);
      throw error;
    }
  }

  async getActivityCountsByUser(userIds: string[], days: number = 30): Promise<{ userId: string; count: number }[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await db
        .select({
          userId: userActivityTable.userId,
          count: userActivityTable.id
        })
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userIds) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .groupBy(userActivityTable.userId);

      return result.map(row => ({
        userId: row.userId as string,
        count: row.count as number
      }));
    } catch (error) {
      console.error('UserActivityRepository.getActivityCountsByUser error:', error);
      throw error;
    }
  }

  async getLastActivityDates(userIds: string[]): Promise<{ userId: string; lastActivity: Date }[]> {
    try {
      const result = await db
        .select({
          userId: userActivityTable.userId,
          lastActivity: userActivityTable.createdAt
        })
        .from(userActivityTable)
        .where(eq(userActivityTable.userId, userIds) as any)
        .groupBy(userActivityTable.userId)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(row => ({
        userId: row.userId as string,
        lastActivity: new Date(row.lastActivity)
      }));
    } catch (error) {
      console.error('UserActivityRepository.getLastActivityDates error:', error);
      throw error;
    }
  }

  async exportActivities(filters: {
    userId?: string;
    type?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  }): Promise<string> {
    try {
      const whereConditions = [];

      if (filters.userId) {
        whereConditions.push(eq(userActivityTable.userId, filters.userId) as any);
      }

      if (filters.type) {
        whereConditions.push(eq(userActivityTable.type, filters.type) as any);
      }

      if (filters.action) {
        whereConditions.push(eq(userActivityTable.action, filters.action) as any);
      }

      if (filters.startDate) {
        whereConditions.push(gte(userActivityTable.createdAt, filters.startDate) as any);
      }

      if (filters.endDate) {
        whereConditions.push(lte(userActivityTable.createdAt, filters.endDate) as any);
      }

      const result = await db
        .select()
        .from(userActivityTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .orderBy(desc(userActivityTable.createdAt) as any);

      // For simplicity, return JSON string (in real implementation, might write to file)
      if (filters.format === 'csv') {
        // Convert to CSV format
        const headers = ['id', 'userId', 'type', 'action', 'description', 'resource', 'resourceId', 'ipAddress', 'createdAt'];
        const csvRows = [
          headers.join(','),
          ...result.map(activity => [
            activity.id,
            activity.userId,
            activity.type,
            activity.action,
            activity.description || '',
            activity.resource || '',
            activity.resourceId || '',
            activity.ipAddress || '',
            activity.createdAt.toISOString()
          ].join(','))
        ];
        return csvRows.join('\n');
      } else {
        // Return JSON
        return JSON.stringify(result, null, 2);
      }
    } catch (error) {
      console.error('UserActivityRepository.exportActivities error:', error);
      throw error;
    }
  }

  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userActivityTable.id })
        .from(userActivityTable)
        .where(eq(userActivityTable.userId, userId) as any)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserActivityRepository.existsByUserId error:', error);
      throw error;
    }
  }

  async findRecentActivitiesForResource(resourceId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.resourceId, resourceId) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRecentActivitiesForResource error:', error);
      throw error;
    }
  }

  async findRecentActivitiesForUser(userId: string, hours: number = 24, limit: number = 50): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userActivityTable)
        .where(
          and(
            eq(userActivityTable.userId, userId) as any,
            gte(userActivityTable.createdAt, cutoffDate) as any
          ) as any
        )
        .limit(limit)
        .orderBy(desc(userActivityTable.createdAt) as any);

      return result.map(activity => this.mapToDomainEntity(activity));
    } catch (error) {
      console.error('UserActivityRepository.findRecentActivitiesForUser error:', error);
      throw error;
    }
  }

  // Private helper methods
  private mapToDomainEntity(activity: any): UserActivity {
    return new UserActivity(
      activity.id,
      activity.userId,
      activity.type,
      activity.action,
      activity.description || undefined,
      activity.resource || undefined,
      activity.resourceId || undefined,
      activity.metadata || {},
      activity.ipAddress || undefined,
      activity.userAgent || undefined,
      activity.sessionId || undefined,
      activity.createdAt,
      activity.updatedAt || activity.createdAt,
    );
  }
}