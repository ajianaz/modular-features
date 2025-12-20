# Secrets Management Guides

Complete documentation for secrets management using Infisical.

---

## 📚 Available Guides

### 1. [Infisical Setup Guide](./infisical-setup.md)
Complete guide for integrating Infisical secrets management into the Modular Monolith project.

**Topics Covered:**
- Prerequisites & requirements
- Infisical configuration
- Project setup in Infisical
- Importing secrets from .env
- Machine Identity setup (Universal Auth)
- Local development workflow
- Production deployment (Docker, Kubernetes)
- Troubleshooting common issues

**Target Audience:** Developers, DevOps Engineers

**Estimated Reading Time:** 20 minutes

---

### 2. [Infisical Quick Reference](./infisical-quick-reference.md)
Quick reference guide for using Infisical after initial setup.

**Topics Covered:**
- Implementation summary
- How to use checklist
- API reference
- Environment variables reference
- Security best practices
- Troubleshooting quick fixes

**Target Audience:** Developers (after setup)

**Estimated Reading Time:** 10 minutes

---

## 🚀 Getting Started

### New to Infisical?

Start with the **[Infisical Setup Guide](./infisical-setup.md)** for complete step-by-step instructions.

### Already Set Up?

Use the **[Infisical Quick Reference](./infisical-quick-reference.md)** for daily usage.

---

## 📋 What is Secrets Management?

**Secrets management** is the practice of securely managing sensitive information like:
- API keys
- Database passwords
- OAuth tokens
- Private keys
- Configuration secrets

### Why Use Infisical?

| Without Infisical | With Infisical |
|-------------------|---------------|
| ❌ Secrets in `.env` files | ✅ Encrypted in vault |
| ❌ Risk of committing secrets to git | ✅ Never in code |
| ❌ Manual secret rotation | ✅ Automatic rotation |
| ❌ No audit trail | ✅ Complete access logs |
| ❌ Same secrets for all environments | ✅ Environment-specific |

---

## 🎯 Key Concepts

### 1. **Project**
Container for your secrets with multiple environments.

### 2. **Environment**
Separate secret sets for dev/staging/production.

### 3. **Machine Identity**
Service account that allows applications to authenticate with Infisical automatically.

### 4. **Universal Auth**
Authentication method using Client ID + Client Secret (no user interaction needed).

### 5. **Secret Caching**
Temporary storage of secrets to reduce API calls (default: 5 minutes).

---

## 🔗 Related Documentation

- [Configuration Guide](../../guides/project_structure.md) - Environment variables structure
- [Deployment Guide](../../guides/development_guide.md) - Production deployment
- [Security Best Practices](../implementation_checklist.md) - Security guidelines

---

## 📞 Support & Resources

### Official Resources
- [Infisical Official Docs](https://infisical.com/docs)
- [Infisical Node.js SDK](https://infisical.com/docs/sdks/languages/node)
- [Infisical GitHub](https://github.com/Infisical/infisical)

### Internal Resources
- Create issue in project repository
- Contact DevOps team
- Check team Slack channel

---

## 📝 Maintenance

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-20 | Initial documentation |

---

**Last Updated:** 2025-01-20
