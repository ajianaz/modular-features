# 🚀 Hybrid Better Auth + Keycloak - Quick Start

Fast setup guide for hybrid authentication (Better Auth Gateway → Keycloak IdP)

---

## ⚡ Quick Setup (5 Minutes)

### 1. Environment Variables

```bash
# .env
BETTER_AUTH_URL=http://localhost:3000/api/auth
KEYCLOAK_URL=https://auth.azfirazka.com
KEYCLOAK_REALM=azfirazka
KEYCLOAK_ISSUER=https://auth.azfirazka.com/realms/azfirazka
KEYCLOAK_CLIENT_ID=modular-monolith-better-auth
KEYCLOAK_CLIENT_SECRET=your-secret-here
KEYCLOAK_REDIRECT_URI=http://localhost:3000/api/auth/oauth/callback/keycloak

ENABLE_KEYCLOAK=true
ENABLE_RS256_TOKENS=true
ENABLE_EMAIL_PASSWORD_AUTH=false
```

### 2. Start Application

```bash
docker-compose up -d
```

### 3. Test

```bash
# Health check
curl http://localhost:3000/api/auth/health

# JWKS
curl http://localhost:3000/.well-known/jwks.json
```

---

## 📱 Usage Examples

### Web App (Cookie)

```javascript
// Login
window.location.href = '/api/auth/signin';

// Get session
const res = await fetch('/api/auth/session');
const session = await res.json();
```

### API/Mobile (Token)

```javascript
// Get user with JWT
const res = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});
const user = await res.json();
```

---

## 📚 Full Documentation

- [Complete Testing Guide](./HYBRID_DEPLOYMENT_TESTING.md)
- [Architecture Overview](./HYBRID_BETTER_AUTH_KEYCLOAK.md)
- [Comparison with Other Approaches](./BETTER_AUTH_OIDC_COMPARISON.md)

---

**Status:** ✅ Ready to Use
