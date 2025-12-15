import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUserProfileUseCase } from '../../../application/usecases/GetUserProfileUseCase';
import { IUserProfileRepository, IUserSettingsRepository, IUserRoleRepository, IUserActivityRepository } from '../../../domain/interfaces';
import { UserProfile, UserSettings, UserRole, UserActivity } from '../../../domain/entities';
import {
  UserProfileNotFoundError,
  UserSettingsNotFoundError
} from '../../../domain/errors/UserManagementError';
import {
  testUserIds,
  testRoleIds,
  createTestUserProfile,
  createTestUserSettings,
  createTestUserRole,
  createTestUserActivity
} from '../../utils/testFixtures.test';
import {
  createMockUserProfileRepository,
  createMockUserSettingsRepository,
  createMockUserRoleRepository,
  createMockUserActivityRepository,
  setupUserProfileRepository,
  setupUserSettingsRepository,
  setupUserRoleRepository,
  setupUserActivityRepository
} from '../../utils/testUtils.test';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let mockUserProfileRepository: IUserProfileRepository;
  let mockUserSettingsRepository: IUserSettingsRepository;
  let mockUserRoleRepository: IUserRoleRepository;
  let mockUserActivityRepository: IUserActivityRepository;

  beforeEach(() => {
    mockUserProfileRepository = createMockUserProfileRepository();
    mockUserSettingsRepository = createMockUserSettingsRepository();
    mockUserRoleRepository = createMockUserRoleRepository();
    mockUserActivityRepository = createMockUserActivityRepository();

    useCase = new GetUserProfileUseCase(
      mockUserProfileRepository,
      mockUserSettingsRepository,
      mockUserRoleRepository,
      mockUserActivityRepository
    );
  });

  describe('execute', () => {
    const validRequest = {
      userId: testUserIds.validUser1,
      includeSettings: true,
      includeRoles: true,
      includeActivity: true,
      activityLimit: 10
    };

    describe('when profile exists', () => {
      let mockProfile: UserProfile;
      let mockSettings: UserSettings;
      let mockRoles: UserRole[];
      let mockActivities: UserActivity[];

      beforeEach(() => {
        mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        mockSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        mockRoles = [createTestUserRole()];
        mockActivities = [createTestUserActivity({ userId: testUserIds.validUser1 })];

        setupUserProfileRepository(mockUserProfileRepository, { [testUserIds.validUser1]: mockProfile });
        setupUserSettingsRepository(mockUserSettingsRepository, { [testUserIds.validUser1]: mockSettings });
        setupUserRoleRepository(mockUserRoleRepository, { [testRoleIds.adminRole]: mockRoles[0] }, [
          {
            userId: testUserIds.validUser1,
            roleId: testRoleIds.adminRole,
            isActive: true
          }
        ]);
        setupUserActivityRepository(mockUserActivityRepository, { [mockActivities[0].id]: mockActivities[0] });
      });

      it('should return success response with profile, settings, roles, and activity', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.message).toBe('User profile retrieved successfully');

        expect(result.data.profile).toEqual(mockProfile.toJSON());
        expect(result.data.settings).toEqual(mockSettings.toJSON());
        expect(result.data.roles).toEqual([{
          ...mockRoles[0].toJSON(),
          assignedAt: expect.any(Date),
          expiresAt: undefined
        }]);
        expect(result.data.activity).toEqual(mockActivities.map(a => a.toJSON()));
      });

      it('should call repository methods with correct parameters', async () => {
        await useCase.execute(validRequest);

        expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserSettingsRepository.findByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserRoleRepository.findActiveAssignmentsByUserId).toHaveBeenCalledWith(testUserIds.validUser1);
        expect(mockUserRoleRepository.findRoleById).toHaveBeenCalledWith(testRoleIds.adminRole);
        expect(mockUserActivityRepository.findRecentByUserId).toHaveBeenCalledWith(
          testUserIds.validUser1,
          24 * 7, // 1 week in hours
          10
        );
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'view',
            resource: 'profile'
          })
        );
      });

      it('should create default settings when none exist', async () => {
        (mockUserSettingsRepository.findByUserId as any).mockResolvedValue(null);
        const defaultSettings = createTestUserSettings({ userId: testUserIds.validUser1 });
        (mockUserSettingsRepository.create as any).mockResolvedValue(defaultSettings);

        const result = await useCase.execute(validRequest);

        expect(result.data.settings).toEqual(defaultSettings.toJSON());
        expect(mockUserSettingsRepository.create).toHaveBeenCalledWith(defaultSettings);
      });
    });

    describe('when profile does not exist', () => {
      beforeEach(() => {
        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(null);
        (mockUserActivityRepository.create as any).mockResolvedValue(createTestUserActivity());
      });

      it('should return error response', async () => {
        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('User profile with ID 123e4567-e89b-12d3-a456-426614174001 not found');
        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'view',
            resource: 'profile',
            description: expect.stringContaining('not found')
          })
        );
      });

      it('should handle repository errors gracefully', async () => {
        const error = new Error('Database error');
        (mockUserProfileRepository.findByUserId as any).mockRejectedValue(error);

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to retrieve user profile');
      });
    });

    describe('when includeSettings is false', () => {
      it('should not include settings in response', async () => {
        const requestWithoutSettings = { ...validRequest, includeSettings: false };
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);

        const result = await useCase.execute(requestWithoutSettings);

        expect(result.success).toBe(true);
        expect(result.data.profile).toEqual(mockProfile.toJSON());
        expect(result.data.settings).toBeUndefined();
        expect(mockUserSettingsRepository.findByUserId).not.toHaveBeenCalled();
      });
    });

    describe('when includeRoles is false', () => {
      it('should not include roles in response', async () => {
        const requestWithoutRoles = { ...validRequest, includeRoles: false };
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);

        const result = await useCase.execute(requestWithoutRoles);

        expect(result.success).toBe(true);
        expect(result.data.profile).toEqual(mockProfile.toJSON());
        expect(result.data.roles).toBeUndefined();
        expect(mockUserRoleRepository.findActiveAssignmentsByUserId).not.toHaveBeenCalled();
      });
    });

    describe('when includeActivity is false', () => {
      it('should not include activity in response', async () => {
        const requestWithoutActivity = { ...validRequest, includeActivity: false };
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);

        const result = await useCase.execute(requestWithoutActivity);

        expect(result.success).toBe(true);
        expect(result.data.profile).toEqual(mockProfile.toJSON());
        expect(result.data.activity).toBeUndefined();
        expect(mockUserActivityRepository.findRecentByUserId).not.toHaveBeenCalled();
      });
    });

    describe('activity limit', () => {
      it('should limit activity results to maximum of 100', async () => {
        const requestWithHighLimit = { ...validRequest, activityLimit: 200 };
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        const mockActivities = Array.from({ length: 150 }, (_, i) =>
          createTestUserActivity({ userId: testUserIds.validUser1 })
        );

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);
        (mockUserActivityRepository.findRecentByUserId as any).mockResolvedValue(mockActivities);

        const result = await useCase.execute(requestWithHighLimit);

        expect(result.data.activity).toHaveLength(100); // Limited to 100
      });

      it('should use default limit when not specified', async () => {
        const requestWithoutLimit = { ...validRequest, activityLimit: undefined };
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        const mockActivities = Array.from({ length: 20 }, (_, i) =>
          createTestUserActivity({ userId: testUserIds.validUser1 })
        );

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);
        (mockUserActivityRepository.findRecentByUserId as any).mockResolvedValue(mockActivities);

        const result = await useCase.execute(requestWithoutLimit);

        expect(result.data.activity).toHaveLength(10); // Default limit of 10
      });
    });

    describe('validation', () => {
      it('should handle invalid request validation', async () => {
        const invalidRequest = {
          userId: 'invalid-uuid',
          includeSettings: 'not-a-boolean' as any,
          includeRoles: 'not-a-boolean' as any,
          includeActivity: 'not-a-boolean' as any,
          activityLimit: -1 as any
        };

        const result = await useCase.execute(invalidRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
        expect(result.data.profile).toEqual({});
      });

      it('should handle empty userId', async () => {
        const emptyUserIdRequest = {
          userId: '',
          includeSettings: true,
          includeRoles: true,
          includeActivity: true
        };

        const result = await useCase.execute(emptyUserIdRequest);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Validation error');
        expect(result.data.profile).toEqual({});
      });
    });

    describe('role assignment with expired roles', () => {
      it('should not include expired roles in response', async () => {
        const mockExpiredAssignment = {
          userId: testUserIds.validUser1,
          roleId: testRoleIds.adminRole,
          isActive: false, // Expired
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        };

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(createTestUserProfile());
        (mockUserRoleRepository.findActiveAssignmentsByUserId as any).mockResolvedValue([mockExpiredAssignment]);
        (mockUserRoleRepository.findRoleById as any).mockResolvedValue(createTestUserRole());

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.data.roles).toEqual([{
          ...createTestUserRole().toJSON(),
          assignedAt: expect.any(Date),
          expiresAt: undefined
        }]);
      });
    });

    describe('role assignment with inactive roles', () => {
      it('should not include inactive roles in response', async () => {
        const mockInactiveAssignment = {
          userId: testUserIds.validUser1,
          roleId: testRoleIds.adminRole,
          isActive: false, // Inactive
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Future
        };

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(createTestUserProfile());
        (mockUserRoleRepository.findActiveAssignmentsByUserId as any).mockResolvedValue([mockInactiveAssignment]);
        (mockUserRoleRepository.findRoleById as any).mockResolvedValue(createTestUserRole());

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.data.roles).toEqual([{
          ...createTestUserRole().toJSON(),
          assignedAt: expect.any(Date),
          expiresAt: undefined
        }]);
      });
    });

    describe('role not found', () => {
      it('should handle missing role gracefully', async () => {
        const mockAssignment = {
          userId: testUserIds.validUser1,
          roleId: testRoleIds.adminRole,
          isActive: true
        };

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(createTestUserProfile());
        (mockUserRoleRepository.findActiveAssignmentsByUserId as any).mockResolvedValue([mockAssignment]);
        (mockUserRoleRepository.findRoleById as any).mockResolvedValue(null); // Role not found

        const result = await useCase.execute(validRequest);

        expect(result.success).toBe(true);
        expect(result.data.roles).toEqual([]); // Empty array when role not found
      });
    });

    describe('activity logging', () => {
      it('should log profile view activity with correct metadata', async () => {
        const mockProfile = createTestUserProfile({ userId: testUserIds.validUser1 });
        const mockActivity = createTestUserActivity();

        (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockProfile);
        (mockUserActivityRepository.create as any).mockResolvedValue(mockActivity);

        await useCase.execute(validRequest);

        expect(mockUserActivityRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUserIds.validUser1,
            type: 'profile',
            action: 'view',
            resource: 'profile',
            resourceId: mockProfile.id
          })
        );
      });
    });
  });
});