# Milestone 1 Identity and Organisation Architecture

## Scope

Milestone 1 establishes Identity and Organisation as standalone bounded contexts under `services/identity` and `services/organisation`.

Identity owns:

- Users
- Roles
- Permissions
- Sessions
- Refresh tokens
- Organisation membership
- Invitations
- Password reset token persistence
- MFA factor persistence
- Identity audit events

Organisation owns organisation lifecycle primitives and remains independent from authentication concerns.

## Boundaries

- Identity does not expose direct database access to API controllers.
- API controllers depend on application services and guards.
- Prisma persistence is isolated behind repository interfaces.
- Authentication uses signed JWT access tokens and opaque refresh tokens.
- Refresh tokens are stored only as SHA-256 hashes.
- Passwords are stored only as Argon2 hashes.
- Organisation access is enforced by JWT organisation claims and request organisation context.
- Audit event creation is performed through an application-level audit sink.

## Security

- All protected endpoints require bearer authentication, explicit permission metadata, and organisation-aware access checks.
- Invitation audit attribution uses the authenticated principal, never a caller-supplied actor identifier.
- Bootstrap organisation registration requires `x-certisphere-setup-token` and is intended for controlled deployment setup.
- Domain errors are mapped to structured HTTP responses by the API gateway error filter.

## Persistence

The Prisma schema includes tenant-scoped models with UUID primary keys, timestamps, soft-delete fields where appropriate, and version fields for optimistic concurrency extension.

The migration is checked in at:

`packages/database/prisma/migrations/20260707120000_milestone_1_identity_organisation/migration.sql`

## Verification

Unit tests cover Identity login, organisation registration, and Organisation application service creation. The API health integration test validates signed JWT authentication and RBAC.

Milestone 1.2E validation results:

- `pnpm install --frozen-lockfile` passes.
- `pnpm --filter @certisphere/database prisma:generate` passes.
- `pnpm --filter @certisphere/database exec prisma validate --schema prisma/schema.prisma` passes.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm build` passes.
- `pnpm test` passes.
- `pnpm test:integration` passes when local port binding is permitted.
- `pnpm audit --audit-level high` passes.

Environment-blocked checks:

- Docker stack validation is blocked because Docker is not installed in this environment.
- PostgreSQL migration apply/rollback and seed verification are blocked because Docker and local PostgreSQL tooling are unavailable.
