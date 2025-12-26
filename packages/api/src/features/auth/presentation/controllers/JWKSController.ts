import { Context } from 'hono';
import { rs256KeyManager } from '../../infrastructure/lib/BetterAuthConfig';
import * as crypto from 'crypto';

/**
 * Controller for JWKS (JSON Web Key Set) endpoint
 * Exposes public keys for RS256 token validation
 */
export class JWKSController {
  /**
   * Get JWKS endpoint
   * Returns the public key in JWK format for token validation
   */
  async getJWKS(c: Context): Promise<Response> {
    try {
      console.log('[JWKS] Serving JWKS endpoint');

      // Get the public key from our RS256 key manager
      const publicKeyPem = rs256KeyManager.getPublicKey();

      // Convert PEM to JWK format
      const publicKeyObject = crypto.createPublicKey(publicKeyPem);
      const jwk = publicKeyObject.export({
        format: 'jwk'
      });

      // Add additional JWK fields
      const jwksKey = {
        ...jwk,
        kid: rs256KeyManager.getKeyId(),
        alg: 'RS256',
        use: 'sig'
      };

      const jwksResponse = {
        keys: [jwksKey]
      };

      console.log('[JWKS] JWKS response generated successfully');
      console.log('[JWKS] Key ID:', jwksKey.kid);
      console.log('[JWKS] Algorithm:', jwksKey.alg);

      return c.json(jwksResponse, 200, {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json'
      });
    } catch (error) {
      console.error('[JWKS] Error generating JWKS:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: 'Failed to generate JWKS'
        },
        500
      );
    }
  }

  /**
   * Get public key in PEM format
   * Alternative endpoint for systems that prefer PEM format
   */
  async getPublicKey(c: Context): Promise<Response> {
    try {
      console.log('[JWKS] Serving public key in PEM format');

      const publicKeyPem = rs256KeyManager.getPublicKey();
      const keyId = rs256KeyManager.getKeyId();

      return c.json(
        {
          keyId,
          publicKey: publicKeyPem,
          algorithm: 'RS256',
          format: 'PEM'
        },
        200,
        {
          'Cache-Control': 'public, max-age=3600',
          'Content-Type': 'application/json'
        }
      );
    } catch (error) {
      console.error('[JWKS] Error serving public key:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve public key'
        },
        500
      );
    }
  }

  /**
   * Validate key configuration
   * Health check endpoint for key management
   */
  async validateKeys(c: Context): Promise<Response> {
    try {
      console.log('[JWKS] Validating key configuration');

      const keyId = rs256KeyManager.getKeyId();
      const publicKey = rs256KeyManager.getPublicKey();
      const privateKey = rs256KeyManager.getPrivateKey();

      // Test that keys are properly formatted
      const publicKeyObject = crypto.createPublicKey(publicKey);
      const privateKeyObject = crypto.createPrivateKey(privateKey);

      // Test that keys are a matching pair
      const testData = 'key-validation-test';
      const sign = crypto.sign('RSA-SHA256', Buffer.from(testData), privateKeyObject);
      const isValid = crypto.verify('RSA-SHA256', Buffer.from(testData), publicKeyObject, sign);

      const response = {
        valid: isValid,
        keyId,
        algorithm: 'RS256',
        hasPublicKey: !!publicKey,
        hasPrivateKey: !!privateKey,
        keysMatch: isValid
      };

      console.log('[JWKS] Key validation result:', response);

      return c.json(response, 200);
    } catch (error) {
      console.error('[JWKS] Error validating keys:', error);
      return c.json(
        {
          valid: false,
          error: 'Key validation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  }
}