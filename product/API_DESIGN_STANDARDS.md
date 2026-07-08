# API Design Standards

This document defines the mandatory API design standard for Certisphere. It governs all internal and external HTTP APIs, including APIs consumed by the Certisphere web applications, integration clients, automation services, and future public developer integrations.

Related documents:

- [Product Principles](PRODUCT_PRINCIPLES.md)
- [Application Service Catalog](APPLICATION_SERVICE_CATALOG.md)
- [Domain Model](DOMAIN_MODEL.md)
- [Architecture Decisions](ARCHITECTURE_DECISIONS.md)
- [Release Policy](RELEASE_POLICY.md)

## 1. Purpose

Certisphere APIs must be secure, consistent, observable, tenant-aware, auditable, and suitable for commercial SaaS use. API contracts are product contracts. They must be designed deliberately, documented in OpenAPI, tested, and reviewed before implementation.

Every API must preserve:

- Organisation isolation.
- Authentication and authorisation.
- Input validation.
- Structured errors.
- Correlation IDs.
- Request logging.
- Audit logging for controlled or security-relevant actions.
- Backward-compatible evolution.

## 2. REST Design Principles

Certisphere APIs shall follow resource-oriented REST design.

- Resources are nouns, not verbs.
- URLs identify resources or collections.
- HTTP methods express intent.
- Request bodies carry command details for create, update, and action endpoints.
- Responses return stable, documented resource representations.
- APIs must be stateless between requests, except for explicit authentication sessions and refresh-token workflows.
- Business rules belong in application and domain services, not controllers.
- Cross-domain operations must use application services and integration ports rather than direct persistence access.

Action-style endpoints are permitted only where the action is a domain command that does not map cleanly to standard CRUD, such as submitting a revision for review, approving a document, revoking an invitation, or refreshing a session.

## 3. URI Conventions

All tenant-owned resources must be organisation-scoped unless explicitly approved as global reference data.

Preferred URI pattern:

```text
/api/v1/organisations/{organisationId}/{resource}
/api/v1/organisations/{organisationId}/{resource}/{resourceId}
```

Examples:

```text
GET /api/v1/organisations/{organisationId}/documents
POST /api/v1/organisations/{organisationId}/documents
GET /api/v1/organisations/{organisationId}/documents/{documentId}
POST /api/v1/organisations/{organisationId}/documents/{documentId}/submit-for-review
POST /api/v1/organisations/{organisationId}/documents/{documentId}/approvals
GET /api/v1/organisations/{organisationId}/audit-events
```

Global reference data may omit the organisation path when the data is not tenant-owned:

```text
GET /api/v1/iso-standards
GET /api/v1/iso-standards/{standardId}/clauses
```

URI rules:

- Use lowercase kebab-case path segments.
- Use plural nouns for collections.
- Use stable resource identifiers in path parameters.
- Do not expose database table names.
- Do not encode filtering, sorting, or pagination in path segments.
- Do not include file extensions in resource paths.
- Do not use trailing slashes.

## 4. Versioning Strategy

All public and application-facing APIs must include a major version in the URI.

```text
/api/v1
```

Versioning rules:

- Major versions may introduce breaking changes.
- Minor and patch changes must remain backward compatible.
- Additive fields are backward compatible.
- Removing fields, changing field meaning, changing enum values, changing validation semantics, or changing response status codes may be breaking.
- Deprecated endpoints must remain documented until removed in a future major version.
- Deprecation must include replacement guidance and removal timing.

The initial Certisphere API version is `v1`. Internal implementation package versions do not change API versioning.

## 5. HTTP Methods

Use HTTP methods consistently:

- `GET`: Retrieve a resource or collection. Must be safe and idempotent.
- `POST`: Create a resource or execute a domain command.
- `PUT`: Replace a complete resource representation where full replacement is supported.
- `PATCH`: Partially update mutable fields.
- `DELETE`: Delete only where permanent deletion is approved. Prefer soft delete, archive, withdraw, or revoke for controlled and auditable information.

Controlled information must not be permanently deleted through public APIs unless a formal retention and disposal workflow permits it.

## 6. Status Codes

Use standard HTTP status codes consistently:

- `200 OK`: Successful retrieval, update, command execution, or non-empty response.
- `201 Created`: Resource created. Include `Location` header where appropriate.
- `202 Accepted`: Long-running operation accepted for asynchronous processing.
- `204 No Content`: Successful command with no response body.
- `400 Bad Request`: Malformed request or invalid query syntax.
- `401 Unauthorized`: Missing or invalid authentication.
- `403 Forbidden`: Authenticated principal lacks required permission or organisation access.
- `404 Not Found`: Resource does not exist or is not visible to the principal.
- `409 Conflict`: Optimistic concurrency failure, uniqueness conflict, or invalid state conflict.
- `412 Precondition Failed`: Expected version or precondition header failed.
- `422 Unprocessable Entity`: Well-formed request fails domain validation.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected platform error.
- `503 Service Unavailable`: Dependency or runtime service unavailable.

Security-sensitive endpoints may return `404` instead of `403` when revealing resource existence would create an information disclosure risk.

## 7. Error Response Format

All error responses must use a structured JSON envelope.

```json
{
  "error": {
    "code": "DOCUMENT_INVALID_LIFECYCLE_TRANSITION",
    "message": "The requested lifecycle transition is not valid for the current document state.",
    "details": [
      {
        "field": "targetState",
        "reason": "Published documents cannot transition directly to Draft."
      }
    ],
    "correlationId": "01JZ4XR8G6Y3Y9T9CFJX3MZQ2B",
    "timestamp": "2026-07-08T12:00:00.000Z"
  }
}
```

Error rules:

- `code` must be stable, machine-readable, uppercase snake case.
- `message` must be safe for end users and must not expose secrets or internal stack traces.
- `details` is optional and must contain validation or domain-specific context only.
- `correlationId` is mandatory.
- `timestamp` must use ISO 8601 UTC format.
- Infrastructure exceptions must be mapped to approved API error codes.

## 8. Pagination

Collection endpoints must support pagination unless the collection is formally bounded and documented.

Default pagination parameters:

```text
page[size]=50
page[after]={cursor}
```

Response shape:

```json
{
  "data": [],
  "page": {
    "size": 50,
    "nextCursor": "opaque-cursor",
    "hasNextPage": true
  }
}
```

Pagination rules:

- Cursor pagination is preferred for scalable collections.
- Page size must have a documented default and maximum.
- Cursors must be opaque to clients.
- Ordering must be deterministic.
- Endpoints must not return unbounded tenant-owned collections.

## 9. Filtering

Filtering must use query parameters with explicit field names.

Examples:

```text
GET /api/v1/organisations/{organisationId}/documents?filter[state]=published
GET /api/v1/organisations/{organisationId}/documents?filter[classification]=restricted
GET /api/v1/organisations/{organisationId}/documents?filter[ownerId]={userId}
```

Filtering rules:

- Supported filters must be documented in OpenAPI.
- Unsupported filters must return `400 Bad Request`.
- Filters must preserve tenant isolation.
- Date filters must use ISO 8601.
- Enum filters must use documented enum values.
- Free-text search must use `search` or a dedicated search endpoint.

## 10. Sorting

Sorting must use the `sort` query parameter.

Examples:

```text
sort=createdAt
sort=-updatedAt
sort=title,-updatedAt
```

Sorting rules:

- Prefix descending fields with `-`.
- Supported sort fields must be documented.
- Unsupported sort fields must return `400 Bad Request`.
- Default sort order must be documented.
- Sort order must be stable when pagination is used.

## 11. Authentication

All APIs require authentication unless explicitly documented as public.

Authentication requirements:

- Use bearer JWT access tokens for authenticated API requests.
- Access tokens must be short-lived.
- Refresh tokens must be rotated and stored securely.
- Authentication must validate token signature, expiry, issuer, audience, subject, session, and selected organisation context where applicable.
- Authentication failures must return `401 Unauthorized`.
- Authentication middleware must attach a typed principal to the request context.

Public endpoints are limited to health checks, readiness checks where safe, and explicitly approved bootstrap or authentication endpoints.

## 12. Authorisation

Authorisation is mandatory for every protected endpoint.

Authorisation requirements:

- Enforce organisation membership before resource access.
- Enforce role-based permissions for actions.
- Enforce resource ownership or access policy where applicable.
- Enforce approval independence for controlled information.
- Enforce selected organisation context against route and command organisation IDs.
- Cross-tenant access must fail before repository execution.
- Repository queries must also constrain by organisation ID.

Authorisation failures must return `403 Forbidden` unless `404 Not Found` is required to avoid information disclosure.

## 13. Idempotency

Idempotency is required for APIs where client retry could create duplicate business effects.

Required idempotent operations include:

- Payment or billing commands when introduced.
- Invitation creation.
- Document publication commands.
- Approval decision submission.
- Long-running import jobs.
- External integration callbacks.

Idempotency rules:

- Use `Idempotency-Key` header for retry-safe command endpoints.
- Keys must be scoped to organisation, actor, endpoint, and request payload hash.
- Replayed requests must return the original successful response or a documented conflict.
- Idempotency records must have retention appropriate to the operation risk.

## 14. Correlation IDs

Every request must have a correlation ID.

Header:

```text
X-Correlation-Id
```

Rules:

- Accept a valid client-supplied correlation ID.
- Generate a new correlation ID when absent.
- Return the effective correlation ID in every response.
- Include correlation ID in logs, audit events, structured errors, and downstream calls.
- Reject invalid correlation ID formats only when they create logging, tracing, or security risk.

## 15. Audit Requirements

Every controlled, security-sensitive, or certification-relevant action must emit an immutable audit event.

Audit events are required for:

- Authentication success and security-relevant authentication failures.
- Session refresh, revocation, and expiry handling.
- Organisation creation and membership changes.
- Role and permission changes.
- Invitation creation, acceptance, revocation, and expiry.
- Controlled information creation, revision, approval, rejection, publication, withdrawal, archive, restore, retention, and disposal.
- Evidence capture, verification, linking, and removal of links.
- Audit plan, finding, CAPA, risk, supplier, training, and management review lifecycle changes.
- AI suggestion creation, review, acceptance, rejection, and conversion into controlled work.

Audit events must include:

- Organisation ID.
- Actor user ID where available.
- Subject resource type and ID.
- Action.
- Decision or outcome.
- Previous state and new state where applicable.
- Correlation ID.
- Timestamp.
- Source IP or client context where available.

## 16. Validation Rules

API validation must happen before application service execution where possible.

Validation requirements:

- Validate request body shape.
- Validate path and query parameters.
- Validate UUIDs and identifiers.
- Validate enum values.
- Validate string lengths and formats.
- Validate date and time formats.
- Validate pagination bounds.
- Validate idempotency key format where required.
- Reject unknown properties for command requests unless the endpoint explicitly supports extension fields.

Domain validation must remain in the domain layer. API validation must not replace domain invariants.

## 17. Naming Conventions

JSON naming:

- Use camelCase for JSON property names.
- Use uppercase snake case for stable machine-readable error codes.
- Use lowercase kebab-case for URI path segments.
- Use PascalCase for OpenAPI schema names.
- Use singular schema names for resource representations.
- Use `id` for the resource identifier and explicit names for foreign references, such as `organisationId`, `documentId`, and `revisionId`.

Date and time fields:

- Use ISO 8601 UTC strings.
- Name timestamps with `At`, such as `createdAt`, `updatedAt`, `publishedAt`, and `archivedAt`.

Boolean fields:

- Use clear affirmative names such as `isActive`, `hasNextPage`, and `requiresAcknowledgement`.

## 18. Request and Response Envelopes

Single-resource response:

```json
{
  "data": {
    "id": "resource-id"
  }
}
```

Collection response:

```json
{
  "data": [],
  "page": {
    "size": 50,
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Command response:

```json
{
  "data": {
    "id": "resource-id",
    "status": "accepted"
  }
}
```

Response rules:

- Use `data` for successful response payloads.
- Use `page` for paginated collection metadata.
- Do not mix successful data and error objects in the same response.
- Do not return secrets, password hashes, refresh token hashes, internal stack traces, or infrastructure-only fields.

## 19. OpenAPI Documentation Standards

Every endpoint must be documented in OpenAPI before release.

OpenAPI requirements:

- Operation summary and description.
- Stable `operationId`.
- Tags aligned to bounded context.
- Authentication and authorisation requirements.
- Required permissions.
- Path parameters, query parameters, headers, and request body schemas.
- Response schemas for every documented status code.
- Structured error response schemas.
- Pagination, filtering, and sorting parameters for collection endpoints.
- Correlation ID header in request and response documentation.
- Idempotency key header for idempotent command endpoints.
- Examples for successful requests, validation errors, authorisation failures, and domain conflicts.
- Deprecation markers and replacement guidance for deprecated endpoints.

Schema requirements:

- Use explicit required fields.
- Define enum values.
- Define string formats and length constraints.
- Define nullable fields deliberately.
- Avoid ambiguous free-form objects unless formally approved as extension metadata.

## 20. Security Headers and Transport

API gateways and HTTP services must enforce secure transport and security headers appropriate to the deployment surface.

Requirements:

- HTTPS only outside local development.
- Secure CORS policy per environment.
- No wildcard credentials-enabled CORS.
- Security headers for browser-consumed APIs.
- Request body size limits.
- Rate limiting for authentication, invitation, password reset, AI, import, and high-cost endpoints.
- File upload APIs must validate content type, size, malware scanning status where available, and storage classification.

## 21. Long-Running Operations

Long-running operations must use asynchronous processing.

Examples:

- Bulk document import.
- Evidence pack generation.
- PDF or Word export.
- AI analysis.
- Large report generation.

Rules:

- Return `202 Accepted`.
- Provide an operation resource or job ID.
- Expose status through a documented endpoint.
- Emit audit events for completion, failure, cancellation, and controlled output publication.
- Include correlation ID across the original request and background work.

## 22. API Review Checklist

Before an endpoint is accepted, reviewers must confirm:

- The endpoint belongs to the correct bounded context.
- URI, method, status codes, and response shape follow this standard.
- Authentication and authorisation are documented and implemented.
- Organisation isolation is enforced.
- Input validation is complete.
- Structured error responses are documented.
- Correlation IDs are propagated.
- Audit events are defined for controlled or security-relevant actions.
- OpenAPI documentation includes examples and all expected status codes.
- Tests cover successful, validation failure, authorisation failure, and domain conflict paths.
- No API behavior bypasses application services or domain invariants.

## 23. Change Control

Changes to this standard require product governance review. Any exception must be documented in an Architecture Decision Record or sprint-specific architecture exception before implementation.

No implementation may introduce API behavior that conflicts with this standard without an approved governance decision.
