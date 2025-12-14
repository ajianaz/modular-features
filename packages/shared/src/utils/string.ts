// String utility functions

export class StringUtils {
  // Check if string is empty or whitespace
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  // Check if string is not empty
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str)
  }

  // Check if string contains only whitespace
  static isWhitespace(str: string): boolean {
    return str.trim().length === 0
  }

  // Truncate string to specified length
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str
    }
    return str.substring(0, maxLength - suffix.length) + suffix
  }

  // Truncate string by word boundaries
  static truncateByWords(str: string, maxWords: number, suffix: string = '...'): string {
    const words = str.split(' ')
    if (words.length <= maxWords) {
      return str
    }
    return words.slice(0, maxWords).join(' ') + suffix
  }

  // Capitalize first letter
  static capitalize(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  // Capitalize each word
  static capitalizeWords(str: string, separator: string = ' '): string {
    return str.split(separator).map(word => this.capitalize(word)).join(separator)
  }

  // Convert to camelCase
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  // Convert to PascalCase
  static toPascalCase(str: string): string {
    return this.capitalizeWords(str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toLowerCase()))
  }

  // Convert to snake_case
  static toSnakeCase(str: string): string {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_')
  }

  // Convert to kebab-case
  static toKebabCase(str: string): string {
    return str
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-')
  }

  // Convert to constant case (UPPER_SNAKE_CASE)
  static toConstantCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase()
  }

  // Generate slug from string
  static slugify(str: string, options: {
    lower?: boolean
    strict?: boolean
    separator?: string
  } = {}): string {
    const {
      lower = true,
      strict = true,
      separator = '-'
    } = options

    let result = str
      .toString()
      .normalize('NFD') // Normalize to NFD Unicode form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-alphanumeric
      .trim()
      .replace(/[\s-]+/g, separator) // Replace spaces and hyphens with separator

    if (strict) {
      result = result.replace(/[^a-zA-Z0-9-_]/g, '') // Remove special characters
    }

    if (lower) {
      result = result.toLowerCase()
    }

    return result
  }

  // Generate random string
  static random(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate random alphanumeric string
  static randomAlphanumeric(length: number): string {
    return this.random(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
  }

  // Generate random alphabetic string
  static randomAlpha(length: number): string {
    return this.random(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
  }

  // Generate random numeric string
  static randomNumeric(length: number): string {
    return this.random(length, '0123456789')
  }

  // Generate random hex string
  static randomHex(length: number): string {
    return this.random(length, '0123456789abcdef')
  }

  // Generate UUID v4
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Escape HTML
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }
    return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match])
  }

  // Unescape HTML
  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': '/'
    }
    return str.replace(/&(?:amp|lt|gt|quot|#39|#x2F);/g, (match) => htmlUnescapes[match])
  }

  // Extract hashtags from string
  static extractHashtags(str: string): string[] {
    const hashtags = str.match(/#\w+/g)
    return hashtags ? hashtags.map(tag => tag.substring(1)) : []
  }

  // Extract mentions from string
  static extractMentions(str: string): string[] {
    const mentions = str.match(/@\w+/g)
    return mentions ? mentions.map(mention => mention.substring(1)) : []
  }

  // Extract URLs from string
  static extractUrls(str: string): string[] {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
    return str.match(urlRegex) || []
  }

  // Extract emails from string
  static extractEmails(str: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return str.match(emailRegex) || []
  }

  // Remove HTML tags
  static stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '')
  }

  // Remove emojis
  static removeEmojis(str: string): string {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
    return str.replace(emojiRegex, '')
  }

  // Check if string contains emojis
  static hasEmojis(str: string): boolean {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
    return emojiRegex.test(str)
  }

  // Calculate string similarity (Levenshtein distance)
  static similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) {
      return 1.0
    }
    if (shorter.length === 0) {
      return 0.0
    }

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Calculate Levenshtein distance
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Find best match from array of strings
  static findBestMatch(str: string, options: string[]): { target: string; rating: number } | null {
    if (!options.length) return null

    let bestMatch = { target: options[0], rating: 0 }

    for (const option of options) {
      const rating = this.similarity(str, option)
      if (rating > bestMatch.rating) {
        bestMatch = { target: option, rating }
      }
    }

    return bestMatch.rating > 0 ? bestMatch : null
  }

  // Mask string (for sensitive data)
  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (!str) return str
    if (str.length <= visibleChars) return str

    const visible = str.slice(0, visibleChars)
    const masked = maskChar.repeat(str.length - visibleChars)
    return visible + masked
  }

  // Mask email
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (!username || !domain) return email

    const visibleChars = Math.min(2, username.length)
    const maskedUsername = this.mask(username, visibleChars)
    return maskedUsername + '@' + domain
  }

  // Mask phone number
  static maskPhone(phone: string, visibleDigits: number = 4): string {
    if (!phone) return phone

    const digits = phone.replace(/\D/g, '')
    const visibleChars = Math.min(visibleDigits, digits.length)
    const masked = this.mask(digits, visibleChars)

    // Restore original formatting
    let result = ''
    let maskedIndex = 0
    for (const char of phone) {
      if (/\D/.test(char)) {
        result += char
      } else if (maskedIndex < masked.length) {
        result += masked[maskedIndex++]
      } else {
        result += char
      }
    }

    return result
  }

  // Pad string
  static pad(str: string, length: number, padString: string = ' ', padLeft: boolean = true): string {
    let padded = str
    while (padded.length < length) {
      padded = padLeft ? padString + padded : padded + padString
    }
    return padded
  }

  // Pad left
  static padLeft(str: string, length: number, padString: string = ' '): string {
    return this.pad(str, length, padString, true)
  }

  // Pad right
  static padRight(str: string, length: number, padString: string = ' '): string {
    return this.pad(str, length, padString, false)
  }

  // Reverse string
  static reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  // Count occurrences of substring
  static count(str: string, substring: string): number {
    return str.split(substring).length - 1
  }

  // Check if string contains substring (case insensitive)
  static contains(str: string, substring: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().includes(substring.toLowerCase())
    }
    return str.includes(substring)
  }

  // Check if string starts with substring
  static startsWith(str: string, substring: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().startsWith(substring.toLowerCase())
    }
    return str.startsWith(substring)
  }

  // Check if string ends with substring
  static endsWith(str: string, substring: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return str.toLowerCase().endsWith(substring.toLowerCase())
    }
    return str.endsWith(substring)
  }

  // Replace all occurrences
  static replaceAll(str: string, search: string, replace: string): string {
    return str.split(search).join(replace)
  }

  // Replace template variables
  static template(str: string, variables: Record<string, any>): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match
    })
  }

  // Remove extra whitespace
  static collapseWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim()
  }

  // Remove specific characters
  static removeChars(str: string, chars: string): string {
    const charRegex = new RegExp(`[${chars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`, 'g')
    return str.replace(charRegex, '')
  }

  // Keep only specific characters
  static keepChars(str: string, chars: string): string {
    const charRegex = new RegExp(`[^${chars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`, 'g')
    return str.replace(charRegex, '')
  }

  // Convert string to title case
  static toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Check if string is valid JSON
  static isJSON(str: string): boolean {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  // Parse JSON safely
  static parseJSON<T = any>(str: string, defaultValue: T): T {
    try {
      return JSON.parse(str)
    } catch {
      return defaultValue
    }
  }

  // Check if string is valid URL
  static isURL(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  // Check if string is valid email
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str)
  }

  // Check if string is valid phone number
  static isPhone(str: string, strict: boolean = false): boolean {
    const phoneRegex = strict 
      ? /^\+?[\d\s-()]{10,}$/
      : /^[\d\s-()]+$/ 
    return phoneRegex.test(str)
  }

  // Check if string is numeric
  static isNumeric(str: string): boolean {
    return !isNaN(Number(str)) && !isNaN(parseFloat(str))
  }

  // Check if string is integer
  static isInteger(str: string): boolean {
    const intRegex = /^-?\d+$/
    return intRegex.test(str)
  }

  // Check if string is float
  static isFloat(str: string): boolean {
    const floatRegex = /^-?\d+\.\d+$/
    return floatRegex.test(str)
  }

  // Check if string is hexadecimal
  static isHex(str: string): boolean {
    const hexRegex = /^[0-9a-fA-F]+$/
    return hexRegex.test(str)
  }

  // Check if string is base64
  static isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }

  // Convert to base64
  static toBase64(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64')
  }

  // Convert from base64
  static fromBase64(str: string): string {
    return Buffer.from(str, 'base64').toString('utf8')
  }

  // Encode URI component
  static encode(str: string): string {
    return encodeURIComponent(str)
  }

  // Decode URI component
  static decode(str: string): string {
    return decodeURIComponent(str)
  }

  // Get file extension from string
  static getFileExtension(str: string): string {
    const lastDot = str.lastIndexOf('.')
    return lastDot !== -1 ? str.substring(lastDot + 1) : ''
  }

  // Get file name without extension
  static getFileName(str: string): string {
    const lastDot = str.lastIndexOf('.')
    return lastDot !== -1 ? str.substring(0, lastDot) : str
  }

  // Get MIME type from file extension
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      // Videos
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
    }
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  // Generate password with options
  static generatePassword(options: {
    length?: number
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSymbols?: boolean
    excludeSimilar?: boolean
    excludeAmbiguous?: boolean
  } = {}): string {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false
    } = options

    let charset = ''
    
    if (includeLowercase) {
      charset += excludeSimilar ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
    }
    
    if (includeUppercase) {
      charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    
    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789'
    }
    
    if (includeSymbols) {
      charset += excludeAmbiguous ? '!#$%&()*+,-./:;<=>?@[]^_`{|}~' : '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    if (!charset) {
      throw new Error('At least one character type must be included')
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    score: number
    strength: 'weak' | 'fair' | 'good' | 'strong'
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    // Length check
    if (password.length >= 8) {
      score += 1
    } else {
      suggestions.push('Use at least 8 characters')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      suggestions.push('Include uppercase letters')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      suggestions.push('Include lowercase letters')
    }

    // Numbers check
    if (/\d/.test(password)) {
      score += 1
    } else {
      suggestions.push('Include numbers')
    }

    // Special characters check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      suggestions.push('Include special characters')
    }

    // Extra length bonus
    if (password.length >= 12) {
      score += 1
    }

    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 5) strength = 'strong'
    else if (score >= 4) strength = 'good'
    else if (score >= 2) strength = 'fair'

    return { score, strength, suggestions }
  }
}

export default StringUtils
