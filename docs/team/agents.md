# AGENTS.md - AI Assistance for Modular Monolith Project

## Available AI Agents & Their Expertise

### 1. 🏗️ Backend Architect Agent
**Expertise:** System design, API architecture, database design, clean architecture patterns
**When to Use:**
- Designing new services or features
- Making architectural decisions
- Optimizing database schemas
- Planning service boundaries

**Example Commands:**
```bash
/backend:architect design auth-service
/backend:architect optimize database schema
/backend:architect plan microservice extraction
```

### 2. 🔒 Security Engineer Agent
**Expertise:** Authentication, authorization, data protection, OWASP compliance, threat modeling
**When to Use:**
- Implementing security features
- Security reviews and assessments
- Compliance requirements (SOC2, PCI-DSS)
- Incident response planning

**Example Commands:**
```bash
/security:implement oauth2-flow
/security:review authentication-system
/security:harden api-endpoints
/security:plan compliance-gdpr
```

### 3. 🚀 DevOps Engineer Agent
**Expertise:** CI/CD pipelines, infrastructure as code, containerization, monitoring
**When to Use:**
- Setting up build and deployment pipelines
- Infrastructure provisioning
- Monitoring and observability
- Scaling and reliability

**Example Commands:**
```bash
/devops:setup ci-cd-pipeline
/devops:implement docker-containers
/devops:setup monitoring-stack
/devops:plan disaster-recovery
```

### 4. 🧪 Testing Specialist Agent
**Expertise:** Unit testing, integration testing, E2E testing, performance testing
**When to Use:**
- Writing test strategies
- Optimizing test coverage
- Performance benchmarking
- Quality assurance processes

**Example Commands:**
```bash
/testing:create test-strategy
/testing:optimize coverage
/testing:performance-benchmark
/testing:setup e2e-testing
```

### 5. 📊 Data Analyst Agent
**Expertise:** Database optimization, query analysis, data modeling, analytics
**When to Use:**
- Database performance issues
- Query optimization
- Data modeling decisions
- Analytics implementation

**Example Commands:**
```bash
/data:optimize database-queries
/data:analyze performance-bottlenecks
/data:design data-model
/data:implement analytics-tracking
```

### 6. 🔧 Frontend Integration Agent
**Expertise:** API integration, SDK development, frontend-backend communication
**When to Use:**
- Creating client SDKs
- Frontend integration issues
- API documentation for frontend
- Real-time features

**Example Commands:**
```bash
/frontend:create client-sdk
/frontend:optimize api-calls
/frontend:implement websocket-client
/frontend:create api-documentation
```

### 7. 📝 Documentation Agent
**Expertise:** Technical writing, API documentation, user guides, developer experience
**When to Use:**
- Creating documentation
- Improving developer experience
- Writing guides and tutorials
- API reference documentation

**Example Commands:**
```bash
/docs:create api-documentation
/docs:write developer-guide
/docs:create deployment-guide
/docs:improve developer-experience
```

## Service-Specific AI Assistants

### Auth Service Assistant
```bash
/auth:help                    # Show auth-specific commands
/auth:setup oauth2           # Setup OAuth2 with Keycloak
/auth:implement jwt-tokens    # Implement JWT token system
/auth:configure sessions     # Configure session management
/auth:test authentication     # Test auth flows
```

### Payment Service Assistant
```bash
/payments:help               # Show payment commands
/payments:setup polar        # Configure Polar integration
/payments:setup midtrans      # Configure Midtrans integration
/payments:implement webhooks  # Setup webhook handlers
/payments:test transactions  # Test payment flows
```

### Notification Service Assistant
```bash
/notifications:help          # Show notification commands
/notifications:setup email    # Configure email service
/notifications:setup sms       # Configure SMS service
/notifications:create template  # Create notification templates
/notifications:test delivery    # Test notification delivery
```

## Usage Guidelines

### 1. Context Provisioning
Always provide context when using agents:
```
CONTEXT:
•  Service: auth-service
•  Current Issue: JWT token validation failing
•  Stack: Bun, Hono, Drizzle ORM
•  Error Details: [error logs]

ASSISTANCE NEEDED:
/security:review jwt-implementation
```

### 2. Progressive Assistance
Use agents for progressive problem-solving:
```
STEP 1: /backend:architect analyze problem
STEP 2: /security:identify vulnerabilities
STEP 3: /testing:create regression-tests
STEP 4: /devops:implement monitoring
```

### 3. Knowledge Base Integration
Agents learn from project context:
- Code patterns and conventions
- Architecture decisions made
- Testing strategies implemented
- Deployment configurations used

## Agent Workflows

### Feature Development Workflow
1. `/backend:architect design new-feature`
2. `/data:model database-changes`
3. `/security:review implementation`
4. `/testing:create test-plan`
5. `/docs:update documentation`
6. `/devops:setup deployment`

### Bug Fix Workflow
1. `/data:analyze performance-impact`
2. `/backend:architect identify root-cause`
3. `/testing:create reproduction-test`
4. `/security:assess security-impact`
5. `/devops:implement monitoring`

### Service Maintenance Workflow
1. `/data:optimize database-queries`
2. `/security:conduct security-audit`
3. `/testing:performance-benchmark`
4. `/devops:upgrade infrastructure`
5. `/docs:update runbooks`

## Agent Capabilities

### Code Generation
- Generate service boilerplates
- Create test suites
- Implement design patterns
- Setup infrastructure code

### Analysis & Review
- Code quality assessment
- Security vulnerability analysis
- Performance bottleneck identification
- Architecture decision analysis

### Problem Solving
- Debug complex issues
- Optimize slow queries
- Resolve integration problems
- Plan scaling strategies

### Documentation & Guidance
- Generate comprehensive docs
- Create step-by-step guides
- Provide best practices
- Offer architectural advice

## Getting Started

### Initial Setup
1. Clone repository
2. Run `bun install`
3. Copy `.env.example` to `.env.local`
4. Start development: `bun run dev`
5. Use AI agents: `ai:help`

### Daily Development
**Morning:**
- Review yesterday's issues
- Plan today's tasks
- Use appropriate agents for blockers

**During Development:**
- Use agents for code reviews
- Get help with complex problems
- Generate boilerplate code

**End of Day:**
- Commit changes with AI assistance
- Update documentation
- Plan tomorrow's work

## Agent Training & Customization

### Project-Specific Training
Agents can be trained on:
- Your coding standards and conventions
- Your architectural patterns
- Your testing strategies
- Your deployment processes

### Custom Agent Creation
Create specialized agents for:
- Your specific business domain
- Your tech stack combinations
- Your compliance requirements
- Your operational procedures
