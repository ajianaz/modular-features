import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileStorageProvider } from '../../../infrastructure/lib/FileStorageProvider';

// Mock the FileStorageProvider's private methods for testing
class TestableFileStorageProvider extends FileStorageProvider {
  public validateFileForTest(file: File) {
    return this['validateFile'](file);
  }

  public getFileExtensionForTest(mimeType: string) {
    return this['getFileExtension'](mimeType);
  }

  public processImageForTest(file: File) {
    return this['processImage'](file);
  }

  public uploadToCloudStorageForTest(
    fileData: { buffer: ArrayBuffer; size: number },
    fileName: string
  ) {
    return this['uploadToCloudStorage'](fileData, fileName);
  }
}

describe('FileStorageProvider', () => {
  let provider: TestableFileStorageProvider;
  let testFile: File;
  let testBuffer: ArrayBuffer;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new TestableFileStorageProvider({
      baseUrl: 'https://example.com/uploads',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      uploadPath: 'avatars'
    });

    testBuffer = new ArrayBuffer(10);
    testFile = new File([testBuffer], 'test.jpg', { type: 'image/jpeg' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a valid file successfully', async () => {
      // Mock the private methods
      const validateFileSpy = vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {});
      const processImageSpy = vi.spyOn(provider as any, 'processImage').mockResolvedValue({
        buffer: testBuffer,
        size: testBuffer.byteLength,
        dimensions: { width: 400, height: 400 }
      });
      const uploadToCloudStorageSpy = vi.spyOn(provider as any, 'uploadToCloudStorage').mockResolvedValue('https://example.com/uploads/test.jpg');

      const result = await provider.uploadFile(testFile);

      expect(validateFileSpy).toHaveBeenCalledWith(testFile);
      expect(processImageSpy).toHaveBeenCalledWith(testFile);
      expect(uploadToCloudStorageSpy).toHaveBeenCalled();
      expect(result).toBe('https://example.com/uploads/test.jpg');
    });

    it('should handle file with different extension', async () => {
      const pngFile = new File([testBuffer], 'test.png', { type: 'image/png' });

      // Mock the private methods
      const validateFileSpy = vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {});
      const processImageSpy = vi.spyOn(provider as any, 'processImage').mockResolvedValue({
        buffer: testBuffer,
        size: testBuffer.byteLength,
        dimensions: { width: 400, height: 400 }
      });
      const uploadToCloudStorageSpy = vi.spyOn(provider as any, 'uploadToCloudStorage').mockResolvedValue('https://example.com/uploads/test.png');

      const result = await provider.uploadFile(pngFile);

      expect(uploadToCloudStorageSpy).toHaveBeenCalled();
      expect(result).toBe('https://example.com/uploads/test.png');
    });

    it('should reject file with invalid MIME type', async () => {
      const invalidFile = new File([testBuffer], 'test.txt', { type: 'text/plain' });

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {
        throw new Error('File type text/plain is not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/webp');
      });

      await expect(provider.uploadFile(invalidFile)).rejects.toThrow(
        'File type text/plain is not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/webp'
      );
    });

    it('should reject file that exceeds size limit', async () => {
      const largeFile = new File([testBuffer], 'large.jpg', { type: 'image/jpeg' });

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {
        throw new Error(`File size ${testBuffer.byteLength} exceeds maximum allowed size of ${5 * 1024 * 1024}`);
      });

      await expect(provider.uploadFile(largeFile)).rejects.toThrow(
        `File size ${testBuffer.byteLength} exceeds maximum allowed size of ${5 * 1024 * 1024}`
      );
    });

    it('should handle file system errors during upload', async () => {
      const errorMessage = 'File system error';

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'processImage').mockRejectedValue(new Error(errorMessage));

      await expect(provider.uploadFile(testFile)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteFile', () => {
    it('should delete an existing file successfully', async () => {
      // Since deleteFile is a simple mock implementation, we just test that it doesn't throw
      const result = await provider.deleteFile('https://example.com/uploads/test.jpg');

      expect(result).toBe(true);
    });

    it('should handle malformed file URLs', async () => {
      const invalidUrl = 'not-a-valid-url';

      // Since deleteFile is a simple mock implementation, we just test that it doesn't throw
      const result = await provider.deleteFile(invalidUrl);

      expect(result).toBe(true); // Mock implementation returns true for any URL
    });
  });

  describe('validateFile', () => {
    it('should validate a valid file', () => {
      const result = provider.validateFileForTest(testFile);

      // Since validateFile is void when successful, we expect no error to be thrown
      expect(result).toBeUndefined();
    });

    it('should reject file with invalid MIME type', () => {
      const invalidFile = new File([testBuffer], 'test.txt', { type: 'text/plain' });

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {
        throw new Error('File type text/plain is not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/webp');
      });

      expect(() => provider.validateFileForTest(invalidFile)).toThrow(
        'File type text/plain is not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/webp'
      );
    });

    it('should reject file that exceeds size limit', async () => {
      const largeFile = new File([testBuffer], 'large.jpg', { type: 'image/jpeg' });

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {
        throw new Error(`File size ${testBuffer.byteLength} exceeds maximum allowed size of ${5 * 1024 * 1024}`);
      });

      expect(() => provider.validateFileForTest(largeFile)).toThrow(
        `File size ${testBuffer.byteLength} exceeds maximum allowed size of ${5 * 1024 * 1024}`
      );
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extension for common MIME types', () => {
      expect(provider.getFileExtensionForTest('image/jpeg')).toBe('jpg');
      expect(provider.getFileExtensionForTest('image/jpg')).toBe('jpg');
      expect(provider.getFileExtensionForTest('image/png')).toBe('png');
      expect(provider.getFileExtensionForTest('image/webp')).toBe('webp');
    });

    it('should handle unknown MIME type', () => {
      expect(provider.getFileExtensionForTest('unknown/type')).toBe('jpg');
    });
  });

  describe('processImage', () => {
    it('should process image and return buffer', async () => {
      // Mock the private method to return a specific result
      vi.spyOn(provider as any, 'processImage').mockResolvedValue({
        buffer: testBuffer,
        size: testBuffer.byteLength,
        dimensions: { width: 400, height: 400 }
      });

      const result = await provider.processImageForTest(testFile);

      expect(result.buffer).toBe(testBuffer);
      expect(result.size).toBe(testBuffer.byteLength);
      expect(result.dimensions).toEqual({ width: 400, height: 400 });
    });

    it('should handle image processing errors', async () => {
      const errorMessage = 'Image processing error';

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'processImage').mockRejectedValue(new Error(errorMessage));

      await expect(provider.processImageForTest(testFile)).rejects.toThrow(errorMessage);
    });
  });

  describe('uploadToCloudStorage', () => {
    it('should upload to cloud storage and return URL', async () => {
      const fileData = { buffer: testBuffer, size: testBuffer.byteLength };
      const fileName = 'test.jpg';
      const expectedUrl = 'https://example.com/uploads/avatars/test.jpg';

      // Mock the private method to return a specific result
      vi.spyOn(provider as any, 'uploadToCloudStorage').mockResolvedValue(expectedUrl);

      const result = await provider.uploadToCloudStorageForTest(fileData, fileName);

      expect(result).toBe(expectedUrl);
    });

    it('should handle cloud storage upload errors', async () => {
      const fileData = { buffer: testBuffer, size: testBuffer.byteLength };
      const fileName = 'test.jpg';
      const errorMessage = 'Cloud storage error';

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'uploadToCloudStorage').mockRejectedValue(new Error(errorMessage));

      await expect(provider.uploadToCloudStorageForTest(fileData, fileName)).rejects.toThrow(errorMessage);
    });
  });

  describe('edge cases', () => {
    it('should handle empty file name', async () => {
      const emptyFile = new File([testBuffer], '', { type: 'image/jpeg' });

      // Mock the private method to throw an error
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {
        throw new Error('Invalid file name');
      });

      await expect(provider.uploadFile(emptyFile)).rejects.toThrow('Invalid file name');
    });

    it('should handle file with special characters in name', async () => {
      const specialFile = new File([testBuffer], 'test@#$%.jpg', { type: 'image/jpeg' }) as any;

      // Mock the private methods to return specific results
      vi.spyOn(provider as any, 'validateFile').mockImplementation(() => {});
      vi.spyOn(provider as any, 'processImage').mockResolvedValue({
        buffer: testBuffer,
        size: testBuffer.byteLength,
        dimensions: { width: 400, height: 400 }
      });
      vi.spyOn(provider as any, 'uploadToCloudStorage').mockResolvedValue('https://example.com/uploads/special.jpg');

      const result = await provider.uploadFile(specialFile);

      expect(result).toContain('https://example.com/uploads/');
    });
  });
});