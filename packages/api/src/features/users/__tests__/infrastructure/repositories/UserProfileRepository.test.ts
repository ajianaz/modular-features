import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserProfileRepository } from '../../../infrastructure/repositories/UserProfileRepository';
import { UserProfile } from '../../../domain/entities';
import {
  createTestUserProfile
} from '../../utils/testFixtures.test';

// Mock the database module
vi.mock('@modular-monolith/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  userProfiles: {},
  userProfilesTable: {}
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

describe('UserProfileRepository', () => {
  let repository: UserProfileRepository;
  let testProfile: UserProfile;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserProfileRepository();
    testProfile = createTestUserProfile();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should find a profile by ID', async () => {
      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.findById(testProfile.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testProfile.id);
      expect(result!.userId).toBe(testProfile.userId);
      expect(result!.firstName).toBe(testProfile.firstName);
      expect(result!.lastName).toBe(testProfile.lastName);
      expect(result!.displayName).toBe(testProfile.displayName);
    });

    it('should return null when profile is not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const profileId = testProfile.id;
      const errorMessage = 'Database connection error';

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      await expect(repository.findById(profileId)).rejects.toThrow(errorMessage);
    });
  });

  describe('findByUserId', () => {
    it('should find a profile by user ID', async () => {
      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.findByUserId(testProfile.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.userId).toBe(testProfile.userId);
    });

    it('should return null when profile is not found by user ID', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.findByUserId(nonExistentUserId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.insert as any).mockReturnValue({
        values: mockValues,
        returning: mockReturning
      });

      const result = await repository.create(testProfile);

      expect(db.insert).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testProfile.id);
    });

    it('should handle database errors during creation', async () => {
      const errorMessage = 'Database connection error';

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.insert as any).mockReturnValue({
        values: mockValues,
        returning: mockReturning
      });

      await expect(repository.create(testProfile)).rejects.toThrow(errorMessage);
    });
  });

  describe('update', () => {
    it('should update an existing profile', async () => {
      const updatedProfile = UserProfile.create({
        ...testProfile,
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name'
      });

      const mockResult = [{
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        displayName: updatedProfile.displayName,
        bio: updatedProfile.bio,
        website: updatedProfile.website,
        location: updatedProfile.location,
        timezone: updatedProfile.timezone,
        language: updatedProfile.language,
        gender: updatedProfile.gender,
        dateOfBirth: updatedProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: updatedProfile.phoneNumber,
        isPhoneVerified: updatedProfile.isPhoneVerified,
        socialLinks: updatedProfile.socialLinks,
        preferences: updatedProfile.preferences,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.update as any).mockReturnValue({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      });

      const result = await repository.update(updatedProfile);

      expect(db.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.firstName).toBe('Updated First Name');
      expect(result!.lastName).toBe('Updated Last Name');
    });

    it('should handle database errors during update', async () => {
      const errorMessage = 'Database connection error';

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.update as any).mockReturnValue({
        set: mockSet,
        where: mockWhere,
        returning: mockReturning
      });

      await expect(repository.update(testProfile)).rejects.toThrow(errorMessage);
    });
  });

  describe('delete', () => {
    it('should delete a profile by ID', async () => {
      const mockResult = [{ id: testProfile.id }];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockReturnValue({
        where: mockWhere,
        returning: mockReturning
      });

      const result = await repository.delete(testProfile.id);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when profile is not found for deletion', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue(mockResult);

      (db.delete as any).mockReturnValue({
        where: mockWhere,
        returning: mockReturning
      });

      const result = await repository.delete(nonExistentId);

      expect(result).toBe(false);
    });

    it('should handle database errors during deletion', async () => {
      const profileId = testProfile.id;
      const errorMessage = 'Database connection error';

      const mockDelete = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockRejectedValue(new Error(errorMessage));

      (db.delete as any).mockReturnValue({
        where: mockWhere,
        returning: mockReturning
      });

      await expect(repository.delete(profileId)).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should find all profiles', async () => {
      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      });

      const result = await repository.findAll();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testProfile.id);
    });

    it('should return empty array when no profiles exist', async () => {
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByEmail', () => {
    it('should return null as email is stored in users table', async () => {
      const email = 'test@example.com';

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('existsById', () => {
    it('should return true when profile exists by ID', async () => {
      const mockResult = [{ id: testProfile.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.existsById(testProfile.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when profile does not exist by ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.existsById(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('existsByUserId', () => {
    it('should return true when profile exists by user ID', async () => {
      const mockResult = [{ id: testProfile.id }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.existsByUserId(testProfile.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when profile does not exist by user ID', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.existsByUserId(nonExistentUserId);

      expect(result).toBe(false);
    });
  });

  describe('findWithFilters', () => {
    it('should find profiles with filters', async () => {
      const filters = {
        firstName: 'John',
        location: 'New York',
        limit: 10,
        offset: 0
      };

      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      });

      const result = await repository.findWithFilters(filters);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle empty filters', async () => {
      const filters = {};

      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockOffset = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit,
        offset: mockOffset,
        orderBy: mockOrderBy
      });

      const result = await repository.findWithFilters(filters);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findIncompleteProfiles', () => {
    it('should find incomplete profiles', async () => {
      const mockResult = [{
        id: testProfile.id,
        userId: testProfile.userId,
        firstName: testProfile.firstName,
        lastName: testProfile.lastName,
        displayName: testProfile.displayName,
        bio: testProfile.bio,
        website: testProfile.website,
        location: testProfile.location,
        timezone: testProfile.timezone,
        language: testProfile.language,
        gender: testProfile.gender,
        dateOfBirth: testProfile.dateOfBirth?.toISOString().split('T')[0],
        phoneNumber: testProfile.phoneNumber,
        isPhoneVerified: testProfile.isPhoneVerified,
        socialLinks: testProfile.socialLinks,
        preferences: testProfile.preferences,
        createdAt: testProfile.createdAt,
        updatedAt: testProfile.updatedAt
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom,
        where: mockWhere,
        limit: mockLimit
      });

      const result = await repository.findIncompleteProfiles();

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('count', () => {
    it('should count all profiles', async () => {
      const mockResult = [{ count: 1 }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom
      });

      const result = await repository.count();

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should return 0 when no profiles exist', async () => {
      const mockResult: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockResolvedValue(mockResult);

      (db.select as any).mockReturnValue({
        from: mockFrom
      });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });
});