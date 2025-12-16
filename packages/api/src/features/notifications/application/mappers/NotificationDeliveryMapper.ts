import { NotificationDelivery } from '../../domain/entities/NotificationDelivery.entity';
import { NotificationDeliveryResponse } from '../dtos/output/NotificationResponse';
import { NotificationStatus } from '../../domain/types';

export class NotificationDeliveryMapper {
  static toResponse(delivery: NotificationDelivery): NotificationDeliveryResponse {
    return {
      id: delivery.id,
      notificationId: delivery.notificationId,
      channel: delivery.channel,
      status: delivery.status as NotificationStatus, // Convert string literal to enum
      sentAt: delivery.sentAt,
      deliveredAt: delivery.deliveredAt,
      readAt: undefined, // Not available in entity
      error: delivery.error,
      metadata: delivery.metadata
    };
  }

  static toResponseList(deliveries: NotificationDelivery[]): NotificationDeliveryResponse[] {
    return deliveries.map(delivery => this.toResponse(delivery));
  }
}