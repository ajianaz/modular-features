# Docker Development Guides

Complete guides for Docker-based development and deployment.

## 📚 Available Guides

### Core Docker Guide
**[Docker Development Guide](./docker-development.md)**
- Docker Compose setup
- Service configuration
- Development workflow
- Troubleshooting

### Related Guides
- [Secrets Management](../secrets-management/) - Infisical integration
- [Development Guide](../development_guide.md) - Overall development setup

---

## 🎯 Quick Start

### Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Available Services

| Service | Port | Description |
|---------|------|-------------|
| API | 3000 | Main application |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| MinIO | 9000, 9001 | S3-compatible storage |
| pgAdmin | 5050 | Database management (optional) |
| Redis Commander | 8081 | Redis management (optional) |

---

## 🔧 Configuration Files

- `docker-compose.yml` - Production configuration
- `docker-compose.override.yml` - Development configuration
- `.env` - Environment variables
- `Dockerfile` - Application build definition

---

## 📊 Development Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f api

# 4. Restart service
docker-compose restart api

# 5. Rebuild after changes
docker-compose up -d --build

# 6. Stop all
docker-compose down
```

---

## 🔍 Troubleshooting

### Container Not Starting
```bash
# Check logs
docker-compose logs api

# Check container status
docker-compose ps

# Rebuild
docker-compose up -d --build
```

### Port Conflicts
```bash
# Check what's using the port
lsof -i :3000

# Change port in .env
PORT=3001
```

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database is healthy
docker-compose ps
```

---

## 🚀 Production Deployment

For production deployment, see:
- [Production Deployment Guide](../secrets-management/DOCKER_PRODUCTION_DEPLOYMENT.md)
- [Secrets Management](../secrets-management/)

---

**Last Updated:** 2025-01-20
