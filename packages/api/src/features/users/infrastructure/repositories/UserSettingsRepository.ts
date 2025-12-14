import { UserSettings } from '../../domain/entities/UserSettings.entity';
import { IUserSettingsRepository } from '../../domain/interfaces/IUserSettingsRepository';
import {
  UserSettingsNotFoundError
} from '../../domain/errors';
import { db } from '@modular-monolith/database';
import { userSettings } from '@modular-monolith/database';
import type { UserSetting as DBUserSetting, NewUserSetting } from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from 'drizzle-orm';

// Type assertion to handle Drizzle ORM compatibility issues
const userSettingsTable = userSettings as any;

export class UserSettingsRepository implements IUserSettingsRepository {
  async findById(id: string): Promise<UserSettings | null> {
    try {
      const result = await db.select().from(userSettingsTable).where(eq(userSettingsTable.id, id) as any).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserSettingsRepository.findById error:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    try {
      const result = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, userId) as any).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserSettingsRepository.findByUserId error:', error);
      throw error;
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

      const [insertedSettings] = await db.insert(userSettingsTable).values(newSettingsData as any).returning();

      return this.mapToDomainEntity(insertedSettings);
    } catch (error) {
      console.error('UserSettingsRepository.create error:', error);
      throw error;
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
        .update(userSettingsTable)
        .set(updateData as any)
        .where(eq(userSettingsTable.userId, settings.userId) as any)
        .returning();

      if (!updatedSettings) {
        throw new UserSettingsNotFoundError(`User settings with userId ${settings.userId} not found`);
      }

      return this.mapToDomainEntity(updatedSettings!);
    } catch (error) {
      console.error('UserSettingsRepository.update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userSettingsTable)
        .where(eq(userSettingsTable.id, id) as any)
        .returning({ id: userSettingsTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.delete error:', error);
      throw error;
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userSettingsTable)
        .where(eq(userSettingsTable.userId, userId) as any)
        .returning({ id: userSettingsTable.id });

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
        .from(userSettingsTable)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userSettingsTable.createdAt) as any);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findAll error:', error);
      throw error;
    }
  }

  async findByTheme(theme: string): Promise<UserSettings[]> {
    try {
      const result = await db
        .select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.theme, theme) as any)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.language, language) as any)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.timezone, timezone) as any)
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
        .select({ id: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.id, id) as any)
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
        .select({ id: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, userId) as any)
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

      const insertedSettings = await db.insert(userSettingsTable).values(settingsData as any).returning();

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
        .delete(userSettingsTable)
        .where(eq(userSettingsTable.id, ids) as any)
        .returning({ id: userSettingsTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserSettingsRepository.deleteMany error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.count error:', error);
      throw error;
    }
  }

  async countByTheme(theme: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.theme, theme) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.countByTheme error:', error);
      throw error;
    }
  }

  async countByLanguage(language: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.language, language) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.countByLanguage error:', error);
      throw error;
    }
  }

  async countByTimezone(timezone: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.timezone, timezone) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.countByTimezone error:', error);
      throw error;
    }
  }

  async countWithTwoFactorEnabled(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.twoFactorEnabled, true) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.countWithTwoFactorEnabled error:', error);
      throw error;
    }
  }

  async countWithMarketingEmails(): Promise<number> {
    try {
      const result = await db
        .select({ count: userSettingsTable.id })
        .from(userSettingsTable)
        .where(eq(userSettingsTable.marketingEmails, true) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserSettingsRepository.countWithMarketingEmails error:', error);
      throw error;
    }
  }

  async findWithFilters(filters: {
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
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.theme) {
        whereConditions.push(eq(userSettingsTable.theme, filters.theme) as any);
      }

      if (filters.language) {
        whereConditions.push(eq(userSettingsTable.language, filters.language) as any);
      }

      if (filters.timezone) {
        whereConditions.push(eq(userSettingsTable.timezone, filters.timezone) as any);
      }

      if (filters.emailNotifications !== undefined) {
        whereConditions.push(eq(userSettingsTable.emailNotifications, filters.emailNotifications) as any);
      }

      if (filters.pushNotifications !== undefined) {
        whereConditions.push(eq(userSettingsTable.pushNotifications, filters.pushNotifications) as any);
      }

      if (filters.smsNotifications !== undefined) {
        whereConditions.push(eq(userSettingsTable.smsNotifications, filters.smsNotifications) as any);
      }

      if (filters.marketingEmails !== undefined) {
        whereConditions.push(eq(userSettingsTable.marketingEmails, filters.marketingEmails) as any);
      }

      if (filters.twoFactorEnabled !== undefined) {
        whereConditions.push(eq(userSettingsTable.twoFactorEnabled, filters.twoFactorEnabled) as any);
      }

      if (filters.minSessionTimeout !== undefined) {
        whereConditions.push(gte(userSettingsTable.sessionTimeout, filters.minSessionTimeout) as any);
      }

      if (filters.maxSessionTimeout !== undefined) {
        whereConditions.push(lte(userSettingsTable.sessionTimeout, filters.maxSessionTimeout) as any);
      }

      if (filters.showOnlineStatus !== undefined) {
        whereConditions.push(eq(userSettingsTable.showOnlineStatus, filters.showOnlineStatus) as any);
      }

      if (filters.profileVisibility) {
        whereConditions.push(eq(userSettingsTable.profileVisibility, filters.profileVisibility) as any);
      }

      const result = await db
        .select()
        .from(userSettingsTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(userSettingsTable.createdAt) as any);

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
        whereConditions.push(eq(userSettingsTable.emailNotifications, filters.emailNotifications) as any);
      }

      if (filters.pushNotifications !== undefined) {
        whereConditions.push(eq(userSettingsTable.pushNotifications, filters.pushNotifications) as any);
      }

      if (filters.smsNotifications !== undefined) {
        whereConditions.push(eq(userSettingsTable.smsNotifications, filters.smsNotifications) as any);
      }

      if (filters.marketingEmails !== undefined) {
        whereConditions.push(eq(userSettingsTable.marketingEmails, filters.marketingEmails) as any);
      }

      const result = await db
        .select()
        .from(userSettingsTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
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
        whereConditions.push(eq(userSettingsTable.twoFactorEnabled, filters.twoFactorEnabled) as any);
      }

      if (filters.sessionTimeout !== undefined) {
        whereConditions.push(eq(userSettingsTable.sessionTimeout, filters.sessionTimeout) as any);
      }

      const result = await db
        .select()
        .from(userSettingsTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .limit(50);

      return result.map(settings => this.mapToDomainEntity(settings));
    } catch (error) {
      console.error('UserSettingsRepository.findBySecuritySettings error:', error);
      throw error;
    }
  }

  async findByPrivacySettings(filters: {
    showOnlineStatus?: boolean;
    profileVisibility?: string;
  }): Promise<UserSettings[]> {
    try {
      const whereConditions = [];

      if (filters.showOnlineStatus !== undefined) {
        whereConditions.push(eq(userSettingsTable.showOnlineStatus, filters.showOnlineStatus) as any);
      }

      if (filters.profileVisibility !== undefined) {
        whereConditions.push(eq(userSettingsTable.profileVisibility, filters.profileVisibility) as any);
      }

      const result = await db
        .select()
        .from(userSettingsTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.twoFactorEnabled, false) as any)
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
        .from(userSettingsTable)
        .where(gte(userSettingsTable.sessionTimeout, hours) as any)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.profileVisibility, 'public') as any)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.profileVisibility, 'private') as any)
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
        .from(userSettingsTable)
        .where(eq(userSettingsTable.marketingEmails, true) as any)
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
        .from(userSettingsTable)
        .where(
          and(
            eq(userSettingsTable.emailNotifications, true) as any,
            eq(userSettingsTable.pushNotifications, true) as any,
            eq(userSettingsTable.smsNotifications, true) as any
          ) as any
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
        .from(userSettingsTable)
        .where(
          and(
            eq(userSettingsTable.emailNotifications, false) as any,
            eq(userSettingsTable.pushNotifications, false) as any,
            eq(userSettingsTable.smsNotifications, false) as any
          ) as any
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
        .from(userSettingsTable)
        .where(gte(userSettingsTable.updatedAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userSettingsTable.updatedAt) as any);

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
        .from(userSettingsTable)
        .where(gte(userSettingsTable.createdAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userSettingsTable.createdAt) as any);

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
          theme: userSettingsTable.theme,
          count: userSettingsTable.id
        })
        .from(userSettingsTable)
        .groupBy(userSettingsTable.theme);

      return result.map(row => ({
        theme: row.theme as string,
        count: row.count as number
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
          language: userSettingsTable.language,
          count: userSettingsTable.id
        })
        .from(userSettingsTable)
        .groupBy(userSettingsTable.language);

      return result.map(row => ({
        language: row.language as string,
        count: row.count as number
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
          timezone: userSettingsTable.timezone,
          count: userSettingsTable.id
        })
        .from(userSettingsTable)
        .groupBy(userSettingsTable.timezone);

      return result.map(row => ({
        timezone: row.timezone as string,
        count: row.count as number
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
          emailNotifications: userSettingsTable.emailNotifications,
          pushNotifications: userSettingsTable.pushNotifications,
          smsNotifications: userSettingsTable.smsNotifications,
          marketingEmails: userSettingsTable.marketingEmails
        })
        .from(userSettingsTable);

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
          twoFactorEnabled: userSettingsTable.twoFactorEnabled,
          sessionTimeout: userSettingsTable.sessionTimeout
        })
        .from(userSettingsTable);

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
          profileVisibility: userSettingsTable.profileVisibility,
          showOnlineStatus: userSettingsTable.showOnlineStatus
        })
        .from(userSettingsTable);

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
  private mapToDomainEntity(settings: any): UserSettings {
    return new UserSettings(
      settings.id,
      settings.userId,
      settings.theme as any || 'auto',
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
      settings.profileVisibility as any || 'public',
      settings.customSettings as any || {},
      settings.createdAt,
      settings.updatedAt
    );
  }
}