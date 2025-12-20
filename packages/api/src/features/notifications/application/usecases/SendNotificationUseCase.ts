import { 
  INotificationProvider, 
  SendNotificationParams,
  NotificationDeliveryResult 
} from '../../domain/interfaces/IProvider';
import { NotificationChannel } from '../../domain/enums/NotificationChannel';
import { notificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { notificationTemplateRepository } from '../../infrastructure/repositories/NotificationTemplateRepository';
import { notificationPreferenceRepository } from '../../infrastructure/repositories/NotificationPreferenceRepository';
import { notificationDeliveryRepository } from '../../infrastructure/repositories/NotificationDeliveryRepository';
import { notificationAnalyticsRepository } from '../../infrastructure/repositories/NotificationAnalyticsRepository';
import { ProviderRegistry } from '../../infrastructure/lib/ProviderRegistry';
import { ChannelRouter } from '../../infrastructure/lib/ChannelRouter';
import type { NewNotification, NewNotificationDelivery } from '../../domain/entities/Notification';

/**
 * Send Notification Use Case
 * 
 * Handles sending notifications through various channels
 */
export class SendNotificationUseCase {
  private registry: ProviderRegistry;
  private router: ChannelRouter;

  constructor() {
    this.registry = new ProviderRegistry();
    this.router = new ChannelRouter(this.registry);
  }

  /**
   * Execute use case - send notification
   */
  async execute(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    channels: NotificationChannel[];
    templateSlug?: string;
    templateParams?: Record<string, any>;
    data?: Record<string, any>;
    scheduledFor?: Date;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  }): Promise<{ notificationId: string; results: NotificationDeliveryResult[] }> {
    const {
      userId,
      type,
      title,
      message,
      channels,
      templateSlug,
      templateParams,
      data,
      scheduledFor,
      priority,
      metadata
    } = params;

    // 1. Check user preferences for each channel
    const enabledChannels: NotificationChannel[] = [];
    for (const channel of channels) {
      const isEnabled = await notificationPreferenceRepository.isChannelEnabled(
        userId,
        'general',
        channel as any
      );
      if (isEnabled) {
        enabledChannels.push(channel);
      }
    }

    if (enabledChannels.length === 0) {
      throw new Error('No enabled channels found for user');
    }

    // 2. Process template if provided
    let processedContent = message;
    let processedTitle = title;

    if (templateSlug) {
      for (const channel of enabledChannels) {
        const template = await notificationTemplateRepository.findBySlugAndChannel(
          templateSlug,
          channel
        );

        if (template && template.template) {
          // Render template with parameters
          // This would use Handlebars or similar
          processedContent = template.template; // Simplified
          if (template.subject) {
            processedTitle = template.subject;
          }
        }
      }
    }

    // 3. Create notification record
    const notificationData: NewNotification = {
      userId,
      type: type as any,
      title: processedTitle,
      message: processedContent,
      channels: enabledChannels,
      status: scheduledFor ? 'pending' : 'processing',
      priority: priority || 'normal',
      scheduledFor,
      metadata: {
        ...metadata,
        templateSlug,
        templateParams
      }
    };

    const notification = await notificationRepository.create(notificationData);

    // 4. If scheduled, don't send immediately
    if (scheduledFor && scheduledFor > new Date()) {
      return {
        notificationId: notification.id,
        results: []
      };
    }

    // 5. Send through each enabled channel
    const results: NotificationDeliveryResult[] = [];

    for (const channel of enabledChannels) {
      try {
        // Get provider for channel
        const provider = this.router.route(channel, {});

        // Prepare channel-specific params
        const sendParams: SendNotificationParams = {
          recipient: userId, // Provider will resolve to actual recipient (email, token, etc.)
          title: processedTitle,
          content: processedContent,
          data,
          priority: priority === 'high' || priority === 'urgent' ? 'high' : 'normal'
        };

        // Send notification
        const result = await provider.send(sendParams);

        // Record delivery
        const deliveryData: NewNotificationDelivery = {
          notificationId: notification.id,
          channel: channel as any,
          status: result.success ? 'sent' : 'failed',
          recipient: userId,
          provider: result.provider,
          providerMessageId: result.providerMessageId,
          errorMessage: result.error
        };

        const delivery = await notificationDeliveryRepository.create(deliveryData);

        // Update notification status if any channel succeeded
        if (result.success) {
          await notificationRepository.updateStatus(notification.id, 'sent');
        }

        results.push(result);

        // Record analytics
        await notificationAnalyticsRepository.recordMetric(
          notification.id,
          'delivery',
          result.success ? 'sent' : 'failed',
          1
        );

      } catch (error) {
        results.push({
          success: false,
          provider: channel,
          channel,
          sentAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 6. Update final notification status
    const allFailed = results.every(r => !r.success);
    const anySuccess = results.some(r => r.success);

    if (anySuccess) {
      await notificationRepository.updateStatus(notification.id, 'sent');
    } else if (allFailed) {
      await notificationRepository.updateStatus(notification.id, 'failed');
    }

    return {
      notificationId: notification.id,
      results
    };
  }

  /**
   * Register provider
   */
  registerProvider(provider: INotificationProvider): void {
    this.registry.register(provider);
    this.router.addProvider(
      provider.getType(),
      provider.getName(),
      provider.getConfig().priority || 1
    );
  }

  /**
   * Get registered providers
   */
  getProviders(): INotificationProvider[] {
    return this.registry.getAll();
  }
}
