export interface CancelNotificationRequest {
  notificationId: string;
  recipientId?: string; // Optional: for authorization check
  reason?: string;
}