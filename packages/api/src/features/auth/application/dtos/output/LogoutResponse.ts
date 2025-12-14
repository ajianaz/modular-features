import { z } from 'zod';

export class LogoutResponse {
  constructor(
    public readonly success: boolean,
    public readonly message: string
  ) {}

  // Validation schema
  static schema = z.object({
    success: z.boolean(),
    message: z.string().min(1)
  });

  // Validation method
  static validate(data: any): { isValid: boolean; errors: string[] } {
    const result = LogoutResponse.schema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Factory method to create validated response
  static create(data: { success: boolean; message: string }): LogoutResponse {
    const validation = LogoutResponse.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid logout response: ${validation.errors.join(', ')}`);
    }

    return new LogoutResponse(data.success, data.message);
  }

  // Static factory methods for common responses
  static success(message: string = 'Successfully logged out'): LogoutResponse {
    return new LogoutResponse(true, message);
  }

  static failure(message: string): LogoutResponse {
    return new LogoutResponse(false, message);
  }

  // Safe JSON serialization
  toJSON() {
    return {
      success: this.success,
      message: this.message
    };
  }
}