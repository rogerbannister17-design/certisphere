# Application Service Catalog

This catalog defines the governed application service boundary for Certisphere. It is a product and architecture source of truth for use-case orchestration across bounded contexts.

Application services coordinate domain objects, repositories, policy checks, transactions, audit publication, and integration ports. They must not contain user-interface logic, transport-specific request handling, database schema definitions, or cross-context data manipulation.

Related documents:

- [Product Vision](PRODUCT_VISION.md)
- [Product Principles](PRODUCT_PRINCIPLES.md)
- [Product Roadmap](PRODUCT_ROADMAP.md)
- [Domain Model](DOMAIN_MODEL.md)
- [Architecture Decisions](ARCHITECTURE_DECISIONS.md)
- [Release Policy](RELEASE_POLICY.md)
- [SPEC-0001: Knowledge & Controlled Information Platform](../specifications/SPEC-0001-KCIP.md)

## Catalog Principles

- Every application service belongs to exactly one bounded context.
- Every command must include organisation context when it acts on tenant-owned data.
- Every command must include authenticated actor context when it changes controlled information, security-sensitive data, or audit-relevant state.
- Application services enforce authorisation before invoking repositories.
- Application services publish immutable audit events for controlled or security-relevant changes.
- Application services use repository interfaces and integration ports; they do not directly manipulate another bounded context's persistence model.
- Application services are transaction-aware where multiple persistent writes must succeed or fail together.
- AI services may create suggestions and analysis, but they must never directly modify controlled information.

## Status Definitions

- Implemented: The service exists in the repository and is covered by automated tests.
- Planned: The service is approved by product governance for the stated release but is not yet implemented.
- Future: The service is strategically identified but not approved for sprint implementation.

## Cross-Cutting Application Service Requirements

Every production application service must satisfy the following requirements before implementation is considered complete:

- Validate command input using domain value objects or application-level validation.
- Verify tenant ownership and selected organisation context.
- Verify permissions through Identity and Organisation integration ports.
- Use repositories through dependency injection.
- Emit structured logs through the platform logger abstraction.
- Emit immutable audit events for controlled, security-sensitive, or certification-relevant changes.
- Preserve optimistic concurrency for mutable aggregate updates where persistence supports it.
- Return typed results and typed errors; do not expose infrastructure exceptions.
- Include unit tests for business rules and integration tests for persistence-backed workflows where persistence is implemented.

## Implemented Services

### Identity

#### RegisterOrganisationService

Status: Implemented

Release: 0.1

Purpose: Registers the initial organisation and its first identity user.

Primary Command: `RegisterOrganisationCommand`

Owned Data: Identity user, organisation membership, credentials, audit event.

Dependencies: Identity repository, password hasher, audit event sink.

Security Requirements: Bootstrap registration must be protected by the configured bootstrap guard and must not permit unauthorised tenant creation.

Audit Events: Organisation registration and initial user creation.

Tests: Unit tests in the Identity service test suite.

#### LoginService

Status: Implemented

Release: 0.1

Purpose: Authenticates a user and issues an authenticated session.

Primary Command: `LoginCommand`

Owned Data: User authentication state, session, refresh token metadata.

Dependencies: Identity repository, password hasher, token service, audit event sink.

Security Requirements: Must verify Argon2 password hash, user status, organisation membership, token signing, and refresh-token persistence.

Audit Events: Successful login and rejected authentication attempts where supported by the audit sink.

Tests: Unit tests in the Identity service test suite.

#### RefreshSessionService

Status: Implemented

Release: 0.1

Purpose: Exchanges a valid refresh token for a new authenticated session.

Primary Command: `RefreshSessionCommand`

Owned Data: Session state and refresh-token rotation state.

Dependencies: Identity repository, token service, audit event sink.

Security Requirements: Must reject revoked, expired, unknown, or tenant-mismatched refresh tokens.

Audit Events: Session refresh and rejected refresh attempt where supported by the audit sink.

Tests: Covered through Identity authentication test scope and repository validation.

#### InvitationService

Status: Implemented

Release: 0.1

Purpose: Creates organisation invitations for prospective users.

Primary Command: `CreateInvitationCommand`

Owned Data: Invitation request and invitation lifecycle metadata.

Dependencies: Identity repository, audit event sink, future notification integration port.

Security Requirements: Must require actor context, organisation context, and invitation permissions.

Audit Events: Invitation created, revoked, accepted, or expired as lifecycle support expands.

Tests: Covered by Identity service tests and persistence validation where implemented.

### Organisation

#### CreateOrganisationService

Status: Implemented

Release: 0.1

Purpose: Creates an organisation aggregate inside the Organisation bounded context.

Primary Command: `CreateOrganisationCommand`

Owned Data: Organisation aggregate and tenant metadata.

Dependencies: Organisation repository.

Security Requirements: Must preserve tenant isolation and ensure organisation identifiers cannot be reused across tenants.

Audit Events: Organisation creation through the platform audit trail where invoked by Identity registration or administrative workflows.

Tests: Unit tests in the Organisation service test suite.

## Release 0.2 Planned Services: Knowledge and Controlled Information Platform

These services are approved by [SPEC-0001](../specifications/SPEC-0001-KCIP.md). They must be implemented in the Documents bounded context without changing the Sprint 2.1 domain model unless a separate architecture decision approves the change.

### Controlled Information

#### CreateControlledInformationService

Status: Planned

Release: 0.2

Purpose: Creates controlled information in draft state with classification, owner, category, access policy, and retention rule.

Primary Command: `CreateControlledInformationCommand`

Owned Aggregate: ControlledInformation.

Required Rules: Unique document number, valid classification, valid owner, tenant ownership, initial lifecycle state of Draft.

Audit Events: ControlledInformationCreated.

#### UpdateControlledInformationMetadataService

Status: Planned

Release: 0.2

Purpose: Updates mutable metadata before publication and preserves auditability of controlled changes.

Primary Command: `UpdateControlledInformationMetadataCommand`

Owned Aggregate: ControlledInformation.

Required Rules: Immutable published revision content, valid lifecycle state, optimistic concurrency, permission to edit controlled information.

Audit Events: ControlledInformationMetadataUpdated.

#### ArchiveControlledInformationService

Status: Planned

Release: 0.2

Purpose: Archives controlled information according to lifecycle and retention rules.

Primary Command: `ArchiveControlledInformationCommand`

Owned Aggregate: ControlledInformation.

Required Rules: Valid lifecycle transition, retention policy compliance, actor authorisation, tenant ownership.

Audit Events: DocumentArchived, LifecycleChanged.

### Documents and Revisions

#### CreateDocumentService

Status: Planned

Release: 0.2

Purpose: Creates a document under controlled information governance.

Primary Command: `CreateDocumentCommand`

Owned Aggregate: Document.

Required Rules: Document number uniqueness, title validation, owner validation, classification validation, tenant ownership.

Audit Events: DocumentCreated.

#### CreateRevisionService

Status: Planned

Release: 0.2

Purpose: Creates a new draft revision for a document.

Primary Command: `CreateRevisionCommand`

Owned Aggregate: Revision.

Required Rules: Valid revision numbering, immutable approved revisions, previous revision state validation, tenant ownership.

Audit Events: RevisionCreated.

#### SubmitDocumentForReviewService

Status: Planned

Release: 0.2

Purpose: Moves a draft document revision into review.

Primary Command: `SubmitDocumentForReviewCommand`

Owned Aggregates: Document, Revision, Review.

Required Rules: Required metadata complete, approver independence requirements identified, lifecycle transition from Draft to In Review.

Audit Events: DocumentSubmittedForReview, LifecycleChanged.

#### PublishDocumentService

Status: Planned

Release: 0.2

Purpose: Publishes an approved document revision and supersedes the previous published revision where applicable.

Primary Command: `PublishDocumentCommand`

Owned Aggregates: Document, Revision, ControlledInformation.

Required Rules: Approved revision required, electronic signature requirements satisfied, effective date validated, distribution control prepared.

Audit Events: DocumentPublished, LifecycleChanged.

### Approvals and Signatures

#### RecordApprovalDecisionService

Status: Planned

Release: 0.2

Purpose: Records approval or rejection for a document revision.

Primary Command: `RecordApprovalDecisionCommand`

Owned Aggregates: Approval, ElectronicSignature.

Required Rules: Approval independence, valid approver authority, authenticated actor, electronic signature capture, immutable decision record.

Audit Events: DocumentApproved, DocumentRejected, ApprovalCompleted.

#### VerifyApprovalPrerequisitesService

Status: Planned

Release: 0.2

Purpose: Validates that review, approval, classification, and evidence prerequisites are satisfied before publication.

Primary Command: `VerifyApprovalPrerequisitesCommand`

Owned Aggregates: Document, Revision, Approval.

Required Rules: Required approvals complete, rejection absent, reviewer independence satisfied, tenant ownership.

Audit Events: ApprovalPrerequisitesVerified.

### Relationships and Evidence Links

#### CreateRelationshipService

Status: Planned

Release: 0.2

Purpose: Creates a typed relationship between controlled information and standards, processes, records, risks, suppliers, audits, CAPA, training, or evidence.

Primary Command: `CreateRelationshipCommand`

Owned Aggregate: Relationship.

Required Rules: Valid relationship type, normalised typed relationship where compliance-critical, tenant ownership, target ownership validation.

Audit Events: RelationshipCreated.

#### LinkEvidenceService

Status: Planned

Release: 0.2

Purpose: Links controlled information to evidence references owned by the future Evidence bounded context.

Primary Command: `LinkEvidenceCommand`

Owned Aggregate: EvidenceLink.

Required Rules: Evidence ownership validation, tenant ownership, valid evidence relationship type, no cross-tenant links.

Audit Events: EvidenceLinked.

#### MapIsoClauseService

Status: Planned

Release: 0.2

Purpose: Maps controlled information to a specific ISO standard version and clause reference.

Primary Command: `MapIsoClauseCommand`

Owned Aggregate: ClauseMapping.

Required Rules: Valid clause reference, standard version recorded, mapping coverage type recorded, tenant ownership.

Audit Events: ClauseMappingCreated.

#### LinkProcessService

Status: Planned

Release: 0.2

Purpose: Links controlled information to a process reference without transferring process ownership to Documents.

Primary Command: `LinkProcessCommand`

Owned Aggregate: ProcessLink.

Required Rules: Valid process reference, valid process relationship, tenant ownership, future Process bounded-context compatibility.

Audit Events: ProcessLinkCreated.

### Distribution, Review, Retention, and Archive

#### CreateDistributionRequirementService

Status: Planned

Release: 0.2

Purpose: Defines who must receive, acknowledge, or act on published controlled information.

Primary Command: `CreateDistributionRequirementCommand`

Owned Data: Distribution requirement associated with controlled information.

Required Rules: Published or publishable document required, valid recipient scope, tenant ownership, no unauthorised external distribution.

Audit Events: DistributionRequirementCreated.

#### RecordAcknowledgementService

Status: Planned

Release: 0.2

Purpose: Records that a user has acknowledged controlled information.

Primary Command: `RecordAcknowledgementCommand`

Owned Data: Acknowledgement record.

Required Rules: Authenticated actor, active membership, published information, immutable acknowledgement timestamp.

Audit Events: DistributionAcknowledged.

#### SchedulePeriodicReviewService

Status: Planned

Release: 0.2

Purpose: Creates or updates the review schedule for controlled information.

Primary Command: `SchedulePeriodicReviewCommand`

Owned Aggregate: Review.

Required Rules: Valid review interval, accountable owner, tenant ownership, lifecycle compatibility.

Audit Events: PeriodicReviewScheduled.

#### ApplyRetentionRuleService

Status: Planned

Release: 0.2

Purpose: Applies retention rules to controlled records, revisions, and archived information.

Primary Command: `ApplyRetentionRuleCommand`

Owned Aggregate: RetentionRule.

Required Rules: Legal hold compatibility, retention period validation, disposal prohibition before retention expiry.

Audit Events: RetentionRuleApplied.

## Release 0.3 Planned Services: Workflow Engine

Workflow services are intentionally outside Release 0.2 implementation. KCIP may reference workflow identifiers but must not execute workflow definitions during Release 0.2.

### WorkflowDefinitionService

Status: Planned

Release: 0.3

Purpose: Creates and manages reusable workflow definitions.

Primary Commands: `CreateWorkflowDefinitionCommand`, `RetireWorkflowDefinitionCommand`.

Owned Aggregate: Workflow.

Integration Rules: Must support KCIP approval workflows without moving document lifecycle ownership out of Documents.

### WorkflowInstanceService

Status: Planned

Release: 0.3

Purpose: Starts, advances, pauses, cancels, and completes workflow instances.

Primary Commands: `StartWorkflowCommand`, `AdvanceWorkflowCommand`, `CancelWorkflowCommand`.

Owned Aggregate: Workflow.

Integration Rules: Must emit workflow events consumable by Documents, Audits, CAPA, Training, and Management Review.

### WorkflowTaskService

Status: Planned

Release: 0.3

Purpose: Manages assignments, due dates, escalation, and task completion.

Primary Commands: `AssignWorkflowTaskCommand`, `CompleteWorkflowTaskCommand`, `EscalateWorkflowTaskCommand`.

Owned Aggregate: Workflow.

Integration Rules: Must use Identity for actor authority and Notification for reminders.

## Release 0.4 Planned Services: Audit and Evidence Engine

### CaptureEvidenceService

Status: Planned

Release: 0.4

Purpose: Captures evidence records and source metadata.

Owned Aggregate: Evidence.

Integration Rules: Must support KCIP evidence links, audit evidence packs, risk controls, CAPA verification, training records, and management review inputs.

### VerifyEvidenceService

Status: Planned

Release: 0.4

Purpose: Reviews evidence authenticity, relevance, ownership, and clause support.

Owned Aggregate: Evidence.

Integration Rules: Verification decisions must be auditable and tenant-scoped.

### PlanAuditService

Status: Planned

Release: 0.4

Purpose: Creates audit plans, criteria, scope, audit team assignments, and schedule.

Owned Aggregate: Audit.

Integration Rules: Must consume controlled information, clause mappings, evidence links, process references, and auditor competence.

### RecordFindingService

Status: Planned

Release: 0.4

Purpose: Records audit findings, observations, opportunities, and nonconformities.

Owned Aggregates: Finding, CAPA.

Integration Rules: Must link findings to clauses, evidence, process references, risks, controlled information, and corrective actions.

## Release 0.5 Planned Services: AI Quality Assistant

### GenerateAiSuggestionService

Status: Planned

Release: 0.5

Purpose: Generates advisory suggestions for drafts, relationships, gap analysis, classification, and improvement opportunities.

Owned Aggregate: AI Suggestion.

Governance Rules: AI output must remain a suggestion until reviewed by an authorised human. It must not publish, archive, withdraw, dispose, or directly modify controlled information.

### ReviewAiSuggestionService

Status: Planned

Release: 0.5

Purpose: Records human acceptance, rejection, or revision of an AI suggestion.

Owned Aggregate: AI Suggestion.

Governance Rules: Accepted suggestions must enter the normal controlled-information, workflow, approval, and audit lifecycle.

## Future Application Service Areas

The following bounded contexts require service catalogs before sprint implementation begins:

- Risks: risk identification, assessment, treatment, monitoring, opportunity management, and risk review.
- Suppliers: supplier evaluation, approval, monitoring, suspension, and supplier evidence.
- Customers: customer requirements, feedback, complaints, and customer-specific obligations.
- Training: competence requirements, training assignment, completion, evidence, and effectiveness review.
- Management Review: review planning, input collection, action tracking, and review minutes approval.
- Integrated Standards: standard library management, clause versioning, integrated clause mapping, and certification readiness scoring.

## Change Control

Changes to this catalog require product governance review when they add, remove, rename, or move application services across bounded contexts. A service may not be implemented in a sprint unless it is either listed here or explicitly approved in the sprint specification.

Any future service that changes public API behavior, database schema, or bounded-context ownership must be accompanied by an approved specification update and, where architectural consequences exist, an Architecture Decision Record.
