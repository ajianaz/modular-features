import { Notification } from '../../domain/entities/Notification.entity';
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { MarkNotificationReadRequest } from '../dtos/input/MarkNotificationReadRequest';
import { MarkNotificationReadResponse } from '../dtos/output/MarkNotificationReadResponse';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { NotificationNotFoundError } from '../../domain/errors/index';

export class MarkNotificationReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(request: MarkNotificationReadRequest): Promise<MarkNotificationReadResponse> {
    try {
      const notification = await this.notificationRepository.findById(request.notificationId);

      if (!notification) {
        return {
          success: false,
          error: 'Notification not found'
        };
      }

      if (notification.userId !== request.recipientId) {
        return {
          success: false,
          error: 'Unauthorized'
        };
      }

      const updatedNotification = notification.markAsRead();
      await this.notificationRepository.update(updatedNotification);

      return {
        success: true,
        notification: NotificationMapper.toResponse(updatedNotification)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}