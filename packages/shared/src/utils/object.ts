// Object utility functions

export class ObjectUtils {
  // Check if object is empty
  static isEmpty(obj: Record<string, any> | null | undefined): boolean {
    if (!obj) return true
    return Object.keys(obj).length === 0
  }

  // Check if object is not empty
  static isNotEmpty(obj: Record<string, any> | null | undefined): boolean {
    return !this.isEmpty(obj)
  }

  // Check if value is an object
  static isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  // Check if value is a plain object
  static isPlainObject(value: any): value is Record<string, any> {
    return this.isObject(value) && value.constructor === Object
  }

  // Clone object (shallow)
  static clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    return { ...obj }
  }

  // Clone object (deep)
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as unknown as T
    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }
    return obj
  }

  // Merge objects (shallow)
  static merge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
    return objects.reduce((merged, obj) => ({ ...merged, ...obj }), {} as T)
  }

  // Merge objects (deep)
  static deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
    return objects.reduce((merged, obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const objValue = obj[key]
          const mergedValue = merged[key]

          if (this.isObject(objValue) && this.isObject(mergedValue)) {
            merged[key] = this.deepMerge(mergedValue, objValue)
          } else {
            merged[key] = this.deepClone(objValue)
          }
        }
      }
      return merged
    }, {} as T)
  }

  // Pick properties from object
  static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  }

  // Omit properties from object
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as any
    keys.forEach(key => {
      delete result[key]
    })
    return result
  }

  // Get nested property value
  static get(obj: Record<string, any>, path: string, defaultValue?: any): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue
      }
      current = current[key]
    }

    return current
  }

  // Set nested property value
  static set(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key] as Record<string, any>
    }

    current[keys[keys.length - 1]] = value
  }

  // Check if nested property exists
  static has(obj: Record<string, any>, path: string): boolean {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false
      }
      current = current[key]
    }

    return true
  }

  // Delete nested property
  static delete(obj: Record<string, any>, path: string): boolean {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || !this.isObject(current[key])) {
        return false
      }
      current = current[key] as Record<string, any>
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey in current) {
      delete current[lastKey]
      return true
    }

    return false
  }

  // Get all keys from object (including nested)
  static getAllKeys(obj: Record<string, any>, prefix: string = ''): string[] {
    let keys: string[] = []

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        keys.push(fullKey)

        if (this.isObject(obj[key])) {
          keys = keys.concat(this.getAllKeys(obj[key], fullKey))
        }
      }
    }

    return keys
  }

  // Flatten object
  static flatten(obj: Record<string, any>, prefix: string = '', separator: string = '.'): Record<string, any> {
    const flattened: Record<string, any> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}${separator}${key}` : key
        const value = obj[key]

        if (this.isObject(value)) {
          Object.assign(flattened, this.flatten(value, fullKey, separator))
        } else {
          flattened[fullKey] = value
        }
      }
    }

    return flattened
  }

  // Unflatten object
  static unflatten(obj: Record<string, any>, separator: string = '.'): Record<string, any> {
    const unflattened: Record<string, any> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.set(unflattened, key.replace(new RegExp(`\\${separator}`, 'g'), '.'), obj[key])
      }
    }

    return unflattened
  }

  // Filter object properties
  static filter<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Partial<T> {
    const result: Partial<T> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (predicate(obj[key], key)) {
          result[key] = obj[key]
        }
      }
    }
    return result
  }

  // Map object properties
  static map<T extends Record<string, any>, U>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T) => U
  ): Record<keyof T, U> {
    const result = {} as Record<keyof T, U>
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = mapper(obj[key], key)
      }
    }
    return result
  }

  // Reduce object properties
  static reduce<T extends Record<string, any>, U>(
    obj: T,
    reducer: (acc: U, value: T[keyof T], key: keyof T) => U,
    initialValue: U
  ): U {
    let result = initialValue
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result = reducer(result, obj[key], key)
      }
    }
    return result
  }

  // Check if objects are equal (shallow)
  static equals(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
        return false
      }
    }

    return true
  }

  // Check if objects are equal (deep)
  static deepEquals(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true

    if (obj1 === null || obj2 === null) return obj1 === obj2

    if (typeof obj1 !== typeof obj2) return false

    if (typeof obj1 !== 'object') return obj1 === obj2

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key)) return false

      const value1 = obj1[key]
      const value2 = obj2[key]

      if (!this.deepEquals(value1, value2)) return false
    }

    return true
  }

  // Get object keys
  static keys<T extends Record<string, any>>(obj: T): Array<keyof T> {
    return Object.keys(obj)
  }

  // Get object values
  static values<T extends Record<string, any>>(obj: T): Array<T[keyof T]> {
    return Object.values(obj)
  }

  // Get object entries
  static entries<T extends Record<string, any>>(obj: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
  }

  // Create object from entries
  static fromEntries<T extends Record<string, any>>(
    entries: Array<[keyof T, T[keyof T]]>
  ): T {
    return Object.fromEntries(entries) as T
  }

  // Freeze object (deep)
  static deepFreeze<T>(obj: T): T {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = obj[prop as keyof T]
      if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        this.deepFreeze(value)
      }
    })
    return Object.freeze(obj)
  }

  // Get object size
  static size(obj: Record<string, any>): number {
    return Object.keys(obj).length
  }

  // Convert object to query string
  static toQueryString(obj: Record<string, any>, options: {
    encode?: boolean
    arrayFormat?: 'indices' | 'brackets' | 'repeat'
  } = {}): string {
    const { encode = true, arrayFormat = 'indices' } = options

    const processValue = (key: string, value: any, path: string = ''): string[] => {
      if (value === null || value === undefined) return []
      if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value).flatMap(([k, v]) => 
          processValue(k, v, path ? `${path}.${k}` : k)
        )
      }
      if (Array.isArray(value)) {
        return value.map((v, index) => {
          let arrayKey = key
          if (arrayFormat === 'indices') {
            arrayKey = `${key}[${index}]`
          } else if (arrayFormat === 'brackets') {
            arrayKey = `${key}[]`
          }
          return processValue(arrayKey, v, path)
        }).flat()
      }
      const fullKey = path || key
      const encodedKey = encode ? encodeURIComponent(fullKey) : fullKey
      const encodedValue = encode ? encodeURIComponent(String(value)) : String(value)
      return [`${encodedKey}=${encodedValue}`]
    }

    return Object.entries(obj)
      .flatMap(([key, value]) => processValue(key, value))
      .join('&')
  }

  // Convert query string to object
  static fromQueryString(queryString: string, options: {
    decode?: boolean
    arrayFormat?: 'indices' | 'brackets' | 'repeat'
  } = {}): Record<string, any> {
    const { decode = true, arrayFormat = 'indices' } = options

    if (!queryString) return {}

    return queryString.split('&').reduce((obj, pair) => {
      let [key, value] = pair.split('=')
      if (!key) return obj

      if (decode) {
        key = decodeURIComponent(key)
        value = value ? decodeURIComponent(value) : ''
      } else {
        value = value || ''
      }

      // Handle array notation
      const bracketIndex = key.indexOf('[')
      if (bracketIndex !== -1) {
        const arrayKey = key.substring(0, bracketIndex)
        const indexStr = key.substring(bracketIndex + 1, key.length - 1)
        
        if (!obj[arrayKey]) obj[arrayKey] = []
        
        const parsedValue = this.parseValue(value)
        if (arrayFormat === 'indices' && indexStr) {
          obj[arrayKey][parseInt(indexStr)] = parsedValue
        } else {
          obj[arrayKey].push(parsedValue)
        }
      } else {
        obj[key] = this.parseValue(value)
      }

      return obj
    }, {} as Record<string, any>)
  }

  // Parse value (helper for query string)
  private static parseValue(value: string): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(value)
    } catch {
      // If not JSON, try to parse as number or boolean
      if (value === 'true') return true
      if (value === 'false') return false
      if (!isNaN(Number(value)) && value !== '') return Number(value)
      return value
    }
  }

  // Remove null and undefined values
  static compact<T extends Record<string, any>>(obj: T): Partial<T> {
    return this.filter(obj, value => value !== null && value !== undefined)
  }

  // Remove undefined values
  static removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    return this.filter(obj, value => value !== undefined)
  }

  // Remove null values
  static removeNull<T extends Record<string, any>>(obj: T): Partial<T> {
    return this.filter(obj, value => value !== null)
  }

  // Remove empty values (null, undefined, empty string, empty array, empty object)
  static removeEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
    return this.filter(obj, value => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string' && value.trim() === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (this.isObject(value) && Object.keys(value).length === 0) return false
      return true
    })
  }

  // Rename object keys
  static renameKeys<T extends Record<string, any>>(
    obj: T,
    mapper: (key: keyof T) => string
  ): Record<string, any> {
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = mapper(key)
        result[newKey] = obj[key]
      }
    }
    return result
  }

  // Swap object keys and values (values must be unique)
  static invert<T extends Record<string, string | number>>(obj: T): Record<string, keyof T> {
    const result: Record<string, keyof T> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[String(obj[key])] = key
      }
    }
    return result
  }

  // Group object entries by predicate
  static groupBy<T extends Record<string, any>>(
    obj: T,
    predicate: (key: keyof T, value: T[keyof T]) => string
  ): Record<string, Partial<T>> {
    return this.entries(obj).reduce((groups, [key, value]) => {
      const groupKey = predicate(key, value)
      if (!groups[groupKey]) {
        groups[groupKey] = {}
      }
      groups[groupKey][key] = value
      return groups
    }, {} as Record<string, Partial<T>>)
  }

  // Check if object has any properties
  static hasAny<T extends Record<string, any>>(obj: T): boolean {
    return Object.keys(obj).length > 0
  }

  // Check if object has all properties
  static hasAll<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): boolean {
    return keys.every(key => key in obj)
  }

  // Check if object has any of the specified properties
  static hasAnyOf<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): boolean {
    return keys.some(key => key in obj)
  }

  // Get first value that matches predicate
  static find<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): { key: keyof T; value: T[keyof T] } | undefined {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (predicate(obj[key], key)) {
          return { key, value: obj[key] }
        }
      }
    }
    return undefined
  }

  // Get all values that match predicate
  static findAll<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Array<{ key: keyof T; value: T[keyof T] }> {
    const results: Array<{ key: keyof T; value: T[keyof T] }> = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (predicate(obj[key], key)) {
          results.push({ key, value: obj[key] })
        }
      }
    }
    return results
  }

  // Check if any value matches predicate
  static some<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (predicate(obj[key], key)) {
          return true
        }
      }
    }
    return false
  }

  // Check if all values match predicate
  static every<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!predicate(obj[key], key)) {
          return false
        }
      }
    }
    return true
  }

  // Transform object values
  static transformValues<T extends Record<string, any>, U>(
    obj: T,
    transformer: (value: T[keyof T], key: keyof T) => U
  ): Record<keyof T, U> {
    return this.map(obj, transformer)
  }

  // Transform object keys
  static transformKeys<T extends Record<string, any>>(
    obj: T,
    transformer: (key: keyof T) => string
  ): Record<string, any> {
    return this.renameKeys(obj, transformer)
  }

  // Create object with default values
  static withDefaults<T extends Record<string, any>>(
    obj: Partial<T>,
    defaults: T
  ): T {
    return this.merge(defaults, obj)
  }

  // Override properties (only defined ones)
  static override<T extends Record<string, any>>(
    original: T,
    override: Partial<T>
  ): T {
    return this.merge(original, this.filter(override, value => value !== undefined))
  }

  // Get nested object path
  static getPath(obj: Record<string, any>, path: string[]): any {
    let current = obj
    for (const key of path) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined
      }
      current = current[key]
    }
    return current
  }

  // Set nested object path
  static setPath(obj: Record<string, any>, path: string[], value: any): void {
    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key] as Record<string, any>
    }
    current[path[path.length - 1]] = value
  }

  // Delete nested object path
  static deletePath(obj: Record<string, any>, path: string[]): boolean {
    if (path.length === 0) return false

    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (!(key in current) || !this.isObject(current[key])) {
        return false
      }
      current = current[key] as Record<string, any>
    }

    const lastKey = path[path.length - 1]
    if (lastKey in current) {
      delete current[lastKey]
      return true
    }

    return false
  }

  // Check if nested path exists
  static hasPath(obj: Record<string, any>, path: string[]): boolean {
    let current = obj
    for (const key of path) {
      if (current === null || current === undefined || !(key in current)) {
        return false
      }
      current = current[key]
    }
    return true
  }

  // Convert object to FormData
  static toFormData(obj: Record<string, any>): FormData {
    const formData = new FormData()

    const append = (key: string, value: any, path: string = ''): void => {
      if (value === null || value === undefined) return
      if (value instanceof Date) {
        formData.append(path || key, value.toISOString())
      } else if (value instanceof File || value instanceof Blob) {
        formData.append(path || key, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          append(key, item, `${path || key}[${index}]`)
        })
      } else if (this.isObject(value)) {
        Object.entries(value).forEach(([k, v]) => {
          append(key, v, path ? `${path}[${k}]` : k)
        })
      } else {
        formData.append(path || key, String(value))
      }
    }

    Object.entries(obj).forEach(([key, value]) => {
      append(key, value)
    })

    return formData
  }

  // Convert FormData to object
  static fromFormData(formData: FormData): Record<string, any> {
    const obj: Record<string, any> = {}

    formData.forEach((value, key) => {
      if (key in obj) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]]
        }
        obj[key].push(value)
      } else {
        obj[key] = value
      }
    })

    return obj
  }

  // Sanitize object (remove functions, circular references, etc.)
  static sanitize(obj: Record<string, any>): Record<string, any> {
    const seen = new WeakSet()
    
    const sanitize = (value: any): any => {
      if (value === null || value === undefined) return value
      if (typeof value === 'function') return undefined
      if (typeof value === 'symbol') return undefined
      if (typeof value === 'bigint') return value.toString()
      
      if (typeof value === 'object') {
        if (seen.has(value)) return '[Circular]'
        seen.add(value)
        
        if (Array.isArray(value)) {
          return value.map(sanitize).filter(item => item !== undefined)
        }
        
        const sanitized: Record<string, any> = {}
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            const sanitizedValue = sanitize(value[key])
            if (sanitizedValue !== undefined) {
              sanitized[key] = sanitizedValue
            }
          }
        }
        return sanitized
      }
      
      return value
    }
    
    return sanitize(obj) as Record<string, any>
  }

  // Validate object against schema
  static validate(obj: Record<string, any>, schema: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array'
      required?: boolean
      validator?: (value: any) => boolean
    }
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key]

      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Property '${key}' is required`)
        continue
      }

      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== rules.type && !(rules.type === 'object' && actualType === 'object')) {
          errors.push(`Property '${key}' must be of type '${rules.type}'`)
        }

        if (rules.validator && !rules.validator(value)) {
          errors.push(`Property '${key}' failed custom validation`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default ObjectUtils
