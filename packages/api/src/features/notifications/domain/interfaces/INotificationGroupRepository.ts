import { NotificationGroup } from '../entities/NotificationGroup.entity';

export interface INotificationGroupRepository {
  findById(id: string): Promise<NotificationGroup | null>;
  findByName(name: string): Promise<NotificationGroup | null>;
  create(group: NotificationGroup): Promise<NotificationGroup>;
  update(group: NotificationGroup): Promise<NotificationGroup>;
  delete(id: string): Promise<void>;
  findAll(): Promise<NotificationGroup[]>;
  findActive(): Promise<NotificationGroup[]>;
  findSystemGroups(): Promise<NotificationGroup[]>;
  findUserGroups(): Promise<NotificationGroup[]>;
}