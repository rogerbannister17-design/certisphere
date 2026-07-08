# ADR-0011: Persistence Concurrency

Status: Accepted

Date: 2026-07-08

## Context

Sprint 2.2 implements the KCIP persistence foundation while the Sprint 2.1 domain model and repository interfaces remain the approved source of truth. Those repository interfaces do not expose a caller-provided expected-version parameter.

The persistence layer still requires optimistic concurrency support where possible so controlled information changes can be protected against accidental overwrite once write use cases are introduced.

## Decision

Optimistic concurrency is implemented inside the persistence foundation without altering the approved Sprint 2.1 domain repository interface contracts.

KCIP persistence tables include `version` columns, repository adapters increment version metadata on updates, and migrations preserve the database structure needed for future expected-version enforcement.

No public expected-version parameter is introduced during Sprint 2.2.

## Consequences

- Sprint 2.1 repository interfaces remain stable and unchanged.
- Persistence records are prepared for optimistic concurrency.
- Current repository saves can increment internal version metadata.
- Caller-driven stale-write detection is not part of the Sprint 2.2 public repository contract.
- Application services that need strict expected-version checks must not infer that capability from the current interface.

## Future Considerations

If future public expected-version parameters are required, they must be introduced through a separate approved architecture decision.

That future decision should define the application-service contract, repository contract changes, error semantics, migration impact, API behaviour, audit trail expectations, and compatibility plan.
