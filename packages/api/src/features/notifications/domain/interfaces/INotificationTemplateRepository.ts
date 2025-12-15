import { NotificationTemplate } from '../entities/NotificationTemplate.entity';
import { NotificationType, NotificationChannel } from '../types';

export interface INotificationTemplateRepository {
  findById(id: string): Promise<NotificationTemplate | null>;
  findBySlug(slug: string): Promise<NotificationTemplate | null>;
  findByType(type: NotificationType): Promise<NotificationTemplate[]>;
  findByChannel(channel: NotificationChannel): Promise<NotificationTemplate[]>;
  create(template: NotificationTemplate): Promise<NotificationTemplate>;
  update(template: NotificationTemplate): Promise<NotificationTemplate>;
  delete(id: string): Promise<void>;
  findActive(): Promise<NotificationTemplate[]>;
  findByTypeAndChannel(type: NotificationType, channel: NotificationChannel): Promise<NotificationTemplate[]>;
  findSystemTemplates(): Promise<NotificationTemplate[]>;
  findUserTemplates(): Promise<NotificationTemplate[]>;
  activate(id: string): Promise<NotificationTemplate>;
  deactivate(id: string): Promise<NotificationTemplate>;
}