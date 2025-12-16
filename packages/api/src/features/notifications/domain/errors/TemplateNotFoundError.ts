import { NotificationError } from './NotificationError';

export class TemplateNotFoundError extends NotificationError {
  constructor(slug: string) {
    super(`Template with slug ${slug} not found`, 'TEMPLATE_NOT_FOUND', 404);
  }
}