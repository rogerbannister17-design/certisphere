# Sprint 2.1 Report: KCIP Domain Model

Sprint: Release 0.2 Sprint 2.1

Status: Complete

Completion Date: 2026-07-08

## Objectives

- Implement the Knowledge & Controlled Information Platform domain layer only.
- Define domain aggregates, value objects, domain events, lifecycle rules, and repository interfaces.
- Enforce core business invariants without implementing UI, REST APIs, Prisma, persistence, workflow execution, AI, file upload, or authentication changes.

## Deliverables

- Added the `@certisphere/documents` workspace package under `services/documents`.
- Implemented domain aggregates and entities for controlled information, documents, revisions, approvals, relationships, evidence links, metadata, lifecycle, document numbering, classification, category, ownership, access policy, retention, archive, comments, reviews, attachments, electronic signatures, clause mappings, process links, and workflow references.
- Implemented value objects for identifiers, organisation ownership, document numbers, revision numbers, classifications, clause references, process references, evidence references, metadata, and retention periods.
- Implemented domain events for document creation, review submission, approval, rejection, publication, archive, revision creation, relationship creation, evidence linking, approval completion, and lifecycle changes.
- Implemented repository interfaces only for controlled information, documents, approvals, relationships, evidence links, and revisions.
- Implemented unit tests covering lifecycle transitions, revision rules, document numbering, approval rules, relationship validation, evidence links, value objects, business invariants, and domain events.

## Architecture Decisions Used

- [ADR-001: Monorepo Architecture](./product/ARCHITECTURE_DECISIONS.md)
- [ADR-003: NestJS](./product/ARCHITECTURE_DECISIONS.md)
- [ADR-008: AI Suggestions Require Human Approval](./product/ARCHITECTURE_DECISIONS.md)
- [ADR-009: Multi-tenant SaaS](./product/ARCHITECTURE_DECISIONS.md)
- [ADR-010: Knowledge & Controlled Information Platform](./product/ARCHITECTURE_DECISIONS.md)
- [SPEC-0001: Knowledge & Controlled Information Platform](./specifications/SPEC-0001-KCIP.md)
- [Design Review v2](./DESIGN_REVIEW_v2.md)
- [Product Principles](./product/PRODUCT_PRINCIPLES.md)
- [Domain Model](./product/DOMAIN_MODEL.md)

## Tests

- `CI=true pnpm --filter @certisphere/documents typecheck`
- `CI=true pnpm --filter @certisphere/documents lint`
- `CI=true pnpm --filter @certisphere/documents test`
- `CI=true pnpm --filter @certisphere/documents build`

Workspace-level verification was also run after implementation:

- `CI=true pnpm typecheck`
- `CI=true pnpm lint`
- `CI=true pnpm build`
- `CI=true pnpm test`

## Coverage

The domain test suite currently contains 8 focused unit tests covering the implemented domain logic and invariants. The Sprint 2.1 target is full domain logic coverage; automated percentage reporting is not yet configured in the repository test tooling.

## Known Limitations

- Repository interfaces are ports only; no persistence implementation exists in Sprint 2.1 by design.
- Unique document number enforcement is exposed through repository contracts and value-object validation; database uniqueness constraints are deferred to Sprint 2.2.
- Workflow orchestration is intentionally not implemented. The domain owns lifecycle and approval-state rules only.
- Distribution, generated-record, import/export, storage, and malware scan concepts remain specified for later sprints and are not implemented in Sprint 2.1.

## Technical Debt

- Configure automated coverage reporting for workspace packages before broader Release 0.2 implementation expands.
- Add aggregate-level factories for generated record types when Sprint 2.4 authoring and Sprint 2.7 relationship work begin.
- Revisit package references if the monorepo later adopts TypeScript project references across all workspaces.

## Next Sprint

Sprint 2.2: KCIP database design and Prisma persistence model.

Sprint 2.2 must not begin until explicitly authorised. It will cover Prisma models, migrations, indexes, constraints, seed data, and rollback validation.
