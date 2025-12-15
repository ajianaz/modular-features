import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserActivityRepository } from '../../../infrastructure/repositories/UserActivityRepository';
import { UserActivity } from '../../../domain/entities';
import {
  createTestUserActivity
} from '../../utils/testFixtures.test';

// Mock database module with a factory function to avoid hoisting issues
vi.mock('@modular-monolith/database', () => {
  // Create mock functions
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  // Create mock query builder functions
  const mockFrom = vi.fn();
  const mockWhere = vi.fn();
  const mockLimit = vi.fn();
  const mockOffset = vi.fn();
  const mockOrderBy = vi.fn();
  const mockValues = vi.fn();
  const mockSet = vi.fn();
  const mockReturning = vi.fn();
  const mockGroupBy = vi.fn();

  // Set up chain
  mockSelect.mockReturnValue({
    from: mockFrom
  });

  mockFrom.mockReturnValue({
    where: mockWhere
  });

  mockWhere.mockReturnValue({
    limit: mockLimit,
    orderBy: mockOrderBy,
    groupBy: mockGroupBy
  });

  mockLimit.mockReturnValue({
    offset: mockOffset,
    orderBy: mockOrderBy
  });

  mockOffset.mockReturnValue({
    orderBy: mockOrderBy
  });

  mockOrderBy.mockReturnValue([]);

  mockInsert.mockReturnValue({
    values: mockValues
  });

  mockValues.mockReturnValue({
    returning: mockReturning
  });

  mockReturning.mockReturnValue([]);

  mockUpdate.mockReturnValue({
    set: mockSet
  });

  mockSet.mockReturnValue({
    where: mockWhere
  });

  mockDelete.mockReturnValue({
    where: mockWhere
  });

  mockGroupBy.mockReturnValue({
    orderBy: mockOrderBy
  });

  const mockUserActivity = {};

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    },
    userActivities: {},
    userActivity: mockUserActivity
  };
});

// Mock drizzle-orm module
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
  isNotNull: vi.fn(),
  limit: vi.fn(),
  offset: vi.fn(),
  orderBy: vi.fn(),
  innerJoin: vi.fn()
}));

import { db, eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from '@modular-monolith/database';

describe('UserActivityRepository', () => {
  let repository: UserActivityRepository;
  let testActivity: UserActivity;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserActivityRepository();
    testActivity = createTestUserActivity();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findById', () => {
    it('should find an activity by ID', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findById(testActivity.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testActivity.id);
      expect(result!.userId).toBe(testActivity.userId);
      expect(result!.type).toBe(testActivity.type);
    });

    it('should return null when activity is not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new activity', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      (db.insert as any).mockImplementation(mockInsert);

      const result = await repository.create(testActivity);

      expect(db.insert).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testActivity.id);
    });
  });

  describe('createMany', () => {
    it('should create multiple activities', async () => {
      const activities = [testActivity];
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      (db.insert as any).mockImplementation(mockInsert);

      const result = await repository.createMany(activities);

      expect(db.insert).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].id).toBe(testActivity.id);
      }
    });
  });

  describe('delete', () => {
    it('should delete an activity by ID', async () => {
      const mockResult = [{ id: testActivity.id }];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      (db.delete as any).mockImplementation(mockDelete);

      const result = await repository.delete(testActivity.id);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when activity is not found for deletion', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      (db.delete as any).mockImplementation(mockDelete);

      const result = await repository.delete(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple activities by IDs', async () => {
      const ids = [testActivity.id];
      const mockResult = [{ id: testActivity.id }];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      (db.delete as any).mockImplementation(mockDelete);

      const result = await repository.deleteMany(ids);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('findByUserId', () => {
    it('should find activities by user ID', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByUserId(testActivity.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].userId).toBe(testActivity.userId);
      }
    });

    it('should return empty array when no activities found for user', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByUserId(nonExistentUserId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findByType', () => {
    it('should find activities by type', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByType(testActivity.type);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].type).toBe(testActivity.type);
      }
    });
  });

  describe('findByAction', () => {
    it('should find activities by action', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByAction(testActivity.action);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].action).toBe(testActivity.action);
      }
    });
  });

  describe('findByResource', () => {
    it('should find activities by resource', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByResource(testActivity.resource || '');

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].resource).toBe(testActivity.resource);
      }
    });
  });

  describe('findByResourceId', () => {
    it('should find activities by resource ID', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByResourceId(testActivity.resourceId || '');

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].resourceId).toBe(testActivity.resourceId);
      }
    });
  });

  describe('findBySessionId', () => {
    it('should find activities by session ID', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findBySessionId(testActivity.sessionId || '');

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].sessionId).toBe(testActivity.sessionId);
      }
    });
  });

  describe('findByIpAddress', () => {
    it('should find activities by IP address', async () => {
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByIpAddress(testActivity.ipAddress || '');

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].ipAddress).toBe(testActivity.ipAddress);
      }
    });
  });

  describe('findByDateRange', () => {
    it('should find activities by date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByDateRange(startDate, endDate);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findByUserIdAndDateRange', () => {
    it('should find activities by user ID and date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findByUserIdAndDateRange(testActivity.userId, startDate, endDate);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].userId).toBe(testActivity.userId);
      }
    });
  });

  describe('findRecent', () => {
    it('should find recent activities', async () => {
      const hours = 24;
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ offset: mockOffset, limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, offset: mockOffset, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findRecent(hours);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findRecentByUserId', () => {
    it('should find recent activities by user ID', async () => {
      const hours = 24;
      const mockResult = [{
        id: testActivity.id,
        userId: testActivity.userId,
        type: testActivity.type,
        action: testActivity.action,
        description: testActivity.description,
        resource: testActivity.resource,
        resourceId: testActivity.resourceId,
        ipAddress: testActivity.ipAddress,
        userAgent: testActivity.userAgent,
        sessionId: testActivity.sessionId,
        metadata: testActivity.metadata,
        createdAt: testActivity.createdAt
      }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.findRecentByUserId(testActivity.userId, hours);

      expect(db.select).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].userId).toBe(testActivity.userId);
      }
    });
  });

  describe('count', () => {
    it('should count all activities', async () => {
      const mockResult = [{ count: 1 }];

      const mockFrom = vi.fn().mockResolvedValue(mockResult);
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.count();

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should return 0 when no activities exist', async () => {
      const mockResult: any[] = [];

      const mockFrom = vi.fn().mockResolvedValue(mockResult);
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('countByUserId', () => {
    it('should count activities by user ID', async () => {
      const mockResult = [{ count: 1 }];

      const mockWhere = vi.fn().mockResolvedValue(mockResult);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.countByUserId(testActivity.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete activities by user ID', async () => {
      const mockResult = [{ id: testActivity.id }];

      const mockReturning = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      (db.delete as any).mockImplementation(mockDelete);

      const result = await repository.deleteByUserId(testActivity.userId);

      expect(db.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('existsById', () => {
    it('should return true when activity exists by ID', async () => {
      const mockResult = [{ id: testActivity.id }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.existsById(testActivity.id);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when activity does not exist by ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.existsById(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('existsByUserId', () => {
    it('should return true when activity exists by user ID', async () => {
      const mockResult = [{ id: testActivity.id }];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.existsByUserId(testActivity.userId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when activity does not exist by user ID', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResult: any[] = [];

      const mockLimit = vi.fn().mockResolvedValue(mockResult);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      (db.select as any).mockImplementation(mockSelect);

      const result = await repository.existsByUserId(nonExistentUserId);

      expect(result).toBe(false);
    });
  });
});