export interface GetNotificationAnalyticsResponse {
  success: boolean;
  analytics?: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    failureRate: number;
    averageDeliveryTime?: number;
    byType?: Record<string, {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    }>;
    byChannel?: Record<string, {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    }>;
    byDate?: Array<{
      date: string;
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    }>;
  };
  error?: string;
}