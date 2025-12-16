#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create keys directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

console.log('Generating RSA 2048-bit key pair...');

// Generate RSA key pair
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

// Save PEM files
const privateKeyPath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);

console.log(`Private key saved to: ${privateKeyPath}`);
console.log(`Public key saved to: ${publicKeyPath}`);

// Convert to base64 for environment variables
const privateKeyBase64 = Buffer.from(privateKey, 'utf-8').toString('base64');
const publicKeyBase64 = Buffer.from(publicKey, 'utf-8').toString('base64');

// Save base64 files
const privateKeyBase64Path = path.join(keysDir, 'private_base64.txt');
const publicKeyBase64Path = path.join(keysDir, 'public_base64.txt');

fs.writeFileSync(privateKeyBase64Path, privateKeyBase64);
fs.writeFileSync(publicKeyBase64Path, publicKeyBase64);

console.log(`\nBase64 encoded keys:`);
console.log(`Private key (base64) saved to: ${privateKeyBase64Path}`);
console.log(`Public key (base64) saved to: ${publicKeyBase64Path}`);

// Display keys for copy-paste
console.log('\n' + '='.repeat(80));
console.log('COPY THESE TO YOUR .env FILE:');
console.log('='.repeat(80));
console.log(`JWT_RS256_PRIVATE_KEY_BASE64=${privateKeyBase64}`);
console.log(`JWT_RS256_PUBLIC_KEY_BASE64=${publicKeyBase64}`);
console.log(`JWT_RS256_KEY_ID=key-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
console.log('='.repeat(80));

// Generate key ID
const keyId = `key-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
console.log(`\nGenerated Key ID: ${keyId}`);

console.log('\n✅ RSA keys generated successfully!');
console.log('\nNext steps:');
console.log('1. Add the base64 keys to your .env file');
console.log('2. Set ENABLE_RS256_TOKENS=true to enable RS256');
console.log('3. Restart your application');