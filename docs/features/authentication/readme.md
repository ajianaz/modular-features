# Authentication Documentation

Complete guide to authentication systems in the Modular Monolith project.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Authentication Patterns](#authentication-patterns)
- [Feature Documentation](#feature-documentation)
- [Examples](#examples)
- [Security](#security)

---

## 🚀 Quick Start

### Choose Your Pattern

| Pattern | Best For | Documentation |
|---------|----------|---------------|
| **Hybrid Authentication** | Web + Mobile, single system | [→ Hybrid Auth](./hybrid-auth/) |
| **Direct Keycloak** | Existing SSO, multi-app | [→ Direct Keycloak](./direct-keycloak/) |
| **OIDC Provider** | Enterprise, standard OIDC | [→ OIDC Provider](./oidc-provider/) |

---

## 📖 Authentication Patterns

### Pattern 1: Hybrid Authentication

**Description:** Single middleware supporting both cookie (web) and JWT (non-web) authentication.

**Architecture:**
```
Web Client → Cookie → BetterAuth → Keycloak
Mobile Client → JWT → BetterAuth → Keycloak
```

**Key Features:**
- ✅ Automatic auth method detection
- ✅ Cookie for web browsers
- ✅ JWT for mobile/SPA
- ✅ Single middleware for all routes

**→ [Full Documentation](./hybrid-auth/)**

---

### Pattern 2: Direct Keycloak Integration

**Description:** Clients authenticate directly with Keycloak, then validate tokens with BetterAuth.

**Architecture:**
```
Client → Keycloak (OAuth) → Get Token → BetterAuth (validate) → Session
```

**Key Features:**
- ✅ Direct Keycloak OAuth
- ✅ Token validation endpoint
- ✅ BetterAuth session creation
- ✅ Multi-app SSO

**→ [Full Documentation](./direct-keycloak/)**

---

### Pattern 3: OIDC Provider

**Description:** BetterAuth acts as OIDC provider with Keycloak as upstream IdP.

**Architecture:**
```
Client → BetterAuth (OIDC) → Keycloak → BetterAuth (JWT) → Client
```

**Key Features:**
- ✅ Standard OIDC endpoints
- ✅ Multiple provider support
- ✅ Custom JWT claims
- ✅ Authentication abstraction

**→ [Full Documentation](./oidc-provider/)**

---

## 🎯 Feature Documentation

### Hybrid Authentication

1. **[Overview](./hybrid-auth/overview.md)** - Architecture and concepts
2. **[Cookie Authentication](./hybrid-auth/cookie-auth.md)** - Web client auth
3. **[JWT Authentication](./hybrid-auth/jwt-auth.md)** - Non-web client auth
4. **[Hybrid Middleware](./hybrid-auth/middleware.md)** - Auto-detection logic
5. **[Web Examples](./hybrid-auth/web-examples.md)** - Browser implementation
6. **[Mobile Examples](./hybrid-auth/mobile-examples.md)** - Mobile implementation

### Direct Keycloak

1. **[Overview](./direct-keycloak/overview.md)** - Architecture and concepts
2. **[Token Validation](./direct-keycloak/token-validation.md)** - Server endpoint
3. **[Client Integration](./direct-keycloak/client-integration.md)** - Client setup
4. **[Examples](./direct-keycloak/examples.md)** - Implementation examples

### OIDC Provider

1. **[Overview](./oidc-provider/overview.md)** - Architecture and concepts
2. **[OIDC Endpoints](./oidc-provider/endpoints.md)** - Standard endpoints
3. **[Configuration](./oidc-provider/configuration.md)** - Server setup
4. **[Client Integration](./oidc-provider/client-integration.md)** - Client setup

---

## 💡 Usage Examples

### Web Application (Browser)

```typescript
// 1. Initiate OAuth
const response = await fetch('/api/auth/sign-in/oauth2', {
  method: 'POST',
  body: JSON.stringify({ providerId: 'keycloak' })
});

const { url } = await response.json();

// 2. Redirect to Keycloak
window.location.href = url;

// 3. Cookie automatically set and sent
// 4. Access protected routes
const profile = await fetch('/api/users/profile');
```

**→ [More Examples](./hybrid-auth/web-examples.md)**

---

### Mobile Application (React Native)

**Option A: Hybrid Auth**
```typescript
// Login with return_type=json
const url = oauthUrl + '&return_type=json';
const { jwt } = await fetch(url).then(r => r.json());

// Use JWT
await SecureStore.setItemAsync('jwt', jwt);
```

**Option B: Direct Keycloak**
```typescript
// Login directly to Keycloak
const authResult = await authorize({
  issuer: 'https://auth.azfirazka.com/realms/azfirazka',
  clientId: 'modular-monolith-api'
});

// Validate to BetterAuth
const { jwt } = await fetch('/api/auth/validate-keycloak-token', {
  method: 'POST',
  body: JSON.stringify({ access_token, id_token })
}).then(r => r.json());
```

**Option C: OIDC Provider**
```typescript
// Standard OIDC flow
const authResult = await authorize({
  issuer: 'http://localhost:3000',
  clientId: 'modular-monolith-mobile'
});

const jwt = authResult.accessToken;
```

**→ [More Examples](./hybrid-auth/mobile-examples.md)**
**→ [Direct Keycloak Examples](./direct-keycloak/examples.md)**
**→ [OIDC Examples](./oidc-provider/client-integration.md)**

---

## 🔒 Security

### Best Practices

1. **Always use HTTPS** in production
2. **Validate tokens** on every request
3. **Store tokens securely** (SecureStore, Keychain)
4. **Implement token expiration**
5. **Use HTTP-only cookies** for web
6. **Set proper CORS** configuration

### Common Issues

- **Cookie not sent**: Check CORS credentials, domain, and SameSite
- **JWT validation failed**: Verify expiration, Authorization header format
- **OAuth callback errors**: Check redirect_uri, state parameter

**→ [Security Details](./hybrid-auth/security.md)**

---

## 🧪 Testing

### Test Cookie Auth

```bash
# 1. Initiate OAuth
curl -X POST http://localhost:3000/api/auth/sign-in/oauth2 \
  -d '{"providerId":"keycloak"}'

# 2. Copy URL to browser, login

# 3. Test with cookie
curl http://localhost:3000/dashboard \
  -H 'Cookie: better-auth.session_token=<token>'
```

### Test JWT Auth

```bash
# 1. Login with return_type=json
# 2. Get JWT from response

# 3. Test with JWT
curl http://localhost:3000/api/users/profile \
  -H 'Authorization: Bearer <jwt>'
```

---

## 📚 Additional Resources

- [API Documentation](../API_REFERENCE.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Troubleshooting](./troubleshooting.md)

---

## 🤝 Contributing

For authentication-related questions or improvements, please open an issue.

---

**Last Updated:** 2025-01-20

**Version:** 1.0.0
