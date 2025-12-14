export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name.replace('Error', '').toUpperCase();
    this.statusCode = statusCode || 500;
  }
}

export class BaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name.replace('Error', '').toUpperCase();
    this.statusCode = statusCode || 500;
  }
}

export class InfrastructureError extends BaseError {}