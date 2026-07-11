# Sprint 2.3 Report: KCIP Application Services and Use Cases

Sprint: Release 0.2 Sprint 2.3

Status: Complete

Completion Date: 2026-07-10

## Objectives

- Implement the Knowledge & Controlled Information Platform application service layer.
- Coordinate domain aggregates, repositories, transactions, logging, and domain-event publication.
- Preserve Sprint 2.1 domain rules and Sprint 2.2 repository contracts.
- Avoid REST API, user interface, workflow engine, AI, notification, and database-schema changes.

## Architecture Compliance

- No REST API endpoints were added.
- No user interface code was added.
- No Workflow Engine, AI implementation, notification delivery, or asynchronous processing was introduced.
- Approved repository interfaces were not changed.
- Prisma schema and migrations were not changed.
- Application services delegate lifecycle, revision, approval independence, publication, relationship, and evidence-link validation to the existing domain model.
- Application transaction coordination is represented by `ApplicationTransactionManager`.
- Domain events are published through `DocumentDomainEventPublisher`; no event bus was introduced.
- Search, distribution, and evidence-link removal are exposed through application ports because the approved Sprint 2.1 repository interfaces do not own those contracts.

## Implemented Services

- `ControlledInformationService`
- `RevisionService`
- `ApprovalService`
- `PublicationService`
- `RelationshipService`
- `EvidenceService`
- `LifecycleService`
- `SearchService`

## Transaction Model

Sprint 2.3 introduces a local application transaction abstraction:

- `ApplicationTransactionManager`
- `ImmediateApplicationTransactionManager`

Application services execute repository writes inside the transaction boundary and publish domain events only after the transaction operation succeeds. Repository implementations remain transaction-neutral.

## Validation Summary

Application services validate orchestration concerns and delegate business invariants to the domain model:

- Tenant isolation is checked before writes.
- Duplicate document numbers are checked before controlled information registration.
- Lifecycle transitions use the existing `Lifecycle` state machine.
- Revision creation, revision numbering, immutable revision rules, and restore-as-draft use the `Document` and `Revision` domain model.
- Approval independence and electronic signature binding use the `Approval` and `Document` domain model.
- Publication rules use the `Document.publish` domain method.
- Relationship integrity and evidence traceability use aggregate methods on `Document`.
- Search limit validation is enforced before invoking the search port.

## Testing Summary

Added application-service unit tests covering:

- Controlled information registration, retrieval, metadata update, archive, restore, ownership validation, and duplicate numbering.
- Tenant isolation failures.
- Revision creation, restoration, supersession, comparison, and history retrieval.
- Approval submission, approver assignment, approval independence, electronic approval, rejection, and publication.
- Withdrawal and lifecycle transitions.
- Distribution orchestration through an application port.
- Relationship creation and evidence linking.
- Evidence removal orchestration through an application port.
- Transaction rollback behavior and event publication suppression on persistence failure.
- Search orchestration and service-provider registration.

Focused package verification:

- `CI=true pnpm --filter @certisphere/documents typecheck`: passed.
- `CI=true pnpm --filter @certisphere/documents lint`: passed.
- `CI=true pnpm --filter @certisphere/documents build`: passed.
- `CI=true pnpm --filter @certisphere/documents test`: passed with 22 tests across 3 test files.

## Known Limitations

- Runtime Docker/PostgreSQL verification remains unavailable in this local environment.
- Search persistence and indexing are not implemented in Sprint 2.3; `SearchService` depends on a search port for the approved future projection implementation.
- Distribution persistence and notification delivery are not implemented in Sprint 2.3; `PublicationService` depends on a distribution port.
- Evidence-link removal is coordinated through an application port because the approved Sprint 2.1 evidence repository interface does not expose deletion.
- Application-service-level expected-version parameters remain out of scope per [ADR-0011](./product/ADR-0011-Persistence-Concurrency.md).

## Technical Debt

- Add concrete search projection persistence in the approved search sprint.
- Add concrete distribution and acknowledgement persistence when distribution tables and workflows are approved.
- Add concrete evidence-link removal persistence when the Evidence bounded context or repository contract is approved.
- Add application-service expected-version handling only through a future approved architecture decision.

## Performance Considerations

- Application services avoid unbounded collection reads except through explicit search and history ports.
- Search is delegated to a port so future implementations can use indexed tenant-scoped projections.
- Domain event publication occurs after transaction success to avoid publishing events for rolled-back writes.

## Next Sprint

Sprint 2.4 is the next pending Release 0.2 sprint. It must not begin until explicitly authorised.
