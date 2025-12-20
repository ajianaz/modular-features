import {
  IChannelRouter,
  INotificationProvider,
  NotificationChannel,
  RoutingParams,
  RoutingTable,
  RoutingTableEntry
} from '../../domain/interfaces/IProvider';
import { ProviderRegistry } from './ProviderRegistry';

/**
 * Channel Router
 * 
 * Routes notifications to appropriate providers based on channel and priority.
 * Supports fallback providers and dynamic routing.
 */
export class ChannelRouter implements IChannelRouter {
  private registry: ProviderRegistry;
  private routingTable: RoutingTable = {};
  private fallbackTable: Map<string, string> = new Map();

  constructor(registry: ProviderRegistry) {
    this.registry = registry;
  }

  /**
   * Route notification to appropriate provider
   */
  route(channel: NotificationChannel, params: RoutingParams): INotificationProvider {
    const providers = this.registry.getByType(channel);
    
    if (providers.length === 0) {
      throw new Error(`No providers available for channel: ${channel}`);
    }

    // Get routing entries for this channel
    const entries = this.routingTable[channel] || [];
    
    // Sort by priority (lower number = higher priority)
    const sortedEntries = entries.sort((a, b) => a.priority - b.priority);
    
    // Find the first available provider
    for (const entry of sortedEntries) {
      const provider = this.registry.get(entry.provider);
      
      if (provider && entry.priority > 0) {
        // Check if provider should be used based on retry count
        const maxRetries = params.maxRetries || 3;
        
        if (params.retryCount && params.retryCount >= maxRetries) {
          // Try fallback provider
          const fallbackName = this.fallbackTable.get(entry.provider);
          if (fallbackName) {
            const fallbackProvider = this.registry.get(fallbackName);
            if (fallbackProvider) {
              return fallbackProvider;
            }
          }
        }
        
        return provider;
      }
    }

    // If no routing table entry, return the first available provider
    return providers[0];
  }

  /**
   * Set fallback provider for a channel
   */
  setFallback(channel: NotificationChannel, from: string, to: string): void {
    this.fallbackTable.set(from, to);
  }

  /**
   * Get routing table
   */
  getRoutingTable(): RoutingTable {
    return { ...this.routingTable };
  }

  /**
   * Add provider to routing table
   */
  addProvider(channel: NotificationChannel, providerName: string, priority: number = 1): void {
    if (!this.routingTable[channel]) {
      this.routingTable[channel] = [];
    }

    // Check if provider already exists
    const existingIndex = this.routingTable[channel].findIndex(
      entry => entry.provider === providerName
    );

    if (existingIndex >= 0) {
      // Update priority
      this.routingTable[channel][existingIndex].priority = priority;
    } else {
      // Add new entry
      this.routingTable[channel].push({
        provider: providerName,
        priority
      });
    }
  }

  /**
   * Remove provider from routing table
   */
  removeProvider(channel: NotificationChannel, providerName: string): void {
    if (!this.routingTable[channel]) {
      return;
    }

    this.routingTable[channel] = this.routingTable[channel].filter(
      entry => entry.provider !== providerName
    );
  }

  /**
   * Get routing entries for a channel
   */
  getChannelRouting(channel: NotificationChannel): RoutingTableEntry[] {
    return this.routingTable[channel] || [];
  }

  /**
   * Clear routing table
   */
  clear(): void {
    this.routingTable = {};
    this.fallbackTable.clear();
  }
}
