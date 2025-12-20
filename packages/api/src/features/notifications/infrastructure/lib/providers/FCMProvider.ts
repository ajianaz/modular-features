import * as admin from 'firebase-admin';
import {
  INotificationProvider,
  SendNotificationParams,
  NotificationDeliveryResult,
  ProviderConfig,
  ProviderHealth
} from '../../../domain/interfaces/IProvider';
import { NotificationChannel } from '../../../domain/enums/NotificationChannel';

/**
 * FCM Configuration
 */
export interface FCMConfig extends ProviderConfig {
  credentials: string; // Path to service account JSON
  projectId: string;
}

/**
 * Firebase Cloud Messaging Provider
 * 
 * Provides push notification capabilities through Firebase Cloud Messaging (FCM).
 * Supports single device, multicast (multiple devices), and topic-based messaging.
 */
export class FCMProvider implements INotificationProvider {
  private app: admin.app.App;
  private messaging: admin.messaging.Messaging;
  private config: FCMConfig;
  private readonly VERSION = '1.0.0';

  constructor(config: FCMConfig) {
    this.config = config;
    
    // Initialize Firebase Admin
    const serviceAccount = require(config.credentials);
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.projectId
    }, `fcm-${Date.now()}`); // Unique app name to allow multiple instances
    
    this.messaging = this.app.messaging();
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'fcm';
  }

  /**
   * Get provider type (channel)
   */
  getType(): NotificationChannel {
    return NotificationChannel.PUSH;
  }

  /**
   * Get provider version
   */
  getVersion(): string {
    return this.VERSION;
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.healthy;
    } catch {
      return false;
    }
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Check if Firebase app is initialized
      if (!this.app || !this.messaging) {
        return {
          healthy: false,
          lastChecked: new Date(),
          error: 'Firebase app not initialized'
        };
      }

      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        healthy: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send push notification
   */
  async send(params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: params.title || '',
          body: params.content
        },
        data: params.data || {},
        token: params.deviceToken,
        android: {
          notification: {
            sound: 'default',
            channelId: params.channelId || 'default',
            priority: params.priority === 'high' ? 'high' : 'normal'
          },
          priority: params.priority === 'high' ? 'high' : 'normal'
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: params.badge || 1,
              category: params.category || 'GENERAL'
            }
          }
        }
      };

      // Support multicast for multiple devices
      if (params.deviceTokens && params.deviceTokens.length > 0) {
        return await this.sendMulticast(params);
      }

      // Support topic messaging
      if (params.topic) {
        return await this.sendToTopic(params.topic, params);
      }

      // Single device message
      const response = await this.messaging.send(message);
      
      return {
        success: true,
        providerMessageId: response,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send multicast message to multiple devices
   */
  private async sendMulticast(params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const multicastMessage: admin.messaging.MulticastMessage = {
        notification: {
          title: params.title || '',
          body: params.content
        },
        data: params.data || {},
        tokens: params.deviceTokens || [],
        android: {
          notification: {
            sound: 'default',
            channelId: params.channelId || 'default',
            priority: params.priority === 'high' ? 'high' : 'normal'
          },
          priority: params.priority === 'high' ? 'high' : 'normal'
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: params.badge || 1,
              category: params.category || 'GENERAL'
            }
          }
        }
      };

      const response = await this.messaging.sendMulticast(multicastMessage);
      
      return {
        success: response.successCount > 0,
        providerMessageId: `multicast-${response.successCount}-${response.failureCount}`,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        metadata: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          totalCount: response.successCount + response.failureCount,
          responses: response.responses
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send message to topic
   */
  async sendToTopic(topic: string, params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: params.title || '',
          body: params.content
        },
        data: params.data || {},
        topic: topic
      };

      const response = await this.messaging.send(message);
      
      return {
        success: true,
        providerMessageId: response,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        metadata: {
          topic: topic
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Subscribe devices to topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    await this.messaging.subscribeToTopic(tokens, topic);
  }

  /**
   * Unsubscribe devices from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    await this.messaging.unsubscribeFromTopic(tokens, topic);
  }

  /**
   * Send silent push (data only, no notification shown to user)
   */
  async sendSilent(params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const message: admin.messaging.Message = {
        data: params.data || {},
        token: params.deviceToken,
        apns: {
          payload: {
            aps: {
              'content-available': 1
            }
          }
        },
        android: {
          priority: 'high'
        }
      };

      const response = await this.messaging.send(message);
      
      return {
        success: true,
        providerMessageId: response,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        provider: 'fcm',
        channel: 'push',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Configure provider
   */
  configure(config: ProviderConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get provider configuration
   */
  getConfig(): ProviderConfig {
    return this.config;
  }

  /**
   * Check if provider supports templates
   */
  supportsTemplates(): boolean {
    return false; // FCM doesn't use templates in the traditional sense
  }

  /**
   * Clean up Firebase app instance
   */
  async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.delete();
    }
  }
}
