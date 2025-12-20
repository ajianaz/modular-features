# SERVICES OVERVIEW & API ENDPOINTS

**Version:** 1.0.0  
**Date:** December 13, 2024

---

## TABLE OF CONTENTS

1. [Services Architecture](#1-services-architecture)
2. [Auth Service](#2-auth-service)
3. [User Service](#3-user-service)
4. [Payment Service](#4-payment-service)
5. [Order Service](#5-order-service)
6. [Subscription Service](#6-subscription-service)
7. [Notification Service](#7-notification-service)
8. [Audit Service](#8-audit-service)
9. [Rate Limiting & Quota Service](#9-rate-limiting--quota-service)
10. [Service Dependencies](#10-service-dependencies)

---

## 1. SERVICES ARCHITECTURE

### 1.1 Service Communication Pattern

```
┌─────────────────────────────────────┐
│       API Gateway (Hono)            │
│   - Request routing                 │
│   - Auth check                      │
│   - Rate limiting                   │
│   - Error handling                  │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┬────────────┬──────────────┐
    │          │          │            │              │
    ▼          ▼          ▼            ▼              ▼
  ┌────┐   ┌─────┐   ┌────────┐   ┌─────────┐   ┌────────┐
  │Auth│   │User │   │Payment │   │Order    │   │Notif   │
  │Svc │   │Svc  │   │Svc     │   │Svc      │   │Svc     │
  └────┘   └─────┘   └────────┘   └─────────┘   └────────┘
    │          │          │            │              │
    └──────────┼──────────┼────────────┼──────────────┘
               │
       ┌───────▼────────┐
       │  PostgreSQL    │ (Shared database, per-feature schema)
       └────────────────┘
```

### 1.2 Service Boundaries

| Service | Responsibility | Domain |
|---------|---|---|
| **Auth** | Authentication & authorization | Security, identity |
| **User** | User information & profiles | User data |
| **Payment** | Payment processing | Transactions |
| **Order** | Order management | Commerce |
| **Subscription** | Billing & subscriptions | Commerce |
| **Notification** | Multi-channel messaging | Communication |
| **Audit** | Event logging & compliance | Monitoring |
| **Quota** | Usage limits & rate limiting | Governance |

---

## 2. AUTH SERVICE

### 2.1 Purpose
Central authentication service using OAuth2/Keycloak with JWT tokens.

### 2.2 Key Features
- Multi-provider OAuth (Keycloak, Google, GitHub)
- JWT token generation & refresh
- Session management
- Role-based access control (RBAC)
- Token validation

### 2.3 API Endpoints

```
POST   /auth/login
  Request:  { "provider": "keycloak", "redirect_uri": "..." }
  Response: { "accessToken", "refreshToken", "expiresIn", "user" }
  Status:   200, 401, 422

POST   /auth/logout
  Request:  { "userId": "..." }
  Response: { "success": true }
  Status:   200

POST   /auth/refresh
  Request:  { "refreshToken": "..." }
  Response: { "accessToken", "refreshToken", "expiresIn" }
  Status:   200, 401

GET    /auth/me
  Headers:  Authorization: Bearer {token}
  Response: { "id", "email", "name", "roles" }
  Status:   200, 401

POST   /auth/verify
  Request:  { "token": "..." }
  Response: { "valid": true/false, "userId": "..." }
  Status:   200
```

### 2.4 Database Tables
- `users` - User accounts
- `sessions` - Active sessions
- `oauth_accounts` - OAuth provider mappings

### 2.5 Events Published
```
user.created             # New user registered
user.authenticated       # User logged in
session.created          # Session established
session.revoked          # Session ended
```

### 2.6 External Dependencies
- Keycloak (OAuth2/OIDC provider)
- BetterAuth library
- PostgreSQL

### 2.7 Error Codes
```
INVALID_CREDENTIALS    - Login failed
INVALID_TOKEN          - Token verification failed
USER_NOT_FOUND         - User doesn't exist
TOKEN_EXPIRED          - Token expired
INVALID_PROVIDER       - Unknown OAuth provider
```

---

## 3. USER SERVICE

### 3.1 Purpose
Single source of truth for user information across the platform.

### 3.2 Key Features
- User profile management
- User settings management
- User role assignment
- Avatar/picture upload
- User search

### 3.3 API Endpoints

```
GET    /users/:userId
  Response: { "id", "email", "name", "avatar", "role", "status" }
  Status:   200, 404

GET    /users/email/:email
  Response: { "id", "email", "name", ... }
  Status:   200, 404

GET    /users/:userId/profile
  Response: { "bio", "location", "website", "phone" }
  Status:   200, 404

PATCH  /users/:userId/profile
  Request:  { "bio": "...", "location": "...", ... }
  Response: { Updated profile data }
  Status:   200, 400, 404

GET    /users/:userId/settings
  Response: { "language", "timezone", "emailNotifications", ... }
  Status:   200, 404

PATCH  /users/:userId/settings
  Request:  { "language": "id", "timezone": "Asia/Jakarta", ... }
  Response: { Updated settings }
  Status:   200, 400, 404

POST   /users/:userId/avatar
  Body:     FormData with file
  Response: { "avatarUrl": "..." }
  Status:   201, 400

DELETE /users/:userId
  Response: { "success": true }
  Status:   200, 404
```

### 3.4 Database Tables
- `users` - Core user data
- `user_profiles` - Extended profile information
- `user_settings` - User preferences
- `user_roles` - User role assignments

### 3.5 Events Published
```
user.updated          # User data changed
user.settings.changed # User settings changed
user.avatar.uploaded  # Avatar file uploaded
```

### 3.6 Dependencies
- Auth Service (user validation)
- File storage (S3/Minio)

### 3.7 Error Codes
```
USER_NOT_FOUND        - User doesn't exist
INVALID_EMAIL         - Invalid email format
INVALID_PROFILE       - Profile data invalid
UPLOAD_FAILED         - File upload failed
```

---

## 4. PAYMENT SERVICE

### 4.1 Purpose
Multi-provider payment processing with transaction tracking.

### 4.2 Key Features
- Multiple payment providers (Polar, Midtrans, Xendit, Coinbase)
- Transaction history & status tracking
- Invoice generation
- Payment method management
- Webhook handling
- Crypto payment support

### 4.3 API Endpoints

```
POST   /payments/create
  Request:  { "amount", "currency", "provider", "description" }
  Response: { "transactionId", "checkoutUrl", "externalId" }
  Status:   201, 400, 422

GET    /payments/:transactionId
  Response: { "id", "amount", "status", "provider", "metadata" }
  Status:   200, 404

GET    /payments/user/:userId
  Query:    ?status=PENDING&limit=20&offset=0
  Response: [{ transaction data }]
  Status:   200

POST   /payments/webhook/:provider
  Body:     Provider-specific webhook payload
  Response: { "success": true }
  Status:   200, 400

GET    /invoices/:invoiceId
  Response: { "id", "number", "amount", "dueDate", "status" }
  Status:   200, 404

POST   /invoices/generate
  Request:  { "transactionId", "customerEmail" }
  Response: { "invoiceId", "invoiceUrl" }
  Status:   201, 400

GET    /invoices/user/:userId
  Response: [{ invoice data }]
  Status:   200

GET    /payment-methods/user/:userId
  Response: [{ "id", "type", "label", "isDefault" }]
  Status:   200

POST   /payment-methods/user/:userId
  Request:  { "type", "provider", "providerToken" }
  Response: { "id", "label", "isDefault" }
  Status:   201, 400
```

### 4.4 Database Tables
- `transactions` - Payment transactions
- `invoices` - Generated invoices
- `payment_methods` - Saved payment methods
- `provider_webhooks` - Webhook logs

### 4.5 Events Published
```
payment.initiated       # Payment process started
payment.completed       # Payment successful
payment.failed          # Payment failed
invoice.generated       # Invoice created
invoice.sent            # Invoice delivered
```

### 4.6 External Dependencies
- Polar SDK (subscriptions)
- Midtrans SDK (cards, bank transfer)
- Xendit SDK (e-wallets, bank transfer)
- Coinbase SDK (cryptocurrency)

### 4.7 Error Codes
```
PAYMENT_FAILED         - Payment processing failed
INVALID_AMOUNT         - Amount invalid
PROVIDER_ERROR         - External provider error
TRANSACTION_NOT_FOUND  - Transaction doesn't exist
INVALID_METHOD         - Payment method invalid
```

---

## 5. ORDER SERVICE

### 5.1 Purpose
Order creation, tracking, and management.

### 5.2 Key Features
- Order creation & validation
- Status tracking & workflows
- Order item management
- Order history
- Order cancellation

### 5.3 API Endpoints

```
POST   /orders
  Request:  { "items": [{ "productId", "quantity" }], "paymentMethod" }
  Response: { "id", "status", "totalAmount", "items", "createdAt" }
  Status:   201, 400, 422

GET    /orders/:orderId
  Response: { "id", "userId", "status", "items", "totalAmount", "timestamps" }
  Status:   200, 404

GET    /orders/user/:userId
  Query:    ?status=COMPLETED&limit=20
  Response: [{ order data }]
  Status:   200

PATCH  /orders/:orderId
  Request:  { "status": "SHIPPED" }
  Response: { Updated order }
  Status:   200, 400, 404

GET    /orders/:orderId/status
  Response: { "current": "PROCESSING", "history": [...] }
  Status:   200, 404

GET    /orders/:orderId/items
  Response: [{ "id", "productId", "quantity", "unitPrice", "subtotal" }]
  Status:   200, 404

POST   /orders/:orderId/cancel
  Request:  { "reason": "..." }
  Response: { "success": true, "refundStatus": "INITIATED" }
  Status:   200, 400, 404
```

### 5.4 Database Tables
- `orders` - Order headers
- `order_items` - Order line items
- `order_status_history` - Status changes timeline

### 5.5 Events Published
```
order.created           # New order placed
order.status.changed    # Status updated
order.completed         # Order fulfilled
order.cancelled         # Order cancelled
```

### 5.6 Dependencies
- Payment Service (payment verification)
- User Service (user validation)
- Notification Service (order updates)

### 5.7 Error Codes
```
ORDER_NOT_FOUND        - Order doesn't exist
INVALID_ITEMS          - Invalid order items
PAYMENT_REQUIRED       - Payment not completed
INVALID_STATUS         - Invalid status transition
CANCELLATION_FAILED    - Cannot cancel order
```

---

## 6. SUBSCRIPTION SERVICE

### 6.1 Purpose
Subscription management and recurring billing.

### 6.2 Key Features
- Subscription plan management
- Subscription creation & management
- Recurring payment automation
- Usage-based metering
- Plan upgrades/downgrades
- Cancellation & refunds

### 6.3 API Endpoints

```
GET    /subscriptions/plans
  Response: [{ "id", "name", "price", "billing_cycle", "features" }]
  Status:   200

GET    /subscriptions/plans/:planId
  Response: { "id", "name", "price", "features", "limits" }
  Status:   200, 404

GET    /subscriptions/user/:userId
  Response: [{ "id", "planId", "status", "renewalDate" }]
  Status:   200

POST   /subscriptions/create
  Request:  { "userId", "planId", "billingCycle": "monthly" }
  Response: { "id", "status", "startDate", "renewalDate" }
  Status:   201, 400, 422

PATCH  /subscriptions/:subscriptionId
  Request:  { "planId": "pro" }
  Response: { Updated subscription }
  Status:   200, 400, 404

POST   /subscriptions/:subscriptionId/upgrade
  Request:  { "newPlanId": "enterprise" }
  Response: { "success": true, "prorationCredit": 50.00 }
  Status:   200, 400, 404

POST   /subscriptions/:subscriptionId/downgrade
  Request:  { "newPlanId": "starter" }
  Response: { "success": true, "effectiveDate": "2024-01-10" }
  Status:   200, 400, 404

POST   /subscriptions/:subscriptionId/cancel
  Request:  { "reason": "..." }
  Response: { "success": true, "refundStatus": "INITIATED" }
  Status:   200, 400, 404

GET    /subscriptions/:subscriptionId/usage
  Response: { "resource": "api_calls", "usage": 5000, "limit": 10000 }
  Status:   200, 404
```

### 6.4 Database Tables
- `subscription_plans` - Available plans
- `subscriptions` - User subscriptions
- `subscription_usage` - Usage tracking
- `subscription_history` - Change history

### 6.5 Events Published
```
subscription.created        # Subscription started
subscription.activated      # Subscription active
subscription.renewed        # Auto-renewal done
subscription.upgraded       # Plan upgraded
subscription.downgraded     # Plan downgraded
subscription.cancelled      # Subscription ended
subscription.billing.failed # Billing failed
```

### 6.6 Dependencies
- Payment Service (recurring payments)
- User Service (user validation)
- Notification Service (billing emails)

### 6.7 Error Codes
```
PLAN_NOT_FOUND         - Plan doesn't exist
SUBSCRIPTION_NOT_FOUND - Subscription not found
INVALID_PLAN           - Plan invalid
UPGRADE_FAILED         - Upgrade failed
DOWNGRADE_FAILED       - Downgrade failed
```

---

## 7. NOTIFICATION SERVICE

### 7.1 Purpose
Multi-channel notification delivery system.

### 7.2 Key Features
- Email notifications (SendGrid)
- SMS notifications (Twilio)
- Push notifications (Firebase)
- In-app notifications
- Template system
- User preferences
- Delivery tracking

### 7.3 API Endpoints

```
POST   /notifications/send
  Request:  { "userId", "type": "email", "template": "order_confirmation", "data": {...} }
  Response: { "notificationId", "status": "SENT" }
  Status:   201, 400, 422

GET    /notifications/user/:userId
  Query:    ?limit=20&offset=0&channel=email
  Response: [{ "id", "type", "channel", "status", "sentAt" }]
  Status:   200

GET    /notifications/:notificationId
  Response: { "id", "userId", "type", "channel", "status", "content" }
  Status:   200, 404

PATCH  /notifications/:notificationId/read
  Response: { "success": true, "readAt": "..." }
  Status:   200, 404

DELETE /notifications/:notificationId
  Response: { "success": true }
  Status:   200, 404

GET    /notifications/preferences/user/:userId
  Response: { "email": true, "sms": false, "push": true, ... }
  Status:   200

PATCH  /notifications/preferences/user/:userId
  Request:  { "email": true, "sms": false, "push": true }
  Response: { Updated preferences }
  Status:   200

POST   /notifications/templates
  Request:  { "name", "type", "subject", "body", "variables": [...] }
  Response: { "id", "name", "type" }
  Status:   201, 400

GET    /notifications/templates
  Response: [{ "id", "name", "type", "createdAt" }]
  Status:   200
```

### 7.4 Database Tables
- `notification_templates` - Message templates
- `notifications` - Sent notifications log
- `notification_preferences` - User preferences
- `notification_channels` - Channel configuration

### 7.5 Events Consumed (Triggered by)
```
user.created            → Welcome email
payment.completed       → Payment receipt
order.created           → Order confirmation
subscription.renewed    → Renewal reminder
subscription.cancelled  → Cancellation notice
```

### 7.6 External Dependencies
- SendGrid (Email)
- Twilio or AWS SNS (SMS)
- Firebase Cloud Messaging (Push)

### 7.7 Error Codes
```
TEMPLATE_NOT_FOUND     - Template doesn't exist
DELIVERY_FAILED        - Notification delivery failed
INVALID_RECIPIENT      - Invalid email/phone
CHANNEL_UNAVAILABLE    - Channel not configured
RATE_LIMITED           - Too many requests
```

---

## 8. AUDIT SERVICE

### 8.1 Purpose
Comprehensive audit trail and compliance logging.

### 8.2 Key Features
- User action tracking
- Data modification audit
- API call logging
- Error/exception logging
- Security event logging
- Compliance reports

### 8.3 API Endpoints

```
POST   /audit/log
  Request:  { "userId", "action", "resource", "resourceId", "oldValues", "newValues" }
  Response: { "logId", "createdAt" }
  Status:   201

GET    /audit/logs/:userId
  Query:    ?limit=100&offset=0&startDate=&endDate=
  Response: [{ "id", "action", "resource", "timestamp" }]
  Status:   200

GET    /audit/logs/resource/:resourceId
  Response: [{ Audit logs for resource }]
  Status:   200

GET    /audit/events
  Query:    ?severity=HIGH&limit=50
  Response: [{ "id", "type", "severity", "description", "createdAt" }]
  Status:   200

GET    /audit/events/security
  Response: [{ Security-related events }]
  Status:   200

POST   /audit/reports/compliance
  Request:  { "startDate", "endDate", "type": "GDPR" }
  Response: { "reportId", "status": "PROCESSING", "estimatedTime": "2min" }
  Status:   201

GET    /audit/reports/:reportId
  Response: { "id", "status", "data": {...}, "downloadUrl": "..." }
  Status:   200, 202
```

### 8.4 Database Tables
- `audit_logs` - Detailed audit trail
- `audit_events` - System events
- `system_logs` - Application logs
- `compliance_reports` - Generated reports

### 8.5 Logging Strategy
- All user actions logged
- Data changes tracked (before/after)
- API calls logged (who, what, when)
- Errors logged with stack traces
- Security events flagged

### 8.6 Retention Policy
- Audit logs: 7 years (regulatory)
- System logs: 90 days
- Error logs: 30 days
- Security events: 1 year

### 8.7 Error Codes
```
AUDIT_LOG_FAILED       - Failed to log action
INVALID_DATE_RANGE     - Invalid date range
REPORT_NOT_FOUND       - Report doesn't exist
REPORT_GENERATION_FAILED - Report generation failed
```

---

## 9. RATE LIMITING & QUOTA SERVICE

### 9.1 Purpose
API rate limiting and usage quota enforcement.

### 9.2 Key Features
- Per-user rate limiting
- Per-plan quota limits
- Real-time usage tracking
- Quota reset schedules
- Rate limit headers
- Usage warnings

### 9.3 API Endpoints

```
GET    /quota/user/:userId
  Response: { "plan": "pro", "quotaLimits": { "api_calls": 10000, ... } }
  Status:   200

GET    /quota/user/:userId/usage
  Response: { "api_calls": 5000, "storage_gb": 25, "reset_date": "2024-01-15" }
  Status:   200

POST   /quota/reset/:userId
  Request:  { "resource": "api_calls" }
  Response: { "success": true }
  Status:   200

GET    /quota/limits
  Response: [{ "plan": "starter", "resource": "api_calls", "limit": 1000 }]
  Status:   200
```

### 9.4 Middleware Integration

```
Response Headers:
X-RateLimit-Limit: 1000        # Requests per hour
X-RateLimit-Remaining: 950     # Remaining requests
X-RateLimit-Reset: 1702545600 # Unix timestamp
X-RateLimit-Quota-Limit: 10000 # Monthly quota
X-RateLimit-Quota-Used: 5000   # Used quota
```

### 9.5 Database Tables
- `quota_limits` - Plan limits definition
- `usage_tracking` - Current usage per user
- `rate_limit_logs` - Rate limit hits

### 9.6 Configuration per Plan

```
Starter Plan:
- API Calls: 1,000/day
- Storage: 5 GB
- Concurrent: 5

Pro Plan:
- API Calls: 100,000/day
- Storage: 100 GB
- Concurrent: 50

Enterprise:
- API Calls: Unlimited
- Storage: Custom
- Concurrent: Custom
```

### 9.7 Error Codes
```
RATE_LIMIT_EXCEEDED    - Too many requests
QUOTA_EXCEEDED         - Monthly quota exceeded
INVALID_RESOURCE       - Unknown resource
QUOTA_NOT_FOUND        - User quota not configured
```

---

## 10. SERVICE DEPENDENCIES

### 10.1 Dependency Graph

```
Auth Service (Independent)
  ├─ Keycloak (external)
  └─ PostgreSQL

User Service
  ├─ Auth Service (validate user)
  └─ PostgreSQL

Payment Service
  ├─ Auth Service (validate user)
  ├─ User Service (get user info)
  ├─ Notification Service (receipts)
  ├─ Polar/Midtrans/Xendit/Coinbase (external)
  └─ PostgreSQL

Order Service
  ├─ Auth Service
  ├─ User Service
  ├─ Payment Service (payment verification)
  ├─ Notification Service (order updates)
  └─ PostgreSQL

Subscription Service
  ├─ Auth Service
  ├─ User Service
  ├─ Payment Service (recurring)
  ├─ Notification Service (billing)
  └─ PostgreSQL

Notification Service
  ├─ User Service (recipient info)
  ├─ SendGrid (email)
  ├─ Twilio (SMS)
  ├─ Firebase (push)
  └─ PostgreSQL

Audit Service (Independent)
  └─ PostgreSQL

Quota Service
  ├─ User Service (get plan)
  ├─ Redis (rate limits)
  └─ PostgreSQL
```

### 10.2 Communication Patterns

**Synchronous (HTTP):**
- Service A calls Service B directly
- Requires both services up
- Immediate response needed

**Asynchronous (RabbitMQ) - Future:**
- Service A publishes event
- Service B consumes event
- Decoupled, can handle failures

### 10.3 Handling Service Failures

```
Current (Monolith):
- If Payment fails → Order transaction rolled back
- Retry logic in use cases

Future (Microservices):
- Use circuit breakers
- Implement saga pattern for distributed transactions
- Event-driven reconciliation
```

---

## APPENDIX A: QUICK ENDPOINT REFERENCE

```
Auth:    POST /auth/login, /auth/logout, /auth/refresh
User:    GET /users/:id, PATCH /users/:id/profile
Payment: POST /payments/create, GET /payments/:id
Order:   POST /orders, GET /orders/:id, PATCH /orders/:id
Subscription: GET /subscriptions/plans, POST /subscriptions/create
Notification: POST /notifications/send, GET /notifications/:id
Audit:   POST /audit/log, GET /audit/logs/:userId
Quota:   GET /quota/user/:userId, GET /quota/user/:userId/usage
```

---

## APPENDIX B: ERROR RESPONSE EXAMPLE

```json
{
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment processing failed",
    "details": {
      "provider": "midtrans",
      "providerError": "Card declined",
      "transactionId": "txn-123"
    },
    "statusCode": 400,
    "timestamp": "2024-12-13T10:00:00Z",
    "requestId": "req-abc123"
  }
}
```

---

**Document Version:** 1.0.0  
**Last Updated:** December 13, 2024  
**Maintained By:** Development Team
