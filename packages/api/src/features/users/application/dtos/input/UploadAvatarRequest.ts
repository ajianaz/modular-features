import { z } from 'zod';

export const UploadAvatarRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB max
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'File must be a valid image format (jpg, jpeg, png, webp)'
  ),
  maxWidth: z.number().min(1).max(2000).optional().default(400), // Max width for resizing
  maxHeight: z.number().min(1).max(2000).optional().default(400), // Max height for resizing
  quality: z.number().min(0.1).max(1).optional().default(0.8) // JPEG quality
});

export interface UploadAvatarRequest {
  userId: string;
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}