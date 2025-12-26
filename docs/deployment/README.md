# Deployment Documentation

Complete guides for deploying Modular Features API across different environments.

## 📚 Documentation

### Quick Start

- **[Docker + Infisical Guide](./docker-with-infisical.md)** - Run Docker services with Infisical secrets management
  - Development setup
  - Staging deployment
  - Production deployment
  - Best practices
  - Quick reference cards

### Troubleshooting

- **[Docker + Infisical Troubleshooting](./DOCKER_TROUBLESHOOTING.md)** - Solutions to common issues
  - Environment variables problems
  - Docker Compose issues
  - Database connectivity
  - RSA keys configuration
  - Performance optimization
  - Network problems

## 🚀 Quick Start

### Development

```bash
# Start all services with Infisical
infisical run --env dev -- docker-compose up -d

# Check health
curl http://localhost:3000/api/auth/health

# View logs
docker-compose logs -f api
```

### Staging

```bash
# Deploy to staging
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d --build

# Verify
curl https://staging-api.yourdomain.com/api/auth/health
```

### Production

```bash
# Deploy to production
infisical run --env prod -- docker-compose -f docker-compose.prod.yml up -d --build

# Verify
curl https://api.yourdomain.com/api/auth/health
```

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Docker & Docker Compose installed
- ✅ Infisical CLI installed and configured
- ✅ Infisical project created (dev, staging, prod environments)
- ✅ All secrets configured in Infisical (26 variables)
- ✅ RSA keys generated and added to Infisical

## 🔧 Setup Checklist

### 1. Infisical Setup

```bash
# Install CLI
bun install -g @infisical/cli

# Login
infisical login --domain https://infisical.ajianaz.dev

# Verify
infisical run --env dev -- env | wc -l  # Should be 26+
```

**See:** [Infisical Setup Guide](../setup/infisical/SETUP.md)

### 2. RSA Keys Generation

```bash
# Generate keys
node scripts/generate-rsa-keys.js

# Copy to Infisical Dashboard
# - JWT_RS256_PRIVATE_KEY_BASE64
# - JWT_RS256_PUBLIC_KEY_BASE64
# - JWT_RS256_KEY_ID
```

### 3. Configure .env

```bash
# .env should ONLY contain Infisical config
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.ajianaz.dev
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENVIRONMENT=dev
```

**DO NOT** put secrets (JWT_SECRET, POSTGRES_PASSWORD, etc.) in .env file!

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Infisical Server                     │
│                  (infisical.ajianaz.dev)                 │
│  - Secrets management                                   │
│  - Environment-specific configs (dev/staging/prod)       │
└──────────────┬──────────────────────────────────────────┘
               │ Universal Auth
               ↓
┌─────────────────────────────────────────────────────────┐
│                 Docker Compose Stack                     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     API     │  │ PostgreSQL  │  │    Redis    │    │
│  │  (Hono)     │  │   (Data)    │  │   (Cache)   │    │
│  │   :3000     │  │    :5432    │  │    :6379    │    │
│  └──────┬──────┘  └─────────────┘  └─────────────┘    │
│         │                                                 │
│  Better Auth ←→ Keycloak (OAuth)                        │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Service Health Check

All services have health checks configured:

```bash
# Check all services
docker-compose ps

# Expected output:
NAME                        STATUS
modular-features-api-dev    Up (healthy)
modular-features-postgres   Up (healthy)
modular-features-redis      Up (healthy)

# Test API health
curl http://localhost:3000/api/auth/health

# Expected response:
{
  "status":"healthy",
  "mode":"hybrid",
  "gateway":"better-auth",
  "idp":"keycloak",
  "web_support":"cookie",
  "api_support":"bearer_token",
  "jwt_support":"RS256"
}
```

## 📊 Monitoring

### Logs

```bash
# Follow logs in real-time
docker-compose logs -f api postgres redis

# Check specific service
docker-compose logs api | tail -100

# Check for errors
docker-compose logs api | grep -i error
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Snapshot
docker stats --no-stream
```

### Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres modular_features

# Check tables
\dt

# Check connections
SELECT count(*) FROM pg_stat_activity;
```

## 🔄 Deployment Workflow

### Development

```bash
# 1. Pull latest code
git pull main

# 2. Rebuild containers
infisical run --env dev -- docker-compose build

# 3. Restart services
infisical run --env dev -- docker-compose up -d

# 4. Verify
curl http://localhost:3000/api/auth/health
```

### Staging

```bash
# 1. Create staging environment in Infisical
# 2. Configure staging secrets
# 3. Deploy
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d --build

# 4. Run migrations if needed
infisical run --env staging -- docker-compose -f docker-compose.staging.yml exec api bun run db:migrate

# 5. Verify
curl https://staging-api.yourdomain.com/api/auth/health
```

### Production

```bash
# 1. Backup database
infisical run --env prod -- docker-compose exec postgres pg_dump -U postgres modular_features > backup.sql

# 2. Deploy with zero-downtime
infisical run --env prod -- docker-compose -f docker-compose.prod.yml up -d --no-deps --build api

# 3. Verify health
curl https://api.yourdomain.com/api/auth/health

# 4. Remove old containers
docker-compose -f docker-compose.prod.yml down
```

## 🚨 Common Issues

### "turbo: executable not found"

**Cause:** Turbo doesn't work with Infisical CLI

**Fix:**
```bash
# ❌ DON'T
infisical run -- bun run dev:api

# ✅ DO
infisical run -- docker-compose up -d
# or
infisical run -- bun run packages/api/src/server.ts
```

### "Injecting 26 secrets" but app shows "undefined"

**Cause:** `.env` file overriding Infisical secrets

**Fix:** Remove secrets from `.env`, keep only Infisical config

### "database does not exist"

**Fix:**
```bash
infisical run --env dev -- docker-compose exec postgres psql -U postgres -c "CREATE DATABASE modular_features;"
```

**See:** [Troubleshooting Guide](./DOCKER_TROUBLESHOOTING.md) for more solutions

## 📖 Additional Resources

### Setup Guides
- [Infisical Setup](../setup/infisical/SETUP.md) - Complete Infisical configuration
- [Secrets Reference](../setup/infisical/SECRETS_QUICK_REF.md) - All 26 required secrets

### Configuration
- [Docker Compose Reference](../../docker-compose.yml) - Current Docker configuration
- [Environment Config](../../packages/shared/src/config/config.ts) - Config validation

### Troubleshooting
- [Docker Troubleshooting](./DOCKER_TROUBLESHOOTING.md) - Common issues & solutions

## 🎯 Best Practices

### Security
- ✅ Never commit secrets to git
- ✅ Use different secrets for dev/staging/prod
- ✅ Rotate secrets regularly
- ✅ Use read-only database credentials for API
- ✅ Enable SSL/TLS for production

### Operations
- ✅ Always use `infisical run` wrapper
- ✅ Specify environment explicitly (`--env dev`)
- ✅ Monitor logs during deployment
- ✅ Test health endpoint after deployment
- ✅ Backup database before production changes

### Development
- ✅ Use Docker for local development
- ✅ Keep dev/staging/prod configurations separate
- ✅ Document all secrets in Infisical
- ✅ Use environment variables for all config

## 📞 Support

If you need help:

1. **Check documentation** - Most issues are covered in guides
2. **Search issues** - Check GitHub Issues for similar problems
3. **Collect diagnostics** - Run commands from [Troubleshooting Guide](./DOCKER_TROUBLESHOOTING.md#getting-help)
4. **Create issue** - Include diagnostic information

---

**Last Updated:** 2025-12-26
