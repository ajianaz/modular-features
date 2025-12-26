# Docker + Infisical Troubleshooting Guide

Solutions to common problems when running Docker services with Infisical secrets management.

## Table of Contents

- [Quick Diagnosis](#quick-diagnosis)
- [Environment Variables Issues](#environment-variables-issues)
- [Docker Compose Issues](#docker-compose-issues)
- [Database Issues](#database-issues)
- [RSA Keys Issues](#rsa-keys-issues)
- [Performance Issues](#performance-issues)
- [Network Issues](#network-issues)

---

## Quick Diagnosis

### Step 1: Check Infisical Connection

```bash
# Test Infisical CLI
infisical login --domain https://infisical.ajianaz.dev

# Verify secrets are accessible
infisical run --env dev -- env | wc -l
# Should show 26+ secrets

# Check specific secrets
infisical run --env dev -- env | grep JWT_SECRET
infisical run --env dev -- env | grep POSTGRES_PASSWORD
```

### Step 2: Check Docker Status

```bash
# Check Docker daemon
docker info
docker --version

# Check running containers
docker ps
docker-compose ps

# Check container logs
docker-compose logs api | tail -50
docker-compose logs postgres | tail -50
docker-compose logs redis | tail -50
```

### Step 3: Check Application Logs

```bash
# Follow API logs
docker-compose logs -f api

# Check for errors
docker-compose logs api | grep -i error
docker-compose logs api | grep -i failed
```

### Step 4: Test API Endpoint

```bash
# Health check
curl http://localhost:3000/api/auth/health

# Expected response:
{
  "status":"healthy",
  "mode":"hybrid",
  "gateway":"better-auth",
  "idp":"keycloak"
}

# Check HTTP status
curl -I http://localhost:3000/api/auth/health
# Should return: HTTP/1.1 200 OK
```

---

## Environment Variables Issues

### Problem: "Injecting X secrets" but app shows "undefined"

**Symptoms:**

```
[INF] Injecting 26 Infisical secrets into your application process
[CONFIG] Debug secrets from process.env: {"JWT_SECRET":"undefined...","BETTER_AUTH_SECRET":"undefined..."}
```

**Diagnosis:**

```bash
# 1. Check what Infisical injects
infisical run --env dev -- env | grep JWT_SECRET

# 2. Check .env file
cat .env | grep JWT_SECRET

# 3. Check if dotenv overrides
docker-compose logs api | grep "Successfully loaded .env"
```

**Solutions:**

#### Solution 1: Remove secrets from .env file

```bash
# .env should ONLY contain Infisical config
# ❌ WRONG
JWT_SECRET=some-secret
BETTER_AUTH_SECRET=another-secret

# ✅ CORRECT
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.ajianaz.dev
INFISICAL_CLIENT_ID=xxx
INFISICAL_CLIENT_SECRET=xxx
INFISICAL_PROJECT_ID=xxx
INFISICAL_ENVIRONMENT=dev
```

#### Solution 2: Check dotenv loading order

```typescript
// packages/shared/src/config/config.ts
// Line 16: dotenv loads AFTER process.env
const dotenvResult = dotenvConfig({ path: envPath })

// This is correct - Infisical injects first (CLI level)
// Then dotenv adds defaults (but shouldn't override)
```

#### Solution 3: Verify Infisical actually injects

```bash
# Run with verbose logging
infisical run --env dev -- env | grep -E "(JWT|BETTER_AUTH|SESSION)" | head -10

# If empty, Infisical is not configured correctly
# Re-check:
# - INFISICAL_CLIENT_ID
# - INFISICAL_CLIENT_SECRET
# - INFISICAL_PROJECT_ID
```

### Problem: Docker Compose warns about unset variables

**Symptoms:**

```
WARNING: The JWT_SECRET variable is not set. Defaulting to a blank string.
WARNING: The POSTGRES_PASSWORD variable is not set. Defaulting to a blank string.
```

**Explanation:**
This is actually **OK**! Docker Compose reads variables before Infisical injects them. The warnings can be ignored if Infisical is working.

**Verification:**

```bash
# Check if containers have the secrets
docker-compose exec api env | grep JWT_SECRET
# Should show the actual secret value

# If empty, Infisical injection failed
```

**Solution (if secrets are really missing):**

```bash
# Make sure you're using infisical run
# ❌ WRONG
docker-compose up -d

# ✅ CORRECT
infisical run --env dev -- docker-compose up -d
```

---

## Docker Compose Issues

### Problem: Container exits immediately

**Symptoms:**

```bash
docker-compose ps
# Shows: Exited (1) X seconds ago
```

**Diagnosis:**

```bash
# 1. Check exit code
docker-compose ps

# 2. Check logs
docker-compose logs api

# 3. Check if port is already in use
lsof -i :3000

# 4. Try running without docker
infisical run --env dev -- bun run packages/api/src/server.ts
```

**Common Causes & Solutions:**

#### Cause 1: Port already in use

```bash
# Find process using port 3000
lsof -ti :3000

# Kill it
kill -9 $(lsof -ti :3000)

# Or change port
export PORT=3001
infisical run --env dev -- docker-compose up -d
```

#### Cause 2: Missing secrets

```bash
# Verify secrets in container
docker-compose exec api env | grep -E "(JWT|POSTGRES)" | wc -l
# Should be 26+

# If 0, Infisical not injecting
# Re-check .env file for Infisical config
```

#### Cause 3: Database not ready

```bash
# Check postgres is ready
docker-compose logs postgres | grep "database system is ready"

# Wait for postgres
docker-compose up -d postgres redis
sleep 10
docker-compose up -d api
```

#### Cause 4: Build failure

```bash
# Rebuild from scratch
docker-compose down
docker-compose build --no-cache api
docker-compose up -d
```

### Problem: "turbo: executable not found in PATH"

**Symptoms:**

```
exec: "turbo": executable file not found in $PATH
```

**Root Cause:**
Turbo is not in PATH when running through Infisical because Infisical spawns a new shell.

**Solution:**

```bash
# ❌ DON'T use turbo with Infisical
infisical run --env dev -- bun run dev:api

# ✅ DO run directly
infisical run --env dev -- bun run packages/api/src/server.ts

# ✅ DO use Docker (recommended)
infisical run --env dev -- docker-compose up -d
```

### Problem: Container restart loop

**Symptoms:**

```bash
docker-compose ps
# Shows: Restarting (1) X seconds ago
```

**Diagnosis:**

```bash
# Check healthcheck status
docker inspect modular-features-api-dev | grep -A 10 Health

# Check recent logs
docker-compose logs --tail=100 api | grep -i "error\|fatal\|failed"
```

**Solution:**

```bash
# 1. Disable healthcheck temporarily
# Edit docker-compose.yml, comment out healthcheck section

# 2. Increase healthcheck timeout
healthcheck:
  interval: 60s  # Increase from 30s
  timeout: 20s   # Increase from 10s

# 3. Restart
docker-compose up -d
```

---

## Database Issues

### Problem: "database does not exist"

**Symptoms:**

```
error: database "modular_features" does not exist
```

**Diagnosis:**

```bash
# Check if database exists
docker-compose exec postgres psql -U postgres -l

# Check init script
docker-compose exec postgres ls /docker-entrypoint-initdb.d/
```

**Solutions:**

#### Solution 1: Run init script manually

```bash
# Copy init script
docker-compose exec postgres mkdir -p /docker-entrypoint-initdb.d
docker cp docker/postgres/init.sql modular-features-postgres:/docker-entrypoint-initdb.d/

# Restart postgres
docker-compose restart postgres

# Wait and check
sleep 5
docker-compose exec postgres psql -U postgres -l
# Should show "modular_features"
```

#### Solution 2: Create database manually

```bash
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE modular_features;"

# Verify
docker-compose exec postgres psql -U postgres -l
```

#### Solution 3: Rebuild from scratch

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
infisical run --env dev -- docker-compose up -d

# Init script will run automatically
```

### Problem: "connection refused"

**Symptoms:**

```
error: Connection refused at localhost:5432
```

**Diagnosis:**

```bash
# 1. Check postgres is running
docker-compose ps postgres

# 2. Check postgres is ready
docker-compose logs postgres | grep "database system is ready"

# 3. Test connection from API container
docker-compose exec api ping postgres -c 3
```

**Solutions:**

#### Solution 1: Wait for postgres to be ready

```bash
# Wait for healthy status
docker-compose ps
# Should show: "Up (healthy)"

# If not healthy, check logs
docker-compose logs postgres
```

#### Solution 2: Check network configuration

```bash
# Check if containers are on same network
docker network inspect modular-feature_app-network

# Should list: api, postgres, redis containers
```

#### Solution 3: Verify environment variables

```bash
# Check postgres credentials in container
docker-compose exec api env | grep POSTGRES

# Should match:
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<from-infisical>
POSTGRES_DB=modular_features
```

### Problem: Database migration fails

**Symptoms:**

```
Error: Table "users" already exists
```

**Diagnosis:**

```bash
# Check existing tables
docker-compose exec postgres psql -U postgres modular_features -c "\dt"

# Check migrations folder
ls packages/database/src/migrations/
```

**Solutions:**

#### Solution 1: Drop and recreate

```bash
# WARNING: This deletes all data
docker-compose exec postgres psql -U postgres -c "DROP DATABASE modular_features;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE modular_features;"

# Run migrations
infisical run --env dev -- docker-compose exec api bun run db:migrate
```

#### Solution 2: Use push instead of migrate

```bash
# Push schema changes (development only)
infisical run --env dev -- docker-compose exec api bun run db:push
```

---

## RSA Keys Issues

### Problem: "RSA Keys not configured"

**Symptoms:**

```
[RS256KeyManager] RS256 keys not configured. Please run "node scripts/generate-rsa-keys.js"
```

**Diagnosis:**

```bash
# Check if keys exist in Infisical
infisical run --env dev -- env | grep JWT_RS256

# Should show:
# JWT_RS256_PRIVATE_KEY_BASE64=LS0tLS1CRUdJTiBQUklWQVRF...
# JWT_RS256_PUBLIC_KEY_BASE64=LS0tLS1CRUdJTiBQVUJMSUMgS0VZ...
# JWT_RS256_KEY_ID=rsa-XXXXXXXXXXXX
```

**Solution:**

```bash
# 1. Generate keys
node scripts/generate-rsa-keys.js

# 2. Copy output to Infisical
# Go to: https://infisical.ajianaz.dev
# Project → Environments → dev → Secrets
# Add:
#   - JWT_RS256_PRIVATE_KEY_BASE64
#   - JWT_RS256_PUBLIC_KEY_BASE64
#   - JWT_RS256_KEY_ID

# 3. Restart API
docker-compose restart api

# 4. Verify
curl http://localhost:3000/api/auth/.well-known/jwks.json
```

### Problem: "NO_START_LINE" error

**Symptoms:**

```
Failed to initialize RS256 keys: Key validation failed: error:0900006e:PEM routines:OPENSSL_internal:NO_START_LINE
```

**Root Cause:**
Keys are not in correct Base64 format.

**Solution:**

```bash
# 1. Regenerate keys (script handles Base64 encoding)
node scripts/generate-rsa-keys.js

# 2. Verify keys are Base64
cat keys/private_base64.txt | base64 -d | head -1
# Should output: -----BEGIN PRIVATE KEY-----

# 3. Re-copy to Infisical (make sure to copy entire value)
cat keys/private_base64.txt
cat keys/public_base64.txt
cat keys/key_id.txt

# 4. Restart
docker-compose restart api
```

---

## Performance Issues

### Problem: Slow container startup

**Symptoms:**

Container takes 30+ seconds to become healthy.

**Diagnosis:**

```bash
# Check startup time
docker-compose ps
# Note the "Up" duration

# Check resource usage
docker stats
```

**Solutions:**

#### Solution 1: Reduce healthcheck interval

```yaml
# docker-compose.yml
healthcheck:
  interval: 10s  # Reduce from 30s
  timeout: 5s
  retries: 3
  start_period: 20s  # Reduce from 40s
```

#### Solution 2: Allocate more resources

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'     # Increase
          memory: 2G    # Increase
```

#### Solution 3: Optimize startup

```typescript
// packages/api/src/server.ts
// Remove blocking operations from startup
// Defer heavy initialization
```

### Problem: High memory usage

**Symptoms:**

```
docker stats
# Shows: 1.5GB+ memory usage
```

**Solutions:**

```bash
# 1. Check for memory leaks
docker stats --no-stream

# 2. Restart container
docker-compose restart api

# 3. Set memory limits
# Edit docker-compose.yml:
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M

# 4. Monitor connections
docker-compose exec api netstat -an | grep ESTABLISHED | wc -l
```

---

## Network Issues

### Problem: Cannot access API from host

**Symptoms:**

```bash
curl http://localhost:3000/api/auth/health
# curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Diagnosis:**

```bash
# 1. Check port mapping
docker-compose ps
# Should show: 0.0.0.0:3000->3000/tcp

# 2. Check from inside container
docker-compose exec api curl http://localhost:3000/api/auth/health

# 3. Check firewall
sudo ufw status
```

**Solutions:**

#### Solution 1: Verify port mapping

```yaml
# docker-compose.yml
services:
  api:
    ports:
      - "3000:3000"  # Correct format
```

#### Solution 2: Check macOS/Windows firewall

```bash
# macOS: System Preferences → Security → Firewall
# Allow Docker Desktop
```

#### Solution 3: Use container IP

```bash
# Get container IP
docker inspect modular-features-api-dev | grep IPAddress

# Test with container IP
curl http://172.18.0.4:3000/api/auth/health
```

### Problem: Containers cannot communicate

**Symptoms:**

```
API cannot connect to postgres: Connection refused
```

**Diagnosis:**

```bash
# 1. Check network
docker network inspect modular-feature_app-network

# 2. Test connectivity
docker-compose exec api ping postgres

# 3. Check DNS
docker-compose exec api nslookup postgres
```

**Solutions:**

#### Solution 1: Ensure same network

```yaml
# docker-compose.yml
services:
  api:
    networks:
      - app-network

  postgres:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Solution 2: Use service names

```typescript
// In API code
// ❌ WRONG
POSTGRES_HOST=localhost

// ✅ CORRECT
POSTGRES_HOST=postgres  // Service name from docker-compose.yml
```

---

## Getting Help

### Collect Diagnostic Information

```bash
# Save all logs to file
infisical run --env dev -- docker-compose logs > docker-debug.log 2>&1

# Collect system info
docker info > system-info.txt 2>&1
docker-compose ps > container-status.txt 2>&1
docker stats --no-stream > resource-usage.txt 2>&1

# Check environment variables (be careful not to leak secrets!)
infisical run --env dev -- env | grep -v "SECRET\|PASSWORD\|KEY" > env-vars.txt 2>&1
```

### Useful Commands

```bash
# Real-time logs
docker-compose logs -f --tail=100 api

# Exec into container
docker-compose exec api sh

# Restart specific service
docker-compose restart api

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
infisical run --env dev -- docker-compose up -d

# Check Infisical injection
infisical run --env dev -- env | sort
```

### Checklist Before Asking for Help

- [ ] Infisical CLI installed and authenticated
- [ ] `.env` file configured correctly
- [ ] All 26 secrets injected (check with `infisical run --env dev -- env | wc -l`)
- [ ] Docker daemon running
- [ ] All containers show "Up" status (check `docker-compose ps`)
- [ ] Port 3000 not already in use
- [ ] PostgreSQL is healthy
- [ ] Checked logs for errors
- [ ] Tried restarting containers
- [ ] Tried rebuilding from scratch

### Where to Get Help

1. **Check documentation:**
   - [Docker + Infisical Guide](./docker-with-infisical.md)
   - [Infisical Setup](../setup/infisical/SETUP.md)
   - [Secrets Reference](../setup/infisical/SECRETS_QUICK_REF.md)

2. **Check GitHub Issues:**
   - Search existing issues
   - Create new issue with diagnostic information

3. **Community:**
   - Discord / Slack channels
   - Stack Overflow (tag: infisical, docker)

---

## Quick Fix Commands

```bash
# Fix most common issues with one command:
docker-compose down -v && \
infisical run --env dev -- docker-compose up -d --build && \
sleep 10 && \
curl http://localhost:3000/api/auth/health

# If still broken, collect diagnostics:
docker-compose logs > debug.log 2>&1
docker-compose ps > status.txt
infisical run --env dev -- env | grep -v SECRET | grep -v PASSWORD > env.txt
```
