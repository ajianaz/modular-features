export interface RetryFailedNotificationRequest {
  notificationId: string;
  recipientId?: string; // Optional: for authorization check
  force?: boolean; // Force retry even if max attempts reached
}