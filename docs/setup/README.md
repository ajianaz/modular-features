# Setup Documentation

This directory contains comprehensive setup guides for the Modular Features API project.

## 📋 Setup Order (Recommended)

Follow this order when setting up the project for the first time:

### Phase 1: Infrastructure Setup
1. **[Docker & Services](./docker/README.md)** - Docker, PostgreSQL, Redis, Keycloak
2. **[Database](./database/README.md)** - Database schema, migrations, seeding
3. **[Infisical](./infisical/README.md)** - Secrets management (this guide)

### Phase 2: Application Setup
4. **[Authentication](./authentication/README.md)** - BetterAuth + Keycloak OAuth setup
5. **[Environment Configuration](./environment/README.md)** - Environment variables and config

### Phase 3: Development Setup
6. **[Development Environment](./development/README.md)** - Local development setup
7. **[Testing](./testing/README.md)** - Test configuration and running tests

## 📁 Directory Structure

```
docs/setup/
├── README.md                  # This file - Setup order overview
├── infisical/                 # Infisical secrets management
│   ├── README.md             # Quick start guide
│   ├── SETUP.md              # Complete setup guide
│   └── SECRETS_QUICK_REF.md  # All secrets reference
├── docker/                    # Docker setup (coming soon)
├── database/                  # Database setup (coming soon)
├── authentication/            # Authentication setup (coming soon)
└── environment/               # Environment configuration (coming soon)
```

## 🚀 Quick Start

If you're setting up the project for the first time:

```bash
# 1. Start Docker services
docker-compose up -d postgres redis keycloak

# 2. Setup Infisical
cd docs/setup/infisical
# Follow README.md

# 3. Generate RSA keys
bun run auth:generate-keys

# 4. Run database migrations
bun run db:push

# 5. Start the API
bun run dev:api
```

## 📖 Available Setup Guides

### 1. Infisical Secrets Management

**Location:** [infisical/](./infisical/)

**What it covers:**
- Infisical CLI installation and configuration
- RSA key generation for JWT signing
- All environment variables for Infisical
- Development, staging, and production setup
- Docker and CI/CD integration

**When to use:**
- First time setup
- Setting up new environment (dev/staging/prod)
- Rotating secrets or RSA keys
- Configuring CI/CD pipelines

**Quick start:**
```bash
# Read the quick start
cat docs/setup/infisical/README.md

# Generate keys
bun run auth:generate-keys

# Login and run
infisical run -- bun run dev:api
```

**Files:**
- **[README.md](./infisical/README.md)** - Quick start guide
- **[SETUP.md](./infisical/SETUP.md)** - Complete detailed setup
- **[SECRETS_QUICK_REF.md](./infisical/SECRETS_QUICK_REF.md)** - All secrets reference

### 2. Docker Setup (Coming Soon)

**Location:** [docker/](./docker/)

**What it will cover:**
- Docker Compose configuration
- Service orchestration
- Local development setup
- Production deployment

### 3. Database Setup (Coming Soon)

**Location:** [database/](./database/)

**What it will cover:**
- PostgreSQL setup
- Database schema
- Migration scripts
- Seeding and testing data

### 4. Authentication Setup (Coming Soon)

**Location:** [authentication/](./authentication/)

**What it will cover:**
- BetterAuth configuration
- Keycloak OAuth setup
- JWT RS256 tokens
- Session management

### 5. Environment Setup (Coming Soon)

**Location:** [environment/](./environment/)

**What it will cover:**
- Environment variables
- Configuration management
- Feature flags
- Environment-specific settings

## 🔧 Common Setup Tasks

### First Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd modular-feature
bun install

# 2. Setup Docker
docker-compose up -d postgres redis keycloak

# 3. Setup Infisical
# Follow: docs/setup/infisical/README.md
infisical login
bun run auth:generate-keys

# 4. Copy secrets to Infisical dashboard
# Use: docs/setup/infisical/SECRETS_QUICK_REF.md

# 5. Run migrations
infisical run -- bun run db:push

# 6. Start API
infisical run -- bun run dev:api
```

### Adding New Environment (Staging/Production)

```bash
# 1. Create new environment in Infisical
# Via Infisical UI: Project > Environments > New Environment

# 2. Set environment
export INFISICAL_ENVIRONMENT=staging

# 3. Configure environment-specific values
# Update URLs, databases, etc. in Infisical

# 4. Deploy
infisical run --env=staging -- bun run start
```

### Rotating Secrets

```bash
# 1. Rotate RSA keys
bun run auth:generate-keys

# 2. Update Infisical
# Copy new JWT_RS256_* values to Infisical dashboard

# 3. Restart services
infisical run -- docker-compose restart api
```

## 📚 Additional Resources

### Project Documentation
- **[Main README](../../README.md)** - Project overview
- **[Architecture](../architecture/README.md)** - System architecture
- **[Features](../features/README.md)** - Feature modules
- **[Deployment](../deployment/README.md)** - Deployment guides

### External Documentation
- **[BetterAuth](https://www.better-auth.com)** - Authentication library
- **[Keycloak](https://www.keycloak.org/documentation)** - Identity provider
- **[Infisical](https://infisical.com/docs)** - Secrets management
- **[Docker](https://docs.docker.com)** - Containerization

## 🆘 Troubleshooting

### Common Issues

**Problem:** Cannot connect to Infisical
```bash
# Check connection
curl $INFISICAL_SITE_URL

# Re-login
infisical login
```

**Problem:** RSA keys not loading
```bash
# Check keys are loaded
infisical run -- env | grep JWT_RS256

# Regenerate keys
bun run auth:generate-keys
```

**Problem:** Database connection failed
```bash
# Check Docker services
docker-compose ps

# Check database logs
docker-compose logs postgres
```

### Getting Help

If you encounter issues:

1. Check the specific setup guide in this directory
2. Check the main [README](../../README.md) for common issues
3. Check the [troubleshooting guide](../troubleshooting/README.md)
4. Open an issue on GitHub

## 🔄 Keeping Documentation Updated

When adding new setup guides:

1. Create new directory in `docs/setup/<topic>/`
2. Add README.md with quick start
3. Add detailed guides as needed
4. Update THIS README.md with:
   - Add to "Setup Order" section
   - Add to "Available Setup Guides" section
   - Update directory structure

## 📝 Checklist

Before starting development, ensure you've:

- [ ] Completed Docker setup
- [ ] Configured Infisical
- [ ] Generated RSA keys
- [ ] Added secrets to Infisical
- [ ] Run database migrations
- [ ] Started API successfully
- [ ] Verified health endpoints
- [ ] Tested authentication flow

## 🎯 Next Steps

After completing setup:

1. Read [Development Guide](../development/README.md)
2. Explore [Feature Modules](../features/README.md)
3. Check [API Documentation](../api/README.md)
4. Start building! 🚀
