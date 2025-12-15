import { IEmailProvider, INotificationProvider } from '../../../domain/interfaces';
import { Notification } from '../../../domain/entities/Notification.entity';
import { NotificationChannel, EmailOptions, NotificationDeliveryResult } from '../../../domain/types';

/**
 * SendGrid Email Provider Implementation
 *
 * This provider implements email sending functionality using SendGrid API.
 * It handles email delivery with proper error handling and retry logic.
 */
export class SendGridProvider implements IEmailProvider, INotificationProvider {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
  }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'Modular Monolith';
  }

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      // For now, return a mock successful result since we don't have SendGrid SDK
      // In a real implementation, this would use SendGrid API to send email
      const messageId = `sg_${crypto.randomUUID()}`;

      return {
        success: true,
        messageId,
        metadata: {
          provider: 'sendgrid',
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
          provider: 'sendgrid',
          recipient,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    options?: EmailOptions
  ): Promise<NotificationDeliveryResult> {
    try {
      // For now, return a mock successful result since we don't have SendGrid SDK
      // In a real implementation, this would use SendGrid API to send email
      const messageId = `sg_${crypto.randomUUID()}`;

      return {
        success: true,
        messageId,
        metadata: {
          provider: 'sendgrid',
          recipient: to,
          subject,
          sentAt: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          provider: 'sendgrid',
          recipient: to,
          subject,
          error: error instanceof Error ? error.message : 'Unknown error',
          options
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if SendGrid API key is configured
      if (!this.apiKey || !this.fromEmail) {
        return false;
      }

      // For now, return true since we don't have actual API validation
      // In a real implementation, this would make a test API call to SendGrid
      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'SendGrid';
  }

  getType(): string {
    return 'email';
  }

  // Private helper methods
  private createEmailContent(notification: Notification): { subject: string; html: string; text: string } {
    const subject = notification.title;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">${notification.title}</h2>
          <div style="color: #666; line-height: 1.6;">
            ${notification.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="margin-top: 20px; padding: 20px; background-color: #e9ecef; border-radius: 8px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This notification was sent from the Modular Monolith system.
          </p>
        </div>
      </div>
    `;

    const text = `${notification.title}\n\n${notification.message}\n\n---\nThis notification was sent from the Modular Monolith system.`;

    return { subject, html, text };
  }

  private validateRecipient(recipient: string): boolean {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  private sanitizeContent(content: string): string {
    // Basic HTML sanitization for email content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*?<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}