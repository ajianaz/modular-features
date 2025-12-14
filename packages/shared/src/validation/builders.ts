import { z } from 'zod'
import { ValidationError, ValidationErrorBuilder } from '../errors/validation'

// Validation Result interface
export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

// Schema Builder Class
export class SchemaBuilder<T = any> {
  private schema: z.ZodSchema<T>
  private schemaName?: string

  constructor(schema: z.ZodSchema<T>, name?: string) {
    this.schema = schema
    this.schemaName = name
  }

  // Create a new schema builder
  static create<T>(schema: z.ZodSchema<T>, name?: string): SchemaBuilder<T> {
    return new SchemaBuilder(schema, name)
  }

  // Extend the current schema
  extend<U>(schema: z.ZodSchema<U>, name?: string): SchemaBuilder<T & U> {
    const extendedSchema = z.intersection(this.schema, schema)
    return new SchemaBuilder(extendedSchema, name || this.schemaName)
  }

  // Add optional properties
  optional(): SchemaBuilder<T | undefined> {
    const optionalSchema = this.schema.optional()
    return new SchemaBuilder(optionalSchema, this.schemaName)
  }

  // Add nullable properties
  nullable(): SchemaBuilder<T | null> {
    const nullableSchema = this.schema.nullable()
    return new SchemaBuilder(nullableSchema, this.schemaName)
  }

  // Add default value
  default(value: T): SchemaBuilder<T> {
    const defaultSchema = this.schema.default(value)
    return new SchemaBuilder(defaultSchema, this.schemaName)
  }

  // Add refinement
  refine(
    refinement: (data: T) => boolean,
    message: string | ((data: T) => string)
  ): SchemaBuilder<T> {
    const refinedSchema = this.schema.refine(refinement, {
      message,
      path: [this.schemaName || 'value']
    })
    return new SchemaBuilder(refinedSchema, this.schemaName)
  }

  // Transform the data
  transform<U>(transformer: (data: T) => U): SchemaBuilder<U> {
    const transformedSchema = this.schema.transform(transformer)
    return new SchemaBuilder(transformedSchema, this.schemaName)
  }

  // Add custom validation
  custom<U>(
    validator: (data: T) => ValidationResult<U>
  ): SchemaBuilder<U> {
    const customSchema = this.schema.transform((data: T) => {
      const result = validator(data)
      if (!result.success) {
        throw new MultipleValidationErrors(result.errors || [])
      }
      return result.data
    })
    return new SchemaBuilder(customSchema, this.schemaName)
  }

  // Validate data
  safeParse(data: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(data)
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    }

    const errors = this.mapZodErrors(result.error)
    
    return {
      success: false,
      errors
    }
  }

  // Parse data (throws on error)
  parse(data: unknown): T {
    const result = this.safeParse(data)
    if (!result.success) {
      if (result.errors?.length === 1) {
        throw result.errors[0]
      }
      throw new MultipleValidationErrors(result.errors || [])
    }
    return result.data!
  }

  // Validate and throw on error
  validate(data: unknown): T {
    return this.parse(data)
  }

  // Validate asynchronously
  async validateAsync(data: unknown): Promise<T> {
    return this.parse(data)
  }

  // Get the underlying Zod schema
  getSchema(): z.ZodSchema<T> {
    return this.schema
  }

  // Map Zod errors to ValidationErrors
  private mapZodErrors(error: z.ZodError): ValidationError[] {
    const errors: ValidationError[] = []
    
    for (const issue of error.issues) {
      const field = issue.path.join('.')
      const message = issue.message
      const code = issue.code
      
      let validationError: ValidationError
      
      switch (code) {
        case 'invalid_string':
          if (issue.validation === 'email') {
            validationError = new EmailValidationError(field, issue.received)
          } else if (issue.validation === 'uuid') {
            validationError = new UUIDValidationError(field, issue.received)
          } else if (issue.validation === 'url') {
            validationError = new URLValidationError(field, issue.received)
          } else if (issue.validation === 'datetime') {
            validationError = new DateValidationError(field, issue.received)
          } else if (issue.validation === 'regex') {
            validationError = new InvalidFormatError(field, 'regex', issue.received, message)
          } else {
            validationError = new InvalidInputError(field, message)
          }
          break
          
        case 'too_small':
          if (issue.type === 'string') {
            validationError = new StringLengthValidationError(field, issue.received, issue.minimum)
          } else if (issue.type === 'number') {
            validationError = new NumberRangeValidationError(field, issue.received, issue.minimum, issue.maximum)
          } else if (issue.type === 'array') {
            validationError = new ArrayValidationError(field, issue.received, issue.minimum, issue.maximum)
          } else {
            validationError = new InvalidInputError(field, message)
          }
          break
          
        case 'too_big':
          if (issue.type === 'string') {
            validationError = new StringLengthValidationError(field, issue.received, undefined, issue.maximum)
          } else if (issue.type === 'number') {
            validationError = new NumberRangeValidationError(field, issue.received, issue.minimum, issue.maximum)
          } else if (issue.type === 'array') {
            validationError = new ArrayValidationError(field, issue.received, undefined, issue.maximum)
          } else {
            validationError = new InvalidInputError(field, message)
          }
          break
          
        case 'invalid_type':
          validationError = new InvalidFormatError(field, issue.expected, issue.received, message)
          break
          
        case 'invalid_enum_value':
          validationError = new EnumValidationError(field, issue.received, issue.options)
          break
          
        default:
          validationError = new ValidationError(message, field, code, issue.received)
      }
      
      errors.push(validationError)
    }
    
    return errors
  }
}

// Form Validator Class
export class FormValidator<T extends Record<string, any> = Record<string, any>> {
  private validators: Map<keyof T, SchemaBuilder> = new Map()
  private formData: Partial<T> = {}
  private errors: ValidationError[] = []

  // Add a field validator
  addField<K extends keyof T>(
    field: K,
    schema: z.ZodSchema<T[K]>
  ): FormValidator<T> {
    this.validators.set(field, SchemaBuilder.create(schema, String(field)))
    return this
  }

  // Add multiple field validators
  addFields(fields: Partial<Record<keyof T, z.ZodSchema>>): FormValidator<T> {
    Object.entries(fields).forEach(([field, schema]) => {
      this.validators.set(field as keyof T, SchemaBuilder.create(schema, field))
    })
    return this
  }

  // Set form data
  setData(data: Partial<T>): FormValidator<T> {
    this.formData = { ...this.formData, ...data }
    return this
  }

  // Set field data
  setField<K extends keyof T>(field: K, value: T[K]): FormValidator<T> {
    this.formData[field] = value
    return this
  }

  // Get form data
  getData(): Partial<T> {
    return { ...this.formData }
  }

  // Get field data
  getField<K extends keyof T>(field: K): T[K] | undefined {
    return this.formData[field]
  }

  // Validate the entire form
  validate(): ValidationResult<T> {
    this.errors = []
    
    const validatedData: any = {}
    
    for (const [field, validator] of this.validators) {
      const value = this.formData[field]
      const result = validator.safeParse(value)
      
      if (result.success) {
        validatedData[field] = result.data
      } else {
        this.errors.push(...(result.errors || []))
      }
    }
    
    if (this.errors.length > 0) {
      return {
        success: false,
        errors: this.errors
      }
    }
    
    return {
      success: true,
      data: validatedData as T
    }
  }

  // Validate a specific field
  validateField<K extends keyof T>(field: K): ValidationResult<T[K]> {
    const validator = this.validators.get(field)
    if (!validator) {
      return {
        success: false,
        errors: [new ValidationError(`No validator found for field: ${String(field)}`, String(field), 'no_validator')]
      }
    }
    
    const value = this.formData[field]
    return validator.safeParse(value)
  }

  // Get all errors
  getErrors(): ValidationError[] {
    return [...this.errors]
  }

  // Get field errors
  getFieldErrors<K extends keyof T>(field: K): ValidationError[] {
    return this.errors.filter(error => error.getField() === String(field))
  }

  // Check if form has errors
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  // Check if field has errors
  hasFieldErrors<K extends keyof T>(field: K): boolean {
    return this.getFieldErrors(field).length > 0
  }

  // Clear all errors
  clearErrors(): FormValidator<T> {
    this.errors = []
    return this
  }

  // Clear field errors
  clearFieldErrors<K extends keyof T>(field: K): FormValidator<T> {
    this.errors = this.errors.filter(error => error.getField() !== String(field))
    return this
  }

  // Reset the form
  reset(): FormValidator<T> {
    this.formData = {}
    this.errors = []
    return this
  }

  // Create a copy of the validator
  clone(): FormValidator<T> {
    const newValidator = new FormValidator<T>()
    newValidator.validators = new Map(this.validators)
    newValidator.formData = { ...this.formData }
    newValidator.errors = [...this.errors]
    return newValidator
  }
}

// Batch Validator Class
export class BatchValidator {
  private validators: Array<{
    name: string
    data: any
    schema: z.ZodSchema
  }> = []
  private results: Array<{
    name: string
    result: ValidationResult
  }> = []

  // Add a validator to the batch
  add<T>(
    name: string,
    data: unknown,
    schema: z.ZodSchema<T>
  ): BatchValidator {
    this.validators.push({ name, data, schema })
    return this
  }

  // Validate all validators in the batch
  async validateAll(): Promise<Array<{
    name: string
    result: ValidationResult
  }>> {
    this.results = []
    
    for (const validator of this.validators) {
      const schemaBuilder = SchemaBuilder.create(validator.schema)
      const result = schemaBuilder.safeParse(validator.data)
      
      this.results.push({
        name: validator.name,
        result
      })
    }
    
    return this.results
  }

  // Validate all validators in parallel
  async validateAllParallel(): Promise<Array<{
    name: string
    result: ValidationResult
  }>> {
    const promises = this.validators.map(async (validator) => {
      const schemaBuilder = SchemaBuilder.create(validator.schema)
      const result = schemaBuilder.safeParse(validator.data)
      
      return {
        name: validator.name,
        result
      }
    })
    
    this.results = await Promise.all(promises)
    return this.results
  }

  // Get validation results
  getResults(): Array<{
    name: string
    result: ValidationResult
  }> {
    return [...this.results]
  }

  // Get successful results
  getSuccessfulResults(): Array<{
    name: string
    data: any
  }> {
    return this.results
      .filter(r => r.result.success)
      .map(r => ({
        name: r.name,
        data: r.result.data
      }))
  }

  // Get failed results
  getFailedResults(): Array<{
    name: string
    errors: ValidationError[]
  }> {
    return this.results
      .filter(r => !r.result.success)
      .map(r => ({
        name: r.name,
        errors: r.result.errors || []
      }))
  }

  // Check if all validations passed
  allSuccessful(): boolean {
    return this.results.every(r => r.result.success)
  }

  // Check if any validations passed
  anySuccessful(): boolean {
    return this.results.some(r => r.result.success)
  }

  // Check if all validations failed
  allFailed(): boolean {
    return this.results.every(r => !r.result.success)
  }

  // Get all errors from failed validations
  getAllErrors(): ValidationError[] {
    const errors: ValidationError[] = []
    
    for (const result of this.results) {
      if (!result.result.success && result.result.errors) {
        errors.push(...result.result.errors)
      }
    }
    
    return errors
  }

  // Clear results
  clearResults(): BatchValidator {
    this.results = []
    return this
  }

  // Clear validators
  clearValidators(): BatchValidator {
    this.validators = []
    this.results = []
    return this
  }

  // Reset everything
  reset(): BatchValidator {
    return this.clearValidators()
  }
}

// Conditional Validator Class
export class ConditionalValidator<T = any> {
  private condition: (data: any) => boolean
  private schemaBuilder: SchemaBuilder<T>
  private elseBuilder?: SchemaBuilder<T>

  constructor(
    condition: (data: any) => boolean,
    schema: z.ZodSchema<T>,
    elseSchema?: z.ZodSchema<T>
  ) {
    this.condition = condition
    this.schemaBuilder = SchemaBuilder.create(schema)
    if (elseSchema) {
      this.elseBuilder = SchemaBuilder.create(elseSchema)
    }
  }

  // Validate based on condition
  validate(data: any): ValidationResult<T> {
    if (this.condition(data)) {
      return this.schemaBuilder.safeParse(data)
    } else if (this.elseBuilder) {
      return this.elseBuilder.safeParse(data)
    } else {
      return { success: true, data }
    }
  }

  // Validate and throw on error
  parse(data: any): T {
    const result = this.validate(data)
    if (!result.success) {
      if (result.errors?.length === 1) {
        throw result.errors[0]
      }
      throw new MultipleValidationErrors(result.errors || [])
    }
    return result.data!
  }
}

// Validation utilities
export const ValidationUtils = {
  // Validate object against schema
  validateObject: <T>(data: unknown, schema: z.ZodSchema<T>): ValidationResult<T> => {
    const builder = SchemaBuilder.create(schema)
    return builder.safeParse(data)
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailSchema = z.string().email()
    const result = emailSchema.safeParse(email)
    return result.success
  },

  // Validate URL
  validateURL: (url: string): boolean => {
    const urlSchema = z.string().url()
    const result = urlSchema.safeParse(url)
    return result.success
  },

  // Validate UUID
  validateUUID: (uuid: string): boolean => {
    const uuidSchema = z.string().uuid()
    const result = uuidSchema.safeParse(uuid)
    return result.success
  },

  // Validate phone number
  validatePhone: (phone: string): boolean => {
    const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/)
    const result = phoneSchema.safeParse(phone)
    return result.success
  },

  // Validate password strength
  validatePassword: (password: string, options?: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  }): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    
    if (options?.minLength && password.length < options.minLength) {
      issues.push(`Password must be at least ${options.minLength} characters`)
    }
    
    if (options?.requireUppercase !== false && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter')
    }
    
    if (options?.requireLowercase !== false && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter')
    }
    
    if (options?.requireNumbers !== false && !/\d/.test(password)) {
      issues.push('Password must contain at least one number')
    }
    
    if (options?.requireSpecialChars !== false && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character')
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  },

  // Validate date range
  validateDateRange: (start: Date, end: Date): { valid: boolean; message?: string } => {
    if (start >= end) {
      return {
        valid: false,
        message: 'Start date must be before end date'
      }
    }
    return { valid: true }
  },

  // Validate file size
  validateFileSize: (sizeBytes: number, maxSizeBytes: number): { valid: boolean; message?: string } => {
    if (sizeBytes > maxSizeBytes) {
      return {
        valid: false,
        message: `File size must not exceed ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
      }
    }
    return { valid: true }
  },

  // Validate image dimensions
  validateImageDimensions: (
    width: number,
    height: number,
    options?: {
      maxWidth?: number
      maxHeight?: number
      minWidth?: number
      minHeight?: number
    }
  ): { valid: boolean; message?: string } => {
    if (options?.maxWidth && width > options.maxWidth) {
      return {
        valid: false,
        message: `Image width must not exceed ${options.maxWidth}px`
      }
    }
    
    if (options?.maxHeight && height > options.maxHeight) {
      return {
        valid: false,
        message: `Image height must not exceed ${options.maxHeight}px`
      }
    }
    
    if (options?.minWidth && width < options.minWidth) {
      return {
        valid: false,
        message: `Image width must be at least ${options.minWidth}px`
      }
    }
    
    if (options?.minHeight && height < options.minHeight) {
      return {
        valid: false,
        message: `Image height must be at least ${options.minHeight}px`
      }
    }
    
    return { valid: true }
  },
}

export {
  SchemaBuilder,
  FormValidator,
  BatchValidator,
  ConditionalValidator,
  ValidationUtils,
}

// Re-export for convenience
export { MultipleValidationErrors } from '../errors/validation'
