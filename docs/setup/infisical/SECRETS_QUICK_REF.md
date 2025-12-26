# Infisical Secrets Quick Reference

Quick reference for all environment variables to store in Infisical.

## File Structure

```
├── .env.example           # Only Infisical connection config (commit to git)
├── .env.example.all       # All environment variables (commit to git, for reference)
└── .env                   # Your local overrides (NEVER commit)
```

## Setup in 3 Steps

### 1. Configure Infisical Connection

Edit [.env.example](.env.example):

```bash
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.yourdomain.com
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENVIRONMENT=dev
```

### 2. Copy Secrets to Infisical

Copy these to your Infisical dashboard → Project → Environments → dev → Secrets

### 3. Run with Infisical

```bash
infisical run -- bun run dev:api
infisical run -- docker-compose up
```

## All Required Secrets (23 variables)

### Database (3 variables)
```
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
```

### Redis (2 variables)
```
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
```

### BetterAuth (2 variables)
```
BETTER_AUTH_SECRET=min-32-characters-random-string
BETTER_AUTH_URL=http://localhost:3000
```

### Keycloak OAuth (6 variables)
```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=modular-features
KEYCLOAK_ISSUER=http://localhost:8080/realms/modular-features
KEYCLOAK_CLIENT_ID=modular-features-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3000/oauth/callback/keycloak
```

### RS256 JWT (3 variables) - GENERATED

**Generate using:** `bun run auth:generate-keys`

```
JWT_RS256_PRIVATE_KEY_BASE64=<from keys/private_base64.txt>
JWT_RS256_PUBLIC_KEY_BASE64=<from keys/public_base64.txt>
JWT_RS256_KEY_ID=<from keys/key_id.txt>
```

### Feature Flags (3 variables)
```
ENABLE_RS256_TOKENS=true
ENABLE_KEYCLOAK=true
ENABLE_EMAIL_PASSWORD_AUTH=false
```

### Application (4 variables)
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
API_VERSION=v1
```

## Optional Secrets

### Email (SendGrid)
```
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Modular Features
```

### SMS (Twilio)
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Push Notifications (Firebase)
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### Additional OAuth (Google/GitHub)
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Payment Providers
```
POLAR_API_KEY=
MIDTRANS_SERVER_KEY=
XENDIT_SECRET_KEY=
```

### Monitoring
```
SENTRY_DSN=
LOG_LEVEL=debug
```

## Quick Commands

### Generate RSA Keys
```bash
bun run auth:generate-keys
# Output: keys/ folder with Base64 values for Infisical
```

### Copy to Infisical (After Key Generation)
```bash
# View keys
cat keys/private_base64.txt
cat keys/public_base64.txt
cat keys/key_id.txt

# Copy each to Infisical dashboard:
# JWT_RS256_PRIVATE_KEY_BASE64 = <content of private_base64.txt>
# JWT_RS256_PUBLIC_KEY_BASE64 = <content of public_base64.txt>
# JWT_RS256_KEY_ID = <content of key_id.txt>
```

### Test with Infisical
```bash
# Login
infisical login

# Test environment variables loaded
infisical run -- env | grep -E "(POSTGRES|REDIS|KEYCLOAK|JWT)"

# Start services
infisical run -- docker-compose up

# Start API
infisical run -- bun run dev:api
```

### Verify Setup
```bash
# Check API health
curl http://localhost:3000/api/auth/health

# Check JWKS (verify RSA keys)
curl http://localhost:3000/api/auth/.well-known/jwks.json
```

## Environment-Specific Values

### Development (dev)
```
NODE_ENV=development
BETTER_AUTH_URL=http://localhost:3000
KEYCLOAK_URL=http://localhost:8080
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/modular_features
```

### Staging (staging)
```
NODE_ENV=staging
BETTER_AUTH_URL=https://staging-api.yourdomain.com
KEYCLOAK_URL=https://staging-keycloak.yourdomain.com
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/modular_features?sslmode=require
```

### Production (prod)
```
NODE_ENV=production
BETTER_AUTH_URL=https://api.yourdomain.com
KEYCLOAK_URL=https://keycloak.yourdomain.com
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/modular_features?sslmode=require
```

## Complete Reference

For complete list of ALL environment variables, see:
- **[.env.example.all](.env.example.all)** - All variables (for reference)

For detailed setup guide, see:
- **[INFISICAL_SETUP.md](INFISICAL_SETUP.md)** - Complete guide

## Summary

**Total Required:** 23 environment variables
**Total Optional:** 15+ environment variables

**Must Generate:** 3 RSA keys (using `bun run auth:generate-keys`)

**Files to Commit:**
- ✅ .env.example (Infisical config only)
- ✅ .env.example.all (All variables reference)
- ✅ .gitignore (keys/, .env)

**Files to NEVER Commit:**
- ❌ .env (local overrides)
- ❌ keys/ (RSA keys)
- ❌ Any actual secrets
