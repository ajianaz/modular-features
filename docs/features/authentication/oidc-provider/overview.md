# OIDC Provider - Overview

## 📋 Table of Contents

- [What is OIDC Provider](#what-is-oidc-provider)
- [Architecture](#architecture)
- [Flow](#flow)
- [Benefits](#benefits)
- [When to Use](#when-to-use)

---

## 🎯 What is OIDC Provider?

BetterAuth can act as an **OIDC Provider** (Authentication Gateway) with Keycloak as the upstream Identity Provider.

### Concept

BetterAuth exposes **standard OIDC endpoints** while delegating actual authentication to Keycloak:

```
Client sees: BetterAuth OIDC Provider
Reality: Keycloak doing authentication
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Client (Mobile / SPA)                      │
│         - Standard OIDC flow                           │
│         - Only knows BetterAuth endpoints              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         BetterAuth OIDC Provider                       │
│                                                           │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Standard OIDC Endpoints:                        │  │
│  │  - GET /oidc/authorize                           │  │
│  │  - POST /oidc/token                              │  │
│  │  - GET /oidc/jwks                                │  │
│  │  - GET /oidc/userinfo                            │  │
│  │  - GET /.well-known/openid-configuration        │  │
│  └─────────────────────────────────────────────────┘  │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Keycloak Integration (Upstream IdP):            │  │
│  │  - Delegates to Keycloak                        │  │
│  │  - Validates Keycloak tokens                    │  │
│  │  - Generates BetterAuth JWT                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Keycloak (IdP)                             │
│         - Actual authentication                         │
│         - User database                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow

### Complete OIDC Flow

```
1. Client → GET /oidc/authorize
          └─ BetterAuth redirects to Keycloak

2. User → Keycloak login
          └─ Authenticates

3. Keycloak → BetterAuth callback
          └─ With authorization code

4. BetterAuth → POST /oidc/token (Keycloak)
          └─ Exchanges code for tokens

5. BetterAuth → Validates Keycloak tokens
          └─ Creates BetterAuth session

6. BetterAuth → Client (with BetterAuth JWT)
          └─ Standard OIDC response
```

---

## ✨ Benefits

### 1. Abstraction Layer

Client doesn't need to know about Keycloak:
- Switch IdP without client changes
- Add multiple providers
- Unified authentication

### 2. Standard OIDC

Use standard OIDC libraries:
- No custom OAuth handling
- Auto-discovery
- Standard token responses

### 3. Multi-Provider Support

Add other providers easily:
```
Client → BetterAuth OIDC
         ├── Keycloak
         ├── Google
         ├── GitHub
         └── Microsoft
```

### 4. Custom JWT Claims

Add custom claims to BetterAuth JWT:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "custom_field": "custom_value",
  "app_data": {...}
}
```

---

## 🎯 When to Use

### ✅ Perfect For:

- **Enterprise applications** requiring OIDC standard
- **Multi-provider authentication** abstraction
- **Need custom JWT claims**
- **Unified authentication gateway**

### ❌ Not Ideal For:

- **Simple apps** (use direct integration)
- **Single provider only** (may be overkill)
- **Don't need OIDC standard**

---

## 📊 Comparison

| Feature | OIDC Provider | Direct Integration |
|---------|--------------|-------------------|
| **Standard OIDC** | ✅ Yes | ⚠️ Partial |
| **Abstraction** | ✅ High | ❌ Low |
| **Multi-Provider** | ✅ Easy | ⚠️ Complex |
| **Client Setup** | ⚠️ OIDC lib | ⚠️ OAuth lib |
| **Custom Claims** | ✅ Full control | ❌ Limited |

---

## 💡 Use Cases

### Use Case 1: Enterprise App

Multiple authentication providers:

```
┌─────────────────────────────────────────┐
│         BetterAuth OIDC Provider        │
│                                         │
│  ┌──────────┐  ┌──────────┐          │
│  │Keycloak  │  │ Google   │          │
│  └──────────┘  └──────────┘          │
│                                         │
│  ┌──────────┐  ┌──────────┐          │
│  │  GitHub  │  │Microsoft │          │
│  └──────────┘  └──────────┘          │
└─────────────────────────────────────────┘
          │
          ▼
    Client (any of the above)
```

### Use Case 2: Custom JWT Claims

Need application-specific data in JWT:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenant_id": "tenant-123",
  "permissions": ["read", "write"],
  "app_config": {...}
}
```

---

## 📖 Next Steps

- [OIDC Endpoints](./endpoints.md) - Available endpoints
- [Configuration](./configuration.md) - Server setup
- [Client Integration](./client-integration.md) - Client examples

---

**Last Updated:** 2025-01-20
