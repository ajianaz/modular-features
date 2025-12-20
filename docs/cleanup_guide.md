# Documentation Cleanup Guide

Files that can be deleted and why.

## ✅ Safe to Delete

The following files have been **replaced by new feature-based documentation structure** and can be safely deleted:

### Authentication Documentation (Replaced by `/features/authentication/`)

```bash
# Old files in /docs root
rm docs/AUTHENTICATION_GUIDE.md
rm docs/HYBRID_AUTHENTICATION.md
rm docs/KEYCLOAK_DIRECT_INTEGRATION.md
rm docs/BETTERAUTH_OIDC_PROVIDER.md
rm docs/AUTHENTICATION_TESTING_GUIDE.md
```

**Reason:** These files are consolidated into:
- `docs/features/authentication/readme.md` (Main guide)
- `docs/features/authentication/hybrid-auth/` (Hybrid auth)
- `docs/features/authentication/direct-keycloak/` (Direct Keycloak)
- `docs/features/authentication/oidc-provider/` (OIDC provider)

---

## ⚠️ Review Before Deleting

These files might contain unique information. Review before deleting:

### Project Planning Documents

```bash
# Review these before deleting
docs/project_prd.md
docs/implementation_checklist.md
docs/boilerplate_multi_product.md
```

**Action:** 
1. Check if content is in `/docs/planning/`
2. If yes, safe to delete
3. If no, move to `/docs/planning/`

### Email Provider Documents

```bash
# These might be in /docs/planning/
docs/email-provider-hierarchy-implementation-plan.md
docs/tencent-ses-analysis.md
```

**Action:**
1. Already consolidated in `/docs/features/notifications/email-provider/`
2. Safe to delete if content is duplicated

---

## 📝 Keep These Files

### General Guides (Keep)

```bash
docs/readme.md                          # Main project README
docs/architecture_guide.md              # Architecture overview
docs/development_guide.md               # Development setup
docs/project_structure.md               # Project structure
docs/services_overview.md               # Services overview
docs/documentation_index.md             # Documentation index
```

### Team Documentation (Keep)

```bash
docs/AGENTS.md                          # Agent documentation
docs/team_coordination.md               # Team coordination
docs/TIMELINE.md                        # Project timeline
docs/KPIs.md                            # KPIs
docs/FINAL_summary.md                   # Final summary
```

### Reference Documents (Keep)

```bash
docs/clone_template_quick_start.md      # Template quick start
```

---

## 🔄 Cleanup Commands

### Step 1: Backup (Optional)

```bash
# Create backup folder
mkdir -p docs-backup

# Copy old files to backup
cp docs/AUTHENTICATION_GUIDE.md docs-backup/
cp docs/HYBRID_AUTHENTICATION.md docs-backup/
cp docs/KEYCLOAK_DIRECT_INTEGRATION.md docs-backup/
cp docs/BETTERAUTH_OIDC_PROVIDER.md docs-backup/
```

### Step 2: Delete Old Files

```bash
# Delete old authentication docs
cd docs
rm AUTHENTICATION_GUIDE.md
rm HYBRID_AUTHENTICATION.md
rm KEYCLOAK_DIRECT_INTEGRATION.md
rm BETTERAUTH_OIDC_PROVIDER.md
rm AUTHENTICATION_TESTING_GUIDE.md

# Delete or move planning docs (review first)
rm email-provider-hierarchy-implementation-plan.md
rm tencent-ses-analysis.md
```

### Step 3: Verify Structure

```bash
# Check new structure
tree docs/ -L 2

# Expected output:
# docs/
# ├── features/
# │   ├── authentication/
# │   ├── notifications/
# │   ├── users/
# │   └── readme.md
# ├── planning/
# │   └── readme.md
# ├── development/
# │   └── readme.md
# ├── guides/
# ├── documentation_guidelines.md
# └── readme.md
```

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] All old authentication docs deleted
- [ ] New feature docs exist and are complete
- [ ] All links in new docs work
- [ ] Documentation index (`docs/readme.md`) updated
- [ ] No broken references

---

## 📊 Before vs After

### Before (Old Structure)

```
docs/
├── AUTHENTICATION_GUIDE.md           (40 KB)
├── HYBRID_AUTHENTICATION.md          (20 KB)
├── KEYCLOAK_DIRECT_INTEGRATION.md    (18 KB)
├── BETTERAUTH_OIDC_PROVIDER.md       (24 KB)
└── ... (mixed files)
```

### After (New Structure)

```
docs/
├── features/
│   ├── authentication/
│   │   ├── readme.md
│   │   ├── hybrid-auth/
│   │   │   ├── overview.md
│   │   │   ├── cookie-auth.md
│   │   │   ├── jwt-auth.md
│   │   │   └── middleware.md
│   │   ├── direct-keycloak/
│   │   │   └── overview.md
│   │   └── oidc-provider/
│   │       └── overview.md
│   ├── notifications/
│   │   ├── readme.md
│   │   └── email-provider/
│   │       └── readme.md
│   └── users/
│       ├── readme.md
│       └── profiles/
│           └── readme.md
├── planning/
│   └── readme.md
├── development/
│   └── readme.md
├── guides/
├── documentation_guidelines.md
└── readme.md
```

---

**Ready to clean up?** Follow the commands above! 🧹

**Last Updated:** 2025-01-20
