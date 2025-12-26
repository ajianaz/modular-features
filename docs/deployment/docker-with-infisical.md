# Docker + Infisical Setup Guide

Complete guide for running Docker services with Infisical secrets management across all environments (dev, staging, production).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

---

## Overview

This project uses:
- **Docker Compose** for container orchestration
- **Infisical** for secrets management
- **Environment-specific** configurations (dev, staging, prod)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Infisical Server                     │
│                  (infisical.ajianaz.dev)                 │
└──────────────┬──────────────────────────────────────────┘
               │ Universal Auth (Machine Identity)
               ↓
┌─────────────────────────────────────────────────────────┐
│                 Docker Compose Stack                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  API       │  │ PostgreSQL │  │   Redis    │        │
│  │  :3000     │  │   :5432    │  │   :6379    │        │
│  └──────┬─────┘  └────────────┘  └────────────┘        │
│         │                                                 │
│         └─→ Infisical CLI injects secrets                │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### 1. Install Docker & Docker Compose

```bash
# macOS
brew install docker docker-compose

# Linux
sudo apt-get install docker.io docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Install Infisical CLI

```bash
# Using bun (recommended for this project)
bun install -g @infisical/cli

# Or npm
npm install -g @infisical/cli

# Verify
infisical --version
```

### 3. Configure Infisical Connection

Create/Edit `.env`:

```bash
# Infisical Connection
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.ajianaz.dev
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENVIRONMENT=dev  # dev, staging, or prod
INFISICAL_CACHE_TTL=300000  # 5 minutes
```

### 4. Verify Infisical Access

```bash
# Test connection
infisical login --domain https://infisical.ajianaz.dev

# Verify secrets are accessible
infisical run --env dev -- env | grep -E "(POSTGRES|REDIS|JWT)" | head -10
```

---

## Development Environment

### Quick Start

```bash
# 1. Start all services with Infisical
infisical run --env dev -- docker-compose up -d

# 2. View logs
docker-compose logs -f api

# 3. Check service status
docker-compose ps

# 4. Test API
curl http://localhost:3000/api/auth/health
```

### Expected Output

```
[INF] Injecting 26 Infisical secrets into your application process
Network modular-feature_app-network  Creating
Container modular-features-postgres   Creating
Container modular-features-redis      Creating
Container modular-features-api-dev    Creating
...
Container modular-features-api-dev    Started (healthy)
Container modular-features-postgres   Started (healthy)
Container modular-features-redis      Started (healthy)
```

### Development Workflow

```bash
# Start services
infisical run --env dev -- docker-compose up -d

# Rebuild after code changes
infisical run --env dev -- docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes (fresh database)
docker-compose down -v
```

### Accessing Services

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | via Infisical |
| PostgreSQL | localhost:5432 | via Infisical |
| Redis | localhost:6379 | via Infisical |

### Database Setup (First Time)

```bash
# Database is automatically created by docker/postgres/init.sql
# To run migrations:

infisical run --env dev -- docker-compose exec api bun run db:migrate

# Or use the setup script
infisical run --env dev -- bun run db:setup
```

---

## Staging Environment

### Configuration

Create `docker-compose.staging.yml`:

```yaml
version: '3.8'

services:
  postgres:
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data

  redis:
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_staging_data:/data

  api:
    environment:
      - NODE_ENV=staging
      - PORT=3000
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

volumes:
  postgres_staging_data:
  redis_staging_data:
```

### Deploy to Staging

```bash
# 1. Set staging environment
export INFISICAL_ENVIRONMENT=staging

# 2. Build and start
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d --build

# 3. Verify deployment
curl https://staging-api.yourdomain.com/api/auth/health
```

### Staging Environment Variables

Set these in Infisical → Project → Environments → staging:

```bash
NODE_ENV=staging
PORT=3000
BETTER_AUTH_URL=https://staging-api.yourdomain.com
KEYCLOAK_URL=https://staging-keycloak.yourdomain.com
POSTGRES_HOST=staging-postgres.internal
REDIS_HOST=staging-redis.internal
LOG_LEVEL=info
```

---

## Production Environment

### Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    restart: unless-stopped

  redis:
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_prod_data:/data
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped

  api:
    environment:
      - NODE_ENV=production
      - PORT=3000
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/auth/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_prod_data:
  redis_prod_data:
```

### Deploy to Production

```bash
# 1. Set production environment
export INFISICAL_ENVIRONMENT=prod

# 2. Backup current deployment (if exists)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres modular_features > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Deploy with zero-downtime
infisical run --env prod -- docker-compose -f docker-compose.prod.yml up -d --no-deps --build api

# 4. Verify health
curl https://api.yourdomain.com/api/auth/health

# 5. Remove old containers
docker-compose -f docker-compose.prod.yml down
```

### Production Environment Variables

Set these in Infisical → Project → Environments → prod:

```bash
NODE_ENV=production
PORT=3000
BETTER_AUTH_URL=https://api.yourdomain.com
KEYCLOAK_URL=https://keycloak.yourdomain.com
POSTGRES_HOST=postgres.internal
REDIS_HOST=redis.internal
LOG_LEVEL=warn
CORS_ORIGIN=https://app.yourdomain.com
```

---

## Common Issues

### Issue 1: "turbo: executable not found in PATH"

**Problem:** Turbo command doesn't work when running with Infisical.

**Solution:** Don't use turbo with Infisical. Run directly:

```bash
# ❌ WRONG
infisical run -- bun run dev:api

# ✅ CORRECT
infisical run -- bun run packages/api/src/server.ts

# ✅ CORRECT (Docker)
infisical run -- docker-compose up -d
```

### Issue 2: "Injecting X secrets" but app says "undefined"

**Problem:** Environment variables not reaching the application.

**Diagnosis:**

```bash
# Check what Infisical injects
infisical run --env dev -- env | grep -E "(BETTER_AUTH|JWT_SECRET)"

# Check if .env is overriding
cat .env | grep -v "^#" | grep -v "^$"
```

**Solutions:**

1. **Make sure .env doesn't override secrets:**

```bash
# .env should ONLY have Infisical config
USE_INFISICAL=true
INFISICAL_SITE_URL=...
INFISICAL_CLIENT_ID=...
INFISICAL_CLIENT_SECRET=...
INFISICAL_PROJECT_ID=...
INFISICAL_ENVIRONMENT=dev
```

2. **Don't set secrets in .env file:**

```bash
# ❌ WRONG - This overrides Infisical!
JWT_SECRET=local-secret

# ✅ CORRECT - Let Infisical inject it
# (Don't set JWT_SECRET in .env)
```

3. **Check dotenv loading order:**

```typescript
// In config.ts, dotenv loads AFTER Infisical injection
// This is correct - Infisical injects via CLI, dotenv just adds defaults
```

### Issue 3: Docker Compose warnings about unset variables

**Problem:**

```
The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string.
```

**Solution:** Infisical injects variables, but Docker reads them too early.

**Fix:** Use environment file or `infisical run` wraps the command correctly:

```bash
# ✅ This works - Infisical injects before docker-compose reads
infisical run --env dev -- docker-compose up -d
```

If still warnings, add `.env` file with placeholder (not actual secrets):

```bash
# .env (for Docker Compose)
POSTGRES_PASSWORD=__INFISICAL_WILL_FILL_THIS__
REDIS_PASSWORD=__INFISICAL_WILL_FILL_THIS__
```

### Issue 4: Database connection fails

**Problem:**

```
error: database "modular_features" does not exist
```

**Solution:**

```bash
# 1. Check PostgreSQL is ready
docker-compose logs postgres | grep "database system is ready"

# 2. Manually create database
infisical run --env dev -- docker-compose exec postgres psql -U postgres -c "CREATE DATABASE modular_features;"

# 3. Run migrations
infisical run --env dev -- docker-compose exec api bun run db:migrate

# 4. Or use the setup script
infisical run --env dev -- bun run db:setup
```

### Issue 5: "RSA Keys not found"

**Problem:**

```
Failed to initialize RS256 keys: Key validation failed
```

**Solution:**

```bash
# 1. Generate RSA keys
node scripts/generate-rsa-keys.js

# 2. Copy to Infisical Dashboard
cat keys/private_base64.txt
cat keys/public_base64.txt
cat keys/key_id.txt

# 3. Add to Infisical → Project → Environments → dev → Secrets:
#    JWT_RS256_PRIVATE_KEY_BASE64 = <content>
#    JWT_RS256_PUBLIC_KEY_BASE64 = <content>
#    JWT_RS256_KEY_ID = <content>

# 4. Restart services
docker-compose restart api
```

### Issue 6: Container exits immediately

**Problem:** API container starts and exits.

**Diagnosis:**

```bash
# Check logs
docker-compose logs api

# Check if port is already in use
lsof -i :3000

# Check database connectivity
infisical run --env dev -- docker-compose exec api ping postgres -c 3
```

**Solutions:**

1. **Port already in use:**

```bash
# Kill process using port 3000
kill -9 $(lsof -ti :3000)

# Or change port in .env
PORT=3001
```

2. **Database not ready:**

```bash
# Add depends_on with healthcheck in docker-compose.yml
```

3. **Missing secrets:**

```bash
# Verify secrets in Infisical
infisical run --env dev -- env | wc -l  # Should be 26+ variables
```

---

## Best Practices

### 1. Environment Isolation

```bash
# Always specify environment explicitly
infisical run --env dev -- docker-compose up -d
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d
infisical run --env prod -- docker-compose -f docker-compose.prod.yml up -d
```

### 2. Secrets Management

```bash
# ✅ DO: Store secrets in Infisical
# ✅ DO: Use different environments (dev/staging/prod)
# ✅ DO: Rotate secrets regularly
# ❌ DON'T: Commit secrets to git
# ❌ DON'T: Share .env files
# ❌ DON'T: Use production secrets in development
```

### 3. Health Checks

```bash
# Always check health after deployment
curl http://localhost:3000/api/auth/health

# Expected response:
{
  "status":"healthy",
  "mode":"hybrid",
  "gateway":"better-auth",
  "idp":"keycloak"
}
```

### 4. Monitoring

```bash
# View logs in real-time
docker-compose logs -f api postgres redis

# Check resource usage
docker stats

# Check container status
docker-compose ps
```

### 5. Backup & Recovery

```bash
# Backup database before major changes
infisical run --env prod -- docker-compose exec postgres pg_dump -U postgres modular_features > backup.sql

# Restore from backup
infisical run --env prod -- docker-compose exec -T postgres psql -U postgres modular_features < backup.sql
```

### 6. Security

```bash
# Use read-only credentials for API connections
POSTGRES_USER=modular_features_api
POSTGRES_PASSWORD=<strong-password>

# Restrict network access
docker-compose.yml:
  postgres:
    networks:
      - internal
    # No ports exposed to host

# Use strong passwords
openssl rand -base64 32  # Generate secure passwords
```

---

## Quick Reference Cards

### Development Commands

```bash
# Start
infisical run --env dev -- docker-compose up -d

# Rebuild
infisical run --env dev -- docker-compose up -d --build

# Logs
docker-compose logs -f api

# Stop
docker-compose down

# Restart
docker-compose restart api

# Health check
curl http://localhost:3000/api/auth/health
```

### Staging Commands

```bash
# Deploy
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d --build

# Verify
curl https://staging-api.yourdomain.com/api/auth/health

# Rollback
docker-compose -f docker-compose.staging.yml down
git checkout <previous-commit>
infisical run --env staging -- docker-compose -f docker-compose.staging.yml up -d --build
```

### Production Commands

```bash
# Pre-deployment backup
infisical run --env prod -- docker-compose exec postgres pg_dump > backup.sql

# Deploy
infisical run --env prod -- docker-compose -f docker-compose.prod.yml up -d --no-deps --build api

# Verify
curl https://api.yourdomain.com/api/auth/health

# Monitor
docker-compose logs -f api
```

---

## Next Steps

- **Monitoring:** Set up logging aggregation (ELK, Loki, etc.)
- **CI/CD:** Integrate with GitHub Actions / GitLab CI
- **Scaling:** Configure load balancer (nginx, traefik)
- **Backup:** Automated database backups
- **Testing:** Integration tests with staging environment

---

## Additional Resources

- **[Infisical Setup Guide](../setup/infisical/SETUP.md)** - Complete Infisical configuration
- **[Secrets Quick Reference](../setup/infisical/SECRETS_QUICK_REF.md)** - All required secrets
- **[Docker Compose Reference](../../docker-compose.yml)** - Current Docker configuration
- **[Troubleshooting Guide](./DOCKER_TROUBLESHOOTING.md)** - Detailed troubleshooting
