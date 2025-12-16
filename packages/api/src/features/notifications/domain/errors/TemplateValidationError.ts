import { NotificationError } from './NotificationError';

export class TemplateValidationError extends NotificationError {
  constructor(errors: string[]) {
    super(`Template validation failed: ${errors.join(', ')}`, 'TEMPLATE_VALIDATION_ERROR', 400);
  }
}