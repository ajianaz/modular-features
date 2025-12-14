import { z } from 'zod';

export class LogoutRequest {
  constructor(
    public readonly refreshToken: string
  ) {}

  // Validation schema
  static schema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  });

  // Validation method
  static validate(data: any): { isValid: boolean; errors: string[] } {
    const result = LogoutRequest.schema.safeParse(data);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Factory method to create validated request
  static create(data: { refreshToken: string }): LogoutRequest {
    const validation = LogoutRequest.validate(data);
    if (!validation.isValid) {
      throw new Error(`Invalid logout request: ${validation.errors.join(', ')}`);
    }

    return new LogoutRequest(data.refreshToken);
  }
}