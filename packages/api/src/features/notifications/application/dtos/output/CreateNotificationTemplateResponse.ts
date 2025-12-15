import { NotificationTemplateResponse } from './NotificationTemplateResponse';

export interface CreateNotificationTemplateResponse {
  success: boolean;
  template?: NotificationTemplateResponse;
  error?: string;
  message?: string;
}