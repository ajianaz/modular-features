import { INotificationScheduler } from '../../../domain/interfaces/INotificationScheduler';
import { Notification } from '../../../domain/entities/Notification.entity';

/**
 * Notification Scheduler Service Implementation
 *
 * This service handles scheduling of notifications for future delivery.
 * It manages the timing and processing of scheduled notifications.
 */
export class NotificationScheduler implements INotificationScheduler {
  private readonly scheduledNotifications: Map<string, Notification> = new Map();
  private readonly processingQueue: Set<string> = new Set();

  async schedule(notification: Notification, scheduledFor: Date): Promise<void> {
    try {
      // Validate that the scheduled time is in the future
      if (scheduledFor <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Update the notification with scheduled time
      const scheduledNotification = new Notification(
        notification.id,
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.channels,
        notification.status,
        notification.priority,
        notification.templateId,
        scheduledFor,
        notification.sentAt,
        notification.deliveredAt,
        notification.readAt,
        notification.expiresAt,
        notification.metadata,
        notification.deliveryData,
        notification.retryCount,
        notification.maxRetries,
        notification.lastError,
        notification.createdAt,
        new Date()
      );

      // Store the scheduled notification
      this.scheduledNotifications.set(notification.id, scheduledNotification);

      // In a real implementation, this would store in database
      console.log(`Notification ${notification.id} scheduled for ${scheduledFor.toISOString()}`);
    } catch (error) {
      throw new Error(`Failed to schedule notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancel(notificationId: string): Promise<void> {
    try {
      // Remove from scheduled notifications
      this.scheduledNotifications.delete(notificationId);

      // Remove from processing queue if it's there
      this.processingQueue.delete(notificationId);

      // In a real implementation, this would update the database
      console.log(`Notification ${notificationId} cancelled`);
    } catch (error) {
      throw new Error(`Failed to cancel notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getScheduledNotifications(): Promise<Notification[]> {
    try {
      const now = new Date();
      const readyNotifications: Notification[] = [];

      // Get all notifications that are scheduled and ready to be sent
      for (const notification of this.scheduledNotifications.values()) {
        if (notification.scheduledFor && notification.scheduledFor <= now) {
          readyNotifications.push(notification);
        }
      }

      return readyNotifications;
    } catch (error) {
      throw new Error(`Failed to get scheduled notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const notificationsToProcess: Notification[] = [];

      // Find notifications ready to be processed
      for (const notification of this.scheduledNotifications.values()) {
        if (
          notification.scheduledFor &&
          notification.scheduledFor <= now &&
          notification.status === 'pending' &&
          !this.processingQueue.has(notification.id)
        ) {
          notificationsToProcess.push(notification);
          this.processingQueue.add(notification.id);
        }
      }

      // Process each notification
      for (const notification of notificationsToProcess) {
        try {
          // Mark as processing
          const processingNotification = notification.markAsProcessing();
          this.scheduledNotifications.set(notification.id, processingNotification);

          // In a real implementation, this would trigger the notification sending process
          console.log(`Processing scheduled notification ${notification.id}`);

          // Mark as sent (mock implementation)
          const sentNotification = processingNotification.markAsSent();
          this.scheduledNotifications.set(notification.id, sentNotification);

          // Remove from processing queue
          this.processingQueue.delete(notification.id);

          // Remove from scheduled if it's not recurring
          if (!notification.metadata?.recurring) {
            this.scheduledNotifications.delete(notification.id);
          }
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);

          // Mark as failed
          const failedNotification = notification.markAsFailed(
            error instanceof Error ? error.message : 'Unknown error'
          );
          this.scheduledNotifications.set(notification.id, failedNotification);

          // Remove from processing queue
          this.processingQueue.delete(notification.id);
        }
      }
    } catch (error) {
      throw new Error(`Failed to process scheduled notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if the scheduler is operational
      // In a real implementation, this might check database connectivity, etc.
      return true;
    } catch (error) {
      return false;
    }
  }

  // Private helper methods
  private isNotificationReady(notification: Notification): boolean {
    const now = new Date();

    // Check if notification is ready to be sent
    return !!(
      notification.scheduledFor &&
      notification.scheduledFor <= now &&
      notification.status === 'pending' &&
      !notification.isExpired() &&
      !this.processingQueue.has(notification.id)
    );
  }

  private async sendNotification(notification: Notification): Promise<void> {
    // In a real implementation, this would delegate to the appropriate providers
    console.log(`Sending notification ${notification.id} via ${notification.channels.join(', ')}`);

    // Mock sending - mark as sent
    const sentNotification = notification.markAsSent();
    this.scheduledNotifications.set(notification.id, sentNotification);
  }

  private cleanupExpiredNotifications(): void {
    const now = new Date();
    const expiredNotifications: string[] = [];

    // Find expired notifications
    for (const [id, notification] of this.scheduledNotifications.entries()) {
      if (notification.isExpired()) {
        expiredNotifications.push(id);
      }
    }

    // Remove expired notifications
    expiredNotifications.forEach(id => {
      this.scheduledNotifications.delete(id);
      this.processingQueue.delete(id);
    });
  }

  private validateNotification(notification: Notification): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!notification.title || notification.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!notification.message || notification.message.trim().length === 0) {
      errors.push('Message is required');
    }

    if (notification.channels.length === 0) {
      errors.push('At least one channel is required');
    }

    // Validate scheduled time
    if (notification.scheduledFor && notification.scheduledFor <= new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility methods for monitoring and management
  getSchedulerStats(): {
    total: number;
    pending: number;
    processing: number;
    scheduled: number;
  } {
    const now = new Date();
    let pending = 0;
    let processing = 0;
    let scheduled = 0;

    for (const notification of this.scheduledNotifications.values()) {
      if (notification.status === 'pending') {
        if (notification.scheduledFor && notification.scheduledFor > now) {
          scheduled++;
        } else {
          pending++;
        }
      } else if (notification.status === 'processing') {
        processing++;
      }
    }

    return {
      total: this.scheduledNotifications.size,
      pending,
      processing,
      scheduled
    };
  }

  // Cleanup method for testing
  clear(): void {
    this.scheduledNotifications.clear();
    this.processingQueue.clear();
  }
}