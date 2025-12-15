import { NotificationPreferenceResponse } from './NotificationPreferenceResponse';

export interface UpdateNotificationPreferenceResponse {
  success: boolean;
  preference?: NotificationPreferenceResponse;
  error?: string;
  message?: string;
}