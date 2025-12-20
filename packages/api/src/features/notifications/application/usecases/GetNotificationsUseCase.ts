import { notificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import type { Notification } from '../../domain/entities/Notification';

/**
 * Get Notifications Use Case
 * 
 * Retrieves notifications for a user with filtering and pagination
 */
export class GetNotificationsUseCase {
  async execute(params: {
    userId: string;
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
    unreadOnly?: boolean;
  }): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const { userId, limit = 20, offset = 0, status, type, unreadOnly } = params;

    // Get notifications
    const notifications = await notificationRepository.findByUserId(userId, {
      limit,
      offset,
      status,
      type,
      unreadOnly
    });

    // Get unread count
    const unreadCount = await notificationRepository.getUnreadCount(userId);

    // Get total count (simplified - in real app would count with filters)
    const total = notifications.length;

    return {
      notifications,
      total,
      unreadCount
    };
  }
}

/**
 * Mark Notification as Read Use Case
 */
export class MarkNotificationAsReadUseCase {
  async execute(params: {
    notificationId: string;
    userId: string;
  }): Promise<void> {
    const { notificationId, userId } = params;

    // Verify notification belongs to user
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Mark as read
    await notificationRepository.markAsRead(notificationId);
  }
}

/**
 * Mark All Notifications as Read Use Case
 */
export class MarkAllAsReadUseCase {
  async execute(params: { userId: string }): Promise<void> {
    const { userId } = params;

    await notificationRepository.markAllAsRead(userId);
  }
}

/**
 * Delete Notification Use Case
 */
export class DeleteNotificationUseCase {
  async execute(params: {
    notificationId: string;
    userId: string;
  }): Promise<void> {
    const { notificationId, userId } = params;

    // Verify notification belongs to user
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete notification
    await notificationRepository.delete(notificationId);
  }
}

/**
 * Get Notification Stats Use Case
 */
export class GetNotificationStatsUseCase {
  async execute(params: { userId: string }): Promise<{
    total: number;
    unread: number;
    byStatus: Record<string, number>;
  }> {
    const { userId } = params;

    const byStatus = await notificationRepository.countByStatus(userId);
    const unread = await notificationRepository.getUnreadCount(userId);
    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);

    return {
      total,
      unread,
      byStatus
    };
  }
}
