# Development Documentation

This folder contains development, testing, and deployment guides.

## 📋 Available Guides

### Core Guides

- **[Development Guide](./development_guide.md)** - Development setup and workflow
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing procedures and strategies
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Deployment process and environments
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### Additional Guides

- **[API Development](./API_DEVELOPMENT.md)** - API development best practices
- **[Database Migrations](./DATABASE_MIGRATIONS.md)** - Database migration guide
- **[Code Review](./CODE_REVIEW.md)** - Code review process

---

## 🚀 Quick Start

### New to the Project?

1. Read **[Development Guide](./development_guide.md)** for setup
2. Check **[Project Structure](../guides/project_structure.md)** for overview
3. Review **[Architecture Guide](../guides/architecture_guide.md)** for concepts

### Starting Development?

```bash
# 1. Clone repository
git clone <repo-url>
cd modular-monolith

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env

# 4. Start development
pnpm dev
```

**→** See [Development Guide](./development_guide.md) for details

---

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm test --filter @modular-monolith/api

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**→** See [Testing Guide](./TESTING_GUIDE.md) for details

---

## 🚢 Deployment

### Environments

- **Development** - `http://localhost:3000`
- **Staging** - `https://staging.example.com`
- **Production** - `https://example.com`

### Deployment Steps

```bash
# 1. Build
pnpm build

# 2. Run migrations
pnpm db:migrate:prod

# 3. Deploy
pnpm deploy:prod
```

**→** See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for details

---

## 🔧 Common Development Tasks

### Add New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Create package (if needed)
pnpm --filter @modular-monolith/monorepo new package

# 3. Implement feature
# ... develop ...

# 4. Test
pnpm test

# 5. Build
pnpm build

# 6. Create PR
git push origin feature/new-feature
```

### Add New API Endpoint

```bash
# 1. Add route handler
# In packages/api/src/app.ts

# 2. Add validation schema
# In packages/api/src/schemas/

# 3. Add tests
# In packages/api/src/tests/

# 4. Update documentation
# In docs/features/<feature>/api.md
```

### Database Migration

```bash
# 1. Create migration
pnpm --filter @modular-monolith/database db:migrate:create

# 2. Write migration SQL
# In packages/database/src/migrations/

# 3. Run migration
pnpm db:migrate

# 4. Verify
pnpm db:studio
```

---

## 📖 Development Workflow

### 1. Planning

- Check `/docs/planning/` for design documents
- Review architecture and implementation plans
- Understand requirements and success criteria

### 2. Development

- Follow feature folder structure
- Write tests alongside code
- Document as you go

### 3. Testing

- Write unit tests
- Write integration tests
- Test manually

### 4. Documentation

- Update feature documentation
- Add API examples
- Update README if needed

### 5. Code Review

- Self-review using checklist
- Request peer review
- Address feedback

### 6. Deployment

- Update CHANGELOG
- Tag version
- Deploy to staging
- Test staging
- Deploy to production

---

## 🎯 Best Practices

### Code Quality

- **Write Tests** - Aim for >80% coverage
- **Follow Linting** - Use ESLint and Prettier
- **Type Safety** - Use TypeScript strictly
- **Documentation** - Document complex logic

### Git Workflow

- **Feature Branches** - One branch per feature
- **Commit Messages** - Clear and descriptive
- **Pull Requests** - Descriptive PR description
- **Code Review** - Required for all changes

### Performance

- **Bundle Size** - Monitor bundle size
- **Database Queries** - Optimize queries
- **Caching** - Use caching where appropriate
- **Load Testing** - Test before production

---

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Failed**
   ```bash
   # Check database is running
   docker ps
   
   # Check connection string
   echo $DATABASE_URL
   ```

3. **Module Not Found**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   pnpm install
   ```

**→** See [Troubleshooting](./TROUBLESHOOTING.md) for more

---

## 📚 Additional Resources

### Internal Documentation

- [Architecture Guide](../guides/architecture_guide.md)
- [Feature Documentation](../features/)
- [Planning Documents](../planning/)

### External Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [BetterAuth](https://better-auth.com)

---

## 💬 Getting Help

### Questions?

1. Check documentation first
2. Search existing issues
3. Ask in team chat
4. Create new issue with question

### Bugs?

1. Check if bug already reported
2. Create issue with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

---

**Last Updated:** 2025-01-20
