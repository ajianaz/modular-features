import { eq, and, desc, asc, or, sql, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../db';
import { notifications, notificationDeliveries, notificationRecipients } from '../../domain/entities/Notification';
import type { Notification, NewNotification } from '../../domain/entities/Notification';

/**
 * Notification Repository
 * 
 * Handles all database operations for notifications
 */
export class NotificationRepository {
  private db = db;

  /**
   * Create a new notification
   */
  async create(data: NewNotification): Promise<Notification> {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    
    return notification;
  }

  /**
   * Create multiple notifications (bulk)
   */
  async createMany(data: NewNotification[]): Promise<Notification[]> {
    const result = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    
    return result;
  }

  /**
   * Find notification by ID
   */
  async findById(id: string): Promise<Notification | null> {
    const [notification] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    
    return notification || null;
  }

  /**
   * Find notifications by user ID
   */
  async findByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    const { limit = 50, offset = 0, status, type, unreadOnly } = options || {};

    const conditions = [];
    
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }
    
    if (status) {
      conditions.push(eq(notifications.status, status));
    }
    
    if (type) {
      conditions.push(eq(notifications.type, type));
    }
    
    if (unreadOnly) {
      conditions.push(sql`${notifications.readAt} IS NULL`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  /**
   * Find scheduled notifications that need to be sent
   */
  async findScheduledToSend(): Promise<Notification[]> {
    const now = new Date();

    const result = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, 'pending'),
          sql`${notifications.scheduledFor} IS NOT NULL`,
          lte(notifications.scheduledFor, now)
        )
      )
      .orderBy(asc(notifications.scheduledFor))
      .limit(100);

    return result;
  }

  /**
   * Find notifications that need retry
   */
  async findFailedToRetry(maxRetries: number = 3): Promise<Notification[]> {
    const result = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, 'failed'),
          sql`${notifications.retryCount} < ${notifications.maxRetries}`,
          lte(notifications.retryCount, maxRetries)
        )
      )
      .orderBy(asc(notifications.createdAt))
      .limit(50);

    return result;
  }

  /**
   * Update notification
   */
  async update(id: string, data: Partial<NewNotification>): Promise<Notification | null> {
    const [notification] = await this.db
      .update(notifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();

    return notification || null;
  }

  /**
   * Update notification status
   */
  async updateStatus(id: string, status: string, metadata?: Record<string, any>): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'failed') {
      updateData.retryCount = sql`${notifications.retryCount} + 1`;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    await this.db
      .update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id));
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(notifications.id, id));
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.readAt} IS NULL`
        )
      );
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id));

    return result.rowCount > 0;
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOlderThan(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.db
      .delete(notifications)
      .where(
        and(
          lte(notifications.createdAt, cutoffDate),
          inArray(notifications.status, ['delivered', 'cancelled', 'failed'])
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Count notifications by status for a user
   */
  async countByStatus(userId: string): Promise<Record<string, number>> {
    const result = await this.db
      .select({
        status: notifications.status,
        count: sql<number>`COUNT(*)`.mapWith(Number)
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .groupBy(notifications.status);

    const counts: Record<string, number> = {};
    for (const row of result) {
      counts[row.status] = row.count;
    }

    return counts;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.readAt} IS NULL`
        )
      );

    return result[0]?.count || 0;
  }

  /**
   * Search notifications
   */
  async search(query: string, userId?: string, limit: number = 20): Promise<Notification[]> {
    const conditions = [
      sql`${notifications.title} ILIKE ${`%${query}%`}`,
      sql`${notifications.message} ILIKE ${`%${query}%`}`
    ];

    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    const result = await this.db
      .select()
      .from(notifications)
      .where(or(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Get notifications by date range
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      userId?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<Notification[]> {
    const { userId, status, limit = 100 } = options || {};

    const conditions = [
      gte(notifications.createdAt, startDate),
      lte(notifications.createdAt, endDate)
    ];

    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    if (status) {
      conditions.push(eq(notifications.status, status));
    }

    const result = await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Get notifications with delivery info
   */
  async findByIdWithDelivery(id: string): Promise<(Notification & { deliveries: any[] }) | null> {
    const notification = await this.findById(id);
    
    if (!notification) {
      return null;
    }

    const deliveries = await this.db
      .select()
      .from(notificationDeliveries)
      .where(eq(notificationDeliveries.notificationId, id));

    return {
      ...notification,
      deliveries
    };
  }
}

// Export singleton instance
export const notificationRepository = new NotificationRepository();
