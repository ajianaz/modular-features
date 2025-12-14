import { Request, Response, NextFunction } from 'express'
import { ValidationResult, SchemaBuilder } from './builders'
import { ValidationError, MultipleValidationErrors } from '../errors/validation'
import { APIError, BadRequestError } from '../errors/api'

// Express validation middleware options
export interface ValidationMiddlewareOptions {
  // Source of data to validate
  source?: 'body' | 'query' | 'params' | 'headers' | 'all'
  
  // Error handling options
  handleErrors?: boolean
  errorHandler?: (errors: ValidationError[], req: Request, res: Response, next: NextFunction) => void
  
  // Transform options
  transform?: boolean
  
  // Custom validation options
  customValidators?: Array<(data: any) => ValidationResult>
  
  // Context options
  addContext?: boolean
  contextField?: string
}

// Express validation middleware creator
export function createValidationMiddleware<T = any>(
  schemaBuilder: SchemaBuilder<T>,
  options: ValidationMiddlewareOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const {
      source = 'body',
      handleErrors = true,
      errorHandler,
      transform = true,
      customValidators = [],
      addContext = true,
      contextField = 'validationContext'
    } = options

    try {
      // Extract data based on source
      let data: any
      switch (source) {
        case 'body':
          data = req.body
          break
        case 'query':
          data = req.query
          break
        case 'params':
          data = req.params
          break
        case 'headers':
          data = req.headers
          break
        case 'all':
          data = {
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers
          }
          break
        default:
          data = req.body
      }

      // Validate data
      const validationResult = schemaBuilder.safeParse(data)

      if (!validationResult.success) {
        // Add validation context if requested
        if (addContext) {
          req[contextField] = {
            data,
            errors: validationResult.errors,
            source,
            timestamp: new Date()
          }
        }

        // Handle errors
        if (handleErrors) {
          if (errorHandler) {
            errorHandler(validationResult.errors || [], req, res, next)
          } else {
            handleValidationError(validationResult.errors || [], req, res, next)
          }
          return
        }

        // Pass error to next middleware
        if (validationResult.errors?.length === 1) {
          return next(validationResult.errors[0])
        }
        return next(new MultipleValidationErrors(validationResult.errors || []))
      }

      // Transform data if requested
      if (transform && validationResult.data) {
        switch (source) {
          case 'body':
            req.body = validationResult.data
            break
          case 'query':
            req.query = validationResult.data
            break
          case 'params':
            req.params = validationResult.data as any
            break
          case 'headers':
            req.headers = validationResult.data as any
            break
          case 'all':
            if (validationResult.data.body) req.body = validationResult.data.body
            if (validationResult.data.query) req.query = validationResult.data.query
            if (validationResult.data.params) req.params = validationResult.data.params as any
            if (validationResult.data.headers) req.headers = validationResult.data.headers as any
            break
        }
      }

      // Add validated data to request
      if (!req.validatedData) {
        req.validatedData = {}
      }
      req.validatedData[source] = validationResult.data

      // Run custom validators
      for (const validator of customValidators) {
        const customResult = validator(validationResult.data)
        if (!customResult.success) {
          if (handleErrors) {
            if (errorHandler) {
              errorHandler(customResult.errors || [], req, res, next)
            } else {
              handleValidationError(customResult.errors || [], req, res, next)
            }
            return
          }

          if (customResult.errors?.length === 1) {
            return next(customResult.errors[0])
          }
          return next(new MultipleValidationErrors(customResult.errors || []))
        }
      }

      next()
    } catch (error) {
      if (handleErrors) {
        if (errorHandler) {
          errorHandler([error as ValidationError], req, res, next)
        } else {
          handleValidationError([error as ValidationError], req, res, next)
        }
        return
      }
      next(error)
    }
  }
}

// Express validation middleware factory
export function validate<T = any>(
  schema: any,
  options?: ValidationMiddlewareOptions
) {
  // Create schema builder from various schema types
  let schemaBuilder: SchemaBuilder<T>

  if (schema instanceof SchemaBuilder) {
    schemaBuilder = schema
  } else if (typeof schema === 'function') {
    // Zod schema function
    schemaBuilder = SchemaBuilder.create(schema)
  } else {
    // Zod schema object
    schemaBuilder = SchemaBuilder.create(schema)
  }

  return createValidationMiddleware(schemaBuilder, options)
}

// Route-specific validation middleware
export const RouteValidationMiddleware = {
  // Validate request body
  body: <T = any>(schema: any, options?: Omit<ValidationMiddlewareOptions, 'source'>) =>
    validate(schema, { ...options, source: 'body' }),

  // Validate request query parameters
  query: <T = any>(schema: any, options?: Omit<ValidationMiddlewareOptions, 'source'>) =>
    validate(schema, { ...options, source: 'query' }),

  // Validate request parameters
  params: <T = any>(schema: any, options?: Omit<ValidationMiddlewareOptions, 'source'>) =>
    validate(schema, { ...options, source: 'params' }),

  // Validate request headers
  headers: <T = any>(schema: any, options?: Omit<ValidationMiddlewareOptions, 'source'>) =>
    validate(schema, { ...options, source: 'headers' }),

  // Validate all request data
  all: <T = any>(schema: any, options?: Omit<ValidationMiddlewareOptions, 'source'>) =>
    validate(schema, { ...options, source: 'all' }),
}

// Async validation middleware
export function asyncValidate<T = any>(
  schema: any,
  options: ValidationMiddlewareOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      source = 'body',
      handleErrors = true,
      errorHandler,
      transform = true,
      addContext = true,
      contextField = 'validationContext'
    } = options

    try {
      // Extract data based on source
      let data: any
      switch (source) {
        case 'body':
          data = req.body
          break
        case 'query':
          data = req.query
          break
        case 'params':
          data = req.params
          break
        case 'headers':
          data = req.headers
          break
        case 'all':
          data = {
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers
          }
          break
        default:
          data = req.body
      }

      // Create schema builder
      let schemaBuilder: SchemaBuilder<T>

      if (schema instanceof SchemaBuilder) {
        schemaBuilder = schema
      } else if (typeof schema === 'function') {
        schemaBuilder = SchemaBuilder.create(schema(req))
      } else {
        schemaBuilder = SchemaBuilder.create(schema)
      }

      // Validate data asynchronously
      const validationResult = await schemaBuilder.validateAsync(data)

      if (!validationResult.success) {
        // Add validation context if requested
        if (addContext) {
          req[contextField] = {
            data,
            errors: validationResult.errors,
            source,
            timestamp: new Date()
          }
        }

        // Handle errors
        if (handleErrors) {
          if (errorHandler) {
            await errorHandler(validationResult.errors || [], req, res, next)
          } else {
            handleValidationError(validationResult.errors || [], req, res, next)
          }
          return
        }

        // Pass error to next middleware
        if (validationResult.errors?.length === 1) {
          return next(validationResult.errors[0])
        }
        return next(new MultipleValidationErrors(validationResult.errors || []))
      }

      // Transform data if requested
      if (transform && validationResult.data) {
        switch (source) {
          case 'body':
            req.body = validationResult.data
            break
          case 'query':
            req.query = validationResult.data
            break
          case 'params':
            req.params = validationResult.data as any
            break
          case 'headers':
            req.headers = validationResult.data as any
            break
          case 'all':
            if (validationResult.data.body) req.body = validationResult.data.body
            if (validationResult.data.query) req.query = validationResult.data.query
            if (validationResult.data.params) req.params = validationResult.data.params as any
            if (validationResult.data.headers) req.headers = validationResult.data.headers as any
            break
        }
      }

      next()
    } catch (error) {
      if (handleErrors) {
        if (errorHandler) {
          await errorHandler([error as ValidationError], req, res, next)
        } else {
          handleValidationError([error as ValidationError], req, res, next)
        }
        return
      }
      next(error)
    }
  }
}

// Validation error handler
export function handleValidationError(
  errors: ValidationError[],
  req: Request,
  res: Response,
  next?: NextFunction
): void {
  const error = errors.length === 1 ? errors[0] : new MultipleValidationErrors(errors)

  if (error instanceof MultipleValidationErrors) {
    const response = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Multiple validation errors occurred',
        errors: error.getErrorsByField()
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    }

    res.status(400).json(response)
  } else {
    const response = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        field: error.getField(),
        constraint: error.getConstraint(),
        value: error.getValue()
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    }

    res.status(error.getStatusCode()).json(response)
  }
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      validatedData?: Record<string, any>
      validationContext?: any
      [key: string]: any
    }
  }
}

// Validation middleware utilities
export const ValidationMiddlewareUtils = {
  // Create conditional validation middleware
  conditional: <T = any>(
    condition: (req: Request) => boolean,
    schema: any,
    options?: ValidationMiddlewareOptions
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (condition(req)) {
        return createValidationMiddleware(
          schema instanceof SchemaBuilder ? schema : SchemaBuilder.create(schema),
          options
        )(req, res, next)
      }
      next()
    }
  },

  // Create validation middleware with multiple schemas
  multiple: <T = any>(
    schemas: Array<{ source: string; schema: any; options?: ValidationMiddlewareOptions }>
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const promises = schemas.map(({ source, schema, options }) => {
        return new Promise<void>((resolve, reject) => {
          const middleware = createValidationMiddleware(schema, {
            handleErrors: false,
            ...options,
            source: source as any
          })

          middleware(req, res, (error) => {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })
      })

      Promise.all(promises)
        .then(() => next())
        .catch((error) => {
          if (error instanceof ValidationError || error instanceof MultipleValidationErrors) {
            handleValidationError(
              error instanceof MultipleValidationErrors ? error.getErrors() : [error],
              req,
              res,
              next
            )
          } else {
            next(error)
          }
        })
    }
  },

  // Create validation middleware with custom error handler
  withErrorHandler: <T = any>(
    schema: any,
    errorHandler: (errors: ValidationError[], req: Request, res: Response, next: NextFunction) => void,
    options?: Omit<ValidationMiddlewareOptions, 'errorHandler' | 'handleErrors'>
  ) => {
    return createValidationMiddleware(schema, {
      ...options,
      handleErrors: true,
      errorHandler
    })
  },

  // Create validation middleware that doesn't handle errors automatically
  withoutErrorHandling: <T = any>(
    schema: any,
    options?: Omit<ValidationMiddlewareOptions, 'handleErrors' | 'errorHandler'>
  ) => {
    return createValidationMiddleware(schema, {
      ...options,
      handleErrors: false
    })
  },

  // Create validation middleware that adds context but doesn't transform data
  contextOnly: <T = any>(
    schema: any,
    options?: Omit<ValidationMiddlewareOptions, 'transform' | 'handleErrors' | 'errorHandler'>
  ) => {
    return createValidationMiddleware(schema, {
      ...options,
      transform: false,
      handleErrors: false,
      addContext: true
    })
  },
}

// Common validation middleware shortcuts
export const CommonValidationMiddleware = {
  // Validate pagination parameters
  pagination: (options?: ValidationMiddlewareOptions) =>
    RouteValidationMiddleware.query(
      {
        page: { type: 'number', integer: true, positive: true, default: 1 },
        limit: { type: 'number', integer: true, positive: true, max: 100, default: 20 },
        sortBy: { type: 'string', optional: true },
        sortOrder: { type: 'enum', enum: ['asc', 'desc'], default: 'desc' }
      },
      options
    ),

  // Validate search parameters
  search: (options?: ValidationMiddlewareOptions) =>
    RouteValidationMiddleware.query(
      {
        q: { type: 'string', minLength: 2, maxLength: 1000 },
        page: { type: 'number', integer: true, positive: true, default: 1 },
        limit: { type: 'number', integer: true, positive: true, max: 100, default: 20 }
      },
      options
    ),

  // Validate ID parameter
  id: (options?: ValidationMiddlewareOptions) =>
    RouteValidationMiddleware.params(
      {
        id: { type: 'string', format: 'uuid' }
      },
      options
    ),

  // Validate authentication token
  authToken: (options?: ValidationMiddlewareOptions) =>
    RouteValidationMiddleware.headers(
      {
        authorization: { type: 'string', pattern: /^Bearer .+$/ }
      },
      options
    ),

  // Validate content type
  contentType: (allowedTypes: string[], options?: ValidationMiddlewareOptions) =>
    RouteValidationMiddleware.headers(
      {
        'content-type': { type: 'enum', enum: allowedTypes }
      },
      options
    ),
}

export {
  createValidationMiddleware,
  validate,
  asyncValidate,
  RouteValidationMiddleware,
  ValidationMiddlewareUtils,
  CommonValidationMiddleware,
  handleValidationError,
}

// Export types for use in route handlers
export type {
  ValidationMiddlewareOptions,
}
