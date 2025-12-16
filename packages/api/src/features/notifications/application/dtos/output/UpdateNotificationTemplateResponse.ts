import { NotificationTemplateResponse } from './NotificationTemplateResponse';

export interface UpdateNotificationTemplateResponse {
  success: boolean;
  template?: NotificationTemplateResponse;
  error?: string;
  message?: string;
}