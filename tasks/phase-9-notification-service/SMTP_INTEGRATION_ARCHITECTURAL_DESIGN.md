# SMTP Integration Architectural Design for Notification Service

## Executive Summary

This document outlines the architectural design for integrating SMTP email functionality alongside the existing SendGrid provider in the modular monolith notification system. The design maintains clean architecture principles while providing flexibility for provider selection and robust error handling.

## Current State Analysis

### Existing Architecture Strengths
- **Clean Architecture**: Well-defined layers (Domain, Application, Infrastructure, Presentation)
- **Provider Pattern**: Consistent [`IEmailProvider`](packages/api/src/features/notifications/domain/interfaces/IEmailProvider.ts:4) interface
- **Dependency Injection**: Centralized container pattern in [`NotificationsContainer`](packages/api/src/features/notifications/infrastructure/container/NotificationsContainer.ts:43)
- **Template System**: Complete [`TemplateRenderer`](packages/api/src/features/notifications/infrastructure/lib/services/TemplateRenderer.ts:9) implementation
- **Entity Model**: Comprehensive domain entities with proper business logic

### Current Gaps
- **Repository Implementation**: Mock implementations in repositories (20% complete)
- **Provider Selection**: No strategy for choosing between providers
- **Delivery Tracking**: Limited tracking infrastructure
- **Error Handling**: Basic error handling without SMTP-specific considerations

## Architectural Design for SMTP Integration

### 1. SMTP Provider Architecture

#### 1.1 Provider Implementation Pattern

```typescript
// New SMTP Provider following existing patterns
export class SMTPProvider implements IEmailProvider, INotificationProvider {
  private readonly config: SMTPConfig;
  private readonly transport: nodemailer.Transporter;

  constructor(config: SMTPConfig) {
    this.config = config;
    this.transport = nodemailer.createTransporter(config);
  }

  // Implement IEmailProvider interface
  async send(notification: Notification, recipient: string): Promise<NotificationDeliveryResult>
  async sendEmail(to: string, subject: string, content: string, options?: EmailOptions): Promise<NotificationDeliveryResult>
  async isAvailable(): Promise<boolean>
  getName(): string
  getType(): string
}
```

#### 1.2 Configuration Structure

```typescript
interface SMTPConfig {
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
```

### 2. Provider Selection Strategy

#### 2.1 Email Provider Factory

```typescript
export class EmailProviderFactory {
  private sendGridProvider: SendGridProvider;
  private smtpProvider: SMTPProvider;
  private strategy: ProviderSelectionStrategy;

  getProvider(context: EmailContext): IEmailProvider {
    return this.strategy.selectProvider(context, {
      sendGrid: this.sendGridProvider,
      smtp: this.smtpProvider
    });
  }
}

interface EmailContext {
  priority: NotificationPriority;
  templateId?: string;
  recipientCount: number;
  requiresTracking: boolean;
  contentType: 'marketing' | 'transactional' | 'system';
}
```

#### 2.2 Selection Strategies

1. **Priority-Based Selection**
   - High/Urgent: SendGrid (better deliverability)
   - Normal/Low: SMTP (cost-effective)

2. **Content-Based Selection**
   - Marketing: SendGrid (better analytics)
   - Transactional: SMTP (direct control)
   - System: SMTP (reliable for internal)

3. **Fallback Strategy**
   - Primary: SendGrid
   - Fallback: SMTP
   - Health checks every 5 minutes

### 3. Enhanced Repository Implementation

#### 3.1 Delivery Tracking Repository

```typescript
export class NotificationDeliveryRepository implements INotificationDeliveryRepository {
  async createDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery>
  async updateDeliveryStatus(deliveryId: string, status: DeliveryStatus, metadata?: any): Promise<void>
  async getDeliveriesByNotificationId(notificationId: string): Promise<NotificationDelivery[]>
  async getFailedDeliveries(since: Date): Promise<NotificationDelivery[]>
  async getDeliveryStats(provider: string, period: TimePeriod): Promise<DeliveryStats>
}
```

#### 3.2 Provider Health Tracking

```typescript
export class ProviderHealthRepository {
  async recordHealthCheck(provider: string, isHealthy: boolean, responseTime: number): Promise<void>
  async getProviderHealth(provider: string, period: TimePeriod): Promise<ProviderHealth>
  async getHealthyProviders(): Promise<string[]>
}
```

### 4. Template Rendering Integration

#### 4.1 SMTP-Specific Template Processing

```typescript
export class SMTPTemplateProcessor {
  constructor(
    private templateRenderer: TemplateRenderer,
    private htmlSanitizer: HTMLSanitizer
  ) {}

  async processEmailTemplate(
    template: NotificationTemplate,
    variables: Record<string, any>,
    options: EmailOptions
  ): Promise<ProcessedEmail> {
    const rendered = this.templateRenderer.render(template.template, variables);

    return {
      html: this.htmlSanitizer.sanitize(rendered),
      text: this.htmlToText(rendered),
      subject: this.templateRenderer.render(template.subject || '', variables),
      attachments: this.processAttachments(options.attachments || [])
    };
  }
}
```

### 5. Error Handling and Retry Mechanism

#### 5.1 SMTP-Specific Error Handling

```typescript
export class SMTPErrorHandler {
  handleError(error: Error): NotificationDeliveryResult {
    if (this.isTransientError(error)) {
      return {
        success: false,
        error: error.message,
        retryable: true,
        retryDelay: this.calculateRetryDelay(error),
        metadata: { errorType: 'transient', originalError: error.message }
      };
    }

    if (this.isPermanentError(error)) {
      return {
        success: false,
        error: error.message,
        retryable: false,
        metadata: { errorType: 'permanent', originalError: error.message }
      };
    }

    // Default handling
    return {
      success: false,
      error: error.message,
      retryable: true,
      metadata: { errorType: 'unknown', originalError: error.message }
    };
  }

  private isTransientError(error: Error): boolean {
    const transientCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'];
    return transientCodes.some(code => error.message.includes(code));
  }

  private isPermanentError(error: Error): boolean {
    const permanentPatterns = [
      /user not found/i,
      /invalid recipient/i,
      /authentication failed/i,
      /550/i
    ];
    return permanentPatterns.some(pattern => pattern.test(error.message));
  }
}
```

#### 5.2 Enhanced Retry Manager

```typescript
export class EnhancedRetryManager {
  async retryFailedNotification(
    notification: Notification,
    delivery: NotificationDelivery,
    alternativeProvider?: IEmailProvider
  ): Promise<NotificationDeliveryResult> {
    if (!notification.canRetry()) {
      return { success: false, error: 'Max retries exceeded' };
    }

    const updatedNotification = notification.incrementRetry(delivery.lastError);

    // Try with alternative provider if specified
    const provider = alternativeProvider || this.getProviderForRetry(delivery.provider);

    try {
      const result = await provider.send(updatedNotification, updatedNotification.userId);

      if (result.success) {
        await this.updateDeliveryStatus(delivery.id, 'delivered', result.metadata);
        return result;
      }

      // Schedule next retry if still retryable
      if (result.retryable && updatedNotification.canRetry()) {
        await this.scheduleRetry(updatedNotification, delivery, result.retryDelay);
      }

      return result;
    } catch (error) {
      return this.handleRetryError(error, updatedNotification, delivery);
    }
  }
}
```

## Configuration Requirements

### 1. Environment Variables

```bash
# SMTP Configuration
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

# Provider Selection Strategy
EMAIL_PROVIDER_STRATEGY=priority-based
EMAIL_PRIMARY_PROVIDER=sendgrid
EMAIL_FALLBACK_PROVIDER=smtp
EMAIL_HEALTH_CHECK_INTERVAL=300000

# SendGrid Configuration (existing)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company
```

### 2. Configuration Schema

```typescript
export interface NotificationConfig {
  email: {
    providers: {
      sendgrid: SendGridConfig;
      smtp: SMTPConfig;
    };
    selection: {
      strategy: 'priority' | 'content' | 'fallback' | 'round-robin';
      primary: string;
      fallback: string;
      healthCheckInterval: number;
    };
    templates: {
      cacheEnabled: boolean;
      cacheTTL: number;
    };
  };
}
```

## Implementation Complexity Assessment

### Low Complexity Components
1. **SMTP Provider Implementation** (1-2 days)
   - Follows existing provider pattern
   - Well-documented nodemailer library
   - Minimal interface changes required

2. **Configuration Updates** (0.5 day)
   - Add environment variables
   - Update configuration schema

### Medium Complexity Components
1. **Provider Selection Strategy** (2-3 days)
   - Implement factory pattern
   - Add health checking
   - Create selection algorithms

2. **Repository Implementation** (3-4 days)
   - Complete mock implementations
   - Add delivery tracking
   - Implement provider health tracking

### High Complexity Components
1. **Enhanced Error Handling** (2-3 days)
   - SMTP-specific error classification
   - Retry logic with exponential backoff
   - Provider switching on failures

2. **Template Processing** (1-2 days)
   - HTML sanitization for SMTP
   - Attachment processing
   - Multi-format rendering

## Impact on Existing Components

### 1. Minimal Impact Components
- **Domain Entities**: No changes required
- **Use Cases**: Minor updates for provider selection
- **Controllers**: No changes required

### 2. Moderate Impact Components
- **NotificationsContainer**: Add SMTP provider registration
- **SendNotificationUseCase**: Update to use provider factory
- **Configuration**: Add SMTP configuration

### 3. Significant Impact Components
- **Repository Implementations**: Complete mock implementations
- **Provider Infrastructure**: Add factory and selection logic
- **Error Handling**: Enhance for SMTP-specific scenarios

## Recommended Implementation Priority

### Phase 1: Foundation (Week 1)
1. **SMTP Provider Implementation** (High Priority)
   - Basic SMTP provider following existing patterns
   - Configuration integration
   - Basic testing

2. **Repository Completion** (High Priority)
   - Complete NotificationRepository implementation
   - Add NotificationDeliveryRepository
   - Basic delivery tracking

### Phase 2: Provider Selection (Week 2)
1. **Provider Factory** (High Priority)
   - Implement factory pattern
   - Basic selection strategy
   - Health checking

2. **Configuration Enhancement** (Medium Priority)
   - Add SMTP configuration
   - Provider selection settings
   - Environment variable handling

### Phase 3: Advanced Features (Week 3)
1. **Enhanced Error Handling** (Medium Priority)
   - SMTP-specific error classification
   - Retry mechanisms
   - Provider fallback

2. **Template Processing** (Medium Priority)
   - HTML sanitization
   - Attachment handling
   - Multi-format rendering

### Phase 4: Monitoring & Analytics (Week 4)
1. **Provider Analytics** (Low Priority)
   - Delivery statistics
   - Performance metrics
   - Health monitoring

2. **Testing & Documentation** (Medium Priority)
   - Comprehensive testing
   - API documentation
   - Deployment guides

## Potential Challenges and Solutions

### 1. Challenge: SMTP Deliverability
**Solution**:
- Implement proper SPF/DKIM/DMARC configuration
- Use dedicated IP addresses for high-volume sending
- Monitor bounce rates and implement list hygiene

### 2. Challenge: Provider Health Monitoring
**Solution**:
- Implement regular health checks
- Use circuit breaker pattern for failing providers
- Log detailed metrics for provider performance

### 3. Challenge: Template Consistency
**Solution**:
- Create template validation that works across providers
- Implement provider-specific template processing
- Use responsive HTML design for cross-client compatibility

### 4. Challenge: Error Handling Complexity
**Solution**:
- Create comprehensive error classification system
- Implement standardized error responses
- Use retry policies with exponential backoff

## Security Considerations

### 1. Credential Management
- Use environment variables for SMTP credentials
- Implement credential rotation
- Consider using secret management services

### 2. Content Security
- Sanitize HTML content to prevent XSS
- Validate attachment types and sizes
- Implement rate limiting to prevent abuse

### 3. Network Security
- Use TLS/SSL for SMTP connections
- Validate SSL certificates
- Implement connection timeouts

## Monitoring and Observability

### 1. Key Metrics
- Delivery success rate by provider
- Average delivery time
- Error rates by error type
- Provider health status
- Queue depth and processing time

### 2. Alerting
- High failure rates (>5%)
- Provider downtime
- Queue buildup
- Authentication failures

### 3. Logging
- Structured logging for all email operations
- Correlation IDs for tracking
- Error details with stack traces
- Performance metrics

## Conclusion

The SMTP integration design maintains the existing clean architecture while adding flexibility and resilience. The implementation prioritizes core functionality first, followed by advanced features. The modular design allows for incremental implementation and testing.

The estimated total implementation time is 3-4 weeks, with the most critical components (SMTP provider and repository completion) deliverable in the first week. This approach ensures rapid value delivery while building a robust foundation for future enhancements.