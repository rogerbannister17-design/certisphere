# Certisphere Governance

This folder is the governance entry point for Certisphere. It maps the permanent governance domains that control product direction, engineering standards, commercial positioning, brand usage, security expectations, AI controls, release management, and architecture decisions.

Governance documents are authoritative for future planning and implementation. They do not replace the source documents they reference; they provide a single index so contributors can find the correct governing standard before making product, engineering, commercial, or brand decisions.

## Governance Domains

| Domain | Purpose | Primary Sources |
| --- | --- | --- |
| Product Governance | Defines product vision, principles, roadmap, backlog, product decisions, and domain model. | [Product Vision](../product/PRODUCT_VISION.md), [Product Principles](../product/PRODUCT_PRINCIPLES.md), [Product Decision Records](../product/pdr/README.md), [Product Roadmap](../product/PRODUCT_ROADMAP.md), [Backlog](../product/BACKLOG.md), [Domain Model](../product/DOMAIN_MODEL.md) |
| Engineering Governance | Defines delivery standards, release gates, API standards, API security, environment checks, and engineering quality expectations. | [Engineering Standards](../docs/standards/engineering.md), [API Design Standards](../product/API_DESIGN_STANDARDS.md), [API Security Standard](../product/API_SECURITY_STANDARD.md), [Release Policy](../product/RELEASE_POLICY.md), [Project Status](../PROJECT_STATUS.md) |
| Commercial Governance | Defines market positioning, customer value, target audiences, commercial claims, and sales-facing consistency. | [Product Vision](../product/PRODUCT_VISION.md), [Brand Strategy](../docs/brand/BRAND_STRATEGY.md), [Brand Voice](../docs/brand/BRAND_VOICE.md), [Brand Review Checklist](../docs/brand/BRAND_REVIEW_CHECKLIST.md) |
| Brand Governance | Defines brand strategy, visual identity, logo usage, design tokens, UI design system, prompt governance, asset handling, and brand review. | [Brand Governance](../docs/brand/BRAND_GOVERNANCE.md), [Brand Portal](../docs/brand/BRAND_PORTAL.md), [Brand Guidelines](../docs/brand/BRAND_GUIDELINES.md), [Design Tokens](../docs/brand/DESIGN_TOKENS.md), [UI Design System](../docs/brand/UI_DESIGN_SYSTEM.md) |
| Security Governance | Defines security, authentication, authorisation, audit, tenancy, and platform protection expectations. | [Security Milestone Documentation](../docs/security/milestone-1.1.md), [Product Principles](../product/PRODUCT_PRINCIPLES.md), [API Design Standards](../product/API_DESIGN_STANDARDS.md), [API Security Standard](../product/API_SECURITY_STANDARD.md) |
| AI Governance | Defines AI as suggestion-only, requires human review, and prevents direct modification of controlled information. | [AI Controlled Information Lifecycle](../docs/architecture/ai-controlled-information-lifecycle.md), [AI Prompt Library](../docs/brand/AI_PROMPT_LIBRARY.md), [Product Principles](../product/PRODUCT_PRINCIPLES.md) |
| Release Governance | Defines versioning, branches, commit messages, release gates, tags, hotfixes, rollback, and Definition of Done. | [Release Policy](../product/RELEASE_POLICY.md), [Project Status](../PROJECT_STATUS.md), [Product Roadmap](../product/PRODUCT_ROADMAP.md) |
| Architecture Governance | Defines architectural decisions, bounded contexts, approved domain boundaries, and implementation constraints. | [Architecture Decisions](../product/ARCHITECTURE_DECISIONS.md), [ADR-0011 Persistence Concurrency](../product/ADR-0011-Persistence-Concurrency.md), [Architecture ADRs](../docs/adr), [Architecture Documentation](../docs/architecture) |

## Product Governance

Product governance establishes what Certisphere is, who it serves, what it will become, and what work is authorised for each release.

Primary responsibilities:

- Maintain the product mission and long-term vision.
- Govern product principles and customer value.
- Preserve accepted product decisions.
- Control roadmap and backlog sequencing.
- Preserve domain model integrity.
- Ensure implementation work traces back to approved product intent.

Required references:

- [PRODUCT_VISION.md](../product/PRODUCT_VISION.md)
- [PRODUCT_PRINCIPLES.md](../product/PRODUCT_PRINCIPLES.md)
- [Product Decision Records](../product/pdr/README.md)
- [PRODUCT_ROADMAP.md](../product/PRODUCT_ROADMAP.md)
- [BACKLOG.md](../product/BACKLOG.md)
- [DOMAIN_MODEL.md](../product/DOMAIN_MODEL.md)

## Engineering Governance

Engineering governance defines how Certisphere is built, validated, released, and maintained as a commercial SaaS platform.

Primary responsibilities:

- Enforce production-ready engineering standards.
- Maintain strict TypeScript, testing, linting, build, and release gates.
- Ensure APIs follow the mandatory design and security standards.
- Keep development environment and release tooling reliable.
- Prevent unapproved changes to architecture, APIs, database schema, or runtime behaviour.

Required references:

- [Engineering Standards](../docs/standards/engineering.md)
- [API Design Standards](../product/API_DESIGN_STANDARDS.md)
- [API Security Standard](../product/API_SECURITY_STANDARD.md)
- [Release Policy](../product/RELEASE_POLICY.md)
- [Project Status](../PROJECT_STATUS.md)

## Commercial Governance

Commercial governance ensures Certisphere is presented consistently, accurately, and responsibly to customers, consultants, auditors, partners, investors, and certification-facing stakeholders.

Primary responsibilities:

- Keep commercial positioning aligned with the product vision.
- Ensure value propositions are specific, supportable, and evidence-led.
- Prevent unsupported certification, compliance, security, AI, or customer outcome claims.
- Align sales, website, presentation, and proposal material with the governed brand voice.

Required references:

- [Product Vision](../product/PRODUCT_VISION.md)
- [Brand Strategy](../docs/brand/BRAND_STRATEGY.md)
- [Brand Voice](../docs/brand/BRAND_VOICE.md)
- [Brand Review Checklist](../docs/brand/BRAND_REVIEW_CHECKLIST.md)

## Brand Governance

Brand governance protects the Certisphere identity across product, documentation, website, sales, presentations, reports, videos, and AI-assisted brand work.

Primary responsibilities:

- Govern brand strategy, voice, visual identity, colour, typography, logo usage, and assets.
- Maintain design tokens for implementation consistency.
- Govern the UI design system for future React and Next.js development.
- Review customer-facing, investor-facing, certification-facing, and implementation-impacting assets.
- Ensure AI-generated brand content receives human review before use.

Required references:

- [Brand Governance](../docs/brand/BRAND_GOVERNANCE.md)
- [Brand Portal](../docs/brand/BRAND_PORTAL.md)
- [Brand Guidelines](../docs/brand/BRAND_GUIDELINES.md)
- [Design Tokens](../docs/brand/DESIGN_TOKENS.md)
- [UI Design System](../docs/brand/UI_DESIGN_SYSTEM.md)
- [AI Prompt Library](../docs/brand/AI_PROMPT_LIBRARY.md)
- [Brand Review Checklist](../docs/brand/BRAND_REVIEW_CHECKLIST.md)

## Security Governance

Security governance ensures Certisphere protects tenants, users, controlled information, audit trails, and authentication-sensitive data.

Primary responsibilities:

- Maintain tenant isolation requirements.
- Govern authentication, authorisation, RBAC, sessions, refresh tokens, and audit events.
- Ensure API security controls include validation, structured errors, correlation IDs, and audit logging.
- Preserve security expectations for future ISO 27001-aligned operation.

Required references:

- [Security Milestone Documentation](../docs/security/milestone-1.1.md)
- [Product Principles](../product/PRODUCT_PRINCIPLES.md)
- [API Design Standards](../product/API_DESIGN_STANDARDS.md)
- [API Security Standard](../product/API_SECURITY_STANDARD.md)

## AI Governance

AI governance ensures Certisphere uses AI as a controlled assistant, not as an autonomous decision-maker for management-system or controlled-information outcomes.

Primary responsibilities:

- Maintain the AI suggestion, human review, approval, workflow, and publication lifecycle.
- Prevent AI from directly modifying controlled information.
- Ensure AI-generated content is reviewed before becoming governed content.
- Align prompt use with product, brand, and compliance controls.

Required references:

- [AI Controlled Information Lifecycle](../docs/architecture/ai-controlled-information-lifecycle.md)
- [AI Prompt Library](../docs/brand/AI_PROMPT_LIBRARY.md)
- [Product Principles](../product/PRODUCT_PRINCIPLES.md)

## Release Governance

Release governance controls how Certisphere moves from planning to implementation, validation, tagging, deployment, rollback, and sprint closure.

Primary responsibilities:

- Govern version numbering, branch strategy, commit messages, and release tags.
- Enforce sprint and release gates.
- Maintain release readiness and rollback expectations.
- Keep `PROJECT_STATUS.md` current after each milestone.

Required references:

- [Release Policy](../product/RELEASE_POLICY.md)
- [Project Status](../PROJECT_STATUS.md)
- [Product Roadmap](../product/PRODUCT_ROADMAP.md)

## Architecture Governance

Architecture governance preserves approved technical decisions, bounded contexts, domain boundaries, and implementation constraints.

Primary responsibilities:

- Maintain architecture decision records.
- Ensure each bounded context owns its domain, application, infrastructure, API, and tests.
- Prevent cross-domain manipulation of unrelated data.
- Ensure implementation conflicts are escalated through architecture exceptions rather than silent redesign.

Required references:

- [Architecture Decisions](../product/ARCHITECTURE_DECISIONS.md)
- [ADR-0011 Persistence Concurrency](../product/ADR-0011-Persistence-Concurrency.md)
- [Architecture ADRs](../docs/adr)
- [Architecture Documentation](../docs/architecture)

## Governance Change Control

Governance changes must be version controlled and reviewed with the same care as implementation changes. A governance change must identify the affected domain, reason for change, impacted source documents, and implementation consequences.

If a governance change affects APIs, database schema, security controls, release gates, brand identity, AI behaviour, or domain boundaries, it must be handled through the applicable release and architecture process before implementation begins.
