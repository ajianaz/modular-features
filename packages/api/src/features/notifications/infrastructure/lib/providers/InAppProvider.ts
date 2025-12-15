import { IInAppProvider, INotificationProvider } from '../../../domain/interfaces';
import { Notification } from '../../../domain/entities/Notification.entity';
import { NotificationChannel, InAppOptions, NotificationDeliveryResult } from '../../../domain/types';

/**
 * In-App Notification Provider Implementation
 *
 * This provider implements in-app notification functionality.
 * It stores notifications in the application database for retrieval by clients.
 */
export class InAppProvider implements IInAppProvider, INotificationProvider {
  private readonly storage: Map<string, any>; // In-memory storage for demo purposes

  constructor() {
    this.storage = new Map();
  }

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      // For in-app notifications, the recipient is typically a user ID
      // Store the notification for later retrieval
      const messageId = `inapp_${crypto.randomUUID()}`;

      // Store in our in-memory storage (in real implementation, this would be a database)
      this.storage.set(messageId, {
        notificationId: notification.id,
        userId: recipient,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        channel: NotificationChannel.IN_APP,
        read: false,
        createdAt: new Date(),
        metadata: notification.metadata
      });

      return {
        success: true,
        messageId,
        metadata: {
          provider: 'inapp',
          recipient,
          notificationId: notification.id,
          sentAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          provider: 'inapp',
          recipient,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async sendInApp(
    to: string,
    title: string,
    body: string,
    options?: InAppOptions
  ): Promise<NotificationDeliveryResult> {
    try {
      // For in-app notifications, the recipient is typically a user ID
      const messageId = `inapp_${crypto.randomUUID()}`;

      // Store the notification for later retrieval
      this.storage.set(messageId, {
        userId: to,
        title,
        message: body,
        type: 'info',
        channel: NotificationChannel.IN_APP,
        read: false,
        createdAt: new Date(),
        options
      });

      return {
        success: true,
        messageId,
        metadata: {
          provider: 'inapp',
          recipient: to,
          title,
          sentAt: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          provider: 'inapp',
          recipient: to,
          title,
          error: error instanceof Error ? error.message : 'Unknown error',
          options
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // In-app provider is always available as it uses local storage
      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'InApp';
  }

  getType(): string {
    return 'in_app';
  }

  // Additional methods for in-app specific functionality
  async getUnreadNotifications(userId: string): Promise<any[]> {
    // Get all unread notifications for a user
    const notifications: any[] = [];

    for (const [messageId, notification] of this.storage.entries()) {
      if (notification.userId === userId && !notification.read) {
        notifications.push({
          messageId,
          ...notification
        });
      }
    }

    return notifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const notification = this.storage.get(messageId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
        this.storage.set(messageId, notification);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async deleteNotification(messageId: string): Promise<boolean> {
    try {
      return this.storage.delete(messageId);
    } catch (error) {
      return false;
    }
  }

  async getNotificationsByUser(userId: string, limit?: number): Promise<any[]> {
    // Get all notifications for a user
    const notifications: any[] = [];

    for (const [messageId, notification] of this.storage.entries()) {
      if (notification.userId === userId) {
        notifications.push({
          messageId,
          ...notification
        });
      }
    }

    const sorted = notifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  // Private helper methods
  private validateRecipient(recipient: string): boolean {
    // Basic validation for user ID
    return !!(recipient && recipient.length > 0 && recipient.length <= 100);
  }

  private sanitizeMessage(message: string): string {
    // Basic sanitization
    return message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*?<\/script>/gi, '')
      .substring(0, 2000); // Reasonable limit for in-app messages
  }

  private generateMessageId(): string {
    return `inapp_${crypto.randomUUID()}`;
  }

  // Cleanup method for testing
  clear(): void {
    this.storage.clear();
  }
}