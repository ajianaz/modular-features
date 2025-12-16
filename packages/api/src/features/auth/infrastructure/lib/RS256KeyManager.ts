import * as crypto from 'crypto';

/**
 * RSA Key Manager for RS256 JWT tokens
 * Handles loading and validation of RSA private/public keys from environment variables
 */
export class RS256KeyManager {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor() {
    const privateKeyBase64 = process.env.JWT_RS256_PRIVATE_KEY_BASE64;
    const publicKeyBase64 = process.env.JWT_RS256_PUBLIC_KEY_BASE64;

    if (!privateKeyBase64 || !publicKeyBase64) {
      // For development, provide a helpful message but don't crash
      console.warn('[RS256KeyManager] RS256 keys not configured. Please run "node scripts/generate-rsa-keys.js" to generate keys and add them to .env file');
      // Generate temporary keys for development
      console.warn('[RS256KeyManager] Generating temporary RSA keys for development...');
      const tempKeys = RS256KeyManager.generateKeyPair();
      this.privateKey = tempKeys.privateKey;
      this.publicKey = tempKeys.publicKey;
      this.keyId = 'temp-dev-key';

      // Validate the keys
      this.validateKeys();
      return;
    }

    try {
      this.privateKey = this.decodeBase64Key(privateKeyBase64);
      this.publicKey = this.decodeBase64Key(publicKeyBase64);
      this.keyId = process.env.JWT_RS256_KEY_ID || 'default';

      // Validate the keys
      this.validateKeys();
    } catch (error) {
      throw new Error(`Failed to initialize RS256 keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the private key for signing tokens
   */
  getPrivateKey(): string {
    return this.privateKey;
  }

  /**
   * Get the public key for verifying tokens
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Get the key ID for key rotation support
   */
  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Decode base64 encoded key to string
   */
  private decodeBase64Key(encoded: string): string {
    try {
      return Buffer.from(encoded, 'base64').toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to decode base64 key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that the keys are properly formatted
   */
  private validateKeys(): void {
    try {
      // Validate private key format
      const privateKeyObject = crypto.createPrivateKey(this.privateKey);
      if (!privateKeyObject) {
        throw new Error('Invalid private key format');
      }

      // Validate public key format
      const publicKeyObject = crypto.createPublicKey(this.publicKey);
      if (!publicKeyObject) {
        throw new Error('Invalid public key format');
      }

      // Test that the keys are a matching pair
      const testData = 'test-key-validation';
      const sign = crypto.sign('RSA-SHA256', Buffer.from(testData), privateKeyObject);
      const isValid = crypto.verify('RSA-SHA256', Buffer.from(testData), publicKeyObject, sign);

      if (!isValid) {
        throw new Error('Private and public keys do not match');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to initialize RS256 keys')) {
        throw error;
      }
      throw new Error(`Key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a new RSA key pair (for development/testing purposes)
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }

  /**
   * Convert PEM keys to base64 for environment variables
   */
  static keysToBase64(privateKey: string, publicKey: string): { privateKeyBase64: string; publicKeyBase64: string } {
    return {
      privateKeyBase64: Buffer.from(privateKey, 'utf-8').toString('base64'),
      publicKeyBase64: Buffer.from(publicKey, 'utf-8').toString('base64')
    };
  }
}