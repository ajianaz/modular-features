# @modular-monolith/api

API layer with clean architecture for modular monolith SaaS platform.

## Structure

```
src/
├── features/          # Feature modules with clean architecture
│   ├── auth/         # Authentication service
│   ├── users/        # User management service
│   ├── payments/     # Payment processing service
│   ├── orders/       # Order management service
│   ├── subscriptions/ # Subscription & billing service
│   ├── notifications/ # Notification service
│   ├── audit/        # Audit & logging service
│   └── quota/        # Rate limiting & quota service
├── app.ts            # Main Hono application
├── server.ts         # Server configuration
└── index.ts         # Main entry point
```

## Feature Structure

Each feature follows clean architecture:

```
features/{feature}/
├── domain/          # Business logic and entities
│   ├── entities/     # Domain entities
│   ├── value-objects/ # Value objects
│   ├── interfaces/   # Repository and provider interfaces
│   └── errors/      # Domain-specific errors
├── application/     # Use cases and orchestration
│   ├── usecases/    # Business use cases
│   ├── dtos/        # Data transfer objects
│   └── mappers/     # Entity-DTO mapping
├── infrastructure/  # External implementations
│   ├── repositories/ # Database repositories
│   ├── providers/    # External service providers
│   └── external/     # External service clients
├── presentation/    # API layer
│   ├── controllers/ # HTTP controllers
│   ├── routes.ts     # Route definitions
│   └── middleware/  # Feature-specific middleware
├── container.ts     # Dependency injection
└── index.ts         # Public exports
```

## Development

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build
bun run build

# Lint
bun run lint

# Test
bun run test
```

## Dependencies

- **hono**: Web framework
- **better-auth**: Authentication
- **zod**: Schema validation (catalog)
- **dotenv**: Environment variables (catalog)
- **@modular-monolith/database**: Database access
- **@modular-monolith/shared**: Shared utilities
- **@modular-monolith/config**: Configuration

## API Endpoints

The API exposes RESTful endpoints for all features:

- `/auth/*` - Authentication endpoints
- `/users/*` - User management endpoints
- `/payments/*` - Payment processing endpoints
- `/orders/*` - Order management endpoints
- `/subscriptions/*` - Subscription endpoints
- `/notifications/*` - Notification endpoints
- `/audit/*` - Audit endpoints
- `/quota/*` - Quota management endpoints

## Configuration

Environment variables are loaded from the config package:

```typescript
import { config } from '@modular-monolith/config'
```

## Server

The server is configured with:

- Hono web framework
- Node.js adapter
- Error handling middleware
- CORS configuration
- Security headers
- Request logging
- Health check endpoints
