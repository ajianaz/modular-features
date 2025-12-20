import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import Handlebars from 'handlebars';
import {
  INotificationProvider,
  SendNotificationParams,
  NotificationDeliveryResult,
  ProviderConfig,
  ProviderHealth
} from '../../../domain/interfaces/IProvider';
import { NotificationChannel } from '../../../domain/enums/NotificationChannel';

/**
 * Tencent SES Configuration
 */
export interface TencentSESConfig extends ProviderConfig {
  secretId: string;
  secretKey: string;
  region: string;
  from: string;
  replyTo?: string;
}

/**
 * Tencent Cloud SES Email Provider
 * 
 * Provides email sending capabilities through Tencent Cloud SES (Simple Email Service).
 * Supports transactional emails, templated emails, and bulk emails.
 */
export class TencentSESProvider implements INotificationProvider {
  private client: any;
  private config: TencentSESConfig;
  private readonly VERSION = '1.0.0';

  constructor(config: TencentSESConfig) {
    this.config = config;
    
    // Initialize Tencent Cloud SES client
    const SesClient = tencentcloud.ses.v20201002.Client;
    this.client = new SesClient({
      credential: {
        secretId: config.secretId,
        secretKey: config.secretKey,
      },
      region: config.region || 'ap-singapore',
      profile: {
        httpProfile: {
          endpoint: 'ses.tencentcloudapi.com',
        },
      },
    });
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'tencent-ses';
  }

  /**
   * Get provider type (channel)
   */
  getType(): NotificationChannel {
    return NotificationChannel.EMAIL;
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
      // Tencent SES doesn't have a dedicated health check endpoint
      // We'll verify by checking if we can create a client
      if (!this.client) {
        return {
          healthy: false,
          lastChecked: new Date(),
          error: 'Client not initialized'
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
   * Send email
   */
  async send(params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const request: any = {
        FromEmailAddress: this.config.from,
        ReplyToAddresses: this.config.replyTo ? [this.config.replyTo] : undefined,
        Destination: {
          ToAddresses: [params.recipient],
        },
        Message: {
          Subject: {
            Data: params.subject || 'No Subject',
          },
          Body: {
            Html: {
              Data: params.content,
            },
            Text: {
              Data: params.textContent || params.content,
            },
          },
        },
      };

      // Add attachments if present (Tencent SES supports attachments via base64)
      if (params.attachments && params.attachments.length > 0) {
        // Note: Attachment support depends on Tencent SES SDK version
        // This is a placeholder for attachment implementation
        request.Attachments = params.attachments;
      }

      const result = await this.client.SendEmail(request);
      
      return {
        success: true,
        providerMessageId: result.MessageId,
        provider: 'tencent-ses',
        channel: 'email',
        sentAt: new Date(),
        metadata: {
          requestId: result.RequestId,
          recipient: params.recipient
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'tencent-ses',
        channel: 'email',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send bulk email to multiple recipients
   */
  async sendBulk(recipients: string[], params: SendNotificationParams): Promise<NotificationDeliveryResult> {
    try {
      const request: any = {
        FromEmailAddress: this.config.from,
        ReplyToAddresses: this.config.replyTo ? [this.config.replyTo] : undefined,
        Destination: {
          ToAddresses: recipients,
        },
        Message: {
          Subject: {
            Data: params.subject || 'No Subject',
          },
          Body: {
            Html: {
              Data: params.content,
            },
            Text: {
              Data: params.textContent || params.content,
            },
          },
        },
      };

      const result = await this.client.SendEmail(request);
      
      return {
        success: true,
        providerMessageId: result.MessageId,
        provider: 'tencent-ses',
        channel: 'email',
        sentAt: new Date(),
        metadata: {
          recipientCount: recipients.length,
          requestId: result.RequestId
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'tencent-ses',
        channel: 'email',
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
    return true;
  }

  /**
   * Render template using Handlebars
   */
  async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  }
}
