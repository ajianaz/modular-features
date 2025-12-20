# 🧪 Hybrid Better Auth + Keycloak - Testing & Deployment Guide

Complete guide for testing and deploying hybrid authentication setup.

---

## 📋 Configuration Files

### 1. Better Auth Configuration
**File:** `packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig.ts`

**Features:**
- ✅ Better Auth as OIDC Provider Gateway
- ✅ Keycloak as Identity Provider (IdP)
- ✅ Web support (cookie-based)
- ✅ API/Mobile support (bearer/JWT tokens)
- ✅ JWKS endpoint for JWT verification
- ✅ Session management

---

### 2. Environment Variables

```bash
# =============================================================================
# HYBRID BETTER AUTH + KEYCLOAK ENVIRONMENT
# =============================================================================

# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your-secret-key-here

# Keycloak Configuration (IdP/Source of Truth)
KEYCLOAK_URL=https://auth.azfirazka.com
KEYCLOAK_REALM=azfirazka
KEYCLOAK_ISSUER=https://auth.azfirazka.com/realms/azfirazka
KEYCLOAK_CLIENT_ID=modular-monolith-better-auth
KEYCLOAK_CLIENT_SECRET=your-keycloak-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3000/api/auth/oauth/callback/keycloak

# Feature Flags
ENABLE_KEYCLOAK=true
ENABLE_RS256_TOKENS=true
ENABLE_EMAIL_PASSWORD_AUTH=false

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true

# Node Environment
NODE_ENV=development
```

---

## 🧪 Testing Guide

### Test 1: Configuration Validation

**File:** `test-auth-config.ts`

```typescript
import { auth, validateKeys } from '../packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig';

console.log('[TEST] Validating Better Auth configuration...');

// Test 1: Check auth instance
console.log('[TEST-1] Auth instance:', auth ? '✅ Loaded' : '❌ Failed');

// Test 2: Validate RS256 keys
const keyValidation = validateKeys();
console.log('[TEST-2] RS256 Keys:', keyValidation.valid ? '✅ Valid' : '❌ Invalid');
console.log('[TEST-2] Key ID:', keyValidation.keyId);
console.log('[TEST-2] Algorithm:', keyValidation.algorithm);

// Test 3: Check environment variables
const envVars = [
  'KEYCLOAK_URL',
  'KEYCLOAK_CLIENT_ID',
  'KEYCLOAK_ISSUER',
  'BETTER_AUTH_URL',
];

console.log('[TEST-3] Environment Variables:');
envVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
});

console.log('[TEST] ✅ Configuration validation complete');
```

**Run:**
```bash
bun test test-auth-config.ts
```

---

### Test 2: Web Authentication (Cookie-Based)

**Prerequisites:**
- ✅ Docker running: `docker-compose up -d`
- ✅ Keycloak accessible
- ✅ Browser available

**Steps:**

#### 2.1 Initiate Login
```bash
# Open browser
open http://localhost:3000/api/auth/signin

# Expected: Redirect to Keycloak login page
```

#### 2.2 Login at Keycloak
```
Enter Keycloak credentials
Click "Sign In"

# Expected: Redirect back to callback
```

#### 2.3 Callback Processing
```bash
# URL: http://localhost:3000/api/auth/oauth/callback/keycloak
# Expected: Better Auth creates session and sets cookie
```

#### 2.4 Verify Session
```bash
# Get session
curl http://localhost:3000/api/auth/session \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# Expected: Session data returned
{
  "user": {
    "id": "keycloak-sub-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "session": {
    "id": "session-id",
    "expiresAt": 1234567890
  }
}
```

#### 2.5 Test Protected Route
```bash
# Access protected route with cookie
curl http://localhost:3000/api/users/me \
  --cookie cookies.txt \
  --cookie cookies.txt

# Expected: User data returned
```

---

### Test 3: API/Mobile Authentication (Token-Based)

#### 3.1 Get JWKS (Public Keys)
```bash
curl http://localhost:3000/.well-known/jwks.json

# Expected: JWKS response
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-id",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

#### 3.2 Authenticate and Get JWT
```bash
# Option A: Use web flow to get JWT
# 1. Login via web flow (Test 2)
# 2. Extract JWT from response or use Better Auth API

# Option B: Use OAuth2 flow manually
# GET /api/auth/oauth/keycloak
# Follow redirects, login, get JWT
```

#### 3.3 Use JWT for API Requests
```bash
# Get current user with JWT
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"

# Expected: User data returned
{
  "user": {
    "id": "keycloak-sub-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

#### 3.4 Test JWT Expiration
```bash
# Wait for token to expire (3 hours)
# Or use short-lived token for testing

# Try expired token
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <expired-token>"

# Expected: 401 Unauthorized
```

---

### Test 4: End-to-End Integration

**File:** `test-auth-e2e.ts`

```typescript
import { auth } from '../packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig';

async function testE2E() {
  console.log('[E2E-TEST] Starting end-to-end authentication test...');

  try {
    // Test 1: Better Auth instance
    console.log('[E2E-1] Testing Better Auth instance...');
    if (!auth) {
      throw new Error('Better Auth instance not loaded');
    }
    console.log('[E2E-1] ✅ Better Auth instance loaded');

    // Test 2: Keycloak OAuth configuration
    console.log('[E2E-2] Testing Keycloak OAuth...');
    const keycloakEnabled = process.env.ENABLE_KEYCLOAK === 'true';
    if (!keycloakEnabled) {
      throw new Error('Keycloak not enabled');
    }
    console.log('[E2E-2] ✅ Keycloak OAuth configured');

    // Test 3: JWKS endpoint
    console.log('[E2E-3] Testing JWKS endpoint...');
    const jwksResponse = await fetch('http://localhost:3000/.well-known/jwks.json');
    if (!jwksResponse.ok) {
      throw new Error('JWKS endpoint failed');
    }
    const jwks = await jwksResponse.json();
    if (!jwks.keys || jwks.keys.length === 0) {
      throw new Error('No keys in JWKS');
    }
    console.log('[E2E-3] ✅ JWKS endpoint working');
    console.log('[E2E-3] Keys:', jwks.keys.length);

    // Test 4: Health endpoint
    console.log('[E2E-4] Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/auth/health');
    if (!healthResponse.ok) {
      throw new Error('Health endpoint failed');
    }
    const health = await healthResponse.json();
    console.log('[E2E-4] ✅ Health endpoint working');
    console.log('[E2E-4] Status:', health.status);
    console.log('[E2E-4] Mode:', health.mode);

    console.log('[E2E-TEST] ✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('[E2E-TEST] ❌ Test failed:', error);
    return false;
  }
}

testE2E();
```

**Run:**
```bash
bun test test-auth-e2e.ts
```

---

## 📊 Test Checklist

### Web Authentication (Cookie)

- [ ] Login redirects to Keycloak
- [ ] Keycloak login works
- [ ] Callback creates session
- [ ] Cookie is set correctly
- [ ] Session endpoint returns user data
- [ ] Protected routes work with cookie
- [ ] Logout clears cookie

### API Authentication (Token)

- [ ] JWKS endpoint returns keys
- [ ] JWT can be obtained
- [ ] JWT has correct claims
- [ ] JWT can be verified
- [ ] Protected routes work with JWT
- [ ] Token refresh works
- [ ] Token expiration works

### Integration

- [ ] Better Auth handles all routes
- [ ] Keycloak integration works
- [ ] User IDs are Keycloak subs
- [ ] Sessions are stored correctly
- [ ] OAuth flow completes
- [ ] Error handling works

---

## 🚀 Deployment Guide

### Prerequisites Checklist

#### Keycloak Setup
- [ ] Keycloak instance running
- [ ] Realm created
- [ ] Client configured
- [ ] Redirect URIs set
- [ ] Client secret generated

#### Database Setup
- [ ] PostgreSQL running
- [ ] Tables created (users, sessions, oauth_accounts)
- [ ] Migrations applied

#### Environment Variables
- [ ] .env file configured
- [ ] All required variables set
- [ ] CORS origins configured

---

### Step-by-Step Deployment

#### Step 1: Database Setup

```sql
-- Create tables if not exists
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  username TEXT,
  status TEXT DEFAULT 'active',
  auth_provider TEXT DEFAULT 'keycloak',
  auth_method TEXT DEFAULT 'oauth',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT,
  expires_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 2: Configure Environment

```bash
# Copy example environment
cp .env.example .env

# Edit with actual values
nano .env
```

#### Step 3: Start Application

```bash
# Development
docker-compose up -d

# Check logs
docker-compose logs -f api

# Verify health
curl http://localhost:3000/api/auth/health
```

#### Step 4: Verify Configuration

```bash
# Test Better Auth health
curl http://localhost:3000/api/auth/health

# Test JWKS endpoint
curl http://localhost:3000/.well-known/jwks.json

# Expected responses:
{
  "status": "healthy",
  "mode": "hybrid"
}
```

---

## 🔍 Troubleshooting

### Issue 1: Login redirects not working

**Symptoms:**
- Clicking login doesn't redirect
- Redirects to wrong URL

**Solution:**
```bash
# Check BETTER_AUTH_URL
echo $BETTER_AUTH_URL

# Should be: http://localhost:3000/api/auth
# NOT: http://localhost:3000
```

### Issue 2: Keycloak callback fails

**Symptoms:**
- Error after Keycloak login
- Callback URL not found

**Solution:**
```bash
# Check redirect URI
echo $KEYCLOAK_REDIRECT_URI

# Should match Keycloak client configuration
# Example: http://localhost:3000/api/auth/oauth/callback/keycloak

# Verify Keycloak client
# Go to Keycloak Admin → Clients → Your Client → Valid Redirect URIs
```

### Issue 3: JWKS endpoint not working

**Symptoms:**
- JWKS returns 404
- No keys in JWKS

**Solution:**
```bash
# Check RS256 keys enabled
echo $ENABLE_RS256_TOKENS

# Should be: true

# Check RSA keys exist
ls -la keys/

# Should contain:
# - private.pem
# - public.pem
```

### Issue 4: JWT verification fails

**Symptoms:**
- API returns 401
- "Invalid token" error

**Solution:**
```bash
# Verify JWT payload
# Use JWT.io or similar tool

# Check claims:
# - iss: modular-monolith-better-auth
# - aud: modular-monolith-api
# - sub: keycloak-sub-uuid

# Verify public key matches
curl http://localhost:3000/.well-known/jwks.json
```

---

## 📝 Monitoring & Logging

### Key Logs to Monitor

```
[BETTERAUTH] Initializing HYBRID Configuration
[BETTERAUTH] Mode: Better Auth Gateway → Keycloak IdP
[BETTERAUTH] ✅ HYBRID Configuration Complete
[AUTH-WEB] Initiating Keycloak sign-in flow
[AUTH-WEB] Processing Keycloak OAuth callback
[AUTH-API] Fetching user from bearer token
[AUTH-JWKS] Serving JWKS
```

### Health Check Endpoint

```bash
# Check auth health
curl http://localhost:3000/api/auth/health

# Response:
{
  "status": "healthy",
  "mode": "hybrid",
  "gateway": "better-auth",
  "idp": "keycloak",
  "web_support": "cookie",
  "api_support": "bearer_token",
  "jwt_support": "RS256"
}
```

---

## ✅ Final Verification Checklist

Before going to production:

- [ ] All configuration tests pass
- [ ] Web authentication works
- [ ] API authentication works
- [ ] JWKS endpoint accessible
- [ ] Keycloak integration working
- [ ] User IDs are Keycloak subs
- [ ] Sessions stored correctly
- [ ] Error handling tested
- [ ] Logs reviewed
- [ ] Monitoring set up
- [ ] Health checks configured

---

**Status:** ✅ Ready for Testing and Deployment

**Last Updated:** 2025-01-20

**Configuration:** Hybrid Better Auth Gateway + Keycloak IdP
