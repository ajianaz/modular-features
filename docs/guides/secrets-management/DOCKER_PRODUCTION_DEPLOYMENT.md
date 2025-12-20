# 🚀 Production Deployment with Infisical & Docker

Complete guide for deploying Modular Monolith with Infisical secrets management using Docker Compose.

---

## 📋 Prerequisites Checklist

Before deploying to production, ensure you have:

### 1. Infisical Setup
- [ ] Infisical instance running (self-hosted or cloud)
- [ ] Project created in Infisical
- [ ] Production environment created (`prod` or `production`)
- [ ] All secrets imported to production environment
- [ ] Machine Identity created for production
- [ ] Machine Identity has access to production project

### 2. Server Setup
- [ ] Docker installed (v20.10+)
- [ ] Docker Compose installed (v2.0+)
- [ ] Server accessible from Infisical instance
- [ ] Ports 3000, 5432, 6379 available
- [ ] Sufficient disk space for volumes

### 3. Domain & Network
- [ ] Domain configured (e.g., api.yourdomain.com)
- [ ] DNS pointing to server
- [ ] SSL/TLS certificates ready (if using HTTPS)
- [ ] Firewall rules configured

---

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Environment Files

#### A. Create Production Environment File
```bash
# Copy template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

#### B. Configure Infisical
```bash
# .env.production
USE_INFISICAL=true
INFISICAL_SITE_URL=https://infisical.ajianaz.dev
INFISICAL_CLIENT_ID=your-production-client-id
INFISICAL_CLIENT_SECRET=your-production-client-secret
INFISICAL_PROJECT_ID=your-production-project-id
INFISICAL_ENVIRONMENT=prod
INFISICAL_CACHE_TTL=300000
```

#### C. Configure Application
```bash
NODE_ENV=production
PORT=3000

# Service connections
POSTGRES_DB=modular_monolith
POSTGRES_USER=postgres

# URLs
BETTER_AUTH_URL=https://api.yourdomain.com/api/auth
KEYCLOAK_URL=https://keycloak.yourdomain.com
KEYCLOAK_REALM=production

# Feature flags
ENABLE_RS256_TOKENS=true
ENABLE_KEYCLOAK=true
```

### Step 2: Verify Secrets in Infisical

Before deploying, verify all secrets exist in Infisical:

**Required Secrets:**
```bash
# Database
POSTGRES_PASSWORD

# Redis
REDIS_PASSWORD

# Auth
BETTER_AUTH_SECRET
KEYCLOAK_CLIENT_SECRET
JWT_SECRET
SESSION_SECRET
CSRF_SECRET

# Payment (if enabled)
POLAR_API_KEY
POLAR_WEBHOOK_SECRET
MIDTRANS_SERVER_KEY
XENDIT_SECRET_KEY
COINBASE_COMMERCE_API_KEY

# Notifications
SENDGRID_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN

# Monitoring
SENTRY_DSN

# Storage
MINIO_ROOT_PASSWORD
MINIO_SECRET_KEY
```

**Check via Infisical UI:**
1. Login to Infisical
2. Select project
3. Select environment `prod`
4. Verify all secrets exist

### Step 3: Test Configuration Locally

```bash
# Test Docker Compose configuration
docker-compose --env-file .env.production config

# Expected: No errors, full configuration displayed
```

### Step 4: Pull Latest Code

```bash
# Clone or pull latest code
git pull origin main

# Checkout to production branch if needed
git checkout production
```

### Step 5: Build Docker Images

```bash
# Build images
docker-compose --env-file .env.production build

# Expected: Build successful, no errors
```

### Step 6: Deploy Services

```bash
# Start all services
docker-compose --env-file .env.production up -d

# Check service status
docker-compose ps

# Expected: All services running (healthy)
```

### Step 7: Verify Infisical Connection

```bash
# Check API logs for Infisical connection
docker-compose logs api | grep INFISICAL

# Expected output:
# [INFISICAL] ✅ Successfully initialized
# [INFISICAL] ✅ Authenticated successfully
# [INFISICAL] 📦 Project ID: your-project-id
# [INFISICAL] 🌍 Environment: prod
# [CONFIG] ✅ Loaded X secrets from Infisical
```

### Step 8: Verify Application Health

```bash
# Check health endpoint
curl https://api.yourdomain.com/health

# Expected: {"status":"ok"}

# Check database connection
curl https://api.yourdomain.com/api/health/db

# Expected: {"status":"healthy","database":"connected"}
```

---

## 🔍 Troubleshooting

### Issue 1: Infisical Connection Failed

**Symptoms:**
```
[INFISICAL] ❌ Authentication failed
[CONFIG] ⚠️ Using environment variable for: SECRET_NAME
```

**Solutions:**
1. Verify Infisical instance URL
2. Check Machine Identity credentials
3. Verify network connectivity from container to Infisical
4. Check Machine Identity has project access

**Debug:**
```bash
# Test Infisical connectivity from container
docker-compose exec api sh -c "curl -I https://infisical.ajianaz.dev"

# Check environment variables
docker-compose exec api env | grep INFISICAL
```

### Issue 2: Secrets Not Loading

**Symptoms:**
```
[INFISICAL] ⚠️  Secret "POSTGRES_PASSWORD" not found in Infisical
```

**Solutions:**
1. Verify secret exists in Infisical (correct environment)
2. Check secret key spelling (case-sensitive)
3. Verify Project ID matches
4. Check environment variable `INFISICAL_ENVIRONMENT`

**Debug:**
```bash
# List secrets in Infisical
# Via Infisical UI: Project > prod > Secrets

# Check which secrets loaded
docker-compose logs api | grep "Loaded.*secrets"
```

### Issue 3: Database Connection Failed

**Symptoms:**
```
Error: password authentication failed
```

**Solutions:**
1. Verify POSTGRES_PASSWORD in Infisical
2. Check PostgreSQL container is running
3. Verify database credentials match
4. Check network connectivity between containers

**Debug:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection from API container
docker-compose exec api sh -c "psql -h postgres -U postgres -d modular_monolith"
```

### Issue 4: Container Can't Reach Infisical

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND infisical.ajianaz.dev
```

**Solutions:**
1. Verify DNS resolution from container
2. Check if Infisical URL is accessible from server
3. If using self-hosted on same machine, use `host.docker.internal`
4. Configure Docker network settings

**Debug:**
```bash
# Test DNS from container
docker-compose exec api nslookup infisical.ajianaz.dev

# Test connectivity
docker-compose exec api curl https://infisical.ajianaz.dev
```

---

## 🔄 Deployment Workflow

### Initial Deployment

```bash
# 1. Prepare environment
cp .env.production.example .env.production
nano .env.production

# 2. Verify Infisical setup
# - Check secrets exist in Infisical
# - Test Machine Identity

# 3. Deploy
docker-compose --env-file .env.production up -d

# 4. Verify
docker-compose logs api | grep INFISICAL
curl https://api.yourdomain.com/health
```

### Update Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart
docker-compose --env-file .env.production build
docker-compose --env-file .env.production up -d

# 3. Verify
docker-compose ps
docker-compose logs api --tail 50
```

### Rollback Deployment

```bash
# 1. View previous version
git log --oneline

# 2. Checkout previous version
git checkout <previous-commit-hash>

# 3. Redeploy
docker-compose --env-file .env.production up -d

# 4. Verify rollback
curl https://api.yourdomain.com/health
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
# Check service health
docker-compose ps

# Check API logs
docker-compose logs api --tail 100

# Check Infisical connection
docker-compose logs api | grep INFISICAL
```

### Weekly Maintenance

```bash
# Check Docker disk usage
docker system df

# Clean up old images
docker system prune -a

# Rotate logs
docker-compose logs --no-log-prefix > logs/docker-$(date +%Y%m%d).log
```

### Monthly Tasks

- Review Infisical audit logs
- Rotate sensitive secrets (JWT, SESSION)
- Update Machine Identity credentials
- Review and update dependencies
- Backup volumes (PostgreSQL, Redis)

---

## 🔐 Security Best Practices

### 1. Secrets Management
- ✅ Never commit `.env.production` to git
- ✅ Use unique Machine Identity per environment
- ✅ Rotate secrets regularly (recommended: 90 days)
- ✅ Enable Infisical audit logging
- ✅ Monitor secret access patterns

### 2. Container Security
- ✅ Run containers as non-root user
- ✅ Use minimal Docker images (Alpine)
- ✅ Scan images for vulnerabilities
- ✅ Keep Docker and dependencies updated
- ✅ Limit container resources

### 3. Network Security
- ✅ Use private networks for inter-container communication
- ✅ Expose only necessary ports
- ✅ Configure firewall rules
- ✅ Use HTTPS/TLS for external communication
- ✅ Enable Docker content trust

### 4. Access Control
- ✅ Limit access to Docker socket
- ✅ Use separate `.env` files per environment
- ✅ Implement proper authentication for Infisical
- ✅ Use role-based access control (RBAC)
- ✅ Monitor and log access attempts

---

## 📝 Production Checklist

### Pre-Deployment
- [ ] All secrets imported to Infisical (prod environment)
- [ ] Machine Identity created and configured
- [ ] `.env.production` file created and configured
- [ ] Docker Compose configuration tested
- [ ] DNS configured and pointing to server
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring tools configured

### Post-Deployment
- [ ] All containers running and healthy
- [ ] Infisical connection verified
- [ ] Secrets loading confirmed
- [ ] Application health check passing
- [ ] Database connection working
- [ ] Redis connection working
- [ ] External services (Keycloak, etc.) accessible
- [ ] API endpoints responding
- [ ] Logs being collected
- [ ] Alerts configured

---

## 🎯 Success Criteria

Deployment is successful when:

1. ✅ All containers are running (`docker-compose ps` shows healthy)
2. ✅ Infisical connection established (`[INFISICAL] ✅ Successfully initialized`)
3. ✅ Secrets loaded from Infisical (`[CONFIG] ✅ Loaded X secrets from Infisical`)
4. ✅ Application responds to health checks (`/health` returns 200)
5. ✅ Database connection working
6. ✅ Redis connection working
7. ✅ No errors in logs
8. ✅ External services accessible

---

## 📞 Support & Resources

### Documentation
- [Infisical Setup Guide](./infisical-setup.md)
- [Infisical Quick Reference](./infisical-quick-reference.md)
- [Docker Deployment Guide](../../DOCKER_GUIDE.md)

### Troubleshooting
- Check logs: `docker-compose logs api`
- Verify Infisical: Check Infisical UI
- Test connectivity: `docker-compose exec api curl https://infisical.ajianaz.dev`

### Emergency Contacts
- DevOps Team: [contact-info]
- Infisical Admin: [contact-info]
- On-Call Engineer: [contact-info]

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
**Status:** Production Ready ✅
