# Infisical Secrets Management Setup Guide

Complete guide for integrating Infisical secrets management into the Modular Monolith project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infisical Configuration](#infisical-configuration)
- [Project Setup](#project-setup)
- [Importing Secrets](#importing-secrets)
- [Machine Identity Setup](#machine-identity-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Infisical is an open-source secrets management platform that provides end-to-end encryption for environment variables and API keys.

**Key Benefits:**
- ✅ Secrets never stored in code or git
- ✅ Automatic secret rotation
- ✅ Audit trail for all secret access
- ✅ Environment-specific secrets (dev/staging/prod)
- ✅ Centralized secret management

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│         Modular Monolith Application                    │
│                                                         │
│  packages/shared/src/config/                           │
│    ├── config.ts (existing)                            │
│    ├── infisical.ts (NEW - SDK client)                 │
│    └── index.ts                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Infisical (Self-Hosted)                    │
│                                                         │
│  Project: modular-monolith-api                          │
│  ┌─────────────┬──────────────┬──────────────┐        │
│  │  dev        │  staging     │  production   │        │
│  │  env        │  env         │  env         │        │
│  └─────────────┴──────────────┴──────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

### Required

1. **Infisical Instance** (Self-hosted or Cloud)
   - Self-hosted: Already running on your server
   - Cloud: https://app.infisical.com

2. **Node.js 18+** with npm/bun

3. **Project Access** to Infisical instance

### Files Created

```
packages/shared/src/config/infisical.ts  <- SDK integration
packages/shared/src/config/config.ts     <- Updated with async loadConfig()
```

---

## 🚀 Quick Start

### Step 1: Install SDK

```bash
# From project root
cd packages/shared
npm install @infisical/sdk
```

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# Enable Infisical
USE_INFISICAL=true

# Your self-hosted Infisical URL
INFISICAL_SITE_URL=https://your-infisical-server.com

# Machine Identity credentials (from Infisical UI)
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret

# Project ID (from Infisical UI)
INFISICAL_PROJECT_ID=your-project-id

# Environment
INFISICAL_ENVIRONMENT=dev
```

### Step 3: Test Connection

```bash
# Start the application
npm run dev

# Check logs for:
# [INFISICAL] ✅ Successfully initialized
# [CONFIG] ✅ Loaded X secrets from Infisical
```

---

## 🔧 Infisical Configuration

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `USE_INFISICAL` | Enable/disable Infisical | `true`/`false` | Yes |
| `INFISICAL_SITE_URL` | Your Infisical instance URL | `https://infisical.example.com` | Yes |
| `INFISICAL_CLIENT_ID` | Universal Auth client ID | `xxx-xxx-xxx` | Yes |
| `INFISICAL_CLIENT_SECRET` | Universal Auth client secret | `secret-xxx` | Yes |
| `INFISICAL_PROJECT_ID` | Project ID in Infisical | `proj_xxx` | Yes |
| `INFISICAL_ENVIRONMENT` | Environment to use | `dev`/`staging`/`prod` | Optional |
| `INFISICAL_CACHE_TTL` | Cache duration (ms) | `300000` (5 min) | Optional |

### Fallback Behavior

When `USE_INFISICAL=false` or Infisical is unreachable:
- ✅ Automatically falls back to `.env` file
- ✅ No application downtime
- ✅ Clear logging of fallback mode

---

## 🏗️ Project Setup

### 1. Create Project in Infisical

**Via Infisical UI:**

1. Login to your Infisical instance
2. Click **"New Project"**
3. Enter project details:
   - **Name**: `modular-monolith-api`
   - **Description**: `Modular Monolith API Secrets`
4. Click **"Create Project"**

### 2. Create Environments

Create 3 environments in the project:

```
┌─────────────────────────────────────┐
│  Project: modular-monolith-api      │
│                                     │
│  📦 dev      (Development)          │
│  📦 staging  (Staging/Pre-prod)     │
│  📦 prod     (Production)           │
└─────────────────────────────────────┘
```

### 3. Get Project ID

From the project settings page, copy the **Project ID**:
```
proj_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📥 Importing Secrets

### Secrets to Import

Copy these secrets from your current `.env` to Infisical:

#### **Database Secrets**
```
POSTGRES_PASSWORD
```

#### **Redis Secrets**
```
REDIS_PASSWORD
```

#### **Authentication Secrets**
```
BETTER_AUTH_SECRET
KEYCLOAK_CLIENT_SECRET
JWT_SECRET
SESSION_SECRET
CSRF_SECRET
```

#### **Payment Provider Secrets**
```
POLAR_API_KEY
POLAR_WEBHOOK_SECRET
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
XENDIT_SECRET_KEY
COINBASE_COMMERCE_API_KEY
COINBASE_COMMERCE_WEBHOOK_SECRET
```

#### **Notification Secrets**
```
SENDGRID_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
FIREBASE_PRIVATE_KEY
```

#### **Monitoring Secrets**
```
SENTRY_DSN
```

#### **Storage Secrets**
```
MINIO_ROOT_PASSWORD
MINIO_SECRET_KEY
```

### Import via UI

**For each environment:**

1. Select environment (dev/staging/prod)
2. Click **"Import Secrets"**
3. Choose **"From .env file"**
4. Paste secrets from your `.env`
5. Click **"Import"**

### Import via CLI

```bash
# Install Infisical CLI
npm install -g infisical

# Login to your Infisical instance
infisical login --site-url=https://your-infisical-server.com

# Import secrets
infisical import --env=dev --path=.env
```

---

## 🔐 Machine Identity Setup

Machine Identity (Universal Auth) allows the application to authenticate with Infisical without user credentials.

### Create Machine Identity

**Via Infisical UI:**

1. Go to **Settings** → **Machine Identities**
2. Click **"Create Identity"**
3. Configure:
   - **Name**: `modular-monolith-api`
   - **Description**: `Service account for API`
   - **Projects**: Select `modular-monolith-api`
   - **Environments**: Select `dev`, `staging`, `prod`
   - **Permissions**: `Read` (for fetching secrets)
4. Click **"Create"**

### Get Credentials

After creating, you'll receive:
```
Client ID: universal_xxxxxxxxxxxxx
Client Secret: secret.xxxxxxxxxxxxx
```

**Important:** Store these securely in your `.env` file. The secret is only shown once!

---

## 💻 Local Development

### Development Workflow

**Option 1: Use Infisical (Recommended)**

```bash
# .env file
USE_INFISICAL=true
INFISICAL_SITE_URL=https://your-infisical-server.com
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENVIRONMENT=dev

# Start application
npm run dev
```

**Option 2: Use Local .env (For Testing)**

```bash
# .env file
USE_INFISICAL=false

# All secrets remain in .env
# Start application normally
npm run dev
```

### Testing Infisical Integration

```typescript
// Test file: test-infisical.ts
import { fetchSecret, isInfisicalEnabled, getInfisicalStatus } from '@modular-monolith/shared/config/infisical';

async function testInfisical() {
  // Check status
  const status = getInfisicalStatus();
  console.log('Infisical Status:', status);

  // Check if enabled
  if (isInfisicalEnabled()) {
    // Fetch a secret
    const jwtSecret = await fetchSecret('JWT_SECRET');
    console.log('JWT Secret fetched:', jwtSecret ? '✅' : '❌');
  } else {
    console.log('Infisical is disabled, using .env');
  }
}

testInfisical();
```

---

## 🚀 Production Deployment

### Environment-Specific Configuration

**Development (.env.dev):**
```bash
USE_INFISICAL=true
INFISICAL_ENVIRONMENT=dev
INFISICAL_PROJECT_ID=proj-dev-xxx
```

**Staging (.env.staging):**
```bash
USE_INFISICAL=true
INFISICAL_ENVIRONMENT=staging
INFISICAL_PROJECT_ID=proj-staging-xxx
```

**Production (.env.production):**
```bash
USE_INFISICAL=true
INFISICAL_ENVIRONMENT=prod
INFISICAL_PROJECT_ID=proj-prod-xxx
```

### Docker Deployment

**docker-compose.yml:**
```yaml
services:
  api:
    image: modular-monolith-api:latest
    environment:
      - USE_INFISICAL=true
      - INFISICAL_SITE_URL=${INFISICAL_SITE_URL}
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_ENVIRONMENT=${INFISICAL_ENVIRONMENT}
    env_file:
      - .env.production
```

### Kubernetes Deployment

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: infisical-config
data:
  USE_INFISICAL: "true"
  INFISICAL_SITE_URL: "https://your-infisical-server.com"
  INFISICAL_ENVIRONMENT: "prod"
```

**Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: infisical-credentials
type: Opaque
stringData:
  INFISICAL_CLIENT_ID: "your-client-id"
  INFISICAL_CLIENT_SECRET: "your-client-secret"
  INFISICAL_PROJECT_ID: "your-project-id"
```

---

## 🔍 Troubleshooting

### Issue: "Infisical authentication failed"

**Solution:**
1. Verify `INFISICAL_CLIENT_ID` and `INFISICAL_CLIENT_SECRET` are correct
2. Check Machine Identity has access to the project
3. Ensure Machine Identity is not expired
4. Verify `INFISICAL_SITE_URL` is accessible

### Issue: "Secret not found in Infisical"

**Solution:**
1. Check the secret exists in the selected environment
2. Verify secret key name matches exactly (case-sensitive)
3. Check Project ID is correct
4. Review Infisical logs for access issues

### Issue: "Falling back to environment variables"

**Solution:**
This is expected behavior when:
- `USE_INFISICAL=false`
- Infisical is unreachable
- Invalid credentials

The application will continue using `.env` file.

### Issue: "Connection timeout"

**Solution:**
1. Verify Infisical server is running
2. Check network connectivity
3. Verify `INFISICAL_SITE_URL` is correct
4. Check firewall/security group rules

### Debug Logging

Enable detailed logging:

```typescript
// In your application entry point
process.env.LOG_LEVEL = 'debug';

// Check Infisical status
import { getInfisicalStatus } from '@modular-monolith/shared/config/infisical';
console.log('Infisical Status:', getInfisicalStatus());
```

---

## 📚 Additional Resources

### Official Documentation
- [Infisical Official Docs](https://infisical.com/docs)
- [Infisical Node.js SDK](https://infisical.com/docs/sdks/languages/node)
- [Universal Auth Guide](https://infisical.com/docs/authentication/universal-auth)

### Project Documentation
- [Configuration Guide](../README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Best Practices](./SECURITY.md)

---

## 📝 Best Practices

### 1. Secret Rotation
- Rotate secrets regularly (recommended: 90 days)
- Use Infisical's built-in rotation features
- Update applications after rotation

### 2. Access Control
- Create separate Machine Identities per environment
- Use minimum required permissions
- Monitor access logs in Infisical

### 3. Secret Naming
- Use consistent naming (UPPERCASE)
- Group related secrets with prefixes:
  - `DB_*` for database
  - `KEYCLOAK_*` for Keycloak
  - `STRIPE_*` for Stripe

### 4. Environment Separation
- Never share secrets between environments
- Use unique values for dev/staging/prod
- Test secret promotion from dev → staging → prod

### 5. Backup & Recovery
- Enable Infisical backups
- Document emergency access procedures
- Store backup credentials securely

---

## 🔄 Migration Checklist

- [ ] Install `@infisical/sdk` package
- [ ] Create Infisical project
- [ ] Create dev/staging/prod environments
- [ ] Import secrets from `.env`
- [ ] Create Machine Identity
- [ ] Configure `.env` with Infisical credentials
- [ ] Test in development environment
- [ ] Deploy to staging and verify
- [ ] Deploy to production
- [ ] Remove sensitive secrets from `.env`
- [ ] Add `.env` to `.gitignore`
- [ ] Update team documentation

---

**Last Updated:** 2025-01-20

**Version:** 1.0.0
