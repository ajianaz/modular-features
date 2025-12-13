# Project Requirements Document (PRD)

**Project Name:** SAAS Platform - Modular Monolith  
**Version:** 1.0.0  
**Last Updated:** December 13, 2024  
**Status:** Planning Phase  

---

## 1. EXECUTIVE SUMMARY

### Vision
Build a scalable, modular SaaS platform with feature-based clean architecture that can evolve from monolith to microservices without major refactoring.

### Goals
- **Immediate (0-3 months):** Launch MVP with core features as modular monolith
- **Short-term (3-6 months):** Add growth features and monitoring capabilities
- **Medium-term (6-12 months):** Gradually extract services to microservices as needed
- **Long-term:** Support multiple SaaS applications on shared infrastructure

### Success Metrics
- Time to deploy new feature: < 4 hours
- Code coverage: > 80%
- Uptime: > 99%
- Easy feature extraction to microservice: < 2 days
- Zero breaking changes during service extraction

---

## 2. PRODUCT OVERVIEW

### 2.1 Core Features

#### Authentication & Authorization
- Multi-provider authentication (Keycloak, OAuth2, OIDC)
- JWT token management with refresh token rotation
- Session management
- Role-based access control (RBAC)

#### User Management
- User profile management
- User settings and preferences
- User activity tracking
- Multi-tenant support (future)

#### Payment Processing
- Multi-provider payment integration (Polar, Midtrans, Xendit, Coinbase)
- Transaction history
- Invoice generation
- Payment method management
- Crypto payment support

#### Subscription & Billing
- Multiple subscription plans (Starter, Pro, Enterprise)
- Recurring billing automation
- Usage-based metering
- Invoice generation and delivery

#### Order Management
- Order creation and tracking
- Order status workflows
- Order history and reporting

#### Notifications
- Multi-channel notifications (Email, SMS, Push, In-app)
- Template-based notification system
- Event-triggered notifications
- Notification history and preferences

#### Audit & Logging
- Comprehensive audit trail
- User action tracking
- Data modification history
- System event logging
- Regulatory compliance support

#### Rate Limiting & Quota
- API rate limiting (per user, per plan)
- Feature usage quota management
- Real-time quota tracking
- Quota enforcement

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Architecture Pattern
**Modular Monolith with Feature-Based Clean Architecture**

```
Layers:
├── Presentation Layer (Controllers, Routes, Middleware)
├── Application Layer (Use Cases, DTOs, Orchestration)
├── Domain Layer (Entities, Business Logic, Interfaces)
└── Infrastructure Layer (Repositories, External APIs, Database)

Plus: Shared utilities (Errors, Validators, Types)
```

### 3.2 Technology Stack

**Runtime & Framework:**
- Runtime: Bun
- Web Framework: Hono
- Package Manager: Bun

**Database:**
- DBMS: PostgreSQL
- ORM: Drizzle ORM
- Migrations: Drizzle Kit

**Authentication:**
- Framework: BetterAuth
- Provider: Keycloak (OAuth2/OIDC)

**Payment Providers:**
- Polar (SaaS subscriptions)
- Midtrans (Credit card, Bank transfer)
- Xendit (E-wallet, Bank transfer)
- Coinbase (Crypto payments)

**Message Queue (Future):**
- RabbitMQ (for event-driven architecture when extracting services)

**Caching (Optional for MVP):**
- Redis (session/query caching, rate limiting)

**Project Management:**
- Monorepo: Turborepo

**Monitoring & Logging (Future):**
- Logging: Winston or Pino
- Application Performance: Prometheus
- Error Tracking: Sentry or custom

---

## 4. FEATURES BREAKDOWN

### 4.1 Auth Service

**Purpose:** Central authentication and authorization service

**Features:**
- Login/Register with Keycloak OAuth2
- JWT token generation and validation
- Session management
- Refresh token rotation
- Multi-provider support (Google, GitHub, Keycloak)
- RBAC (Role-Based Access Control)
- MFA support (future)

**Dependencies:**
- Keycloak instance (external)
- PostgreSQL (users, sessions, oauth_accounts tables)
- BetterAuth library

**API Endpoints:**
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/verify
POST   /auth/register
```

**Events Published:**
- `user.created`
- `user.authenticated`
- `session.created`
- `session.revoked`

---

### 4.2 User Service

**Purpose:** Single source of truth for user information across the platform

**Features:**
- User profile management
- User settings management
- User role management
- User activity tracking
- Avatar/profile picture handling

**Dependencies:**
- PostgreSQL (users, user_profiles, user_settings, user_roles tables)
- Auth Service (for user validation)
- File storage (S3/Minio for avatars)

**API Endpoints:**
```
GET    /users/:id
GET    /users/:id/profile
PATCH  /users/:id/profile
GET    /users/:id/settings
PATCH  /users/:id/settings
GET    /users/email/:email
DELETE /users/:id
POST   /users/:id/avatar
```

**Events Published:**
- `user.updated`
- `user.settings.changed`
- `user.avatar.uploaded`

---

### 4.3 Payment Service

**Purpose:** Multi-provider payment processing

**Features:**
- Multi-provider payment gateway (Polar, Midtrans, Xendit, Coinbase)
- Transaction management
- Invoice generation
- Payment method storage
- Webhook handling for payment providers
- Crypto payment support

**Dependencies:**
- PostgreSQL (transactions, invoices, payment_methods tables)
- Polar SDK
- Midtrans SDK
- Xendit SDK
- Coinbase SDK
- User Service (for user validation)
- Notification Service (for payment confirmations)

**API Endpoints:**
```
POST   /payments/create
GET    /payments/:id
GET    /payments/user/:userId
POST   /payments/webhook/:provider
GET    /invoices/:id
POST   /invoices/generate
```

**Events Published:**
- `payment.initiated`
- `payment.completed`
- `payment.failed`
- `invoice.generated`
- `invoice.sent`

---

### 4.4 Order Service

**Purpose:** Order creation, tracking, and management

**Features:**
- Order creation
- Order status tracking
- Order history
- Order item management
- Order fulfillment tracking

**Dependencies:**
- PostgreSQL (orders, order_items, order_status_history tables)
- Payment Service (payment verification)
- User Service (user validation)
- Notification Service (order updates)

**API Endpoints:**
```
POST   /orders
GET    /orders/:id
GET    /orders/user/:userId
PATCH  /orders/:id
GET    /orders/:id/status
GET    /orders/:id/items
```

**Events Published:**
- `order.created`
- `order.status.changed`
- `order.completed`
- `order.cancelled`

---

### 4.5 Subscription Service

**Purpose:** Subscription and billing management

**Features:**
- Subscription plan management
- Subscription creation
- Recurring payment automation
- Usage-based billing
- Plan upgrades/downgrades
- Cancellation and refunds

**Dependencies:**
- PostgreSQL (subscriptions, subscription_plans, subscription_usage tables)
- Payment Service (payment processing)
- User Service (user validation)
- Billing Service (invoice generation)
- Notification Service (subscription updates)

**API Endpoints:**
```
GET    /subscriptions/plans
GET    /subscriptions/user/:userId
POST   /subscriptions/create
PATCH  /subscriptions/:id
POST   /subscriptions/:id/upgrade
POST   /subscriptions/:id/downgrade
POST   /subscriptions/:id/cancel
GET    /subscriptions/:id/usage
```

**Events Published:**
- `subscription.created`
- `subscription.activated`
- `subscription.renewed`
- `subscription.upgraded`
- `subscription.cancelled`
- `subscription.billing.failed`

---

### 4.6 Notification Service

**Purpose:** Multi-channel notification delivery

**Features:**
- Email notifications
- SMS notifications (Twilio/AWS SNS)
- Push notifications (Firebase)
- In-app notifications
- Notification templates
- Notification preferences
- Delivery tracking

**Dependencies:**
- PostgreSQL (notifications, notification_templates, notification_preferences tables)
- SendGrid (Email)
- Twilio/AWS SNS (SMS)
- Firebase Cloud Messaging (Push)
- User Service (recipient validation)

**API Endpoints:**
```
POST   /notifications/send
GET    /notifications/user/:userId
GET    /notifications/:id
PATCH  /notifications/:id/read
DELETE /notifications/:id
GET    /notifications/preferences
PATCH  /notifications/preferences
POST   /notifications/templates
```

**Events Consumed:**
- `user.created` → Welcome email
- `payment.completed` → Payment receipt
- `order.created` → Order confirmation
- `subscription.renewed` → Renewal notification

---

### 4.7 Audit Service

**Purpose:** Comprehensive audit trail and compliance logging

**Features:**
- User action tracking
- Data modification audit trail
- API call logging
- Error/exception logging
- Security event logging
- Compliance report generation
- Data retention policies

**Dependencies:**
- PostgreSQL (audit_logs, audit_events, system_logs tables)
- Elasticsearch (optional for advanced querying)

**API Endpoints:**
```
POST   /audit/log
GET    /audit/logs/:userId
GET    /audit/logs/resource/:resourceId
GET    /audit/events
GET    /audit/events/security
POST   /audit/reports/compliance
```

**Events Consumed:**
- All service events are logged automatically via middleware

---

### 4.8 Rate Limiting & Quota Service

**Purpose:** API rate limiting and usage quota management

**Features:**
- Per-user rate limiting
- Per-plan quota limits
- Real-time usage tracking
- Quota reset schedules
- Rate limit headers (X-RateLimit-*)
- Quota warnings

**Dependencies:**
- PostgreSQL (quota_limits, usage_tracking tables)
- Redis (optional, for fast rate limit checks)
- User Service (plan information)

**API Endpoints:**
```
GET    /quota/user/:userId
GET    /quota/user/:userId/usage
POST   /quota/reset/:userId
GET    /quota/limits
```

**Middleware:**
- Rate limiter middleware (all routes)
- Quota enforcement middleware (protected routes)

---

## 5. DATABASE SCHEMA (Overview)

### 5.1 Auth Service Schema
```
- users (id, email, name, keycloak_id, created_at, updated_at)
- sessions (id, user_id, token, refresh_token, expires_at)
- oauth_accounts (id, user_id, provider, provider_account_id, access_token, refresh_token)
```

### 5.2 User Service Schema
```
- user_profiles (id, user_id, bio, location, website, phone_number)
- user_settings (id, user_id, language, timezone, email_notifications, two_factor_enabled)
- user_roles (id, user_id, role, assigned_at)
```

### 5.3 Payment Service Schema
```
- transactions (id, order_id, user_id, amount, currency, provider, provider_transaction_id, status, metadata)
- invoices (id, transaction_id, invoice_number, amount, due_date, status)
- payment_methods (id, user_id, type, provider, provider_payment_method_id, is_default)
```

### 5.4 Order Service Schema
```
- orders (id, user_id, status, total_amount, created_at)
- order_items (id, order_id, product_id, quantity, unit_price)
- order_status_history (id, order_id, old_status, new_status, changed_at)
```

### 5.5 Subscription Service Schema
```
- subscription_plans (id, name, description, price, billing_cycle, features)
- subscriptions (id, user_id, plan_id, status, start_date, renewal_date, cancelled_at)
- subscription_usage (id, subscription_id, resource, usage_count, reset_date)
```

### 5.6 Notification Service Schema
```
- notification_templates (id, type, name, subject, body, variables)
- notifications (id, user_id, type, channel, status, sent_at, read_at)
- notification_preferences (id, user_id, channel, enabled)
```

### 5.7 Audit Service Schema
```
- audit_logs (id, user_id, action, resource, resource_id, old_values, new_values, ip, user_agent, created_at)
- audit_events (id, event_type, severity, description, metadata, created_at)
- system_logs (id, level, service, message, stack_trace, created_at)
```

### 5.8 Rate Limiting & Quota Service Schema
```
- quota_limits (id, plan_id, resource, limit_value, reset_period)
- usage_tracking (id, user_id, resource, usage_count, period_start, period_end)
```

---

## 6. API GATEWAY

### 6.1 Responsibilities
- Request routing to services
- Authentication middleware
- Authorization checks
- Request validation
- Rate limiting enforcement
- Logging all requests
- Error handling and standardization
- CORS management

### 6.2 API Design
- RESTful principles
- JSON request/response
- Standard HTTP status codes
- Error response format:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User not found",
    "statusCode": 404
  }
}
```

---

## 7. DEPLOYMENT & INFRASTRUCTURE

### 7.1 Current Phase (Monolith)
- **Infrastructure:** Oracle Cloud Always Free (4 CPU, 24 GB RAM)
- **Database:** PostgreSQL (shared single instance)
- **Deployment:** Docker single container
- **Cost:** ~$50-100/month

### 7.2 Future Phase (Microservices)
- **Infrastructure:** Multiple containers (separate per service)
- **Database:** PostgreSQL per service (database-per-service pattern)
- **Message Queue:** RabbitMQ
- **Deployment:** Docker multiple containers or Kubernetes
- **Cost:** ~$200-400/month

---

## 8. SECURITY REQUIREMENTS

- HTTPS/TLS for all endpoints
- JWT token signing with RS256 algorithm
- Password hashing with bcrypt (min 12 rounds)
- CORS properly configured
- Rate limiting to prevent brute force
- Input validation and sanitization
- SQL injection prevention (via ORM)
- XSS prevention
- CSRF token for state-changing operations
- API key management for third-party integrations
- Audit logging for all sensitive operations
- Data encryption at rest (future)
- Two-factor authentication (future)

---

## 9. PERFORMANCE REQUIREMENTS

- API response time: < 500ms (P95)
- Database queries: < 100ms (P95)
- Cache hit rate: > 80%
- Throughput: > 1000 RPS
- Uptime: > 99%
- Database connection pool: 20-50 connections

---

## 10. MONITORING & OBSERVABILITY

### 10.1 Logging
- Application logs: Winston or Pino
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized log storage (future)

### 10.2 Metrics
- Request rate (RPS)
- Response time (latency)
- Error rate
- Database connection pool usage
- Memory usage
- CPU usage

### 10.3 Error Tracking
- Sentry integration (future)
- Error alerts
- Error grouping by type/service
- Stack trace capture

### 10.4 Health Checks
- Database connectivity
- External API connectivity
- Message queue status
- Cache status
- Disk space monitoring

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests
- Target: > 80% coverage
- Test: Domain entities, use cases, utilities
- Framework: Vitest or Jest

### 11.2 Integration Tests
- Test: Use cases with real repositories
- Database: Test database (fixtures)

### 11.3 E2E Tests
- Test: Full API workflows
- Framework: Supertest or Playwright

### 11.4 Performance Tests
- Load testing: Artillery or K6
- Target: > 1000 RPS

---

## 12. DEVELOPMENT WORKFLOW

### 12.1 Git Branching
```
main (production)
├── staging (QA)
├── dev (development)
└── feature/* (feature branches)
```

### 12.2 CI/CD Pipeline
1. Code push to branch
2. Run linting (ESLint)
3. Run type checking (TypeScript)
4. Run unit tests
5. Run integration tests
6. Code coverage check
7. Build Docker image
8. Deploy to staging (on PR merge to dev)
9. Deploy to production (on PR merge to main)

### 12.3 Code Quality
- Linter: ESLint
- Formatter: Prettier
- Type checking: TypeScript strict mode
- Coverage: > 80%

---

## 13. TIMELINE & MILESTONES

### Milestone 1: Project Setup (Week 1-2)
- Repository setup
- Folder structure
- Database schema
- CI/CD pipeline
- Development environment

### Milestone 2: Auth Service (Week 3-4)
- Keycloak integration
- BetterAuth setup
- Login/Logout functionality
- Token management

### Milestone 3: Core Services (Week 5-8)
- User Service
- Payment Service (single provider)
- Order Service

### Milestone 4: Advanced Features (Week 9-12)
- Subscription Service
- Notification Service
- Rate Limiting Service

### Milestone 5: Monitoring & Logging (Week 13-14)
- Audit Service
- Logging setup
- Monitoring dashboard

### Milestone 6: Testing & Polish (Week 15-16)
- Unit tests
- Integration tests
- Performance testing
- Documentation

### MVP Launch: Week 16

---

## 14. FUTURE ENHANCEMENTS

### Phase 2 (Months 6-12)
- Extract services to microservices (as needed)
- Add caching layer (Redis)
- Multi-tenant support
- Advanced analytics
- Admin dashboard
- API documentation (Swagger)

### Phase 3 (Months 12+)
- Machine learning features
- Advanced reporting
- Custom workflows
- Plugin system
- Mobile app API optimization

---

## 15. ASSUMPTIONS & CONSTRAINTS

### Assumptions
- Single database for MVP (shared schema)
- Synchronous API communication initially
- Single deployment region
- Monolith deployment model

### Constraints
- Oracle Cloud Always Free tier (4 CPU, 24 GB RAM)
- Team size: 1-2 developers initially
- Budget: Minimal infrastructure costs
- Development speed: Feature-focused

---

## 16. SUCCESS CRITERIA

- [ ] MVP launched with core features
- [ ] 80%+ test coverage
- [ ] < 500ms API response time
- [ ] Feature extraction to microservice < 2 days
- [ ] Zero data loss incidents
- [ ] Audit trail captures all important events
- [ ] Developers can onboard in < 2 hours
- [ ] Zero breaking changes during evolution to microservices

---

## APPENDIX A: GLOSSARY

| Term | Definition |
|------|-----------|
| **Monolith** | Single application serving all features |
| **Microservice** | Independent service for specific feature |
| **Feature Module** | Self-contained feature with all layers |
| **Clean Architecture** | Layered architecture with clear separation of concerns |
| **DTO** | Data Transfer Object for layer communication |
| **Use Case** | Business workflow/logic |
| **Entity** | Core business object |
| **Repository** | Data access abstraction |
| **Event** | Async notification of something that happened |

---

## APPENDIX B: DOCUMENT REVISIONS

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Dec 13, 2024 | Initial PRD | Developer |

---

**Document Owner:** Development Team  
**Last Review:** December 13, 2024  
**Next Review:** January 13, 2025
