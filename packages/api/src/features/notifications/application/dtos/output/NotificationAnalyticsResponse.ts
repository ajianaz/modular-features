import { NotificationAnalytics } from '../../../domain/entities/NotificationAnalytics.entity';

export interface NotificationAnalyticsResponse {
  success: boolean;
  analytics?: NotificationAnalytics[];
  total?: number;
  error?: string;
  message?: string;
}