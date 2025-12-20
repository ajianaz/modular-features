import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { notificationPreferences } from '../../domain/entities/Notification';
import type { NotificationPreference, NewNotificationPreference } from '../../domain/entities/Notification';

/**
 * Notification Preference Repository
 * 
 * Handles user notification preferences
 */
export class NotificationPreferenceRepository {
  private db = db;

  /**
   * Get user preferences
   */
  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    const result = await this.db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .orderBy(desc(notificationPreferences.createdAt));

    return result;
  }

  /**
   * Get user preference by category
   */
  async findByUserIdAndCategory(userId: string, category: string): Promise<NotificationPreference | null> {
    const [preference] = await this.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.category, category)
        )
      )
      .limit(1);

    return preference || null;
  }

  /**
   * Upsert preference
   */
  async upsert(data: NewNotificationPreference): Promise<NotificationPreference> {
    const existing = await this.findByUserIdAndCategory(data.userId, data.category);

    if (existing) {
      const [updated] = await this.db
        .update(notificationPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(notificationPreferences.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(notificationPreferences)
      .values(data)
      .returning();

    return created;
  }

  /**
   * Set user default preferences
   */
  async setDefaults(userId: string): Promise<void> {
    const defaults = [
      {
        userId,
        category: 'general',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        frequency: 'immediate'
      },
      {
        userId,
        category: 'marketing',
        emailEnabled: false,
        pushEnabled: false,
        smsEnabled: false,
        inAppEnabled: false,
        frequency: 'daily'
      },
      {
        userId,
        category: 'security',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate'
      }
    ];

    await this.db.insert(notificationPreferences).values(defaults);
  }

  /**
   * Check if user has enabled channel for category
   */
  async isChannelEnabled(userId: string, category: string, channel: 'email' | 'push' | 'sms' | 'in_app'): Promise<boolean> {
    const preference = await this.findByUserIdAndCategory(userId, category);

    if (!preference) {
      // Default to true for general notifications
      return category === 'general';
    }

    switch (channel) {
      case 'email':
        return preference.emailEnabled;
      case 'push':
        return preference.pushEnabled;
      case 'sms':
        return preference.smsEnabled;
      case 'in_app':
        return preference.inAppEnabled;
      default:
        return true;
    }
  }

  /**
   * Delete user preferences
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
  }
}

// Export singleton instance
export const notificationPreferenceRepository = new NotificationPreferenceRepository();
