# Planning Documentation

Planning documents, architecture designs, and implementation plans.

## 📋 Document Types

### PRD (Product Requirements Document)

**Purpose:** Define product requirements and success criteria.

**Files:**
- `PRD_<feature-name>.md` - Product requirements
- `project_prd.md` - Overall project PRD

**When to Use:**
- Starting new feature
- Major feature changes
- Product improvements

---

### Architecture Design

**Purpose:** Design technical architecture and system design.

**Files:**
- `architecture_<feature-name>.md` - Feature architecture

**When to Use:**
- Designing new system
- Major refactoring
- Integration planning

---

### Implementation Plan

**Purpose:** Plan implementation phases and tasks.

**Files:**
- `implementation_<feature-name>.md` - Implementation plan
- `implementation_checklist.md` - Project checklist
- `email-provider-hierarchy-implementation-plan.md` - Email provider plan

**When to Use:**
- Before starting implementation
- Complex features with multiple phases
- Team coordination

---

### Analysis & Research

**Purpose:** Technical analysis and research.

**Files:**
- `<feature>-analysis.md` - Feature analysis
- `tencent-ses-analysis.md` - SES provider analysis

**When to Use:**
- Evaluating technologies
- Provider comparison
- Proof of concept results

---

### Project Summary

**Purpose:** Project completion summary and lessons learned.

**Files:**
- `FINAL_summary.md` - Project completion summary
- `boilerplate_multi_product.md` - Multi-product template

**When to Use:**
- Project completion
- Phase completion
- Retrospective

---

## 📁 Current Planning Documents

### Product Requirements
- `project_prd.md` - Overall project requirements
- `boilerplate_multi_product.md` - Multi-product boilerplate requirements

### Implementation Plans
- `implementation_checklist.md` - Project implementation checklist
- `email-provider-hierarchy-implementation-plan.md` - Email provider implementation

### Analysis
- `tencent-ses-analysis.md` - Tencent SES provider analysis

### Summaries
- `FINAL_summary.md` - Project final summary

---

## 🎯 Creating New Planning Document

### Step 1: Choose Document Type

- **PRD** - If defining product requirements
- **Architecture** - If designing technical solution
- **Implementation Plan** - If planning implementation steps
- **Analysis** - If doing technical research

### Step 2: Use Template

See `/docs/documentation_guidelines.md` for templates.

### Step 3: Name File

Follow naming convention:
- PRD: `PRD_<feature-name>.md`
- Architecture: `architecture_<feature-name>.md`
- Implementation: `implementation_<feature-name>.md`
- Analysis: `<feature>-analysis.md`

### Step 4: Add to Index

Update this README with your new document.

---

## 📖 Guidelines

- **Be Specific** - Include clear requirements and success criteria
- **Include Diagrams** - Use Mermaid for architecture diagrams
- **Define Timeline** - Include phases and milestones
- **Identify Risks** - List potential risks and mitigations
- **Reference Related Docs** - Link to related planning docs

---

## 🔗 Related Documentation

- [Documentation Guidelines](../documentation_guidelines.md)
- [Development Guide](../development/)
- [Feature Documentation](../features/)

---

**Last Updated:** 2025-01-20
