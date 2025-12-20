# Secrets Management Guides

Complete guides for managing secrets using Infisical in development and production.

## 📚 Available Guides

### Getting Started
1. **[Infisical Setup Guide](./infisical-setup.md)**
   - Complete Infisical installation and configuration
   - Machine Identity setup
   - Project and environment creation
   - Secret importing

2. **[Infisical Quick Reference](./infisical-quick-reference.md)**
   - Quick commands and common operations
   - Environment variable reference
   - Troubleshooting tips

### Docker Integration
3. **[Docker Development Success](./docker-development-success.md)**
   - Docker development with Infisical
   - Development environment setup
   - Verification and testing
   - Success checklist

4. **[Production Ready Summary](./production-ready-summary.md)**
   - Production deployment with Infisical
   - Security architecture
   - Monitoring and maintenance
   - Rollback procedures

5. **[Docker Production Deployment](./DOCKER_PRODUCTION_DEPLOYMENT.md)**
   - Complete production deployment guide
   - Step-by-step instructions
   - Troubleshooting section
   - Best practices

---

## 🎯 Quick Start

### Development
```bash
# Start Docker with Infisical
docker-compose up -d

# Verify Infisical connection
docker-compose logs api | grep INFISICAL
```

### Production
```bash
# Deploy with Infisical
docker-compose --env-file .env.production up -d

# Verify production deployment
docker-compose logs api | grep "prod"
```

---

## 🔧 Configuration Files

- `.env` - Development environment
- `.env.example` - Environment template
- `.env.production.example` - Production template
- `docker-compose.yml` - Production configuration
- `docker-compose.override.yml` - Development configuration

---

## 📊 Architecture

```
Development:
  docker-compose.override.yml
      ↓
  Infisical (dev environment)
      ↓
  Secrets fetched and cached

Production:
  docker-compose.yml
      ↓
  Infisical (prod environment)
      ↓
  Secrets fetched and cached
```

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` or `.env.production` to git
2. ✅ Use different Machine Identities for dev/prod
3. ✅ Rotate secrets regularly (90 days recommended)
4. ✅ Enable audit logging in Infisical
5. ✅ Monitor secret access patterns
6. ✅ Use fallback values only for emergencies

---

## 📞 Support

### Documentation
- [Infisical Setup Guide](./infisical-setup.md)
- [Quick Reference](./infisical-quick-reference.md)
- [Production Deployment](./DOCKER_PRODUCTION_DEPLOYMENT.md)

### Tools
- Test script: `./scripts/test-infisical-docker.sh`
- Debug script: `./packages/shared/src/config/infisical.ts`

### External Links
- Infisical Documentation: https://infisical.com/docs
- Infisical Instance: https://infisical.ajianaz.dev

---

**Last Updated:** 2025-01-20
**Status:** ✅ Production Ready
