# JWT-Based Authentication

Complete guide to using JWT-based authentication for mobile apps and SPAs.

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Token Structure](#token-structure)
- [Implementation](#implementation)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

JWT (JSON Web Token) authentication is ideal for **non-web clients** like mobile apps, SPAs, and microservices.

### Key Features

- ✅ **Stateless** - No database lookup for validation
- ✅ **Cross-Origin** - Works across domains
- ✅ **Mobile-Friendly** - Easy token storage
- ✅ **Self-Contained** - User info in token payload

---

## 🔄 How It Works

### Flow Diagram

```
┌─────────────┐     1. OAuth with     ┌─────────────┐
│   Mobile    │     return_type=json  │  Keycloak   │
│    App      │───────────────────────▶│             │
└─────────────┘                       └─────────────┘
     ▲                                         │
     │ 3. JSON response                        │
     │    with JWT                             │ 2. Auth code
     │                                         │
     │                                    ┌────┴────┐
     │                                    │BetterAuth│
     │                                    │          │
     │                                    │ - Create │
     │                                    │   session│
     │                                    │ - Gen JWT│
     │                                    └──────────┘
     │                                         │
     └─────────────────────────────────────────┘
     
     4. Store JWT securely
     5. Include JWT in Authorization header
```

---

## 💻 Implementation

### React Native Example

```typescript
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// 1. Login and get JWT
const login = async () => {
  // Initiate OAuth with return_type=json
  const oauthUrl = `${baseURL}/api/auth/sign-in/oauth2`;
  const response = await axios.post(oauthUrl, {
    providerId: 'keycloak',
    callbackURL: 'myapp://callback'
  });

  // Add return_type to OAuth URL
  const authUrl = new URL(response.data.url);
  authUrl.searchParams.set('redirect_uri', 
    `${baseURL}/api/auth/oauth/keycloak/callback?return_type=json`
  );

  // Open browser for login
  const result = await WebBrowser.openAuthSessionAsync(
    authUrl.toString(),
    'myapp://callback'
  );

  // Get JWT from callback
  const callbackData = await fetch(result.url).then(r => r.json());
  
  // Store JWT securely
  await SecureStore.setItemAsync('jwt', callbackData.jwt);
  
  return callbackData;
};

// 2. Use JWT for API calls
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Add JWT to every request
api.interceptors.request.use(async (config) => {
  const jwt = await SecureStore.getItemAsync('jwt');
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

// 3. Refresh token if needed
const refreshJWT = async () => {
  const jwt = await SecureStore.getItemAsync('jwt');
  
  // Get new JWT from existing session
  const response = await axios.get('/api/auth/jwt', {
    headers: { 'Cookie': `better-auth.session_token=${jwt}` }
  });
  
  await SecureStore.setItemAsync('jwt', response.data.jwt);
};
```

---

## 🔐 Token Structure

### JWT Payload

```json
{
  "sub": "bb1f3a72-fd7a-49bc-99ea-a8275e4417ae",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "auth_provider": "keycloak",
  "auth_method": "oauth",
  "session_id": "123",
  "type": "access",
  "iss": "modular-monolith",
  "aud": "modular-monolith-api",
  "exp": 1734684700,
  "iat": 1734673900
}
```

### Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| **sub** | User ID (Keycloak sub) | `"bb1f3a72-..."` |
| **email** | User email | `"user@example.com"` |
| **name** | User name | `"User Name"` |
| **role** | User role | `"user"` |
| **auth_provider** | Auth provider | `"keycloak"` |
| **session_id** | BetterAuth session ID | `"123"` |
| **iss** | Token issuer | `"modular-monolith"` |
| **aud** | Token audience | `"modular-monolith-api"` |
| **exp** | Expiration timestamp | `1734684700` |
| **iat** | Issued at timestamp | `1734673900` |

---

## 🔒 Security Best Practices

### 1. Secure Token Storage

**❌ Don't use:**
```typescript
// NOT SECURE - accessible to XSS
localStorage.setItem('jwt', jwt);
```

**✅ Use instead:**
```typescript
// React Native
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('jwt', jwt);

// Flutter
import flutter_secure_storage;
await storage.write(key: 'jwt', value: jwt);

// Electron
session.defaultSession.cookies.set({
  url: 'http://localhost:3000',
  name: 'jwt',
  value: jwt,
  httpOnly: true,
  secure: true
});
```

### 2. Token Expiration

- **Short expiration**: 3 hours recommended
- **Refresh mechanism**: Implement token refresh
- **Warning users**: Show warning before expiration

```typescript
// Check token expiration
const checkTokenExpiration = (jwt: string) => {
  const payload = JSON.parse(atob(jwt.split('.')[1]));
  const exp = payload.exp * 1000;
  const now = Date.now();
  const timeLeft = exp - now;
  
  // Warn user if token expires in < 30 minutes
  if (timeLeft < 30 * 60 * 1000) {
    alert('Session expiring soon. Please refresh.');
  }
};
```

### 3. HTTPS Only

**Always use HTTPS in production:**
```typescript
// Development
const baseURL = 'http://localhost:3000';

// Production
const baseURL = 'https://api.yourdomain.com';
```

---

## 🧪 Testing

### Test JWT Flow

```bash
# 1. Initiate OAuth with return_type=json
curl -X POST http://localhost:3000/api/auth/sign-in/oauth2 \
  -d '{"providerId":"keycloak","callbackURL":"/dashboard"}'

# 2. Manually add return_type to OAuth URL
# https://auth.azfirazka.com/.../auth?
#   redirect_uri=http://localhost:3000/api/auth/oauth/keycloak/callback?return_type=json

# 3. Complete login in browser

# 4. Get JWT from response
# {
#   "success": true,
#   "jwt": "eyJhbGc...",
#   "user": {...}
# }

# 5. Use JWT for API calls
curl http://localhost:3000/api/users/profile \
  -H 'Authorization: Bearer eyJhbGc...'

# 6. Decode JWT to see payload
# Use jwt.io or:
echo "eyJhbGc..." | jq -R 'split(".") | .[1] | @base64d | fromjson'
```

---

## 🔍 Troubleshooting

### JWT Validation Failed

**Problem:** API returns 401 even with valid JWT.

**Solutions:**

1. **Check token expiration:**
   ```typescript
   const payload = JSON.parse(atob(jwt.split('.')[1]));
   console.log('Token expires:', new Date(payload.exp * 1000));
   ```

2. **Check Authorization header format:**
   ```typescript
   // ✅ Correct
   headers: { 'Authorization': 'Bearer <token>' }
   
   // ❌ Wrong
   headers: { 'Authorization': '<token>' }
   headers: { 'Authorization': 'Bearer <token> ' } // extra space
   ```

3. **Verify token signature:**
   - Token must be signed by server
   - JWKS endpoint must be accessible

---

## 📊 Comparison with Cookie

| Feature | JWT | Cookie |
|---------|-----|--------|
| **Automatic** | ❌ Manual | ✅ Yes |
| **Stateless** | ✅ Yes | ❌ No |
| **Storage** | Client | Server |
| **Revocation** | ❌ No | ✅ Yes |
| **Mobile** | ✅ Simple | ❌ Complex |
| **XSS Risk** | ⚠️ localStorage | ✅ HttpOnly |
| **CSRF Risk** | ✅ Not affected | ⚠️ Need protection |

---

## 🎯 When to Use JWT Auth

### ✅ Use When:

- Mobile apps (React Native, Flutter)
- Single Page Applications (React, Vue, Angular)
- Microservices architecture
- Need stateless authentication
- Cross-origin requests

### ❌ Don't Use When:

- Traditional web apps (use cookie)
- Need session revocation
- Can't implement refresh mechanism
- Simple server-rendered pages

---

## 📖 Next Steps

- [Cookie Authentication](./cookie-auth.md) - For web clients
- [Hybrid Middleware](./middleware.md) - How both work together
- [Mobile Examples](./mobile-examples.md) - Complete examples
- [Security Guide](./security.md) - Advanced security topics

---

**Last Updated:** 2025-01-20
