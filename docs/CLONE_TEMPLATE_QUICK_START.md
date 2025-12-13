# QUICK START: CLONE TEMPLATE UNTUK PRODUCT BARU

**Durasi:** 30 menit  
**Kesulitan:** Easy ⭐

---

## 📋 OVERVIEW

Document ini memberikan step-by-step guide untuk clone template boilerplate dan membuat product baru dalam 30 menit.

---

## 🚀 STEP-BY-STEP: DARI TEMPLATE KE PRODUCT

### STEP 1: Preparation (5 menit)

#### 1.1 Tentukan Product Details
```
Product Name:        [Apa nama produk Anda?]
Product Slug:        [URL-safe, lowercase, no spaces]
Database Name:       [product_slug]_db
Port:                [3001, 3002, 3003, dst]
Domain:              [product.yourcompany.com]

Example:
├─ Project Management App
│  ├─ Slug: project-management
│  ├─ Database: project_management_db
│  ├─ Port: 3001
│  └─ Domain: projects.yourcompany.com
│
├─ Invoicing App
│  ├─ Slug: invoicing
│  ├─ Database: invoicing_db
│  ├─ Port: 3002
│  └─ Domain: invoicing.yourcompany.com
│
└─ E-Commerce Platform
   ├─ Slug: ecommerce
   ├─ Database: ecommerce_db
   ├─ Port: 3003
   └─ Domain: shop.yourcompany.com
```

#### 1.2 List Services Needed
```
Core Services (ALWAYS):
✅ auth
✅ users
✅ notifications
✅ audit

Optional Services (check if needed):
[ ] payments      → Do you need payment processing?
[ ] orders        → Do you need order management?
[ ] subscriptions → Do you need recurring billing?
[ ] quota         → Do you need rate limiting?

Example:
Project Management:   payments, notifications, audit
Invoicing:            payments, subscriptions, notifications, audit
E-Commerce:           payments, orders, subscriptions, notifications, audit
```

---

### STEP 2: Clone Template (10 menit)

#### 2.1 Clone Repository
```bash
# Clone boilerplate template
git clone https://github.com/yourname/saas-boilerplate.git
cd saas-boilerplate

# OR if you already have it
cd projects/
```

#### 2.2 Create Product Folder
```bash
# Create new product folder
mkdir -p products/project-management
cd products/project-management

# Copy entire boilerplate
cp -r ../../api/* .

# Or in monorepo setup
cp -r ../boilerplate-api/* .
```

#### 2.3 Initialize as New Project
```bash
# Install dependencies
bun install

# Create git branch for this product
git checkout -b product/project-management

# Or if separate repo
git init
git remote add origin https://github.com/yourname/project-management-app.git
git add .
git commit -m "Initial commit: Clone from template v1.0.0"
```

---

### STEP 3: Clean Up Unnecessary Services (5 menit)

#### 3.1 Delete Unneeded Features
```bash
cd src/features

# Example: Project Management doesn't need orders & subscriptions
rm -rf orders/
rm -rf subscriptions/

# Invoicing doesn't need subscriptions
rm -rf subscriptions/

# Keep everything for E-commerce
```

#### 3.2 Update Feature Index
```bash
# Edit src/features/index.ts

# BEFORE
export * from './auth';
export * from './users';
export * from './payments';
export * from './orders';      ← DELETE THIS
export * from './subscriptions'; ← DELETE THIS
export * from './notifications';
export * from './audit';
export * from './quota';

# AFTER
export * from './auth';
export * from './users';
export * from './payments';
export * from './notifications';
export * from './audit';
export * from './quota';
```

#### 3.3 Update Routes Setup
```bash
# Edit src/app.ts or src/routes/index.ts

# BEFORE
import { ordersRouter } from './features/orders';     ← DELETE
import { subscriptionsRouter } from './features/subscriptions'; ← DELETE

app.route('/orders', ordersRouter);           ← DELETE
app.route('/subscriptions', subscriptionsRouter); ← DELETE

# AFTER
// Only include needed routes
app.route('/auth', authRouter);
app.route('/users', usersRouter);
app.route('/payments', paymentsRouter);
app.route('/notifications', notificationsRouter);
app.route('/audit', auditRouter);
```

---

### STEP 4: Update Configuration (5 menit)

#### 4.1 Copy & Update Environment File
```bash
# Copy template environment
cp .env.example .env.local

# Edit .env.local
```

#### 4.2 Environment Variables to Update

```env
# Project Identity
PRODUCT_NAME=Project Management          ← Change name
PRODUCT_SLUG=project-management          ← Change slug
PORT=3001                                 ← Change port

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/project_management_db
# ↑ IMPORTANT: Use product-specific database name!

# Auth
KEYCLOAK_REALM=project-management        ← Change realm (if needed)
JWT_SECRET=<unique-per-product>          ← Generate new secret!

# Third-party Services
STRIPE_KEY=<product-specific-key>        ← If using payments
SENDGRID_API_KEY=<key>
TWILIO_AUTH_TOKEN=<key>

# Feature Flags
FEATURE_ORDERS=false         ← Disable unused features
FEATURE_SUBSCRIPTIONS=false
FEATURE_PAYMENTS=true
FEATURE_AUDIT=true
```

#### 4.3 Generate New JWT Secret
```bash
# Generate random JWT secret for this product
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and paste into .env.local
JWT_SECRET=<paste-here>
```

#### 4.4 Update Package Name
```bash
# Edit package.json
{
  "name": "@saas/project-management-api",  ← Change name
  "version": "1.0.0",
  "description": "Project Management SaaS API",
  "scripts": {
    "dev": "hono dev",  ← Should work as-is
    "build": "tsc",
    "start": "hono start"
  }
}
```

---

### STEP 5: Database Setup (5 menit)

#### 5.1 Create Product Database
```bash
# Option A: Using PostgreSQL CLI
psql -U postgres -c "CREATE DATABASE project_management_db;"

# Option B: Using Docker
docker exec postgres_container psql -U postgres -c "CREATE DATABASE project_management_db;"

# Option C: Update docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: project_management_db    ← Change DB name per product
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
```

#### 5.2 Run Migrations
```bash
# From project root
cd ../../packages/database/

# Run migrations for this product
DATABASE_URL=postgresql://user:pass@localhost:5432/project_management_db \
  bun run migrate

# Check if tables created
psql project_management_db -c "\dt"
```

#### 5.3 Seed Database (Optional)
```bash
# If you have seeders
DATABASE_URL=postgresql://user:pass@localhost:5432/project_management_db \
  bun run seed

# Verify
psql project_management_db -c "SELECT COUNT(*) FROM users;"
```

---

### STEP 6: Add Product-Specific Services (5 menit)

#### 6.1 Create Custom Feature Folder
```bash
# Example: Add "projects" feature for Project Management app
cd src/features/
mkdir -p projects/{domain,application,infrastructure,presentation}

# Structure
projects/
├── domain/
│   ├── entities/
│   │   └── Project.ts
│   └── errors/
│       └── ProjectErrors.ts
├── application/
│   └── usecases/
│       └── CreateProjectUseCase.ts
├── infrastructure/
│   └── repositories/
│       └── ProjectRepository.ts
├── presentation/
│   ├── controllers/
│   │   └── ProjectController.ts
│   └── routes.ts
└── index.ts
```

#### 6.2 Basic Feature Template

```typescript
// src/features/projects/domain/entities/Project.ts
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/features/projects/application/usecases/CreateProjectUseCase.ts
import { Project } from '@/features/projects/domain/entities/Project';
import { ProjectRepository } from '@/features/projects/infrastructure/repositories/ProjectRepository';

export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(userId: string, data: { name: string; description: string }): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.projectRepository.create(project);
  }
}

// src/features/projects/index.ts
export * from './domain/entities/Project';
export * from './application/usecases/CreateProjectUseCase';
```

#### 6.3 Register Feature in Dependency Injection
```typescript
// src/container.ts (or similar DI file)
import { ProjectRepository } from './features/projects/infrastructure/repositories/ProjectRepository';
import { CreateProjectUseCase } from './features/projects/application/usecases/CreateProjectUseCase';

// Register repositories
container.register('projectRepository', {
  useClass: ProjectRepository,
});

// Register use cases
container.register('createProjectUseCase', {
  useFactory: (container) => new CreateProjectUseCase(
    container.get('projectRepository')
  ),
});
```

#### 6.4 Create Routes
```typescript
// src/features/projects/presentation/routes.ts
import { Hono } from 'hono';
import { ProjectController } from './controllers/ProjectController';

export function createProjectRoutes(app: Hono) {
  const controller = new ProjectController();

  app.post('/projects', (c) => controller.create(c));
  app.get('/projects', (c) => controller.list(c));
  app.get('/projects/:id', (c) => controller.get(c));
  app.put('/projects/:id', (c) => controller.update(c));
  app.delete('/projects/:id', (c) => controller.delete(c));
}
```

---

### STEP 7: Testing (5 menit)

#### 7.1 Start Development Server
```bash
# From product directory
bun run dev

# Should output
# ✓ Hono app running on http://localhost:3001
```

#### 7.2 Test Core Services
```bash
# Test Auth
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test Users
curl -X GET http://localhost:3001/users/me \
  -H "Authorization: Bearer <token>"

# Test Notifications
curl -X GET http://localhost:3001/notifications

# Test Audit
curl -X GET http://localhost:3001/audit/logs
```

#### 7.3 Verify Database
```bash
# Check connected database
psql project_management_db -c "\dt"

# Should show:
#          List of relations
# Schema |      Name       | Type  | Owner
# --------+-----------------+-------+----------
#  public | users           | table | postgres
#  public | sessions        | table | postgres
#  public | audit_logs      | table | postgres
#  public | ... | table | postgres
```

---

### STEP 8: Version Control (2 menit)

#### 8.1 Commit Changes
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Create project-management product from template v1.0.0

- Cloned from boilerplate template
- Removed orders and subscriptions features
- Added projects custom feature
- Configured for product-specific database
- Updated environment and package configuration"

# Or for separate repo
git push -u origin main
```

#### 8.2 Document Product
```bash
# Create README for this product
cat > README.md << 'EOF'
# Project Management App

A modular SaaS application for managing projects and tasks.

## Setup
1. Install dependencies: `bun install`
2. Setup database: `bun run migrate`
3. Start: `bun run dev`

## Features
- User authentication & management
- Project creation and tracking
- Task management
- Real-time notifications
- Audit logging

## Architecture
- Modular monolith with feature-based clean architecture
- Separate database per product
- Built from SaaS boilerplate v1.0.0

See docs/ for detailed documentation.
EOF

git add README.md
git commit -m "docs: Add product-specific README"
```

---

### STEP 9: Deployment Preparation (2 menit)

#### 9.1 Create Dockerfile
```dockerfile
# Dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install --production

EXPOSE 3001

CMD ["bun", "run", "start"]
```

#### 9.2 Update Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  project-management-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/project_management_db
      PRODUCT_NAME: Project Management
      NODE_ENV: production
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: project_management_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
```

#### 9.3 CI/CD Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Project Management

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run build
      - name: Deploy to production
        run: |
          # Your deployment script here
          docker build -t project-management:latest .
          docker push yourregistry/project-management:latest
```

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Product folder created
- [ ] Dependencies installed (`bun install` ran successfully)
- [ ] .env.local updated with product-specific config
- [ ] Database created (product_management_db)
- [ ] Migrations ran successfully
- [ ] Development server starts (`bun run dev`)
- [ ] API endpoints respond (tested with curl)
- [ ] Custom features added (projects feature example)
- [ ] Git branch created and committed
- [ ] README.md created
- [ ] Dockerfile ready
- [ ] docker-compose.yml updated
- [ ] CI/CD workflow ready

---

## 🚀 READY FOR NEXT PRODUCT?

Repeat this process for each new product:
```
Product 1: 30 minutes (first time learning)
Product 2: 20 minutes (faster second time)
Product 3: 15 minutes (you know the pattern)
```

**Cumulative time for 3 products: ~60 minutes!**

---

## 📚 REFERENCE

See full documentation:
- **BOILERPLATE_MULTI_PRODUCT.md** - Strategy & architecture
- **PROJECT_STRUCTURE.md** - Folder organization
- **IMPLEMENTATION_CHECKLIST.md** - Development standards
- **SERVICES_OVERVIEW.md** - API reference

---

## ❓ COMMON ISSUES & FIXES

### Issue: Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change PORT in .env.local
PORT=3002
```

### Issue: Database Connection Failed
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check DATABASE_URL format
# postgresql://username:password@localhost:5432/database_name

# Test connection
psql postgresql://user:pass@localhost:5432/project_management_db
```

### Issue: Migrations Failed
```bash
# Run with verbose output
DATABASE_URL=... bun run migrate --verbose

# Check migration files exist
ls packages/database/src/migrations/

# Roll back and retry
DATABASE_URL=... bun run migrate:down
DATABASE_URL=... bun run migrate:up
```

### Issue: JWT Secret Invalid
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=<new-secret>

# Restart dev server
```

---

**Time to complete: 30 minutes** ⏱️  
**Result: Production-ready SaaS product** 🚀

