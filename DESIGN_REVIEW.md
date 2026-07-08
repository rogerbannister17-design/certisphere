# Certisphere Release 0.2 Engineering Design Review

Review Date: 2026-07-08

Reviewed Specification: [SPEC-0001: Knowledge & Controlled Information Platform](./specifications/SPEC-0001-KCIP.md)

Reference Documents:

- [Product Vision](./product/PRODUCT_VISION.md)
- [Product Roadmap](./product/PRODUCT_ROADMAP.md)
- [Product Backlog](./product/BACKLOG.md)
- [Architecture Decisions](./product/ARCHITECTURE_DECISIONS.md)
- [Domain Model](./product/DOMAIN_MODEL.md)
- [Architecture Rules](./.codex/ARCHITECTURE_RULES.md)

## Executive Summary

SPEC-0001 establishes a strong product and architectural direction for Certisphere's Knowledge & Controlled Information Platform. It is consistent with the product vision, ADR-008, ADR-009, and ADR-010, and it correctly treats controlled information as a governed business domain rather than a file repository.

The design is not yet ready for Sprint 2.1 implementation. The specification provides broad coverage, but several compliance-critical details remain underspecified: ISO 45001 readiness, document distribution and acknowledgement, records generated from forms/checklists/registers, standard versioning, approval independence, periodic review, effective dates, cross-tenant organisation context, relationship normalisation, and the boundary between Release 0.2 approval logic and the Release 0.3 workflow engine.

Implementation Readiness Score: 78%

Recommendation: Requires Specification Changes

## Strengths

- Aligns with Certisphere's mission to build, manage, and certify ISO management systems in one platform.
- Correctly models controlled information as a domain capability with ownership, classification, lifecycle, revisions, approvals, retention, and auditability.
- Maintains multi-tenant SaaS intent by requiring organisation scope, RBAC, access policies, and tenant-aware database columns.
- Preserves AI governance: AI suggestions remain advisory and cannot directly modify controlled information.
- Supports ISO 9001 document control expectations through approval, publication, revision history, retention, and traceability.
- Provides useful lifecycle, relationship, architecture, and state diagrams in Mermaid.
- Defines REST API contracts as design descriptions only, which is appropriate for the planning phase.
- Recognises future integration with Workflow, Evidence, Audit, and AI domains without implementing those domains prematurely.
- Defines immutability for published revisions, approval history, electronic signatures, and audit events.
- Includes performance targets and index categories that are directionally suitable for early SaaS scale.

## Weaknesses

- ISO 45001 compatibility is not explicit. The spec mentions ISO 9001, ISO 14001, ISO 27001, and future standards, but it does not call out occupational health and safety concepts such as hazards, incidents, worker consultation, emergency preparedness, compliance obligations, and operational controls.
- The design does not distinguish clearly enough between controlled document templates, completed records, form responses, checklist executions, and register entries.
- Distribution control is missing as a first-class capability. Published controlled information usually requires distribution lists, read acknowledgement, effective date control, and withdrawal communication.
- Approval independence rules are not specified. For ISO-compatible control, the spec should state whether authors may review or approve their own work, and how conflicts of interest are prevented.
- Periodic review is referenced only as a future extension in some entities. For controlled information, scheduled review should be a core rule from Release 0.2.
- The boundary between KCIP approval handling and the future Workflow Engine is ambiguous. Sprint 2.6 plans an Approval Engine, while Release 0.3 owns workflow orchestration. Without sharper boundaries, implementation may accidentally build workflow features inside Documents.
- API organisation context is underspecified for users with multiple organisation memberships. Existing platform direction uses organisation-aware access control, but the KCIP endpoints do not state whether the organisation comes from JWT claims, an organisation header, URL scope, or explicit request fields.
- The relationship model risks becoming a polymorphic association table that is difficult to normalise, constrain, index, and enforce with Prisma.
- Database design names tables but does not define enough cardinality, ownership, uniqueness, state constraints, or deletion/retention behaviour to safely start migrations.
- Security rules do not yet cover external auditor access expiry, export restrictions by classification, attachment malware scan result retention, or object-storage access patterns.

## Recommended Changes

1. Add an explicit ISO 45001 compatibility section covering hazards, incidents, consultation and participation, emergency preparedness, operational controls, compliance obligations, competence, training, supplier/contractor control, and management review inputs.
2. Add first-class entities for `Distribution`, `DistributionAcknowledgement`, `EffectiveDate`, `PeriodicReviewSchedule`, `ReviewAssignment`, `DocumentFamily`, `NumberingRule`, `StorageObject`, `MalwareScanResult`, `ImportJob`, and `MigrationReview`.
3. Clarify records modelling by separating `Template`, `Form`, `FormResponse`, `Checklist`, `ChecklistExecution`, `Register`, `RegisterEntry`, `Record`, and `Evidence`.
4. Define approval business rules: no self-approval where independence is required, approver authority captured at decision time, delegation rules, rejection handling, approval expiry, reapproval triggers, and emergency-change controls.
5. Define lifecycle transition guards for every state transition, including required permissions, audit event type, signature requirements, retained data, and whether the transition is reversible.
6. Specify organisation context for every API request, including the behaviour for multi-organisation users and cross-tenant denial tests.
7. Replace or constrain polymorphic relationships with typed join tables for high-value links such as clause mappings, process links, evidence links, training links, risk links, audit links, and CAPA links.
8. Add standard versioning and certification scope to clause mapping so ISO clauses can be mapped against ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, ISO 27001:2022, and future revisions without ambiguity.
9. Add distribution and acknowledgement workflows for published documents, including effective date, target audience, acknowledgement due date, overdue handling, and audit evidence.
10. Clarify Release 0.2 versus Release 0.3 boundaries by defining a minimal approval-state capability in KCIP and explicitly deferring task routing, escalation, reminders, workflow templates, and workflow execution to Release 0.3.
11. Add database design notes for optimistic concurrency, soft delete exceptions, immutable revision storage, legal hold, retention disposal approval, and row-level tenant indexing.
12. Add API design notes for pagination, filtering, sorting, idempotency on state-changing commands, structured error codes, audit correlation, rate limiting, and OpenAPI tag conventions.
13. Add explicit non-functional requirements for search indexing, attachment storage, background jobs, event publication, and export job processing.
14. Add migration acceptance criteria for Word ingestion accuracy, original-file preservation, checksum verification, extraction confidence, human correction, rollback, and audit history.

## High Risk Items

| Area                      | Risk                                                                                      | Impact                                                                          | Recommended Action                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Workflow boundary         | Approval Engine in Sprint 2.6 may duplicate or conflict with Release 0.3 Workflow Engine. | Future rework, inconsistent approval behaviour, difficult audit trail.          | Define minimal KCIP approval state machine and defer routing/escalation/task orchestration to Workflow.          |
| Relationship model        | Generic relationships may not enforce referential integrity or performant reporting.      | Weak traceability, hard Prisma constraints, complex queries.                    | Use typed relationship tables for core compliance links and reserve generic graph links for low-risk references. |
| Records model             | Documents, forms, registers, checklists, records, and evidence are not separated enough.  | Incorrect ISO record control, poor evidence traceability, migration complexity. | Add explicit record-producing entities and lifecycle rules.                                                      |
| Approval independence     | No rule prevents author self-review or self-approval.                                     | Certification risk and weak governance evidence.                                | Add independence, delegation, authority, and conflict-of-interest rules.                                         |
| Multi-organisation access | API organisation context for multi-org users is not specified.                            | Cross-tenant leakage risk or ambiguous authorisation.                           | Standardise organisation context in JWT claims plus explicit selected organisation validation.                   |
| ISO 45001 readiness       | OH&S concepts are absent from the release specification.                                  | Later rework for ISO 45001 support.                                             | Add 45001 compatibility model before Sprint 2.1.                                                                 |

## Medium Risk Items

| Area                 | Risk                                                                                            | Impact                                                                     | Recommended Action                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Distribution control | Published documents do not include distribution or acknowledgement.                             | Weak proof that affected users received current information.               | Add distribution list and acknowledgement entities.                              |
| Effective dates      | Publication does not separate approval date, publish date, and effective date.                  | Operational confusion and audit ambiguity.                                 | Add effective-from and effective-until rules.                                    |
| Periodic review      | Periodic review is treated as future extension in places.                                       | Controlled information may become stale without scheduled review evidence. | Make periodic review core for Release 0.2.                                       |
| Standard versioning  | Clause mapping does not explicitly include standard edition/version.                            | Ambiguous multi-standard reporting.                                        | Add standard version and clause revision references.                             |
| Attachment security  | Attachment checks are listed but not modelled as durable results.                               | Weak security auditability.                                                | Add malware scan and storage object entities.                                    |
| Search performance   | Full-text search is named but indexing/update strategy is not defined.                          | Slow tenant-scoped search at scale.                                        | Define search projection, update events, and indexing strategy.                  |
| Export governance    | PDF/Word export is in backlog but export permissions and watermarking are not specified.        | Data leakage through exports.                                              | Define export audit, classification handling, and external sharing restrictions. |
| Retention disposal   | Disposal approval is mentioned but legal-hold authority and disposal evidence are not detailed. | Regulatory and audit risk.                                                 | Add disposal certificate/audit event requirements and legal-hold ownership.      |

## Low Risk Items

| Area        | Risk                                                                                                          | Impact                          | Recommended Action                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Naming      | The specification uses both `Review` and `In Review`, and both `Obsolete` and `Superseded`.                   | Minor implementation confusion. | Standardise lifecycle enum names before coding.                                         |
| API paths   | Endpoint list does not yet include template creation, clause mapping management, or evidence link management. | Sprint planning ambiguity.      | Expand endpoint catalogue after entity gaps are resolved.                               |
| Role names  | Permission matrix includes broad roles but not site/process-scoped roles.                                     | Future permissions refinement.  | Add role-scope notes for later ABAC/policy support.                                     |
| Metrics     | Performance targets are useful but lack measurement method.                                                   | Test planning gap.              | Add benchmark data shape and acceptance checks.                                         |
| Terminology | KCIP is introduced as Documents and Knowledge, while repo bounded context is `documents`.                     | Minor boundary ambiguity.       | Confirm whether KCIP lives inside `services/documents` or a dedicated knowledge module. |

## Missing Entities

- Distribution
- Distribution Acknowledgement
- Distribution Group
- Effective Date
- Periodic Review Schedule
- Review Assignment
- Change Request
- Emergency Change
- Document Family
- Numbering Rule
- Standard Version
- Certification Scope
- Site or Location
- Department or Function
- Compliance Obligation
- Hazard
- Incident
- Environmental Aspect
- OH&S Operational Control
- Form Response
- Checklist Execution
- Register Entry
- Storage Object
- Malware Scan Result
- Import Job
- Migration Review
- Export Job
- Export Package
- Disposal Approval
- Legal Hold

## Missing Relationships

- Controlled Information to Distribution and Distribution Acknowledgement.
- Controlled Information to Effective Date and Periodic Review Schedule.
- Revision to exact Standard Version and ISO Clause version.
- Procedure to Training Requirement and Competence Requirement.
- Procedure to Hazard, Environmental Aspect, and Compliance Obligation.
- Form to Form Response and generated Record.
- Checklist to Checklist Execution and generated Evidence.
- Register to Register Entry and generated Record.
- Access Policy to Organisation Membership, Role, site, department, and external-auditor assignment.
- Attachment to Storage Object and Malware Scan Result.
- Export Package to Revision, Classification, requester, recipient, and audit event.
- Legal Hold to Retention Rule, Archive, Disposal Approval, and authorised owner.

## Missing Business Rules

- Authors cannot approve their own controlled changes where independent approval is required.
- Reviewers and approvers must hold active organisation membership and required permission at the exact decision time.
- Published revisions are immutable; corrections require a new revision or documented correction event.
- Approval must bind to the exact revision content hash, not only the revision identifier.
- Effective date may be later than publication date and must control operational availability.
- Withdrawal must require a reason, approval, replacement assessment, and affected-document impact review.
- Supersession must update current revision atomically and preserve previous published revision.
- Periodic review must generate due, overdue, completed, and escalated states.
- External auditor access must be time-bounded, scoped, revocable, and audited.
- Export of restricted classifications must require explicit permission and audit event.
- Disposal must be blocked by active legal hold, open audit, open CAPA, active certification evidence need, or retention period.
- AI suggestions must preserve source context, prompt metadata, model identity where applicable, reviewer decision, and acceptance rationale.

## Missing Workflows

- Document distribution and acknowledgement after publication.
- Periodic review scheduling, assignment, completion, and overdue handling.
- Emergency change with retrospective approval.
- Controlled withdrawal with replacement and impact assessment.
- Legal hold application and release.
- Retention disposal approval and disposal evidence creation.
- External auditor access grant, expiry, and revocation.
- Word import review, correction, approval, and rollback.
- Export request, approval, package generation, and access expiry.
- AI suggestion triage, acceptance, rejection, revision, and audit linkage.

## Future Technical Risks

- Polymorphic relationships can become a reporting and referential-integrity bottleneck.
- Search indexing may require asynchronous projections, making transactional consistency and freshness guarantees important.
- Attachment storage and document rendering will need object-storage abstractions before Azure deployment.
- Large Word imports and PDF/Word exports may need background jobs, retries, and status APIs.
- Permission checks may evolve from RBAC to policy-based or attribute-based access control as site, process, and external auditor scopes grow.
- Multi-standard clause mapping may require standard edition/versioning earlier than planned.
- If approval logic is implemented too deeply in KCIP, the Workflow Engine may inherit duplicated state and migration debt.
- ISO 45001 and ISO 14001 support will require compliance obligations, hazards/aspects, emergency preparedness, and operational controls that are not yet first-class.

## Potential Implementation Conflicts

- The repository has domain folders such as `services/documents`, `services/workflow`, `services/evidence`, and `services/ai`. SPEC-0001 should state whether KCIP is implemented under `services/documents` or split into a dedicated knowledge module to avoid boundary drift.
- Architecture rules require every domain object to include tenant and audit metadata. SPEC-0001 states common columns for tenant-owned tables, but every entity definition should explicitly inherit that rule.
- Existing API patterns use NestJS guards, OpenAPI decorators, JWT authentication, and organisation access checks. KCIP API contracts should define organisation selection consistently with those patterns before controller work begins.
- Release 0.2 backlog marks search as Sprint 2.3, while the implementation plan places API in Sprint 2.3 and relationship/evidence links in Sprint 2.7. Search may depend on relationships and section content, so sprint sequencing needs refinement.
- Release 0.6 roadmap currently names ISO 9001, ISO 14001, and ISO 27001, while this review scope includes ISO 45001. Product governance should decide whether ISO 45001 is formally part of the roadmap before implementation decisions harden.

## Implementation Readiness Score

Score: 78%

Rationale:

- Architecture alignment: 85%
- Multi-tenant SaaS design: 80%
- ISO 9001 compatibility: 82%
- ISO 14001 compatibility: 72%
- ISO 45001 compatibility: 58%
- Security and auditability: 78%
- API readiness: 74%
- Database readiness: 68%
- Workflow integration readiness: 70%
- Evidence traceability readiness: 78%
- AI governance readiness: 86%

The score is high enough to confirm that the product direction is sound, but below the threshold for starting Sprint 2.1 because several foundational modelling decisions would affect domain entities, migrations, API contracts, and workflow boundaries.

## Clear Recommendation

Requires Specification Changes

Do not begin Sprint 2.1 until the high-risk items are resolved in SPEC-0001. The recommended next step is a specification revision that closes the approval independence, record modelling, distribution control, ISO 45001 compatibility, organisation context, relationship normalisation, and Release 0.2 versus Release 0.3 workflow-boundary gaps.
