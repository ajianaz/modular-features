import { z } from 'zod'

// Base entity interface for all entities
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Base entity schema for validation
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Soft deleteable entity interface
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date | null
  isDeleted: boolean
}

// Soft deleteable entity schema
export const SoftDeletableEntitySchema = BaseEntitySchema.extend({
  deletedAt: z.date().nullable().optional(),
  isDeleted: z.boolean(),
})

// User-auditable entity interface
export interface AuditableEntity extends BaseEntity {
  createdBy?: string | null
  updatedBy?: string | null
}

// User-auditable entity schema
export const AuditableEntitySchema = BaseEntitySchema.extend({
  createdBy: z.string().uuid().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(),
})

// Status entity interface
export interface StatusEntity {
  status: string
  isActive: boolean
}

// Status entity schema
export const StatusEntitySchema = z.object({
  status: z.string(),
  isActive: z.boolean(),
})

// Timestamp entity interface for temporal data
export interface TimestampEntity {
  startsAt?: Date | null
  endsAt?: Date | null
  expiresAt?: Date | null
}

// Timestamp entity schema
export const TimestampEntitySchema = z.object({
  startsAt: z.date().nullable().optional(),
  endsAt: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
})

// Metadata entity interface for flexible data storage
export interface MetadataEntity {
  metadata?: Record<string, any> | null
}

// Metadata entity schema
export const MetadataEntitySchema = z.object({
  metadata: z.record(z.any()).nullable().optional(),
})

// Complete base entity interface
export interface CompleteEntity extends 
  BaseEntity, 
  AuditableEntity, 
  SoftDeletableEntity, 
  StatusEntity, 
  TimestampEntity, 
  MetadataEntity {}

// Complete base entity schema
export const CompleteEntitySchema = z.intersection(
  z.intersection(
    z.intersection(
      z.intersection(
        z.intersection(BaseEntitySchema, AuditableEntitySchema),
        SoftDeletableEntitySchema
      ),
      StatusEntitySchema
    ),
    TimestampEntitySchema
  ),
  MetadataEntitySchema
)

// Generic repository interface
export interface IRepository<T, ID = string> {
  // Basic CRUD operations
  findById(id: ID): Promise<T | null>
  findOne(filters: Partial<T>): Promise<T | null>
  findMany(filters?: Partial<T>, options?: FindOptions<T>): Promise<T[]>
  findManyPaginated(filters?: Partial<T>, pagination?: PaginationOptions): Promise<PaginatedResult<T>>
  
  // Create operations
  create(data: Omit<T, keyof BaseEntity | 'id'>): Promise<T>
  createMany(data: Omit<T, keyof BaseEntity | 'id'>[]): Promise<T[]>
  
  // Update operations
  update(id: ID, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T>
  updateMany(filters: Partial<T>, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T[]>
  
  // Delete operations
  delete(id: ID): Promise<boolean>
  deleteMany(filters: Partial<T>): Promise<number>
  
  // Soft delete operations (if supported)
  softDelete(id: ID): Promise<boolean>
  softDeleteMany(filters: Partial<T>): Promise<number>
  
  // Restore operations (if supported)
  restore(id: ID): Promise<boolean>
  restoreMany(filters: Partial<T>): Promise<number>
  
  // Count operations
  count(filters?: Partial<T>): Promise<number>
}

// Find options for queries
export interface FindOptions<T> {
  orderBy?: keyof T
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
  include?: Record<string, any>
  select?: (keyof T)[]
}

// Pagination options
export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Paginated result interface
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Generic value object interface
export interface ValueObject<T> {
  value: T
  equals(other: ValueObject<T>): boolean
  toJSON(): T
}

// Generic aggregate root interface (DDD)
export interface AggregateRoot<T extends string> extends BaseEntity {
  getType(): T
  getVersion(): number
  incrementVersion(): void
}

// Generic domain event interface (DDD)
export interface DomainEvent<T extends string> {
  type: T
  aggregateId: string
  aggregateType: string
  occurredOn: Date
  version: number
  data?: Record<string, any>
}

// Generic specification interface (DDD)
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean
  and(other: Specification<T>): Specification<T>
  or(other: Specification<T>): Specification<T>
  not(): Specification<T>
}

// Type helpers
export type CreateEntity<T> = Omit<T, keyof BaseEntity | 'id'>
export type UpdateEntity<T> = Partial<Omit<T, keyof BaseEntity>>
export type Filters<T> = Partial<T>
export type SortField<T> = keyof T

// Common ID types for type safety
export type UserId = string & { readonly brand: unique symbol }
export type OrderId = string & { readonly brand: unique symbol }
export type PaymentId = string & { readonly brand: unique symbol }
export type SubscriptionId = string & { readonly brand: unique symbol }
export type NotificationId = string & { readonly brand: unique symbol }
export type InvoiceId = string & { readonly brand: unique symbol }
export type TransactionId = string & { readonly brand: unique symbol }
export type SessionId = string & { readonly brand: unique symbol }
export type TemplateId = string & { readonly brand: unique symbol }

// Type guards for ID types
export const isUserId = (id: string): id is UserId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isOrderId = (id: string): id is OrderId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isPaymentId = (id: string): id is PaymentId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isSubscriptionId = (id: string): id is SubscriptionId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isNotificationId = (id: string): id is NotificationId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isInvoiceId = (id: string): id is InvoiceId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isTransactionId = (id: string): id is TransactionId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isSessionId = (id: string): id is SessionId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
export const isTemplateId = (id: string): id is TemplateId => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

// Common entity status types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type SubscriptionStatus = 'trial' | 'active' | 'grace_period' | 'past_due' | 'cancelled' | 'expired'
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled'

// Common action types for audit logs
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject' | 'export' | 'import'
export type AuditCategory = 'auth' | 'users' | 'payments' | 'orders' | 'subscriptions' | 'notifications' | 'system' | 'security'
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

// Export types
export type {
  IRepository,
  FindOptions,
  PaginationOptions,
  PaginatedResult,
  ValueObject,
  AggregateRoot,
  DomainEvent,
  Specification,
  CreateEntity,
  UpdateEntity,
  Filters,
  SortField,
}
