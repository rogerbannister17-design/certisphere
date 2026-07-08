# Sprint 2.2 Report: KCIP Persistence Foundation

Sprint: Release 0.2 Sprint 2.2

Status: Complete

Completion Date: 2026-07-08

## Objectives

- Create the permanent Certisphere Release Policy before implementation.
- Implement the KCIP persistence foundation only.
- Preserve the Sprint 2.1 domain model and repository interfaces as the source of truth.
- Add Prisma schema, migration SQL, rollback SQL, seed data, repository adapters, entity mapping, tenant isolation, audit metadata, indexes, constraints, optimistic concurrency columns, and integration-style tests.

## Deliverables

- Created [Release Policy](./product/RELEASE_POLICY.md).
- Updated [README](./README.md) Product Governance links.
- Added KCIP Prisma models and enums to `packages/database/prisma/schema.prisma`.
- Added migration SQL at `packages/database/prisma/migrations/20260708130000_release_0_2_sprint_2_2_kcip_persistence/migration.sql`.
- Added rollback SQL at `packages/database/prisma/migrations/20260708130000_release_0_2_sprint_2_2_kcip_persistence/rollback.sql`.
- Added seed data at `packages/database/prisma/seed.sql`.
- Implemented Prisma repository adapters in `services/documents/infrastructure`.
- Implemented mapper functions for controlled information, documents, revisions, approvals, relationships, and evidence links.
- Added persistence tests in `services/documents/tests/persistence.spec.ts`.

## Architecture Compliance

- No UI, REST API, document editor, AI, workflow execution, reporting engine, or authentication changes were implemented.
- Sprint 2.1 repository interfaces were not changed.
- The domain model was not redesigned.
- Persistence conforms to tenant isolation by storing `organisationId` and `tenantId` on KCIP tables and enforcing tenant checks in migration SQL.
- Every KCIP persistent entity includes `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`, `tenantId`, `deletedAt`, and `version`.
- [ADR-0011: Persistence Concurrency](./product/ADR-0011-Persistence-Concurrency.md) records that optimistic concurrency is implemented internally in the persistence layer without altering approved domain interface contracts.

## Repository Summary

- `PrismaControlledInformationRepository` implements controlled information lookup, uniqueness check, and persistence.
- `PrismaDocumentRepository` persists aggregate roots and child revisions/approvals inside a transaction.
- `PrismaApprovalRepository` resolves the owning document through the target revision to preserve the existing interface.
- `PrismaRelationshipRepository` and `PrismaEvidenceRepository` persist relationship and evidence link rows.
- `PrismaRevisionRepository` persists existing revision rows and increments persistence version metadata.

## Migration Summary

- Added controlled information, document, revision, approval, relationship, evidence link, comment, review, attachment, clause mapping, process link, and workflow reference tables.
- Added lifecycle, classification, controlled information type, relationship, evidence relationship, approval decision, clause coverage, process relationship, and workflow reference enums.
- Added unique constraints for document numbers and revision numbers.
- Added indexes for tenant-scoped lifecycle, classification, evidence, relationship, clause, process, workflow, and soft-delete access patterns.
- Added rollback SQL that drops KCIP persistence tables and enums in dependency order.

## Testing Summary

- Documents package typecheck passes.
- Documents package lint passes.
- Documents package build passes.
- Documents package tests pass with 12 tests across domain and persistence suites.
- Prisma schema validation passes with a local non-production `DATABASE_URL`.
- Prisma Client generation passes.
- Migration/rollback/seed structure is validated by persistence tests.

## Known Limitations

- Live PostgreSQL migration apply, rollback, and seed execution could not be performed in this local environment because PostgreSQL and Docker tooling are unavailable.
- Repository interfaces do not expose caller-provided expected versions, so optimistic concurrency is represented through schema `version` columns and adapter update increments. A future public expected-version parameter must be introduced through a separate approved architecture decision rather than during Sprint 2.2.
- Standalone relationship and evidence repository saves do not receive an actor id from the approved Sprint 2.1 interface. Repository-level audit metadata uses a reserved system actor UUID for those standalone saves; application services should supply actor-specific audit events in later sprints.

## Technical Debt

- Add live PostgreSQL migration apply/rollback/seed execution to GitLab CI once a Docker-enabled runner is available.
- Add application-service-level expected-version enforcement when write use cases are introduced.
- Add repository methods for richer tenant-scoped queries when Sprint 2.3 and later controlled information use cases require them.

## Next Sprint

Sprint 2.3 is pending explicit authorisation.

Sprint 2.3 must not begin from this sprint. It is expected to focus on audit event integration or the next approved KCIP persistence/application slice according to the product backlog.
