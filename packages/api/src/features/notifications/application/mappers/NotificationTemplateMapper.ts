import { NotificationTemplate } from '../../domain/entities/NotificationTemplate.entity';
import { NotificationTemplateResponse } from '../dtos/output/NotificationTemplateResponse';

export class NotificationTemplateMapper {
  static toResponse(template: NotificationTemplate): NotificationTemplateResponse {
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      channel: template.channel,
      subject: template.subject || '',
      content: template.template,
      variables: Object.keys(template.variables),
      metadata: template.metadata,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }

  static toResponseList(templates: NotificationTemplate[]): NotificationTemplateResponse[] {
    return templates.map(template => this.toResponse(template));
  }
}