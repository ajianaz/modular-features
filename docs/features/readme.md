# Features Documentation

Complete documentation for all features in the Modular Monolith project.

## 📋 Available Features

- **[Authentication](./authentication/)** - Hybrid authentication system (Cookie + JWT)
- **[Notifications](./notifications/)** - Multi-provider notification system
- **[Users](./users/)** - User management and profiles

---

## 🚀 Quick Navigation

### Looking for something specific?

**Authentication / Login:**
→ [Authentication Feature](./authentication/)

**Send Emails / SMS:**
→ [Notifications Feature](./notifications/)

**User Management:**
→ [Users Feature](./users/)

---

## 📖 Feature Documentation Structure

Each feature follows this structure:

```
features/<feature-name>/
├── readme.md                    # Feature overview and navigation
├── overview.md                  # Architecture and concepts
├── implementation.md            # Technical implementation
├── api.md                       # API reference
├── examples.md                  # Usage examples
└── <sub-feature>/              # Sub-features
    ├── readme.md
    ├── overview.md
    └── examples.md
```

---

## 🎯 Adding New Feature Documentation

When creating documentation for a new feature:

### 1. Create Feature Folder

```bash
mkdir -p docs/features/<feature-name>
```

### 2. Create readme.md

Use this template:

```markdown
# <Feature Name> Feature

Brief description of the feature.

## Overview
<Explain what the feature does>

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Quick Start
<Basic usage example>

## Documentation
- [Overview](./overview.md)
- [Implementation](./implementation.md)
- [API](./api.md)
- [Examples](./examples.md)

## Related Documentation
- [Related Feature](../related-feature/)
- [Planning](../../planning/)
```

### 3. Create Documentation Files

Create files as needed:
- `overview.md` - Architecture and design
- `implementation.md` - Technical details
- `api.md` - API reference
- `examples.md` - Usage examples

### 4. Add Sub-Features

If feature has sub-features:

```bash
mkdir -p docs/features/<feature-name>/<sub-feature>
cd docs/features/<feature-name>/<sub-feature>
# Create readme.md and other files
```

### 5. Update This README

Add your feature to the list above.

---

## 📚 Documentation Guidelines

For detailed guidelines on creating documentation:

→ [Documentation Guidelines](../documentation_guidelines.md)

**Key Points:**
- Use feature-based structure
- Include readme.md in each folder
- Add diagrams for complex features
- Provide code examples
- Keep documentation up-to-date

---

## 🔍 Search Documentation

### By Feature Type

- **Authentication** → [Authentication](./authentication/)
- **Notifications** → [Notifications](./notifications/)
- **User Management** → [Users](./users/)

### By Documentation Type

- **Overview** → Check `<feature>/overview.md`
- **API** → Check `<feature>/api.md`
- **Examples** → Check `<feature>/examples.md`
- **Implementation** → Check `<feature>/implementation.md`

---

## 📝 Contributing

When adding or updating feature documentation:

1. **Follow Structure** - Use established folder structure
2. **Use Templates** - Follow templates in guidelines
3. **Include Examples** - Provide practical examples
4. **Add Diagrams** - Use Mermaid for architecture diagrams
5. **Review** - Self-review before submitting

---

## 🤝 Need Help?

### Documentation Issues

- Found error in documentation?
- Missing information?
- Unclear explanation?

**→** Open an issue or PR to fix it

### Feature Questions

- How to use a feature?
- Implementation questions?
- Best practices?

**→** Check feature documentation or ask in team chat

---

## 📊 Documentation Status

| Feature | Documentation | Status |
|---------|---------------|--------|
| Authentication | ✅ Complete | Up-to-date |
| Notifications | 🚧 In Progress | Partial |
| Users | 🚧 In Progress | Partial |

---

**Last Updated:** 2025-01-20
