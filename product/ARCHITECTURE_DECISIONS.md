# Architecture Decisions

This document records permanent architecture decisions for Certisphere. Each ADR is binding until superseded by a later accepted ADR.

## ADR-001: Monorepo Architecture

Status: Accepted

### Context

Certisphere contains multiple applications, bounded contexts, shared packages, infrastructure assets, and governance documents. The platform needs consistent TypeScript, CI, dependency, and release management.

### Decision

Certisphere uses a pnpm and Turborepo monorepo with `apps`, `services`, `packages`, `docs`, `product`, and infrastructure folders.

### Consequences

- Shared standards and build pipelines are enforced consistently.
- Domain packages can evolve independently while remaining visible to the whole platform.
- CI must protect workspace boundaries and dependency determinism.

### Alternatives Considered

- Multiple repositories: rejected because early product boundaries and shared governance would be harder to coordinate.
- Single application repository: rejected because Certisphere has multiple applications and bounded contexts.

## ADR-002: Next.js

Status: Accepted

### Context

The customer portal needs a production web framework with routing, server rendering options, asset optimisation, and strong TypeScript support.

### Decision

Certisphere uses Next.js for web portal applications.

### Consequences

- Web applications can share React, TypeScript, and design-system assets.
- Frontend builds must be validated in CI.
- Docker builds must use Next.js standalone output where applicable.

### Alternatives Considered

- Vite SPA: rejected because Certisphere benefits from framework-level routing and production deployment conventions.
- Server-rendered templates: rejected because portal workflows require a richer application experience.

## ADR-003: NestJS

Status: Accepted

### Context

The API layer needs dependency injection, modular architecture, guards, interceptors, OpenAPI support, and a clear path for Clean Architecture boundaries.

### Decision

Certisphere uses NestJS for the API gateway and future backend services.

### Consequences

- API features are organised into modules with guards, validation, filters, and OpenAPI metadata.
- Domain logic must remain in bounded-context services rather than controllers.
- Testing must include application services and API integration coverage.

### Alternatives Considered

- Express without framework conventions: rejected because it would push architecture discipline into custom code.
- Fastify-only service: rejected for the current phase because NestJS provides stronger module and OpenAPI conventions.

## ADR-004: Prisma ORM

Status: Accepted

### Context

The platform needs typed database access, migrations, generated clients, and a maintainable schema source of truth.

### Decision

Certisphere uses Prisma ORM for PostgreSQL schema management and data access.

### Consequences

- Schema changes must be represented in Prisma schema and migrations.
- Prisma Client generation is a required validation step.
- Repository implementations use Prisma behind application ports.

### Alternatives Considered

- Raw SQL only: rejected because it would reduce type safety and developer speed.
- TypeORM: rejected because Prisma provides a stronger schema and migration workflow for this product stage.

## ADR-005: PostgreSQL

Status: Accepted

### Context

Certisphere needs relational integrity, transactional consistency, JSON metadata support, indexing, and mature operational tooling.

### Decision

Certisphere uses PostgreSQL as the primary transactional database.

### Consequences

- Domain models use UUID primary keys and tenant isolation.
- Migrations must be validated against PostgreSQL 16.
- Runtime verification requires PostgreSQL tooling or Docker.

### Alternatives Considered

- MySQL: rejected because PostgreSQL better fits JSON metadata, indexing, and enterprise operational patterns.
- Document database: rejected because controlled information, permissions, audit trails, and workflow relationships are relational.

## ADR-006: GitHub

Status: Accepted

### Context

The source repository currently originates from GitHub, while delivery governance includes GitLab CI for validation. The project needs clear source-control expectations.

### Decision

GitHub is accepted as the source repository origin for this phase. GitLab CI configuration remains part of the repository so the platform can run on GitLab runners when mirrored or migrated.

### Consequences

- Repository links and clone instructions may reference GitHub.
- CI/CD scripts must remain portable to GitLab runners.
- Future migration to GitLab must preserve commit history and governance documents.

### Alternatives Considered

- GitLab-only from inception: not selected because the current repository is GitHub-hosted.
- Local-only repository: rejected because commercial SaaS development requires remote source control and review.

## ADR-007: SSH Authentication

Status: Accepted

### Context

Repository access, automation, and developer onboarding require secure authentication without embedding long-lived passwords.

### Decision

Repository access uses SSH authentication for developer Git operations.

### Consequences

- Developers must configure SSH keys and protect private keys.
- CI runners should use deploy keys or managed credentials.
- HTTPS token-based access may be used only where platform policy requires it.

### Alternatives Considered

- Password authentication: rejected because it is insecure and unsupported by major Git hosting providers.
- Shared machine credentials: rejected because they prevent accountability.

## ADR-008: AI Suggestions Require Human Approval

Status: Accepted

### Context

Certisphere will use AI to assist with drafting, gap analysis, and improvement suggestions. Controlled information affects certification evidence and operational obligations.

### Decision

AI must never directly modify controlled information. AI outputs become suggestions that require human review and approval before workflow progression or publication.

### Consequences

- AI actions must be auditable.
- Users remain accountable for accepted changes.
- Workflow and approval models must support AI suggestion review.

### Alternatives Considered

- Direct AI editing: rejected because it undermines control, accountability, and auditability.
- No AI support: rejected because AI assistance is a strategic differentiator when properly governed.

## ADR-009: Multi-tenant SaaS

Status: Accepted

### Context

Certisphere is a commercial SaaS platform serving multiple organisations with strict isolation requirements.

### Decision

All tenant-owned domain data must include organisation ownership and access must be enforced through organisation-aware authentication and authorisation.

### Consequences

- Every domain model must include tenant isolation.
- APIs must validate organisation access.
- Tests must cover cross-tenant access denial.

### Alternatives Considered

- Single-tenant deployments per customer: rejected for the primary SaaS model because it increases operational overhead.
- Tenant isolation only in application code: rejected because database models must also carry tenant context.

## ADR-010: Knowledge & Controlled Information Platform

Status: Accepted

### Context

Certisphere must govern policies, procedures, forms, records, evidence, and ISO clause mappings. Treating these as ordinary files would not satisfy certification, auditability, or lifecycle requirements.

### Decision

Release 0.2 establishes a Knowledge & Controlled Information Platform as a core domain capability with controlled lifecycle, ownership, revision, approval, publication, retention, and audit trails.

### Consequences

- Documents and knowledge assets must use domain models rather than unstructured file storage alone.
- Workflows and AI suggestions must integrate with controlled information lifecycle states.
- Search, reporting, audit, and certification readiness depend on this foundation.

### Alternatives Considered

- Shared-drive style document repository: rejected because it does not provide sufficient control or traceability.
- External document management integration first: rejected because Certisphere needs native domain ownership of controlled information.
