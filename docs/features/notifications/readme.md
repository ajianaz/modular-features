# Notifications Feature

Complete guide to notification system implementation.

## 📋 Table of Contents

- [Overview](#overview)
- [Providers](#providers)
- [Documentation](#documentation)

---

## 🎯 Overview

The notification system provides a unified interface for sending notifications through multiple providers (email, SMS, push, etc.).

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│         - User Service                                 │
│         - Order Service                                 │
│         - Notification Service                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Notification Service                           │
│         - Queue notifications                           │
│         - Route to provider                            │
│         - Retry failed                                 │
│         - Track status                                 │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Email       │ │     SMS      │ │    Push      │
│  Provider    │ │   Provider   │ │   Provider   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📧 Providers

### Email Provider

Documentation: [→ Email Provider](./email-provider/)

**Features:**
- Multiple email providers (SES, Tencent, etc.)
- Email templates
- Attachment support
- Tracking and analytics

**Quick Start:**
```typescript
await notificationService.sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'User' }
});
```

---

### SMS Provider

Documentation: [→ SMS Provider](./sms-provider/)

**Features:**
- Multiple SMS providers
- OTP support
- Bulk SMS
- Delivery tracking

**Quick Start:**
```typescript
await notificationService.sendSMS({
  to: '+62812345678',
  message: 'Your OTP is 123456'
});
```

---

## 📖 Documentation

### Implementation

- **[Email Provider Hierarchy](./email-provider/hierarchy.md)** - Email provider architecture
- **[SMS Provider Setup](./sms-provider/setup.md)** - SMS provider configuration

### API Reference

- **[Notification API](./api.md)** - REST API endpoints
- **[Typescript SDK](./sdk.md)** - Client library

### Examples

- **[Email Examples](./email-provider/examples.md)** - Email usage examples
- **[SMS Examples](./sms-provider/examples.md)** - SMS usage examples

---

## 🚀 Getting Started

### Installation

```bash
# Install notification package
pnpm add @modular-monolith/notifications
```

### Configuration

```typescript
// notifications.config.ts
export const notificationConfig = {
  email: {
    provider: 'ses',
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  sms: {
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  }
};
```

---

## 📚 Related Documentation

- [Planning Documents](../../planning/)
- [Development Guide](../../development/)
- [Authentication Feature](../authentication/)

---

**Last Updated:** 2025-01-20
