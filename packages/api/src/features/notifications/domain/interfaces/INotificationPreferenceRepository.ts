import { NotificationPreference } from '../entities/NotificationPreference.entity';
import { NotificationFrequency } from '../types';

export interface INotificationPreferenceRepository {
  findById(id: string): Promise<NotificationPreference | null>;
  findByUserId(userId: string): Promise<NotificationPreference[]>;
  findByUserIdAndType(userId: string, type: string): Promise<NotificationPreference | null>;
  create(preference: NotificationPreference): Promise<NotificationPreference>;
  update(preference: NotificationPreference): Promise<NotificationPreference>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  findByType(type: string): Promise<NotificationPreference[]>;
  findByFrequency(frequency: NotificationFrequency): Promise<NotificationPreference[]>;
  findActive(): Promise<NotificationPreference[]>;
  updateByUserIdAndType(userId: string, type: string, data: Partial<NotificationPreference>): Promise<NotificationPreference>;
}