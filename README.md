# Certisphere™

Certisphere™ is a commercial SaaS platform for building, managing, auditing, and certifying management systems.

## Milestone 1.1

Milestone 1.1 establishes the production monorepo foundation for the platform:

- Turborepo and pnpm workspace governance.
- Strict TypeScript baseline shared by all apps, services, and packages.
- Next.js customer portal application shell.
- NestJS API gateway with documented health endpoint.
- Docker Compose baseline for local platform dependencies.
- GitLab CI quality gates for installation, linting, type checks, tests, and builds.
- Architecture, security, API, database, deployment, and milestone documentation.

This repository does not contain prototype, demo, or mock implementations. Business features must be delivered as production slices with tests, documentation, API specifications, acceptance criteria, logging, security, and audit trails.

## Milestone 1.2E Validation

Milestone 1.2E validates the Identity and Organisation implementation for production readiness.

Validated locally:

- Deterministic dependency installation with `pnpm install --frozen-lockfile`.
- Prisma Client generation and Prisma schema validation.
- TypeScript typecheck across every workspace.
- ESLint across every workspace.
- Production build across every workspace.
- Unit tests across every workspace.
- API integration tests for signed JWT authentication and RBAC-protected health access.
- High-severity dependency audit gate.

Environment-blocked checks:

- Docker image build and full stack startup require Docker.
- PostgreSQL migration apply/rollback and seed verification require Docker or local PostgreSQL tooling.

## Workspace

```text
apps/        Product applications and API gateways
services/    Domain bounded contexts
packages/    Shared libraries and platform engines
docs/        Architecture, API, database, security, deployment, and release documentation
infrastructure/ Docker, Kubernetes, Azure, Terraform, and platform operations
tests/       Cross-workspace test suites
templates/   QMS content templates
tools/       Generators, codegen, schema, QA, and migration tooling
```

## Required Toolchain

- Node.js 22
- pnpm 10
- Docker
- PostgreSQL 16
- Prisma

## Commands

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm audit --audit-level high
```

## Governance

All feature work must satisfy the standards in [docs/standards/engineering.md](docs/standards/engineering.md) and the architecture decisions in [docs/adr](docs/adr).

## Product Governance

Release 0.1.1 establishes the permanent product governance source of truth for Certisphere.

- [Product Vision](product/PRODUCT_VISION.md)
- [Product Principles](product/PRODUCT_PRINCIPLES.md)
- [Product Roadmap](product/PRODUCT_ROADMAP.md)
- [Product Backlog](product/BACKLOG.md)
- [Architecture Decisions](product/ARCHITECTURE_DECISIONS.md)
- [Domain Model](product/DOMAIN_MODEL.md)

## Bounded Contexts

Each domain under `services` owns its own `application`, `domain`, `infrastructure`, `api`, and `tests` layers.

- `identity`
- `organisation`
- `documents`
- `workflow`
- `audits`
- `evidence`
- `risks`
- `suppliers`
- `customers`
- `training`
- `management-review`
- `ai`

© 2026 Certisphere™

All rights reserved.
