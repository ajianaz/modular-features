import { DeleteAvatarRequest, DeleteAvatarResponse } from '../dtos';
import { IUserProfileRepository } from '../../domain/interfaces/IUserProfileRepository';
import { UserProfileNotFoundError } from '../../domain/errors';
import { UserProfile } from '../../domain/entities';
import { FileStorageProvider } from '../../infrastructure/lib/FileStorageProvider';

export class DeleteAvatarUseCase {
  constructor(
    private userProfileRepository: IUserProfileRepository,
    private fileStorageProvider: FileStorageProvider
  ) {}

  async execute(request: DeleteAvatarRequest): Promise<DeleteAvatarResponse> {
    try {
      // Find user profile
      const profile = await this.userProfileRepository.findByUserId(request.userId);
      if (!profile) {
        throw new UserProfileNotFoundError(`User profile with userId ${request.userId} not found`);
      }

      // Delete avatar file if it exists
      if (profile.avatarUrl) {
        try {
          const filePath = this.fileStorageProvider.extractPathFromUrl(profile.avatarUrl);
          if (filePath) {
            await this.fileStorageProvider.deleteFile(filePath);
          }
        } catch (error) {
          // Log error but don't fail the operation if file deletion fails
          console.error('Failed to delete avatar file:', error);
        }
      }

      // Update profile to remove avatar URL
      profile.updateAvatar('');
      await this.userProfileRepository.update(profile);

      return {
        success: true,
        message: 'Avatar deleted successfully',
        userId: request.userId
      };
    } catch (error) {
      if (error instanceof UserProfileNotFoundError) {
        throw error;
      }

      console.error('DeleteAvatarUseCase error:', error);
      throw new Error(`Failed to delete avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}