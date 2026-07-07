# Milestone 1.1 Architecture

## Scope

Milestone 1.1 establishes the production foundation for Certisphere.

## Delivered Boundaries

- Customer portal application shell using Next.js 15 and React 19.
- API gateway using NestJS with versioned routing and OpenAPI documentation.
- Shared common package for domain primitives.
- Database package with Prisma ownership and initial tenancy/audit schema.
- Domain-first service bounded contexts with `application`, `domain`, `infrastructure`, `api`, and `tests` layers.
- GitLab CI quality gates.
- Docker Compose platform dependencies for local development.

## Out of Scope

- Domain workflows such as document approvals, CAPA, training, supplier management, and audit execution.
- Authentication flows beyond the documented API security baseline.
- Production Kubernetes manifests beyond ownership folders.

These are intentionally excluded to avoid fake business behaviour.
