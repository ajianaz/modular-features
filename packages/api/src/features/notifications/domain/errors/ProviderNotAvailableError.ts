import { NotificationError } from './NotificationError';

export class ProviderNotAvailableError extends NotificationError {
  constructor(provider: string) {
    super(`Provider ${provider} is not available`, 'PROVIDER_NOT_AVAILABLE', 503);
  }
}