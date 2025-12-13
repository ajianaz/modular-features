# @modular-monolith/shared

Shared utilities, types, and error classes for the modular monolith SaaS platform.

## Structure

```
src/
├── types/          # Global type definitions
├── errors/         # Custom error classes
├── validators/      # Validation schemas
├── utils/          # Utility functions
├── constants/      # Global constants
├── events/         # Event type definitions
└── index.ts        # Public exports
```

## Usage

```typescript
import { User, DomainError, validateEmail } from '@modular-monolith/shared'

// Use types
const user: User = { /* ... */ }

// Use errors
throw new DomainError('Something went wrong')

// Use validators
const isValid = validateEmail('test@example.com')
```

## Development

```bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Lint
bun run lint

# Test
bun run test
```

## Dependencies

- **zod**: Schema validation
- **dotenv**: Environment variables
- **better-auth**: Authentication utilities (catalog)

## Exports

Only essential types, utilities, and errors are exported. Internal implementation details are kept private.
