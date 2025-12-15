export class ValidationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name.replace('Error', '').toUpperCase();
    this.statusCode = statusCode || 400;
    this.details = details;
  }
}