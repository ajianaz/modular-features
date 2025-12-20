import { NotificationChannel } from '../enums/NotificationChannel';

/**
 * Send notification parameters
 */
export interface SendNotificationParams {
  recipient: string;
  subject?: string;
  title?: string;
  content: string;
  textContent?: string;
  templateName?: string;
  templateComponents?: any[];
  templateParams?: string[];
  data?: Record<string, any>;
  attachments?: any[];
  deviceToken?: string;
  deviceTokens?: string[];
  topic?: string;
  channelId?: string;
  badge?: number;
  category?: string;
  priority?: 'normal' | 'high';
  previewUrl?: boolean;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  mediaUrl?: string;
  caption?: string;
}

/**
 * Notification delivery result
 */
export interface NotificationDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  provider: string;
  channel: NotificationChannel;
  sentAt: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Provider health status
 */
export interface ProviderHealth {
  healthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  [key: string]: any;
}

/**
 * Routing parameters
 */
export interface RoutingParams {
  fallback?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Routing table entry
 */
export interface RoutingTableEntry {
  provider: string;
  priority: number;
  fallback?: string;
}

/**
 * Routing table
 */
export interface RoutingTable {
  [channel: string]: RoutingTableEntry[];
}

/**
 * Notification Provider Interface
 * All notification providers must implement this interface
 */
export interface INotificationProvider {
  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Get provider type (channel)
   */
  getType(): NotificationChannel;

  /**
   * Get provider version
   */
  getVersion(): string;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Perform health check
   */
  healthCheck(): Promise<ProviderHealth>;

  /**
   * Send notification
   */
  send(params: SendNotificationParams): Promise<NotificationDeliveryResult>;

  /**
   * Configure provider
   */
  configure(config: ProviderConfig): void;

  /**
   * Get provider configuration
   */
  getConfig(): ProviderConfig;

  /**
   * Check if provider supports templates
   */
  supportsTemplates(): boolean;

  /**
   * Render template (if supported)
   */
  renderTemplate?(template: string, data: Record<string, any>): Promise<string>;
}

/**
 * Provider Registry Interface
 */
export interface IProviderRegistry {
  /**
   * Register a provider
   */
  register(provider: INotificationProvider): void;

  /**
   * Unregister a provider
   */
  unregister(name: string): void;

  /**
   * Get provider by name
   */
  get(name: string): INotificationProvider | undefined;

  /**
   * Get providers by type (channel)
   */
  getByType(type: NotificationChannel): INotificationProvider[];

  /**
   * Get all providers
   */
  getAll(): INotificationProvider[];
}

/**
 * Channel Router Interface
 */
export interface IChannelRouter {
  /**
   * Route notification to appropriate provider
   */
  route(channel: NotificationChannel, params: RoutingParams): INotificationProvider;

  /**
   * Set fallback provider for a channel
   */
  setFallback(channel: NotificationChannel, from: string, to: string): void;

  /**
   * Get routing table
   */
  getRoutingTable(): RoutingTable;
}
