import { z } from 'zod'
import { BaseEntity, DomainEvent, ValueObject } from './base'

// Domain Entity base interface (DDD)
export interface DomainEntity<T extends string> extends BaseEntity {
  getType(): T
  getVersion(): number
  getDomainEvents(): DomainEvent<string>[]
  addDomainEvent(event: DomainEvent<string>): void
  clearDomainEvents(): void
}

// Domain Entity base class
export abstract class BaseDomainEntity<T extends string> implements DomainEntity<T> {
  public readonly id: string
  public readonly createdAt: Date
  public updatedAt: Date
  protected domainEvents: DomainEvent<string>[] = []
  private version: number = 1

  constructor(id: string, createdAt: Date, updatedAt?: Date) {
    this.id = id
    this.createdAt = createdAt
    this.updatedAt = updatedAt || createdAt
  }

  public abstract getType(): T
  public getVersion(): number { return this.version }
  public getDomainEvents(): DomainEvent<string>[] { return [...this.domainEvents] }
  public addDomainEvent(event: DomainEvent<string>): void {
    this.domainEvents.push(event)
  }
  public clearDomainEvents(): void {
    this.domainEvents = []
  }
  protected incrementVersion(): void {
    this.version++
    this.updatedAt = new Date()
  }
}

// Aggregate Root interface (DDD)
export interface AggregateRoot<T extends string> extends DomainEntity<T> {
  // Aggregate root specific methods
  getAggregateId(): string
  markAsDeleted?(): void
  isDeleted?(): boolean
}

// Aggregate Root base class
export abstract class BaseAggregateRoot<T extends string> extends BaseDomainEntity<T> implements AggregateRoot<T> {
  protected isDeletedFlag: boolean = false

  public getAggregateId(): string { return this.id }
  public markAsDeleted(): void {
    this.isDeletedFlag = true
    this.incrementVersion()
  }
  public isDeleted(): boolean { return this.isDeletedFlag }
}

// Entity interface for regular entities
export interface Entity extends BaseEntity {
  // Entity specific methods
  equals(other: Entity): boolean
}

// Entity base class
export abstract class BaseEntityImpl implements Entity {
  public readonly id: string
  public readonly createdAt: Date
  public updatedAt: Date

  constructor(id: string, createdAt: Date, updatedAt?: Date) {
    this.id = id
    this.createdAt = createdAt
    this.updatedAt = updatedAt || createdAt
  }

  public equals(other: Entity): boolean {
    if (this === other) return true
    if (other === null || other === undefined) return false
    if (!(other instanceof BaseEntityImpl)) return false
    return this.id === other.id
  }
}

// Value Object base class
export abstract class BaseValueObject<T> implements ValueObject<T> {
  protected readonly value: T

  constructor(value: T) {
    this.value = value
    this.validate()
  }

  public getValue(): T { return this.value }
  public equals(other: BaseValueObject<T>): boolean {
    if (this === other) return true
    if (other === null || other === undefined) return false
    return JSON.stringify(this.value) === JSON.stringify(other.value)
  }
  public toJSON(): T { return this.value }
  public toString(): string { return JSON.stringify(this.value) }

  protected abstract validate(): void
}

// Domain Service interface
export interface DomainService<T> {
  // Domain service methods
  execute(input: T): Promise<any>
  validate(input: T): boolean
}

// Repository interface (DDD)
export interface Repository<T extends DomainEntity<string>, ID = string> {
  // Basic CRUD operations
  findById(id: ID): Promise<T | null>
  save(entity: T): Promise<T>
  delete(entity: T): Promise<void>
  
  // Query operations
  find(criteria: any): Promise<T[]>
  findOne(criteria: any): Promise<T | null>
  count(criteria: any): Promise<number>
  
  // Transaction support
  saveInTransaction(entities: T[]): Promise<T[]>
  deleteInTransaction(entities: T[]): Promise<void>
}

// Specification interface (DDD)
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean
  and(other: Specification<T>): Specification<T>
  or(other: Specification<T>): Specification<T>
  not(): Specification<T>
}

// Abstract Specification base class
export abstract class AbstractSpecification<T> implements Specification<T> {
  public abstract isSatisfiedBy(candidate: T): boolean

  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other)
  }

  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other)
  }

  public not(): Specification<T> {
    return new NotSpecification(this)
  }
}

// Composite specifications
class AndSpecification<T> extends AbstractSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) { super() }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
  }
}

class OrSpecification<T> extends AbstractSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) { super() }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
  }
}

class NotSpecification<T> extends AbstractSpecification<T> {
  constructor(private readonly spec: Specification<T>) { super() }

  public isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate)
  }
}

// Domain Event base class
export abstract class BaseDomainEvent<T extends string> implements DomainEvent<T> {
  public readonly type: T
  public readonly aggregateId: string
  public readonly aggregateType: string
  public readonly occurredOn: Date
  public readonly version: number
  public readonly data?: Record<string, any>

  constructor(
    type: T,
    aggregateId: string,
    aggregateType: string,
    data?: Record<string, any>
  ) {
    this.type = type
    this.aggregateId = aggregateId
    this.aggregateType = aggregateType
    this.occurredOn = new Date()
    this.version = 1
    this.data = data
  }
}

// Event Store interface
export interface EventStore {
  // Event store operations
  saveEvent(event: DomainEvent<string>): Promise<void>
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent<string>[]>
  getEventsByType(eventType: string, fromTime?: Date): Promise<DomainEvent<string>[]>
  
  // Snapshot support
  saveSnapshot(aggregateId: string, snapshot: any, version: number): Promise<void>
  getSnapshot(aggregateId: string, version?: number): Promise<any | null>
}

// Command interface (CQRS)
export interface Command<T = any> {
  type: string
  aggregateId?: string
  data: T
  timestamp: Date
  userId?: string
  requestId?: string
}

// Query interface (CQRS)
export interface Query<T = any> {
  type: string
  parameters: T
  timestamp: Date
  userId?: string
  requestId?: string
}

// Command Handler interface (CQRS)
export interface CommandHandler<C extends Command> {
  // Command handler methods
  canHandle(command: C): boolean
  handle(command: C): Promise<any>
}

// Query Handler interface (CQRS)
export interface QueryHandler<Q extends Query, R> {
  // Query handler methods
  canHandle(query: Q): boolean
  handle(query: Q): Promise<R>
}

// Bus interfaces
export interface CommandBus {
  // Command bus methods
  dispatch<C extends Command>(command: C): Promise<any>
  register<C extends Command>(commandType: string, handler: CommandHandler<C>): void
  unregister<C extends Command>(commandType: string): void
}

export interface QueryBus {
  // Query bus methods
  dispatch<Q extends Query, R>(query: Q): Promise<R>
  register<Q extends Query, R>(queryType: string, handler: QueryHandler<Q, R>): void
  unregister<Q extends Query>(queryType: string): void
}

export interface EventBus {
  // Event bus methods
  publish<T extends DomainEvent<string>>(event: T): Promise<void>
  publishBatch<T extends DomainEvent<string>>(events: T[]): Promise<void>
  subscribe<T extends DomainEvent<string>>(eventType: string, handler: (event: T) => Promise<void>): void
  unsubscribe(eventType: string): void
}

// Common domain value objects
export class Email extends BaseValueObject<string> {
  protected validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format')
    }
  }
}

export class PhoneNumber extends BaseValueObject<string> {
  protected validate(): void {
    const phoneRegex = /^\+?[\d\s-()]+$/
    if (!phoneRegex.test(this.value)) {
      throw new Error('Invalid phone number format')
    }
  }
}

export class Money extends BaseValueObject<{ amount: number; currency: string }> {
  protected validate(): void {
    if (this.value.amount < 0) {
      throw new Error('Amount cannot be negative')
    }
    if (!this.value.currency || this.value.currency.length !== 3) {
      throw new Error('Invalid currency code')
    }
  }

  public getAmount(): number { return this.value.amount }
  public getCurrency(): string { return this.value.currency }

  public add(other: Money): Money {
    if (this.value.currency !== other.value.currency) {
      throw new Error('Cannot add money with different currencies')
    }
    return new Money({
      amount: this.value.amount + other.value.amount,
      currency: this.value.currency
    })
  }

  public subtract(other: Money): Money {
    if (this.value.currency !== other.value.currency) {
      throw new Error('Cannot subtract money with different currencies')
    }
    if (this.value.amount < other.value.amount) {
      throw new Error('Insufficient funds')
    }
    return new Money({
      amount: this.value.amount - other.value.amount,
      currency: this.value.currency
    })
  }
}

export class Address extends BaseValueObject<{
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}> {
  protected validate(): void {
    if (!this.value.street || this.value.street.trim().length === 0) {
      throw new Error('Street is required')
    }
    if (!this.value.city || this.value.city.trim().length === 0) {
      throw new Error('City is required')
    }
    if (!this.value.country || this.value.country.trim().length === 0) {
      throw new Error('Country is required')
    }
    if (!this.value.postalCode || this.value.postalCode.trim().length === 0) {
      throw new Error('Postal code is required')
    }
  }
}

// Domain validation schemas
export const EmailSchema = z.string().email('Invalid email format')
export const PhoneNumberSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
export const MoneySchema = z.object({
  amount: z.number().nonnegative('Amount cannot be negative'),
  currency: z.string().length(3, 'Invalid currency code'),
})
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
})

// Export types
export type {
  DomainEntity,
  AggregateRoot,
  Entity,
  ValueObject,
  DomainService,
  Repository,
  Specification,
  DomainEvent,
  EventStore,
  Command,
  Query,
  CommandHandler,
  QueryHandler,
  CommandBus,
  QueryBus,
  EventBus,
}

// Export classes
export {
  BaseDomainEntity,
  BaseAggregateRoot,
  BaseEntityImpl,
  BaseValueObject,
  AbstractSpecification,
  BaseDomainEvent,
  Email,
  PhoneNumber,
  Money,
  Address,
}
