import { NotificationPreference } from '../../domain/entities/NotificationPreference.entity';
import { NotificationPreferenceResponse } from '../dtos/output/NotificationPreferenceResponse';
import { NotificationChannel } from '../../domain/types';

export class NotificationPreferenceMapper {
  static toResponse(preference: NotificationPreference, channel: NotificationChannel): NotificationPreferenceResponse {
    return {
      id: preference.id,
      userId: preference.userId,
      type: preference.type as any, // Convert string to NotificationType for response
      channel: channel,
      enabled: preference.isChannelEnabled(channel),
      quietHours: preference.quietHoursEnabled ? {
        enabled: preference.quietHoursEnabled,
        startTime: preference.quietHoursStart || '',
        endTime: preference.quietHoursEnd || '',
        timezone: preference.timezone
      } : undefined,
      frequency: undefined, // Will be handled at a higher level based on preference type
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt
    };
  }

  static toResponseList(preferences: NotificationPreference[], channel: NotificationChannel): NotificationPreferenceResponse[] {
    return preferences.map(preference => this.toResponse(preference, channel));
  }
}