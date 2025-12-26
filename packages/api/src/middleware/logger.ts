import { Context, Next } from 'hono';
import { logger } from 'hono/logger';

// Custom logger middleware with structured logging
export const structuredLogger = () => {
  return logger((message, ...rest) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, ...rest);
  });
};

// Request logging middleware
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('User-Agent') || 'Unknown';

  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${userAgent}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
};