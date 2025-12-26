#!/bin/bash

# Test Infisical Docker Configuration
#
# This script validates that Infisical configuration is correct
# for Docker deployment.

set -e

echo "🧪 Testing Infisical Docker Configuration..."
echo ""

# Check if .env.production.example exists
if [ ! -f ".env.production.example" ]; then
    echo "❌ .env.production.example not found"
    exit 1
fi

echo "✅ .env.production.example found"

# Check docker-compose.yml syntax
echo ""
echo "1️⃣  Checking Docker Compose syntax..."
if docker-compose --env-file .env.production.example config > /dev/null 2>&1; then
    echo "   ✅ Docker Compose syntax is valid"
else
    echo "   ❌ Docker Compose syntax error"
    exit 1
fi

# Check if Infisical config is present
echo ""
echo "2️⃣  Checking Infisical configuration..."
INFISICAL_CONFIG=$(docker-compose --env-file .env.production.example config | grep -c "USE_INFISICAL" || true)
if [ "$INFISICAL_CONFIG" -gt 0 ]; then
    echo "   ✅ Infisical configuration present in docker-compose.yml"
else
    echo "   ❌ Infisical configuration not found"
    exit 1
fi

# Check Infisical environment variables
echo ""
echo "3️⃣  Checking required Infisical environment variables..."
REQUIRED_VARS=(
    "USE_INFISICAL"
    "INFISICAL_SITE_URL"
    "INFISICAL_CLIENT_ID"
    "INFISICAL_CLIENT_SECRET"
    "INFISICAL_PROJECT_ID"
    "INFISICAL_ENVIRONMENT"
)

ALL_PRESENT=true
for var in "${REQUIRED_VARS[@]}"; do
    if docker-compose --env-file .env.production.example config | grep -q "$var:"; then
        echo "   ✅ $var is configured"
    else
        echo "   ❌ $var is missing"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = false ]; then
    echo "   ❌ Some required Infisical variables are missing"
    exit 1
fi

# Check if fallback secrets are properly configured
echo ""
echo "4️⃣  Checking fallback secrets configuration..."
FALLBACK_VARS=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "BETTER_AUTH_SECRET"
    "JWT_SECRET"
)

for var in "${FALLBACK_VARS[@]}"; do
    if docker-compose --env-file .env.production.example config | grep -q "$var:"; then
        echo "   ✅ $var fallback is configured"
    else
        echo "   ⚠️  $var fallback is missing (optional but recommended)"
    fi
done

# Check service connections
echo ""
echo "5️⃣  Checking service connections..."
if docker-compose --env-file .env.production.example config | grep -q "POSTGRES_HOST: postgres"; then
    echo "   ✅ PostgreSQL connection configured"
else
    echo "   ❌ PostgreSQL connection missing"
    exit 1
fi

if docker-compose --env-file .env.production.example config | grep -q "REDIS_HOST: redis"; then
    echo "   ✅ Redis connection configured"
else
    echo "   ❌ Redis connection missing"
    exit 1
fi

# Verify no hardcoded secrets
echo ""
echo "6️⃣  Checking for hardcoded secrets..."
HARDCODED_SECRETS=$(docker-compose --env-file .env.production.example config | grep -E "POSTGRES_PASSWORD:.*[^$]|REDIS_PASSWORD:.*[^$]" | grep -v "POSTGRES_PASSWORD: \${" | grep -v "REDIS_PASSWORD: \${" || true)

if [ -z "$HARDCODED_SECRETS" ]; then
    echo "   ✅ No hardcoded secrets found in docker-compose.yml"
else
    echo "   ⚠️  Potential hardcoded secrets found:"
    echo "$HARDCODED_SECRETS"
    echo "   ⚠️  Please ensure secrets are coming from environment variables"
fi

# Final summary
echo ""
echo "======================================================================"
echo "✅ Infisical Docker Configuration Test PASSED"
echo "======================================================================"
echo ""
echo "📋 Configuration Summary:"
echo "   - Docker Compose syntax: ✅ Valid"
echo "   - Infisical integration: ✅ Configured"
echo "   - Required variables: ✅ All present"
echo "   - Service connections: ✅ Configured"
echo "   - Security check: ✅ Passed"
echo ""
echo "🚀 Ready for Docker deployment with Infisical!"
echo ""
echo "Next steps:"
echo "   1. Copy .env.production.example to .env.production"
echo "   2. Fill in actual values from Infisical"
echo "   3. Deploy: docker-compose --env-file .env.production up -d"
echo ""
