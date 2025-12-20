# Hybrid Authentication - Overview

## 📋 Table of Contents

- [What is Hybrid Authentication](#what-is-hybrid-authentication)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Benefits](#benefits)
- [When to Use](#when-to-use)

---

## 🎯 What is Hybrid Authentication?

Hybrid Authentication is a **flexible authentication system** that automatically detects and handles both:

- **Cookie-Based Authentication** for web browsers
- **JWT-Based Authentication** for mobile apps, SPAs, and microservices

Both authentication methods are handled by a **single unified middleware**, making it easy to support multiple client types.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Client (Browser)                     │
│              - Uses HTTP-only cookie                        │
│              - Automatic cookie sending                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile / SPA Client                            │
│              - Uses JWT token                               │
│              - Manual Authorization header                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Hybrid Auth Middleware                      │
│              - Auto-detects auth method                     │
│              - Tries cookie first                           │
│              - Falls back to JWT                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Keycloak (IdP)                            │
│              - OAuth 2.0 / OIDC                            │
│              - User authentication                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### For Web Clients (Cookie)

1. **Initiate OAuth**: Web app initiates OAuth flow
2. **Login**: User logs in via Keycloak
3. **Callback**: OAuth callback creates session
4. **Cookie Set**: Server sets HTTP-only cookie
5. **Automatic**: Browser sends cookie automatically

**Code Example:**
```typescript
// Initiate OAuth
const response = await fetch('/api/auth/sign-in/oauth2', {
  method: 'POST',
  body: JSON.stringify({ providerId: 'keycloak', callbackURL: '/dashboard' })
});

// Redirect to Keycloak
window.location.href = response.url;

// After login, cookie is automatically set
// Subsequent requests automatically include cookie
```

### For Non-Web Clients (JWT)

1. **Initiate OAuth**: App initiates OAuth with `return_type=json`
2. **Login**: User logs in via Keycloak
3. **Callback**: Returns JSON with JWT token
4. **Store**: Client stores JWT securely
5. **Manual**: Client sends JWT in Authorization header

**Code Example:**
```typescript
// Initiate OAuth with return_type=json
const oauthUrl = authUrl + '&return_type=json';

// Login and get JWT
const { jwt, user } = await fetch(oauthUrl).then(r => r.json());

// Store JWT
await SecureStore.setItemAsync('jwt', jwt);

// Use JWT
const profile = await fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${jwt}` }
});
```

---

## ✨ Benefits

### 1. Single Middleware

**Before:**
```typescript
// Separate middleware for web and mobile
app.use('/api/web/*', cookieAuthMiddleware);
app.use('/api/mobile/*', jwtAuthMiddleware);
```

**After:**
```typescript
// Single hybrid middleware for all
app.use('/api/*', hybridAuthMiddleware);
```

### 2. Automatic Detection

Middleware automatically detects authentication method:
- Cookie present → Use cookie auth
- No cookie but Authorization header → Use JWT auth
- Neither → Return 401

### 3. Easy Migration

Support multiple client types without route duplication:
- Add mobile app to existing web app
- Add SPA without breaking web app
- Migrate gradually from web to mobile

### 4. Unified API

Same API endpoints work for all clients:
- `GET /api/users/profile` works for web and mobile
- No need for separate `/api/web/users` and `/api/mobile/users`

---

## 🎯 When to Use

### ✅ Perfect For:

- **Mixed client types** (web + mobile)
- **Progressive migration** from web to mobile
- **Unified API** for all clients
- **Simple architecture** (single middleware)

### ❌ Not Ideal For:

- **Web-only applications** (use cookie-only)
- **Mobile-only applications** (use JWT-only)
- **Need different logic** per client type

---

## 📊 Comparison

| Feature | Cookie Only | JWT Only | Hybrid |
|---------|-------------|----------|--------|
| **Web Support** | ✅ Excellent | ⚠️ Manual | ✅ Excellent |
| **Mobile Support** | ❌ Difficult | ✅ Excellent | ✅ Excellent |
| **Middleware** | Simple | Simple | Unified |
| **Automatic** | ✅ Yes | ❌ No | ✅ Yes (web) |
| **Stateless** | ❌ No | ✅ Yes | ✅ Yes (mobile) |
| **Setup** | Simple | Simple | Medium |

---

## 🔗 Related Documentation

- [Cookie Authentication](./cookie-auth.md) - Deep dive into cookie-based auth
- [JWT Authentication](./jwt-auth.md) - Deep dive into JWT-based auth
- [Hybrid Middleware](./middleware.md) - How auto-detection works
- [Web Examples](./web-examples.md) - Browser implementation
- [Mobile Examples](./mobile-examples.md) - Mobile implementation

---

## 📖 Next Steps

**If you're building a web app:**
→ [Cookie Authentication Guide](./cookie-auth.md)

**If you're building a mobile app:**
→ [JWT Authentication Guide](./jwt-auth.md)

**If you want to understand the middleware:**
→ [Hybrid Middleware Guide](./middleware.md)

**If you want implementation examples:**
→ [Web Examples](./web-examples.md) / [Mobile Examples](./mobile-examples.md)

---

**Last Updated:** 2025-01-20
