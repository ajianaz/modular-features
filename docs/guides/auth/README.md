# Authentication Guides

Complete guides for authentication implementation using Better Auth and Keycloak.

## 📚 Available Guides

### RS256 JWT Implementation
**[RS256 Implementation Guide](./rs256-implementation.md)**
- RSA key generation
- RS256 token configuration
- Better Auth setup
- Keycloak integration
- Testing and verification

---

## 🎯 Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ OAuth2 / OIDC
       ↓
┌─────────────────┐
│    Keycloak     │ ← Source of Truth
│  (OIDC Provider) │
└────────┬────────┘
         │
         │ JWT Tokens (RS256)
         ↓
┌─────────────────┐
│   Better Auth   │ ← Auth Library
│  (Middleware)    │
└────────┬────────┘
         │
         │ Session Management
         ↓
┌─────────────────┐
│   Application   │
│   (Hono API)     │
└─────────────────┘
```

---

## 🔐 Key Concepts

### Token Types

| Type | Algorithm | Usage | Location |
|------|-----------|-------|----------|
| **RS256** | RSA SHA-256 | Access tokens | Better Auth + Keycloak |
| **HS256** | HMAC SHA-256 | Session tokens | Better Auth internal |

### Authentication Flow

1. **Login**
   - User redirected to Keycloak
   - Keycloak authenticates user
   - Keycloak returns RS256 JWT

2. **Token Validation**
   - Better Auth validates RS256 JWT
   - Extracts user claims (sub, roles, etc.)
   - Creates session in database

3. **Session Management**
   - Better Auth manages session lifecycle
   - Issues HS256 session tokens
   - Handles refresh tokens

---

## 🔧 Configuration

### Environment Variables
```bash
# Keycloak Configuration
KEYCLOAK_URL=https://auth.azfirazka.com
KEYCLOAK_REALM=azfirazka
KEYCLOAK_ISSUER=https://auth.azfirazka.com/realms/azfirazka
KEYCLOAK_CLIENT_ID=modular-monolith-api
KEYCLOAK_CLIENT_SECRET=your-secret-here

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000/api/auth
ENABLE_KEYCLOAK=true
ENABLE_RS256_TOKENS=true

# RSA Keys (for RS256)
JWT_RS256_PRIVATE_KEY_BASE64=your-private-key-base64
JWT_RS256_PUBLIC_KEY_BASE64=your-public-key-base64
```

---

## 📋 Quick Start

### 1. Generate RSA Keys
```bash
# From RS256 Implementation Guide
mkdir -p keys
cd keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
base64 -w 0 private.pem > private_base64.txt
base64 -w 0 public.pem > public_base64.txt
```

### 2. Configure Environment
```bash
# Add keys to .env
JWT_RS256_PRIVATE_KEY_BASE64=$(cat private_base64.txt)
JWT_RS256_PUBLIC_KEY_BASE64=$(cat public_base64.txt)
```

### 3. Test Authentication
```bash
# Start application
docker-compose up -d

# Test login endpoint
curl http://localhost:3000/api/auth/oauth/keycloak
```

---

## 🔍 Troubleshooting

### RSA Keys Not Found
```
Error: RS256 keys not configured
```

**Solution:**
```bash
# Generate keys
node scripts/generate-rsa-keys.js

# Add to .env
JWT_RS256_PRIVATE_KEY_BASE64=...
JWT_RS256_PUBLIC_KEY_BASE64=...
```

### Keycloak Connection Failed
```
Error: Failed to fetch Keycloak discovery endpoint
```

**Solution:**
- Verify KEYCLOAK_URL is correct
- Check Keycloak is running
- Verify network connectivity

### Token Validation Failed
```
Error: Invalid JWT signature
```

**Solution:**
- Verify RSA keys match between Keycloak and application
- Check JWT_RS256_PUBLIC_KEY_BASE64 is correct
- Ensure Keycloak is using RS256 algorithm

---

## 📚 Additional Resources

### Better Auth Documentation
- [Better Auth Docs](https://www.better-auth.com)
- [OAuth Provider Guide](https://www.better-auth.com/docs/providers/oauth)

### Keycloak Documentation
- [Keycloak Docs](https://www.keycloak.org/documentation)
- [OIDC Guide](https://www.keycloak.org/docs/latest/securing_apps/index.html)

### Internal Guides
- [Development Guide](../development_guide.md)
- [Project Structure](../project_structure.md)

---

## 🚧 Status

- ✅ RS256 Implementation: Complete
- ✅ Keycloak Integration: Complete
- ✅ Better Auth Setup: Complete
- ✅ Session Management: Complete
- ✅ Token Refresh: Complete

---

**Last Updated:** 2025-01-20
**Status:** ✅ Production Ready
