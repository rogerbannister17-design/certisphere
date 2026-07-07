# Engineering Standards

Certisphere is enterprise-grade commercial software.

## Baseline

- Strict TypeScript.
- No `any`.
- SOLID design.
- Clean Architecture.
- Dependency Injection.
- Domain Driven Design.
- Repository Pattern for persistence boundaries.
- CQRS-ready feature modules.

## Required Per Feature

- Acceptance criteria.
- Unit tests.
- Integration tests where boundaries are crossed.
- Documentation.
- API specification.
- OpenAPI metadata for every endpoint.
- Logging.
- Error handling.
- Security controls.
- Audit trail behaviour.

## Prohibited

- Prototype code.
- Demo code.
- Mock business implementations.
- Silent failure paths.
- Undocumented endpoints.
- Database changes outside Prisma migrations.
