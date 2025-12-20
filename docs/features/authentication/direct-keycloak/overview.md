# Direct Keycloak Integration - Overview

## 📋 Table of Contents

- [What is Direct Keycloak Integration](#what-is-direct-keycloak-integration)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Benefits](#benefits)
- [When to Use](#when-to-use)

---

## 🎯 What is Direct Keycloak Integration?

Direct Keycloak Integration allows **clients to authenticate directly with Keycloak** (bypassing BetterAuth's OAuth flow) and then validate their tokens with BetterAuth.

### Key Difference

**Standard Flow (Via BetterAuth):**
```
Client → BetterAuth (OAuth) → Keycloak → BetterAuth → Client
```

**Direct Keycloak Flow:**
```
Client → Keycloak (OAuth) → Get Token → BetterAuth (validate) → Session
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Client (Mobile / SPA)                      │
│         - Uses native OAuth SDK                        │
│         - Direct to Keycloak                           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Keycloak (IdP)                             │
│         - Authenticate user                            │
│         - Generate tokens                              │
│         - Return to client                             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Client (with tokens)                       │
│         - Has access_token                             │
│         - Has id_token                                 │
│         - Has refresh_token                            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         POST /api/auth/validate-keycloak-token         │
│              BetterAuth                                 │
│         - Validate JWT signature                       │
│         - Extract user info                            │
│         - Create/update session                        │
│         - Generate BetterAuth JWT                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Client (BetterAuth JWT)                   │
│         - Store BetterAuth JWT                         │
│         - Use for API requests                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### Step-by-Step Flow

1. **Client initiates OAuth** directly to Keycloak
2. **User authenticates** at Keycloak
3. **Keycloak returns tokens** (access_token, id_token, refresh_token)
4. **Client sends tokens** to BetterAuth validation endpoint
5. **BetterAuth validates** Keycloak JWT signature
6. **BetterAuth creates session** and generates BetterAuth JWT
7. **Client uses BetterAuth JWT** for API requests

---

## ✨ Benefits

### 1. Native OAuth SDKs

Use platform-specific OAuth SDKs:
- **iOS**: AppAuth
- **Android**: AppAuth
- **React Native**: react-native-app-auth
- **Flutter**: flutter_appauth

### 2. Direct Keycloak Features

Access Keycloak-specific features:
- Groups
- Roles
- Custom attributes
- Advanced consent flows

### 3. Multi-App SSO

Multiple apps can share same Keycloak session:
- App A logs in
- App B already authenticated
- Single sign-on across apps

### 4. Token Management

Full control over Keycloak tokens:
- Access token (API access)
- Refresh token (get new tokens)
- ID token (user info)

---

## 🎯 When to Use

### ✅ Perfect For:

- **Multiple apps** using same Keycloak realm
- **Existing SSO** setup with Keycloak
- **Mobile apps** with native OAuth SDKs
- **Need Keycloak features** (groups, roles, etc.)

### ❌ Not Ideal For:

- **Simple single app** (use BetterAuth OAuth)
- **Don't need Keycloak-specific features**
- **Want simplified setup** (use BetterAuth OAuth)

---

## 📊 Comparison

| Feature | Direct Keycloak | Via BetterAuth |
|---------|----------------|----------------|
| **OAuth Integration** | Manual (SDK) | Built-in |
| **Token Management** | Client | Server |
| **Multi-App SSO** | ✅ Native | ⚠️ Manual |
| **Keycloak Features** | ✅ Full access | ⚠️ Limited |
| **Setup Complexity** | ⚠️ Medium | ✅ Low |
| **Flexibility** | ✅ High | ⚠️ Medium |

---

## 💡 Use Cases

### Use Case 1: Enterprise Mobile Apps

Multiple mobile apps sharing Keycloak SSO:

```
App A (HR) ──┐
App B (Finance) ──┼──→ Keycloak SSO ──→ BetterAuth (validate)
App C (IT) ──┘
```

### Use Case 2: Existing Keycloak Setup

Company already has Keycloak:

```
Legacy App ──┐
New Mobile App ──┼──→ Existing Keycloak ──→ BetterAuth (validate)
Web Portal ──┘
```

### Use Case 3: Advanced Keycloak Features

Need Keycloak groups and roles:

```
Mobile App ──→ Keycloak (with groups/roles) ──→ BetterAuth (sync groups/roles)
```

---

## 📖 Next Steps

- [Token Validation](./token-validation.md) - Validation endpoint
- [Client Integration](./client-integration.md) - Client setup
- [Examples](./examples.md) - Implementation examples

---

**Last Updated:** 2025-01-20
