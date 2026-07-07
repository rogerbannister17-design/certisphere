# Milestone 1.1 Acceptance Criteria

## Repository Foundation

- The repository contains the documented Certisphere monorepo structure.
- pnpm workspace configuration includes apps, services, and packages.
- Services are organised as domain bounded contexts, not `*-service` implementation folders.
- Each service bounded context contains `application`, `domain`, `infrastructure`, `api`, and `tests`.
- Turborepo tasks cover build, lint, test, integration test, and type check.
- Strict TypeScript configuration is shared from the repository root.

## Applications

- Customer portal shell exists as a Next.js 15 and React 19 application.
- API gateway exists as a NestJS application.
- API gateway exposes `GET /v1/health`.
- API gateway publishes OpenAPI documentation at `/api/docs`.

## Database

- Prisma schema exists in `packages/database`.
- Initial organisation, user, and audit event models exist.
- Prisma models include UUID identifiers, `organisationId`, audit ownership metadata, timestamps, soft-delete fields where appropriate, and optimistic concurrency fields.
- Database migration ownership is documented.

## Quality

- Unit tests exist for the API health service and shared tenant identifier.
- Integration test exists for the health endpoint.
- Customer portal render test exists.
- GitLab CI defines lint, type check, test, build, and dependency audit stages.

## Security and Audit

- Security baseline is documented.
- API input validation is globally configured.
- API request completion logging is configured.
- Audit event storage is included in the Prisma schema.
