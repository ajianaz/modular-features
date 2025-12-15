import { UserProfileRepository } from '../repositories/UserProfileRepository';
import { UserSettingsRepository } from '../repositories/UserSettingsRepository';
import { UserRoleRepository } from '../repositories/UserRoleRepository';
import { UserActivityRepository } from '../repositories/UserActivityRepository';
import { FileStorageProvider } from '../lib/FileStorageProvider';

import { GetUserProfileUseCase } from '../../application/usecases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../application/usecases/UpdateUserProfileUseCase';
import { GetUserSettingsUseCase } from '../../application/usecases/GetUserSettingsUseCase';
import { UpdateUserSettingsUseCase } from '../../application/usecases/UpdateUserSettingsUseCase';
import { UploadAvatarUseCase } from '../../application/usecases/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/usecases/DeleteAvatarUseCase';

/**
 * Dependency Injection Container for Users Feature
 *
 * This container manages all the dependencies for the users feature
 * following the Dependency Injection pattern. It provides a centralized
 * place to configure and resolve dependencies, making it easier to
 * manage the feature's dependencies and test them.
 */
export class UsersContainer {
  private static instance: UsersContainer;

  private userProfileRepository: UserProfileRepository;
  private userSettingsRepository: UserSettingsRepository;
  private userRoleRepository: UserRoleRepository;
  private userActivityRepository: UserActivityRepository;
  private fileStorageProvider: FileStorageProvider;

  // Use cases
  private getUserProfileUseCase: GetUserProfileUseCase;
  private updateUserProfileUseCase: UpdateUserProfileUseCase;
  private getUserSettingsUseCase: GetUserSettingsUseCase;
  private updateUserSettingsUseCase: UpdateUserSettingsUseCase;
  private uploadAvatarUseCase: UploadAvatarUseCase;
  private deleteAvatarUseCase: DeleteAvatarUseCase;

  private constructor() {
    // Initialize all infrastructure dependencies
    this.userProfileRepository = new UserProfileRepository();
    this.userSettingsRepository = new UserSettingsRepository();
    this.userRoleRepository = new UserRoleRepository();
    this.userActivityRepository = new UserActivityRepository();
    this.fileStorageProvider = new FileStorageProvider();

    // Initialize all use cases
    this.getUserProfileUseCase = new GetUserProfileUseCase(
      this.userProfileRepository,
      this.userSettingsRepository,
      this.userRoleRepository,
      this.userActivityRepository
    );

    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(
      this.userProfileRepository,
      this.userActivityRepository
    );

    this.getUserSettingsUseCase = new GetUserSettingsUseCase(
      this.userSettingsRepository
    );

    this.updateUserSettingsUseCase = new UpdateUserSettingsUseCase(
      this.userSettingsRepository,
      this.userActivityRepository
    );

    this.uploadAvatarUseCase = new UploadAvatarUseCase(
      this.userProfileRepository,
      this.userActivityRepository
    );

    this.deleteAvatarUseCase = new DeleteAvatarUseCase(
      this.userProfileRepository,
      this.fileStorageProvider
    );
  }

  /**
   * Get singleton instance of the container
   */
  public static getInstance(): UsersContainer {
    if (!UsersContainer.instance) {
      UsersContainer.instance = new UsersContainer();
    }
    return UsersContainer.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    UsersContainer.instance = null as any;
  }

  // Repository getters
  public getUserProfileRepository(): UserProfileRepository {
    return this.userProfileRepository;
  }

  public getUserSettingsRepository(): UserSettingsRepository {
    return this.userSettingsRepository;
  }

  public getUserRoleRepository(): UserRoleRepository {
    return this.userRoleRepository;
  }

  public getUserActivityRepository(): UserActivityRepository {
    return this.userActivityRepository;
  }

  public getFileStorageProvider(): FileStorageProvider {
    return this.fileStorageProvider;
  }

  // Use case getters
  public getGetUserProfileUseCase(): GetUserProfileUseCase {
    return this.getUserProfileUseCase;
  }

  public getUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
    return this.updateUserProfileUseCase;
  }

  public getGetUserSettingsUseCase(): GetUserSettingsUseCase {
    return this.getUserSettingsUseCase;
  }

  public getUpdateUserSettingsUseCase(): UpdateUserSettingsUseCase {
    return this.updateUserSettingsUseCase;
  }

  public getUploadAvatarUseCase(): UploadAvatarUseCase {
    return this.uploadAvatarUseCase;
  }

  public getDeleteAvatarUseCase(): DeleteAvatarUseCase {
    return this.deleteAvatarUseCase;
  }
}