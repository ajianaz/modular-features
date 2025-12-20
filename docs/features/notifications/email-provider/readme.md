# Email Provider

Email notification provider with support for multiple email services (AWS SES, Tencent Cloud, etc.).

## 📋 Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [Configuration](#configuration)
- [Usage](#usage)
- [Templates](#templates)

---

## 🎯 Overview

The email provider provides a unified interface for sending transactional and marketing emails through multiple providers.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Notification Service                        │
│                  sendEmail()                             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Email Provider                             │
│         - Provider selection                            │
│         - Template rendering                            │
│         - Provider routing                              │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│     AWS      │ │   Tencent    │ │     SendGrid │
│     SES      │ │    Cloud     │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📧 Supported Providers

### AWS SES

**Best for:** High volume, cost-effective

**Features:**
- ✅ Low cost
- ✅ High deliverability
- ✅ Sandbox mode
- ✅ Statistics tracking

**Configuration:**
```typescript
{
  provider: 'ses',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}
```

### Tencent Cloud

**Best for:** China market

**Features:**
- ✅ China delivery
- ✅ API support
- ✅ Statistics

**Configuration:**
```typescript
{
  provider: 'tencent',
  secretId: process.env.TENCENT_SECRET_ID,
  secretKey: process.env.TENCENT_SECRET_KEY,
  region: 'ap-guangzhou'
}
```

---

## ⚙️ Configuration

### Basic Setup

```typescript
// notifications.config.ts
export const emailConfig = {
  defaultProvider: 'ses',
  providers: {
    ses: {
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    tencent: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
      region: 'ap-guangzhou'
    }
  },
  templates: {
    welcome: './templates/welcome.html',
    resetPassword: './templates/reset-password.html'
  }
};
```

---

## 💻 Usage

### Send Simple Email

```typescript
await notificationService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our app</h1>'
});
```

### Send with Template

```typescript
await notificationService.sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: {
    name: 'User Name',
    verificationUrl: 'https://example.com/verify/123'
  }
});
```

### Send with Attachments

```typescript
await notificationService.sendEmail({
  to: 'user@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find attached invoice</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: invoiceBuffer,
      contentType: 'application/pdf'
    }
  ]
});
```

### Send to Multiple Recipients

```typescript
await notificationService.sendEmail({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Announcement',
  html: '<p>Important announcement</p>'
});
```

---

## 📄 Templates

### Template Structure

```html
<!-- templates/welcome.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome</title>
</head>
<body>
  <h1>Welcome, {{name}}!</h1>
  <p>Thank you for joining us.</p>
  <a href="{{verificationUrl}}">Verify Email</a>
</body>
</html>
```

### Template Variables

Available variables in templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | User name | John Doe |
| `{{email}}` | User email | john@example.com |
| `{{verificationUrl}}` | Verification URL | https://... |
| `{{resetPasswordUrl}}` | Reset password URL | https://... |

---

## 🧪 Testing

### Unit Tests

```typescript
describe('EmailProvider', () => {
  it('should send email via SES', async () => {
    await emailProvider.send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    });
    
    expect(mockSES.sendEmail).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Email Integration', () => {
  it('should send real email in staging', async () => {
    const result = await notificationService.sendEmail({
      to: 'staging@example.com',
      subject: 'Staging Test',
      html: '<p>Test email</p>'
    });
    
    expect(result.success).toBe(true);
  });
});
```

---

## 📊 Monitoring

### Track Email Status

```typescript
// Get email delivery status
const status = await emailProvider.getStatus(messageId);

console.log({
  delivered: status.delivered,
  opened: status.opened,
  clicked: status.clicked,
  bounced: status.bounced
});
```

### AWS SES Statistics

```bash
# Get SES statistics
aws ses get-send-statistics
```

---

## 🔒 Security

### Best Practices

1. **Verify Recipients**
   ```typescript
   // Validate email before sending
   if (!isValidEmail(email)) {
     throw new Error('Invalid email address');
   }
   ```

2. **Rate Limiting**
   ```typescript
   // Limit emails per recipient
   await rateLimiter.check(email, 'email', 10, '1h');
   ```

3. **Sandbox Mode**
   ```typescript
   // Enable sandbox for testing
   config.ses.sandbox = true;
   ```

---

## 📖 Related Documentation

- [Notifications Overview](../readme.md)
- [SMS Provider](../sms-provider/)
- [Planning Documents](../../../planning/)

---

**Last Updated:** 2025-01-20
