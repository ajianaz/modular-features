import { DomainError } from './base'

// Base validation error class
export class ValidationError extends DomainError {
  private field: string
  private constraint: string
  private value?: any

  constructor(
    message: string,
    field: string,
    constraint: string,
    value?: any,
    context?: Record<string, any>
  ) {
    super(message, {
      ...context,
      field,
      constraint,
      value,
    })
    this.field = field
    this.constraint = constraint
    this.value = value
  }

  public get code(): string {
    return 'VALIDATION_ERROR'
  }

  public get statusCode(): number {
    return 400
  }

  public getField(): string {
    return this.field
  }

  public getConstraint(): string {
    return this.constraint
  }

  public getValue(): any {
    return this.value
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      field: this.field,
      constraint: this.constraint,
      value: this.value,
    }
  }
}

// Invalid input error class
export class InvalidInputError extends ValidationError {
  constructor(
    field: string,
    message: string = `Invalid input for field: ${field}`,
    value?: any,
    context?: Record<string, any>
  ) {
    super(message, field, 'invalid_input', value, context)
  }

  public get code(): string {
    return 'INVALID_INPUT'
  }
}

// Required field error class
export class RequiredFieldError extends ValidationError {
  constructor(
    field: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Field '${field}' is required`,
      field,
      'required_field',
      undefined,
      context
    )
  }

  public get code(): string {
    return 'MISSING_REQUIRED_FIELD'
  }
}

// Invalid format error class
export class InvalidFormatError extends ValidationError {
  private format: string

  constructor(
    field: string,
    format: string,
    value: any,
    message?: string,
    context?: Record<string, any>
  ) {
    super(
      message || `Field '${field}' must be in ${format} format`,
      field,
      'invalid_format',
      value,
      context
    )
    this.format = format
  }

  public get code(): string {
    return 'INVALID_FORMAT'
  }

  public getExpectedFormat(): string {
    return this.format
  }
}

// Email validation error class
export class EmailValidationError extends InvalidFormatError {
  constructor(
    field: string = 'email',
    value: any,
    context?: Record<string, any>
  ) {
    super(
      field,
      'email',
      value,
      `Field '${field}' must be a valid email address`,
      context
    )
  }

  public get code(): string {
    return 'INVALID_EMAIL_FORMAT'
  }
}

// Phone number validation error class
export class PhoneValidationError extends InvalidFormatError {
  constructor(
    field: string = 'phone',
    value: any,
    context?: Record<string, any>
  ) {
    super(
      field,
      'phone',
      value,
      `Field '${field}' must be a valid phone number`,
      context
    )
  }

  public get code(): string {
    return 'INVALID_PHONE_FORMAT'
  }
}

// UUID validation error class
export class UUIDValidationError extends InvalidFormatError {
  constructor(
    field: string,
    value: any,
    context?: Record<string, any>
  ) {
    super(
      field,
      'uuid',
      value,
      `Field '${field}' must be a valid UUID`,
      context
    )
  }

  public get code(): string {
    return 'INVALID_UUID_FORMAT'
  }
}

// URL validation error class
export class URLValidationError extends InvalidFormatError {
  constructor(
    field: string,
    value: any,
    context?: Record<string, any>
  ) {
    super(
      field,
      'url',
      value,
      `Field '${field}' must be a valid URL`,
      context
    )
  }

  public get code(): string {
    return 'INVALID_URL_FORMAT'
  }
}

// Date validation error class
export class DateValidationError extends InvalidFormatError {
  constructor(
    field: string,
    value: any,
    context?: Record<string, any>
  ) {
    super(
      field,
      'date',
      value,
      `Field '${field}' must be a valid date`,
      context
    )
  }

  public get code(): string {
    return 'INVALID_DATE_FORMAT'
  }
}

// String length validation error class
export class StringLengthValidationError extends ValidationError {
  private minLength?: number
  private maxLength?: number

  constructor(
    field: string,
    value: string,
    minLength?: number,
    maxLength?: number,
    context?: Record<string, any>
  ) {
    let message = `Field '${field}' has invalid length`
    if (minLength !== undefined && maxLength !== undefined) {
      message = `Field '${field}' must be between ${minLength} and ${maxLength} characters`
    } else if (minLength !== undefined) {
      message = `Field '${field}' must be at least ${minLength} characters`
    } else if (maxLength !== undefined) {
      message = `Field '${field}' must not exceed ${maxLength} characters`
    }

    super(
      message,
      field,
      'invalid_length',
      value,
      context
    )
    this.minLength = minLength
    this.maxLength = maxLength
  }

  public get code(): string {
    return 'INVALID_STRING_LENGTH'
  }

  public getMinLength(): number | undefined {
    return this.minLength
  }

  public getMaxLength(): number | undefined {
    return this.maxLength
  }
}

// Number range validation error class
export class NumberRangeValidationError extends ValidationError {
  private min?: number
  private max?: number

  constructor(
    field: string,
    value: number,
    min?: number,
    max?: number,
    context?: Record<string, any>
  ) {
    let message = `Field '${field}' has invalid value`
    if (min !== undefined && max !== undefined) {
      message = `Field '${field}' must be between ${min} and ${max}`
    } else if (min !== undefined) {
      message = `Field '${field}' must be at least ${min}`
    } else if (max !== undefined) {
      message = `Field '${field}' must not exceed ${max}`
    }

    super(
      message,
      field,
      'invalid_range',
      value,
      context
    )
    this.min = min
    this.max = max
  }

  public get code(): string {
    return 'INVALID_NUMBER_RANGE'
  }

  public getMin(): number | undefined {
    return this.min
  }

  public getMax(): number | undefined {
    return this.max
  }
}

// Array validation error class
export class ArrayValidationError extends ValidationError {
  private minItems?: number
  private maxItems?: number

  constructor(
    field: string,
    value: any[],
    minItems?: number,
    maxItems?: number,
    context?: Record<string, any>
  ) {
    let message = `Field '${field}' has invalid array`
    if (minItems !== undefined && maxItems !== undefined) {
      message = `Field '${field}' must contain between ${minItems} and ${maxItems} items`
    } else if (minItems !== undefined) {
      message = `Field '${field}' must contain at least ${minItems} items`
    } else if (maxItems !== undefined) {
      message = `Field '${field}' must not exceed ${maxItems} items`
    }

    super(
      message,
      field,
      'invalid_array',
      value,
      context
    )
    this.minItems = minItems
    this.maxItems = maxItems
  }

  public get code(): string {
    return 'INVALID_ARRAY_LENGTH'
  }

  public getMinItems(): number | undefined {
    return this.minItems
  }

  public getMaxItems(): number | undefined {
    return this.maxItems
  }
}

// Enum validation error class
export class EnumValidationError extends ValidationError {
  private allowedValues: any[]

  constructor(
    field: string,
    value: any,
    allowedValues: any[],
    context?: Record<string, any>
  ) {
    super(
      `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
      field,
      'invalid_enum',
      value,
      context
    )
    this.allowedValues = allowedValues
  }

  public get code(): string {
    return 'INVALID_ENUM_VALUE'
  }

  public getAllowedValues(): any[] {
    return [...this.allowedValues]
  }
}

// Multiple validation errors class
export class MultipleValidationErrors extends ValidationError {
  private errors: ValidationError[]

  constructor(
    errors: ValidationError[],
    context?: Record<string, any>
  ) {
    const messages = errors.map(error => error.message)
    super(
      `Multiple validation errors: ${messages.join('; ')}`,
      'multiple',
      'multiple_errors',
      errors.map(error => error.getField()),
      context
    )
    this.errors = errors
  }

  public get code(): string {
    return 'MULTIPLE_VALIDATION_ERRORS'
  }

  public getErrors(): ValidationError[] {
    return [...this.errors]
  }

  public getErrorsByField(): Record<string, ValidationError[]> {
    const errorsByField: Record<string, ValidationError[]> = {}
    
    for (const error of this.errors) {
      const field = error.getField()
      if (!errorsByField[field]) {
        errorsByField[field] = []
      }
      errorsByField[field].push(error)
    }

    return errorsByField
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      errors: this.errors.map(error => error.toJSON()),
      errorsByField: this.getErrorsByField(),
    }
  }
}

// Validation error builder
export class ValidationErrorBuilder {
  private errors: ValidationError[] = []

  static create(): ValidationErrorBuilder {
    return new ValidationErrorBuilder()
  }

  addFieldError(
    field: string,
    message: string,
    constraint: string = 'invalid_input',
    value?: any
  ): ValidationErrorBuilder {
    this.errors.push(new ValidationError(message, field, constraint, value))
    return this
  }

  addRequiredError(field: string, message?: string): ValidationErrorBuilder {
    this.errors.push(new RequiredFieldError(field, message))
    return this
  }

  addFormatError(
    field: string,
    format: string,
    value: any,
    message?: string
  ): ValidationErrorBuilder {
    this.errors.push(new InvalidFormatError(field, format, value, message))
    return this
  }

  addEmailError(field: string, value: any): ValidationErrorBuilder {
    this.errors.push(new EmailValidationError(field, value))
    return this
  }

  addPhoneError(field: string, value: any): ValidationErrorBuilder {
    this.errors.push(new PhoneValidationError(field, value))
    return this
  }

  addUUIDError(field: string, value: any): ValidationErrorBuilder {
    this.errors.push(new UUIDValidationError(field, value))
    return this
  }

  addURLError(field: string, value: any): ValidationErrorBuilder {
    this.errors.push(new URLValidationError(field, value))
    return this
  }

  addDateError(field: string, value: any): ValidationErrorBuilder {
    this.errors.push(new DateValidationError(field, value))
    return this
  }

  addStringLengthError(
    field: string,
    value: string,
    minLength?: number,
    maxLength?: number
  ): ValidationErrorBuilder {
    this.errors.push(new StringLengthValidationError(field, value, minLength, maxLength))
    return this
  }

  addNumberRangeError(
    field: string,
    value: number,
    min?: number,
    max?: number
  ): ValidationErrorBuilder {
    this.errors.push(new NumberRangeValidationError(field, value, min, max))
    return this
  }

  addArrayError(
    field: string,
    value: any[],
    minItems?: number,
    maxItems?: number
  ): ValidationErrorBuilder {
    this.errors.push(new ArrayValidationError(field, value, minItems, maxItems))
    return this
  }

  addEnumError(
    field: string,
    value: any,
    allowedValues: any[]
  ): ValidationErrorBuilder {
    this.errors.push(new EnumValidationError(field, value, allowedValues))
    return this
  }

  addCustomError(error: ValidationError): ValidationErrorBuilder {
    this.errors.push(error)
    return this
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  build(): ValidationError | null {
    if (this.errors.length === 0) {
      return null
    }

    if (this.errors.length === 1) {
      return this.errors[0]
    }

    return new MultipleValidationErrors(this.errors)
  }

  buildOrThrow(): void {
    const error = this.build()
    if (error) {
      throw error
    }
  }

  getErrors(): ValidationError[] {
    return [...this.errors]
  }

  getErrorsByField(): Record<string, ValidationError[]> {
    const errorsByField: Record<string, ValidationError[]> = {}
    
    for (const error of this.errors) {
      const field = error.getField()
      if (!errorsByField[field]) {
        errorsByField[field] = []
      }
      errorsByField[field].push(error)
    }

    return errorsByField
  }

  clear(): ValidationErrorBuilder {
    this.errors = []
    return this
  }
}

export {
  ValidationError,
  InvalidInputError,
  RequiredFieldError,
  InvalidFormatError,
  EmailValidationError,
  PhoneValidationError,
  UUIDValidationError,
  URLValidationError,
  DateValidationError,
  StringLengthValidationError,
  NumberRangeValidationError,
  ArrayValidationError,
  EnumValidationError,
  MultipleValidationErrors,
  ValidationErrorBuilder,
}
