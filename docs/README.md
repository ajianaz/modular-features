# Modular Monolith Documentation

Complete documentation for the Modular Monolith project.

## 🚀 Quick Start

### New to the Project?

1. **[Project Overview](./summary.md)** - Start here
2. **[Architecture Guide](./guides/architecture_guide.md)** - Understand system architecture
3. **[Development Guide](./guides/development_guide.md)** - Setup development environment

### Looking for Feature Documentation?

→ **[Features](./features/)** - All feature documentation

### Planning a Feature?

→ **[Planning](./planning/)** - Planning documents and templates

---

## 📁 Documentation Structure

```
docs/
├── features/              # Feature documentation
│   ├── authentication/   # Authentication system
│   ├── notifications/    # Notification system
│   └── users/            # User management
│
├── planning/             # Planning & design docs
│   ├── PRD_*.md          # Product requirements
│   ├── architecture_*.md # Architecture designs
│   └── implementation_*.md # Implementation plans
│
├── development/          # Development guides
│   ├── TESTING_GUIDE.md  # Testing procedures
│   ├── DEPLOYMENT_GUIDE.md # Deployment process
│   └── TROUBLESHOOTING.md # Common issues
│
├── guides/               # General guides
│   ├── architecture_guide.md
│   ├── development_guide.md
│   ├── project_structure.md
│   └── services_overview.md
│
├── team/                 # Team documentation
│   ├── team_coordination.md
│   ├── TIMELINE.md
│   └── KPIs.md
│
├── documentation_guidelines.md # How to write docs
├── cleanup_guide.md      # File cleanup guide
├── summary.md            # Documentation summary
└── readme.md             # This file
```

---

## 📚 Documentation by Category

### Features

Complete documentation for each feature:

- **[Authentication](./features/authentication/)** - Hybrid auth (Cookie + JWT), Direct Keycloak, OIDC Provider
- **[Notifications](./features/notifications/)** - Email, SMS, Push notifications
- **[Users](./features/users/)** - User management, profiles, preferences

**→** [Browse Features](./features/)

---

### Planning

Design and planning documents:

- Product Requirements (PRD)
- Architecture designs
- Implementation plans
- Technical analysis

**→** [Browse Planning](./planning/)

---

### Development

Development, testing, and deployment guides:

- Development setup
- Testing procedures
- Deployment process
- Troubleshooting

**→** [Browse Development](./development/)

---

### Guides

High-level project guides:

- System architecture
- Project structure
- Services overview
- Development workflow

**→** [Browse Guides](./guides/)

---

### Team

Team coordination and processes:

- Team coordination
- Project timeline
- KPIs and metrics

**→** [Browse Team](./team/)

---

## 🎯 Common Tasks

### Add Feature Documentation

```bash
# 1. Create feature folder
mkdir -p docs/features/<feature-name>

# 2. Add README
# See features/authentication/readme.md for template

# 3. Add documentation files
touch docs/features/<feature-name>/overview.md
touch docs/features/<feature-name>/examples.md

# 4. Update features/readme.md
```

**→** [Documentation Guidelines](./documentation_guidelines.md)

### Add Planning Document

```bash
# 1. Choose document type
# - PRD_<feature>.md
# - architecture_<feature>.md
# - implementation_<feature>.md

# 2. Create file
touch docs/planning/<type>_<feature>.md

# 3. Use template from guidelines
```

**→** [Documentation Guidelines](./documentation_guidelines.md)

### Add Development Guide

```bash
# Create guide in development/
touch docs/development/<GUIDE_NAME>.md
```

---

## 🔍 Search Documentation

### By Type

- **Features** → [features/](./features/)
- **Planning** → [planning/](./planning/)
- **Development** → [development/](./development/)
- **Guides** → [guides/](./guides/)
- **Team** → [team/](./team/)

### By Feature

- **Authentication** → [features/authentication/](./features/authentication/)
- **Notifications** → [features/notifications/](./features/notifications/)
- **Users** → [features/users/](./features/users/)

### By Purpose

- **Learning** → [guides/](./guides/) or [features/](./features/)
- **Planning** → [planning/](./planning/)
- **Developing** → [development/](./development/)
- **Team Processes** → [team/](./team/)

---

## 📝 Contributing

When adding or updating documentation:

1. **Follow Structure** - Use established folder structure
2. **Use Templates** - Follow templates in guidelines
3. **Include Examples** - Provide practical examples
4. **Add Diagrams** - Use Mermaid for architecture diagrams
5. **Review** - Self-review before submitting

**→** [Documentation Guidelines](./documentation_guidelines.md)

---

## 🤝 Getting Help

### Documentation Issues

Found error or missing information?

**→** Open issue or PR

### Questions

- Check documentation first
- Ask in team chat
- Create issue with question

---

## 📊 Documentation Status

| Category | Status | Last Updated |
|----------|--------|--------------|
| Features | ✅ Organized | 2025-01-20 |
| Planning | ✅ Organized | 2025-01-20 |
| Development | ✅ Organized | 2025-01-20 |
| Guides | ✅ Organized | 2025-01-20 |
| Team | ✅ Organized | 2025-01-20 |

---

## 📞 Quick Links

- **[Summary](./summary.md)** - Documentation summary
- **[Guidelines](./documentation_guidelines.md)** - Writing guidelines
- **[Cleanup Guide](./cleanup_guide.md)** - Cleanup reference

---

**Last Updated:** 2025-01-20

**Version:** 2.0.0 (Restructured)
