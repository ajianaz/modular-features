import { Context, Next } from 'hono';
import { z } from 'zod';
import { ValidationError } from '@modular-monolith/shared';

// Validation middleware factory
export const validate = (schema: z.ZodSchema, target: 'json' | 'query' | 'param' = 'json') => {
  return async (c: Context, next: Next) => {
    try {
      let data;

      switch (target) {
        case 'json':
          data = await c.req.json();
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
      }

      const validatedData = schema.parse(data);

      // Store validated data in context
      c.set(`validated_${target}`, validatedData);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation failed');
      }
      throw error;
    }
  };
};

// JSON validation middleware
export const validateJson = (schema: z.ZodSchema) => validate(schema, 'json');

// Query validation middleware
export const validateQuery = (schema: z.ZodSchema) => validate(schema, 'query');

// Param validation middleware
export const validateParam = (schema: z.ZodSchema) => validate(schema, 'param');