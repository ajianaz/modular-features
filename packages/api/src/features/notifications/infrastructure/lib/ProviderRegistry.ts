import {
  IProviderRegistry,
  INotificationProvider,
  NotificationChannel
} from '../../domain/interfaces/IProvider';

/**
 * Provider Registry
 * 
 * Manages all notification providers and allows dynamic lookup by name or type.
 */
export class ProviderRegistry implements IProviderRegistry {
  private providers: Map<string, INotificationProvider> = new Map();

  /**
   * Register a provider
   */
  register(provider: INotificationProvider): void {
    this.providers.set(provider.getName(), provider);
  }

  /**
   * Unregister a provider
   */
  unregister(name: string): void {
    this.providers.delete(name);
  }

  /**
   * Get provider by name
   */
  get(name: string): INotificationProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get providers by type (channel)
   */
  getByType(type: NotificationChannel): INotificationProvider[] {
    return Array.from(this.providers.values()).filter(
      provider => provider.getType() === type
    );
  }

  /**
   * Get all providers
   */
  getAll(): INotificationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider count
   */
  getCount(): number {
    return this.providers.size;
  }

  /**
   * Check if provider exists
   */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear();
  }
}
