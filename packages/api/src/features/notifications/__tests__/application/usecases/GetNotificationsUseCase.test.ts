import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetNotificationsUseCase } from '../../../application/usecases/GetNotificationsUseCase';
import { Notification } from '../../../domain/entities/Notification.entity';
import { INotificationRepository } from '../../../domain/interfaces/INotificationRepository';
import { GetNotificationsRequest } from '../../../application/dtos/input/GetNotificationsRequest';
import { GetNotificationsResponse } from '../../../application/dtos/output/GetNotificationsResponse';
import {
  NotificationStatus,
  NotificationType
} from '../../../domain/types';
import {
  testUserIds,
  testNotificationIds,
  createTestNotification,
  createTestGetNotificationsRequest
} from '../../utils/testFixtures.test';

// Mock interfaces
const createMockNotificationRepository = () => ({
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  delete: vi.fn(),
  findPendingNotifications: vi.fn(),
  findScheduledNotifications: vi.fn(),
  findFailedNotifications: vi.fn(),
  countByStatus: vi.fn(),
  findByStatus: vi.fn(),
  findByType: vi.fn(),
  findByChannel: vi.fn(),
  findByPriority: vi.fn(),
  findExpired: vi.fn(),
  findScheduledForUser: vi.fn(),
  findUnreadByUser: vi.fn(),
  markAsRead: vi.fn(),
  markMultipleAsRead: vi.fn(),
  cancelScheduled: vi.fn(),
  deleteExpired: vi.fn(),
  deleteOlderThan: vi.fn()
});

describe('GetNotificationsUseCase', () => {
  let getNotificationsUseCase: GetNotificationsUseCase;
  let mockNotificationRepository: ReturnType<typeof createMockNotificationRepository>;

  beforeEach(() => {
    // Mock repository
    mockNotificationRepository = createMockNotificationRepository();

    getNotificationsUseCase = new GetNotificationsUseCase(
      mockNotificationRepository
    );
  });

  describe('execute', () => {
    it('should get notifications successfully', async () => {
      const request = createTestGetNotificationsRequest();
      const mockNotifications = [
        createTestNotification({ id: testNotificationIds.validNotification1 }),
        createTestNotification({ id: testNotificationIds.validNotification2 })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        request.recipientId || '',
        {
          status: request.status,
          type: request.type,
          limit: request.limit,
          offset: request.offset
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(request.limit || 10);
      expect(result.hasMore).toBe(false);
    });

    it('should return empty result when no notifications found', async () => {
      const request = createTestGetNotificationsRequest();

      (mockNotificationRepository.findByUserId as any).mockResolvedValue([]);

      const result = await getNotificationsUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(request.limit || 10);
      expect(result.hasMore).toBe(false);
    });

    it('should handle repository exceptions', async () => {
      const request = createTestGetNotificationsRequest();

      (mockNotificationRepository.findByUserId as any).mockRejectedValue(new Error('Database error'));

      const result = await getNotificationsUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.error).toBe('Database error');
    });

    it('should use default values when not provided', async () => {
      const request = {
        recipientId: testUserIds.validUser1
        // No other properties provided
      } as GetNotificationsRequest;

      const mockNotifications = [
        createTestNotification({ id: testNotificationIds.validNotification1 })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        testUserIds.validUser1,
        {
          status: undefined,
          type: undefined,
          limit: undefined,
          offset: undefined
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10); // Default limit
      expect(result.hasMore).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const request = createTestGetNotificationsRequest({
        limit: 5,
        offset: 10
      });

      const mockNotifications = Array(5).fill(null).map((_, index) =>
        createTestNotification({ id: `notification-${index + 10}` })
      );

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        request.recipientId || '',
        {
          status: request.status,
          type: request.type,
          limit: 5,
          offset: 10
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.hasMore).toBe(false);
    });

    it('should set hasMore to true when notifications equal limit', async () => {
      const request = createTestGetNotificationsRequest({
        limit: 5
      });

      const mockNotifications = Array(5).fill(null).map((_, index) =>
        createTestNotification({ id: `notification-${index}` })
      );

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should filter by status', async () => {
      const request = createTestGetNotificationsRequest({
        status: NotificationStatus.DELIVERED
      });

      const mockNotifications = [
        createTestNotification({
          id: testNotificationIds.validNotification1,
          status: NotificationStatus.DELIVERED
        }),
        createTestNotification({
          id: testNotificationIds.validNotification2,
          status: NotificationStatus.DELIVERED
        })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        request.recipientId || '',
        {
          status: NotificationStatus.DELIVERED,
          type: request.type,
          limit: request.limit,
          offset: request.offset
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications.every(n => n.status === NotificationStatus.DELIVERED)).toBe(true);
    });

    it('should filter by type', async () => {
      const request = createTestGetNotificationsRequest({
        type: NotificationType.INFO
      });

      const mockNotifications = [
        createTestNotification({
          id: testNotificationIds.validNotification1,
          type: NotificationType.INFO
        }),
        createTestNotification({
          id: testNotificationIds.validNotification2,
          type: NotificationType.INFO
        })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        request.recipientId || '',
        {
          status: request.status,
          type: NotificationType.INFO,
          limit: request.limit,
          offset: request.offset
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications.every(n => n.type === NotificationType.INFO)).toBe(true);
    });

    it('should handle null recipientId', async () => {
      const request = {
        recipientId: undefined
      } as GetNotificationsRequest;

      const mockNotifications = [
        createTestNotification({ id: testNotificationIds.validNotification1 })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        '',
        {
          status: request.status,
          type: request.type,
          limit: request.limit,
          offset: request.offset
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(1);
    });

    it('should handle empty request', async () => {
      const request = {} as GetNotificationsRequest;

      const mockNotifications = [
        createTestNotification({ id: testNotificationIds.validNotification1 })
      ];

      (mockNotificationRepository.findByUserId as any).mockResolvedValue(mockNotifications);

      const result = await getNotificationsUseCase.execute(request);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        '',
        {
          status: undefined,
          type: undefined,
          limit: undefined,
          offset: undefined
        }
      );

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10); // Default limit
      expect(result.hasMore).toBe(false);
    });
  });
});