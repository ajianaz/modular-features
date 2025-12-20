# Users Feature

Complete guide to user management and profiles.

## 📋 Table of Contents

- [Overview](#overview)
- [User Management](#user-management)
- [Profiles](#profiles)
- [Documentation](#documentation)

---

## 🎯 Overview

The users feature provides comprehensive user management, authentication integration, and profile management.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Users Feature                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐  │
│  │  User Service                                     │  │
│  │  - User CRUD                                      │  │
│  │  - Authentication integration                     │  │
│  │  - Authorization                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Profile Service                                  │  │
│  │  - Profile management                            │  │
│  │  - Preferences                                   │  │
│  │  - Settings                                      │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer                             │
│         - Users table                                   │
│         - Profiles table                                │
│         - Preferences table                             │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 User Management

### Features

- User registration and onboarding
- User authentication (via [Authentication Feature](../authentication/))
- User authorization and roles
- User deactivation and deletion

**Quick Start:**
```typescript
// Create user
const user = await userService.create({
  email: 'user@example.com',
  name: 'User Name',
  password: 'secure_password'
});

// Update user
await userService.update(userId, {
  name: 'Updated Name'
});

// Deactivate user
await userService.deactivate(userId);
```

---

## 👤 Profiles

Documentation: [→ Profiles](./profiles/)

### Features

- Extended user profiles
- Custom profile fields
- Profile visibility settings
- Profile picture management

**Quick Start:**
```typescript
// Get profile
const profile = await profileService.getByUserId(userId);

// Update profile
await profileService.update(userId, {
  bio: 'Software Developer',
  location: 'Jakarta',
  website: 'https://example.com'
});
```

---

## 📖 Documentation

### User Management

- **[User CRUD](./user-management/crud.md)** - User operations
- **[Authorization](./user-management/authorization.md)** - Roles and permissions

### Profiles

- **[Profile Fields](./profiles/fields.md)** - Available profile fields
- **[Custom Fields](./profiles/custom-fields.md)** - Adding custom fields
- **[Profile Examples](./profiles/examples.md)** - Usage examples

### API Reference

- **[Users API](./api.md)** - REST API endpoints
- **[Typescript Types](./types.md)** - TypeScript definitions

---

## 🚀 Getting Started

### Installation

```bash
# Install users package
pnpm add @modular-monolith/users
```

### Setup

```typescript
// users.config.ts
export const usersConfig = {
  profiles: {
    enabled: true,
    customFields: [
      { name: 'bio', type: 'text' },
      { name: 'location', type: 'text' },
      { name: 'website', type: 'url' }
    ]
  },
  roles: {
    enabled: true,
    defaultRole: 'user'
  }
};
```

---

## 📚 Related Documentation

- [Authentication Feature](../authentication/)
- [Planning Documents](../../planning/)
- [Development Guide](../../development/)

---

**Last Updated:** 2025-01-20
