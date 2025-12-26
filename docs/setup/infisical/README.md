# Infisical Secrets Management

Quick start guide for setting up Infisical self-hosted secrets management.

## 📖 Documentation Files

- **[SETUP.md](./SETUP.md)** - Complete setup guide (detailed)
- **[SECRETS_QUICK_REF.md](./SECRETS_QUICK_REF.md)** - All secrets reference
- **README.md** (this file) - Quick start guide

## ⚡ Quick Start (5 minutes)

### 1. Install Infisical CLI

Choose your package manager:

**Using npm:**
```bash
npm install -g @infisical/cli
```

**Using pnpm:**
```bash
pnpm add -g @infisical/cli
```

**Using bun:**
```bash
bun install -g @infisical/cli
```

**Using yarn:**
```bash
yarn global add @infisical/cli
```

Verify installation:
```bash
infisical --version
```

### 2. Configure Connection

Edit [.env.example](../../../.env.example) at project root:

```bash
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.yourdomain.com
INFISICAL_CLIENT_ID=your-client-id-here
INFISICAL_CLIENT_SECRET=your-client-secret-here
INFISICAL_PROJECT_ID=your-project-id-here
INFISICAL_ENVIRONMENT=dev
```

**Get credentials from:**
- Infisical UI → Settings → Machine Identities → Create Universal Auth

### 3. Login

```bash
infisical login --login-url https://infisical.yourdomain.com
```

### 4. Generate RSA Keys

```bash
bun run auth:generate-keys
```

Output files in `keys/`:
- `private_base64.txt` - Copy to Infisical
- `public_base64.txt` - Copy to Infisical
- `key_id.txt` - Copy to Infisical

### 5. Copy Secrets to Infisical Dashboard

Go to Infisical UI and add these environment variables:

#### Database (3)
```
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
```

#### Redis (2)
```
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
```

#### BetterAuth (2)
```
BETTER_AUTH_SECRET=min-32-characters-random-string
BETTER_AUTH_URL=http://localhost:3000
```

#### Keycloak (6)
```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=modular-features
KEYCLOAK_ISSUER=http://localhost:8080/realms/modular-features
KEYCLOAK_CLIENT_ID=modular-features-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3000/oauth/callback/keycloak
```

#### RS256 JWT (3) - From key generation
```
JWT_RS256_PRIVATE_KEY_BASE64=<from keys/private_base64.txt>
JWT_RS256_PUBLIC_KEY_BASE64=<from keys/public_base64.txt>
JWT_RS256_KEY_ID=<from keys/key_id.txt>
```

#### Feature Flags (3)
```
ENABLE_RS256_TOKENS=true
ENABLE_KEYCLOAK=true
ENABLE_EMAIL_PASSWORD_AUTH=false
```

#### Application (4)
```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
API_VERSION=v1
```

**See [SECRETS_QUICK_REF.md](./SECRETS_QUICK_REF.md) for complete list.**

### 6. Run with Infisical

```bash
# Start services
infisical run -- docker-compose up

# Start API
infisical run -- bun run dev:api

# Run migrations
infisical run -- bun run db:push
```

### 7. Verify

```bash
# Check health
curl http://localhost:3000/api/auth/health

# Check JWKS (verify RSA keys)
curl http://localhost:3000/api/auth/.well-known/jwks.json
```

## 🔄 Daily Workflow

### Development

```bash
# All secrets auto-injected from Infisical
infisical run -- bun run dev:api
```

### Testing

```bash
infisical run -- bun test
```

### Docker

```bash
infisical run -- docker-compose up
```

## 🌍 Environments

### Development
```bash
INFISICAL_ENVIRONMENT=dev
infisical run -- bun run dev:api
```

### Staging
```bash
INFISICAL_ENVIRONMENT=staging
infisical run --env=staging -- bun run start
```

### Production
```bash
INFISICAL_ENVIRONMENT=production
infisical run --env=production -- bun run start
```

## 📁 Project Files

After setup, your project structure:

```
modular-feature/
├── .env.example              # Infisical config (commit to git)
├── .env.example.all          # All variables reference (commit to git)
├── .env                      # Local overrides (NEVER commit)
├── keys/                     # RSA keys (NEVER commit, auto-generated)
│   ├── private.pem
│   ├── public.pem
│   ├── private_base64.txt    # For Infisical
│   ├── public_base64.txt     # For Infisical
│   └── key_id.txt            # For Infisical
└── scripts/
    └── generate-rsa-keys.js  # Key generation script
```

## 🔧 Troubleshooting

### Secrets Not Loading

```bash
# Check connection
infisical login

# Verify environment
echo $INFISICAL_ENVIRONMENT

# Test secrets
infisical run -- env | grep POSTGRES
```

### RSA Keys Not Working

```bash
# Check keys loaded
infisical run -- node -e "
console.log('KEYS LOADED:', !!process.env.JWT_RS256_PRIVATE_KEY_BASE64);
"

# Regenerate
bun run auth:generate-keys
```

### Docker Issues

```bash
# Use infisical run wrapper
infisical run -- docker-compose up

# Or check Docker has access
docker-compose config
```

## 📚 Full Documentation

- **[Complete Setup Guide](./SETUP.md)** - Detailed setup with all options
- **[Secrets Reference](./SECRETS_QUICK_REF.md)** - All environment variables
- **[Main Setup Docs](../README.md)** - Overall setup order

## 🔗 Related

- **[Project Root README](../../../README.md)** - Main project README
- **[.env.example](../../../.env.example)** - Infisical configuration
- **[.env.example.all](../../../.env.example.all)** - All variables reference
- **[Infisical Official Docs](https://infisical.com/docs)**

## ✅ Checklist

Before starting development:

- [ ] Infisical CLI installed
- [ ] Connection configured in .env.example
- [ ] Successfully logged in (`infisical login`)
- [ ] RSA keys generated
- [ ] All secrets added to Infisical dashboard
- [ ] Tested: `infisical run -- bun run dev:api`
- [ ] Verified: `curl http://localhost:3000/api/auth/health`

## 🎯 Next Steps

1. ✅ Complete Infisical setup
2. ➡️ [Database Setup](../database/README.md)
3. ➡️ [Authentication Setup](../authentication/README.md)
4. ➡️ [Development Guide](../development/README.md)
