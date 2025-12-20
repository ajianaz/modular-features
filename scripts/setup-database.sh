#!/bin/bash

# =============================================================================
# Database Setup Script (Bash Version)
# More reliable than TypeScript for shell operations
# =============================================================================

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
DB_NAME=${POSTGRES_DB:-modular_monolith}
DB_USER=${POSTGRES_USER:-postgres}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
FORCE_RECREATE=${FORCE_DB_RECREATE:-false}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up database...${NC}"
echo -e "${BLUE}📦 Database: ${DB_NAME}${NC}"
echo -e "${BLUE}👤 User: ${DB_USER}${NC}"
echo -e "${BLUE}🌐 Host: ${DB_HOST}:${DB_PORT}${NC}"
echo ""

# Function to execute SQL via Docker
exec_sql_docker() {
    local database=$1
    local sql=$2
    
    docker exec -i modular-monolith-postgres psql -U "$DB_USER" -d "$database" -v ON_ERROR_STOP=1 -q <<< "$sql" 2>&1
}

# Function to execute SQL via psql
exec_sql_psql() {
    local database=$1
    local sql=$2
    
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$database" -v ON_ERROR_STOP=1 -q <<< "$sql" 2>&1
}

# Check if using Docker
if docker ps | grep -q "modular-monolith-postgres"; then
    echo -e "${GREEN}✓ Using Docker PostgreSQL${NC}"
    USE_DOCKER=true
else
    echo -e "${YELLOW}⚠ Docker container not found, using direct psql connection${NC}"
    USE_DOCKER=false
fi

# Force recreate if requested
if [ "$FORCE_RECREATE" = "true" ]; then
    echo -e "${YELLOW}⚠️  FORCE_DB_RECREATE is true. Dropping existing database...${NC}"
    
    # Disconnect all active connections
    DISCONNECT_SQL="SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
    
    if [ "$USE_DOCKER" = "true" ]; then
        exec_sql_docker "postgres" "$DISCONNECT_SQL" 2>/dev/null || true
        exec_sql_docker "postgres" "DROP DATABASE IF EXISTS ${DB_NAME};"
    else
        exec_sql_psql "postgres" "$DISCONNECT_SQL" 2>/dev/null || true
        exec_sql_psql "postgres" "DROP DATABASE IF EXISTS ${DB_NAME};"
    fi
    
    echo -e "${GREEN}✅ Database dropped${NC}"
fi

# Create database
echo -e "${BLUE}📦 Creating database...${NC}"

# Check if database exists first using psql meta-command
if [ "$USE_DOCKER" = "true" ]; then
    DB_LIST=$(docker exec modular-monolith-postgres psql -U "$DB_USER" -d postgres -t -c "SELECT datname FROM pg_database WHERE datname = '${DB_NAME}';" 2>/dev/null || echo "")
else
    DB_LIST=$(PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -t -c "SELECT datname FROM pg_database WHERE datname = '${DB_NAME}';" 2>/dev/null || echo "")
fi

if echo "$DB_LIST" | grep -q "$DB_NAME"; then
    echo -e "${YELLOW}ℹ️  Database \"${DB_NAME}\" already exists${NC}"
else
    echo -e "${BLUE}   Database not found, creating...${NC}"
    
    # Database doesn't exist, create it
    if [ "$USE_DOCKER" = "true" ]; then
        docker exec modular-monolith-postgres psql -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} WITH OWNER = ${DB_USER} ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' TEMPLATE = template0 CONNECTION LIMIT = -1;"
        docker exec modular-monolith-postgres psql -U "$DB_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    else
        PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "CREATE DATABASE ${DB_NAME} WITH OWNER = ${DB_USER} ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' TEMPLATE = template0 CONNECTION LIMIT = -1;"
        PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    fi

    echo -e "${GREEN}✅ Database \"${DB_NAME}\" created successfully${NC}"
fi

# Verify database exists
echo -e "${BLUE}🔍 Verifying database exists...${NC}"
VERIFY_SQL="SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';"

if [ "$USE_DOCKER" = "true" ]; then
    RESULT=$(exec_sql_docker "postgres" "$VERIFY_SQL")
else
    RESULT=$(exec_sql_psql "postgres" "$VERIFY_SQL")
fi

if [ -n "$RESULT" ]; then
    echo -e "${GREEN}✅ Verified database \"${DB_NAME}\" exists${NC}"
else
    echo -e "${RED}❌ Database \"${DB_NAME}\" does not exist after creation!${NC}"
    exit 1
fi

# Enable extensions
echo -e "${BLUE}🔌 Enabling extensions...${NC}"

# First, verify database is accessible
echo -e "${BLUE}   Checking database accessibility...${NC}"
if [ "$USE_DOCKER" = "true" ]; then
    docker exec modular-monolith-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1
else
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Database is accessible${NC}"
else
    echo -e "${RED}   ❌ Database is NOT accessible! This is the problem.${NC}"
    echo -e "${YELLOW}   Attempting to list all databases...${NC}"
    if [ "$USE_DOCKER" = "true" ]; then
        docker exec modular-monolith-postgres psql -U "$DB_USER" -d postgres -c "\l"
    else
        PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "\l"
    fi
    echo -e "${RED}❌ Cannot proceed. Exiting...${NC}"
    exit 1
fi

# Now enable extensions
if [ "$USE_DOCKER" = "true" ]; then
    docker exec modular-monolith-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    docker exec modular-monolith-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
    docker exec modular-monolith-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"btree_gist\";"
    docker exec modular-monolith-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
else
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"btree_gist\";"
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
fi

echo -e "${GREEN}✅ Extensions enabled successfully${NC}"

# Generate migrations
echo -e "${BLUE}📝 Generating migrations...${NC}"
cd packages/database
export DATABASE_URL="postgresql://${DB_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
bun run db:generate
cd ../..

# Run migrations
echo -e "${BLUE}🚀 Running migrations...${NC}"
cd packages/database
export DATABASE_URL="postgresql://${DB_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
bun run db:migrate
cd ../..

echo ""
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Database info:${NC}"
echo -e "   Database: ${DB_NAME}"
echo -e "   Host: ${DB_HOST}:${DB_PORT}"
echo -e "   User: ${DB_USER}"
echo ""
echo -e "${BLUE}🔗 Connection string:${NC}"
echo -e "   postgresql://${DB_USER}:****@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""
