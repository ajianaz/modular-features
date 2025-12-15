// Export configuration components
export interface NotificationConfig {
  // Email provider configuration
  email?: {
    provider: 'sendgrid' | 'ses' | 'custom';
    apiKey?: string;
    fromEmail: string;
    fromName?: string;
  };

  // SMS provider configuration
  sms?: {
    provider: 'twilio' | 'aws-sns' | 'custom';
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
  };

  // Push notification provider configuration
  push?: {
    provider: 'firebase' | 'aws-sns' | 'custom';
    serviceAccountKey?: string;
    projectId?: string;
  };

  // General notification settings
  settings?: {
    maxRetries: number;
    retryDelay: number; // in seconds
    batchSize: number;
    enableRateLimit: boolean;
    rateLimitPerMinute: number;
  };
}

// Default configuration
export const defaultNotificationConfig: NotificationConfig = {
  settings: {
    maxRetries: 3,
    retryDelay: 60,
    batchSize: 100,
    enableRateLimit: true,
    rateLimitPerMinute: 60
  }
};