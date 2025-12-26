#!/usr/bin/env node
/**
 * RSA Key Generation Script for BetterAuth RS256 JWT Tokens
 *
 * This script generates a 2048-bit RSA key pair for BetterAuth RS256 JWT signing.
 * The keys are output in both PEM and Base64 formats.
 *
 * Usage:
 *   bun run auth:generate-keys
 *   node scripts/generate-rsa-keys.js
 *
 * Output:
 *   - keys/private.pem      - Private key in PEM format
 *   - keys/public.pem       - Public key in PEM format
 *   - keys/private_base64.txt - Private key in Base64 format
 *   - keys/public_base64.txt  - Public key in Base64 format
 *   - keys/key_id.txt       - Key ID (UUID)
 *
 * Infisical Setup:
 *   Copy the Base64 values to Infisical:
 *   - JWT_RS256_PRIVATE_KEY_BASE64 = contents of private_base64.txt
 *   - JWT_RS256_PUBLIC_KEY_BASE64 = contents of public_base64.txt
 *   - JWT_RS256_KEY_ID = contents of key_id.txt
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     RSA Key Pair Generator for BetterAuth RS256 JWT           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Generate RSA Key Pair
console.log('⚙️  Generating 2048-bit RSA key pair...');

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

console.log('✅ Key pair generated successfully!\n');

// Generate Key ID (UUID)
const keyId = crypto.randomUUID();

// Create keys directory
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Write PEM files
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
console.log('📝 PEM files written:');
console.log(`   - keys/private.pem`);
console.log(`   - keys/public.pem\n`);

// Convert to Base64
const privateKeyBase64 = privateKey.toString('base64');
const publicKeyBase64 = publicKey.toString('base64');

// Write Base64 files
fs.writeFileSync(path.join(keysDir, 'private_base64.txt'), privateKeyBase64);
fs.writeFileSync(path.join(keysDir, 'public_base64.txt'), publicKeyBase64);
fs.writeFileSync(path.join(keysDir, 'key_id.txt'), keyId);

console.log('📝 Base64 files written:');
console.log(`   - keys/private_base64.txt`);
console.log(`   - keys/public_base64.txt`);
console.log(`   - keys/key_id.txt\n`);

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🔐 INFISICAL SETUP INSTRUCTIONS');
console.log('═══════════════════════════════════════════════════════════════════\n');

console.log('Copy the following values to your Infisical project:\n');

console.log('┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Environment Variable Name                                      │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log('│ JWT_RS256_PRIVATE_KEY_BASE64                                    │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log(`│ ${privateKeyBase64.substring(0, 60)}...  │`);
console.log('└─────────────────────────────────────────────────────────────────┘\n');

console.log('┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Environment Variable Name                                      │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log('│ JWT_RS256_PUBLIC_KEY_BASE64                                     │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log(`│ ${publicKeyBase64.substring(0, 60)}...  │`);
console.log('└─────────────────────────────────────────────────────────────────┘\n');

console.log('┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Environment Variable Name                                      │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log('│ JWT_RS256_KEY_ID                                                │');
console.log('├─────────────────────────────────────────────────────────────────┤');
console.log(`│ ${keyId}  │`);
console.log('└─────────────────────────────────────────────────────────────────┘\n');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('⚠️  IMPORTANT SECURITY NOTES');
console.log('═══════════════════════════════════════════════════════════════════\n');

console.log('1. NEVER commit the keys/ folder to git');
console.log('2. The keys/ folder is already in .gitignore');
console.log('3. Store ONLY the Base64 values in Infisical, NOT the PEM files');
console.log('4. Keep the private key SECRET - never share it');
console.log('5. The public key can be shared for JWT verification\n');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('✅ RSA Key generation complete!');
console.log('═══════════════════════════════════════════════════════════════════\n');
