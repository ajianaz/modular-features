import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserSettingsRepository } from '../../../infrastructure/repositories/UserSettingsRepository';
import { UserSettings } from '../../../domain/entities';
import {
  createTestUserSettings
} from '../../utils/testFixtures.test';

// Mock the database module
vi.mock('@modular-monolith/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  userSettings: {}
}));

// Mock the drizzle-orm module
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  or: vi.fn(),
  ilike: vi.fn(),
  desc: vi.fn(),
  asc: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  isNull: vi.fn(),
  isNotNull: vi.fn()
}));

import { db, eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from '@modular-monolith/database';

describe('UserSettingsRepository', () => {
  let repository: UserSettingsRepository;
  let testSettings: UserSettings;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserSettingsRepository();
    testSettings = createTestUserSettings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should find settings by ID', async () => {
      const mockResult = [{
        id: testSettings.id,
        userId: testSettings.userId,
        theme: testSettings.theme,
        language: testSettings.language,
        timezone: testSettings.timezone,
        emailNotifications: testSettings.emailNotifications,
        pushNotifications: testSettings.pushNotifications,
        smsNotifications: testSettings.smsNotifications,
        marketingEmails: testSettings.marketingEmails,
        twoFactorEnabled: testSettings.twoFactorEnabled,
        sessionTimeout: testSettings.sessionTimeout,
        autoSaveDrafts: testSettings.autoSaveDrafts,
        showOnlineStatus: testSettings.showOnlineStatus,
        profileVisibility: testSettings.profileVisibility,
        customSettings: testSettings.customSettings,
        createdAt: testSettings.createdAt,
        updatedAt: testSettings.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findById(testSettings.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testSettings.id);
      expect(result!.userId).toBe(testSettings.userId);
      expect(result!.theme).toBe(testSettings.theme);
      expect(result!.language).toBe(testSettings.language);
    });

    it('should return null when settings are not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const settingsId = testSettings.id;
      const errorMessage = 'Database connection error';

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      await expect(repository.findById(settingsId)).rejects.toThrow(errorMessage);
    });
  });

  describe('findByUserId', () => {
    it('should find settings by user ID', async () => {
      const mockResult = [{
        id: testSettings.id,
        userId: testSettings.userId,
        theme: testSettings.theme,
        language: testSettings.language,
        timezone: testSettings.timezone,
        emailNotifications: testSettings.emailNotifications,
        pushNotifications: testSettings.pushNotifications,
        smsNotifications: testSettings.smsNotifications,
        marketingEmails: testSettings.marketingEmails,
        twoFactorEnabled: testSettings.twoFactorEnabled,
        sessionTimeout: testSettings.sessionTimeout,
        autoSaveDrafts: testSettings.autoSaveDrafts,
        showOnlineStatus: testSettings.showOnlineStatus,
        profileVisibility: testSettings.profileVisibility,
        customSettings: testSettings.customSettings,
        createdAt: testSettings.createdAt,
        updatedAt: testSettings.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findByUserId(testSettings.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.userId).toBe(testSettings.userId);
    });

    it('should return null when settings are not found by user ID', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.findByUserId(nonExistentUserId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new settings', async () => {
      const mockResult = [{
        id: testSettings.id,
        userId: testSettings.userId,
        theme: testSettings.theme,
        language: testSettings.language,
        timezone: testSettings.timezone,
        emailNotifications: testSettings.emailNotifications,
        pushNotifications: testSettings.pushNotifications,
        smsNotifications: testSettings.smsNotifications,
        marketingEmails: testSettings.marketingEmails,
        twoFactorEnabled: testSettings.twoFactorEnabled,
        sessionTimeout: testSettings.sessionTimeout,
        autoSaveDrafts: testSettings.autoSaveDrafts,
        showOnlineStatus: testSettings.showOnlineStatus,
        profileVisibility: testSettings.profileVisibility,
        customSettings: testSettings.customSettings,
        createdAt: testSettings.createdAt,
        updatedAt: testSettings.updatedAt
      }];

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.insert as any).mockImplementation(() => ({
        values: mockValues,
        returning: mockReturning
      }));

      const result = await repository.create(testSettings);

      expect(db.insert).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testSettings.id);
    });

    it('should handle database errors during creation', async () => {
      const errorMessage = 'Database connection error';

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.insert as any).mockImplementation(() => ({
        values: mockValues,
        returning: mockReturning
      }));

      await expect(repository.create(testSettings)).rejects.toThrow(errorMessage);
    });
  });

  describe('update', () => {
    it('should update existing settings', async () => {
      const updatedSettings = UserSettings.create({
        ...testSettings,
        theme: 'dark',
        language: 'fr'
      });

      const mockResult = [{
        id: updatedSettings.id,
        userId: updatedSettings.userId,
        theme: updatedSettings.theme,
        language: updatedSettings.language,
        timezone: updatedSettings.timezone,
        emailNotifications: updatedSettings.emailNotifications,
        pushNotifications: updatedSettings.pushNotifications,
        smsNotifications: updatedSettings.smsNotifications,
        marketingEmails: updatedSettings.marketingEmails,
        twoFactorEnabled: updatedSettings.twoFactorEnabled,
        sessionTimeout: updatedSettings.sessionTimeout,
        autoSaveDrafts: updatedSettings.autoSaveDrafts,
        showOnlineStatus: updatedSettings.showOnlineStatus,
        profileVisibility: updatedSettings.profileVisibility,
        customSettings: updatedSettings.customSettings,
        createdAt: updatedSettings.createdAt,
        updatedAt: updatedSettings.updatedAt
      }];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.update as any).mockImplementation(() => ({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.update(updatedSettings);

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.theme).toBe('dark');
      expect(result!.language).toBe('fr');
    });

    it('should handle database errors during update', async () => {
      const errorMessage = 'Database connection error';

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.update as any).mockImplementation(() => ({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      }));

      await expect(repository.update(testSettings)).rejects.toThrow(errorMessage);
    });
  });

  describe('delete', () => {
    it('should delete settings by ID', async () => {
      const mockResult = [{ id: testSettings.id }];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.delete(testSettings.id);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when settings are not found for deletion', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      const result = await repository.delete(nonExistentId);

      expect(result).toBe(false);
    });

    it('should handle database errors during deletion', async () => {
      const settingsId = testSettings.id;
      const errorMessage = 'Database connection error';

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.delete as any).mockImplementation(() => ({
        where: mockWhere,
        returning: mockReturning
      }));

      await expect(repository.delete(settingsId)).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should find all settings', async () => {
      const mockResult = [{
        id: testSettings.id,
        userId: testSettings.userId,
        theme: testSettings.theme,
        language: testSettings.language,
        timezone: testSettings.timezone,
        emailNotifications: testSettings.emailNotifications,
        pushNotifications: testSettings.pushNotifications,
        smsNotifications: testSettings.smsNotifications,
        marketingEmails: testSettings.marketingEmails,
        twoFactorEnabled: testSettings.twoFactorEnabled,
        sessionTimeout: testSettings.sessionTimeout,
        autoSaveDrafts: testSettings.autoSaveDrafts,
        showOnlineStatus: testSettings.showOnlineStatus,
        profileVisibility: testSettings.profileVisibility,
        customSettings: testSettings.customSettings,
        createdAt: testSettings.createdAt,
        updatedAt: testSettings.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      }));

      const result = await repository.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testSettings.id);
    });

    it('should return empty array when no settings exist', async () => {
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      }));

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('existsById', () => {
    it('should return true when settings exist by ID', async () => {
      const mockResult = [{ id: testSettings.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.existsById(testSettings.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when settings do not exist by ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.existsById(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('existsByUserId', () => {
    it('should return true when settings exist by user ID', async () => {
      const mockResult = [{ id: testSettings.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.existsByUserId(testSettings.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when settings do not exist by user ID', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      }));

      const result = await repository.existsByUserId(nonExistentUserId);

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count all settings', async () => {
      const mockResult = [{ count: 1 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.count();

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should return 0 when no settings exist', async () => {
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockImplementation(() => ({
        from: mockFrom
      }));

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });
});