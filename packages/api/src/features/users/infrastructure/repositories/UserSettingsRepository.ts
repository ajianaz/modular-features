import { UserSettings } from '../../domain/entities/UserSettings.entity';
import { IUserSettingsRepository } from '../../domain/interfaces/IUserSettingsRepository';
import {
  UserSettingsNotFoundError
} from '../../domain/errors';
import { db } from '@modular-monolith/database';
import { userSettings } from '@modular-monolith/database';
import type { UserSetting as DBUserSetting, NewUserSetting } from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull, inArray } from '@modular-monolith/database';

export class UserSettingsRepository implements IUserSettingsRepository {
  async findById(id: string): Promise<UserSettings | null> {
    try {
      const result = await db.select().from(userSettings).where(eq(userSettings.id, id)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserSettingsRepository.findById error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find user settings by ID: ${error.message}`);
      }
      throw new Error('Failed to find user settings by ID: Unknown database error');
    }
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    try {
      const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserSettingsRepository.findByUserId error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find user settings by user ID: ${error.message}`);
      }
      throw new Error('Failed to find user settings by user ID: Unknown database error');
    }
  }

  async create(settings: UserSettings): Promise<UserSettings> {
    try {
      const newSettingsData: NewUserSetting = {
        userId: settings.userId,
        theme: settings.theme || 'auto',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        pushNotifications: settings.pushNotifications !== undefined ? settings.pushNotifications : true,
        smsNotifications: settings.smsNotifications !== undefined ? settings.smsNotifications : false,
        marketingEmails: settings.marketingEmails !== undefined ? settings.marketingEmails : false,
        twoFactorEnabled: settings.twoFactorEnabled !== undefined ? settings.twoFactorEnabled : false,
        sessionTimeout: settings.sessionTimeout || 24,
        autoSaveDrafts: settings.autoSaveDrafts !== undefined ? settings.autoSaveDrafts : true,
        showOnlineStatus: settings.showOnlineStatus !== undefined ? settings.showOnlineStatus : true,
        profileVisibility: settings.profileVisibility || 'public',
        customSettings: settings.customSettings || {}
      };

      const [insertedSettings] = await db.insert(userSettings).values(newSettingsData).returning();

      return this.mapToDomainEntity(insertedSettings!);
    } catch (error) {
      console.error('UserSettingsRepository.create error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create user settings: ${error.message}`);
      }
      throw new Error('Failed to create user settings: Unknown database error');
    }
  }

  async update(settings: UserSettings): Promise<UserSettings> {
    try {
      const updateData = {
        theme: settings.theme || 'auto',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
        marketingEmails: settings.marketingEmails,
        twoFactorEnabled: settings.twoFactorEnabled,
        sessionTimeout: settings.sessionTimeout || 24,
        autoSaveDrafts: settings.autoSaveDrafts,
        showOnlineStatus: settings.showOnlineStatus,
        profileVisibility: settings.profileVisibility || 'public',
        customSettings: settings.customSettings || {},
        updatedAt: new Date()
      };

      const [updatedSettings] = await db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, settings.userId))
        .returning();

      if (!updatedSettings) {
        throw new UserSettingsNotFoundError(`User settings with userId ${settings.userId} not found`);
      }

      return this.mapToDomainEntity(updatedSettings!);
    } catch (error) {
      console.error('UserSettingsRepository.update error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update user settings: ${error.message}`);
      }
      throw new Error('Failed to update user settings: Unknown database error');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userSettings)
        .where(eq(userSettings.id, id))
        .returning({ id: userSettings.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.delete error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete user settings: ${error.message}`);
      }
      throw new Error('Failed to delete user settings: Unknown database error');
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userSettings)
        .where(eq(userSettings.userId, userId))
        .returning({ id: userSettings.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.deleteByUserId error:', error);
      throw error;
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userSettings.createdAt));

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findAll error:', error);
      throw error;
    }
  }

  async findByTheme(theme: 'light' | 'dark' | 'auto'): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.theme, theme))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findByTheme error:', error);
      throw error;
    }
  }

  async findByLanguage(language: string): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.language, language))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findByLanguage error:', error);
      throw error;
    }
  }

  async findByTimezone(timezone: string): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.timezone, timezone))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findByTimezone error:', error);
      throw error;
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.existsById error:', error);
      throw error;
    }
  }

  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.existsByUserId error:', error);
      throw error;
    }
  }

  async createMany(settingsList: UserSettings[]): Promise<UserSettings[]> {
    try {
      const settingsData: NewUserSetting[] = settingsList.map(settings => ({
        userId: settings.userId,
        theme: settings.theme || 'auto',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        pushNotifications: settings.pushNotifications !== undefined ? settings.pushNotifications : true,
        smsNotifications: settings.smsNotifications !== undefined ? settings.smsNotifications : false,
        marketingEmails: settings.marketingEmails !== undefined ? settings.marketingEmails : false,
        twoFactorEnabled: settings.twoFactorEnabled !== undefined ? settings.twoFactorEnabled : false,
        sessionTimeout: settings.sessionTimeout || 24,
        autoSaveDrafts: settings.autoSaveDrafts !== undefined ? settings.autoSaveDrafts : true,
        showOnlineStatus: settings.showOnlineStatus !== undefined ? settings.showOnlineStatus : true,
        profileVisibility: settings.profileVisibility || 'public',
        customSettings: settings.customSettings || {}
      }));

      const insertedSettings = await db.insert(userSettings).values(settingsData).returning();

      return insertedSettings.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.createMany error:', error);
      throw error;
    }
  }

  async updateMany(settingsList: UserSettings[]): Promise<UserSettings[]> {
    try {
      const updatePromises = settingsList.map(settings => this.update(settings));
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('UserSettingsRepository.updateMany error:', error);
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      const result = await db
        .delete(userSettings)
        .where(inArray(userSettings.id, ids))
        .returning({ id: userSettings.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.deleteMany error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings);

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.count error:', error);
      throw error;
    }
  }

  async countByTheme(theme: 'light' | 'dark' | 'auto'): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.theme, theme));

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.countByTheme error:', error);
      throw error;
    }
  }

  async countByLanguage(language: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.language, language));

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.countByLanguage error:', error);
      throw error;
    }
  }

  async countByTimezone(timezone: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.timezone, timezone));

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.countByTimezone error:', error);
      throw error;
    }
  }

  async countWithTwoFactorEnabled(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.twoFactorEnabled, true));

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.countWithTwoFactorEnabled error:', error);
      throw error;
    }
  }

  async countWithMarketingEmails(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettings.id })
        .from(userSettings)
        .where(eq(userSettings.marketingEmails, true));

      return result.length;
    } catch (error) {
      console.error('UserSettingsRepository.countWithMarketingEmails error:', error);
      throw error;
    }
  }

  async findWithFilters(filters: {
    theme?: 'light' | 'dark' | 'auto';
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
    profileVisibility?: 'public' | 'private' | 'friends';
    limit?: number;
    offset?: number;
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.theme) {
        whereConditions.push(eq(userSettings.theme, filters.theme));
      }

      if (filters.language) {
        whereConditions.push(eq(userSettings.language, filters.language));
      }

      if (filters.timezone) {
        whereConditions.push(eq(userSettings.timezone, filters.timezone));
      }

      if (filters.emailNotifications !== undefined) {
        whereConditions.push(eq(userSettings.emailNotifications, filters.emailNotifications));
      }

      if (filters.pushNotifications !== undefined) {
        whereConditions.push(eq(userSettings.pushNotifications, filters.pushNotifications));
      }

      if (filters.smsNotifications !== undefined) {
        whereConditions.push(eq(userSettings.smsNotifications, filters.smsNotifications));
      }

      if (filters.marketingEmails !== undefined) {
        whereConditions.push(eq(userSettings.marketingEmails, filters.marketingEmails));
      }

      if (filters.twoFactorEnabled !== undefined) {
        whereConditions.push(eq(userSettings.twoFactorEnabled, filters.twoFactorEnabled));
      }

      if (filters.minSessionTimeout !== undefined) {
        whereConditions.push(gte(userSettings.sessionTimeout, filters.minSessionTimeout));
      }

      if (filters.maxSessionTimeout !== undefined) {
        whereConditions.push(lte(userSettings.sessionTimeout, filters.maxSessionTimeout));
      }

      if (filters.showOnlineStatus !== undefined) {
        whereConditions.push(eq(userSettings.showOnlineStatus, filters.showOnlineStatus));
      }

      if (filters.profileVisibility) {
        whereConditions.push(eq(userSettings.profileVisibility, filters.profileVisibility));
      }

      const result = await db
        .select()
        .from(userSettings)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(userSettings.createdAt));

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findWithFilters error:', error);
      throw error;
    }
  }

  async findByNotificationSettings(filters: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.emailNotifications !== undefined) {
        whereConditions.push(eq(userSettings.emailNotifications, filters.emailNotifications));
      }

      if (filters.pushNotifications !== undefined) {
        whereConditions.push(eq(userSettings.pushNotifications, filters.pushNotifications));
      }

      if (filters.smsNotifications !== undefined) {
        whereConditions.push(eq(userSettings.smsNotifications, filters.smsNotifications));
      }

      if (filters.marketingEmails !== undefined) {
        whereConditions.push(eq(userSettings.marketingEmails, filters.marketingEmails));
      }

      const result = await db
        .select()
        .from(userSettings)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findByNotificationSettings error:', error);
      throw error;
    }
  }

  async findBySecuritySettings(filters: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.twoFactorEnabled !== undefined) {
        whereConditions.push(eq(userSettings.twoFactorEnabled, filters.twoFactorEnabled));
      }

      if (filters.sessionTimeout !== undefined) {
        whereConditions.push(eq(userSettings.sessionTimeout, filters.sessionTimeout));
      }

      const result = await db
        .select()
        .from(userSettings)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findBySecuritySettings error:', error);
      throw error;
    }
  }

  async findByPrivacySettings(filters: {
    showOnlineStatus?: boolean;
    profileVisibility?: 'public' | 'private' | 'friends';
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.showOnlineStatus !== undefined) {
        whereConditions.push(eq(userSettings.showOnlineStatus, filters.showOnlineStatus));
      }

      if (filters.profileVisibility !== undefined) {
        whereConditions.push(eq(userSettings.profileVisibility, filters.profileVisibility));
      }

      const result = await db
        .select()
        .from(userSettings)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findByPrivacySettings error:', error);
      throw error;
    }
  }

  async findUsersWithTwoFactorDisabled(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.twoFactorEnabled, false))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithTwoFactorDisabled error:', error);
      throw error;
    }
  }

  async findUsersWithLongSessionTimeout(hours: number): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(gte(userSettings.sessionTimeout, hours))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithLongSessionTimeout error:', error);
      throw error;
    }
  }

  async findUsersWithPublicProfiles(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.profileVisibility, 'public' as const))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithPublicProfiles error:', error);
      throw error;
    }
  }

  async findUsersWithPrivateProfiles(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.profileVisibility, 'private' as const))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithPrivateProfiles error:', error);
      throw error;
    }
  }

  async findUsersWithMarketingEmailsEnabled(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.marketingEmails, true))
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithMarketingEmailsEnabled error:', error);
      throw error;
    }
  }

  async findUsersWithAllNotificationsEnabled(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(
          and(
            eq(userSettings.emailNotifications, true),
            eq(userSettings.pushNotifications, true),
            eq(userSettings.smsNotifications, true)
          )
        )
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithAllNotificationsEnabled error:', error);
      throw error;
    }
  }

  async findUsersWithAllNotificationsDisabled(): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(
          and(
            eq(userSettings.emailNotifications, false),
            eq(userSettings.pushNotifications, false),
            eq(userSettings.smsNotifications, false)
          )
        )
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findUsersWithAllNotificationsDisabled error:', error);
      throw error;
    }
  }

  async findRecentlyUpdated(hours: number): Promise<UserSettings[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userSettings)
        .where(gte(userSettings.updatedAt, cutoffDate))
        .limit(50)
        .orderBy(desc(userSettings.updatedAt));

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findRecentlyUpdated error:', error);
      throw error;
    }
  }

  async findRecentlyCreated(hours: number): Promise<UserSettings[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userSettings)
        .where(gte(userSettings.createdAt, cutoffDate))
        .limit(50)
        .orderBy(desc(userSettings.createdAt));

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findRecentlyCreated error:', error);
      throw error;
    }
  }

  async getThemeDistribution(): Promise<{ theme: string; count: number }[]> {
    try {
      const result = await db
        .select({
          theme: userSettings.theme,
          count: userSettings.id
        })
        .from(userSettings)
        .groupBy(userSettings.theme);

      return result.map(row => ({
        theme: row.theme as string,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('UserSettingsRepository.getThemeDistribution error:', error);
      throw error;
    }
  }

  async getLanguageDistribution(): Promise<{ language: string; count: number }[]> {
    try {
      const result = await db
        .select({
          language: userSettings.language,
          count: userSettings.id
        })
        .from(userSettings)
        .groupBy(userSettings.language);

      return result.map(row => ({
        language: row.language as string,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('UserSettingsRepository.getLanguageDistribution error:', error);
      throw error;
    }
  }

  async getTimezoneDistribution(): Promise<{ timezone: string; count: number }[]> {
    try {
      const result = await db
        .select({
          timezone: userSettings.timezone,
          count: userSettings.id
        })
        .from(userSettings)
        .groupBy(userSettings.timezone);

      return result.map(row => ({
        timezone: row.timezone as string,
        count: Number(row.count)
      }));
    } catch (error) {
      console.error('UserSettingsRepository.getTimezoneDistribution error:', error);
      throw error;
    }
  }

  async getNotificationSettingsSummary(): Promise<{
    emailNotifications: number;
    pushNotifications: number;
    smsNotifications: number;
    marketingEmails: number;
  }> {
    try {
      const result = await db
        .select({
          emailNotifications: userSettings.emailNotifications,
          pushNotifications: userSettings.pushNotifications,
          smsNotifications: userSettings.smsNotifications,
          marketingEmails: userSettings.marketingEmails
        })
        .from(userSettings);

      const summary = {
        emailNotifications: 0,
        pushNotifications: 0,
        smsNotifications: 0,
        marketingEmails: 0
      };

      result.forEach(row => {
        if (row.emailNotifications) summary.emailNotifications++;
        if (row.pushNotifications) summary.pushNotifications++;
        if (row.smsNotifications) summary.smsNotifications++;
        if (row.marketingEmails) summary.marketingEmails++;
      });

      return summary;
    } catch (error) {
      console.error('UserSettingsRepository.getNotificationSettingsSummary error:', error);
      throw error;
    }
  }

  async getSecuritySettingsSummary(): Promise<{
    twoFactorEnabled: number;
    averageSessionTimeout: number;
  }> {
    try {
      const result = await db
        .select({
          twoFactorEnabled: userSettings.twoFactorEnabled,
          sessionTimeout: userSettings.sessionTimeout
        })
        .from(userSettings);

      const summary = {
        twoFactorEnabled: 0,
        averageSessionTimeout: 0
      };

      let totalSessionTimeout = 0;
      result.forEach(row => {
        if (row.twoFactorEnabled) summary.twoFactorEnabled++;
        totalSessionTimeout += row.sessionTimeout || 24;
      });

      if (result.length > 0) {
        summary.averageSessionTimeout = totalSessionTimeout / result.length;
      }

      return summary;
    } catch (error) {
      console.error('UserSettingsRepository.getSecuritySettingsSummary error:', error);
      throw error;
    }
  }

  async getPrivacySettingsSummary(): Promise<{
    publicProfiles: number;
    privateProfiles: number;
    showOnlineStatus: number;
  }> {
    try {
      const result = await db
        .select({
          profileVisibility: userSettings.profileVisibility,
          showOnlineStatus: userSettings.showOnlineStatus
        })
        .from(userSettings);

      const summary = {
        publicProfiles: 0,
        privateProfiles: 0,
        showOnlineStatus: 0
      };

      result.forEach(row => {
        if (row.profileVisibility === 'public') summary.publicProfiles++;
        if (row.profileVisibility === 'private') summary.privateProfiles++;
        if (row.showOnlineStatus) summary.showOnlineStatus++;
      });

      return summary;
    } catch (error) {
      console.error('UserSettingsRepository.getPrivacySettingsSummary error:', error);
      throw error;
    }
  }

  // Private helper methods
  private mapToDomainEntity(settings: DBUserSetting): UserSettings {
    return new UserSettings(
      settings.id,
      settings.userId,
      settings.theme || 'auto',
      settings.language || 'en',
      settings.timezone || 'UTC',
      settings.emailNotifications,
      settings.pushNotifications,
      settings.smsNotifications,
      settings.marketingEmails,
      settings.twoFactorEnabled,
      settings.sessionTimeout || 24,
      settings.autoSaveDrafts,
      settings.showOnlineStatus,
      settings.profileVisibility || 'public',
      settings.customSettings || {},
      new Date(settings.createdAt), // Ensure createdAt is a Date object
      new Date(settings.updatedAt)  // Ensure updatedAt is a Date object
    );
  }
}