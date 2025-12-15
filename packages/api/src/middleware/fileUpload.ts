import { Context, Next } from 'hono';
import { ValidationError } from '@modular-monolith/shared';

// File upload options
export interface FileUploadOptions {
  // Maximum file size in bytes (default: 5MB)
  maxSize?: number;
  // Allowed MIME types (default: common image types)
  allowedTypes?: string[];
  // Maximum number of files (default: 1)
  maxFiles?: number;
  // Field name for the file (default: 'file')
  fieldName?: string;
  // Whether to validate file type (default: true)
  validateType?: boolean;
}

// File information interface
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  buffer: ArrayBuffer;
  lastModified?: number;
}

// File upload middleware factory
export const fileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles = 1,
    fieldName = 'file',
    validateType = true
  } = options;

  return async (c: Context, next: Next) => {
    try {
      // Check if content type is multipart/form-data
      const contentType = c.req.header('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        throw new ValidationError('Content-Type must be multipart/form-data for file uploads');
      }

      // Parse form data
      const formData = await c.req.parseBody({ all: true });

      // Extract files from form data
      const files: UploadedFile[] = [];

      // Handle single file upload
      if (formData[fieldName] && typeof formData[fieldName] === 'object' && 'size' in formData[fieldName]) {
        const fileData = formData[fieldName] as any;

        // Validate file size
        if (fileData.size > maxSize) {
          throw new ValidationError(`File size ${fileData.size} bytes exceeds maximum allowed size of ${maxSize} bytes`);
        }

        // Validate file type if required
        if (validateType && !allowedTypes.includes(fileData.type)) {
          throw new ValidationError(`File type ${fileData.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Convert file to ArrayBuffer
        let buffer: ArrayBuffer;
        if (fileData.arrayBuffer) {
          buffer = await fileData.arrayBuffer();
        } else if (fileData.buffer) {
          buffer = fileData.buffer;
        } else {
          throw new ValidationError('Unable to process file data');
        }

        files.push({
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
          buffer,
          lastModified: fileData.lastModified
        });
      }
      // Handle multiple files
      else if (Array.isArray(formData[fieldName])) {
        const fileArray = formData[fieldName] as any[];

        if (fileArray.length > maxFiles) {
          throw new ValidationError(`Maximum ${maxFiles} files allowed, but ${fileArray.length} files were uploaded`);
        }

        for (const fileData of fileArray) {
          // Validate file size
          if (fileData.size > maxSize) {
            throw new ValidationError(`File ${fileData.name} size ${fileData.size} bytes exceeds maximum allowed size of ${maxSize} bytes`);
          }

          // Validate file type if required
          if (validateType && !allowedTypes.includes(fileData.type)) {
            throw new ValidationError(`File ${fileData.name} type ${fileData.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
          }

          // Convert file to ArrayBuffer
          let buffer: ArrayBuffer;
          if (fileData.arrayBuffer) {
            buffer = await fileData.arrayBuffer();
          } else if (fileData.buffer) {
            buffer = fileData.buffer;
          } else {
            throw new ValidationError(`Unable to process file ${fileData.name}`);
          }

          files.push({
            name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            buffer,
            lastModified: fileData.lastModified
          });
        }
      }

      // Store files in context
      if (files.length === 1) {
        c.set('file', files[0]);
      } else {
        c.set('files', files);
      }

      // Store other form fields in context
      const otherFields: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (key !== fieldName) {
          otherFields[key] = value;
        }
      }
      if (Object.keys(otherFields).length > 0) {
        c.set('formData', otherFields);
      }

      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
};

// Convenience middleware for avatar uploads
export const avatarUpload = () => fileUpload({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles: 1,
  fieldName: 'file',
  validateType: true
});

// Convenience middleware for document uploads
export const documentUpload = (maxSize: number = 10 * 1024 * 1024) => fileUpload({
  maxSize,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ],
  maxFiles: 1,
  fieldName: 'file',
  validateType: true
});

// Convenience middleware for multiple image uploads
export const multiImageUpload = (maxFiles: number = 5) => fileUpload({
  maxSize: 5 * 1024 * 1024, // 5MB per file
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles,
  fieldName: 'files',
  validateType: true
});