import { notificationRepository } from '../repositories/NotificationRepository';
import { SendNotificationUseCase } from '../../application/useCases/SendNotificationUseCase';
import { notificationDeliveryRepository } from '../repositories/NotificationDeliveryRepository';
import { notificationAnalyticsRepository } from '../repositories/NotificationAnalyticsRepository';

/**
 * Notification Scheduler Job
 * 
 * Processes scheduled notifications and sends them when due
 */
export class NotificationSchedulerJob {
  private sendNotificationUseCase: SendNotificationUseCase;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase();
  }

  /**
   * Start the scheduler
   */
  start(intervalMs: number = 60000): void {
    if (this.interval) {
      console.log('[NotificationScheduler] Already running');
      return;
    }

    console.log('[NotificationScheduler] Starting scheduler...');
    
    // Run immediately on start
    this.process();

    // Schedule to run every interval
    this.interval = setInterval(() => {
      this.process();
    }, intervalMs);

    console.log(`[NotificationScheduler] Scheduler started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[NotificationScheduler] Scheduler stopped');
    }
  }

  /**
   * Process scheduled notifications
   */
  private async process(): Promise<void> {
    try {
      const startTime = Date.now();
      console.log('[NotificationScheduler] Processing scheduled notifications...');

      // Find notifications that are scheduled to be sent
      const scheduled = await notificationRepository.findScheduledToSend();

      if (scheduled.length === 0) {
        console.log('[NotificationScheduler] No scheduled notifications to process');
        return;
      }

      console.log(`[NotificationScheduler] Found ${scheduled.length} scheduled notifications`);

      let successCount = 0;
      let failureCount = 0;

      for (const notification of scheduled) {
        try {
          // Update status to processing
          await notificationRepository.updateStatus(notification.id, 'processing');

          // Send notification (this is simplified - would need to reconstruct full params)
          // In real implementation, you'd store all original params in metadata
          const result = await this.sendNotificationUseCase.execute({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            channels: notification.channels as any[],
            data: notification.metadata as any,
            priority: notification.priority as any
          });

          if (result.results.some(r => r.success)) {
            successCount++;
            await notificationRepository.updateStatus(notification.id, 'sent');
          } else {
            failureCount++;
            await notificationRepository.updateStatus(notification.id, 'failed');
          }

        } catch (error) {
          console.error(`[NotificationScheduler] Error processing notification ${notification.id}:`, error);
          failureCount++;
          await notificationRepository.updateStatus(notification.id, 'failed');
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[NotificationScheduler] Completed: ${successCount} succeeded, ` +
        `${failureCount} failed (${duration}ms)`
      );

    } catch (error) {
      console.error('[NotificationScheduler] Error in scheduler:', error);
    }
  }
}

/**
 * Notification Retry Job
 * 
 * Retries failed notifications
 */
export class NotificationRetryJob {
  private sendNotificationUseCase: SendNotificationUseCase;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.sendNotificationUseCase = new SendNotificationUseCase();
  }

  /**
   * Start the retry job
   */
  start(intervalMs: number = 300000): void {
    if (this.interval) {
      console.log('[NotificationRetry] Already running');
      return;
    }

    console.log('[NotificationRetry] Starting retry job...');
    
    // Run immediately
    this.process();

    this.interval = setInterval(() => {
      this.process();
    }, intervalMs);

    console.log(`[NotificationRetry] Retry job started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop the retry job
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[NotificationRetry] Retry job stopped');
    }
  }

  /**
   * Process failed deliveries for retry
   */
  private async process(): Promise<void> {
    try {
      const startTime = Date.now();
      console.log('[NotificationRetry] Processing failed deliveries...');

      const failedDeliveries = await notificationDeliveryRepository.findReadyForRetry();

      if (failedDeliveries.length === 0) {
        console.log('[NotificationRetry] No failed deliveries to retry');
        return;
      }

      console.log(`[NotificationRetry] Found ${failedDeliveries.length} failed deliveries for retry`);

      let successCount = 0;
      let failureCount = 0;

      for (const delivery of failedDeliveries) {
        try {
          // Get the notification
          const notification = await notificationRepository.findById(delivery.notificationId);

          if (!notification) {
            continue;
          }

          // Retry sending (simplified - would need provider and params)
          // In real implementation, reconstruct send params from delivery data
          await notificationDeliveryRepository.updateStatus(
            delivery.id,
            'sent'
          );
          successCount++;

        } catch (error) {
          console.error(`[NotificationRetry] Error retrying delivery ${delivery.id}:`, error);
          await notificationDeliveryRepository.markAsFailed(
            delivery.id,
            error instanceof Error ? error.message : 'Retry failed'
          );
          failureCount++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[NotificationRetry] Completed: ${successCount} succeeded, ` +
        `${failureCount} failed (${duration}ms)`
      );

    } catch (error) {
      console.error('[NotificationRetry] Error in retry job:', error);
    }
  }
}

/**
 * Notification Cleanup Job
 * 
 * Cleans up old notifications and delivery records
 */
export class NotificationCleanupJob {
  private interval: NodeJS.Timeout | null = null;

  /**
   * Start the cleanup job
   */
  start(intervalMs: number = 3600000): void {
    if (this.interval) {
      console.log('[NotificationCleanup] Already running');
      return;
    }

    console.log('[NotificationCleanup] Starting cleanup job...');
    
    // Run immediately
    this.process();

    this.interval = setInterval(() => {
      this.process();
    }, intervalMs);

    console.log(`[NotificationCleanup] Cleanup job started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[NotificationCleanup] Cleanup job stopped');
    }
  }

  /**
   * Process cleanup
   */
  private async process(): Promise<void> {
    try {
      const startTime = Date.now();
      console.log('[NotificationCleanup] Processing cleanup...');

      // Delete old notifications
      const deletedNotifications = await notificationRepository.deleteOlderThan(30);
      console.log(`[NotificationCleanup] Deleted ${deletedNotifications} old notifications`);

      // Delete old delivery records
      const deletedDeliveries = await notificationDeliveryRepository.deleteOlderThan(30);
      console.log(`[NotificationCleanup] Deleted ${deletedDeliveries} old delivery records`);

      // Delete old analytics
      const deletedAnalytics = await notificationAnalyticsRepository.deleteOlderThan(90);
      console.log(`[NotificationCleanup] Deleted ${deletedAnalytics} old analytics records`);

      const duration = Date.now() - startTime;
      console.log(`[NotificationCleanup] Cleanup completed (${duration}ms)`);

    } catch (error) {
      console.error('[NotificationCleanup] Error in cleanup job:', error);
    }
  }
}

/**
 * Start all notification background jobs
 */
export function startNotificationJobs(): void {
  const scheduler = new NotificationSchedulerJob();
  const retryJob = new NotificationRetryJob();
  const cleanupJob = new NotificationCleanupJob();

  scheduler.start(60000); // Every minute
  retryJob.start(300000); // Every 5 minutes
  cleanupJob.start(3600000); // Every hour

  console.log('[NotificationJobs] All jobs started');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[NotificationJobs] Shutting down jobs...');
    scheduler.stop();
    retryJob.stop();
    cleanupJob.stop();
  });
}
