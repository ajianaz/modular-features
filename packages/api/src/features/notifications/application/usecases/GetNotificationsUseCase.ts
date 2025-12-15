import { Notification } from '../../domain/entities/Notification.entity';
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { GetNotificationsRequest } from '../dtos/input/GetNotificationsRequest';
import { GetNotificationsResponse } from '../dtos/output/GetNotificationsResponse';
import { NotificationMapper } from '../mappers/NotificationMapper';
// import { DomainError } from '../../../../shared/src/errors/base';

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(request: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    try {
      const notifications = await this.notificationRepository.findByUserId(
        request.recipientId || '',
        {
          status: request.status,
          type: request.type,
          limit: request.limit,
          offset: request.offset
        }
      );

      if (!notifications || notifications.length === 0) {
        return {
          success: true,
          notifications: [],
          total: 0,
          page: 1,
          limit: request.limit || 10,
          hasMore: false
        };
      }

      return {
        success: true,
        notifications: NotificationMapper.toResponseList(notifications),
        total: notifications.length,
        page: 1,
        limit: request.limit || 10,
        hasMore: notifications.length >= (request.limit || 10)
      };
    } catch (error) {
      return {
        success: false,
        notifications: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}