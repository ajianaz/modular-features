import { DomainError } from './base'

// Not found error class
export class NotFoundError extends DomainError {
  private resource: string
  private resourceId?: string

  constructor(
    resource: string,
    resourceId?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `${resource}${resourceId ? ` with ID ${resourceId}` : ''} not found`,
      {
        ...context,
        resource,
        resourceId,
      }
    )
    this.resource = resource
    this.resourceId = resourceId
  }

  public get code(): string {
    return 'NOT_FOUND'
  }

  public get statusCode(): number {
    return 404
  }

  public getResource(): string {
    return this.resource
  }

  public getResourceId(): string | undefined {
    return this.resourceId
  }
}

// Conflict error class
export class ConflictError extends DomainError {
  private resource: string
  private conflictReason: string

  constructor(
    resource: string,
    conflictReason: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Conflict in ${resource}: ${conflictReason}`,
      {
        ...context,
        resource,
        conflictReason,
      }
    )
    this.resource = resource
    this.conflictReason = conflictReason
  }

  public get code(): string {
    return 'CONFLICT'
  }

  public get statusCode(): number {
    return 409
  }

  public getResource(): string {
    return this.resource
  }

  public getConflictReason(): string {
    return this.conflictReason
  }
}

// Already exists error class
export class AlreadyExistsError extends ConflictError {
  constructor(
    resource: string,
    identifier: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      resource,
      `already exists with identifier: ${identifier}`,
      message || `${resource} with identifier '${identifier}' already exists`,
      {
        ...context,
        resource,
        identifier,
      }
    )
  }

  public get code(): string {
    return 'ALREADY_EXISTS'
  }

  public getIdentifier(): string {
    return this.getConflictReason().replace('already exists with identifier: ', '')
  }
}

// Invalid state error class
export class InvalidStateError extends DomainError {
  private currentState: string
  private expectedStates: string[]

  constructor(
    entity: string,
    currentState: string,
    expectedStates: string[],
    message?: string,
    context?: Record<string, any>
  ) {
    const expectedStatesStr = expectedStates.join(', ')
    super(
      message || `Cannot ${getCurrentOperation(context)} ${entity}. Current state is '${currentState}', expected one of: ${expectedStatesStr}`,
      {
        ...context,
        entity,
        currentState,
        expectedStates,
      }
    )
    this.currentState = currentState
    this.expectedStates = expectedStates
  }

  public get code(): string {
    return 'INVALID_STATE'
  }

  public getCurrentState(): string {
    return this.currentState
  }

  public getExpectedStates(): string[] {
    return [...this.expectedStates]
  }
}

// Invalid operation error class
export class InvalidOperationError extends DomainError {
  private operation: string
  private reason: string

  constructor(
    operation: string,
    reason: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Invalid operation '${operation}': ${reason}`,
      {
        ...context,
        operation,
        reason,
      }
    )
    this.operation = operation
    this.reason = reason
  }

  public get code(): string {
    return 'INVALID_OPERATION'
  }

  public getOperation(): string {
    return this.operation
  }

  public getReason(): string {
    return this.reason
  }
}

// Business rule violation error class
export class BusinessRuleViolationError extends DomainError {
  private rule: string
  private details?: string

  constructor(
    rule: string,
    details?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Business rule violation: ${rule}${details ? ` - ${details}` : ''}`,
      {
        ...context,
        rule,
        details,
      }
    )
    this.rule = rule
    this.details = details
  }

  public get code(): string {
    return 'BUSINESS_RULE_VIOLATION'
  }

  public getRule(): string {
    return this.rule
  }

  public getDetails(): string | undefined {
    return this.details
  }
}

// Permission denied error class
export class PermissionDeniedError extends DomainError {
  private permission: string
  private resource?: string

  constructor(
    permission: string,
    resource?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Permission '${permission}' required${resource ? ` for resource '${resource}'` : ''}`,
      {
        ...context,
        permission,
        resource,
      }
    )
    this.permission = permission
    this.resource = resource
  }

  public get code(): string {
    return 'PERMISSION_DENIED'
  }

  public get statusCode(): number {
    return 403
  }

  public getPermission(): string {
    return this.permission
  }

  public getResource(): string | undefined {
    return this.resource
  }
}

// Insufficient privileges error class
export class InsufficientPrivilegesError extends PermissionDeniedError {
  private requiredLevel: number
  private currentLevel: number

  constructor(
    requiredLevel: number,
    currentLevel: number,
    resource?: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      `privilege_level_${requiredLevel}`,
      resource,
      message || `Insufficient privileges. Required level: ${requiredLevel}, current level: ${currentLevel}`,
      {
        ...context,
        requiredLevel,
        currentLevel,
        resource,
      }
    )
    this.requiredLevel = requiredLevel
    this.currentLevel = currentLevel
  }

  public get code(): string {
    return 'INSUFFICIENT_PRIVILEGES'
  }

  public getRequiredLevel(): number {
    return this.requiredLevel
  }

  public getCurrentLevel(): number {
    return this.currentLevel
  }
}

// Operation not allowed error class
export class OperationNotAllowedError extends DomainError {
  private operation: string
  private reason: string

  constructor(
    operation: string,
    reason: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Operation '${operation}' not allowed: ${reason}`,
      {
        ...context,
        operation,
        reason,
      }
    )
    this.operation = operation
    this.reason = reason
  }

  public get code(): string {
    return 'OPERATION_NOT_ALLOWED'
  }

  public getOperation(): string {
    return this.operation
  }

  public getReason(): string {
    return this.reason
  }
}

// Domain invariant violation error class
export class DomainInvariantViolationError extends DomainError {
  private invariant: string
  private currentValue: any

  constructor(
    invariant: string,
    currentValue: any,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Domain invariant violation: ${invariant}. Current value: ${currentValue}`,
      {
        ...context,
        invariant,
        currentValue,
      }
    )
    this.invariant = invariant
    this.currentValue = currentValue
  }

  public get code(): string {
    return 'DOMAIN_INVARIANT_VIOLATION'
  }

  public getInvariant(): string {
    return this.invariant
  }

  public getCurrentValue(): any {
    return this.currentValue
  }
}

// Entity not accessible error class
export class EntityNotAccessibleError extends DomainError {
  private entity: string
  private entityId: string
  private reason: string

  constructor(
    entity: string,
    entityId: string,
    reason: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Entity '${entity}' with ID '${entityId}' is not accessible: ${reason}`,
      {
        ...context,
        entity,
        entityId,
        reason,
      }
    )
    this.entity = entity
    this.entityId = entityId
    this.reason = reason
  }

  public get code(): string {
    return 'ENTITY_NOT_ACCESSIBLE'
  }

  public getEntity(): string {
    return this.entity
  }

  public getEntityId(): string {
    return this.entityId
  }

  public getReason(): string {
    return this.reason
  }
}

// Aggregate not found error class
export class AggregateNotFoundError extends NotFoundError {
  constructor(
    aggregate: string,
    aggregateId: string,
    context?: Record<string, any>
  ) {
    super(
      `aggregate_${aggregate}`,
      aggregateId,
      `Aggregate '${aggregate}' with ID '${aggregateId}' not found`,
      {
        ...context,
        aggregate,
        aggregateId,
      }
    )
  }

  public get code(): string {
    return 'AGGREGATE_NOT_FOUND'
  }

  public getAggregate(): string {
    return this.getResource()
  }

  public getAggregateId(): string {
    return this.getResourceId()!
  }
}

// Concurrency error class
export class ConcurrencyError extends ConflictError {
  private entityType: string
  private entityId: string
  private expectedVersion: number
  private actualVersion: number

  constructor(
    entityType: string,
    entityId: string,
    expectedVersion: number,
    actualVersion: number,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      entityType,
      `concurrent modification detected for ${entityType} with ID ${entityId}. Expected version: ${expectedVersion}, actual version: ${actualVersion}`,
      message || `Concurrency error for ${entityType} with ID ${entityId}`,
      {
        ...context,
        entityType,
        entityId,
        expectedVersion,
        actualVersion,
      }
    )
    this.entityType = entityType
    this.entityId = entityId
    this.expectedVersion = expectedVersion
    this.actualVersion = actualVersion
  }

  public get code(): string {
    return 'CONCURRENCY_ERROR'
  }

  public getEntityType(): string {
    return this.entityType
  }

  public getEntityId(): string {
    return this.entityId
  }

  public getExpectedVersion(): number {
    return this.expectedVersion
  }

  public getActualVersion(): number {
    return this.actualVersion
  }
}

// Utility function to extract current operation from context
function getCurrentOperation(context?: Record<string, any>): string {
  if (context?.operation) {
    return context.operation
  }
  if (context?.action) {
    return context.action
  }
  return 'perform operation'
}

export {
  NotFoundError,
  ConflictError,
  AlreadyExistsError,
  InvalidStateError,
  InvalidOperationError,
  BusinessRuleViolationError,
  PermissionDeniedError,
  InsufficientPrivilegesError,
  OperationNotAllowedError,
  DomainInvariantViolationError,
  EntityNotAccessibleError,
  AggregateNotFoundError,
  ConcurrencyError,
}
