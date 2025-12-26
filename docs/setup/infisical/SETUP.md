# Infisical Secrets Management Setup

Complete guide for setting up Infisical self-hosted for Modular Features API.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Development   │      │   Infisical      │      │   Production    │
│   (Local)       │─────▶│   Self-Hosted    │◀─────│   (Server)      │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                 │
                                 ├─ Database Secrets
                                 ├─ Redis Secrets
                                 ├─ Keycloak Secrets
                                 ├─ RSA Keys (RS256)
                                 └─ API Secrets
```

## Quick Start

### 1. Install Infisical CLI

Choose your package manager:

**Using npm:**
```bash
npm install -g @infisical/cli
``

**Using pnpm:**
```bash
pnpm add -g @infisical/cli
``

**Using bun:**
```bash
bun install -g @infisical/cli
``

**Using yarn:**
```bash
yarn global add @infisical/cli
``

Verify installation:
```bash
infisical --version
`


### 2. Configure Local Connection

Edit [.env.example](.env.example) with your Infisical credentials:

```bash
# Infisical Self-Hosted Server URL
INFISICAL_SITE_URL=https://infisical.yourdomain.com

# Universal Auth Credentials
INFISICAL_CLIENT_ID=your-client-id-here
INFISICAL_CLIENT_SECRET=your-client-secret-here

# Project Configuration
INFISICAL_PROJECT_ID=your-project-id-here
INFISICAL_ENVIRONMENT=dev
```

**How to get credentials:**
1. Login to Infisical dashboard
2. Go to: Settings > Machine Identities
3. Create Universal Auth client
4. Copy Client ID and Secret

### 3. Login to Infisical

```bash
infisical login --login-url https://infisical.yourdomain.com
```

### 4. Generate RSA Keys

```bash
bun run auth:generate-keys
```

This creates:
- `keys/private.pem` - Private key (SECRET!)
- `keys/public.pem` - Public key
- `keys/private_base64.txt` - For Infisical
- `keys/public_base64.txt` - For Infisical
- `keys/key_id.txt` - For Infisical

### 5. Copy Secrets to Infisical

Go to Infisical dashboard and add these environment variables:

#### Required Secrets (23 variables)

**Database (3):**
```
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/modular_features
```

**Redis (2):**
```
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
```

**BetterAuth (2):**
```
BETTER_AUTH_SECRET=min-32-characters-random-string
BETTER_AUTH_URL=http://localhost:3000
```

**Keycloak OAuth (6):**
```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=modular-features
KEYCLOAK_ISSUER=http://localhost:8080/realms/modular-features
KEYCLOAK_CLIENT_ID=modular-features-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3000/oauth/callback/keycloak
```

**RS256 JWT (3) - From key generation:**
```
JWT_RS256_PRIVATE_KEY_BASE64=<copy from keys/private_base64.txt>
JWT_RS256_PUBLIC_KEY_BASE64=<copy from keys/public_base64.txt>
JWT_RS256_KEY_ID=<copy from keys/key_id.txt>
```

**Feature Flags (3):**
```
ENABLE_RS256_TOKENS=true
ENABLE_KEYCLOAK=true
ENABLE_EMAIL_PASSWORD_AUTH=false
```

**Application (4):**
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
API_VERSION=v1
```

See [INFISICAL_SECRETS_QUICK_REF.md](INFISICAL_SECRETS_QUICK_REF.md) for complete list.

### 6. Enable Infisical

Edit [.env.example](.env.example):
```bash
USE_INFISICAL=true
```

Or use environment variable:
```bash
export USE_INFISICAL=true
```

### 7. Run with Infisical

```bash
# Start all services
infisical run -- docker-compose up

# Start only API
infisical run -- bun run dev:api

# Run database migrations
infisical run -- bun run db:push
```

## Environment Management

### Development Environment

```bash
# Set development environment in .env.example
INFISICAL_ENVIRONMENT=dev

# Run
infisical run -- bun run dev:api
```

### Staging Environment

```bash
# Set staging environment
export INFISICAL_ENVIRONMENT=staging

# Run staging
infisical run --env=staging -- bun run start
```

### Production Environment

```bash
# Set production environment
export INFISICAL_ENVIRONMENT=production

# Run production
infisical run --env=production -- bun run start
```

## How It Works

### Without Infisical (USE_INFISICAL=false)
```
┌────────────┐
│   .env     │ ──▶ App loads from .env file
└────────────┘
```

### With Infisical (USE_INFISICAL=true)
```
┌────────────┐    ┌──────────────┐    ┌─────────────┐
│   .env     │ ──▶│  Infisical   │ ──▶│     App     │
│ (config)   │    │  (secrets)   │    │  (injected) │
└────────────┘    └──────────────┘    └─────────────┘
```

## Verification

### Check Secrets Loaded

```bash
# Check API health
curl http://localhost:3000/api/auth/health

# Expected response:
{
  "status": "healthy",
  "mode": "hybrid",
  "gateway": "better-auth",
  "jwt_support": "RS256"
}
```

### Check JWKS Endpoint

```bash
# Verify RSA keys loaded
curl http://localhost:3000/api/auth/.well-known/jwks.json

# Expected response:
{
  "keys": [{
    "kty": "RSA",
    "kid": "your-key-id-uuid",
    "alg": "RS256",
    "n": "base64-encoded-modulus",
    "e": "AQAB"
  }]
}
```

### Check Database Connection

```bash
# Should show connection logs
infisical run -- bun run dev:api

# Look for:
# [DATABASE] Connecting to PostgreSQL at localhost:5432/modular_features
```

## Docker Integration

### docker-compose.yml

No changes needed! Secrets are injected via Infisical:

```bash
# Start all services with Infisical secrets
infisical run -- docker-compose up

# Start specific services
infisical run -- docker-compose up postgres redis keycloak

# Detached mode
infisical run -- docker-compose up -d
```

### Docker Build

For Docker builds, use Infisical secrets injection:

```bash
# Build with secrets
infisical run -- docker build -t modular-features-api .

# Or build-args for specific secrets
docker build \
  --build-arg POSTGRES_URL="$POSTGRES_URL" \
  --build-arg BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  -t modular-features-api .
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Login to Infisical
  run: |
    npm install -g @infisical/cli
    infisical login --client-id=${{ secrets.INFISICAL_CLIENT_ID }} \
                    --client-secret=${{ secrets.INFISICAL_CLIENT_SECRET }}

- name: Run tests
  run: infisical run -- npm test

- name: Deploy
  run: infisical run --env=production -- npm run deploy
```

### GitLab CI

```yaml
test:
  script:
    - npm install -g @infisical/cli
    - infisical login
    - infisical run -- npm test
```

### Jenkins

```groovy
stage('Test') {
  steps {
    sh 'infisical run -- npm test'
  }
}
```

## Security Best Practices

### 1. Never Commit Secrets
- ✅ Store secrets in Infisical
- ❌ Don't commit .env files
- ✅ .env.example contains only Infisical config
- ❌ Don't put real values in .env.example

### 2. Access Control
- Limit who can access production secrets
- Use separate environments (dev/staging/prod)
- Enable audit logging in Infisical
- Rotate credentials regularly

### 3. Key Rotation
- Rotate RSA keys every 90 days
- Rotate database passwords monthly
- Rotate API keys quarterly
- Update Infisical after rotation

### 4. Monitoring
- Enable Infisical audit logs
- Monitor secret access
- Alert on suspicious activity
- Review access logs regularly

## Troubleshooting

### Secrets Not Loading

**Problem:** Environment variables are empty

**Solution:**
```bash
# Check Infisical connection
infisical login

# Verify environment
echo $INFISICAL_ENVIRONMENT

# Test with explicit env
infisical run --env=dev -- env | grep POSTGRES
```

### RSA Keys Not Working

**Problem:** JWKS endpoint returns empty

**Solution:**
```bash
# Check if keys are loaded
infisical run -- node -e "
console.log('PRIVATE KEY SET:', !!process.env.JWT_RS256_PRIVATE_KEY_BASE64);
console.log('PUBLIC KEY SET:', !!process.env.JWT_RS256_PUBLIC_KEY_BASE64);
console.log('KEY ID SET:', !!process.env.JWT_RS256_KEY_ID);
"

# Regenerate keys if needed
bun run auth:generate-keys
```

### Connection Refused

**Problem:** Cannot connect to Infisical server

**Solution:**
```bash
# Check Infisical URL
echo $INFISICAL_SITE_URL

# Test connectivity
curl $INFISICAL_SITE_URL

# Verify credentials
infisical login --login-url $INFISICAL_SITE_URL
```

### Docker Cannot Access Secrets

**Problem:** Docker containers don't have Infisical secrets

**Solution:**
```bash
# Use infisical run wrapper
infisical run -- docker-compose up

# Or export secrets explicitly
export POSTGRES_URL=$(infisical export --env=dev | grep POSTGRES_URL)
docker-compose up
```

## Advanced Configuration

### Custom Cache Duration

Default cache is 5 minutes. Adjust in [.env.example](.env.example):

```bash
# Cache for 10 minutes
INFISICAL_CACHE_TTL=600000
```

### Multiple Projects

If you have multiple projects:

```bash
# Project A
export INFISICAL_PROJECT_ID=project-a-id
infisical run -- npm start

# Project B
export INFISICAL_PROJECT_ID=project-b-id
infisical run -- npm start
```

### Override Specific Secrets

Locally override specific secrets without changing Infisical:

```bash
# Override database URL locally
export POSTGRES_URL=postgresql://localhost:5432/test_db
infisical run -- bun run dev:api
```

## FAQ

**Q: What if I don't have Infisical?**
A: Set `USE_INFISICAL=false` and use traditional .env file (copy from [.env.example.all](.env.example.all))

**Q: Can I use both Infisical and .env?**
A: Yes! Infisical injects secrets, .env provides config. Local .env overrides Infisical values.

**Q: How do I rotate RSA keys?**
A: Run `bun run auth:generate-keys` again, then update the 3 JWT variables in Infisical.

**Q: What about local development?**
A: Use `USE_INFISICAL=false` with local .env, or setup dev environment in Infisical.

**Q: Can I see all secrets in terminal?**
A: Yes: `infisical run -- env | grep -E "(POSTGRES|REDIS|KEYCLOAK|JWT)"`

## Resources

- **Quick Reference:** [INFISICAL_SECRETS_QUICK_REF.md](INFISICAL_SECRETS_QUICK_REF.md)
- **All Variables:** [.env.example.all](.env.example.all)
- **Infisical Docs:** https://infisical.com/docs
- **BetterAuth Docs:** https://www.better-auth.com
- **Keycloak Docs:** https://www.keycloak.org/documentation

## Next Steps

1. ✅ Install Infisical CLI
2. ✅ Configure [.env.example](.env.example)
3. ✅ Generate RSA keys: `bun run auth:generate-keys`
4. ✅ Add secrets to Infisical dashboard
5. ✅ Test: `infisical run -- bun run dev:api`
6. ✅ Verify: `curl http://localhost:3000/api/auth/health`
7. ✅ Deploy with confidence! 🚀
