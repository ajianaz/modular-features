#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Generate RSA Keys for RS256 JWT Tokens
 *
 * This script generates RSA key pair for JWT signing with RS256 algorithm.
 * Keys are saved in multiple formats:
 * - PEM format (for local development)
 * - Base64 format (for Infisical)
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Ensure keys directory exists
const keysDir = path.join(__dirname, '..', 'keys')
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true })
}

console.log('🔐 Generating RSA 2048-bit key pair for RS256 JWT tokens...\n')

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
})

// Save PEM files (for local development)
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey)
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey)

console.log('✅ PEM files created:')
console.log(`   - ${path.join(keysDir, 'private.pem')}`)
console.log(`   - ${path.join(keysDir, 'public.pem')}\n`)

// Convert to Base64 for Infisical
const privateKeyBase64 = Buffer.from(privateKey).toString('base64')
const publicKeyBase64 = Buffer.from(publicKey).toString('base64')

// Generate a key ID (timestamp-based)
const keyId = `rsa-${Date.now()}`

// Save Base64 versions for Infisical
fs.writeFileSync(path.join(keysDir, 'private_base64.txt'), privateKeyBase64)
fs.writeFileSync(path.join(keysDir, 'public_base64.txt'), publicKeyBase64)
fs.writeFileSync(path.join(keysDir, 'key_id.txt'), keyId)

console.log('✅ Base64 files created for Infisical:')
console.log(`   - ${path.join(keysDir, 'private_base64.txt')}`)
console.log(`   - ${path.join(keysDir, 'public_base64.txt')}`)
console.log(`   - ${path.join(keysDir, 'key_id.txt')}\n`)

// Display keys for easy copying
console.log('═'.repeat(70))
console.log('📋 COPY THESE TO INFISICAL:')
console.log('═'.repeat(70))
console.log('\n1. JWT_RS256_PRIVATE_KEY_BASE64:')
console.log('─'.repeat(70))
console.log(privateKeyBase64)
console.log('\n2. JWT_RS256_PUBLIC_KEY_BASE64:')
console.log('─'.repeat(70))
console.log(publicKeyBase64)
console.log('\n3. JWT_RS256_KEY_ID:')
console.log('─'.repeat(70))
console.log(keyId)
console.log(`\n${'═'.repeat(70)}`)

console.log('\n✅ RSA keys generated successfully!')
console.log('\n📝 Next steps:')
console.log('   1. Copy the 3 values above to your Infisical dashboard')
console.log('   2. Add them to Project → Environments → dev → Secrets')
console.log('   3. Run: infisical run -- bun run dev:api')
console.log('\n⚠️  IMPORTANT: Never commit the keys/ folder to git!')
console.log('   The keys/ folder is already in .gitignore\n')
