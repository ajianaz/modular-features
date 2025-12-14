import { createHash, randomBytes, scrypt, createCipheriv, createDecipheriv, timingSafeEqual } from 'crypto'

// Crypto utility functions
export class CryptoUtils {
  // Generate random bytes
  static randomBytes(length: number): Buffer {
    return randomBytes(length)
  }

  // Generate random string
  static randomString(length: number, encoding: 'hex' | 'base64' | 'binary' = 'hex'): string {
    return randomBytes(length).toString(encoding)
  }

  // Generate UUID v4
  static uuid(): string {
    const bytes = randomBytes(16)
    bytes[6] = (bytes[6]! & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80 // variant 10
    return [
      bytes.subarray(0, 4).toString('hex'),
      bytes.subarray(4, 6).toString('hex'),
      bytes.subarray(6, 8).toString('hex'),
      bytes.subarray(8, 10).toString('hex'),
      bytes.subarray(10, 16).toString('hex'),
    ].join('-')
  }

  // Generate nanoid
  static nanoid(size: number = 21): string {
    const alphabet = '_-0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ'
    let id = ''
    while (id.length < size) {
      id += alphabet[Math.random() * alphabet.length | 0]
    }
    return id
  }

  // Hash string with algorithm
  static hash(data: string, algorithm: string = 'sha256', encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash(algorithm).update(data).digest(encoding)
  }

  // Hash buffer with algorithm
  static hashBuffer(data: Buffer, algorithm: string = 'sha256', encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash(algorithm).update(data).digest(encoding)
  }

  // Hash file
  static async hashFile(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    const fs = await import('fs')
    const stream = fs.createReadStream(filePath)
    const hash = createHash(algorithm)

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  // HMAC
  static hmac(data: string, key: string, algorithm: string = 'sha256', encoding: 'hex' | 'base64' = 'hex'): string {
    const crypto = await import('crypto')
    return crypto.createHmac(algorithm, key).update(data).digest(encoding)
  }

  // Compare strings securely
  static compare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  }

  // Compare buffers securely
  static compareBuffers(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false
    }
    return timingSafeEqual(a, b)
  }

  // Derive key using scrypt
  static async deriveKey(
    password: string,
    salt: Buffer,
    keyLength: number = 32,
    options: {
      N?: number
      r?: number
      p?: number
      maxmem?: number
    } = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, keyLength, options, (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey)
      })
    })
  }

  // Generate salt
  static generateSalt(length: number = 16): Buffer {
    return randomBytes(length)
  }

  // Generate salt string
  static generateSaltString(length: number = 16): string {
    return this.generateSalt(length).toString('hex')
  }

  // Hash password with salt
  static async hashPassword(
    password: string,
    salt?: string,
    options: {
      algorithm?: string
      iterations?: number
      keyLength?: number
    } = {}
  ): Promise<{ hash: string; salt: string }> {
    const {
      algorithm = 'sha256',
      iterations = 10000,
      keyLength = 32
    } = options

    const passwordSalt = salt ? Buffer.from(salt, 'hex') : this.generateSalt()
    
    return new Promise((resolve, reject) => {
      scrypt(password, passwordSalt, keyLength, (err, derivedKey) => {
        if (err) reject(err)
        else {
          const hash = derivedKey.toString('hex')
          const saltHex = passwordSalt.toString('hex')
          resolve({ hash, salt: saltHex })
        }
      })
    })
  }

  // Verify password against hash
  static async verifyPassword(
    password: string,
    hash: string,
    salt: string,
    options: {
      algorithm?: string
      iterations?: number
      keyLength?: number
    } = {}
  ): Promise<boolean> {
    try {
      const { hash: computedHash } = await this.hashPassword(password, salt, options)
      return this.compare(hash, computedHash)
    } catch {
      return false
    }
  }

  // Encrypt data
  static encrypt(
    data: string,
    key: string,
    algorithm: string = 'aes-256-gcm',
    ivLength: number = 16
  ): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  // Decrypt data
  static decrypt(
    encrypted: string,
    key: string,
    iv: string,
    tag: string,
    algorithm: string = 'aes-256-gcm'
  ): string {
    const decipher = createDecipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // Generate JWT token (simplified)
  static generateJWT(
    payload: Record<string, any>,
    secret: string,
    algorithm: string = 'HS256',
    expiresIn?: string | number
  ): string {
    const header = {
      alg: algorithm,
      typ: 'JWT'
    }

    const tokenPayload = { ...payload }
    
    if (expiresIn) {
      const exp = typeof expiresIn === 'string'
        ? Math.floor(Date.now() / 1000) + this.parseExpiration(expiresIn)
        : Math.floor(Date.now() / 1000) + expiresIn
      tokenPayload.exp = exp
    }

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload))
    const signature = this.hmac(`${encodedHeader}.${encodedPayload}`, secret, algorithm)
    const encodedSignature = this.base64UrlEncode(signature)

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
  }

  // Verify JWT token (simplified)
  static verifyJWT(
    token: string,
    secret: string,
    algorithm: string = 'HS256'
  ): { valid: boolean; payload?: any; error?: string } {
    try {
      const [headerB64, payloadB64, signatureB64] = token.split('.')
      
      if (!headerB64 || !payloadB64 || !signatureB64) {
        return { valid: false, error: 'Invalid token format' }
      }

      const header = JSON.parse(this.base64UrlDecode(headerB64))
      const payload = JSON.parse(this.base64UrlDecode(payloadB64))
      const signature = this.base64UrlDecode(signatureB64)

      // Verify algorithm
      if (header.alg !== algorithm) {
        return { valid: false, error: 'Invalid algorithm' }
      }

      // Verify signature
      const expectedSignature = this.hmac(`${headerB64}.${payloadB64}`, secret, algorithm)
      if (!this.compare(signature, expectedSignature)) {
        return { valid: false, error: 'Invalid signature' }
      }

      // Verify expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' }
      }

      return { valid: true, payload }
    } catch (error) {
      return { valid: false, error: 'Invalid token' }
    }
  }

  // Base64 URL encode
  static base64UrlEncode(data: string): string {
    return Buffer.from(data)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Base64 URL decode
  static base64UrlDecode(data: string): string {
    data += '='.repeat((4 - data.length % 4) % 4)
    data = data.replace(/-/g, '+').replace(/_/g, '/')
    return Buffer.from(data, 'base64').toString()
  }

  // Parse expiration string
  private static parseExpiration(expiration: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      M: 2592000, // 30 days
      y: 31536000 // 365 days
    }

    const match = expiration.match(/^(\d+)([smhdwyM])$/)
    if (!match) {
      throw new Error('Invalid expiration format')
    }

    const value = parseInt(match[1], 10)
    const unit = match[2]
    
    return value * (units[unit] || 0)
  }

  // Generate API key
  static generateAPIKey(prefix: string = '', length: number = 32): string {
    const key = this.randomString(length)
    return prefix ? `${prefix}_${key}` : key
  }

  // Generate session token
  static generateSessionToken(length: number = 32): string {
    return this.randomString(length)
  }

  // Generate refresh token
  static generateRefreshToken(length: number = 64): string {
    return this.randomString(length)
  }

  // Generate verification code
  static generateVerificationCode(length: number = 6): string {
    return this.randomNumeric(length)
  }

  // Generate password reset token
  static generatePasswordResetToken(length: number = 32): string {
    return this.randomString(length)
  }

  // Generate TOTP secret
  static generateTOTPSecret(): string {
    const buffer = randomBytes(20)
    return buffer.toString('base64').replace(/[^A-Z0-9]/g, '').substring(0, 32)
  }

  // Generate 2FA backup codes
  static generateBackupCodes(count: number = 10, length: number = 8): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      codes.push(this.randomNumeric(length))
    }
    return codes
  }

  // Calculate file hash
  static calculateFileHash(
    content: Buffer,
    algorithm: string = 'sha256'
  ): string {
    return createHash(algorithm).update(content).digest('hex')
  }

  // Verify file integrity
  static verifyFileIntegrity(
    content: Buffer,
    expectedHash: string,
    algorithm: string = 'sha256'
  ): boolean {
    const actualHash = this.calculateFileHash(content, algorithm)
    return this.compare(actualHash, expectedHash)
  }

  // Generate fingerprint from data
  static generateFingerprint(
    data: Record<string, any>,
    algorithm: string = 'sha256'
  ): string {
    const sortedData = Object.keys(data)
      .sort()
      .reduce((result, key) => {
        result[key] = data[key]
        return result
      }, {} as Record<string, any>)

    const dataString = JSON.stringify(sortedData)
    return this.hash(dataString, algorithm)
  }

  // Generate deterministic key from seed
  static deterministicKey(seed: string, length: number = 32): string {
    const hash = this.hash(seed, 'sha256')
    return hash.substring(0, length)
  }

  // Obfuscate string
  static obfuscate(str: string): string {
    const obfuscated = Buffer.from(str, 'utf8')
      .map(byte => byte ^ 0x55) // XOR with 0x55
    return obfuscated.toString('base64')
  }

  // Deobfuscate string
  static deobfuscate(obfuscated: string): string {
    const bytes = Buffer.from(obfuscated, 'base64')
      .map(byte => byte ^ 0x55) // XOR with 0x55
    return bytes.toString('utf8')
  }

  // Generate secure random number
  static secureRandom(min: number, max: number): number {
    const range = max - min + 1
    const bytesNeeded = Math.ceil(Math.log2(range) / 8)
    const maxValue = Math.pow(256, bytesNeeded)
    const cutoff = maxValue - (maxValue % range)
    
    let randomBytes: Buffer
    let randomValue: number
    
    do {
      randomBytes = this.randomBytes(bytesNeeded)
      randomValue = 0
      
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = randomValue * 256 + randomBytes[i]!
      }
    } while (randomValue >= cutoff)
    
    return min + (randomValue % range)
  }

  // Shuffle array securely
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.secureRandom(0, i)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }

  // Generate unique identifier with prefix
  static generateUID(prefix: string = '', separator: string = '_'): string {
    const timestamp = Date.now().toString(36)
    const random = this.randomString(8)
    return prefix ? `${prefix}${separator}${timestamp}_${random}` : `${timestamp}_${random}`
  }

  // Generate short ID
  static generateShortId(length: number = 8): string {
    const alphabet = '0123456789abcdefghjkmnpqrstuvwxyz' // Remove ambiguous characters
    let id = ''
    
    for (let i = 0; i < length; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    
    return id
  }

  // Generate version 1 UUID
  static uuid1(): string {
    const bytes = randomBytes(16)
    const timestamp = Date.now()
    const time = BigInt(timestamp) * BigInt(10000) + BigInt(122192928000000000) // 100-nanosecond intervals since epoch
    const timeBytes = time.toString(16).padStart(24, '0')
    
    // Set version to 1
    bytes[6] = (bytes[6]! & 0x0f) | 0x10
    
    // Set variant to RFC 4122
    bytes[8] = (bytes[8]! & 0x3f) | 0x80
    
    return [
      timeBytes.substring(0, 8),
      timeBytes.substring(8, 12),
      timeBytes.substring(12, 16),
      bytes.subarray(8, 10).toString('hex'),
      bytes.subarray(10, 16).toString('hex'),
    ].join('-')
  }

  // Check if token is expired
  static isTokenExpired(token: string, secret: string): boolean {
    const { valid, payload } = this.verifyJWT(token, secret)
    if (!valid) return true
    return !!(payload?.exp && payload.exp < Math.floor(Date.now() / 1000))
  }

  // Extract JWT payload
  static extractJWTPayload(token: string): any {
    try {
      const [, payloadB64] = token.split('.')
      return JSON.parse(this.base64UrlDecode(payloadB64))
    } catch {
      return null
    }
  }

  // Generate encryption key pair
  static generateKeyPair(algorithm: string = 'rsa', options: any = {}): {
    publicKey: string
    privateKey: string
  } {
    const crypto = require('crypto')
    const { publicKey, privateKey } = crypto.generateKeyPairSync(algorithm, options)
    
    return {
      publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
      privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    }
  }

  // Sign data with private key
  static sign(data: string, privateKey: string, algorithm: string = 'RSA-SHA256'): string {
    const crypto = require('crypto')
    return crypto.sign(algorithm, Buffer.from(data), privateKey).toString('base64')
  }

  // Verify signature with public key
  static verify(data: string, signature: string, publicKey: string, algorithm: string = 'RSA-SHA256'): boolean {
    const crypto = require('crypto')
    return crypto.verify(algorithm, Buffer.from(data), publicKey, Buffer.from(signature, 'base64'))
  }
}

// Export random utility functions for convenience
export const RandomUtils = {
  bytes: (length: number) => CryptoUtils.randomBytes(length),
  string: (length: number, encoding?: 'hex' | 'base64' | 'binary') => CryptoUtils.randomString(length, encoding),
  uuid: () => CryptoUtils.uuid(),
  uuid1: () => CryptoUtils.uuid1(),
  nanoid: (size?: number) => CryptoUtils.nanoid(size),
  shortId: (length?: number) => CryptoUtils.generateShortId(length),
  uid: (prefix?: string, separator?: string) => CryptoUtils.generateUID(prefix, separator),
  apiKey: (prefix?: string, length?: number) => CryptoUtils.generateAPIKey(prefix, length),
  sessionToken: (length?: number) => CryptoUtils.generateSessionToken(length),
  refreshToken: (length?: number) => CryptoUtils.generateRefreshToken(length),
  verificationCode: (length?: number) => CryptoUtils.generateVerificationCode(length),
  backupCodes: (count?: number, length?: number) => CryptoUtils.generateBackupCodes(count, length),
  totpSecret: () => CryptoUtils.generateTOTPSecret(),
  number: (min: number, max: number) => CryptoUtils.secureRandom(min, max),
  shuffle: <T>(array: T[]) => CryptoUtils.shuffleArray(array),
}

export default CryptoUtils
