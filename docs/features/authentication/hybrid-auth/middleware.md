# Hybrid Authentication Middleware

How the hybrid authentication middleware automatically detects and handles both cookie and JWT authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Detection Logic](#detection-logic)
- [Implementation](#implementation)
- [Usage](#usage)
- [Customization](#customization)

---

## 🎯 Overview

The hybrid authentication middleware provides **automatic detection** of authentication method, supporting both cookie and JWT in a single middleware function.

### Features

- ✅ **Auto-detection** - Cookie or JWT
- ✅ **Fallback** - Try cookie, then JWT
- ✅ **Unified** - Single middleware for all routes
- ✅ **Type-safe** - Returns user and auth method

---

## 🔍 Detection Logic

```
┌──────────────────────────────────────────────────────────┐
│                    Incoming Request                       │
│              - Headers (Cookie, Authorization)           │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 Try Cookie Authentication                 │
│              - Check for session cookie                  │
│              - Validate session from database            │
└──────────────────────────────────────────────────────────┘
                         │
              ┌────────────┴────────────┐
              ▼                         ▼
         ✅ Valid                  ❌ Invalid
         or Found                      or Missing
              │                         │
              ▼                         ▼
    ┌─────────────────┐      ┌──────────────────────┐
    │ Return Success  │      │ Try JWT Auth         │
    │ method: 'cookie'│      │ - Check Authorization │
    └─────────────────┘      │   header             │
                             │ - Validate JWT       │
                             └──────────────────────┘
                                          │
                             ┌────────────┴────────────┐
                             ▼                         ▼
                        ✅ Valid                  ❌ Invalid
                             │                         │
                             ▼                         ▼
                   ┌─────────────────┐      ┌─────────────────┐
                   │ Return Success  │      │ Return 401      │
                   │ method: 'jwt'   │      │ Unauthorized    │
                   └─────────────────┘      └─────────────────┘
```

---

## 💻 Implementation

### TypeScript Implementation

```typescript
import { Context } from 'hono';
import { auth } from './BetterAuthConfig';

interface AuthResult {
  success: boolean;
  user?: any;
  method?: 'cookie' | 'jwt';
  error?: string;
}

async function hybridAuth(c: Context): Promise<AuthResult> {
  // ========================================
  // Step 1: Try Cookie Authentication
  // ========================================
  try {
    const session = await auth.api.getSession({
      headers: c.req.header()
    });

    if (session && session.user) {
      console.log(`[HYBRID-AUTH] ✅ Cookie auth successful: ${session.user.email}`);
      return {
        success: true,
        user: session.user,
        method: 'cookie'
      };
    }
  } catch (error) {
    console.log(`[HYBRID-AUTH] ❌ Cookie auth failed: ${error.message}`);
  }

  // ========================================
  // Step 2: Try JWT Authentication
  // ========================================
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify JWT using BetterAuth JWKS endpoint
      const verifyResponse = await fetch(
        `${config.auth.betterAuth.url}/api/auth/verify-jwt`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        
        if (verifyData.valid && verifyData.user) {
          console.log(`[HYBRID-AUTH] ✅ JWT auth successful: ${verifyData.user.email}`);
          return {
            success: true,
            user: verifyData.user,
            method: 'jwt'
          };
        }
      }

      console.log(`[HYBRID-AUTH] ❌ JWT auth failed: Invalid token`);
      return {
        success: false,
        error: 'Invalid JWT token'
      };
    } catch (error: any) {
      console.error(`[HYBRID-AUTH] ❌ JWT auth error: ${error.message}`);
      return {
        success: false,
        error: `JWT verification failed: ${error.message}`
      };
    }
  }

  // ========================================
  // Step 3: No Valid Authentication Found
  // ========================================
  console.log(`[HYBRID-AUTH] ❌ No valid authentication found`);
  return {
    success: false,
    error: 'No valid session or JWT token found'
  };
}
```

---

## 🚀 Usage

### Apply Middleware to Routes

```typescript
// Protected routes with hybrid auth
app.use('/api/users/*', async (c, next) => {
  const authResult = await hybridAuth(c);

  if (!authResult.success) {
    return c.json({ 
      error: 'Unauthorized',
      message: authResult.error,
      hint: 'Use session cookie or Authorization: Bearer <jwt>'
    }, 401);
  }

  // Set user and auth method in context
  c.set('user', authResult.user);
  c.set('authMethod', authResult.method);
  
  console.log(`[AUTH-MIDDLEWARE] ✅ User authenticated via ${authResult.method}`);
  
  await next();
});

// Same middleware for notifications
app.use('/api/notifications/*', async (c, next) => {
  const authResult = await hybridAuth(c);

  if (!authResult.success) {
    return c.json({ 
      error: 'Unauthorized',
      message: authResult.error
    }, 401);
  }

  c.set('user', authResult.user);
  c.set('authMethod', authResult.method);
  
  await next();
});
```

### Access Authenticated User

```typescript
// In your route handlers
app.get('/api/users/profile', (c) => {
  const user = c.get('user');
  const authMethod = c.get('authMethod');

  return c.json({
    user,
    authenticatedVia: authMethod // 'cookie' or 'jwt'
  });
});
```

---

## 🎨 Customization

### Custom Priority

By default, middleware tries **cookie first**, then JWT. To change priority:

```typescript
async function hybridAuthJWTPriority(c: Context): Promise<AuthResult> {
  // Try JWT first
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const jwtResult = await verifyJWT(token);
    
    if (jwtResult.valid) {
      return {
        success: true,
        user: jwtResult.user,
        method: 'jwt'
      };
    }
  }

  // Fallback to cookie
  const session = await auth.api.getSession({
    headers: c.req.header()
  });

  if (session?.user) {
    return {
      success: true,
      user: session.user,
      method: 'cookie'
    };
  }

  return {
    success: false,
    error: 'No valid authentication found'
  };
}
```

### Custom Error Response

```typescript
app.use('/api/*', async (c, next) => {
  const authResult = await hybridAuth(c);

  if (!authResult.success) {
    // Custom error response
    return c.json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: authResult.error,
        documentation_url: 'https://docs.example.com/auth'
      }
    }, 401);
  }

  await next();
});
```

### Add Logging

```typescript
async function hybridAuthWithLogging(c: Context): Promise<AuthResult> {
  const startTime = Date.now();

  // Cookie auth
  const cookieResult = await tryCookieAuth(c);
  if (cookieResult.success) {
    console.log(`[AUTH] Cookie auth successful in ${Date.now() - startTime}ms`);
    return cookieResult;
  }

  // JWT auth
  const jwtResult = await tryJWTAuth(c);
  if (jwtResult.success) {
    console.log(`[AUTH] JWT auth successful in ${Date.now() - startTime}ms`);
    return jwtResult;
  }

  // Failed
  console.log(`[AUTH] Authentication failed in ${Date.now() - startTime}ms`);
  return {
    success: false,
    error: 'Authentication failed'
  };
}
```

---

## 🧪 Testing

### Test Cookie Authentication

```bash
# 1. Login and get cookie
# (Complete OAuth flow in browser)

# 2. Test with cookie
curl http://localhost:3000/api/users/profile \
  -H 'Cookie: better-auth.session_token=<token>'

# Expected: User data + authenticatedVia: 'cookie'
```

### Test JWT Authentication

```bash
# 1. Login with return_type=json
# 2. Get JWT from response

# 3. Test with JWT
curl http://localhost:3000/api/users/profile \
  -H 'Authorization: Bearer <jwt_token>'

# Expected: User data + authenticatedVia: 'jwt'
```

### Test Both Fail

```bash
# Request without cookie or JWT
curl http://localhost:3000/api/users/profile

# Expected: 401 Unauthorized
# {
#   "error": "Unauthorized",
#   "message": "No valid session or JWT token found"
# }
```

---

## 📊 Performance

### Comparison

| Method | Database Lookup | JWKS Request | Total Time |
|--------|----------------|--------------|------------|
| **Cookie** | ✅ Yes (session) | ❌ No | ~50ms |
| **JWT** | ❌ No | ⚠️ Cached | ~5ms |

**JWT is faster** after first request (JWKS cached).

### Optimization

```typescript
// Cache JWKS requests
const JWKS_CACHE = new Map();

async function verifyJWTWithCache(token: string) {
  // Check cache first
  const cachedKey = JWKS_CACHE.get('jwks');
  if (cachedKey) {
    return verifyJWT(token, cachedKey);
  }

  // Fetch JWKS
  const jwks = await fetchJWKS();
  JWKS_CACHE.set('jwks', jwks); // Cache for 1 hour

  return verifyJWT(token, jwks);
}
```

---

## 🔒 Security

### Prevention of Double Authentication

Middleware ensures only **one method** succeeds:

```typescript
// ✅ CORRECT: Only one method active
// Cookie present → Cookie auth used, JWT ignored
// JWT only → JWT auth used

// ❌ WRONG: Both methods active
// This can't happen with our implementation
// because we return early on first success
```

### Token Validation

Both methods properly validate:

**Cookie:**
- Session exists in database
- Session not expired
- User active

**JWT:**
- Signature valid (RS256)
- Not expired
- Issuer correct
- Audience correct

---

## 📖 Next Steps

- [Cookie Authentication](./cookie-auth.md) - Cookie details
- [JWT Authentication](./jwt-auth.md) - JWT details
- [Web Examples](./web-examples.md) - Implementation examples
- [Security Guide](./security.md) - Security best practices

---

**Last Updated:** 2025-01-20
