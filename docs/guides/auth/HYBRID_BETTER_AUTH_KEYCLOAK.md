# 🏗️ Hybrid Architecture: Better Auth Provider + Keycloak SoT

**User Login → Better Auth Provider → Keycloak → Better Auth Session → Application**

Perfect balance: Better Auth as gateway, Keycloak as Source of Truth!

---

## 🎯 Architecture Overview

### Current Setup (Keycloak Direct)

```
┌─────────┐      ┌──────────────┐      ┌─────────────┐
│ Client  │ ───→ │  Keycloak    │ ───→ │   Better    │
│ (App)   │      │  (Provider)  │      │    Auth     │
└─────────┘      └──────────────┘      └─────────────┘
                           │                        │
                           ↓ SoT                    ↓ Session
                    ┌──────────┐             ┌─────────┐
                    │ Database │             │ Database│
                    └──────────┘             └─────────┘
```

### Proposed Hybrid Setup (Better Auth as Gateway)

```
┌─────────┐      ┌──────────────────┐      ┌──────────────┐
│ Client  │ ───→ │   Better Auth    │ ───→ │   Keycloak   │
│ (App)   │      │  (OIDC Provider) │      │  (IdP/SoT)    │
└─────────┘      └──────────────────┘      └──────────────┘
                        │                           │
                        │ Gateway/Proxy            │ SoT
                        ↓                           ↓
                 ┌────────────┐             ┌──────────┐
                 │ Better Auth│             │ Keycloak │
                 │ Sessions   │             │ Users    │
                 └────────────┘             └──────────┘
```

---

## 🔄 Authentication Flow

### Step-by-Step Flow

```typescript
// 1. USER INITIATES LOGIN
User → Application
POST /api/auth/sign-in
→ Redirect to Better Auth OAuth endpoint

// 2. BETTER AUTH AS GATEWAY
Better Auth → Keycloak
GET https://keycloak.com/auth
→ Better Auth acts as OAuth client to Keycloak
→ Passes client_id, redirect_uri

// 3. KEYCLOAK AUTHENTICATES
User → Keycloak Login Page
→ User enters credentials
→ Keycloak authenticates user

// 4. KEYCLOAK RETURNS TOKEN
Keycloak → Better Auth
→ Returns authorization code
→ Better Auth exchanges for tokens

// 5. BETTER AUTH PROCESSES
Better Auth → Keycloak
→ Fetches user info from Keycloak
→ Validates ID token
→ Extracts user claims (sub, email, roles)

// 6. BETTER AUTH CREATES SESSION
Better Auth → Better Auth Database
→ Creates/updates user record (Keycloak sub as user.id)
→ Creates session in Better Auth DB
→ Issues Better Auth JWT/Session token

// 7. BETTER AUTH RETURNS TO CLIENT
Better Auth → Application
→ Returns session token or redirects
→ Application uses Better Auth session
```

---

## 🎨 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HYBRID AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │  User    │
  └────┬─────┘
       │ 1. Click Login
       ↓
  ┌────────────────┐
  │  Application   │
  │  (Client App)  │
  └────┬───────────┘
       │ 2. POST /api/auth/oauth/keycloak
       ↓
  ┌──────────────────────────────────────┐
  │     Better Auth (Provider)           │
  │  ┌──────────────────────────────┐   │
  │  │  Gateway / Proxy Layer        │   │
  │  │  - OIDC Provider Endpoint    │   │
  │  │  - Session Management        │   │
  │  │  - User Data Transformation  │   │
  │  └──────────┬───────────────────┘   │
  └─────────────┼───────────────────────┘
                │ 3. OAuth 2.0 Redirect
                ↓
  ┌──────────────────────────────────────┐
  │         Keycloak (IdP/SoT)            │
  │  ┌──────────────────────────────┐   │
  │  │  Authentication Server        │   │
  │  │  - User Database             │   │
  │  │  - Credential Validation     │   │
  │  │  - Token Issuance (RS256)     │   │
  │  │  - User Federation (LDAP)     │   │
  │  └──────────┬───────────────────┘   │
  └─────────────┼───────────────────────┘
                │ 4. Authorization Code
                ↓
  ┌──────────────────────────────────────┐
  │     Better Auth (Provider)           │
  │  ┌──────────────────────────────┐   │
  │  │  Token Exchange & Processing │   │
  │  │  - Exchange code for tokens   │   │
  │  │  - Validate ID token          │   │
  │  │  - Fetch user info             │   │
  │  │  - Extract claims              │   │
  │  └──────────┬───────────────────┘   │
  └─────────────┼───────────────────────┘
                │ 5. Create User & Session
                ↓
  ┌──────────────────────────────────────┐
  │     Better Auth Database             │
  │  ┌──────────────────────────────┐   │
  │  │  users table                   │   │
  │  │  - id: Keycloak sub           │   │
  │  │  - email: from Keycloak       │   │
  │  │  - name: from Keycloak        │   │
  │  │  - role: mapped/transformed   │   │
  │  │                                │   │
  │  │  sessions table                │   │
  │  │  - token: Better Auth session  │   │
  │  │  - userId: user.id            │   │
  │  └──────────┬───────────────────┘   │
  └─────────────┼───────────────────────┘
                │ 6. Return Session Token
                ↓
  ┌────────────────┐
  │  Application   │
  │  (Client App)  │
  └────┬───────────┘
       │ 7. Use Better Auth Session
       ↓
  ┌────────────────┐
  │  API Requests  │
  │  Bearer Token  │
  └────────────────┘
```

---

## 🎯 Benefits of Hybrid Architecture

### 1. **Best of Both Worlds** ✅

| Aspect | Benefit |
|--------|---------|
| **Keycloak SoT** | ✅ User data tetap di Keycloak |
| **Better Auth Gateway** | ✅ Unified auth layer |
| **Session Management** | ✅ Full control di Better Auth |
| **Security** | ✅ Enterprise-grade dari Keycloak |
| **Flexibility** | ✅ Custom logic di Better Auth |

---

### 2. **Better Auth as Gateway Benefits**

#### **a. Unified Authentication Layer**
```
Multiple Client Apps
    ↓
Better Auth (Single OIDC Provider)
    ↓
Keycloak (Single Source of Truth)
```

**Benefits:**
- ✅ All apps connect to Better Auth
- ✅ Single OAuth configuration for clients
- ✅ Better Auth transforms/normalizes user data
- ✅ Consistent auth flow across all apps

#### **b. User Data Transformation**
```typescript
// Keycloak returns:
{
  sub: "keycloak-uuid-123",
  email: "user@example.com",
  name: "John Doe",
  realm_access: { roles: ["user", "admin"] },
  resource_access: { ... }
}

// Better Auth can transform to:
{
  id: "keycloak-uuid-123",  // Preserve Keycloak sub
  email: "user@example.com",
  name: "John Doe",
  role: "admin",  // Simplified from realm_access
  permissions: ["read", "write"],  // Custom mapping
  metadata: { ... }  // Additional app-specific data
}
```

#### **c. Session Management**
```typescript
// Better Auth manages sessions independently
Session {
  userId: "keycloak-uuid-123",  // References Keycloak user
  token: "better-auth-session-token",
  expiresAt: 1234567890,
  ipAddress: "...",
  userAgent: "..."
}
```

**Benefits:**
- ✅ Full control over session lifecycle
- ✅ Custom session expiration
- ✅ Session analytics and monitoring
- ✅ Fine-grained session revocation

---

### 3. **Keycloak Benefits Preserved**

| Feature | Status |
|---------|--------|
| **User Storage** | ✅ Keycloak remains SoT |
| **User Federation** | ✅ LDAP, AD still work |
| **SSO** | ✅ Keycloak SSO available |
| **MFA** | ✅ Keycloak MFA works |
| **Admin Console** | ✅ Keycloak UI for users |
| **Brute Force Protection** | ✅ Keycloak security |

---

## 🔧 Implementation

### Better Auth Configuration

```typescript
// packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig.ts

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { keycloak } from 'better-auth/plugins';
import { db } from '@modular-monolith/database';
import { config } from '@modular-monolith/shared';
import { users, sessions, oauthAccounts } from '@modular-monolith/database';

console.log('[BETTERAUTH] Initializing Hybrid Configuration...');
console.log('[BETTERAUTH] Mode: Better Auth Provider → Keycloak IdP');

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false,
    schema: {
      user: users,
      session: sessions,
      oauthAccount: oauthAccounts,
    },
  }),

  // Better Auth as OIDC Provider
  advanced: {
    // Enable OIDC provider features
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
    },
    // Generate Better Auth JWT tokens
    useSecureCookies: true,
  },

  plugins: [
    // Keycloak as Identity Provider (IdP)
    keycloak({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
      domain: env.KEYCLOAK_URL,
      // Redirect back to Better Auth
      redirectURI: `${env.AUTH BETTER_AUTH_URL}/oauth/callback/keycloak`,
      enabled: true,
    }),

    // JWT plugin for Better Auth tokens
    jwt({
      // Better Auth issues its own JWT
      issuer: 'modular-monolith-better-auth',
      audience: 'modular-monolith-api',
      expirationTime: '3h',
      // Payload includes Keycloak sub
      definePayload: async ({ user, session }) => {
        return {
          sub: user.id,  // This is Keycloak sub!
          email: user.email,
          name: user.name,
          role: user.role,
          auth_provider: 'keycloak',
          session_id: session.id,
        };
      },
    }),
  ],

  // Disable email/password (use Keycloak only)
  emailAndPassword: {
    enabled: false,
  },

  // Social providers can also be added
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: false,  // Enable if needed
    },
  },
});

console.log('[BETTERAUTH] ✅ Hybrid configuration complete');
console.log('[BETTERAUTH] - Better Auth Provider: ENABLED');
console.log('[BETTERAUTH] - Keycloak IdP: ENABLED');
console.log('[BETTERAUTH] - Session Management: Better Auth');
console.log('[BETTERAUTH] - User Source of Truth: Keycloak');
```

---

### Database Schema

```typescript
// users table - References Keycloak users
export interface User {
  id: string;              // Keycloak sub (PRIMARY SOURCE)
  email: string;           // From Keycloak
  name: string;            // From Keycloak
  role: string;            // Mapped from Keycloak roles
  authProvider: 'keycloak';
  authMethod: 'oauth';
  createdAt: Date;
  updatedAt: Date;
  
  // App-specific fields (not in Keycloak)
  preferences?: Json;
  metadata?: Json;
}

// sessions table - Managed by Better Auth
export interface Session {
  id: string;
  userId: string;          // References users.id (Keycloak sub)
  token: string;           // Better Auth session token
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// oauth_accounts table - Links to Keycloak
export interface OAuthAccount {
  id: string;
  userId: string;          // References users.id
  providerId: 'keycloak';
  accountId: string;       // Keycloak sub
  accessToken: string;     // Keycloak access token
  refreshToken: string;    // Keycloak refresh token
  expiresAt: Date;
  createdAt: Date;
}
```

---

## 🔐 Security Considerations

### Token Management

```typescript
// 1. KEYCLOAK TOKENS (Source)
Keycloak ID Token: RS256
- Issued by: Keycloak
- Verified by: Better Auth
- Contains: User claims (sub, email, roles)
- Used by: Better Auth for authentication

// 2. BETTER AUTH TOKENS (Application)
Better Auth JWT: RS256/HS256
- Issued by: Better Auth
- Verified by: Application
- Contains: user.id (Keycloak sub), session data
- Used by: Application APIs
```

### Token Flow

```
1. User authenticates at Keycloak
   ↓
2. Keycloak issues ID Token (RS256)
   ↓
3. Better Auth validates Keycloak token
   ↓
4. Better Auth creates session
   ↓
5. Better Auth issues its own JWT
   ↓
6. Application uses Better Auth JWT
```

### Security Benefits

| Layer | Protection |
|-------|-----------|
| **Keycloak** | ✅ Enterprise security, MFA, brute force protection |
| **Better Auth** | ✅ Session management, token validation, rate limiting |
| **Application** | ✅ API security, authorization, fine-grained access control |

---

## 🌐 Multi-Application Setup

### Architecture

```
┌──────────────┐
│ Web App      │
│ (React)      │
└──────┬───────┘
       │ OAuth 2.0
       ↓
┌──────────────┐
│ Mobile App   │
│ (iOS/Android)│
└──────┬───────┘
       │ OAuth 2.0
       ↓
┌──────────────┐
│ Better Auth  │ ← Unified OIDC Provider
│  (Gateway)   │
└──────┬───────┘
       │ OAuth 2.0
       ↓
┌──────────────┐
│   Keycloak   │ ← Source of Truth
└──────────────┘
```

### Benefits

- ✅ All apps connect to **single Better Auth instance**
- ✅ Better Auth normalizes user data for all apps
- ✅ Keycloak manages users centrally
- ✅ Consistent auth flow across all platforms
- ✅ Easy to add new client apps

---

## 📝 Configuration Files

### .env Configuration

```bash
# =============================================================================
# HYBRID BETTER AUTH + KEYCLOAK CONFIGURATION
# =============================================================================

# Better Auth Configuration (OIDC Provider)
BETTER_AUTH_URL=https://api.yourdomain.com/api/auth
BETTER_AUTH_SECRET=your-better-auth-secret

# Enable Better Auth Provider Mode
BETTER_AUTH_PROVIDER_MODE=true

# Keycloak Configuration (Identity Provider / Source of Truth)
KEYCLOAK_URL=https://auth.azfirazka.com
KEYCLOAK_REALM=azfirazka
KEYCLOAK_ISSUER=https://auth.azfirazka.com/realms/azfirazka
KEYCLOAK_CLIENT_ID=modular-monolith-better-auth
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret

# JWT Configuration
ENABLE_RS256_TOKENS=true
JWT_ACCESS_TOKEN_EXPIRY=3h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Session Configuration
SESSION_EXPIRY=24h
SESSION_REFRESH_ENABLED=true

# OAuth Configuration
OAUTH_REDIRECT_URI=https://app.yourdomain.com/auth/callback
OAUTH_POST_LOGOUT_REDIRECT_URI=https://app.yourdomain.com

# Feature Flags
ENABLE_KEYCLOAK=true
ENABLE_BETTER_AUTH_PROVIDER=true
ENABLE_EMAIL_PASSWORD_AUTH=false  # Keycloak only
```

---

## 🚀 Implementation Steps

### Step 1: Update BetterAuthConfig.ts

```typescript
// Keep keycloak plugin as is
keycloak({
  clientId: env.KEYCLOAK_CLIENT_ID,
  clientSecret: env.KEYCLOAK_CLIENT_SECRET,
  issuer: env.KEYCLOAK_ISSUER,
  domain: env.KEYCLOAK_URL,
  redirectURI: `${env.BETTER_AUTH_URL}/oauth/callback/keycloak`,
  enabled: true,
})
```

### Step 2: Add JWT Plugin

```typescript
jwt({
  issuer: 'modular-monolith-better-auth',
  audience: 'modular-monolith-api',
  expirationTime: '3h',
  definePayload: async ({ user, session }) => {
    return {
      sub: user.id,  // Keycloak sub
      email: user.email,
      name: user.name,
      role: user.role,
      auth_provider: 'keycloak',
      session_id: session.id,
    };
  },
})
```

### Step 3: Update Database Schema

```sql
-- Ensure users table has these fields:
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'keycloak',
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'oauth';

-- Ensure oauth_accounts table exists for Keycloak tokens
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  provider_id TEXT,
  account_id TEXT,  -- Keycloak sub
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: Test Authentication Flow

```bash
# 1. Start application
docker-compose up -d

# 2. Initiate login
curl -X POST http://localhost:3000/api/auth/oauth/keycloak

# 3. Follow redirect to Keycloak
# 4. Login at Keycloak
# 5. Redirect back to Better Auth
# 6. Better Auth creates session
# 7. Receive Better Auth token

# 8. Test API with Better Auth token
curl -H "Authorization: Bearer <better-auth-token>" \
  http://localhost:3000/api/users/me
```

---

## 🎯 Migration from Current Setup

### Current → Hybrid

**What Changes:**

| Aspect | Current | Hybrid |
|--------|---------|--------|
| **User Login** | App → Keycloak → App | App → Better Auth → Keycloak → Better Auth → App |
| **Session Management** | Better Auth (already) | Better Auth (same) |
| **Token** | Keycloak JWT (via app) | Better Auth JWT |
| **User Storage** | Keycloak (same) | Keycloak (same) |
| **Better Auth Role** | Session manager | Provider + Session manager |

**What Stays Same:**
- ✅ Keycloak as user database
- ✅ Keycloak login page
- ✅ Better Auth session management
- ✅ User ID from Keycloak sub

**What's New:**
- 🆕 Better Auth as OIDC provider endpoint
- 🆕 Better Auth issues its own JWT
- 🆕 Better Auth transforms user data
- 🆕 Better Auth gateway for all clients

---

## 📊 Comparison: Current vs Hybrid

### Current Setup

```
App → Keycloak (login) → App receives Keycloak JWT
     ↓
App validates Keycloak JWT (at Better Auth)
     ↓
Better Auth creates session
     ↓
App uses Better Auth session
```

**Issues:**
- ⚠️ App must handle Keycloak OAuth flow
- ⚠️ App receives Keycloak JWT directly
- ⚠️ No unified auth layer
- ⚠️ Hard to add multiple client apps

---

### Hybrid Setup

```
App → Better Auth (OAuth endpoint) → Keycloak (login)
                                      ↓
App receives Better Auth JWT ← Better Auth (session)
```

**Benefits:**
- ✅ Better Auth handles Keycloak OAuth flow
- ✅ App only deals with Better Auth
- ✅ Unified auth layer
- ✅ Easy to add multiple client apps
- ✅ Better Auth transforms/normalizes user data

---

## ✅ Summary

### Hybrid Architecture = Best of Both Worlds!

```
┌─────────────────────────────────────────────────────┐
│                HYBRID BENEFITS                       │
├─────────────────────────────────────────────────────┤
│ ✅ Keycloak: User management, enterprise features   │
│ ✅ Better Auth: Gateway, sessions, flexibility      │
│ ✅ Unified: Single auth layer for all apps          │
│ ✅ Flexible: Custom logic at Better Auth level       │
│ ✅ Secure: Enterprise security + custom protection  │
│ ✅ Scalable: Easy to add new client apps            │
└─────────────────────────────────────────────────────┘
```

### Flow Summary

```
User
  ↓ Login
App
  ↓ OAuth 2.0
Better Auth Provider (Gateway)
  ↓ OAuth 2.0
Keycloak IdP (Source of Truth)
  ↓ User info + tokens
Better Auth Provider
  ↓ Session creation
Better Auth Database
  ↓ Session token
App
  ↓ API requests
Application APIs
```

---

**Recommendation:** ✅ **GO WITH HYBRID!**

This gives you:
- ✅ Enterprise security from Keycloak
- ✅ Flexibility and control from Better Auth
- ✅ Unified auth layer for all apps
- ✅ Easy to scale and add new clients

Perfect setup for your use case! 🎉

---

**Last Updated:** 2025-01-20
**Architecture:** Hybrid (Better Auth Provider + Keycloak SoT)
**Status:** ✅ Recommended
