# Cookie-Based Authentication

Complete guide to using cookie-based authentication for web applications.

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Implementation](#implementation)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

Cookie-based authentication is ideal for **traditional web applications** where the browser automatically handles session cookies.

### Key Features

- ✅ **Automatic** - Browser sends cookies automatically
- ✅ **Secure** - HTTP-only cookies prevent XSS attacks
- ✅ **CSRF Protection** - Built-in with SameSite attribute
- ✅ **Session Management** - Can revoke sessions server-side

---

## 🔄 How It Works

### Flow Diagram

```
┌─────────────┐     1. OAuth     ┌─────────────┐
│   Browser   │────────────────▶│  Keycloak   │
└─────────────┘                 └─────────────┘
     ▲                                   │
     │ 4. Callback with cookie          │
     │                                   │ 2. Auth code
     │                                   ▼
     │                          ┌─────────────┐
     │                          │ BetterAuth  │
     │                          │             │
     │                          │ - Create    │
     │                          │   session   │
     │                          │ - Set cookie│
     │                          └─────────────┘
     │                                   │
     │                                   │ 3. Redirect
     └───────────────────────────────────┘
     
     5. Browser sends cookie automatically
```

### Step by Step

1. **Initiate OAuth**: Browser navigates to `/api/auth/sign-in/oauth2`
2. **Login**: User logs in at Keycloak
3. **Callback**: Keycloak redirects back with authorization code
4. **Session Creation**: BetterAuth creates session and sets cookie
5. **Automatic Sending**: Browser includes cookie in all subsequent requests

---

## 💻 Implementation

### 1. Initiate OAuth

```typescript
// React / TypeScript
const initiateOAuth = async () => {
  const response = await fetch('/api/auth/sign-in/oauth2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      providerId: 'keycloak',
      callbackURL: '/dashboard'
    })
  });

  const data = await response.json();
  
  // Redirect to Keycloak
  window.location.href = data.url;
};
```

### 2. Handle Callback

Callback is automatically handled by BetterAuth:
- Session is created
- Cookie is set
- User is redirected to `callbackURL`

### 3. Access Protected Routes

```typescript
// Cookie is automatically sent by browser
const fetchProfile = async () => {
  const response = await fetch('/api/users/profile');
  // Cookie automatically included!
  
  if (!response.ok) {
    // Redirect to login if unauthorized
    window.location.href = '/login';
    return;
  }
  
  const profile = await response.json();
  return profile;
};
```

---

## 🔒 Security Best Practices

### Cookie Configuration

```typescript
// Server-side cookie configuration
c.header('Set-Cookie', 
  `better-auth.session_token=${sessionToken}; ` +
  `Path=/; ` +
  `HttpOnly; ` +           // Prevents JavaScript access
  `Secure; ` +             // HTTPS only
  `SameSite=Lax; ` +       // CSRF protection
  `Max-Age=${60 * 60 * 24 * 7}` // 7 days
);
```

### Attributes Explained

| Attribute | Purpose | Value |
|-----------|---------|-------|
| **HttpOnly** | Prevent XSS attacks | `true` |
| **Secure** | HTTPS only (production) | `true` |
| **SameSite** | CSRF protection | `Lax` or `Strict` |
| **Path** | Cookie scope | `/` |
| **Max-Age** | Expiration | `604800` (7 days) |

### Additional Security

1. **Use HTTPS** in production
2. **Set Secure flag** for production
3. **Configure CORS** properly:
   ```typescript
   // Server CORS config
   app.use('*', cors({
     origin: 'https://yourdomain.com',
     credentials: true, // Important for cookies!
     methods: ['GET', 'POST', 'PUT', 'DELETE']
   }));
   ```

4. **Validate CSRF** for state-changing operations
5. **Rotate session tokens** periodically

---

## 🧪 Testing

### Test Cookie Flow

```bash
# 1. Initiate OAuth
curl -X POST http://localhost:3000/api/auth/sign-in/oauth2 \
  -H 'Content-Type: application/json' \
  -d '{"providerId":"keycloak","callbackURL":"/dashboard"}'

# Response:
# {
#   "url": "https://auth.azfirazka.com/realms/..."
# }

# 2. Copy URL and open in browser
# 3. Login to Keycloak
# 4. You'll be redirected to /dashboard

# 5. Check cookie in browser DevTools
# Application → Cookies → http://localhost:3000
# Name: better-auth.session_token

# 6. Test protected route with cookie
curl http://localhost:3000/api/users/profile \
  -H 'Cookie: better-auth.session_token=<your_token>'

# Response:
# {
#   "id": "...",
#   "email": "user@example.com",
#   ...
# }
```

---

## 🔍 Troubleshooting

### Cookie Not Being Sent

**Problem:** Requests return 401 even though user is logged in.

**Solutions:**
1. **Check CORS credentials:**
   ```typescript
   // Make sure credentials: true
   fetch('/api/users/profile', {
     credentials: 'include' // Include cookies!
   });
   ```

2. **Check cookie domain:**
   - Cookie domain must match request domain
   - Local: `localhost` must match `localhost`
   - Production: `.yourdomain.com` for subdomains

3. **Check SameSite attribute:**
   - `SameSite=Strict` may prevent cookies in some scenarios
   - Use `SameSite=Lax` for most cases

### Cookie Not Being Set

**Problem:** Login successful but no cookie set.

**Solutions:**
1. **Check Set-Cookie header** in browser DevTools
2. **Verify HttpOnly** attribute (not visible in JavaScript)
3. **Check cookie path** (should be `/`)
4. **Verify domain** matches

---

## 📊 Comparison with JWT

| Feature | Cookie | JWT |
|---------|--------|-----|
| **Automatic** | ✅ Yes | ❌ Manual |
| **XSS Protection** | ✅ HttpOnly | ❌ localStorage |
| **CSRF Protection** | ✅ SameSite | ⚠️ Need setup |
| **Revocation** | ✅ Yes | ❌ No |
| **Stateless** | ❌ Server session | ✅ Yes |
| **Mobile** | ❌ Complex | ✅ Simple |
| **Database** | ✅ Required | ❌ Not required |

---

## 🎯 When to Use Cookie Auth

### ✅ Use When:

- Traditional web applications
- Browser-based apps
- Server-rendered pages (SSR)
- Need session revocation
- Want CSRF protection

### ❌ Don't Use When:

- Mobile apps (React Native, Flutter)
- SPAs that need JWT
- Microservices (stateless required)
- Cross-origin APIs (without proper CORS)

---

## 📖 Next Steps

- [JWT Authentication](./jwt-auth.md) - For non-web clients
- [Hybrid Middleware](./middleware.md) - How both work together
- [Web Examples](./web-examples.md) - Complete examples
- [Security Guide](./security.md) - Advanced security topics

---

**Last Updated:** 2025-01-20
