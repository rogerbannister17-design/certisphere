# QMS Studio Architecture Rules

## 1. Architecture Is Permanent

There is no prototype phase.

Every implementation must be suitable for commercial production.

Never generate placeholder business logic.

If functionality is incomplete, implement the framework with clear extension points rather than mocks.

## 2. Multi-Tenancy Is Mandatory

Every domain object must contain:

- `OrganisationId`
- `CreatedBy`
- `UpdatedBy`
- `CreatedAt`
- `UpdatedAt`
- `DeletedAt` where soft delete is appropriate

No exceptions.

## 3. API Standards

Every endpoint must include:

- OpenAPI documentation
- Validation
- Structured error responses
- Authentication
- Authorisation
- Audit logging
- Correlation ID
- Request logging

## 4. Database Standards

Every Prisma model must include:

- UUID primary key
- Timestamps
- Tenant isolation
- Optimistic concurrency where appropriate
- Migration support
- Seed support

## 5. UI Standards

Every page must include:

- Loading state
- Error boundary
- Empty state
- Permission checks
- Responsive layout
- Accessibility conforming to WCAG 2.2 AA

## 6. Testing

Every feature requires:

- Unit tests
- Integration tests
- API tests

Do not accept untested production code.

## 7. Logging

Every service should emit structured logs.

Use a consistent logger abstraction so the implementation can later target Azure Monitor, Datadog, Grafana Loki or similar platforms without changing business logic.

## 8. Audit

Everything affecting controlled information should generate immutable audit events.

ISO 9001, ISO 27001, and ISO 14001 depend on this.

## 9. Domain Boundaries

Keep domains separate:

- Identity
- Organisation
- Documents
- Workflow
- Audits
- Evidence
- Risks
- Suppliers
- Training
- Management Review
- AI

A document service must never directly manipulate authentication data.

## 10. AI

AI must never directly modify controlled information.

AI may generate recommendations, drafts, analysis, mappings, and proposed changes. Controlled information may only be changed through this lifecycle:

1. Suggestion
2. Human Review
3. Approval
4. Workflow
5. Published

Every transition must enforce permissions, workflow rules, and immutable audit events.
