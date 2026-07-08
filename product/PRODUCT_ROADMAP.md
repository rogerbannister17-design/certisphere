# Product Roadmap

This roadmap is the governing product plan for Certisphere. It should be reviewed at every release planning cycle and updated only through product governance.

## Release 0.1: Foundation

Status: COMPLETE

### Objectives

- Establish the commercial SaaS foundation.
- Create the monorepo, API gateway, web application shell, database foundation, branding, Identity, Organisation, and validation baseline.
- Define permanent engineering and product governance.

### Major Features

- Turborepo and pnpm workspace.
- Next.js customer portal shell.
- NestJS API gateway.
- Prisma and PostgreSQL foundation.
- Certisphere branding.
- Identity and Organisation bounded contexts.
- JWT authentication, refresh tokens, RBAC, invitations, and audit-event persistence.
- Development environment verification scripts.

### Success Criteria

- Build, lint, typecheck, tests, Prisma generation, Prisma validation, and high-severity audit gate pass.
- Docker/PostgreSQL runtime validation is ready to run on a suitable workstation or CI runner.
- Product governance documents exist in `/product`.

### Dependencies

- Docker-enabled development workstation or GitLab CI runner for runtime verification.
- PostgreSQL 16 for migration execution and rollback validation.

## Release 0.2: Knowledge & Controlled Information Platform

Status: PLANNING COMPLETE

Specification: [SPEC-0001: Knowledge & Controlled Information Platform](../specifications/SPEC-0001-KCIP.md)

### Objectives

- Establish the controlled information foundation for policies, procedures, forms, registers, records, checklists, and evidence.
- Create governance for ownership, approval, publication, revision, retention, and audit trail.

### Major Features

- Controlled information model.
- Document classification and metadata.
- Draft, review, approval, published, archived, and superseded states.
- Revision history and immutable audit events.
- Searchable knowledge repository.
- ISO clause mapping.

### Success Criteria

- Controlled information can be created, reviewed, approved, published, revised, and archived.
- Published information is separated from drafts.
- Audit events exist for every controlled change.
- Users can locate controlled information by process, owner, type, and ISO clause.

### Dependencies

- Identity and Organisation access control.
- PostgreSQL migrations verified.
- Storage and indexing design.
- Runtime verification environment for Docker and PostgreSQL migration validation.

## Release 0.3: Workflow Engine

### Objectives

- Provide reusable workflow orchestration for reviews, approvals, audits, CAPA, training, and management review actions.
- Enforce human approval for controlled changes and AI suggestions.

### Major Features

- Workflow definitions and instances.
- Assignment, due dates, escalation, and reminders.
- Approval steps and rejection handling.
- Workflow audit history.
- Integration with controlled information.

### Success Criteria

- Workflows can be configured and executed for document review and approval.
- Tasks are assigned to users with due dates and status.
- Approvals are auditable and permission-controlled.

### Dependencies

- Controlled information lifecycle.
- Identity permissions and organisation membership.
- Notification service.

## Release 0.4: Audit & Evidence Engine

### Objectives

- Support audit planning, audit execution, evidence capture, findings, corrective actions, and certification readiness.

### Major Features

- Audit programmes and audit plans.
- Evidence collection and traceability.
- Findings, nonconformities, observations, and opportunities for improvement.
- CAPA workflow integration.
- Audit reports and dashboards.

### Success Criteria

- Auditors can plan and execute audits against ISO clauses and internal processes.
- Findings can be raised, assigned, corrected, verified, and closed.
- Evidence is linked to audits, clauses, processes, risks, and controlled information.

### Dependencies

- Workflow engine.
- Controlled information and evidence storage.
- Reporting foundation.

## Release 0.5: AI Quality Assistant

### Objectives

- Introduce governed AI assistance for drafting, gap analysis, improvement suggestions, and audit preparation.

### Major Features

- AI suggestion queue.
- Human review and approval of AI suggestions.
- Controlled prompt and context boundaries.
- Gap analysis against ISO clauses.
- Drafting assistance for procedures, checklists, and audit preparation.

### Success Criteria

- AI cannot directly modify controlled information.
- Every AI suggestion is reviewed, accepted, rejected, or revised by an authorised human.
- AI-generated recommendations are traceable to source context and reviewer decisions.

### Dependencies

- Controlled information platform.
- Workflow engine.
- Audit and evidence model.
- Security and privacy review.

## Release 0.6: Integrated Management Systems

### Objectives

- Expand Certisphere from single-standard support into integrated multi-standard management systems.

### Major Features

- ISO 9001, ISO 14001, and ISO 27001 clause libraries.
- Clause-to-process mapping.
- Shared controls and evidence across standards.
- Integrated risk, objectives, audit, and management review views.
- Multi-standard certification readiness dashboard.

### Success Criteria

- Organisations can manage multiple ISO standards without duplicating evidence and controls.
- Shared clauses, processes, and records are visible across standards.
- Management review can report on the integrated system.

### Dependencies

- Domain model maturity for clauses, risks, evidence, audits, and management review.
- Reporting and analytics foundation.

## Release 1.0: Commercial Launch

### Objectives

- Launch Certisphere as a supported commercial SaaS product.
- Meet operational, security, onboarding, support, and billing requirements.

### Major Features

- Production Azure deployment.
- Tenant onboarding and administration.
- Billing and subscription operations.
- Support and incident processes.
- Security hardening and monitoring.
- Product analytics and customer success reporting.

### Success Criteria

- First commercial customers can be onboarded and supported.
- Production monitoring, backup, recovery, and incident procedures are operational.
- Security review and release readiness gates pass.
- Customer documentation, support processes, and commercial terms are ready.

### Dependencies

- Completion of Releases 0.2 through 0.6.
- Runtime validation, CI/CD, operational monitoring, security review, and support readiness.
