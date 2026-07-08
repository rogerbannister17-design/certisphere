# Product Backlog

This backlog governs known product work from Release 0.2 onward. It uses MoSCoW priority and should be refined during release planning.

## Status Definitions

- Proposed: identified and awaiting refinement.
- Ready: sufficiently defined for sprint planning.
- In Progress: actively being implemented.
- Blocked: cannot proceed until a dependency is resolved.
- Done: accepted against release criteria.

## Must Have

Release 0.2 planning is complete in [SPEC-0001: Knowledge & Controlled Information Platform](../specifications/SPEC-0001-KCIP.md). Release 0.1.3 refined the specification after engineering review. Sprint 2.1 domain implementation is complete. Sprint 2.2 persistence foundation is complete. Sprint 2.3 remains pending explicit authorisation.

| Epic                   | Release | Sprint | Priority  | Status   | Work Item                                                                                                          |
| ---------------------- | ------- | ------ | --------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| Controlled Information | 0.2     | 2.1    | Must Have | Done     | Define controlled information types for policies, procedures, forms, registers, checklists, records, and evidence. |
| Controlled Information | 0.2     | 2.1    | Must Have | Done     | Implement draft, review, approval, published, superseded, and archived lifecycle.                                  |
| Controlled Information | 0.2     | 2.1    | Must Have | Done     | Add ownership, process mapping, ISO clause mapping, and retention metadata.                                        |
| Controlled Information | 0.2     | 2.1    | Must Have | Done     | Define approval independence, distribution control, generated records, ISO 45001 compatibility, and typed links.   |
| Controlled Information | 0.2     | 2.2    | Must Have | Done     | Implement KCIP Prisma persistence models, migrations, repository adapters, seed data, and rollback scripts.        |
| Controlled Information | 0.2     | 2.3    | Must Have | Ready    | Add immutable audit events for create, update, approve, publish, archive, and restore actions.                     |
| Search & Knowledge     | 0.2     | 2.7    | Must Have | Ready    | Provide searchable controlled information repository with tenant isolation and typed relationship projections.     |
| Workflow               | 0.3     | 0.3.1  | Must Have | Proposed | Create reusable workflow definitions and workflow instances.                                                       |
| Workflow               | 0.3     | 0.3.1  | Must Have | Proposed | Implement review and approval workflow for controlled information.                                                 |
| Workflow               | 0.3     | 0.3.2  | Must Have | Proposed | Add task assignment, due dates, status tracking, and escalation state.                                             |
| Audit & Evidence       | 0.4     | 0.4.1  | Must Have | Proposed | Create audit programme, audit plan, audit checklist, and audit execution models.                                   |
| Audit & Evidence       | 0.4     | 0.4.1  | Must Have | Proposed | Capture evidence against audit questions, ISO clauses, processes, and findings.                                    |
| CAPA                   | 0.4     | 0.4.2  | Must Have | Proposed | Implement corrective action lifecycle with root cause, action plan, verification, and closure.                     |
| AI Governance          | 0.5     | 0.5.1  | Must Have | Proposed | Create AI suggestion queue with human review, rejection, revision, and approval.                                   |
| AI Governance          | 0.5     | 0.5.1  | Must Have | Proposed | Enforce that AI cannot directly modify controlled information.                                                     |
| Integrated Standards   | 0.6     | 0.6.1  | Must Have | Proposed | Add ISO standard and ISO clause libraries for ISO 9001, ISO 14001, and ISO 27001.                                  |
| Commercial Launch      | 1.0     | 1.0.1  | Must Have | Proposed | Complete production deployment, monitoring, backup, and recovery readiness.                                        |

## Should Have

| Epic                   | Release | Sprint | Priority    | Status   | Work Item                                                                 |
| ---------------------- | ------- | ------ | ----------- | -------- | ------------------------------------------------------------------------- |
| Controlled Information | 0.2     | 2.4    | Should Have | Ready    | Add document templates for common ISO 9001 management system artefacts.   |
| Controlled Information | 0.2     | 2.9    | Should Have | Ready    | Add governed controlled information export for PDF and Word.              |
| Workflow               | 0.3     | 0.3.3  | Should Have | Proposed | Add workflow reminders and overdue notifications.                         |
| Audit & Evidence       | 0.4     | 0.4.2  | Should Have | Proposed | Add audit report generation with findings, evidence, and clause coverage. |
| Risk                   | 0.4     | 0.4.3  | Should Have | Proposed | Link risks, opportunities, findings, and corrective actions.              |
| AI Assistant           | 0.5     | 0.5.2  | Should Have | Proposed | Provide AI-assisted gap analysis against selected ISO clauses.            |
| Integrated Standards   | 0.6     | 0.6.2  | Should Have | Proposed | Add shared evidence mapping across multiple standards.                    |
| Launch Readiness       | 1.0     | 1.0.2  | Should Have | Proposed | Add customer onboarding checklists and support operations dashboards.     |

## Could Have

| Epic                 | Release | Sprint | Priority   | Status   | Work Item                                                                  |
| -------------------- | ------- | ------ | ---------- | -------- | -------------------------------------------------------------------------- |
| Collaboration        | 0.2     | 2.4    | Could Have | Ready    | Add controlled comments and review discussions.                            |
| Workflow             | 0.3     | 0.3.4  | Could Have | Proposed | Add configurable approval matrices by role, process, and information type. |
| Audit & Evidence     | 0.4     | 0.4.4  | Could Have | Proposed | Add auditor offline evidence pack export.                                  |
| AI Assistant         | 0.5     | 0.5.3  | Could Have | Proposed | Add AI-assisted improvement suggestion summaries for management review.    |
| Integrated Standards | 0.6     | 0.6.3  | Could Have | Proposed | Add cross-standard maturity scoring.                                       |
| Commercial           | 1.0     | 1.0.3  | Could Have | Proposed | Add product usage analytics for customer success.                          |

## Won't Have Yet

| Epic                   | Release | Sprint | Priority       | Status   | Work Item                                                            |
| ---------------------- | ------- | ------ | -------------- | -------- | -------------------------------------------------------------------- |
| Marketplace            | Later   | Later  | Won't Have Yet | Proposed | Third-party template marketplace.                                    |
| External Audit Network | Later   | Later  | Won't Have Yet | Proposed | Auditor marketplace and certification body scheduling exchange.      |
| Native Mobile Apps     | Later   | Later  | Won't Have Yet | Proposed | Native iOS and Android applications outside responsive web coverage. |
| Advanced Integrations  | Later   | Later  | Won't Have Yet | Proposed | ERP, HRIS, GRC, and ticketing system integrations beyond core APIs.  |
| Custom AI Models       | Later   | Later  | Won't Have Yet | Proposed | Customer-specific model training.                                    |

## Cross-release Dependencies

- Release 0.2 depends on the Identity and Organisation foundation from Release 0.1.
- Release 0.3 depends on controlled information lifecycle states.
- Release 0.4 depends on workflow assignment and evidence storage.
- Release 0.5 depends on controlled information, workflow, audit trails, and security review.
- Release 0.6 depends on mature domain models for ISO standards, clauses, evidence, risk, audit, and management review.
- Release 1.0 depends on runtime validation, production deployment, monitoring, incident management, support readiness, and commercial operations.
