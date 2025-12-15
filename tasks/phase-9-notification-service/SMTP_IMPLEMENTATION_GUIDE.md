# SMTP Implementation Guide

## Introduction

This guide provides detailed implementation examples for integrating SMTP functionality into the existing notification system. All code examples follow the established clean architecture patterns and maintain compatibility with existing components.

## 1. SMTP Provider Implementation

### 1.1 Core SMTP Provider

```typescript
// packages/api/src/features/notifications/infrastructure/lib/providers/SMTPProvider.ts
import nodemailer from 'nodemailer';
import { IEmailProvider, INotificationProvider } from '../../../domain/interfaces';
import { Notification } from '../../../domain/entities/Notification.entity';
import { NotificationChannel, EmailOptions, NotificationDeliveryResult } from '../../../domain/types';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    email: string;
    name?: string;
  };
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
  rateDelta?: number;
  rateLimit?: number;
}

export class SMTPProvider implements IEmailProvider, INotificationProvider {
  private readonly config: SMTPConfig;
  private readonly transport: nodemailer.Transporter;
  private readonly errorHandler: SMTPErrorHandler;

  constructor(config: SMTPConfig) {
    this.config = config;
    this.transport = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      pool: config.pool || true,
      maxConnections: config.maxConnections || 5,
      maxMessages: config.maxMessages || 100,
      rateDelta: config.rateDelta || 1000,
      rateLimit: config.rateLimit || 10
    });
    this.errorHandler = new SMTPErrorHandler();
  }

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      const emailContent = this.createEmailContent(notification);
      const mailOptions = {
        from: `${this.config.from.name || 'Modular Monolith'} <${this.config.from.email}>`,
        to: recipient,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      };

      const result = await this.transport.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        metadata: {
          provider: 'smtp',
          recipient,
          notificationId: notification.id,
          sentAt: new Date().toISOString(),
          response: result.response
        }
      };
    } catch (error) {
      return this.errorHandler.handleError(error as Error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    options?: EmailOptions
  ): Promise<NotificationDeliveryResult> {
    try {
      const mailOptions = {
        from: `${options?.from || this.config.from.name || 'Modular Monolith'} <${this.config.from.email}>`,
        to,
        subject,
        html: options?.html ? content : this.textToHtml(content),
        text: options?.html ? this.htmlToText(content) : content,
        replyTo: options?.replyTo,
        attachments: options?.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      const result = await this.transport.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        metadata: {
          provider: 'smtp',
          recipient: to,
          subject,
          sentAt: new Date().toISOString(),
          response: result.response,
          options
        }
      };
    } catch (error) {
      return this.errorHandler.handleError(error as Error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.config.host || !this.config.auth.user || !this.config.auth.pass) {
        return false;
      }

      // Verify connection
      await this.transport.verify();
      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'SMTP';
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
            This notification was sent from the Modular Monolith system via SMTP.
          </p>
        </div>
      </div>
    `;

    const text = `${notification.title}\n\n${notification.message}\n\n---\nThis notification was sent from the Modular Monolith system via SMTP.`;

    return { subject, html, text };
  }

  private textToHtml(text: string): string {
    return `<div style="font-family: Arial, sans-serif;">${text.replace(/\n/g, '<br>')}</div>`;
  }

  private htmlToText(html: string): string {
    // Basic HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .trim();
  }
}
```

### 1.2 SMTP Error Handler

```typescript
// packages/api/src/features/notifications/infrastructure/lib/services/SMTPErrorHandler.ts
import { NotificationDeliveryResult } from '../../../domain/types';

export class SMTPErrorHandler {
  handleError(error: Error): NotificationDeliveryResult {
    const errorMessage = error.message.toLowerCase();

    if (this.isTransientError(errorMessage)) {
      return {
        success: false,
        error: error.message,
        retryable: true,
        retryDelay: this.calculateRetryDelay(errorMessage),
        metadata: {
          errorType: 'transient',
          originalError: error.message,
          suggestedAction: 'Retry with exponential backoff'
        }
      };
    }

    if (this.isPermanentError(errorMessage)) {
      return {
        success: false,
        error: error.message,
        retryable: false,
        metadata: {
          errorType: 'permanent',
          originalError: error.message,
          suggestedAction: 'Update recipient information or contact support'
        }
      };
    }

    // Default handling
    return {
      success: false,
      error: error.message,
      retryable: true,
      retryDelay: 60000, // 1 minute default
      metadata: {
        errorType: 'unknown',
        originalError: error.message,
        suggestedAction: 'Retry with alternative provider'
      }
    };
  }

  private isTransientError(errorMessage: string): boolean {
    const transientPatterns = [
      'connection timeout',
      'connection refused',
      'connection reset',
      'network unreachable',
      'temporary failure',
      'rate limit',
      'too many connections',
      'service unavailable',
      'timeout',
      'econnreset',
      'etimedout',
      'econnrefused'
    ];

    return transientPatterns.some(pattern => errorMessage.includes(pattern));
  }

  private isPermanentError(errorMessage: string): boolean {
    const permanentPatterns = [
      'user not found',
      'invalid recipient',
      'authentication failed',
      'invalid credentials',
      'access denied',
      'mailbox unavailable',
      'account disabled',
      '550',
      '551',
      '553'
    ];

    return permanentPatterns.some(pattern => errorMessage.includes(pattern));
  }

  private calculateRetryDelay(errorMessage: string): number {
    // Base delay in milliseconds
    let baseDelay = 60000; // 1 minute

    // Adjust delay based on error type
    if (errorMessage.includes('rate limit')) {
      baseDelay = 300000; // 5 minutes
    } else if (errorMessage.includes('too many connections')) {
      baseDelay = 120000; // 2 minutes
    } else if (errorMessage.includes('timeout')) {
      baseDelay = 30000; // 30 seconds
    }

    return baseDelay + Math.random() * 30000; // Add jitter
  }
}
```

## 2. Email Provider Hierarchy Implementation

### 2.1 Email Provider Hierarchy

```typescript
// packages/api/src/features/notifications/infrastructure/lib/providers/EmailProviderHierarchy.ts
import { IEmailProvider } from '../../../domain/interfaces';
import { Notification } from '../../../domain/entities';
import { NotificationChannel, EmailOptions, NotificationDeliveryResult } from '../../../domain/types';
import { TencentSESProvider } from './TencentSESProvider';
import { SMTPProvider } from './SMTPProvider';
import { SendGridProvider } from './SendGridProvider';

export interface ProviderHealthStatus {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  consecutiveFailures: number;
  responseTime: number;
}

export class EmailProviderHierarchy implements IEmailProvider {
  private providers: IEmailProvider[];
  private healthStatus: Map<string, ProviderHealthStatus> = new Map();
  private healthCheckInterval: number;

  constructor(
    private tencentProvider: TencentSESProvider,
    private smtpProvider: SMTPProvider,
    private sendGridProvider: SendGridProvider,
    healthCheckInterval: number = 300000 // 5 minutes
  ) {
    this.providers = [tencentProvider, smtpProvider, sendGridProvider];
    this.healthCheckInterval = healthCheckInterval;
    this.initializeHealthStatus();
  }

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    const attempts: NotificationDeliveryResult[] = [];

    for (const provider of this.providers) {
      try {
        // Check if provider is healthy
        const isHealthy = await this.checkProviderHealth(provider);
        if (!isHealthy) {
          attempts.push({
            success: false,
            error: `Provider ${provider.getName()} is not healthy`,
            metadata: {
              provider: provider.getName(),
              reason: 'health_check_failed'
            }
          });
          continue;
        }

        // Try to send with provider
        const result = await provider.send(notification, recipient);
        attempts.push(result);

        if (result.success) {
          // Update health status on success
          this.updateHealthStatus(provider.getName(), true, 0);

          return {
            success: true,
            messageId: result.messageId,
            metadata: {
              provider: provider.getName(),
              attempts: attempts,
              successfulProvider: provider.getName(),
              hierarchyLevel: this.getProviderLevel(provider.getName())
            }
          };
        } else {
          // Update health status on failure
          this.updateHealthStatus(provider.getName(), false, 1);
        }
      } catch (error) {
        attempts.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            provider: provider.getName(),
            reason: 'exception'
          }
        });

        // Update health status on exception
        this.updateHealthStatus(provider.getName(), false, 1);
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All email providers failed',
      metadata: {
        attempts: attempts,
        totalAttempts: attempts.length,
        lastError: attempts[attempts.length - 1]?.error
      }
    };
  }

  async sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult> {
    const notification = {
      title: subject,
      message: content
    } as Notification;

    return this.send(notification, to);
  }

  async isAvailable(): Promise<boolean> {
    // Check if at least one provider is available
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        return true;
      }
    }
    return false;
  }

  getName(): string {
    return 'Email Provider Hierarchy (Tencent SES → SMTP → SendGrid)';
  }

  getType(): NotificationChannel {
    return NotificationChannel.EMAIL;
  }

  // Method to refresh health status
  async refreshHealthStatus(): Promise<void> {
    for (const provider of this.providers) {
      const isHealthy = await provider.isAvailable();
      this.updateHealthStatus(provider.getName(), isHealthy, isHealthy ? 0 : 1);
    }
  }

  // Method to get provider statistics
  getProviderStats(): ProviderHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  // Method to get healthy providers
  getHealthyProviders(): string[] {
    return Array.from(this.healthStatus.values())
      .filter(status => status.isHealthy)
      .map(status => status.provider);
  }

  // Method to force provider selection for testing
  async sendWithSpecificProvider(providerName: string, notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    const provider = this.providers.find(p => p.getName() === providerName);
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerName} not found`,
        metadata: { requestedProvider: providerName }
      };
    }

    return provider.send(notification, recipient);
  }

  private initializeHealthStatus(): void {
    for (const provider of this.providers) {
      this.healthStatus.set(provider.getName(), {
        provider: provider.getName(),
        isHealthy: true, // Assume healthy initially
        lastCheck: new Date(),
        consecutiveFailures: 0,
        responseTime: 0
      });
    }
  }

  private async checkProviderHealth(provider: IEmailProvider): Promise<boolean> {
    const providerName = provider.getName();
    const status = this.healthStatus.get(providerName);

    // Check cached health status
    if (status && (Date.now() - status.lastCheck.getTime()) < this.healthCheckInterval) {
      return status.isHealthy;
    }

    // Check actual health
    const isHealthy = await provider.isAvailable();
    this.updateHealthStatus(providerName, isHealthy, isHealthy ? 0 : 1);

    return isHealthy;
  }

  private updateHealthStatus(providerName: string, isHealthy: boolean, failureIncrement: number): void {
    const current = this.healthStatus.get(providerName);
    if (!current) return;

    const updated: ProviderHealthStatus = {
      ...current,
      isHealthy,
      lastCheck: new Date(),
      consecutiveFailures: isHealthy ? 0 : current.consecutiveFailures + failureIncrement
    };

    this.healthStatus.set(providerName, updated);
  }

  private getProviderLevel(providerName: string): number {
    const levels: { [key: string]: number } = {
      'Tencent SES': 1,
      'SMTP': 2,
      'SendGrid': 3
    };
    return levels[providerName] || 0;
  }
}
```

### 2.2 Tencent SES Provider Implementation

```typescript
// packages/api/src/features/notifications/infrastructure/lib/providers/TencentSESProvider.ts
import { IEmailProvider } from '../../../domain/interfaces';
import { Notification, NotificationChannel, EmailOptions, NotificationDeliveryResult } from '../../../domain/entities';

export interface TencentSESConfig {
  secretId: string;
  secretKey: string;
  region: string;
  fromEmail: string;
  fromName: string;
}

export class TencentSESProvider implements IEmailProvider {
  private readonly config: TencentSESConfig;

  constructor(config: TencentSESConfig) {
    this.config = config;
  }

  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult> {
    try {
      const tencentcloud = require('tencentcloud-sdk-nodejs');
      const SesClient = tencentcloud.ses.v20201002.Client;

      const clientConfig = {
        credential: {
          secretId: this.config.secretId,
          secretKey: this.config.secretKey,
        },
        region: this.config.region,
        profile: {
          httpProfile: {
            endpoint: "ses.tencentcloudapi.com",
          },
        },
      };

      const client = new SesClient(clientConfig);

      const params = {
        "FromEmailAddress": `${this.config.fromName} <${this.config.fromEmail}>`,
        "Destination": [recipient],
        "Subject": notification.title,
        "ReplyToAddresses": [],
        "Html": notification.message,
        "Text": notification.message
      };

      const response = await client.SendEmail(params);

      return {
        success: true,
        messageId: response.RequestId,
        metadata: {
          provider: 'tencent-ses',
          response: response,
          region: this.config.region,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'tencent-ses',
          error: error instanceof Error ? error.stack : String(error)
        }
      };
    }
  }

  async sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult> {
    const notification = {
      title: subject,
      message: content
    } as Notification;

    return this.send(notification, to);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const tencentcloud = require('tencentcloud-sdk-nodejs');
      const SesClient = tencentcloud.ses.v20201002.Client;

      const clientConfig = {
        credential: {
          secretId: this.config.secretId,
          secretKey: this.config.secretKey,
        },
        region: this.config.region,
      };

      const client = new SesClient(clientConfig);

      // Test API access with a simple request
      await client.ListEmailTemplates({});

      return true;
    } catch (error) {
      return false;
    }
  }

  getName(): string {
    return 'Tencent SES';
  }

  getType(): NotificationChannel {
    return NotificationChannel.EMAIL;
  }
}
```

### 2.2 Provider Health Checker

```typescript
// packages/api/src/features/notifications/infrastructure/lib/services/ProviderHealthChecker.ts
import { IEmailProvider } from '../../../domain/interfaces';
import { ProviderHealthRepository } from '../../repositories';

export interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  consecutiveFailures: number;
  uptime: number;
}

export class ProviderHealthChecker {
  private healthRepository: ProviderHealthRepository;
  private healthCheckInterval: number;
  private healthCache: Map<string, ProviderHealth> = new Map();

  constructor(
    healthRepository: ProviderHealthRepository,
    healthCheckInterval: number = 300000 // 5 minutes
  ) {
    this.healthRepository = healthRepository;
    this.healthCheckInterval = healthCheckInterval;
  }

  async isHealthy(providerName: string): Promise<boolean> {
    // Check cache first
    const cached = this.healthCache.get(providerName);
    if (cached && (Date.now() - cached.lastCheck.getTime()) < this.healthCheckInterval) {
      return cached.isHealthy;
    }

    // Perform health check
    const health = await this.performHealthCheck(providerName);
    this.healthCache.set(providerName, health);

    return health.isHealthy;
  }

  async getHealthStatus(providerName: string): Promise<ProviderHealth> {
    const cached = this.healthCache.get(providerName);
    if (cached && (Date.now() - cached.lastCheck.getTime()) < this.healthCheckInterval) {
      return cached;
    }

    const health = await this.performHealthCheck(providerName);
    this.healthCache.set(providerName, health);

    return health;
  }

  private async performHealthCheck(providerName: string): Promise<ProviderHealth> {
    const startTime = Date.now();
    let isHealthy = false;
    let consecutiveFailures = 0;

    try {
      // Get provider instance and check availability
      // This would need to be injected or managed differently
      const provider = this.getProviderByName(providerName);
      if (provider) {
        isHealthy = await provider.isAvailable();
      }
    } catch (error) {
      isHealthy = false;
    }

    const responseTime = Date.now() - startTime;

    // Get previous health data
    const previousHealth = await this.healthRepository.getProviderHealth(providerName, '24h');
    if (previousHealth) {
      consecutiveFailures = isHealthy ? 0 : previousHealth.consecutiveFailures + 1;
    } else {
      consecutiveFailures = isHealthy ? 0 : 1;
    }

    const health: ProviderHealth = {
      provider: providerName,
      isHealthy,
      lastCheck: new Date(),
      responseTime,
      consecutiveFailures,
      uptime: isHealthy ? 100 : 0 // Simplified calculation
    };

    // Record health check
    await this.healthRepository.recordHealthCheck(
      providerName,
      isHealthy,
      responseTime
    );

    return health;
  }

  private getProviderByName(providerName: string): IEmailProvider | null {
    // This would need to be implemented based on your DI container
    // For now, return null as placeholder
    return null;
  }
}
```

## 3. Enhanced Repository Implementation

### 3.1 Notification Delivery Repository

```typescript
// packages/api/src/features/notifications/infrastructure/repositories/NotificationDeliveryRepository.ts
import { eq, and, desc, asc, gte, lte } from 'drizzle-orm';
import { db } from '@modular-monolith/database';
import { INotificationDeliveryRepository } from '../../domain/interfaces/INotificationDeliveryRepository';
import { NotificationDelivery } from '../../domain/entities/NotificationDelivery.entity';
import { DeliveryStatus, NotificationChannel } from '../../domain/types';

export class NotificationDeliveryRepository implements INotificationDeliveryRepository {
  async createDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery> {
    // Implementation would depend on your database schema
    // For now, return the delivery as-is
    return delivery;
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    metadata?: any
  ): Promise<void> {
    // Update delivery status in database
    // Implementation depends on your schema
  }

  async getDeliveriesByNotificationId(notificationId: string): Promise<NotificationDelivery[]> {
    // Query database for deliveries by notification ID
    return [];
  }

  async getFailedDeliveries(since: Date): Promise<NotificationDelivery[]> {
    // Query database for failed deliveries since specified date
    return [];
  }

  async getDeliveryStats(provider: string, period: TimePeriod): Promise<DeliveryStats> {
    // Calculate delivery statistics for provider within time period
    return {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      averageDeliveryTime: 0
    };
  }

  async getDeliveriesByProvider(provider: string, limit?: number): Promise<NotificationDelivery[]> {
    // Query database for deliveries by provider
    return [];
  }

  async getPendingDeliveries(limit?: number): Promise<NotificationDelivery[]> {
    // Query database for pending deliveries
    return [];
  }

  async markDeliveryAsDelivered(deliveryId: string, deliveredAt?: Date): Promise<void> {
    // Mark delivery as delivered
  }

  async markDeliveryAsFailed(deliveryId: string, error: string): Promise<void> {
    // Mark delivery as failed
  }
}

export interface DeliveryStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  averageDeliveryTime: number;
}

export type TimePeriod = '1h' | '24h' | '7d' | '30d';
```

### 3.2 Provider Health Repository

```typescript
// packages/api/src/features/notifications/infrastructure/repositories/ProviderHealthRepository.ts
import { ProviderHealth, TimePeriod } from '../services/ProviderHealthChecker';

export class ProviderHealthRepository {
  async recordHealthCheck(
    provider: string,
    isHealthy: boolean,
    responseTime: number
  ): Promise<void> {
    // Record health check in database
  }

  async getProviderHealth(provider: string, period: TimePeriod): Promise<ProviderHealth | null> {
    // Get provider health statistics for specified period
    return null;
  }

  async getHealthyProviders(): Promise<string[]> {
    // Get list of currently healthy providers
    return [];
  }

  async getProviderUptime(provider: string, period: TimePeriod): Promise<number> {
    // Calculate uptime percentage for provider
    return 0;
  }

  async getProviderResponseTime(provider: string, period: TimePeriod): Promise<number> {
    // Get average response time for provider
    return 0;
  }
}
```

## 4. Configuration Updates

### 4.1 Enhanced Notification Container

```typescript
// packages/api/src/features/notifications/infrastructure/container/NotificationsContainer.ts
// Add these imports at the top
import { TencentSESProvider, TencentSESConfig } from '../lib/providers/TencentSESProvider';
import { SMTPProvider, SMTPConfig } from '../lib/providers/SMTPProvider';
import { SendGridProvider } from '../lib/providers/SendGridProvider';
import { EmailProviderHierarchy } from '../lib/providers/EmailProviderHierarchy';
import { NotificationDeliveryRepository } from '../repositories/NotificationDeliveryRepository';

// Add these properties to the NotificationsContainer class
private tencentProvider!: TencentSESProvider;
private smtpProvider!: SMTPProvider;
private sendGridProvider!: SendGridProvider;
private emailProviderHierarchy!: EmailProviderHierarchy;
private notificationDeliveryRepository!: NotificationDeliveryRepository;

// Update initializeProviders method
private initializeProviders(): void {
  // Initialize Tencent SES provider (Primary)
  const tencentConfig: TencentSESConfig = {
    secretId: process.env.TENCENT_SECRET_ID || '',
    secretKey: process.env.TENCENT_SECRET_KEY || '',
    region: process.env.TENCENT_REGION || 'ap-singapore',
    fromEmail: process.env.TENCENT_FROM_EMAIL || 'noreply@modular-monolith.com',
    fromName: process.env.TENCENT_FROM_NAME || 'Modular Monolith'
  };

  this.tencentProvider = new TencentSESProvider(tencentConfig);

  // Initialize SMTP provider (Secondary)
  const smtpConfig: SMTPConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    from: {
      email: process.env.SMTP_FROM_EMAIL || 'noreply@modular-monolith.com',
      name: process.env.SMTP_FROM_NAME || 'Modular Monolith'
    },
    pool: process.env.SMTP_POOL === 'true',
    maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
    maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || '100'),
    rateDelta: parseInt(process.env.SMTP_RATE_DELTA || '1000'),
    rateLimit: parseInt(process.env.SMTP_RATE_LIMIT || '10')
  };

  this.smtpProvider = new SMTPProvider(smtpConfig);

  // Initialize SendGrid provider (Fallback)
  this.sendGridProvider = new SendGridProvider({
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@modular-monolith.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Modular Monolith'
  });

  // Initialize email provider hierarchy (Tencent SES → SMTP → SendGrid)
  this.emailProviderHierarchy = new EmailProviderHierarchy(
    this.tencentProvider,
    this.smtpProvider,
    this.sendGridProvider,
    parseInt(process.env.EMAIL_HIERARCHY_HEALTH_CHECK_INTERVAL || '300000')
  );

  // Initialize delivery repository
  this.notificationDeliveryRepository = new NotificationDeliveryRepository();

  // Other existing providers...
}

// Update getProviders method
private getProviders(): Map<string, any> {
  const providers = new Map<string, any>();
  providers.set('email', this.emailProviderHierarchy);
  providers.set('sms', this.twilioProvider);
  providers.set('push', this.firebaseProvider);
  providers.set('in_app', this.inAppProvider);
  return providers;
}

// Add new getter methods
public getTencentProvider(): TencentSESProvider {
  return this.tencentProvider;
}

public getSMTPProvider(): SMTPProvider {
  return this.smtpProvider;
}

public getSendGridProvider(): SendGridProvider {
  return this.sendGridProvider;
}

public getEmailProviderHierarchy(): EmailProviderHierarchy {
  return this.emailProviderHierarchy;
}

public getNotificationDeliveryRepository(): NotificationDeliveryRepository {
  return this.notificationDeliveryRepository;
}
```

## 5. Updated Send Notification Use Case

```typescript
// packages/api/src/features/notifications/application/usecases/SendNotificationUseCase.ts
// Update the existing use case to use the new provider factory

export class SendNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private templateRepository: INotificationTemplateRepository,
    private preferenceRepository: INotificationPreferenceRepository,
    private emailProviderFactory: EmailProviderFactory, // Updated from Map to factory
    private notificationDeliveryRepository: INotificationDeliveryRepository // New dependency
  ) {}

  async execute(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    try {
      // Existing validation and preference logic...

      // Create email context for provider selection
      const emailContext: EmailContext = {
        priority: request.priority || NotificationPriority.NORMAL,
        templateId: request.templateId,
        recipientCount: 1, // For single notification
        requiresTracking: true,
        contentType: this.determineContentType(request.type)
      };

      // Get appropriate provider
      const emailProvider = await this.emailProviderFactory.getProvider(emailContext);

      // Create notification
      const notification = Notification.create({
        userId: request.recipientId,
        type: request.type,
        title,
        content,
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
        request.data,
        emailProvider
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

  private async sendThroughProviders(
    notification: Notification,
    channels: NotificationChannel[],
    data?: Record<string, any>,
    emailProvider?: IEmailProvider // New parameter
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const results: Array<{ success: boolean; error?: string }> = [];

    for (const channel of channels) {
      let provider: INotificationProvider;

      if (channel === NotificationChannel.EMAIL && emailProvider) {
        provider = emailProvider;
      } else {
        // Get provider from existing Map for other channels
        provider = this.providers.get(channel);
      }

      if (!provider) {
        results.push({ success: false, error: `No provider found for channel: ${channel}` });
        continue;
      }

      try {
        // Create delivery record
        const delivery = NotificationDelivery.create({
          notificationId: notification.id,
          provider: provider.getName(),
          channel,
          status: DeliveryStatus.PENDING,
          recipient: notification.userId
        });

        await this.notificationDeliveryRepository.createDelivery(delivery);

        const result = await provider.send(notification, notification.userId);

        // Update delivery status
        if (result.success) {
          await this.notificationDeliveryRepository.updateDeliveryStatus(
            delivery.id,
            DeliveryStatus.SENT,
            result.metadata
          );
        } else {
          await this.notificationDeliveryRepository.updateDeliveryStatus(
            delivery.id,
            DeliveryStatus.FAILED,
            { error: result.error }
          );
        }

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

  private determineContentType(type: string): 'marketing' | 'transactional' | 'system' {
    const marketingTypes = ['promotion', 'newsletter', 'marketing'];
    const systemTypes = ['system', 'security', 'maintenance'];

    if (marketingTypes.includes(type.toLowerCase())) {
      return 'marketing';
    } else if (systemTypes.includes(type.toLowerCase())) {
      return 'system';
    }

    return 'transactional';
  }
}
```

## 6. Environment Configuration

### 6.1 .env.example Updates

```bash
# Tencent Cloud SES Configuration (Primary)
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_REGION=ap-singapore
TENCENT_FROM_EMAIL=noreply@yourcompany.com
TENCENT_FROM_NAME=Your Company

# SMTP Configuration (Secondary)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@yourcompany.com
SMTP_FROM_NAME=Your Company

# SMTP Pool Configuration
SMTP_POOL=true
SMTP_MAX_CONNECTIONS=5
SMTP_MAX_MESSAGES=100
SMTP_RATE_DELTA=1000
SMTP_RATE_LIMIT=10

# SendGrid Configuration (Fallback)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company

# Email Hierarchy Configuration
EMAIL_HIERARCHY_ENABLED=true
EMAIL_HIERARCHY_HEALTH_CHECK_INTERVAL=300000
EMAIL_HIERARCHY_FALLBACK_TIMEOUT=10000
EMAIL_HIERARCHY_LOG_LEVEL=info
```

## 7. Testing Implementation

### 7.1 SMTP Provider Tests

```typescript
// packages/api/src/features/notifications/__tests__/infrastructure/lib/providers/SMTPProvider.test.ts
import { SMTPProvider, SMTPConfig } from '../../../../../src/features/notifications/infrastructure/lib/providers/SMTPProvider';
import { Notification } from '../../../../../src/features/notifications/domain/entities/Notification.entity';
import { NotificationType, NotificationChannel } from '../../../../../src/features/notifications/domain/types';

describe('SMTPProvider', () => {
  let smtpProvider: SMTPProvider;
  let mockConfig: SMTPConfig;

  beforeEach(() => {
    mockConfig = {
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'test-password'
      },
      from: {
        email: 'noreply@test.com',
        name: 'Test Company'
      }
    };

    smtpProvider = new SMTPProvider(mockConfig);
  });

  describe('send', () => {
    it('should send notification successfully', async () => {
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test message',
        channels: [NotificationChannel.EMAIL]
      });

      const result = await smtpProvider.send(notification, 'recipient@test.com');

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.metadata.provider).toBe('smtp');
    });
  });

  describe('isAvailable', () => {
    it('should return true when configuration is valid', async () => {
      const isAvailable = await smtpProvider.isAvailable();
      expect(isAvailable).toBe(true);
    });
  });

  describe('getName and getType', () => {
    it('should return correct provider name and type', () => {
      expect(smtpProvider.getName()).toBe('SMTP');
      expect(smtpProvider.getType()).toBe('email');
    });
  });
});
```

## 7. Testing the Provider Hierarchy

### 7.1 Email Provider Hierarchy Tests

```typescript
// packages/api/src/features/notifications/__tests__/infrastructure/lib/providers/EmailProviderHierarchy.test.ts
import { EmailProviderHierarchy } from '../../../../../src/features/notifications/infrastructure/lib/providers/EmailProviderHierarchy';
import { TencentSESProvider } from '../../../../../src/features/notifications/infrastructure/lib/providers/TencentSESProvider';
import { SMTPProvider } from '../../../../../src/features/notifications/infrastructure/lib/providers/SMTPProvider';
import { SendGridProvider } from '../../../../../src/features/notifications/infrastructure/lib/providers/SendGridProvider';
import { Notification } from '../../../../../src/features/notifications/domain/entities/Notification.entity';
import { NotificationType, NotificationChannel } from '../../../../../src/features/notifications/domain/types';

describe('EmailProviderHierarchy', () => {
  let emailHierarchy: EmailProviderHierarchy;
  let mockTencentProvider: jest.Mocked<TencentSESProvider>;
  let mockSmtpProvider: jest.Mocked<SMTPProvider>;
  let mockSendGridProvider: jest.Mocked<SendGridProvider>;

  beforeEach(() => {
    mockTencentProvider = {
      send: jest.fn(),
      isAvailable: jest.fn(),
      getName: jest.fn().mockReturnValue('Tencent SES'),
      getType: jest.fn().mockReturnValue(NotificationChannel.EMAIL)
    } as any;

    mockSmtpProvider = {
      send: jest.fn(),
      isAvailable: jest.fn(),
      getName: jest.fn().mockReturnValue('SMTP'),
      getType: jest.fn().mockReturnValue(NotificationChannel.EMAIL)
    } as any;

    mockSendGridProvider = {
      send: jest.fn(),
      isAvailable: jest.fn(),
      getName: jest.fn().mockReturnValue('SendGrid'),
      getType: jest.fn().mockReturnValue(NotificationChannel.EMAIL)
    } as any;

    emailHierarchy = new EmailProviderHierarchy(
      mockTencentProvider,
      mockSmtpProvider,
      mockSendGridProvider
    );
  });

  describe('send', () => {
    it('should send successfully with primary provider (Tencent SES)', async () => {
      // Arrange
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Email',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      mockTencentProvider.isAvailable.mockResolvedValue(true);
      mockTencentProvider.send.mockResolvedValue({
        success: true,
        messageId: 'tencent-123'
      });

      // Act
      const result = await emailHierarchy.send(notification, 'test@example.com');

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('tencent-123');
      expect(result.metadata.successfulProvider).toBe('Tencent SES');
      expect(result.metadata.hierarchyLevel).toBe(1);
      expect(mockTencentProvider.send).toHaveBeenCalledWith(notification, 'test@example.com');
    });

    it('should fallback to SMTP when Tencent SES fails', async () => {
      // Arrange
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Email',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      mockTencentProvider.isAvailable.mockResolvedValue(true);
      mockTencentProvider.send.mockResolvedValue({
        success: false,
        error: 'Tencent SES unavailable'
      });

      mockSmtpProvider.isAvailable.mockResolvedValue(true);
      mockSmtpProvider.send.mockResolvedValue({
        success: true,
        messageId: 'smtp-456'
      });

      // Act
      const result = await emailHierarchy.send(notification, 'test@example.com');

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('smtp-456');
      expect(result.metadata.successfulProvider).toBe('SMTP');
      expect(result.metadata.hierarchyLevel).toBe(2);
      expect(mockSmtpProvider.send).toHaveBeenCalledWith(notification, 'test@example.com');
    });

    it('should fallback to SendGrid when both Tencent SES and SMTP fail', async () => {
      // Arrange
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Email',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      mockTencentProvider.isAvailable.mockResolvedValue(true);
      mockTencentProvider.send.mockResolvedValue({
        success: false,
        error: 'Tencent SES unavailable'
      });

      mockSmtpProvider.isAvailable.mockResolvedValue(true);
      mockSmtpProvider.send.mockResolvedValue({
        success: false,
        error: 'SMTP unavailable'
      });

      mockSendGridProvider.isAvailable.mockResolvedValue(true);
      mockSendGridProvider.send.mockResolvedValue({
        success: true,
        messageId: 'sendgrid-789'
      });

      // Act
      const result = await emailHierarchy.send(notification, 'test@example.com');

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('sendgrid-789');
      expect(result.metadata.successfulProvider).toBe('SendGrid');
      expect(result.metadata.hierarchyLevel).toBe(3);
      expect(mockSendGridProvider.send).toHaveBeenCalledWith(notification, 'test@example.com');
    });

    it('should fail when all providers are unavailable', async () => {
      // Arrange
      const notification = Notification.create({
        userId: 'user-123',
        type: NotificationType.INFO,
        title: 'Test Email',
        message: 'Test message',
        channels: [NotificationChannel.EMAIL]
      });

      mockTencentProvider.isAvailable.mockResolvedValue(false);
      mockSmtpProvider.isAvailable.mockResolvedValue(false);
      mockSendGridProvider.isAvailable.mockResolvedValue(false);

      // Act
      const result = await emailHierarchy.send(notification, 'test@example.com');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('All email providers failed');
      expect(result.metadata.totalAttempts).toBe(3);
    });
  });

  describe('health monitoring', () => {
    it('should track provider health status', async () => {
      // Act
      await emailHierarchy.refreshHealthStatus();

      // Assert
      const stats = emailHierarchy.getProviderStats();
      expect(stats).toHaveLength(3);
      expect(stats[0].provider).toBe('Tencent SES');
      expect(stats[1].provider).toBe('SMTP');
      expect(stats[2].provider).toBe('SendGrid');
    });

    it('should identify healthy providers', async () => {
      // Arrange
      mockTencentProvider.isAvailable.mockResolvedValue(true);
      mockSmtpProvider.isAvailable.mockResolvedValue(false);
      mockSendGridProvider.isAvailable.mockResolvedValue(true);

      // Act
      await emailHierarchy.refreshHealthStatus();
      const healthyProviders = emailHierarchy.getHealthyProviders();

      // Assert
      expect(healthyProviders).toContain('Tencent SES');
      expect(healthyProviders).toContain('SendGrid');
      expect(healthyProviders).not.toContain('SMTP');
    });
  });
});
```

## Conclusion

This implementation guide provides a comprehensive approach to integrating a three-tier email provider hierarchy while maintaining clean architecture principles. The modular design allows for:

1. **Triple Redundancy**: Automatic failover from Tencent SES → SMTP → SendGrid
2. **Cost Optimization**: Primary use of cost-effective Tencent SES with reliable fallbacks
3. **Geographic Optimization**: Tencent SES optimized for Asian markets
4. **Robust Error Handling**: Provider-specific error classification and retry logic
5. **Comprehensive Monitoring**: Health status tracking and provider performance metrics
6. **Configuration Management**: Environment-based configuration with sensible defaults
7. **Testing Support**: Unit tests for all components and hierarchy scenarios

The implementation can be done incrementally, starting with the individual providers and progressively adding the hierarchy logic and enhanced monitoring features.