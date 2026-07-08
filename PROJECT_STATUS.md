# Project Status

## Current Version

0.3.6

## Completed Milestones

- Milestone 1.1: Production monorepo foundation, strict TypeScript, Next.js customer portal shell, NestJS API gateway, Prisma baseline, Docker Compose, GitLab CI.
- Milestone 1.2F: Certisphere platform branding, unified branding package, generated favicon/logo assets, metadata and PWA manifest.
- Milestone 1: Identity and Organisation bounded-context source implementation with JWT authentication, refresh tokens, Argon2 password hashing, RBAC, organisation-aware access control, invitation workflow, audit-event persistence, Docker integration, and CI validation definitions.
- Milestone 1.2E: Engineering Complete. Production-readiness validation executed for dependency installation, Prisma generation/schema validation, TypeScript, ESLint, production builds, unit tests, API integration tests, and high-severity dependency audit.
- Milestone 1.2F Environment Preparation: Prerequisites documentation and workstation verification scripts added for clean development workstation and GitLab CI runner preparation.
- Release 0.1.1 Product Governance: Complete. Product vision, roadmap, backlog, architecture decisions, and domain model are established under `/product`.
- Release 0.1.2 Product Principles: Complete. Permanent product principles are established in `/product/PRODUCT_PRINCIPLES.md`.
- Release 0.2 Planning: Complete. `SPEC-0001-KCIP.md` defines the Knowledge & Controlled Information Platform engineering specification. Implementation: Not Started.

## Pending Milestones

- Notification delivery for invitation and password reset emails.
- MFA verification flows beyond persistence and domain boundaries.
- Release 0.2 Implementation: Not Started. Await explicit authorisation after runtime validation readiness.
- Milestone 1.2F Release Verification: Waiting for Runtime Validation. Docker Compose stack startup, PostgreSQL migration apply/rollback, seed verification, end-to-end runtime authentication, frontend runtime workflows, and GitLab runner pipeline confirmation must run on a Docker-enabled workstation or GitLab runner.
- PostgreSQL-backed migration execution, seed execution, and rollback verification in an environment with Docker or PostgreSQL tooling installed.
- Docker image build and full-stack runtime verification in an environment with Docker installed.
- Management-system domain workflows.

## Database Migration Status

- Prisma schema updated for Organisation, User, Organisation Membership, Roles, Permissions, Sessions, Refresh Tokens, Invitations, Password Reset Tokens, MFA Factors, and Audit Events.
- Migration file added at `packages/database/prisma/migrations/20260707120000_milestone_1_identity_organisation/migration.sql`.
- Prisma Client generation passes.
- Prisma schema validation passes.
- Migration apply/rollback and seed execution are blocked in this local environment because `docker`, `psql`, `postgres`, and `pg_ctl` are unavailable.

## Test Coverage

- Unit coverage added for Identity login and organisation registration services.
- Unit coverage added for Organisation creation application service.
- API health integration test updated to validate signed JWT authentication and RBAC.
- GitLab CI now validates Prisma schema, unit tests, integration tests, build, and dependency audit.
- Unit tests pass.
- API integration tests pass when executed with local port binding permission.
- TypeScript typecheck passes.
- ESLint passes.
- Production build passes for every workspace.
- High-severity dependency audit passes after pinning patched `multer` via workspace override.

## Known Issues

- Docker validation is blocked because the `docker` command is not installed or not available in this environment.
- PostgreSQL migration apply/rollback and seed verification are blocked because no local PostgreSQL server/client tooling is installed.
- Milestone 1.2F Release Verification cannot be completed on this machine until Docker and PostgreSQL tooling are available and sufficient disk space is reserved for image builds.
- Environment preparation scripts are available at `scripts/bootstrap`, `scripts/verify-environment`, `scripts/start-dev`, and `scripts/doctor`.
- Next.js build reports a non-failing warning that the Next ESLint plugin is not detected in the current flat ESLint configuration.
- Dependency audit still reports one low and one moderate advisory below the configured high-severity CI threshold.
- Invitation email delivery, password reset email delivery, and MFA challenge verification require notification-channel integration.

## Next Milestone

Run Docker/PostgreSQL-backed verification on a workstation or CI runner with Docker installed, then connect notification templates and MFA challenge verification.

## Release Target

Milestone 1 internal engineering release candidate after Docker/PostgreSQL migration verification and full stack runtime verification pass.
