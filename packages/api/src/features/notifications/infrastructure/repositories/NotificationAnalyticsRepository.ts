import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { notificationAnalytics } from '../../domain/entities/Notification';
import type { NotificationAnalytics, NewNotificationAnalytics } from '../../domain/entities/Notification';

/**
 * Notification Analytics Repository
 * 
 * Tracks notification performance metrics
 */
export class NotificationAnalyticsRepository {
  private db = db;

  /**
   * Create analytics record
   */
  async create(data: NewNotificationAnalytics): Promise<NotificationAnalytics> {
    const [analytics] = await this.db
      .insert(notificationAnalytics)
      .values(data)
      .returning();

    return analytics;
  }

  /**
   * Find analytics by notification ID
   */
  async findByNotificationId(notificationId: string): Promise<NotificationAnalytics[]> {
    const result = await this.db
      .select()
      .from(notificationAnalytics)
      .where(eq(notificationAnalytics.notificationId, notificationId))
      .orderBy(desc(notificationAnalytics.createdAt));

    return result;
  }

  /**
   * Find analytics by type
   */
  async findByType(type: string, limit: number = 100): Promise<NotificationAnalytics[]> {
    const result = await this.db
      .select()
      .from(notificationAnalytics)
      .where(eq(notificationAnalytics.type, type))
      .orderBy(desc(notificationAnalytics.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Get delivery rate metrics
   */
  async getDeliveryRate(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalDelivered: number;
    deliveryRate: number;
    totalFailed: number;
    failureRate: number;
  }> {
    const result = await this.db
      .select({
        sent: sql<number>`SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END)`.mapWith(Number),
        delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`.mapWith(Number),
        failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`.mapWith(Number),
        total: sql<number>`COUNT(*)`.mapWith(Number)
      })
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.type, 'delivery'),
          gte(notificationAnalytics.createdAt, startDate),
          lte(notificationAnalytics.createdAt, endDate)
        )
      );

    const row = result[0];
    const total = row.total || 0;

    return {
      totalSent: row.sent || 0,
      totalDelivered: row.delivered || 0,
      deliveryRate: total > 0 ? ((row.delivered || 0) / total * 100) : 0,
      totalFailed: row.failed || 0,
      failureRate: total > 0 ? ((row.failed || 0) / total * 100) : 0
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagementRate(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalOpened: number;
    openRate: number;
    totalClicked: number;
    clickRate: number;
  }> {
    const result = await this.db
      .select({
        sent: sql<number>`SUM(CASE WHEN metric = 'sent' THEN count ELSE 0 END)`.mapWith(Number),
        opened: sql<number>`SUM(CASE WHEN metric = 'opened' THEN count ELSE 0 END)`.mapWith(Number),
        clicked: sql<number>`SUM(CASE WHEN metric = 'clicked' THEN count ELSE 0 END)`.mapWith(Number),
        total: sql<number>`SUM(count)`.mapWith(Number)
      })
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.type, 'engagement'),
          gte(notificationAnalytics.createdAt, startDate),
          lte(notificationAnalytics.createdAt, endDate)
        )
      );

    const row = result[0];
    const sent = row.sent || 0;

    return {
      totalSent: sent,
      totalOpened: row.opened || 0,
      openRate: sent > 0 ? ((row.opened || 0) / sent * 100) : 0,
      totalClicked: row.clicked || 0,
      clickRate: sent > 0 ? ((row.clicked || 0) / sent * 100) : 0
    };
  }

  /**
   * Get error metrics
   */
  async getErrorMetrics(startDate: Date, endDate: Date): Promise<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    topErrors: Array<{ error: string; count: number }>;
  }> {
    const result = await this.db
      .select({
        metric: notificationAnalytics.metric,
        total: sql<number>`SUM(count)`.mapWith(Number)
      })
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.type, 'error'),
          gte(notificationAnalytics.createdAt, startDate),
          lte(notificationAnalytics.createdAt, endDate)
        )
      )
      .groupBy(notificationAnalytics.metric)
      .orderBy(desc(sql`SUM(count)`))
      .limit(10);

    const totalErrors = result.reduce((sum, row) => sum + row.total, 0);
    const errorsByType: Record<string, number> = {};
    
    for (const row of result) {
      errorsByType[row.metric] = row.total;
    }

    return {
      totalErrors,
      errorsByType,
      topErrors: result.map(row => ({ error: row.metric, count: row.total }))
    };
  }

  /**
   * Get metrics by date
   */
  async getMetricsByDate(
    startDate: Date,
    endDate: Date,
    metric: string,
    period: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ date: string; value: number }>> {
    const dateFormat = period === 'hour' ? 'YYYY-MM-DD HH24:00:00' : 
                       period === 'day' ? 'YYYY-MM-DD' :
                       period === 'week' ? 'IYYY-"W"IW' : 'YYYY-MM';

    const result = await this.db
      .select({
        date: sql<string>`TO_CHAR(${notificationAnalytics.createdAt}, '${dateFormat}')`,
        value: sql<number>`SUM(${notificationAnalytics.count})`.mapWith(Number)
      })
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.metric, metric),
          gte(notificationAnalytics.createdAt, startDate),
          lte(notificationAnalytics.createdAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${notificationAnalytics.createdAt}, '${dateFormat}')`)
      .orderBy(sql`TO_CHAR(${notificationAnalytics.createdAt}, '${dateFormat}')`);

    return result;
  }

  /**
   * Record metric
   */
  async recordMetric(
    notificationId: string,
    type: 'delivery' | 'engagement' | 'error',
    metric: string,
    value: number,
    period: string = 'day',
    metadata?: Record<string, any>
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now);
    const periodEnd = new Date(now);

    // Set period boundaries
    switch (period) {
      case 'hour':
        periodStart.setMinutes(0, 0, 0);
        periodEnd.setMinutes(59, 59, 999);
        break;
      case 'day':
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = periodStart.getDay();
        periodStart.setHours(0, 0, 0, 0);
        periodStart.setDate(periodStart.getDate() - dayOfWeek);
        periodEnd.setHours(23, 59, 59, 999);
        periodEnd.setDate(periodEnd.getDate() + (6 - dayOfWeek));
        break;
      case 'month':
        periodStart.setHours(0, 0, 0, 0);
        periodStart.setDate(1);
        periodEnd.setHours(23, 59, 59, 999);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);
        break;
    }

    // Check if record exists
    const [existing] = await this.db
      .select()
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.notificationId, notificationId),
          eq(notificationAnalytics.type, type),
          eq(notificationAnalytics.metric, metric),
          eq(notificationAnalytics.period, period),
          gte(notificationAnalytics.createdAt, periodStart),
          lte(notificationAnalytics.createdAt, periodEnd)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing
      await this.db
        .update(notificationAnalytics)
        .set({
          value: String(value),
          count: existing.count + 1,
          updatedAt: new Date()
        })
        .where(eq(notificationAnalytics.id, existing.id));
    } else {
      // Create new
      await this.db
        .insert(notificationAnalytics)
        .values({
          notificationId,
          type,
          metric,
          value: String(value),
          count: 1,
          period,
          periodStart,
          periodEnd,
          metadata,
          createdAt: now,
          updatedAt: now
        });
    }
  }

  /**
   * Delete old analytics records
   */
  async deleteOlderThan(days: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.db
      .delete(notificationAnalytics)
      .where(lte(notificationAnalytics.createdAt, cutoffDate));

    return result.rowCount || 0;
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(days: number = 7): Promise<{
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    topChannels: Array<{ channel: string; count: number }>;
    trend: Array<{ date: string; sent: number; delivered: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Get totals
    const deliveryMetrics = await this.getDeliveryRate(startDate, endDate);
    const engagementMetrics = await this.getEngagementRate(startDate, endDate);

    // Get trend data
    const trendResult = await this.db
      .select({
        date: sql<string>`DATE(${notificationAnalytics.createdAt})`,
        sent: sql<number>`SUM(CASE WHEN metric = 'sent' THEN count ELSE 0 END)`.mapWith(Number),
        delivered: sql<number>`SUM(CASE WHEN metric = 'delivered' THEN count ELSE 0 END)`.mapWith(Number)
      })
      .from(notificationAnalytics)
      .where(
        and(
          eq(notificationAnalytics.type, 'delivery'),
          gte(notificationAnalytics.createdAt, startDate),
          lte(notificationAnalytics.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${notificationAnalytics.createdAt})`)
      .orderBy(sql`DATE(${notificationAnalytics.createdAt})`);

    return {
      totalSent: deliveryMetrics.totalSent,
      deliveryRate: deliveryMetrics.deliveryRate,
      openRate: engagementMetrics.openRate,
      clickRate: engagementMetrics.clickRate,
      topChannels: [], // Would need additional query
      trend: trendResult
    };
  }
}

// Export singleton instance
export const notificationAnalyticsRepository = new NotificationAnalyticsRepository();
