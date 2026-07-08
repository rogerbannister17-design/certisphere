# Domain Model

This document defines the governing business domain model for Certisphere. It is a product source of truth and should guide future database, API, workflow, and user-interface design.

## Domain Principles

- Every tenant-owned entity belongs to an Organisation.
- Controlled information requires ownership, revision control, approval, publication status, and audit history.
- Evidence must remain traceable to its source, owner, process, audit, clause, risk, or workflow.
- AI may create suggestions, but approved users control lifecycle transitions.
- Relationships between entities must support certification readiness and management review.

## Entity Catalogue

### Organisation

Purpose: Represents a tenant using Certisphere to operate one or more management systems.

Relationships: Owns users, roles, permissions, controlled information, workflows, audits, evidence, risks, suppliers, training records, and management reviews.

Lifecycle: Registered, configured, active, suspended, archived.

Future Extensions: Billing account, subscription plan, sites, legal entities, departments, certification scope.

### User

Purpose: Represents a person who authenticates and performs work in Certisphere.

Relationships: Belongs to one or more organisations through memberships; receives roles, permissions, workflow tasks, audit assignments, training, and approvals.

Lifecycle: Invited, active, suspended, disabled, deleted.

Future Extensions: MFA factors, delegated authority, auditor accreditation, consultant profile.

### Role

Purpose: Groups permissions into a manageable access profile.

Relationships: Assigned to users within an organisation; contains permissions.

Lifecycle: Draft, active, retired.

Future Extensions: Role templates, standard-specific roles, site-specific roles.

### Permission

Purpose: Defines an atomic authorisation capability.

Relationships: Belongs to roles and controls access to actions across bounded contexts.

Lifecycle: Defined, active, deprecated.

Future Extensions: Policy-based access rules, contextual permissions, approval limits.

### Process

Purpose: Represents a business process within the management system.

Relationships: Owns controlled information, risks, objectives, evidence, audits, training requirements, and performance measures.

Lifecycle: Draft, approved, active, under review, retired.

Future Extensions: Process maps, inputs and outputs, KPIs, process owners, linked assets.

### Controlled Information

Purpose: Governs information that must be controlled for conformance, certification, or operational integrity.

Relationships: Parent category for procedures, policies, forms, registers, checklists, records, and evidence; linked to processes, clauses, workflows, approvals, and revisions.

Lifecycle: Draft, in review, approved, published, superseded, archived.

Future Extensions: Retention schedules, distribution lists, external sharing, legal hold.

### Procedure

Purpose: Defines how a process or activity is performed.

Relationships: Linked to process owners, ISO clauses, forms, records, training, audits, and revisions.

Lifecycle: Draft, reviewed, approved, published, revised, retired.

Future Extensions: Step-level controls, embedded training, AI-assisted improvement suggestions.

### Policy

Purpose: Defines organisational intent, commitment, and governance direction.

Relationships: Linked to standards, clauses, management review, objectives, and controlled communication.

Lifecycle: Draft, approved, published, reviewed, retired.

Future Extensions: Executive attestation, scheduled policy review, external publication.

### Form

Purpose: Captures structured information needed to operate or evidence a process.

Relationships: Generates records; linked to procedures, workflows, evidence, and retention rules.

Lifecycle: Draft, approved, published, revised, retired.

Future Extensions: Dynamic forms, validation rules, workflow-triggered forms.

### Register

Purpose: Maintains a controlled list of related items such as risks, suppliers, assets, findings, or legal obligations.

Relationships: Contains records and links to processes, owners, evidence, and review schedules.

Lifecycle: Created, active, reviewed, archived.

Future Extensions: Register templates, configurable columns, import/export controls.

### Checklist

Purpose: Provides a repeatable set of checks for audits, inspections, reviews, or operational tasks.

Relationships: Linked to audits, procedures, clauses, records, and evidence.

Lifecycle: Draft, approved, published, used, revised, retired.

Future Extensions: Scoring, conditional questions, mobile execution.

### Record

Purpose: Captures objective evidence that an activity occurred or a requirement was met.

Relationships: Generated from forms, workflows, audits, training, reviews, suppliers, or processes; may become evidence.

Lifecycle: Created, approved where required, retained, archived, disposed.

Future Extensions: Retention automation, immutable records, external evidence ingestion.

### Evidence

Purpose: Demonstrates conformance, effectiveness, completion, or factual support.

Relationships: Linked to audits, clauses, processes, risks, CAPA, suppliers, training, and management review.

Lifecycle: Captured, classified, reviewed, accepted, superseded, retained.

Future Extensions: Evidence packs, auditor sharing, authenticity checks.

### Audit

Purpose: Evaluates conformance and effectiveness against criteria.

Relationships: Uses checklists, clauses, evidence, auditors, auditees, findings, and CAPA.

Lifecycle: Planned, scheduled, in progress, reported, closed.

Future Extensions: Audit programme optimisation, auditor competence matching, external audit portal.

### Finding

Purpose: Records audit outcomes such as nonconformities, observations, or improvement opportunities.

Relationships: Linked to audits, evidence, clauses, processes, risks, and CAPA.

Lifecycle: Raised, classified, assigned, investigated, corrected, verified, closed.

Future Extensions: Severity scoring, recurrence analysis, trend reporting.

### CAPA

Purpose: Manages corrective and preventive actions.

Relationships: Linked to findings, risks, incidents, evidence, owners, workflows, and verification records.

Lifecycle: Opened, contained, root cause analysed, action planned, implemented, verified, closed.

Future Extensions: Effectiveness reviews, recurrence detection, AI-assisted root cause suggestions.

### Risk

Purpose: Represents uncertainty that can affect objectives, processes, compliance, or performance.

Relationships: Linked to processes, controls, opportunities, findings, suppliers, assets, evidence, and management review.

Lifecycle: Identified, assessed, treated, monitored, reviewed, closed.

Future Extensions: Risk matrices, appetite thresholds, automated review schedules.

### Opportunity

Purpose: Represents a beneficial improvement or strategic positive risk.

Relationships: Linked to processes, objectives, risks, management review, CAPA, and improvement workflows.

Lifecycle: Identified, assessed, approved, implemented, reviewed, closed.

Future Extensions: Benefit tracking, prioritisation scoring, portfolio reporting.

### Supplier

Purpose: Represents an external provider that can affect management system performance.

Relationships: Linked to approvals, risks, audits, evidence, contracts, performance records, and nonconformities.

Lifecycle: Proposed, evaluated, approved, monitored, suspended, removed.

Future Extensions: Supplier portal, assessment questionnaires, certification tracking.

### Asset

Purpose: Represents equipment, systems, information assets, or resources requiring control.

Relationships: Linked to processes, risks, maintenance records, evidence, suppliers, and controls.

Lifecycle: Registered, active, maintained, reviewed, retired, disposed.

Future Extensions: Calibration, maintenance schedules, asset criticality.

### Training

Purpose: Represents planned or delivered learning required for competence.

Relationships: Linked to users, roles, procedures, processes, competence requirements, evidence, and records.

Lifecycle: Required, assigned, in progress, completed, expired, renewed.

Future Extensions: Learning content, quizzes, refresher automation, external certification evidence.

### Competence

Purpose: Represents demonstrated ability to perform a role, process, or controlled activity.

Relationships: Linked to users, roles, training, experience, evidence, audits, and approvals.

Lifecycle: Required, assessed, approved, monitored, expired, renewed.

Future Extensions: Competence matrices, assessor workflows, role-based requirements.

### Management Review

Purpose: Provides top-management review of management system suitability, adequacy, effectiveness, and improvement.

Relationships: Consumes audit results, risks, opportunities, objectives, supplier performance, CAPA, evidence, and previous actions.

Lifecycle: Planned, prepared, conducted, actions assigned, actions closed, archived.

Future Extensions: Automated review packs, agenda templates, decision tracking.

### ISO Standard

Purpose: Represents a management system standard such as ISO 9001, ISO 14001, or ISO 27001.

Relationships: Contains ISO clauses and maps to processes, controls, evidence, audits, and management reviews.

Lifecycle: Added, active, revised, superseded, retired.

Future Extensions: Standard version management, certification scope mapping.

### ISO Clause

Purpose: Represents a requirement within an ISO standard.

Relationships: Belongs to an ISO standard; maps to controlled information, evidence, audit questions, findings, and risks.

Lifecycle: Active, mapped, reviewed, superseded.

Future Extensions: Clause interpretation guidance, gap scoring, AI-assisted mapping suggestions.

### Workflow

Purpose: Orchestrates controlled tasks, reviews, approvals, corrective actions, audits, and AI suggestion handling.

Relationships: Contains tasks, approvals, assignees, due dates, controlled information, evidence, and audit events.

Lifecycle: Defined, active, instantiated, completed, cancelled, retired.

Future Extensions: Visual workflow designer, escalation rules, conditional branches.

### Approval

Purpose: Records authorised human acceptance of a controlled change, workflow step, or AI suggestion.

Relationships: Linked to users, workflow tasks, controlled information, revisions, and audit events.

Lifecycle: Requested, approved, rejected, withdrawn, superseded.

Future Extensions: Approval matrices, delegation, electronic signatures.

### Revision

Purpose: Represents a controlled version of information or a governed object.

Relationships: Linked to controlled information, approvals, publication status, previous revisions, and audit events.

Lifecycle: Drafted, reviewed, approved, published, superseded, archived.

Future Extensions: Compare revisions, rollback workflows, release notes.

### Relationship

Purpose: Represents a meaningful link between domain entities for traceability, impact analysis, and reporting.

Relationships: Connects entities such as clauses to evidence, risks to controls, findings to CAPA, and procedures to training.

Lifecycle: Proposed, active, reviewed, removed.

Future Extensions: Relationship types, impact maps, graph search, AI-assisted relationship suggestions.

## Cross-domain Traceability

Certisphere must support traceability from ISO Standard to ISO Clause, Process, Controlled Information, Workflow, Approval, Revision, Evidence, Audit, Finding, CAPA, Risk, Training, and Management Review.

This traceability is essential for certification readiness, audit preparation, continual improvement, and executive assurance.
