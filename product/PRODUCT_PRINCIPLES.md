# Product Principles

This document defines the permanent product principles for Certisphere. These principles govern product design, architecture, implementation, quality assurance, release planning, and acceptance decisions.

Certisphere is an AI-powered Integrated Management System for building, managing, auditing, and certifying ISO management systems. Every future release must preserve the principles below unless a formal product governance decision supersedes this document.

## 1. Controlled Information First

Every artefact managed by Certisphere shall exist as Controlled Information.

Procedures, policies, manuals, forms, registers, checklists, evidence, reports, process maps, records, and related management-system artefacts shall follow a shared lifecycle and governance model. Each controlled artefact must support ownership, classification, lifecycle state, revision history, approval history, publication control, retention, and auditability.

Certisphere shall not accept unmanaged documents as product objects. Files may be imported, attached, rendered, exported, or archived, but the authoritative product object must remain governed Controlled Information.

## 2. Evidence Before Compliance

Every compliance statement shall be traceable to objective evidence.

Evidence shall be linked to the management-system context that gives it meaning, including:

- ISO clauses.
- Processes.
- Procedures.
- Audits.
- Corrective and preventive actions.
- Risks.
- Management reviews.

The platform shall favour evidence-producing workflows over static declarations. A user should be able to move from a compliance claim to the supporting evidence, responsible owner, approval trail, related process, and relevant standard clause.

## 3. AI Assists - Humans Approve

Artificial Intelligence shall assist users by drafting, summarising, analysing, comparing, classifying, and suggesting improvements.

Artificial Intelligence shall never publish controlled information, approve documents, close CAPAs, dispose records, withdraw controlled information, or make final compliance decisions. AI recommendations shall always require review and approval by an authorised human.

Every AI action shall be auditable. AI-generated outputs must preserve source context, review status, reviewer decision, and approval linkage before becoming part of controlled information.

## 4. Multi-Standard by Design

Every feature shall be designed for multiple management systems.

Certisphere shall support ISO 9001, ISO 14001, and ISO 45001, with future expansion to additional ISO standards without architectural redesign. Domain models, workflows, clause mappings, evidence links, reporting, and dashboards must avoid assumptions that apply to only one standard.

Shared controls, processes, records, and evidence should be reusable across standards where appropriate. Customers should not be forced to duplicate equivalent evidence or controlled information for each standard.

## 5. SaaS First

Every capability shall operate within a secure multi-tenant SaaS architecture.

Organisations shall remain fully isolated. Tenant ownership, organisation-aware access control, role-based permissions, audit logging, and data-access restrictions are mandatory for all tenant-owned data.

No customer data leakage is acceptable. Cross-tenant access must fail by design at the API, application, repository, and database model levels.

## 6. Security by Default

Security shall be designed into every feature from the start.

Certisphere requires least-privilege access, encryption in transit, encryption at rest where storage is managed by the platform or cloud provider, audit logging, immutable approvals, electronic signatures, secure authentication, secure session handling, and controlled access to exports and attachments.

Security controls must be testable, observable, documented, and suitable for a commercial SaaS platform serving regulated and certification-driven customers.

## 7. API First

Every business capability shall be exposed through secure APIs.

The user interface shall consume the same APIs available to authorised integrations. APIs must enforce authentication, authorisation, tenant isolation, validation, structured errors, OpenAPI documentation, correlation IDs, request logging, audit logging for controlled actions, and consistent versioning.

Product behaviour belongs in domain and application services, not in presentation-only code.

## 8. Auditor Friendly

The platform shall reduce certification effort.

Every screen should improve traceability, every document should reduce audit preparation, and evidence should always be discoverable by authorised users. Auditors should be able to understand what is current, what changed, who approved it, when it became effective, and which evidence supports it.

Auditor access must remain controlled, scoped, time-bound where appropriate, and fully audited.

## 9. Traceability Everywhere

Users shall always be able to answer:

- Who changed it?
- When was it changed?
- Why was it changed?
- What changed?
- Which ISO clause is affected?
- Which process is affected?
- Which approval authorised it?
- Which evidence supports it?

Traceability is a product requirement, not a reporting afterthought. Relationships between controlled information, clauses, evidence, risks, audits, CAPAs, suppliers, training, competence, and management reviews must be preserved as first-class product data.

## 10. Workflow Driven

No controlled information shall bypass workflow.

Every lifecycle shall be managed through configurable workflows with defined states, permissions, assignments, decisions, audit events, and escalation paths where required. Workflow design must preserve human accountability and support review, approval, rejection, publication, withdrawal, archive, retention, and disposal controls.

Workflow implementation may evolve by release, but product behaviour must never depend on informal or unmanaged lifecycle transitions.

## 11. Version Controlled Everything

Every controlled object shall maintain:

- Revision history.
- Approval history.
- Change history.
- Electronic signatures.
- Comparison capability.
- Restore capability.

Published controlled information must be immutable. Corrections, restorations, and reissues must create governed history rather than overwriting prior evidence.

## 12. Knowledge Graph

Certisphere is not a document management system.

Certisphere is a Knowledge & Controlled Information Platform. Relationships between standards, clauses, processes, procedures, forms, registers, evidence, audits, risks, CAPAs, suppliers, competence, and management reviews are first-class platform objects.

The product shall support traceability, impact analysis, certification readiness, and continual improvement through these relationships.

## 13. User Experience

The product experience shall be professional, fast, simple, consistent, accessible, and require minimal training.

User interfaces must support the seriousness of regulated management-system work without making routine tasks slow or difficult. Accessibility, responsive layout, clear state handling, and permission-aware workflows are product requirements.

## 14. Performance

The platform shall remain responsive with:

- Thousands of organisations.
- Millions of controlled documents.
- Millions of evidence records.
- Hundreds of concurrent auditors.

Performance requirements must be considered during domain design, database modelling, API design, search design, file handling, reporting, and background processing. Features that create long-running work must use observable asynchronous processing where appropriate.

## 15. Commercial Quality

Every implementation shall be suitable for production deployment.

Temporary solutions, prototype code, experimental product behaviour, developer shortcuts, hard-coded business values, incomplete implementations, and undocumented feature behaviour shall not be accepted into the main product.

Commercial quality means features are secure, tested, observable, documented, supportable, accessible, auditable, and aligned with Certisphere's architecture and product governance.
