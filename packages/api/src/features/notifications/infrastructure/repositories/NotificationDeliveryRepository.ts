import { eq, and, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../db';
import { notificationDeliveries } from '../../domain/entities/Notification';
import type { NotificationDelivery, NewNotificationDelivery } from '../../domain/entities/Notification';

/**
 * Notification Delivery Repository
 * 
 * Tracks delivery attempts per channel
 */
export class NotificationDeliveryRepository {
  private db = db;

  /**
   * Create delivery record
   */
  async create(data: NewNotificationDelivery): Promise<NotificationDelivery> {
    const [delivery] = await this.db
      .insert(notificationDeliveries)
      .values(data)
      .returning();

    return delivery;
  }

  /**
   * Find deliveries by notification ID
   */
  async findByNotificationId(notificationId: string): Promise<NotificationDelivery[]> {
    const result = await this.db
      .select()
      .from(notificationDeliveries)
      .where(eq(notificationDeliveries.notificationId, notificationId))
      .orderBy(desc(notificationDeliveries.createdAt));

    return result;
  }

  /**
   * Find deliveries by status
   */
  async findByStatus(status: string, limit: number = 50): Promise<NotificationDelivery[]> {
    const result = await this.db
      .select()
      .from(notificationDeliveries)
      .where(eq(notificationDeliveries.status, status))
      .orderBy(asc(notificationDeliveries.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Update delivery status
   */
  async updateStatus(
    id: string,
    status: string,
    metadata?: {
      sentAt?: Date;
      deliveredAt?: Date;
      openedAt?: Date;
      clickedAt?: Date;
      errorMessage?: string;
      providerMessageId?: string;
    }
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (metadata?.sentAt) updateData.sentAt = metadata.sentAt;
    if (metadata?.deliveredAt) updateData.deliveredAt = metadata.deliveredAt;
    if (metadata?.openedAt) updateData.openedAt = metadata.openedAt;
    if (metadata?.clickedAt) updateData.clickedAt = metadata.clickedAt;
    if (metadata?.errorMessage) updateData.errorMessage = metadata.errorMessage;
    if (metadata?.providerMessageId) updateData.providerMessageId = metadata.providerMessageId;

    await this.db
      .update(notificationDeliveries)
      .set(updateData)
      .where(eq(notificationDeliveries.id, id));
  }

  /**
   * Mark delivery as delivered
   */
  async markAsDelivered(id: string, providerMessageId?: string): Promise<void> {
    await this.updateStatus(id, 'delivered', {
      deliveredAt: new Date(),
      providerMessageId
    });
  }

  /**
   * Mark delivery as opened
   */
  async markAsOpened(id: string): Promise<void> {
    await this.updateStatus(id, 'delivered', {
      openedAt: new Date()
    });
  }

  /**
   * Mark delivery as clicked
   */
  async markAsClicked(id: string): Promise<void> {
    await this.updateStatus(id, 'delivered', {
      clickedAt: new Date()
    });
  }

  /**
   * Mark delivery as failed
   */
  async markAsFailed(id: string, errorMessage: string): Promise<void> {
    const delivery = await this.findById(id);
    
    await this.db
      .update(notificationDeliveries)
      .set({
        status: 'failed',
        errorMessage,
        failedAt: new Date(),
        retryCount: (delivery?.retryCount || 0) + 1,
        nextRetryAt: this.calculateNextRetry((delivery?.retryCount || 0) + 1),
        updatedAt: new Date()
      })
      .where(eq(notificationDeliveries.id, id));
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetry(retryCount: number): Date {
    const delays = [1, 5, 15, 30, 60]; // minutes
    const delay = delays[Math.min(retryCount - 1, delays.length - 1)] || 60;
    
    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + delay);
    
    return nextRetry;
  }

  /**
   * Find deliveries ready for retry
   */
  async findReadyForRetry(): Promise<NotificationDelivery[]> {
    const now = new Date();

    const result = await this.db
      .select()
      .from(notificationDeliveries)
      .where(
        and(
          eq(notificationDeliveries.status, 'failed'),
          sql`${notificationDeliveries.nextRetryAt} IS NOT NULL`,
          sql`${notificationDeliveries.retryCount} < ${notificationDeliveries.maxRetries}`,
          lte(notificationDeliveries.nextRetryAt, now)
        )
      )
      .orderBy(asc(notificationDeliveries.nextRetryAt))
      .limit(50);

    return result;
  }

  /**
   * Get delivery statistics for notification
   */
  async getStats(notificationId: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  }> {
    const deliveries = await this.findByNotificationId(notificationId);

    return {
      total: deliveries.length,
      sent: deliveries.filter(d => d.status === 'sent').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      opened: deliveries.filter(d => d.openedAt !== null).length,
      clicked: deliveries.filter(d => d.clickedAt !== null).length
    };
  }

  /**
   * Find delivery by ID
   */
  async findById(id: string): Promise<NotificationDelivery | null> {
    const [delivery] = await this.db
      .select()
      .from(notificationDeliveries)
      .where(eq(notificationDeliveries.id, id))
      .limit(1);

    return delivery || null;
  }

  /**
   * Delete old delivery records
   */
  async deleteOlderThan(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.db
      .delete(notificationDeliveries)
      .where(
        and(
          lte(notificationDeliveries.createdAt, cutoffDate),
          inArray(notificationDeliveries.status, ['delivered', 'failed'])
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Get delivery analytics by date range
   */
  async getAnalyticsByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      channel?: string;
      status?: string;
    }
  ): Promise<any[]> {
    const { channel, status } = options || {};

    const conditions = [
      gte(notificationDeliveries.createdAt, startDate),
      lte(notificationDeliveries.createdAt, endDate)
    ];

    if (channel) {
      conditions.push(eq(notificationDeliveries.channel, channel));
    }

    if (status) {
      conditions.push(eq(notificationDeliveries.status, status));
    }

    const result = await this.db
      .select({
        channel: notificationDeliveries.channel,
        status: notificationDeliveries.status,
        count: sql<number>`COUNT(*)`.mapWith(Number),
        sentDate: sql<string>`DATE(${notificationDeliveries.sentAt})`
      })
      .from(notificationDeliveries)
      .where(and(...conditions))
      .groupBy(notificationDeliveries.channel, notificationDeliveries.status, sql`DATE(${notificationDeliveries.sentAt})`)
      .orderBy(desc(sql`DATE(${notificationDeliveries.sentAt})`));

    return result;
  }
}

// Export singleton instance
export const notificationDeliveryRepository = new NotificationDeliveryRepository();
