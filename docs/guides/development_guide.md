# 🛠️ Development Guide

**Version:** 1.0.0  
**Date:** December 13, 2024  
**Purpose:** Complete development workflow and best practices

---

## 📋 Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Development Workflow](#2-development-workflow)
3. [Coding Standards](#3-coding-standards)
4. [Testing Strategy](#4-testing-strategy)
5. [Debugging Guide](#5-debugging-guide)
6. [Common Issues & Solutions](#6-common-issues--solutions)

---

## 1. ENVIRONMENT SETUP

### 1.1 Prerequisites

```bash
# Check versions
node --version          # v20+
bun --version          # v1.0+
docker --version        # v20+
psql --version         # v14+
```

### 1.2 Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd saas-boilerplate

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env.local

# Setup database
cd packages/database
bun run migrate
bun run seed

# Return to API directory
cd ../../packages/api
```

### 1.3 Development Environment Variables

```env
# .env.local
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_dev

# Auth
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=saas
KEYCLOAK_CLIENT_ID=saas-app
JWT_SECRET=your-secret-key

# Payment (dummy for development)
POLAR_API_KEY=dummy_key
MIDTRANS_SERVER_KEY=dummy_key
XENDIT_API_KEY=dummy_key
COINBASE_API_KEY=dummy_key

# Email (use console in development)
SENDGRID_API_KEY=dummy_key

# SMS (use console in development)
TWILIO_AUTH_TOKEN=dummy_token

# Firebase (use dummy for development)
FIREBASE_CONFIG=dummy_config
```

### 1.4 Database Setup

```bash
# Using Docker (recommended)
docker run --name postgres-saas \
  -e POSTGRES_DB=saas_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
cd packages/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_dev \
  bun run migrate

# Seed database
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_dev \
  bun run seed
```

---

## 2. DEVELOPMENT WORKFLOW

### 2.1 Daily Development Flow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create/switch to feature branch
git checkout -b feature/user-profile-enhancement

# 3. Install any new dependencies
bun install

# 4. Start development server
bun run dev

# 5. Run tests in parallel (new terminal)
bun run test:watch

# 6. Make changes
# 7. Commit and push
git add .
git commit -m "feat: enhance user profile validation"
git push origin feature/user-profile-enhancement
```

### 2.2 Git Workflow

```bash
# Branch naming convention
feature/auth-oauth2          ← New feature
fix/payment-webhook-handler    ← Bug fix
refactor/user-repository       ← Refactoring
docs/update-api-endpoints      ← Documentation

# Commit message format
<type>(<scope>): <description>

# Examples:
feat(auth): add OAuth2 provider support
fix(payments): handle webhook timeout issue
refactor(database): optimize query performance
docs(api): update payment endpoints documentation
```

### 2.3 Code Review Process

```bash
# 1. Create pull request
gh pr create --title "feat: Add OAuth2 provider support"

# 2. Ensure all checks pass:
#    - Linting
#    - Type checking
#    - Unit tests
#    - Integration tests
#    - Test coverage >80%

# 3. Request review from team member

# 4. Address feedback

# 5. Merge to main
git checkout main
git pull origin main
git merge feature/auth-oauth2
git push origin main
```

---

## 3. CODING STANDARDS

### 3.1 TypeScript Configuration

```json
// tsconfig.json (strict mode)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3.2 File Naming Conventions

```typescript
// Entities
User.entity.ts
Payment.entity.ts
Project.entity.ts

// Use Cases
LoginUseCase.ts
CreatePaymentUseCase.ts
UpdateUserProfileUseCase.ts

// Repositories
UserRepository.ts
PaymentRepository.ts

// Controllers
UserController.ts
PaymentController.ts

// DTOs
LoginRequest.ts
LoginResponse.ts

// Tests
User.entity.test.ts
LoginUseCase.test.ts
UserController.test.ts
```

### 3.3 Code Style

```typescript
// ✅ GOOD: Clear, readable code
class UserService {
  constructor(
    private userRepository: IUserRepository,
    private notificationService: INotificationService
  ) {}

  async updateUserProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const updatedUser = await this.userRepository.update(userId, data);
    
    await this.notificationService.sendProfileUpdatedNotification(
      userId,
      updatedUser
    );

    return UserMapper.toResponse(updatedUser);
  }
}

// ❌ BAD: Unclear, nested code
class UserService {
  async updateUser(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updated = await this.userRepo.update(userId, data);
    await this.notif.send(userId, updated);
    return updated;
  }
}
```

### 3.4 Error Handling

```typescript
// Domain errors (no HTTP knowledge)
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with id ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

// Application errors
export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

// HTTP error mapping (in controller)
catch (error) {
  if (error instanceof UserNotFoundError) {
    return c.json({ error: error.message }, 404);
  }
  if (error instanceof InvalidCredentialsError) {
    return c.json({ error: error.message }, 401);
  }
  // Log unexpected errors
  logger.error('Unexpected error', error);
  return c.json({ error: 'Internal server error' }, 500);
}
```

### 3.5 Import Patterns

```typescript
// ✅ GOOD: From public APIs
import { User } from '@/features/users';
import { PaymentService } from '@/features/payments';

// ✅ GOOD: From shared packages
import { DomainError } from '@repo/shared';
import { db } from '@repo/database';

// ❌ BAD: Direct infrastructure imports
import { UserRepository } from '@/features/users/infrastructure/repositories/UserRepository';

// ✅ GOOD: Absolute imports with aliases
import { LoginUseCase } from '@/features/auth/application/usecases';
import { IUserRepository } from '@/features/auth/domain/interfaces';
```

---

## 4. TESTING STRATEGY

### 4.1 Unit Testing

```typescript
// src/features/auth/application/usecases/LoginUseCase.test.ts
import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { LoginUseCase } from './LoginUseCase';
import { UserNotFoundError } from '@/features/auth/domain/errors';
import { InvalidCredentialsError } from '@/features/auth/domain/errors';
import { User } from '@/features/auth/domain/entities/User';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockHashProvider: jest.Mocked<IHashProvider>;
  let mockTokenGenerator: jest.Mocked<ITokenGenerator>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockHashProvider = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as any;

    mockTokenGenerator = {
      generate: jest.fn(),
    } as any;

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockHashProvider,
      mockTokenGenerator
    );
  });

  it('should login valid user', async () => {
    // Arrange
    const user = new User('1', 'test@example.com', 'hashed_password');
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashProvider.compare.mockResolvedValue(true);
    mockTokenGenerator.generate.mockResolvedValue('access_token');

    const request = new LoginRequest('test@example.com', 'password');

    // Act
    const result = await loginUseCase.execute(request);

    // Assert
    expect(result.accessToken).toBe('access_token');
    expect(result.userId).toBe('1');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockHashProvider.compare).toHaveBeenCalledWith('password', 'hashed_password');
    expect(mockTokenGenerator.generate).toHaveBeenCalledWith('1');
  });

  it('should throw error for invalid credentials', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(null);
    const request = new LoginRequest('test@example.com', 'password');

    // Act & Assert
    await expect(loginUseCase.execute(request))
      .rejects
      .toThrow(InvalidCredentialsError);
  });
});
```

### 4.2 Integration Testing

```typescript
// src/features/auth/infrastructure/repositories/UserRepository.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { UserRepository } from './UserRepository';
import { TestDatabase } from '@/test/utils/TestDatabase';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
    userRepository = new UserRepository(testDb.getClient());
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it('should save and find user', async () => {
    // Arrange
    const user = new User('1', 'test@example.com', 'hashed_password');

    // Act
    await userRepository.save(user);
    const foundUser = await userRepository.findByEmail('test@example.com');

    // Assert
    expect(foundUser).not.toBeNull();
    expect(foundUser!.email).toBe('test@example.com');
    expect(foundUser!.passwordHash).toBe('hashed_password');
  });
});
```

### 4.3 E2E Testing

```typescript
// tests/e2e/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '@/app';
import { createTestClient } from '@/test/utils/createTestClient';

describe('Auth API E2E', () => {
  let client: ReturnType<typeof createTestClient>;

  beforeAll(() => {
    client = createTestClient(app);
  });

  it('should login user', async () => {
    // Arrange
    await client.post('/auth/register', {
      email: 'test@example.com',
      password: 'password123'
    });

    // Act
    const response = await client.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.data.accessToken).toBeDefined();
    expect(response.data.userId).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    // Act
    const response = await client.post('/auth/login', {
      email: 'test@example.com',
      password: 'wrong_password'
    });

    // Assert
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('Invalid credentials');
  });
});
```

### 4.4 Test Commands

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun test src/features/auth/application/usecases/LoginUseCase.test.ts

# Run tests matching pattern
bun test --grep "LoginUseCase"

# Run integration tests only
bun test --testPathPattern=integration

# Run E2E tests only
bun test --testPathPattern=e2e
```

---

## 5. DEBUGGING GUIDE

### 5.1 VS Code Debugging Setup

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Bun",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/bun",
      "args": ["run", "dev"],
      "cwd": "${workspaceFolder}/packages/api",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 5.2 Database Debugging

```bash
# Connect to database
psql postgresql://postgres:password@localhost:5432/saas_dev

# Check tables
\dt

# Check table structure
\d users

# Run queries
SELECT * FROM users WHERE email = 'test@example.com';

# Check indexes
\d users

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### 5.3 API Debugging

```bash
# Test API endpoints
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v

# Check response headers
curl -I http://localhost:3000/auth/me

# Test with authentication token
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer your_access_token"
```

### 5.4 Log Debugging

```typescript
// Enable debug logging
const logger = createLogger({
  level: 'debug', // Change to 'debug' for development
  format: 'json',
});

// Add debug logs
logger.debug('User repository: findByEmail called', { email });

// Debug use case execution
logger.debug('LoginUseCase: executing', { 
  email: request.email,
  timestamp: new Date().toISOString()
});

// Debug database queries
logger.debug('Database query executed', { 
  query: 'SELECT * FROM users WHERE email = $1',
  params: [email],
  duration: ms
});
```

---

## 6. COMMON ISSUES & SOLUTIONS

### 6.1 Database Issues

#### Issue: Connection Refused
```bash
# Problem
DATABASE_URL=postgresql://user:pass@localhost:5432/db
# Error: Connection refused

# Solution
# 1. Check if PostgreSQL is running
docker ps | grep postgres

# 2. Start PostgreSQL if not running
docker start postgres-container-name

# 3. Check port
lsof -i :5432

# 4. Verify DATABASE_URL format
# postgresql://username:password@host:port/database
```

#### Issue: Migration Fails
```bash
# Problem
bun run migrate
# Error: Table already exists

# Solution
# 1. Check migration status
bun run migrate:status

# 2. Rollback if needed
bun run migrate:rollback

# 3. Force reset (development only)
bun run migrate:reset
bun run migrate

# 4. Check migration files
ls packages/database/src/migrations/
```

### 6.2 API Issues

#### Issue: Port Already in Use
```bash
# Problem
bun run dev
# Error: Port 3000 already in use

# Solution
# 1. Find process using port
lsof -i :3000

# 2. Kill process
kill -9 <PID>

# 3. Or change port in .env.local
PORT=3001
```

#### Issue: CORS Error
```bash
# Problem
# Browser: CORS policy error

# Solution
# Check CORS middleware in app.ts
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

# For development, allow all origins (not recommended for production)
app.use('/*', cors({
  origin: true,
  credentials: true,
}));
```

### 6.3 Module Issues

#### Issue: Module Not Found
```bash
# Problem
import { User } from '@/features/users'
# Error: Cannot find module

# Solution
# 1. Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 2. Install dependencies
bun install

# 3. Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart"
```

#### Issue: Circular Dependency
```bash
# Problem
# Error: Circular dependency detected

# Solution
# 1. Check imports
# Service A imports Service B
# Service B imports Service A

# 2. Refactor to use shared interfaces
# Move shared interfaces to domain layer

# 3. Use dependency injection
# Don't import concrete classes directly
```

### 6.4 Testing Issues

#### Issue: Test Database Not Found
```bash
# Problem
bun test
# Error: Database connection failed

# Solution
# 1. Set test database URL
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_test

# 2. Create test database
createdb saas_test

# 3. Run migrations on test database
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_test \
  bun run migrate

# 4. Update test configuration
# In vitest.config.ts
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
```

#### Issue: Test Coverage Low
```bash
# Problem
bun run test:coverage
# Coverage: 45%

# Solution
# 1. Identify uncovered files
# Check coverage report: coverage/lcov-report/index.html

# 2. Add tests for uncovered code
# Focus on domain entities and use cases

# 3. Use coverage thresholds
# In vitest.config.ts
{
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
}
```

### 6.5 Performance Issues

#### Issue: Slow API Response
```bash
# Problem
# API response time > 2 seconds

# Solution
# 1. Add performance logging
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path}: ${duration}ms`);
});

# 2. Check database queries
# Enable query logging
const db = drizzle(dbConnection, { logger: true });

# 3. Add database indexes
# Example: Add index to email column
await db.execute(`
  CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);
`);

# 4. Implement caching
# Use Redis for frequently accessed data
```

---

## 📝 Development Checklist

Before committing code:

- [ ] Code follows naming conventions
- [ ] TypeScript types are strict
- [ ] Error handling is implemented
- [ ] Unit tests are written (>80% coverage)
- [ ] Integration tests are passing
- [ ] Documentation is updated
- [ ] No hardcoded secrets
- [ ] Database migrations are created
- [ ] API endpoints are tested
- [ ] Linter and formatter are applied

---

## 🚀 Quick Reference Commands

```bash
# Development
bun run dev                    # Start development server
bun run build                  # Build for production
bun run start                  # Start production server

# Database
bun run migrate                # Run migrations
bun run migrate:rollback       # Rollback last migration
bun run migrate:reset          # Reset database
bun run seed                   # Seed database

# Testing
bun run test                  # Run all tests
bun run test:watch            # Run tests in watch mode
bun run test:coverage         # Run tests with coverage
bun run test:integration      # Run integration tests only
bun run test:e2e              # Run E2E tests only

# Code Quality
bun run lint                  # Run ESLint
bun run format                 # Run Prettier
bun run type-check             # Run TypeScript check

# Docker
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
```

---

**Document Owner:** Development Team  
**Last Updated:** December 13, 2024  
**Next Review:** January 13, 2025

---

*Happy coding! 🚀*
