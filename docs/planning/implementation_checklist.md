# IMPLEMENTATION CHECKLIST & BEST PRACTICES

**Version:** 1.0.0  
**Date:** December 13, 2024

---

## TABLE OF CONTENTS

1. [Feature Development Checklist](#1-feature-development-checklist)
2. [Code Quality Standards](#2-code-quality-standards)
3. [Testing Guidelines](#3-testing-guidelines)
4. [API Development Standards](#4-api-development-standards)
5. [Database Standards](#5-database-standards)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Documentation Standards](#7-documentation-standards)
8. [Git Workflow](#8-git-workflow)
9. [Performance Optimization](#9-performance-optimization)
10. [Security Checklist](#10-security-checklist)

---

## 1. FEATURE DEVELOPMENT CHECKLIST

### 1.1 Pre-Development Planning

- [ ] Feature requirements documented in PRD
- [ ] User stories written with acceptance criteria
- [ ] API endpoints designed and documented
- [ ] Database schema designed and reviewed
- [ ] Dependencies identified
- [ ] Estimated effort calculated
- [ ] Team members assigned

### 1.2 Setup Phase

- [ ] Create feature folder structure:
  ```
  src/features/{feature}/
  ├── domain/
  ├── application/
  ├── infrastructure/
  ├── presentation/
  ├── container.ts
  └── index.ts
  ```
- [ ] Create database schema migration
- [ ] Setup feature test folder: `tests/features/{feature}/`
- [ ] Create `readme.md` for feature

### 1.3 Domain Layer Development

- [ ] ✅ Define domain entities
  ```typescript
  // src/features/{feature}/domain/entities/
  - {Entity}.entity.ts (with business logic)
  - index.ts (exports)
  ```

- [ ] ✅ Create value objects (if applicable)
  ```typescript
  // src/features/{feature}/domain/value-objects/
  - {ValueObject}.ts
  ```

- [ ] ✅ Define domain interfaces
  ```typescript
  // src/features/{feature}/domain/interfaces/
  - I{Repository}.ts
  - I{Provider}.ts
  ```

- [ ] ✅ Create domain-specific errors
  ```typescript
  // src/features/{feature}/domain/errors/
  - {CustomError}.ts
  ```

- [ ] ✅ Write unit tests for entities
  ```typescript
  // tests/features/{feature}/domain/entities/
  - {Entity}.entity.test.ts (Target: 100% coverage)
  ```

### 1.4 Application Layer Development

- [ ] ✅ Create DTOs (Request & Response)
  ```typescript
  // src/features/{feature}/application/dtos/
  - input/{Action}Request.ts
  - output/{Action}Response.ts
  ```

- [ ] ✅ Implement use cases
  ```typescript
  // src/features/{feature}/application/usecases/
  - {Action}UseCase.ts
  ```

- [ ] ✅ Create mappers (if needed)
  ```typescript
  // src/features/{feature}/application/mappers/
  - {Entity}Mapper.ts
  ```

- [ ] ✅ Write use case tests
  ```typescript
  // tests/features/{feature}/application/usecases/
  - {Action}UseCase.test.ts (Target: 90%+ coverage)
  ```

- [ ] ✅ Verify use cases are testable without external dependencies

### 1.5 Infrastructure Layer Development

- [ ] ✅ Implement repositories
  ```typescript
  // src/features/{feature}/infrastructure/repositories/
  - {Entity}Repository.ts (implements domain interface)
  ```

- [ ] ✅ Implement providers
  ```typescript
  // src/features/{feature}/infrastructure/providers/
  - {ExternalService}Provider.ts
  ```

- [ ] ✅ Create external service clients (if applicable)
  ```typescript
  // src/features/{feature}/infrastructure/external/
  - {service}.client.ts
  ```

- [ ] ✅ Write repository integration tests
  ```typescript
  // tests/features/{feature}/infrastructure/
  - repositories/{Entity}Repository.test.ts
  ```

- [ ] ✅ Mock external services in tests

### 1.6 Presentation Layer Development

- [ ] ✅ Create controllers
  ```typescript
  // src/features/{feature}/presentation/controllers/
  - {Action}Controller.ts (thin, delegates to use case)
  ```

- [ ] ✅ Create routes
  ```typescript
  // src/features/{feature}/presentation/routes.ts
  - Define all endpoints
  - Mount controllers
  ```

- [ ] ✅ Create feature-specific middleware (if needed)
  ```typescript
  // src/features/{feature}/presentation/middleware/
  - {FeatureName}Middleware.ts
  ```

- [ ] ✅ Write E2E tests
  ```typescript
  // tests/features/{feature}/presentation/
  - {Action}Controller.e2e.test.ts
  ```

### 1.7 Dependency Injection

- [ ] ✅ Create container
  ```typescript
  // src/features/{feature}/container.ts
  - Register all dependencies
  - Wire up use cases
  ```

- [ ] ✅ Test container setup
  ```typescript
  // tests/features/{feature}/container.test.ts
  - Verify all dependencies resolve correctly
  ```

### 1.8 Public API

- [ ] ✅ Create index.ts (public API)
  ```typescript
  // src/features/{feature}/index.ts
  - Export ONLY public interfaces
  - Hide implementation details
  ```

- [ ] ✅ Review exports
  - Should export: Entities, Use cases, Public DTOs, Errors
  - Should NOT export: Repositories, Providers, Internal DTOs

### 1.9 Integration

- [ ] ✅ Mount feature in main app
  ```typescript
  // src/app.ts
  app.route('/{feature}', featureRoutes)
  ```

- [ ] ✅ Add feature to API Gateway routing
- [ ] ✅ Update CI/CD pipeline
- [ ] ✅ Database migration added to migration queue

### 1.10 Documentation

- [ ] ✅ Create feature README
  ```markdown
  # {Feature} Service
  - Purpose
  - API Endpoints
  - Request/Response Examples
  - Error Codes
  - Events Published
  - Dependencies
  ```

- [ ] ✅ Document API endpoints
  ```
  GET    /{feature}/:id
  POST   /{feature}
  PATCH  /{feature}/:id
  DELETE /{feature}/:id
  ```

- [ ] ✅ Document error codes
- [ ] ✅ Document events (if any)
- [ ] ✅ Add to API documentation

### 1.11 Code Review

- [ ] ✅ All tests passing
- [ ] ✅ Coverage > 80%
- [ ] ✅ No linting errors
- [ ] ✅ Type checks passing
- [ ] ✅ No circular dependencies
- [ ] ✅ Database migrations reviewed
- [ ] ✅ Architecture rules followed
- [ ] ✅ Security checklist passed
- [ ] ✅ Performance acceptable
- [ ] ✅ Documentation complete

### 1.12 Testing & QA

- [ ] ✅ Unit tests (domain, use cases)
- [ ] ✅ Integration tests (repositories)
- [ ] ✅ E2E tests (full flow)
- [ ] ✅ Manual testing completed
- [ ] ✅ Load testing (if applicable)
- [ ] ✅ Security testing (if applicable)

### 1.13 Deployment

- [ ] ✅ Database migration script reviewed
- [ ] ✅ Environment variables documented
- [ ] ✅ Rollback plan prepared
- [ ] ✅ Deployment checklist completed
- [ ] ✅ Monitoring/alerts configured
- [ ] ✅ Post-deployment testing passed

---

## 2. CODE QUALITY STANDARDS

### 2.1 TypeScript

- [ ] Strict mode enabled
- [ ] No `any` types (except specific cases)
- [ ] All function parameters typed
- [ ] All return types specified
- [ ] No implicit `any`
- [ ] Generics used where appropriate

```typescript
// ✅ GOOD
function getUserById(id: string): Promise<User | null> {
  return repository.findById(id)
}

// ❌ BAD
function getUserById(id) {
  return repository.findById(id)
}
```

### 2.2 Code Style

- [ ] ESLint rules enforced
- [ ] Prettier formatting applied
- [ ] Max line length: 100 characters
- [ ] Indentation: 2 spaces
- [ ] Consistent naming conventions

```typescript
// ✅ GOOD
class UserRepository {
  async findById(id: string): Promise<User | null> {
    // ...
  }
}

// ❌ BAD
class userRepository {
  async find_by_id(id) {
    // ...
  }
}
```

### 2.3 Function Size

- [ ] Functions < 30 lines (guideline)
- [ ] Methods do ONE thing
- [ ] Long functions extracted into smaller ones
- [ ] Complex logic extracted to utilities

```typescript
// ✅ GOOD: Multiple small functions
function validateEmail(email: string): boolean { ... }
function hashPassword(pwd: string): string { ... }
function saveUser(user: User): Promise<void> { ... }

async function register(req: RegisterRequest) {
  if (!validateEmail(req.email)) throw Error()
  const hashed = await hashPassword(req.password)
  await saveUser(new User(req.email, hashed))
}

// ❌ BAD: Everything in one function
async function register(req: RegisterRequest) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.email)) throw Error()
  const salt = await bcrypt.genSalt(12)
  const hashed = await bcrypt.hash(req.password, salt)
  // ... 100 more lines
}
```

### 2.4 Comments & Documentation

- [ ] Self-documenting code prioritized
- [ ] Complex logic commented
- [ ] Public methods have JSDoc
- [ ] Constants explained
- [ ] No commented-out code

```typescript
// ✅ GOOD
/**
 * Validates if user has sufficient balance for withdrawal
 * @param user - User entity to check
 * @param amount - Amount to withdraw in currency units
 * @throws {InsufficientBalanceError}
 * @returns True if withdrawal is possible
 */
function canWithdraw(user: User, amount: number): boolean {
  return user.balance >= amount
}

// ❌ BAD
// const user = await repo.find(id)
// const balance = user.balance
// if (balance > 100) ...
```

### 2.5 Variable Naming

- [ ] Names are descriptive
- [ ] No single-letter variables (except loops)
- [ ] Booleans start with `is`, `has`, `can`
- [ ] Functions are verbs
- [ ] Classes/Types are nouns

```typescript
// ✅ GOOD
const isUserActive = true
const hasPermission = false
const canWithdraw = true
const getUserById = (id: string) => { ... }
class UserRepository { ... }

// ❌ BAD
const active = true
const perm = false
const w = true
const getUser = (x: string) => { ... }
class User { ... }  // Should be UserRepository
```

---

## 3. TESTING GUIDELINES

### 3.1 Unit Tests

**Target Coverage:** 80-100%

```typescript
// tests/features/auth/domain/entities/User.entity.test.ts

describe('User Entity', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      const user = new User('1', 'test@example.com', 'hash')
      expect(user.validateEmail()).toBe(true)
    })

    it('should reject invalid email format', () => {
      const user = new User('1', 'invalid-email', 'hash')
      expect(user.validateEmail()).toBe(false)
    })

    it('should handle edge cases', () => {
      // Test edge cases
    })
  })

  describe('isPasswordValid', () => {
    it('should return true for valid password', async () => {
      const mockHasher = { compare: jest.fn().mockResolvedValue(true) }
      const user = new User('1', 'test@example.com', 'hash')
      const result = await user.isPasswordValid('password', mockHasher)
      expect(result).toBe(true)
    })
  })
})
```

**Best Practices:**
- Test one thing per test
- Clear test names (describe what is being tested)
- Arrange → Act → Assert pattern
- Use descriptive assertions
- Mock external dependencies

### 3.2 Integration Tests

**Target Coverage:** 60-80%

```typescript
// tests/features/auth/infrastructure/repositories/UserRepository.test.ts

describe('UserRepository Integration', () => {
  let db: Database
  let repository: UserRepository

  beforeAll(async () => {
    db = await createTestDatabase()
    repository = new UserRepository(db)
  })

  afterEach(async () => {
    await clearTestDatabase()
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = new User('1', 'test@example.com', 'hash')
      await repository.save(user)

      // Act
      const found = await repository.findByEmail('test@example.com')

      // Assert
      expect(found).toBeDefined()
      expect(found?.email).toBe('test@example.com')
    })

    it('should return null when user not found', async () => {
      const found = await repository.findByEmail('nonexistent@example.com')
      expect(found).toBeNull()
    })
  })
})
```

**Best Practices:**
- Use test database (isolated)
- Clear setup and teardown
- Test both success and failure cases
- Verify database state

### 3.3 E2E Tests

**Target Coverage:** 40-60%

```typescript
// tests/features/auth/presentation/LoginController.e2e.test.ts

describe('Login API E2E', () => {
  let client: Hono

  beforeAll(() => {
    client = createTestApp()
  })

  describe('POST /auth/login', () => {
    it('should login valid user', async () => {
      // Arrange
      await createUser('test@example.com', 'password123')

      // Act
      const response = await client.post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('userId')
    })

    it('should reject invalid credentials', async () => {
      const response = await client.post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })
})
```

**Best Practices:**
- Test happy path and error cases
- Verify HTTP status codes
- Check response structure
- Test error messages

### 3.4 Test Data Management

```typescript
// tests/fixtures/user.fixture.ts
export function createUserFixture(overrides = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    ...overrides
  }
}

// Usage
const user = createUserFixture({ email: 'other@example.com' })
```

---

## 4. API DEVELOPMENT STANDARDS

### 4.1 RESTful Design

```typescript
// ✅ GOOD: RESTful
GET    /users              // List users
POST   /users              // Create user
GET    /users/:id          // Get user
PATCH  /users/:id          // Update user
DELETE /users/:id          // Delete user

// ❌ BAD: RPC-style
GET    /users/list
POST   /users/create
GET    /users/get/:id
POST   /users/update/:id
POST   /users/delete/:id
```

### 4.2 Request/Response Format

```typescript
// ✅ Request DTO
class CreateUserRequest {
  email: string
  name: string
  password: string

  validate(): void {
    if (!this.email) throw new ValidationError('Email required')
    // ...
  }
}

// ✅ Response DTO
class UserResponse {
  id: string
  email: string
  name: string
  createdAt: Date
  // Note: No passwordHash!
}

// ✅ Error Response
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid",
    "details": { "field": "email" },
    "statusCode": 400
  }
}
```

### 4.3 Status Codes

```
200 OK             - Request succeeded
201 Created        - Resource created
204 No Content     - Success, no response body
400 Bad Request    - Invalid request
401 Unauthorized   - Authentication required
403 Forbidden      - Not authorized
404 Not Found      - Resource not found
409 Conflict       - Resource conflict (duplicate)
422 Unprocessable  - Validation error
429 Too Many       - Rate limit exceeded
500 Server Error   - Unexpected error
503 Unavailable    - Service down
```

### 4.4 API Versioning (Future)

```typescript
// When needed, use URL versioning
GET    /v1/users
POST   /v2/users    // Different implementation

// OR header versioning
GET    /users (Accept-Version: 1.0)
```

---

## 5. DATABASE STANDARDS

### 5.1 Schema Naming

```typescript
// ✅ Tables: plural, snake_case
users
user_profiles
payment_transactions

// ✅ Columns: snake_case
user_id
created_at
is_active

// ✅ Constraints: descriptive
pk_users_id
fk_user_profiles_user_id
idx_users_email
```

### 5.2 Migrations

```typescript
// Every change must have migration
export async function up(db: Database) {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('email', 'varchar(255)', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(now()))
    .execute()
}

export async function down(db: Database) {
  await db.schema.dropTable('users').execute()
}
```

**Rules:**
- Every migration has up AND down
- Migrations are immutable (never modify released)
- Descriptive migration names: `0001_create_users.ts`
- Run migrations in order
- Test rollbacks

### 5.3 Query Optimization

```typescript
// ✅ GOOD: Use indexes
CREATE INDEX idx_users_email ON users(email)
CREATE INDEX idx_transactions_user_id ON transactions(user_id)

// ❌ BAD: Full table scans
SELECT * FROM users WHERE name LIKE '%john%'  // No index on name

// ✅ GOOD: Pagination
SELECT * FROM users LIMIT 20 OFFSET 0

// ❌ BAD: No limit
SELECT * FROM transactions  // Could be millions of rows
```

### 5.4 Data Integrity

- [ ] Primary keys on all tables
- [ ] Foreign key constraints
- [ ] NOT NULL for required columns
- [ ] UNIQUE constraints where appropriate
- [ ] DEFAULT values for optional columns
- [ ] Proper data types (not all VARCHAR)

---

## 6. ERROR HANDLING STRATEGY

### 6.1 Error Hierarchy

```typescript
// Base error
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

// Domain-specific errors
export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found')
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password')
  }
}

// Application errors
export class ValidationError extends DomainError {
  constructor(message: string, public field?: string) {
    super(message)
  }
}
```

### 6.2 Error Handling in Layers

```typescript
// Domain layer: Throws domain errors
class User {
  throwIfInvalid(): void {
    if (!this.isEmailValid()) {
      throw new InvalidEmailError()
    }
  }
}

// Application layer: Catches and propagates
class RegisterUseCase {
  async execute(request: RegisterRequest) {
    const user = new User(...)
    user.throwIfInvalid()  // Throws domain error
    // ...
  }
}

// Presentation layer: Converts to HTTP
class RegisterController {
  async handle(c: Context) {
    try {
      const response = await registerUseCase.execute(request)
      return c.json(response, 201)
    } catch (error) {
      if (error instanceof InvalidEmailError) {
        return c.json({
          error: { code: 'INVALID_EMAIL', message: error.message }
        }, 400)
      }
      if (error instanceof ValidationError) {
        return c.json({
          error: { code: 'VALIDATION_ERROR', field: error.field }
        }, 422)
      }
      // Log unexpected errors
      console.error('Unexpected error:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
}
```

### 6.3 Error Response Format

```typescript
// ✅ Consistent format
{
  "error": {
    "code": "USER_NOT_FOUND",           // Machine-readable
    "message": "User not found",        // Human-readable
    "details": {                        // Additional context
      "userId": "123"
    },
    "statusCode": 404                   // Redundant but helpful
  }
}

// ✅ Validation errors
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        { "field": "email", "message": "Invalid email format" },
        { "field": "password", "message": "Too short" }
      ]
    },
    "statusCode": 422
  }
}
```

---

## 7. DOCUMENTATION STANDARDS

### 7.1 Code Documentation

```typescript
/**
 * Validates user login credentials
 * @param email - User email address
 * @param password - User password (plain text)
 * @param repository - User repository for lookup
 * @returns User object if credentials valid
 * @throws {InvalidCredentialsError} If email/password invalid
 * @throws {UserNotFoundError} If user not found
 * @example
 * const user = await validateLogin('user@example.com', 'pwd')
 */
export async function validateLogin(
  email: string,
  password: string,
  repository: IUserRepository
): Promise<User> {
  // ...
}
```

### 7.2 API Documentation

```markdown
## Create User

**Endpoint:** `POST /users`

**Authentication:** None (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-12-13T10:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid request format
- `422 Unprocessable Entity` - Validation failed
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Unexpected error

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securePassword123"
  }'
```
```

### 7.3 Feature README

```markdown
# Auth Feature

## Purpose
Handles user authentication and authorization using OAuth2/Keycloak

## API Endpoints
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- POST /auth/refresh - Refresh token
- GET /auth/me - Get current user

## Dependencies
- Keycloak (external)
- BetterAuth library
- PostgreSQL

## Database Tables
- users
- sessions
- oauth_accounts

## Error Codes
- INVALID_CREDENTIALS - Login failed
- INVALID_TOKEN - Token verification failed
- USER_NOT_FOUND - User doesn't exist

## Events Published
- user.created
- user.authenticated
- session.revoked
```

---

## 8. GIT WORKFLOW

### 8.1 Branch Naming

```
main              - Production code
staging           - QA/staging environment
dev               - Development branch

feature/auth-login
feature/payment-integration
bugfix/user-profile-crash
hotfix/security-issue
chore/update-dependencies
refactor/user-repository
```

### 8.2 Commit Messages

```
✅ GOOD
feat: add user authentication with Keycloak
feat(auth): add JWT token refresh mechanism
fix: prevent double-charge in payment service
refactor: simplify UserRepository queries
test: add integration tests for LoginUseCase
docs: document API error responses

❌ BAD
update stuff
fix bug
WIP
work in progress
asdfasd
```

### 8.3 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Related Issues
Closes #123

## Changes Made
- List of changes

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Tests pass
- [ ] No breaking changes
- [ ] Documentation updated
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Database Performance

- [ ] Indexes on frequently queried columns
- [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Connection pooling configured
- [ ] N+1 query prevention (eager loading)
- [ ] Pagination implemented

```typescript
// ❌ BAD: N+1 query
const users = await db.query.users.findMany()
for (const user of users) {
  user.profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id)
  })
}

// ✅ GOOD: Eager loading
const users = await db.query.users.findMany({
  with: { profile: true }
})
```

### 9.2 Caching Strategy

- [ ] Identify hot paths
- [ ] Cache user-specific data
- [ ] Set appropriate TTLs
- [ ] Invalidate on updates
- [ ] Monitor cache hit rates

```typescript
// Cache frequently accessed user data
async function getUser(userId: string) {
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)

  const user = await repository.findById(userId)
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user))
  return user
}
```

### 9.3 API Response Performance

- [ ] Return only necessary fields
- [ ] Pagination for large datasets
- [ ] Compression enabled (gzip)
- [ ] CDN for static assets
- [ ] Response time monitoring

```typescript
// ✅ GOOD: Selective fields + pagination
GET /users?fields=id,email,name&page=1&limit=20
```

---

## 10. SECURITY CHECKLIST

### 10.1 Authentication & Authorization

- [ ] JWT tokens signed (RS256)
- [ ] Token expiration set (1 hour)
- [ ] Refresh tokens implemented
- [ ] RBAC implemented
- [ ] Session validation on each request
- [ ] Password hashing (bcrypt 12+ rounds)

### 10.2 Data Protection

- [ ] Sensitive fields not logged
- [ ] Passwords never in responses
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] SQL injection prevented (ORM)
- [ ] XSS prevention (escape output)

### 10.3 API Security

- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] API keys secured (not in code)
- [ ] CSRF protection (if needed)
- [ ] Request signing for webhooks

### 10.4 Infrastructure

- [ ] Environment variables not committed
- [ ] Secrets in secure vault
- [ ] Database backups enabled
- [ ] Logs not containing secrets
- [ ] Access control on databases
- [ ] Firewall rules configured

### 10.5 Audit & Monitoring

- [ ] All sensitive operations logged
- [ ] Audit trail immutable
- [ ] Error alerts configured
- [ ] Security event monitoring
- [ ] Intrusion detection enabled

---

## APPENDIX A: QUICK REFERENCE

### Commands

```bash
# Development
bun run dev
bun run test
bun run test:watch
bun run lint
bun run format

# Database
bun run migrate
bun run seed

# Git
git checkout -b feature/my-feature
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
# Create PR on GitHub

# Code review
npm run lint
npm run test:coverage
npm run type-check
```

### File Templates

**Feature index.ts:**
```typescript
export * from './domain'
export * from './application/usecases'
export * from './application/dtos'

// Don't export infrastructure!
```

**Entity template:**
```typescript
export class {Entity} {
  constructor(
    public id: string,
    // ... other fields
  ) {}

  // Domain methods
  validate(): void { }
}
```

**Use Case template:**
```typescript
export class {Action}UseCase {
  constructor(private repo: I{Repository}) {}

  async execute(request: {Action}Request): Promise<{Action}Response> {
    // Orchestrate domain + infrastructure
  }
}
```

---

## APPENDIX B: TROUBLESHOOTING

### TypeScript Errors

**"Cannot find module"**
- Check import path
- Check tsconfig.json paths
- Clear .tsbuildinfo cache

**"Type '{}' is missing properties"**
- Add explicit types
- Use Partial<Type> if optional
- Check interface definitions

### Test Failures

**"Cannot connect to database"**
- Ensure test database running
- Check DATABASE_URL env var
- Run migrations on test db

**"Timeout in test"**
- Increase jest timeout
- Check async/await
- Mock slow operations

### Runtime Errors

**"Cannot read property of undefined"**
- Add null checks
- Use optional chaining (?.)
- Check null handling

**"Port already in use"**
- Change port in .env
- Kill process on port
- Check if app already running

---

**Document Version:** 1.0.0  
**Last Updated:** December 13, 2024  
**Maintained By:** Development Team
