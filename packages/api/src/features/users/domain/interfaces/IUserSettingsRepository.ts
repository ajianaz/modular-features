import { UserSettings } from '../entities/UserSettings.entity';

// Interface for UserSettings repository operations
export interface IUserSettingsRepository {
  // CRUD operations
  findById(id: string): Promise<UserSettings | null>;
  findByUserId(userId: string): Promise<UserSettings | null>;
  create(settings: UserSettings): Promise<UserSettings>;
  update(settings: UserSettings): Promise<UserSettings>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(limit?: number, offset?: number): Promise<UserSettings[]>;
  findByTheme(theme: string): Promise<UserSettings[]>;
  findByLanguage(language: string): Promise<UserSettings[]>;
  findByTimezone(timezone: string): Promise<UserSettings[]>;

  // Filter operations
  findByNotificationSettings(filters: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  }): Promise<UserSettings[]>;

  findBySecuritySettings(filters: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
  }): Promise<UserSettings[]>;

  findByPrivacySettings(filters: {
    showOnlineStatus?: boolean;
    profileVisibility?: string;
  }): Promise<UserSettings[]>;

  // Existence checks
  existsById(id: string): Promise<boolean>;
  existsByUserId(userId: string): Promise<boolean>;

  // Batch operations
  createMany(settings: UserSettings[]): Promise<UserSettings[]>;
  updateMany(settings: UserSettings[]): Promise<UserSettings[]>;
  deleteMany(ids: string[]): Promise<boolean>;

  // Count operations
  count(): Promise<number>;
  countByTheme(theme: string): Promise<number>;
  countByLanguage(language: string): Promise<number>;
  countByTimezone(timezone: string): Promise<number>;
  countWithTwoFactorEnabled(): Promise<number>;
  countWithMarketingEmails(): Promise<number>;

  // Advanced queries
  findWithFilters(filters: {
    theme?: string;
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    twoFactorEnabled?: boolean;
    minSessionTimeout?: number;
    maxSessionTimeout?: number;
    showOnlineStatus?: boolean;
    profileVisibility?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserSettings[]>;

  // Security and privacy focused queries
  findUsersWithTwoFactorDisabled(): Promise<UserSettings[]>;
  findUsersWithLongSessionTimeout(hours: number): Promise<UserSettings[]>;
  findUsersWithPublicProfiles(): Promise<UserSettings[]>;
  findUsersWithPrivateProfiles(): Promise<UserSettings[]>;
  findUsersWithMarketingEmailsEnabled(): Promise<UserSettings[]>;
  findUsersWithAllNotificationsEnabled(): Promise<UserSettings[]>;
  findUsersWithAllNotificationsDisabled(): Promise<UserSettings[]>;

  // Recent activity
  findRecentlyUpdated(hours: number): Promise<UserSettings[]>;
  findRecentlyCreated(hours: number): Promise<UserSettings[]>;

  // Settings analytics
  getThemeDistribution(): Promise<{ theme: string; count: number }[]>;
  getLanguageDistribution(): Promise<{ language: string; count: number }[]>;
  getTimezoneDistribution(): Promise<{ timezone: string; count: number }[]>;
  getNotificationSettingsSummary(): Promise<{
    emailNotifications: number;
    pushNotifications: number;
    smsNotifications: number;
    marketingEmails: number;
  }>;
  getSecuritySettingsSummary(): Promise<{
    twoFactorEnabled: number;
    averageSessionTimeout: number;
  }>;
  getPrivacySettingsSummary(): Promise<{
    publicProfiles: number;
    privateProfiles: number;
    showOnlineStatus: number;
  }>;
}