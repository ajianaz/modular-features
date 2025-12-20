# Project Structure & Setup Guide

**Version:** 1.0.0  
**Date:** December 13, 2024

---

## TABLE OF CONTENTS

1. [Project Structure Overview](#1-project-structure-overview)
2. [Folder Organization](#2-folder-organization)
3. [Feature Module Anatomy](#3-feature-module-anatomy)
4. [Setup Instructions](#4-setup-instructions)
5. [Development Workflow](#5-development-workflow)
6. [File Naming Conventions](#6-file-naming-conventions)
7. [Import Patterns](#7-import-patterns)

---

## 1. PROJECT STRUCTURE OVERVIEW

```
saas-platform/
│
├── packages/                          # Monorepo packages
│   ├── database/                      # Shared database layer
│   │   ├── src/
│   │   │   ├── schema/                # Drizzle table definitions
│   │   │   ├── migrations/            # Drizzle migrations
│   │   │   ├── seeds/                 # Database seeds
│   │   │   └── client.ts              # Database client export
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                        # Shared utilities & types
│   │   ├── src/
│   │   │   ├── types/                 # Global types
│   │   │   ├── errors/                # Custom error classes
│   │   │   ├── validators/            # Validation schemas & functions
│   │   │   ├── utils/                 # Utility functions
│   │   │   ├── constants/             # Global constants
│   │   │   ├── events/                # Event type definitions
│   │   │   └── index.ts               # Public exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                           # Main API (Monolith)
│       ├── src/
│       │   ├── features/              # Feature modules (see section 3)
│       │   ├── middleware/            # Global middleware
│       │   ├── config/                # Configuration files
│       │   ├── app.ts                 # Express/Hono app setup
│       │   └── server.ts              # Server entry point
│       │
│       ├── tests/                     # Test files (mirror src structure)
│       ├── .env.example
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       └── eslint.config.js
│
├── services/                          # Future: Extracted microservices
│   ├── payment-service/               # (Will be created when extracting)
│   ├── user-service/
│   └── auth-service/
│
├── infra/                             # Infrastructure as Code
│   ├── docker-compose.yml             # Local development setup
│   └── k8s/                           # Kubernetes configs (future)
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEVELOPMENT.md
│
├── .github/
│   └── workflows/                     # CI/CD pipelines
│       ├── test.yml
│       ├── lint.yml
│       └── deploy.yml
│
├── turbo.json                         # Turborepo configuration
├── package.json                       # Root package.json
├── tsconfig.json                      # Root TypeScript config
├── eslint.config.js
├── prettier.config.js
├── .gitignore
├── readme.md
└── CHANGELOG.md
```

---

## 2. FOLDER ORGANIZATION

### 2.1 Root Level (`/`)

```
- turbo.json          # Turborepo workspace configuration
- package.json        # Root dependencies (dev tools)
- tsconfig.json       # Root TypeScript settings (base config)
- prettier.config.js  # Code formatter config
- eslint.config.js    # Linter config
- .gitignore          # Git ignore patterns
- readme.md           # Project overview
- CHANGELOG.md        # Version history
- .env.example        # Environment variables template
```

**Purpose:** Central configuration for entire monorepo

---

### 2.2 Packages Directory (`/packages/`)

#### 2.2.1 Database Package (`packages/database/`)

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── auth.ts              # Auth feature tables
│   │   ├── users.ts             # User feature tables
│   │   ├── payments.ts          # Payment feature tables
│   │   ├── orders.ts            # Order feature tables
│   │   ├── subscriptions.ts      # Subscription feature tables
│   │   ├── notifications.ts      # Notification feature tables
│   │   ├── audit.ts             # Audit feature tables
│   │   ├── quota.ts             # Quota feature tables
│   │   └── index.ts             # Export all tables
│   │
│   ├── migrations/
│   │   ├── 0001_init.sql        # Initial schema
│   │   ├── 0002_add_xyz.sql
│   │   └── ...
│   │
│   ├── seeds/
│   │   ├── seed.ts              # Main seed function
│   │   └── fixtures/            # Test fixtures
│   │
│   └── client.ts                # Database client singleton
│
├── drizzle.config.ts            # Drizzle ORM configuration
├── package.json
└── tsconfig.json
```

**Responsibilities:**
- Define all database schemas using Drizzle ORM
- Manage database migrations
- Export shared database client
- Provide seed data for development

---

#### 2.2.2 Shared Package (`packages/shared/`)

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.types.ts        # User-related types
│   │   ├── payment.types.ts      # Payment-related types
│   │   ├── common.types.ts       # Common types
│   │   └── index.ts
│   │
│   ├── errors/
│   │   ├── DomainError.ts        # Base domain error
│   │   ├── ApplicationError.ts    # Application layer error
│   │   ├── HttpError.ts          # HTTP error mapping
│   │   ├── AuthErrors.ts         # Auth-specific errors
│   │   ├── ValidationError.ts     # Validation errors
│   │   └── index.ts
│   │
│   ├── validators/
│   │   ├── email.validator.ts    # Email validation
│   │   ├── password.validator.ts # Password validation
│   │   ├── zod.schemas.ts        # Zod validation schemas
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── string.utils.ts       # String utilities
│   │   ├── date.utils.ts         # Date utilities
│   │   ├── crypto.utils.ts       # Crypto utilities
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── http-status.ts        # HTTP status codes
│   │   ├── error-codes.ts        # Error codes
│   │   ├── app-config.ts         # App configuration constants
│   │   └── index.ts
│   │
│   ├── events/
│   │   ├── user.events.ts        # User event types
│   │   ├── payment.events.ts      # Payment event types
│   │   └── index.ts
│   │
│   └── index.ts                  # Public exports only
│
├── package.json
└── tsconfig.json
```

**Responsibilities:**
- Export shared types and interfaces
- Provide custom error classes
- Supply validation utilities
- Offer common utility functions
- Define event type structures

---

#### 2.2.3 API Package (`packages/api/`)

This is the main monolith. Structure is detailed in Section 3.

---

### 2.3 Services Directory (`/services/`) - Future

```
services/                         # Created when extracting microservices
├── payment-service/              # Payment microservice
│   ├── src/features/payments/   # (moved from monolith)
│   ├── Dockerfile
│   └── package.json
│
├── user-service/
│   ├── src/features/users/
│   ├── Dockerfile
│   └── package.json
│
└── auth-service/
    ├── src/features/auth/
    ├── Dockerfile
    └── package.json
```

---

### 2.4 Infrastructure (`/infra/`)

```
infra/
├── docker-compose.yml           # Local development stack
│   - PostgreSQL
│   - Redis (optional)
│   - RabbitMQ (optional)
│
└── k8s/                         # Kubernetes configs (future)
    ├── deployments/
    ├── services/
    └── ingress.yaml
```

---

### 2.5 Documentation (`/docs/`)

```
docs/
├── ARCHITECTURE.md              # Architecture overview
├── API.md                       # API documentation
├── DATABASE.md                  # Database schema & relationships
├── DEVELOPMENT.md               # Development guide
├── DEPLOYMENT.md                # Deployment procedures
├── TESTING.md                   # Testing strategy
└── TROUBLESHOOTING.md           # Common issues
```

---

## 3. FEATURE MODULE ANATOMY

Each feature is a **self-contained module** with all 4 clean architecture layers.

### 3.1 Complete Feature Module Structure

```
src/features/{feature-name}/
├── domain/                      # LAYER 1: Business Logic (Pure)
│   ├── entities/
│   │   ├── User.entity.ts       # User entity with methods
│   │   └── ...
│   │
│   ├── value-objects/           # Value Objects (small, immutable)
│   │   ├── Email.ts
│   │   ├── Password.ts
│   │   └── ...
│   │
│   ├── interfaces/              # Contracts (NOT implementations)
│   │   ├── IUserRepository.ts
│   │   ├── IHashProvider.ts
│   │   └── ...
│   │
│   ├── errors/                  # Domain-specific errors
│   │   ├── UserNotFoundError.ts
│   │   ├── InvalidEmailError.ts
│   │   └── ...
│   │
│   ├── types/                   # Domain types
│   │   └── index.ts
│   │
│   └── index.ts                 # Public exports
│
├── application/                 # LAYER 2: Use Cases & Orchestration
│   ├── dtos/                    # Data Transfer Objects
│   │   ├── input/
│   │   │   ├── LoginRequest.ts
│   │   │   ├── RegisterRequest.ts
│   │   │   └── ...
│   │   │
│   │   └── output/
│   │       ├── LoginResponse.ts
│   │       ├── UserResponse.ts
│   │       └── ...
│   │
│   ├── usecases/                # Business workflows
│   │   ├── LoginUseCase.ts
│   │   ├── RegisterUseCase.ts
│   │   ├── RefreshTokenUseCase.ts
│   │   └── ...
│   │
│   ├── mappers/                 # DTO ↔ Entity mapping
│   │   ├── UserMapper.ts
│   │   └── ...
│   │
│   └── index.ts                 # Public exports
│
├── infrastructure/              # LAYER 4: Implementation Details
│   ├── repositories/            # Data access layer
│   │   ├── UserRepository.ts    # Implements IUserRepository
│   │   └── ...
│   │
│   ├── providers/               # External services
│   │   ├── KeycloakProvider.ts
│   │   ├── BcryptHashProvider.ts
│   │   └── ...
│   │
│   ├── external/                # External API clients
│   │   ├── keycloak.client.ts
│   │   └── ...
│   │
│   ├── database/                # DB schema for this feature
│   │   └── user.schema.ts       # (Often shared in packages/database/)
│   │
│   └── index.ts                 # Public exports
│
├── presentation/                # LAYER 3: HTTP Interface
│   ├── controllers/             # Request handlers
│   │   ├── LoginController.ts
│   │   ├── RegisterController.ts
│   │   └── ...
│   │
│   ├── middleware/              # Feature-specific middleware
│   │   ├── authMiddleware.ts
│   │   └── ...
│   │
│   ├── routes.ts                # Route definitions
│   │
│   └── index.ts                 # Public exports
│
├── container.ts                 # Dependency Injection setup
│
└── index.ts                     # PUBLIC API - Only exports needed!
    # Export ONLY what other features need
    # Hide implementation details
```

### 3.2 Example: Auth Feature

```
src/features/auth/
├── domain/
│   ├── entities/
│   │   └── User.entity.ts
│   ├── value-objects/
│   │   ├── Email.ts
│   │   └── Password.ts
│   ├── interfaces/
│   │   ├── IUserRepository.ts
│   │   ├── IHashProvider.ts
│   │   ├── ITokenGenerator.ts
│   │   └── IAuthProvider.ts
│   ├── errors/
│   │   ├── InvalidCredentialsError.ts
│   │   ├── UserAlreadyExistsError.ts
│   │   ├── InvalidTokenError.ts
│   │   └── UserNotFoundError.ts
│   └── index.ts
│
├── application/
│   ├── dtos/
│   │   ├── input/
│   │   │   ├── LoginRequest.ts
│   │   │   ├── RegisterRequest.ts
│   │   │   └── RefreshTokenRequest.ts
│   │   └── output/
│   │       ├── AuthResponse.ts
│   │       └── UserResponse.ts
│   ├── usecases/
│   │   ├── LoginUseCase.ts
│   │   ├── RegisterUseCase.ts
│   │   ├── RefreshTokenUseCase.ts
│   │   ├── LogoutUseCase.ts
│   │   └── VerifyTokenUseCase.ts
│   ├── mappers/
│   │   └── UserMapper.ts
│   └── index.ts
│
├── infrastructure/
│   ├── repositories/
│   │   └── UserRepository.ts
│   ├── providers/
│   │   ├── KeycloakAuthProvider.ts
│   │   └── BcryptHashProvider.ts
│   ├── external/
│   │   └── keycloak.client.ts
│   └── index.ts
│
├── presentation/
│   ├── controllers/
│   │   ├── LoginController.ts
│   │   ├── RegisterController.ts
│   │   └── RefreshTokenController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── routes.ts
│   └── index.ts
│
├── container.ts
└── index.ts
```

---

## 4. SETUP INSTRUCTIONS

### 4.1 Prerequisites

```bash
# Check versions
node --version          # v20+
bun --version          # v1.0+
```

### 4.2 Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd saas-platform

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env.local

# Setup database
cd packages/database
bun run migrate
bun run seed

# Start development server
cd ../../packages/api
bun run dev
```

### 4.3 Environment Variables (`.env.local`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saas_dev

# Auth (Keycloak)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=saas
KEYCLOAK_CLIENT_ID=saas-app
KEYCLOAK_CLIENT_SECRET=xxx

# JWT
JWT_SECRET=your-secret-key
JWT_ALGORITHM=RS256

# Payment Providers
POLAR_API_KEY=xxx
MIDTRANS_SERVER_KEY=xxx
XENDIT_API_KEY=xxx
COINBASE_API_KEY=xxx

# Email
SENDGRID_API_KEY=xxx

# SMS
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Firebase (Push notifications)
FIREBASE_CONFIG=xxx

# App
NODE_ENV=development
API_PORT=3000
API_BASE_URL=http://localhost:3000
```

### 4.4 Docker Setup

```bash
# Start all services locally
docker-compose -f infra/docker-compose.yml up

# Stop services
docker-compose -f infra/docker-compose.yml down
```

---

## 5. DEVELOPMENT WORKFLOW

### 5.1 Creating a New Feature

```bash
# 1. Create feature directory
mkdir -p src/features/{feature-name}/{domain,application,infrastructure,presentation}

# 2. Create domain entities
# src/features/{feature-name}/domain/entities/MyEntity.ts

# 3. Create domain interfaces
# src/features/{feature-name}/domain/interfaces/IMyRepository.ts

# 4. Create domain errors
# src/features/{feature-name}/domain/errors/MyError.ts

# 5. Create application DTOs
# src/features/{feature-name}/application/dtos/...

# 6. Create use cases
# src/features/{feature-name}/application/usecases/...

# 7. Create repositories
# src/features/{feature-name}/infrastructure/repositories/...

# 8. Create controllers
# src/features/{feature-name}/presentation/controllers/...

# 9. Create routes
# src/features/{feature-name}/presentation/routes.ts

# 10. Create container (DI)
# src/features/{feature-name}/container.ts

# 11. Create public API
# src/features/{feature-name}/index.ts

# 12. Mount in main app
# src/app.ts
```

### 5.2 Writing Tests

```
tests/
├── features/
│   └── {feature}/
│       ├── domain/
│       │   └── entities/
│       │       └── MyEntity.test.ts
│       ├── application/
│       │   └── usecases/
│       │       └── MyUseCase.test.ts
│       └── presentation/
│           └── controllers/
│               └── MyController.test.ts
```

### 5.3 Code Review Checklist

- [ ] Follows folder structure convention
- [ ] No imports from implementation (only interfaces/public exports)
- [ ] All layers properly separated
- [ ] Tests written (>80% coverage)
- [ ] Database migrations created
- [ ] Documentation updated
- [ ] No circular dependencies
- [ ] Environment variables documented

---

## 6. FILE NAMING CONVENTIONS

### 6.1 Entity Files
```
{Entity}.entity.ts

Examples:
- User.entity.ts
- Payment.entity.ts
- Order.entity.ts
```

### 6.2 Repository Files
```
{Entity}Repository.ts

Examples:
- UserRepository.ts
- PaymentRepository.ts
```

### 6.3 Use Case Files
```
{Action}UseCase.ts

Examples:
- LoginUseCase.ts
- CreatePaymentUseCase.ts
- UpdateUserProfileUseCase.ts
```

### 6.4 DTO Files
```
{Action}Request.ts / {Action}Response.ts

Examples:
- LoginRequest.ts
- LoginResponse.ts
- CreatePaymentRequest.ts
```

### 6.5 Controller Files
```
{Resource}Controller.ts

Examples:
- UserController.ts
- PaymentController.ts
```

### 6.6 Provider Files
```
{Service}Provider.ts

Examples:
- KeycloakProvider.ts
- BcryptHashProvider.ts
```

### 6.7 Error Classes
```
{ErrorType}Error.ts

Examples:
- UserNotFoundError.ts
- InvalidCredentialsError.ts
```

### 6.8 Test Files
```
{File}.test.ts or {File}.spec.ts

Examples:
- User.entity.test.ts
- LoginUseCase.test.ts
```

### 6.9 Schema Files
```
{feature}.schema.ts

Examples:
- user.schema.ts
- payment.schema.ts
```

---

## 7. IMPORT PATTERNS

### 7.1 Import from Same Feature

```typescript
// ✅ GOOD: Direct import within feature
import { User } from './domain/entities'
import { LoginUseCase } from './application/usecases'

// ✅ GOOD: From index.ts
import { User, LoginUseCase } from '.'
```

### 7.2 Import from Other Features

```typescript
// ✅ GOOD: Only from public API (index.ts)
import { User } from '@/features/users'
import { UserRepository } from '@/features/users'

// ❌ BAD: Direct internal imports
import { UserRepository } from '@/features/users/infrastructure/repositories'
import { UserEntity } from '@/features/users/domain/entities'
```

### 7.3 Import from Shared Package

```typescript
// ✅ GOOD: From shared package
import { DomainError, ValidationError } from '@repo/shared'
import { AppConfig } from '@repo/shared'

// ✅ GOOD: From database package
import { db, tables } from '@repo/database'
```

### 7.4 Import from Same Layer

```typescript
// ✅ GOOD: Within same layer
// In application/usecases/LoginUseCase.ts
import { User } from '../../domain/entities'
import { InvalidCredentialsError } from '../../domain/errors'
```

### 7.5 TypeScript Path Aliases

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@repo/database": ["../../packages/database/src"],
      "@repo/shared": ["../../packages/shared/src"]
    }
  }
}
```

---

## 8. DEPENDENCY INJECTION PATTERN

### 8.1 Container Pattern (Per Feature)

```typescript
// src/features/auth/container.ts
import { UserRepository } from './infrastructure/repositories'
import { LoginUseCase } from './application/usecases'

class AuthContainer {
  private instances: Map<string, any> = new Map()

  register(name: string, factory: () => any) {
    this.instances.set(name, factory())
  }

  get(name: string) {
    if (!this.instances.has(name)) {
      throw new Error(`Service ${name} not found in container`)
    }
    return this.instances.get(name)
  }
}

export const authContainer = new AuthContainer()

// Register all dependencies
authContainer.register('userRepository', () => new UserRepository())
authContainer.register('loginUseCase', () => 
  new LoginUseCase(
    authContainer.get('userRepository'),
    authContainer.get('hashProvider')
  )
)
```

### 8.2 Usage in Controller

```typescript
// src/features/auth/presentation/controllers/LoginController.ts
import { authContainer } from '../../container'

export class LoginController {
  private loginUseCase = authContainer.get('loginUseCase')

  async handle(c: Context) {
    const response = await this.loginUseCase.execute(request)
    return c.json(response)
  }
}
```

---

## 9. CIRCULAR DEPENDENCY PREVENTION

### 9.1 Rules

1. **Domain** can ONLY depend on:
   - Other domain layer classes
   - Never on application or infrastructure

2. **Application** can depend on:
   - Domain layer only
   - DTOs from same layer

3. **Infrastructure** can depend on:
   - Domain interfaces (implements them)
   - Never on application layer

4. **Presentation** can depend on:
   - Application layer (use cases)
   - Domain entities
   - Infrastructure providers

### 9.2 Example of Proper Dependency Flow

```
Presentation Controller
    ↓ (depends on)
Application UseCase
    ↓ (depends on)
Domain Entity + Domain Interfaces
    ↑ (implemented by)
Infrastructure Repository + Provider
```

---

## 10. DOCUMENTATION CHECKLIST

For each feature module, ensure:

- [ ] `readme.md` describing the feature
- [ ] API endpoints documented (route list)
- [ ] DTO/Request-Response examples
- [ ] Database schema documented
- [ ] Error codes documented
- [ ] Event types documented
- [ ] External dependencies listed

---

## APPENDIX A: QUICK COMMANDS

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run test             # Run tests
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Generate coverage report

# Database
bun run migrate          # Run migrations
bun run migrate:rollback # Rollback last migration
bun run seed             # Seed database

# Code Quality
bun run lint             # Run ESLint
bun run format           # Format code with Prettier
bun run type-check       # Run TypeScript check

# Docker
docker-compose up -d     # Start Docker containers
docker-compose down      # Stop Docker containers

# Turborepo
bun run turbo:build      # Build all packages
bun run turbo:test       # Test all packages
```

---

## APPENDIX B: TROUBLESHOOTING

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check connection string in .env.local
```

### Port Already in Use
```bash
# Change API_PORT in .env.local
API_PORT=3001

# Or kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
bun install

# Check tsconfig path aliases
```

---

**Document Version:** 1.0.0  
**Last Updated:** December 13, 2024  
**Maintained By:** Development Team
