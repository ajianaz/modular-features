import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUserSettingsUseCase } from '../../../application/usecases/GetUserSettingsUseCase';
import { IUserSettingsRepository, IUserActivityRepository } from '../../../domain/interfaces';
import { UserSettings, UserActivity } from '../../../domain/entities';
import {
  UserSettingsNotFoundError
} from '../../../domain/errors/UserManagementError';
import {
  testUserIds,
  createTestUserSettings,
  createTestUserActivity
} from '../../utils/testFixtures.test';
import {
  createMockUserSettingsRepository,
  createMockUserActivityRepository,
  setupUserSettingsRepository,
  setupUserActivityRepository
} from '../../utils/testUtils.test';

describe('GetUserSettingsUseCase', () => {
  let useCase: GetUserSettingsUseCase;
  let mockUserSettingsRepository: IUserSettingsRepository;
  let mockUserActivityRepository: IUserActivityRepository;

  beforeEach(() => {
    mockUserSettingsRepository = createMockUserSettingsRepository();
    mockUserActivityRepository = createMockUserActivityRepository();

    useCase = new GetUserSettingsUseCase(
      mockUserSettingsRepository,
      mockUserActivityRepository
    );
  });

  describe('execute', () => {
    const validRequest = {
      userId: testUserIds.validUser1
    };

    describe('when settings exist', () => {
      let mockSettings: UserSettings;

      beforeEach(() => {
        mockSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: mockSettings });
        setupUserActivityRepository(mockUserActivityRepository, {});
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return success response with settings', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.message).toBe('User settings retrieved successfully');
        expect(result.data.settings).toEqual(mockSettings.toJSON());
      });

      it('should call repository methods with correct parameters', async () => {
        await useCase.execute(validRequest);

        expect(mockUserSettingsRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'view',
            resource: 'settings',
            resourceId: mockSettings.id
          })
        );
      });
    });

    describe('when settings do not exist', () => {
      beforeEach(() => {
        (mockUserSettingsRepository.findByUserId as any).mockResolvedValue(null);
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return error response', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe(`User settings with ID ${testUserIds.validUser1} not found`);
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'view',
            resource: 'settings',
            description: expect.stringContaining('not found')
          })
        );
      });
    });

    describe('when repository errors occur', () => {
      beforeEach(() => {
        (mockUserSettingsRepository.findByUserId as any).mockRejectedValue(new Error('Database error'));
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should handle repository errors gracefully', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to retrieve user settings');
      });
    });

    describe('validation', () => {
      it('should handle invalid request validation', async () => {
        const invalidRequest = {
          userId: 'invalid-uuid'
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });

      it('should handle empty userId', async () => {
        const emptyUserIdRequest = {
          userId: ''
        };

        const result = await useCase.execute(emptyUserIdRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
      });
    });

    describe('activity logging', () => {
      let mockSettings: UserSettings;

      beforeEach(() => {
        mockSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: mockSettings });
        setupUserActivityRepository(mockUserActivityRepository, {});
      });

      it('should log settings view activity with correct metadata', async () => {
        await useCase.execute(validRequest);

        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'settings',
            action: 'view',
            resource: 'settings',
            resourceId: mockSettings.id,
            description: 'User settings viewed'
          })
        );
      });
    });
  });
});