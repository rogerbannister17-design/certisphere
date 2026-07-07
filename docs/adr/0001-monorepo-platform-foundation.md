# ADR 0001: Monorepo Platform Foundation

## Status

Accepted

## Context

Certisphere is a commercial SaaS platform that must support multiple applications, business services, shared engines, regulated audit trails, and enterprise delivery controls.

## Decision

Use a pnpm and Turborepo monorepo with clear boundaries:

- `apps` for user-facing applications and API gateways.
- `services` for independently owned domain bounded contexts.
- `packages` for shared platform libraries and engines.
- `infrastructure` for Docker, Kubernetes, Azure, Terraform, and operational assets.
- `docs` for architecture, API, database, deployment, security, and release materials.

## Consequences

- Every package owns its build, lint, type check, and test commands.
- Shared code must remain domain-neutral unless explicitly owned by a bounded context.
- Feature implementations must provide tests, documentation, security controls, and audit behaviour.
- Bounded contexts use domain names, not implementation names: `identity`, `organisation`, `documents`, `workflow`, `audits`, `evidence`, `risks`, `suppliers`, `customers`, `training`, `management-review`, and `ai`.
- Each bounded context contains `application`, `domain`, `infrastructure`, `api`, and `tests` layers.
