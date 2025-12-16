import { NotificationTemplateResponse } from './NotificationTemplateResponse';

export interface GetNotificationTemplatesResponse {
  success: boolean;
  templates: NotificationTemplateResponse[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  error?: string;
}