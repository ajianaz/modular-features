import { Notification } from '../../domain/entities/Notification.entity';
import { NotificationResponse, NotificationDeliveryResponse } from '../dtos/output/NotificationResponse';

export class NotificationMapper {
  static toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status,
      priority: notification.priority,
      channels: notification.channels,
      templateId: notification.templateId,
      scheduledFor: notification.scheduledFor,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      expiresAt: notification.expiresAt,
      metadata: notification.metadata,
      deliveryData: notification.deliveryData,
      retryCount: notification.retryCount,
      maxRetries: notification.maxRetries,
      lastError: notification.lastError,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }

  static toResponseList(notifications: Notification[]): NotificationResponse[] {
    return notifications.map(notification => this.toResponse(notification));
  }
}