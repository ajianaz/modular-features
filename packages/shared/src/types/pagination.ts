import { z } from 'zod'

// Pagination Options interface
export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

// Pagination Options schema
export const PaginationOptionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).optional(),
})

// Sort Options interface
export interface SortOptions {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

// Sort Options schema
export const SortOptionsSchema = z.object({
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

// Filter Options interface
export interface FilterOptions {
  search?: string
  filters?: Record<string, any>
  dateRange?: {
    from?: string | Date
    to?: string | Date
  }
  status?: string[]
  tags?: string[]
}

// Filter Options schema
export const FilterOptionsSchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.any()).optional(),
  dateRange: z.object({
    from: z.union([z.string().datetime(), z.date()]).optional(),
    to: z.union([z.string().datetime(), z.date()]).optional(),
  }).optional(),
  status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

// Query Options interface (combined)
export interface QueryOptions extends PaginationOptions, SortOptions, FilterOptions {
  include?: Record<string, any>
  select?: string[]
  groupBy?: string[]
  having?: Record<string, any>
}

// Query Options schema
export const QueryOptionsSchema = z.intersection(
  z.intersection(PaginationOptionsSchema, SortOptionsSchema),
  z.intersection(FilterOptionsSchema, z.object({
    include: z.record(z.any()).optional(),
    select: z.array(z.string()).optional(),
    groupBy: z.array(z.string()).optional(),
    having: z.record(z.any()).optional(),
  }))
)

// Pagination Result interface
export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    offset?: number
    nextOffset?: number
    prevOffset?: number
  }
}

// Pagination Result schema
export const createPaginationResultSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    offset: z.number().optional(),
    nextOffset: z.number().optional(),
    prevOffset: z.number().optional(),
  }),
})

// Cursor-based pagination interface
export interface CursorPaginationOptions {
  cursor?: string
  limit?: number
  direction?: 'forward' | 'backward'
}

// Cursor Pagination Options schema
export const CursorPaginationOptionsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  direction: z.enum(['forward', 'backward']).default('forward'),
})

// Cursor Pagination Result interface
export interface CursorPaginationResult<T> {
  data: T[]
  pagination: {
    hasNextPage: boolean
    hasPrevPage: boolean
    startCursor?: string
    endCursor?: string
    nextCursor?: string
    prevCursor?: string
    totalCount?: number
  }
}

// Cursor Pagination Result schema
export const createCursorPaginationResultSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    startCursor: z.string().optional(),
    endCursor: z.string().optional(),
    nextCursor: z.string().optional(),
    prevCursor: z.string().optional(),
    totalCount: z.number().optional(),
  }),
})

// Pagination helper functions
export const calculatePagination = (
  total: number,
  page: number,
  limit: number,
  offset?: number
) => {
  const totalPages = Math.ceil(total / limit)
  const actualOffset = offset !== undefined ? offset : (page - 1) * limit
  const hasNext = actualOffset + limit < total
  const hasPrev = actualOffset > 0
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    offset: actualOffset,
    nextOffset: hasNext ? actualOffset + limit : undefined,
    prevOffset: hasPrev ? Math.max(0, actualOffset - limit) : undefined,
  }
}

// Build pagination info for cursor-based pagination
export const buildCursorPaginationInfo = (
  data: any[],
  limit: number,
  direction: 'forward' | 'backward',
  totalCount?: number
) => {
  const hasNextPage = direction === 'forward' ? data.length > limit : false
  const hasPrevPage = direction === 'backward' ? data.length > limit : false
  
  // Remove the extra item used to determine if there's another page
  const items = hasNextPage || hasPrevPage ? data.slice(0, limit) : data
  
  return {
    data: items,
    pagination: {
      hasNextPage: direction === 'forward' ? hasNextPage : hasPrevPage,
      hasPrevPage: direction === 'forward' ? hasPrevPage : hasNextPage,
      startCursor: items.length > 0 ? items[0].cursor : undefined,
      endCursor: items.length > 0 ? items[items.length - 1].cursor : undefined,
      nextCursor: direction === 'forward' && hasNextPage ? items[items.length - 1].cursor : undefined,
      prevCursor: direction === 'backward' && hasPrevPage ? items[0].cursor : undefined,
      totalCount,
    }
  }
}

// Default pagination options
export const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
  page: 1,
  limit: 20,
}

// Default sort options
export const DEFAULT_SORT_OPTIONS: SortOptions = {
  sortDirection: 'desc',
}

// Default query options
export const DEFAULT_QUERY_OPTIONS: QueryOptions = {
  ...DEFAULT_PAGINATION_OPTIONS,
  ...DEFAULT_SORT_OPTIONS,
}

// Pagination validation helpers
export const validatePage = (page: any): number => {
  const parsed = parseInt(page, 10)
  if (isNaN(parsed) || parsed < 1) {
    return 1
  }
  return parsed
}

export const validateLimit = (limit: any, max: number = 100): number => {
  const parsed = parseInt(limit, 10)
  if (isNaN(parsed) || parsed < 1) {
    return 20
  }
  return Math.min(parsed, max)
}

export const validateOffset = (offset: any): number => {
  const parsed = parseInt(offset, 10)
  if (isNaN(parsed) || parsed < 0) {
    return 0
  }
  return parsed
}

// Type helpers
export type PaginationQuery = {
  page?: string
  limit?: string
  offset?: string
}

export type SortQuery = {
  sortBy?: string
  sortDirection?: string
}

export type FilterQuery = {
  search?: string
  filters?: Record<string, any>
  from?: string
  to?: string
  status?: string
  tags?: string
}

export type QueryParams = PaginationQuery & SortQuery & FilterQuery & {
  include?: string
  select?: string
  groupBy?: string
}

// Parse query parameters to QueryOptions
export const parseQueryParams = (params: QueryParams): QueryOptions => {
  const result: QueryOptions = {}

  // Pagination
  if (params.page) {
    result.page = validatePage(params.page)
  }
  if (params.limit) {
    result.limit = validateLimit(params.limit)
  }
  if (params.offset) {
    result.offset = validateOffset(params.offset)
  }

  // Sort
  if (params.sortBy) {
    result.sortBy = params.sortBy
  }
  if (params.sortDirection) {
    const direction = params.sortDirection.toLowerCase()
    if (direction === 'asc' || direction === 'desc') {
      result.sortDirection = direction as 'asc' | 'desc'
    }
  }

  // Filters
  if (params.search) {
    result.search = params.search
  }
  if (params.filters) {
    try {
      result.filters = typeof params.filters === 'string' 
        ? JSON.parse(params.filters) 
        : params.filters
    } catch (error) {
      // Invalid JSON, ignore
    }
  }
  if (params.from || params.to) {
    result.dateRange = {}
    if (params.from) {
      result.dateRange.from = new Date(params.from)
    }
    if (params.to) {
      result.dateRange.to = new Date(params.to)
    }
  }
  if (params.status) {
    result.status = params.status.split(',').map(s => s.trim())
  }
  if (params.tags) {
    result.tags = params.tags.split(',').map(t => t.trim())
  }

  // Additional options
  if (params.include) {
    try {
      result.include = typeof params.include === 'string' 
        ? JSON.parse(params.include) 
        : params.include
    } catch (error) {
      // Invalid JSON, ignore
    }
  }
  if (params.select) {
    result.select = params.select.split(',').map(s => s.trim())
  }
  if (params.groupBy) {
    result.groupBy = params.groupBy.split(',').map(s => s.trim())
  }

  return result
}

export type {
  PaginationOptions,
  SortOptions,
  FilterOptions,
  QueryOptions,
  PaginationResult,
  CursorPaginationOptions,
  CursorPaginationResult,
  PaginationQuery,
  SortQuery,
  FilterQuery,
  QueryParams,
}
