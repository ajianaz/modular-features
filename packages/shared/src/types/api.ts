import { z } from 'zod'
import { PaginationOptions, PaginatedResult } from './base'

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// HTTP Status codes
export type HttpStatus = 
  | 100 | 101 | 102 // Informational
  | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 // Success
  | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 // Redirection
  | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 // Client Error
  | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511 // Server Error

// Base API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: ResponseMeta
  timestamp: string
  requestId?: string
}

// Response metadata interface
export interface ResponseMeta {
  version?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  rateLimit?: {
    limit: number
    remaining: number
    reset: number
  }
  executionTime?: number
  cacheHit?: boolean
}

// API Error interface
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
  stack?: string
}

// Validation Error Response interface
export interface ValidationErrorResponse {
  success: false
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    fields: Record<string, string[]>
  }
  timestamp: string
}

// Pagination Response interface
export interface PaginationResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  timestamp: string
}

// Request Context interface
export interface RequestContext {
  requestId: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  startTime: number
  method: HttpMethod
  url: string
  path: string
  query: Record<string, string>
  headers: Record<string, string>
  body?: any
  files?: File[]
}

// Response Context interface
export interface ResponseContext {
  statusCode: HttpStatus
  headers: Record<string, string>
  body: any
  executionTime: number
  cached: boolean
  requestId: string
}

// Generic DTO interface
export interface DTO<T = any> {
  validate(): Promise<void>
  toJSON(): T
}

// Base Request DTO interface
export interface RequestDTO<T = any> extends DTO<T> {
  requestId?: string
  userId?: string
}

// Base Response DTO interface
export interface ResponseDTO<T = any> extends DTO<T> {
  success: boolean
  message?: string
  requestId?: string
}

// Pagination Request DTO
export interface PaginationRequestDTO {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Filter Request DTO
export interface FilterRequestDTO {
  search?: string
  filters?: Record<string, any>
  dateRange?: {
    from?: string
    to?: string
  }
  status?: string[]
}

// Sort Request DTO
export interface SortRequestDTO {
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

// Combined Query Request DTO
export interface QueryRequestDTO extends PaginationRequestDTO, FilterRequestDTO {
  sort?: SortRequestDTO[]
}

// Zod schemas for validation
export const PaginationRequestSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
})

export const FilterRequestSchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.any()).optional(),
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  status: z.array(z.string()).optional(),
})

export const SortRequestSchema = z.object({
  sortBy: z.string(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

export const QueryRequestSchema = z.object({
  ...PaginationRequestSchema.shape,
  ...FilterRequestSchema.shape,
  sort: z.array(SortRequestSchema).optional(),
})

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    field: z.string().optional(),
    timestamp: z.string(),
    stack: z.string().optional(),
  }).optional(),
  message: z.string().optional(),
  meta: z.object({
    version: z.string().optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
    rateLimit: z.object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.number(),
    }).optional(),
    executionTime: z.number().optional(),
    cacheHit: z.boolean().optional(),
  }).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
})

// API Error codes
export const ApiErrorCodes = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  INVALID_OPERATION: 'INVALID_OPERATION',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  THROTTLED: 'THROTTLED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  
  // Subscription errors
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  SUBSCRIPTION_LIMIT_EXCEEDED: 'SUBSCRIPTION_LIMIT_EXCEEDED',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  THIRD_PARTY_ERROR: 'THIRD_PARTY_ERROR',
} as const

export type ApiErrorCode = typeof ApiErrorCodes[keyof typeof ApiErrorCodes]

// HTTP Status mapping to error codes
export const HttpStatusMap: Record<HttpStatus, ApiErrorCode | null> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_ERROR',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'TIMEOUT_ERROR',
  
  // Other status codes - no specific error code
  100: null, 101: null, 102: null,
  200: null, 201: null, 202: null, 203: null, 204: null, 205: null, 206: null, 207: null, 208: null,
  300: null, 301: null, 302: null, 303: null, 304: null, 305: null, 306: null, 307: null, 308: null,
  402: null, 405: null, 406: null, 407: null, 408: null, 410: null, 411: null, 412: null, 413: null, 414: null, 415: null, 416: null, 417: null, 418: null, 421: null, 422: null, 423: null, 424: null, 425: null, 426: null, 428: null,
  501: null, 505: null, 506: null, 507: null, 508: null, 510: null, 511: null,
}

// Success response builder
export const createSuccessResponse = <T>(
  data: T,
  options: {
    message?: string
    meta?: ResponseMeta
    requestId?: string
  } = {}
): ApiResponse<T> => ({
  success: true,
  data,
  message: options.message,
  meta: options.meta,
  timestamp: new Date().toISOString(),
  requestId: options.requestId,
})

// Error response builder
export const createErrorResponse = (
  error: ApiError,
  options: {
    requestId?: string
  } = {}
): ApiResponse => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
  requestId: options.requestId,
})

// Paginated response builder
export const createPaginatedResponse = <T>(
  data: T[],
  pagination: Parameters<typeof createSuccessResponse>[1]['meta']['pagination'],
  options: {
    message?: string
    requestId?: string
  } = {}
): ApiResponse<T[]> => ({
  success: true,
  data,
  meta: {
    pagination,
    ...options,
  },
  timestamp: new Date().toISOString(),
  requestId: options.requestId,
})

// Error builder utility
export const createApiError = (
  code: ApiErrorCode,
  message: string,
  options: {
    details?: Record<string, any>
    field?: string
    stack?: string
  } = {}
): ApiError => ({
  code,
  message,
  details: options.details,
  field: options.field,
  timestamp: new Date().toISOString(),
  stack: options.stack,
})

// Type guards
export const isApiResponse = <T>(data: any): data is ApiResponse<T> => {
  return typeof data === 'object' && 
         data !== null && 
         'success' in data && 
         typeof data.success === 'boolean' &&
         'timestamp' in data &&
         typeof data.timestamp === 'string'
}

export const isApiError = (data: any): data is ApiError => {
  return typeof data === 'object' && 
         data !== null && 
         'code' in data && 
         'message' in data && 
         'timestamp' in data &&
         typeof data.code === 'string' &&
         typeof data.message === 'string' &&
         typeof data.timestamp === 'string'
}

export type {
  HttpMethod,
  HttpStatus,
  ApiResponse,
  ResponseMeta,
  ApiError,
  ValidationErrorResponse,
  PaginationResponse,
  RequestContext,
  ResponseContext,
  DTO,
  RequestDTO,
  ResponseDTO,
  PaginationRequestDTO,
  FilterRequestDTO,
  SortRequestDTO,
  QueryRequestDTO,
}
