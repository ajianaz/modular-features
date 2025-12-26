import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ValidationError } from '@modular-features/shared';

// Error handling middleware
export const errorHandler = (error: Error, c: Context) => {
  // Default error response
  let status = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle specific error types
  if (error instanceof HTTPException) {
    status = error.status;
    message = error.message;
    details = error.cause;
  } else if (error instanceof ValidationError) {
    status = 400;
    message = 'Validation Error';
    details = (error as any).details;
  } else if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Resource Not Found';
  } else if (error.name === 'ConflictError') {
    status = 409;
    message = 'Conflict';
  }

  // Log error for debugging
  console.error('Error:', error);

  // Return error response
  return c.json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details
      })
    }
  }, status as any);
};

// Async error wrapper
export const asyncHandler = (fn: (c: Context, next: Next) => Promise<any>) => {
  return (c: Context, next: Next) => {
    return Promise.resolve(fn(c, next)).catch(next);
  };
};