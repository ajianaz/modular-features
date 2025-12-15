import { Notification } from '../../domain/entities/Notification.entity';
import { INotificationRepository } from '../../domain/interfaces/INotificationRepository';
import { INotificationTemplateRepository } from '../../domain/interfaces/INotificationTemplateRepository';
import { INotificationPreferenceRepository } from '../../domain/interfaces/INotificationPreferenceRepository';
import { INotificationProvider } from '../../domain/interfaces/INotificationProvider';
import { SendNotificationRequest } from '../dtos/input/SendNotificationRequest';
import { SendNotificationResponse } from '../dtos/output/SendNotificationResponse';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { InvalidNotificationDataError } from '../../domain/errors/index';
import { NotificationChannel } from '../../domain/types';

export class SendNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private templateRepository: INotificationTemplateRepository,
    private preferenceRepository: INotificationPreferenceRepository,
    private providers: Map<string, INotificationProvider>
  ) {}

  async execute(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    try {
      // Validate request
      const validation = Notification.validateCreate({
        userId: request.recipientId,
        type: request.type,
        title: request.title,
        message: request.content,
        channels: request.channels || [],
        priority: request.priority,
        templateId: request.templateId,
        scheduledFor: request.scheduledAt,
        metadata: request.data
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check user preferences
      const preferences = await this.preferenceRepository.findByUserIdAndType(
        request.recipientId,
        request.type
      );

      // Filter channels based on preferences
      const enabledChannels = await this.getEnabledChannels(
        request.channels || [],
        Array.isArray(preferences) ? preferences : [],
        request.recipientId
      );

      if (enabledChannels.length === 0) {
        return {
          success: false,
          error: 'No enabled notification channels for this user'
        };
      }

      // Process template if provided
      let title = request.title;
      let content = request.content;

      if (request.templateId) {
        const template = await this.templateRepository.findById(request.templateId);
        if (!template) {
          return {
            success: false,
            error: 'Notification template not found'
          };
        }

        title = template.renderSubject(request.templateVariables || {}) || title;
        content = template.render(request.templateVariables || {});
      }

      // Create notification
      const notification = Notification.create({
        userId: request.recipientId,
        type: request.type,
        title,
        message: content,
        channels: enabledChannels,
        priority: request.priority,
        templateId: request.templateId,
        scheduledFor: request.scheduledAt,
        metadata: request.data
      });

      // Save notification
      const savedNotification = await this.notificationRepository.create(notification);

      // Send notification through providers
      const results = await this.sendThroughProviders(
        savedNotification,
        enabledChannels,
        request.data
      );

      // Update notification status based on results
      const allSuccessful = results.every(result => result.success);
      const updatedNotification = allSuccessful
        ? savedNotification.markAsSent()
        : savedNotification.markAsFailed(results.find(r => !r.success)?.error);

      await this.notificationRepository.update(updatedNotification);

      return {
        success: allSuccessful,
        notification: NotificationMapper.toResponse(updatedNotification),
        message: allSuccessful ? 'Notification sent successfully' : 'Some notifications failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getEnabledChannels(
    requestedChannels: NotificationChannel[],
    preferences: any[],
    userId: string
  ): Promise<NotificationChannel[]> {
    const enabledChannels: NotificationChannel[] = [];

    for (const channel of requestedChannels) {
      const preference = preferences.find(p => p.type === 'general' && p.channel === channel);

      if (!preference || preference.enabled) {
        enabledChannels.push(channel);
      }
    }

    return enabledChannels;
  }

  private async sendThroughProviders(
    notification: Notification,
    channels: string[],
    data?: Record<string, any>
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const results: Array<{ success: boolean; error?: string }> = [];

    for (const channel of channels) {
      const provider = this.providers.get(channel);
      if (!provider) {
        results.push({ success: false, error: `No provider found for channel: ${channel}` });
        continue;
      }

      try {
        const result = await provider.send(notification, notification.userId);

        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Provider error'
        });
      }
    }

    return results;
  }
}