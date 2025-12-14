import { z } from 'zod'

// String validators
export const StringValidators = {
  // Basic string validation
  nonEmpty: (message: string = 'String cannot be empty') => 
    z.string().min(1, message),
    
  minLength: (min: number, message?: string) => 
    z.string().min(min, message || `String must be at least ${min} characters`),
    
  maxLength: (max: number, message?: string) => 
    z.string().max(max, message || `String must not exceed ${max} characters`),
    
  lengthRange: (min: number, max: number, message?: string) => 
    z.string().min(min).max(max, message || `String must be between ${min} and ${max} characters`),
    
  // Pattern validators
  alpha: (message: string = 'String must contain only letters') => 
    z.string().regex(/^[a-zA-Z]+$/, message),
    
  alphaNumeric: (message: string = 'String must contain only letters and numbers') => 
    z.string().regex(/^[a-zA-Z0-9]+$/, message),
    
  numeric: (message: string = 'String must contain only numbers') => 
    z.string().regex(/^[0-9]+$/, message),
    
  slug: (message: string = 'String must be a valid slug') => 
    z.string().regex(/^[a-z0-9-]+$/, message),
    
  username: (message: string = 'String must be a valid username') => 
    z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/, message),
    
  // Common format validators
  email: (message: string = 'Must be a valid email address') => 
    z.string().email(message),
    
  url: (message: string = 'Must be a valid URL') => 
    z.string().url(message),
    
  uuid: (message: string = 'Must be a valid UUID') => 
    z.string().uuid(message),
    
  phone: (message: string = 'Must be a valid phone number') => 
    z.string().regex(/^\+?[\d\s-()]+$/, message),
    
  hexColor: (message: string = 'Must be a valid hex color') => 
    z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message),
    
  // Name validators
  firstName: (message: string = 'Must be a valid first name') => 
    z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, message),
    
  lastName: (message: string = 'Must be a valid last name') => 
    z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, message),
    
  fullName: (message: string = 'Must be a valid full name') => 
    z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/, message),
    
  // Password validator
  password: (options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {}, message?: string) => {
    let schema = z.string().min(options.minLength || 8, 
      message || `Password must be at least ${options.minLength || 8} characters`)
    
    if (options.requireUppercase !== false) {
      schema = schema.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    }
    
    if (options.requireLowercase !== false) {
      schema = schema.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    }
    
    if (options.requireNumbers !== false) {
      schema = schema.regex(/\d/, 'Password must contain at least one number')
    }
    
    if (options.requireSpecialChars !== false) {
      schema = schema.regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }
    
    return schema
  },
}

// Number validators
export const NumberValidators = {
  // Basic number validation
  integer: (message: string = 'Must be an integer') => 
    z.number().int(message),
    
  positive: (message: string = 'Must be a positive number') => 
    z.number().positive(message),
    
  negative: (message: string = 'Must be a negative number') => 
    z.number().negative(message),
    
  nonNegative: (message: string = 'Must be a non-negative number') => 
    z.number().min(0, message),
    
  nonPositive: (message: string = 'Must be a non-positive number') => 
    z.number().max(0, message),
    
  // Range validators
  min: (min: number, message?: string) => 
    z.number().min(min, message || `Must be at least ${min}`),
    
  max: (max: number, message?: string) => 
    z.number().max(max, message || `Must not exceed ${max}`),
    
  range: (min: number, max: number, message?: string) => 
    z.number().min(min).max(max, message || `Must be between ${min} and ${max}`),
    
  // Common ranges
  percentage: (message: string = 'Must be between 0 and 100') => 
    z.number().min(0).max(100, message),
    
  rating: (message: string = 'Rating must be between 1 and 5') => 
    z.number().min(1).max(5, message),
    
  price: (min: number = 0, message?: string) => 
    z.number().min(min, message || `Price must be at least ${min}`),
    
  // Precision validators
  decimal: (decimalPlaces: number, message?: string) => 
    z.number().refine(
      (num) => {
        const str = num.toString()
        const decimalIndex = str.indexOf('.')
        if (decimalIndex === -1) return true
        return str.length - decimalIndex - 1 <= decimalPlaces
      },
      message || `Must have at most ${decimalPlaces} decimal places`
    ),
}

// Date validators
export const DateValidators = {
  // Basic date validation
  past: (message: string = 'Must be a past date') => 
    z.date().refine((date) => date < new Date(), message),
    
  future: (message: string = 'Must be a future date') => 
    z.date().refine((date) => date > new Date(), message),
    
  today: (message: string = 'Must be today') => 
    z.date().refine((date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }, message),
    
  // Range validators
  minAge: (minAge: number, message?: string) => 
    z.date().refine(
      (date) => {
        const now = new Date()
        const ageInMs = now.getTime() - date.getTime()
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25)
        return ageInYears >= minAge
      },
      message || `Must be at least ${minAge} years old`
    ),
    
  maxAge: (maxAge: number, message?: string) => 
    z.date().refine(
      (date) => {
        const now = new Date()
        const ageInMs = now.getTime() - date.getTime()
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25)
        return ageInYears <= maxAge
      },
      message || `Must not be older than ${maxAge} years`
    ),
    
  dateRange: (start: Date, end: Date, message?: string) => 
    z.date().refine(
      (date) => date >= start && date <= end,
      message || `Must be between ${start.toISOString()} and ${end.toISOString()}`
    ),
}

// Array validators
export const ArrayValidators = {
  // Basic array validation
  nonEmpty: (message: string = 'Array cannot be empty') => 
    z.array(z.any()).min(1, message),
    
  minLength: (min: number, message?: string) => 
    z.array(z.any()).min(min, message || `Array must contain at least ${min} items`),
    
  maxLength: (max: number, message?: string) => 
    z.array(z.any()).max(max, message || `Array must not contain more than ${max} items`),
    
  lengthRange: (min: number, max: number, message?: string) => 
    z.array(z.any()).min(min).max(max, message || `Array must contain between ${min} and ${max} items`),
    
  // Unique validators
  uniqueItems: (message: string = 'Array must contain unique items') => 
    z.array(z.any()).refine(
      (arr) => new Set(arr.map(item => JSON.stringify(item))).size === arr.length,
      message
    ),
    
  uniqueProperty: (property: string, message?: string) => 
    z.array(z.object({ [property]: z.any() })).refine(
      (arr) => {
        const values = arr.map(item => item[property])
        return new Set(values).size === values.length
      },
      message || `Array must contain unique ${property} values`
    ),
}

// Object validators
export const ObjectValidators = {
  // Basic object validation
  nonEmpty: (message: string = 'Object cannot be empty') => 
    z.object({}).passthrough().refine(
      (obj) => Object.keys(obj).length > 0,
      message
    ),
    
  // Property validators
  hasProperty: (property: string, message?: string) => 
    z.object({}).passthrough().refine(
      (obj) => obj.hasOwnProperty(property),
      message || `Object must have property '${property}'`
    ),
    
  hasProperties: (properties: string[], message?: string) => 
    z.object({}).passthrough().refine(
      (obj) => properties.every(prop => obj.hasOwnProperty(prop)),
      message || `Object must have properties: ${properties.join(', ')}`
    ),
}

// Custom validators
export const CustomValidators = {
  // Conditional validator
  when: <T, U>(
    condition: (data: T) => boolean,
    schema: z.ZodSchema<U>,
    elseSchema?: z.ZodSchema<U>
  ) => {
    return z.union([
      schema.refine((val, ctx) => {
        const parent = ctx.path.slice(0, -1).reduce((obj: any, path: string | number) => obj?.[path], ctx.parent)
        return !condition(parent) || schema.safeParse(val).success
      }),
      elseSchema || z.any()
    ])
  },
  
  // Validator for common IDs
  id: (message: string = 'Must be a valid ID') => 
    z.union([
      z.string().uuid(),
      z.string().regex(/^[a-zA-Z0-9_-]+$/),
      z.number().int().positive()
    ]),
  
  // Semantic version validator
  semver: (message: string = 'Must be a valid semantic version') => 
    z.string().regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      message
    ),
  
  // ISO date string validator
  isoDateString: (message: string = 'Must be a valid ISO date string') => 
    z.string().datetime(message),
  
  // JSON string validator
  jsonString: (message: string = 'Must be a valid JSON string') => 
    z.string().refine(
      (str) => {
        try {
          JSON.parse(str)
          return true
        } catch {
          return false
        }
      },
      message
    ),
  
  // Base64 string validator
  base64: (message: string = 'Must be a valid base64 string') => 
    z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, message),
  
  // Credit card number validator (basic)
  creditCard: (message: string = 'Must be a valid credit card number') => 
    z.string().refine(
      (number) => {
        // Remove spaces and dashes
        const cleaned = number.replace(/[\s-]/g, '')
        
        // Check if all digits
        if (!/^\d+$/.test(cleaned)) return false
        
        // Luhn algorithm check
        let sum = 0
        let isEven = false
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
          const digit = parseInt(cleaned[i], 10)
          
          if (isEven) {
            const doubled = digit * 2
            sum += doubled > 9 ? doubled - 9 : doubled
          } else {
            sum += digit
          }
          
          isEven = !isEven
        }
        
        return sum % 10 === 0
      },
      message
    ),
  
  // IP address validator
  ipAddress: (message: string = 'Must be a valid IP address') => 
    z.string().refine(
      (ip) => {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
        
        return ipv4Regex.test(ip) || ipv6Regex.test(ip)
      },
      message
    ),
  
  // MAC address validator
  macAddress: (message: string = 'Must be a valid MAC address') => 
    z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, message),
}

// File validation utilities
export const FileValidators = {
  // File size validator (in bytes)
  maxSize: (maxSizeBytes: number, message?: string) => 
    z.object({
      size: z.number().max(maxSizeBytes, 
        message || `File size must not exceed ${Math.round(maxSizeBytes / 1024 / 1024)}MB`)
    }),
  
  // File type validator
  allowedTypes: (allowedTypes: string[], message?: string) => 
    z.object({
      type: z.string().refine(
        (type) => allowedTypes.some(allowedType => {
          if (allowedType.endsWith('/*')) {
            const category = allowedType.slice(0, -2)
            return type.startsWith(category + '/')
          }
          return type === allowedType
        }),
        message || `File type must be one of: ${allowedTypes.join(', ')}`
      )
    }),
  
  // Image dimensions validator
  imageDimensions: (
    maxWidth?: number,
    maxHeight?: number,
    minWidth?: number,
    minHeight?: number,
    message?: string
  ) => 
    z.object({
      width: z.number().min(minWidth || 0).max(maxWidth || Infinity),
      height: z.number().min(minHeight || 0).max(maxHeight || Infinity)
    }).refine(
      (img) => {
        if (maxWidth && img.width > maxWidth) return false
        if (maxHeight && img.height > maxHeight) return false
        if (minWidth && img.width < minWidth) return false
        if (minHeight && img.height < minHeight) return false
        return true
      },
      message || `Image dimensions must be ${minWidth || 0}x${minHeight || 0} to ${maxWidth || '∞'}x${maxHeight || '∞'}`
    ),
}

// Geographic validators
export const GeoValidators = {
  // Latitude validator
  latitude: (message: string = 'Must be a valid latitude') => 
    z.number().min(-90).max(90, message),
  
  // Longitude validator
  longitude: (message: string = 'Must be a valid longitude') => 
    z.number().min(-180).max(180, message),
  
  // Coordinates validator
  coordinates: (message: string = 'Must be valid coordinates') => 
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).refine(
      (coords) => true,
      message
    ),
  
  // Postal code validators
  postalCode: (country: string, message?: string) => {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
      'GB': /^([A-Z]\d{2}[A-Z]{2})|([A-Z]\d[A-Z])|([A-Z]{2}\d{2}[A-Z]{2})$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'IT': /^\d{5}$/,
      'NL': /^\d{4} ?[A-Z]{2}$/,
      'JP': /^\d{3}-\d{4}$/,
      'BR': /^\d{5}-\d{3}$/,
    }
    
    const pattern = patterns[country.toUpperCase()]
    return pattern 
      ? z.string().regex(pattern, message || `Must be a valid ${country} postal code`)
      : z.string().min(1, message || 'Must be a valid postal code')
  },
}

// Business validators
export const BusinessValidators = {
  // Company registration number validator
  registrationNumber: (country: string, message?: string) => {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{9}$/, // EIN
      'GB': /^(GB)?\d{9}$/,
      'DE': /^DE\d{9}$/,
      'FR': /^FR\d{11}$/,
      'CA': /^CA\d{9}$/,
    }
    
    const pattern = patterns[country.toUpperCase()]
    return pattern 
      ? z.string().regex(pattern, message || `Must be a valid ${country} registration number`)
      : z.string().min(1, message || 'Must be a valid registration number')
  },
  
  // Tax ID validator
  taxId: (country: string, message?: string) => {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{9}$/,
      'GB': /^(GB)?(\d{10}|\d{12})$/,
      'DE': /^DE\d{11}$/,
      'FR': /^FR\d{13}$/,
      'CA': /^CA\d{9}$/,
    }
    
    const pattern = patterns[country.toUpperCase()]
    return pattern 
      ? z.string().regex(pattern, message || `Must be a valid ${country} tax ID`)
      : z.string().min(1, message || 'Must be a valid tax ID')
  },
  
  // IBAN validator (simplified)
  iban: (message: string = 'Must be a valid IBAN') => 
    z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/, message),
  
  // SWIFT/BIC code validator
  swift: (message: string = 'Must be a valid SWIFT/BIC code') => 
    z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, message),
}

export {
  StringValidators,
  NumberValidators,
  DateValidators,
  ArrayValidators,
  ObjectValidators,
  CustomValidators,
  FileValidators,
  GeoValidators,
  BusinessValidators,
}
