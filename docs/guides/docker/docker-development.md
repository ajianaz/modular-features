# Docker Compose Development Environment Guide

## Overview

This guide provides comprehensive instructions for setting up and running the Modular Monolith development environment using Docker Compose.

## Services Available

The Docker Compose configuration includes the following services:

1. **PostgreSQL Database** (Port 5432)
   - Version: PostgreSQL 16 Alpine
   - Database: `modular_monolith`
   - User: `postgres`
   - Password: `postgres123`

2. **Redis Cache** (Port 6379)
   - Version: Redis 7 Alpine
   - Password: `redis123`

3. **PgAdmin** (Port 5050)
   - Web-based PostgreSQL administration
   - Email: `admin@example.com`
   - Password: `admin123`

4. **Redis Commander** (Port 8081)
   - Web-based Redis management interface

5. **MinIO** (Ports 9000, 9001)
   - S3-compatible object storage
   - Console: http://localhost:9001
   - Access Key: `minioadmin`
   - Secret Key: `minioadmin123`

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Sufficient disk space for containers and volumes

## Quick Start

### 1. Environment Setup

Ensure your `.env` file is properly configured. The project includes a `.env.example` file with all necessary variables. Copy it to `.env` if you haven't already:

```bash
cp .env.example .env
```

### 2. Starting Services

To start all services:

```bash
docker-compose up -d
```

This will start all services in detached mode (background).

### 3. Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove all volumes (this will delete all data):

```bash
docker-compose down -v
```

## Service Access

### PostgreSQL Database

- **Host:** localhost
- **Port:** 5432
- **Database:** modular_monolith
- **Username:** postgres
- **Password:** postgres123
- **Connection String:** `postgresql://postgres:postgres123@localhost:5432/modular_monolith`

### Redis

- **Host:** localhost
- **Port:** 6379
- **Password:** redis123
- **Connection String:** `redis://:redis123@localhost:6379`

### PgAdmin

- **URL:** http://localhost:5050
- **Email:** admin@example.com
- **Password:** admin123

To connect to PostgreSQL via PgAdmin:
1. Open http://localhost:5050
2. Login with the credentials above
3. Add a new server:
   - Name: Modular Monolith DB
   - Host: postgres (Docker internal name)
   - Port: 5432
   - Database: modular_monolith
   - Username: postgres
   - Password: postgres123

### Redis Commander

- **URL:** http://localhost:8081
- No authentication required

### MinIO Console

- **API:** http://localhost:9000
- **Console:** http://localhost:9001
- **Access Key:** minioadmin
- **Secret Key:** minioadmin123

## Development Workflow

### Starting Development Environment

1. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Start management tools (optional):**
   ```bash
   docker-compose up -d pgadmin redis-commander
   ```

3. **Start MinIO if needed:**
   ```bash
   docker-compose up -d minio
   ```

4. **Start all services at once:**
   ```bash
   docker-compose up -d
   ```

### Viewing Logs

To view logs for all services:
```bash
docker-compose logs -f
```

To view logs for a specific service:
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restarting Services

To restart a specific service:
```bash
docker-compose restart postgres
```

To restart all services:
```bash
docker-compose restart
```

## Database Management

### Running Migrations

The database initialization is handled by the `init.sql` file located at `docker/postgres/init.sql`. This file:

- Creates necessary extensions (uuid-ossp, pgcrypto)
- Sets up default permissions
- Creates utility functions

For application-specific migrations, use your preferred migration tool (Drizzle, Prisma, etc.) with the connection string from your environment variables.

### Backing Up Data

To backup PostgreSQL data:
```bash
docker-compose exec postgres pg_dump -U postgres modular_monolith > backup.sql
```

To restore PostgreSQL data:
```bash
docker-compose exec -T postgres psql -U postgres modular_monolith < backup.sql
```

To backup Redis data:
```bash
docker-compose exec redis redis-cli --rdb /data/dump.rdb
```

## Troubleshooting

### Common Issues

1. **Port conflicts:** Ensure ports 5432, 6379, 5050, 8081, 9000, and 9001 are not in use
2. **Permission issues:** Make sure Docker has proper permissions
3. **Volume issues:** If data persists unexpectedly, use `docker-compose down -v` to clean volumes

### Checking Service Health

To check if all services are running:
```bash
docker-compose ps
```

To check service health:
```bash
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping
```

### Resetting Environment

To completely reset the development environment:
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d
```

## Production Considerations

This Docker Compose configuration is intended for development only. For production:

1. Use stronger passwords
2. Enable SSL/TLS
3. Configure proper networking
4. Set up monitoring and logging
5. Use environment-specific configuration files
6. Consider using Docker Swarm or Kubernetes for orchestration

## Environment Variables

Key environment variables for Docker services:

```bash
# PostgreSQL
POSTGRES_DB=modular_monolith
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=redis123
REDIS_PORT=6379

# PgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
```

## Additional Commands

### Accessing Container Shells

To access the PostgreSQL container shell:
```bash
docker-compose exec postgres sh
```

To access the Redis container shell:
```bash
docker-compose exec redis sh
```

### Database Connection from Host

You can connect directly to the database using any PostgreSQL client:
- Host: localhost
- Port: 5432
- Database: modular_monolith
- Username: postgres
- Password: postgres123

### Redis Connection from Host

You can connect to Redis using any Redis client:
- Host: localhost
- Port: 6379
- Password: redis123

## Performance Tuning

For optimal development performance:

1. Allocate sufficient memory to Docker Desktop (recommended: 4GB+)
2. Use SSD storage for better I/O performance
3. Consider using Docker volumes for persistent data
4. Monitor resource usage via Docker Desktop

## Security Notes

- This configuration uses default passwords for development
- All services are exposed to localhost only
- No SSL/TLS is configured for development
- Consider using secrets management for production