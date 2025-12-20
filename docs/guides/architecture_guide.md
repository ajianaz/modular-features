# ARCHITECTURE & CLEAN ARCHITECTURE GUIDE

**Version:** 1.0.0  
**Date:** December 13, 2024

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Clean Architecture Layers](#2-clean-architecture-layers)
3. [Detailed Layer Explanations](#3-detailed-layer-explanations)
4. [Data Flow](#4-data-flow)
5. [Feature Module Communication](#5-feature-module-communication)
6. [Design Patterns Used](#6-design-patterns-used)
7. [Examples](#7-examples)
8. [Migration to Microservices](#8-migration-to-microservices)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Design Principle

**"Build like microservices, deploy like monolith"**

Our architecture is designed to be modular enough to extract features into independent microservices without major refactoring, while staying simple enough to operate as a single monolith during MVP phase.

### 1.2 Core Concept: Feature-Based Clean Architecture

```
┌─────────────────────────────────────────────────┐
│ User Request (HTTP)                             │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ PRESENTATION LAYER                              │  ← Controllers, Routes
│ (HTTP Interface)                                │     Converts HTTP ↔ DTO
├─────────────────────────────────────────────────┤
│                                                 │
│  Router → Controller → DTO Conversion           │
│                                                 │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ APPLICATION LAYER                               │  ← Use Cases, Orchestration
│ (Business Rules Coordination)                   │     Calls domain logic
├─────────────────────────────────────────────────┤
│                                                 │
│  UseCase → Execute business workflow            │
│  Orchestrates domain + infrastructure           │
│                                                 │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ DOMAIN LAYER                                    │  ← Entities, Interfaces
│ (Pure Business Logic)                           │     No framework knowledge
├─────────────────────────────────────────────────┤
│                                                 │
│  Entity → Methods (pure logic)                  │
│  Interfaces → Contracts (not implementations)   │
│  Errors → Domain errors                         │
│                                                 │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────┴────────┐
        ▼               ▼
   ┌─────────┐    ┌──────────┐
   │ INFRA   │    │  INFRA   │
   │ Repo    │    │ Provider │
   └─────────┘    └──────────┘
   ↓ Database     ↓ External API
```

### 1.3 Key Benefits

| Benefit | Why | When Extracting |
|---------|-----|-----------------|
| **Testability** | Pure domain logic = easy mocking | No change needed |
| **Maintainability** | Clear separation of concerns | Easy to find code |
| **Flexibility** | Swap implementations | Just update container |
| **Modularity** | Features are independent | Copy entire folder |
| **Scalability** | Extract to microservice | Move folder to new repo |

---

## 2. CLEAN ARCHITECTURE LAYERS

### 2.1 The Onion Model

```
          ┌─────────────────────┐
          │  PRESENTATION       │  ← HTTP, Hono, Controllers
          │  (Frameworks)       │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  APPLICATION        │  ← Use Cases, Orchestration
          │  (Frameworks aware)  │     Calls domain entities
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  DOMAIN             │  ← Entities, Interfaces
          │  (Pure Business)    │     Framework agnostic
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  INFRASTRUCTURE     │  ← Database, APIs
          │  (Implementation)   │     Implements domain
          └─────────────────────┘

DEPENDENCY DIRECTION: All point INWARD
Domain knows nothing about outer layers
```

### 2.2 Dependency Rules

```
✅ ALLOWED:
- Presentation → Application → Domain
- Infrastructure implements Domain interfaces
- Same layer can reference each other

❌ NOT ALLOWED:
- Domain → Application/Presentation/Infrastructure
- Presentation → Infrastructure (direct)
- Circular dependencies
- Infrastructure → Application (directly)
```

### 2.3 Layer Boundaries (What can cross)

```
┌─────────────────────────────────────────┐
│ Presentation                            │
│ ┌─────────────────────────────────────┐ │
│ │ Application                         │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Domain                          │ │ │
│ │ │ (Isolated - knows nothing)      │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │                                     │ │
│ │ ↑ Domain Interfaces (no impl)       │ │
│ │ ↑ Domain Entities (pure objects)    │ │
│ │ ↑ Domain Errors                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ↑ Use Cases (call domain)               │
│ ↑ DTOs (data transfer)                  │
│ ↑ Mappers (entity ↔ DTO)                │
└─────────────────────────────────────────┘
           ↑
    Controllers (HTTP interface)
           ↑
     Repositories (data access)
     Providers (external APIs)
```

---

## 3. DETAILED LAYER EXPLANATIONS

### 3.1 DOMAIN LAYER (Core Business)

**Location:** `src/features/{feature}/domain/`

**Purpose:** Contains pure business logic that doesn't depend on any framework or library.

**Key Principle:** "Domain should be testable without any external dependencies"

**Includes:**

#### 3.1.1 Entities
```typescript
// Domain Entity = business object with methods
// Knows ONLY about domain rules

export class User {
  constructor(
    public id: string,
    public email: string,
    public passwordHash: string
  ) {}

  // Pure domain logic - no framework knowledge
  validateEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
  }

  // Domain method that enforces business rule
  isPasswordValid(plainPassword: string, hasher: IHashProvider): boolean {
    return hasher.compare(plainPassword, this.passwordHash)
  }

  // Throws domain error, not HTTP error
  throwIfInvalid(): void {
    if (!this.validateEmail()) {
      throw new InvalidEmailError()
    }
  }
}
```

**Important:** Entities should NOT:
- Know about database
- Know about HTTP
- Know about external APIs
- Depend on framework-specific code

#### 3.1.2 Value Objects
```typescript
// Small, immutable objects with no identity
// Example: Email, Password, Money

export class Email {
  private readonly value: string

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new InvalidEmailError()
    }
    this.value = email
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.getValue()
  }
}

// Usage
const email = new Email('user@example.com') // Validated at creation
```

#### 3.1.3 Domain Interfaces
```typescript
// Contracts that infrastructure implements
// Domain defines what it needs, infrastructure provides how

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
}

export interface IHashProvider {
  hash(plainText: string): Promise<string>
  compare(plainText: string, hashed: string): Promise<boolean>
}

// Domain doesn't know about:
// - PostgreSQL
// - Bcrypt
// - How repository actually works
```

#### 3.1.4 Domain Errors
```typescript
// Custom errors for domain rules violations
// Not HTTP errors - converted later

export class InvalidEmailError extends DomainError {
  constructor() {
    super('Email format is invalid')
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`)
  }
}

// Usage: Domain throws these, presentation converts to HTTP
```

**Why Separate Domain Errors?**
- Domain logic should NOT know about HTTP
- Same domain logic could be used in CLI, microservice, etc.
- Clean error handling at each layer

---

### 3.2 APPLICATION LAYER (Orchestration)

**Location:** `src/features/{feature}/application/`

**Purpose:** Orchestrates domain logic and coordinates infrastructure.

**Key Principle:** "Stateless workflows, no business logic here"

**Includes:**

#### 3.2.1 Use Cases (Business Workflows)
```typescript
// Use Case = one business workflow
// Orchestrates: domain entities + repositories

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashProvider: IHashProvider,
    private tokenGenerator: ITokenGenerator
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // 1. Validate request
    request.validate()

    // 2. Call domain repository
    const user = await this.userRepository.findByEmail(request.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    // 3. Use domain entity method
    const isValid = user.isPasswordValid(request.password, this.hashProvider)
    if (!isValid) {
      throw new InvalidCredentialsError()
    }

    // 4. Generate token (infrastructure)
    const token = await this.tokenGenerator.generate(user.id)

    // 5. Return DTO
    return new LoginResponse(token, user)
  }
}

// Use Case is:
// ✅ Testable (mock repositories)
// ✅ Independent (doesn't know HTTP)
// ✅ Reusable (can be called from CLI, microservice)
```

#### 3.2.2 DTOs (Data Transfer Objects)
```typescript
// DTOs = objects for data crossing layer boundaries
// Application layer passes DTOs to presentation

export class LoginRequest {
  constructor(
    public email: string,
    public password: string
  ) {}

  validate(): void {
    if (!this.email || !this.password) {
      throw new ValidationError('Email and password required')
    }
  }
}

export class LoginResponse {
  constructor(
    public accessToken: string,
    public userId: string,
    public email: string
  ) {}
}

// Why separate from Entity?
// - Entity has all domain data
// - Response only has necessary data
// - Security: don't expose internal fields
// - Flexibility: change entity without breaking API
```

#### 3.2.3 Mappers
```typescript
// Convert between Entity ↔ DTO

export class UserMapper {
  static toDomain(raw: any): User {
    return new User(raw.id, raw.email, raw.passwordHash)
  }

  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      // Don't expose passwordHash!
    }
  }

  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      // Only what's needed
    }
  }
}
```

---

### 3.3 INFRASTRUCTURE LAYER (Implementation)

**Location:** `src/features/{feature}/infrastructure/`

**Purpose:** Implements domain interfaces, handles persistence, external APIs.

**Key Principle:** "Swappable implementations, domain rules move up"

**Includes:**

#### 3.3.1 Repositories
```typescript
// Implements domain interface
// Handles database access

export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    // Database query
    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    })

    // Convert DB row → Domain entity
    if (!row) return null
    return this.toDomain(row)
  }

  async save(user: User): Promise<void> {
    // Convert Domain entity → DB row
    await this.db.insert(users).values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash
    })
  }

  private toDomain(raw: any): User {
    return new User(raw.id, raw.email, raw.passwordHash)
  }
}

// Key: Domain interface (IUserRepository) is in domain/
// Implementation (UserRepository) is in infrastructure/
```

#### 3.3.2 Providers (External Services)
```typescript
// External service implementations

export class BcryptHashProvider implements IHashProvider {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 12)
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed)
  }
}

export class KeycloakAuthProvider implements IAuthProvider {
  async verify(token: string): Promise<boolean> {
    const response = await fetch(
      `${process.env.KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.ok
  }
}

// Advantages:
// - Easy to swap implementations
// - Easy to test (mock in tests)
// - No framework bleeding into domain
```

---

### 3.4 PRESENTATION LAYER (HTTP Interface)

**Location:** `src/features/{feature}/presentation/`

**Purpose:** Handles HTTP requests/responses, converts between HTTP and use cases.

**Key Principle:** "Thin layer, delegates to use cases"

**Includes:**

#### 3.4.1 Controllers
```typescript
// Controllers = HTTP request handlers
// NEVER contain business logic

export class LoginController {
  constructor(private loginUseCase: LoginUseCase) {}

  async handle(c: Context): Promise<Response> {
    try {
      // 1. Extract HTTP request
      const body = await c.req.json()

      // 2. Create request DTO
      const request = new LoginRequest(body.email, body.password)

      // 3. Execute use case (business logic)
      const response = await this.loginUseCase.execute(request)

      // 4. Return HTTP response
      return c.json(response, 200)

    } catch (error) {
      // Convert domain errors to HTTP errors
      if (error instanceof InvalidCredentialsError) {
        return c.json({ error: 'Invalid credentials' }, 401)
      }
      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400)
      }
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
}

// Controller SHOULD NOT:
// ❌ Contain business logic
// ❌ Call database directly
// ❌ Validate deeply (let use case do it)
// ❌ Know about other services

// Controller SHOULD:
// ✅ Parse HTTP request
// ✅ Call use case
// ✅ Convert errors
// ✅ Return HTTP response
```

#### 3.4.2 Routes
```typescript
// Define HTTP routes

export function createAuthRoutes(router: Hono): void {
  const loginController = new LoginController(
    container.get('loginUseCase')
  )

  router.post('/login', (c) => loginController.handle(c))
  router.post('/logout', (c) => logoutController.handle(c))
  router.post('/refresh', (c) => refreshController.handle(c))
}
```

#### 3.4.3 Middleware
```typescript
// Feature-specific middleware

export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const token = c.req.header('Authorization')?.split(' ')[1]
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
      const verified = await verifyToken(token)
      c.set('userId', verified.userId)
      return next()
    } catch {
      return c.json({ error: 'Invalid token' }, 401)
    }
  }
}
```

---

## 4. DATA FLOW

### 4.1 Request → Response Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. HTTP Request Arrives                                 │
│    POST /auth/login                                     │
│    { "email": "user@example.com", "password": "xxx" }   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│ 2. PRESENTATION: Router Receives Request                │
│    - Parses body                                        │
│    - Routes to LoginController                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│ 3. PRESENTATION: Controller Converts                     │
│    - Creates LoginRequest DTO                           │
│    - Validates request format (optional)                │
│    - Calls loginUseCase.execute(request)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│ 4. APPLICATION: Use Case Orchestrates                    │
│    - Calls userRepository.findByEmail()                 │
│    - Calls user.isPasswordValid()                       │
│    - Calls tokenGenerator.generate()                    │
│    - Returns LoginResponse DTO                          │
└──────────────────┬──────────────────────────────────────┘
         │         │         │
         │         │         └──────────┐
         │         │                    │
         ▼         ▼                    ▼
    ┌─────────┐   ┌──────────┐    ┌─────────────┐
    │ Domain  │   │ Domain   │    │ Infra       │
    │ Entity  │   │ Interface│    │ Provider    │
    │ Logic   │   │ (Mock)   │    │ (Real impl) │
    └─────────┘   └──────────┘    └─────────────┘
         │         │                    │
         │         │                    │
         │         ▼                    ▼
         │    ┌──────────────────────────────┐
         │    │ INFRASTRUCTURE: Repository   │
         │    │ Database Query               │
         │    │ SQL: SELECT * FROM users...  │
         │    └──────────────────────────────┘
         │
         └────────────────────────┐
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
                   ▼                             ▼
    ┌────────────────────────┐    ┌────────────────────────┐
    │ Domain: User Entity    │    │ Infra: Hash Provider   │
    │ Methods are executed   │    │ Compares passwords     │
    │ Pure logic, no DB      │    │ Real implementation    │
    └────────────────────────┘    └────────────────────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │ Result: True (Password OK)  │
                    │ Domain: No errors thrown    │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
            ┌──────────────────────────────────────┐
            │ Infra: Token Generator               │
            │ Creates JWT token                    │
            └──────────────────┬───────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │ APPLICATION: Use Case Returns DTO        │
        │ LoginResponse { token, userId }          │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ PRESENTATION: Controller               │
        │ Converts DTO to JSON                    │
        │ Returns HTTP Response (200 OK)          │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ HTTP Response Sent to Client             │
        │ 200 OK                                   │
        │ { "accessToken": "eyJh...", ...  }       │
        └──────────────────────────────────────────┘
```

### 4.2 Error Handling Flow

```
Domain throws:
  InvalidCredentialsError (domain error, no HTTP knowledge)
         │
         ▼
Application catches:
  Propagates or wraps (still domain knowledge)
         │
         ▼
Presentation converts:
  InvalidCredentialsError → HTTP 401 Unauthorized
         │
         ▼
HTTP Response:
  { "error": "Invalid credentials", "statusCode": 401 }
```

---

## 5. FEATURE MODULE COMMUNICATION

### 5.1 Same Process (Monolith Phase)

```
Auth Feature              Users Feature
  │                           │
  ├─ Domain: User          ├─ Domain: UserProfile
  ├─ UseCase: Login        ├─ UseCase: UpdateProfile
  └─ Repo: UserRepo        └─ Repo: ProfileRepo
       │                        │
       └────────────┬───────────┘
                    │
          Shared PostgreSQL (same DB)
```

**Communication Pattern:**
```typescript
// In users feature, need user info from auth
import { User } from '@/features/auth' // Only from public API!

// NOT:
import { UserRepository } from '@/features/auth/infrastructure'
import { IUserRepository } from '@/features/auth/domain'
```

### 5.2 Future: Microservices Phase

```
Auth Service (separate repo)     Users Service (separate repo)
  │                                   │
  ├─ API: /auth/user/:id              ├─ API: /users/:id
  ├─ DB: auth_db                      ├─ DB: users_db
  └─ Port: 3001                       └─ Port: 3002
       │                                  │
       │  HTTP API Call                   │
       ├───────────────────────────────────
       │
    RabbitMQ Event Bus
       │
  Events: user.created, user.updated
```

**Communication Pattern:**
```typescript
// Service A calls Service B via HTTP
const userResponse = await fetch('http://users-service:3002/users/123')

// Or via RabbitMQ for async events
await rabbitmq.publish('events', 'user.created', userPayload)
```

---

## 6. DESIGN PATTERNS USED

### 6.1 Repository Pattern
```typescript
// Abstraction over data access

// Domain defines interface
interface IUserRepository {
  findById(id: string): Promise<User>
  save(user: User): Promise<void>
}

// Infrastructure implements
class UserRepository implements IUserRepository {
  async findById(id: string) { /* DB query */ }
  async save(user: User) { /* DB insert */ }
}

// Benefits:
// ✅ Easy to mock for testing
// ✅ Easy to swap implementation
// ✅ Domain doesn't know DB details
```

### 6.2 Dependency Injection
```typescript
// Invert control - container manages dependencies

class LoginUseCase {
  constructor(
    private repo: IUserRepository,  // Injected
    private hasher: IHashProvider   // Injected
  ) {}
}

// Container manages creation
container.register('loginUseCase', () =>
  new LoginUseCase(
    container.get('userRepository'),
    container.get('hashProvider')
  )
)

// Benefits:
// ✅ Easy to test (inject mocks)
// ✅ Easy to change implementations
// ✅ Loose coupling
```

### 6.3 Value Objects
```typescript
// Small objects that represent a value

class Email {
  constructor(value: string) {
    if (!this.validate(value)) throw new Error()
    this.value = value
  }

  private validate(value: string): boolean { ... }
}

// Benefits:
// ✅ Encapsulate validation
// ✅ Type-safe
// ✅ Reusable across domain
```

### 6.4 Use Case Pattern
```typescript
// Each business workflow is a use case

class LoginUseCase {
  async execute(request): Promise<response> {
    // 1. Validate
    // 2. Fetch data
    // 3. Apply domain logic
    // 4. Persist
    // 5. Return
  }
}

// Benefits:
// ✅ Testable
// ✅ Reusable
// ✅ Clear intent
```

### 6.5 Data Mapper Pattern
```typescript
// Convert between layers

class UserMapper {
  static toDomain(dto: UserDTO): User { ... }
  static toDTO(entity: User): UserDTO { ... }
}

// Benefits:
// ✅ Isolated models per layer
// ✅ No model leakage
// ✅ Easy evolution
```

---

## 7. EXAMPLES

### 7.1 Complete Feature: Auth

See `project_structure.md` Section 3.2 for full code examples.

### 7.2 How to Add New Feature

1. Create folder structure
2. Define domain entities and interfaces
3. Define application use cases and DTOs
4. Implement repositories and providers
5. Create controllers and routes
6. Wire up container
7. Export public API
8. Mount in main app

---

## 8. MIGRATION TO MICROSERVICES

### 8.1 When to Extract

Extract when:
- ✅ Single feature takes > 30% traffic
- ✅ Scaling bottleneck identified
- ✅ Team can maintain independently
- ✅ Clear API boundaries

Don't extract when:
- ❌ Just "nice to have"
- ❌ Not ready for operational overhead
- ❌ Still figuring out business logic

### 8.2 Extraction Steps

```
1. Identify service to extract (e.g., payments)
   └─ Analyze current dependencies

2. Create microservice repo
   └─ Copy src/features/payments/ folder

3. Setup separate database
   └─ Create payment_db PostgreSQL

4. Setup communication layer
   └─ HTTP API for sync calls
   └─ RabbitMQ for async events

5. Update monolith
   └─ Remove payments feature
   └─ Replace with HTTP client

6. Deploy & monitor
   └─ Separate container
   └─ Monitor for issues

7. Verify & iterate
   └─ Ensure all works
   └─ Ready for next service
```

### 8.3 Zero-Downtime Extraction

```
PHASE 1: Dual-write (1 week)
├─ Monolith still has feature
├─ Extract to microservice
├─ Write to both (monolith + microservice)
├─ Read from monolith (still source of truth)
└─ Monitor for data consistency

PHASE 2: Switch reads (1 week)
├─ Start reading from microservice
├─ Still write to both
├─ Verify data correctness
└─ Keep rollback plan ready

PHASE 3: Cleanup (1 week)
├─ Stop writing to monolith
├─ Remove feature from monolith
├─ Full ownership to microservice
└─ Celebrate migration!
```

---

## APPENDIX A: COMMON MISTAKES

### ❌ Domain layer depends on framework
```typescript
// WRONG
import { Request, Response } from 'hono'

class User {
  constructor(public req: Request) {}
}

// RIGHT
class User {
  constructor(public id: string, public email: string) {}
}
```

### ❌ Business logic in controller
```typescript
// WRONG
async handle(c: Context) {
  const user = await db.find(id)
  if (user.balance < amount) throw Error()
  user.balance -= amount
  await db.save(user)
  return c.json(user)
}

// RIGHT
async handle(c: Context) {
  const response = await withdrawUseCase.execute(request)
  return c.json(response)
}
```

### ❌ Circular dependencies
```typescript
// WRONG
// auth/index.ts exports User
// users/index.ts imports User from auth
// auth/domain/interfaces/IUserRepository.ts imports from users
// CIRCULAR!

// RIGHT
// Define interfaces in auth/domain/interfaces
// Users feature implements these interfaces
// No circular reference
```

### ❌ Repositories know about entities too much
```typescript
// WRONG
class UserRepository {
  async save(user: User) {
    user.passwordHash = await hash(user.password) // Business logic!
    await db.insert(user)
  }
}

// RIGHT
// Hashing done in use case
// Repository just persists
class UserRepository {
  async save(user: User) {
    await db.insert({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash
    })
  }
}
```

---

## APPENDIX B: TESTING STRATEGY

### Unit Tests (Domain & Use Cases)
```typescript
describe('LoginUseCase', () => {
  it('should login valid user', async () => {
    const mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(mockUser)
    }
    const mockHasher = {
      compare: jest.fn().mockResolvedValue(true)
    }
    
    const useCase = new LoginUseCase(mockRepo, mockHasher)
    const result = await useCase.execute(request)
    
    expect(result.accessToken).toBeDefined()
  })
})
```

### Integration Tests (Repository + DB)
```typescript
describe('UserRepository', () => {
  it('should find user by email', async () => {
    const user = await repository.findByEmail('test@example.com')
    expect(user.email).toBe('test@example.com')
  })
})
```

### E2E Tests (Full flow)
```typescript
describe('Login API', () => {
  it('should login user via HTTP', async () => {
    const response = await client.post('/auth/login')
      .send({ email: 'test@example.com', password: '123' })
    
    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBeDefined()
  })
})
```

---

**Document Version:** 1.0.0  
**Last Updated:** December 13, 2024  
**Maintained By:** Development Team
