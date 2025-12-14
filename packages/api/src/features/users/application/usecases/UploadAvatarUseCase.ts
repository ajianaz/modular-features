import { UserProfile, UserActivity } from '../../domain/entities';
import { IUserProfileRepository, IUserActivityRepository } from '../../domain/interfaces';
import {
  UploadAvatarRequest,
  UploadAvatarResponse
} from '../dtos';
import {
  UserProfileNotFoundError,
  AvatarUploadError,
  InvalidAvatarFormatError,
  AvatarTooLargeError
} from '../../domain/errors';

export class UploadAvatarUseCase {
  constructor(
    private userProfileRepository: IUserProfileRepository,
    private userActivityRepository: IUserActivityRepository
  ) {}

  async execute(request: UploadAvatarRequest): Promise<UploadAvatarResponse> {
    try {
      // Validate request
      const requestValidation = UploadAvatarRequestSchema.safeParse(request);
      if (!requestValidation.success) {
        return {
          success: false,
          message: `Validation error: ${requestValidation.error.issues.map(i => i.message).join(', ')}`,
          data: {
            profile: {} as any,
            fileInfo: {} as any
          }
        };
      }

      // Check if profile exists
      const existingProfile = await this.userProfileRepository.findByUserId(request.userId);
      if (!existingProfile) {
        throw new UserProfileNotFoundError(request.userId);
      }

      // Validate file
      const file = request.file;
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (file.size > maxSize) {
        throw new AvatarTooLargeError(file.size, maxSize);
      }

      if (!allowedTypes.includes(file.type)) {
        throw new InvalidAvatarFormatError(file.type);
      }

      // Process image (resize, optimize, etc.)
      const processedFile = await this.processImage(file, {
        maxWidth: request.maxWidth || 400,
        maxHeight: request.maxHeight || 400,
        quality: request.quality || 0.8
      });

      // Generate unique filename
      const fileExtension = this.getFileExtension(file.type);
      const fileName = `avatars/${request.userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

      // Upload to storage (this would integrate with your cloud storage)
      const avatarUrl = await this.uploadToStorage(processedFile, fileName);

      // Update profile with new avatar
      const updatedProfile = existingProfile.updateAvatar(avatarUrl);
      const savedProfile = await this.userProfileRepository.update(updatedProfile);

      // Log avatar upload activity
      await this.userActivityRepository.create(
        UserActivity.createAvatarUploadActivity({
          userId: request.userId,
          fileName: file.name,
          fileSize: file.size,
          metadata: {
            originalSize: file.size,
            processedSize: processedFile.size,
            dimensions: processedFile.dimensions,
            mimeType: file.type,
            url: avatarUrl
          }
        })
      );

      return {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profile: savedProfile.toJSON(),
          fileInfo: {
            originalName: file.name,
            fileName: fileName,
            fileSize: processedFile.size,
            mimeType: file.type,
            url: avatarUrl,
            dimensions: processedFile.dimensions
          }
        }
      };

    } catch (error) {
      console.error('UploadAvatarUseCase error:', error);

      if (error instanceof UserProfileNotFoundError ||
          error instanceof AvatarUploadError ||
          error instanceof InvalidAvatarFormatError ||
          error instanceof AvatarTooLargeError) {
        return {
          success: false,
          message: error.message,
          data: {
            profile: {} as any,
            fileInfo: {} as any
          }
        };
      }

      return {
        success: false,
        message: 'Failed to upload avatar',
        data: {
          profile: {} as any,
          fileInfo: {} as any
        }
      };
    }
  }

  private async processImage(file: File, options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  }): Promise<{
    buffer: ArrayBuffer;
    size: number;
    dimensions?: { width: number; height: number };
  }> {
    // This is a simplified image processing implementation
    // In a real implementation, you would use a library like sharp or jimp

    // For now, just return the original file buffer
    const buffer = await file.arrayBuffer();

    // In a real implementation, you would:
    // 1. Convert image to a standard format
    // 2. Resize according to maxWidth/maxHeight while maintaining aspect ratio
    // 3. Compress/optimize the image
    // 4. Return the processed buffer and new dimensions

    return {
      buffer,
      size: buffer.byteLength,
      dimensions: {
        width: options.maxWidth, // Placeholder - would be actual dimensions after processing
        height: options.maxHeight
      }
    };
  }

  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };

    return extensions[mimeType] || 'jpg';
  }

  private async uploadToStorage(
    fileData: { buffer: ArrayBuffer; size: number },
    fileName: string
  ): Promise<string> {
    // This is a placeholder for storage upload
    // In a real implementation, you would upload to:
    // - AWS S3
    // - Google Cloud Storage
    // - Azure Blob Storage
    // - Local filesystem (for development)

    // For now, return a mock URL
    const baseUrl = process.env.ASSET_BASE_URL || 'http://localhost:3000/assets';
    return `${baseUrl}/${fileName}`;
  }
}

// Import the schema at the top level
import { UploadAvatarRequestSchema } from '../dtos/input/UploadAvatarRequest';