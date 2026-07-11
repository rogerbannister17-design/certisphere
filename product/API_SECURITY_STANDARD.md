# API Security Standard

This document defines the mandatory API security and integration standard for every REST API implemented within Certisphere. It applies to internal application APIs, portal APIs, service-to-service APIs, automation APIs, future public APIs, webhook endpoints, and integration endpoints.

This standard complements [API Design Standards](API_DESIGN_STANDARDS.md). The design standard governs REST consistency. This security standard governs authentication, authorisation, tenant isolation, auditability, integration safety, and defensive API behaviour.

Every API implemented from Sprint 2.4 onward must comply with this document unless a formal architecture decision or approved security exception supersedes it.

Related governance:

- [Product Principles](PRODUCT_PRINCIPLES.md)
- [API Design Standards](API_DESIGN_STANDARDS.md)
- [Application Service Catalog](APPLICATION_SERVICE_CATALOG.md)
- [Domain Model](DOMAIN_MODEL.md)
- [Architecture Decisions](ARCHITECTURE_DECISIONS.md)
- [Release Policy](RELEASE_POLICY.md)

## API Security Principles

### Zero Trust

Every request is untrusted until authenticated, authorised, validated, tenant-scoped, rate-limited, logged, and processed through approved application boundaries.

Certisphere APIs must not trust:

- Client-side permission checks.
- User-supplied organisation identifiers.
- User-supplied role or permission claims without server-side validation.
- External integration payloads.
- Network location alone.
- Internal service calls without service identity.

### Least Privilege

API access must be granted only for the minimum organisation, business unit, department, resource, operation, and time period required.

Least privilege applies to:

- Human users.
- Consultants.
- Certification body users.
- Administrators.
- Service accounts.
- Integration clients.
- Background jobs.

### Defence in Depth

API security must use overlapping controls so one failed control does not expose tenant data or controlled information.

Required layers include:

- Authentication.
- Authorisation.
- Tenant isolation.
- Input validation.
- Rate limiting.
- Idempotency for unsafe operations.
- Audit logging.
- Security headers.
- Structured error handling.
- Repository-level tenant filtering.
- Database constraints where applicable.

### Secure by Default

New APIs are private, authenticated, tenant-scoped, rate-limited, and audited by default. Public access requires explicit approval and documentation.

Default behaviour must be:

- Deny access when authentication is missing.
- Deny access when organisation membership is missing.
- Deny access when permission is missing.
- Return safe errors without internal implementation details.
- Avoid exposing whether protected cross-tenant resources exist.

## Authentication

All APIs require authentication unless explicitly documented as public.

### JWT Access Tokens

Authenticated API requests use bearer JWT access tokens.

Access token requirements:

- Short-lived.
- Signed with an approved asymmetric or symmetric algorithm managed by platform configuration.
- Validated for signature, issuer, audience, expiry, subject, token identifier, session, and selected organisation context where applicable.
- Rejected when expired, malformed, revoked, issued for another audience, issued by an unknown issuer, or associated with an invalid session.

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

### Refresh Tokens

Refresh tokens are used only to obtain new access tokens.

Refresh token requirements:

- Rotated on use.
- Stored securely by the client.
- Stored server-side only as hashed or otherwise non-recoverable token material.
- Bound to user, session, device context where available, and expiry.
- Revocable by user, administrator, security event, password reset, MFA reset, or account suspension.
- Audited on issue, refresh, rotation, reuse detection, and revocation.

Refresh token reuse must be treated as a security event.

### OAuth 2.1 Readiness

The authentication model must remain compatible with OAuth 2.1 concepts:

- Authorisation code flow with PKCE for browser-based clients.
- No implicit flow.
- Short-lived access tokens.
- Refresh token rotation.
- Explicit scopes or permissions where external clients are introduced.
- Revocable client grants.

OAuth 2.1 readiness does not permit unauthorised third-party access. Public API clients require a future approved integration model.

### OpenID Connect Compatibility

Identity design must remain compatible with OpenID Connect.

Compatibility expectations:

- Stable subject identifiers.
- Issuer and audience validation.
- Claims mapping for user identity.
- Future support for identity provider metadata.
- Separation of authentication identity from organisation authorisation.

OpenID Connect identity claims must not be treated as Certisphere role grants unless mapped and authorised by Certisphere.

### Microsoft 365

Certisphere must be ready to integrate with Microsoft identity and Microsoft Graph.

Future Microsoft 365 integrations must:

- Use OAuth 2.1-compatible delegated or application permissions as appropriate.
- Request the minimum Microsoft Graph scopes required.
- Store consent and token metadata securely.
- Keep Microsoft tenant identity separate from Certisphere organisation identity.
- Audit connection, disconnection, token refresh, data import, and export actions.

### Google Workspace

Certisphere must be ready to integrate with Google Workspace identity and APIs.

Future Google Workspace integrations must:

- Use OAuth 2.1-compatible flows.
- Request the minimum Google scopes required.
- Store consent and token metadata securely.
- Keep Google Workspace domain identity separate from Certisphere organisation identity.
- Audit connection, disconnection, token refresh, data import, and export actions.

## Authorisation

Authorisation is mandatory for every protected endpoint.

Certisphere uses role-based access control with organisation-aware resource checks. Future policy-based extensions may add contextual rules, but RBAC remains the minimum enforcement model.

Authorisation decisions must evaluate:

- Organisation.
- Business unit.
- Department.
- Role.
- Permission.
- Resource.
- Operation.
- Resource ownership or access policy.
- Lifecycle state where relevant.

Example policy statement:

```text
Principal may perform documents.revisions.approve on document {documentId}
only when the principal belongs to organisation {organisationId},
has the required approval permission,
is assigned to the approval step or has delegated approval authority,
and the revision is in an approvable lifecycle state.
```

Authorisation requirements:

- Organisation membership must be verified before resource access.
- Permissions must be checked server-side.
- Resource access must be checked after tenant filtering.
- Administrative permissions must be narrowly scoped.
- Consultant and certification body access must be explicit, scoped, and audited.
- Cross-tenant access must fail even for valid resource identifiers.

## Multi-Tenant Security

Tenant isolation is mandatory for every tenant-owned API.

### Tenant Isolation

Every tenant-owned request must resolve an organisation context and enforce that the authenticated principal has access to that organisation.

Preferred URI pattern:

```text
/api/v1/organisations/{organisationId}/{resource}
```

The server must not trust the path organisation identifier alone. The identifier must be checked against authenticated membership and permissions.

### Query Filtering

Repository queries for tenant-owned data must include tenant filtering.

Required pattern:

```text
where tenantId = authenticatedOrganisationId
```

Tenant filtering must be applied in repository implementations, not left to controller code or client-side filtering.

### Cross-Tenant Protection

Cross-tenant protection requirements:

- Never return resources from another organisation.
- Never reveal cross-tenant resource existence through distinguishable errors.
- Never accept tenant identifiers from request bodies when path or context defines the tenant.
- Never allow joins or relationship traversal to cross tenant boundaries unless the relationship is an explicitly approved multi-tenant collaboration model.
- Treat unexpected tenant mismatches as security-relevant events.

### Repository Requirements

Repositories must:

- Require tenant context for tenant-owned operations.
- Filter reads by tenant.
- Filter updates and deletes by tenant.
- Validate tenant ownership of related resources.
- Support optimistic concurrency where applicable.
- Preserve audit metadata.
- Avoid direct cross-domain data manipulation.

### Audit Requirements

Tenant-sensitive audit events must include:

- Organisation identifier.
- Principal identifier.
- Resource type.
- Resource identifier.
- Operation.
- Outcome.
- Correlation ID.
- Timestamp.
- Source IP or network context where available.

## API Versioning

All REST APIs use URI major versioning.

```text
/api/v1
```

Versioning rules:

- `v1` is the initial major API version.
- Breaking changes require a new major version.
- Additive fields and additive endpoints are normally backward compatible.
- Changing enum meaning, validation behaviour, error codes, required fields, status codes, or response structure may be breaking.
- Version changes must be documented in OpenAPI and release notes.

### Future Version Strategy

Future versions must run in parallel during a migration window where commercially practical.

APIs must not remove or materially change `v1` behaviour without:

- Deprecation notice.
- Replacement endpoint guidance.
- Migration period.
- Release governance approval.

### Deprecation Policy

Deprecated endpoints must:

- Remain documented while supported.
- Include a replacement endpoint where available.
- Include a removal target version or date.
- Emit a deprecation header where practical.

Example:

```http
Deprecation: true
Sunset: Wed, 31 Dec 2027 23:59:59 GMT
Link: </api/v2/organisations/{organisationId}/controlled-information>; rel="successor-version"
```

## Standard HTTP Responses

APIs must use standard HTTP responses consistently.

### 200 OK

Use for successful retrieval, update, or command completion with a response body.

```json
{
  "data": {
    "id": "9f25fba0-6b19-4b6f-a688-909712a9f1f1",
    "type": "document",
    "status": "published"
  }
}
```

### 201 Created

Use when a resource is created. Include `Location` where appropriate.

```json
{
  "data": {
    "id": "0bce4c2b-dc34-4ac8-818f-15ef64f7dc03",
    "type": "organisation"
  }
}
```

### 204 No Content

Use for successful operations with no response body.

### 400 Bad Request

Use for malformed requests, invalid query syntax, unsupported filters, unsupported sort fields, invalid pagination syntax, or unreadable request bodies.

### 401 Unauthorized

Use when authentication is missing, expired, malformed, invalid, or revoked.

### 403 Forbidden

Use when the principal is authenticated but lacks permission, membership, role, or resource access.

### 404 Not Found

Use when a resource does not exist or must not be revealed to the authenticated principal.

### 409 Conflict

Use for uniqueness conflicts, optimistic concurrency conflicts, duplicate idempotency keys with incompatible payloads, or lifecycle state conflicts.

### 422 Unprocessable Entity

Use when a well-formed request fails domain validation.

### 429 Too Many Requests

Use when a rate limit is exceeded. Include retry guidance where practical.

```http
Retry-After: 60
```

### 500 Internal Server Error

Use only for unexpected platform errors. Responses must not expose stack traces, secrets, SQL, tokens, internal service names, or infrastructure topology.

## Error Format

All API errors must use one JSON error model.

```json
{
  "errorCode": "DOCUMENT_INVALID_LIFECYCLE_TRANSITION",
  "message": "The requested lifecycle transition is not valid for the current document state.",
  "correlationId": "01JZ4XR8G6Y3Y9T9CFJX3MZQ2B",
  "timestamp": "2026-07-11T12:00:00.000Z",
  "validationErrors": [
    {
      "field": "targetState",
      "message": "Published documents cannot transition directly to Draft."
    }
  ]
}
```

Rules:

- `errorCode` is mandatory and must be stable uppercase snake case.
- `message` is mandatory, safe, and suitable for authorised users.
- `correlationId` is mandatory.
- `timestamp` is mandatory and must be ISO 8601 UTC.
- `validationErrors` is optional and must not expose sensitive implementation details.
- Stack traces must never be returned.
- Authentication errors must not reveal whether an email address, user, token, session, or tenant exists.

## Audit Logging

Audit logging is mandatory for security-relevant and controlled-information actions.

Audit events must include:

- Event type.
- Organisation identifier where applicable.
- Principal identifier.
- Resource type.
- Resource identifier.
- Operation.
- Outcome.
- Correlation ID.
- Timestamp.
- Source IP or network context where available.
- Before and after values where appropriate and safe.

Mandatory audited categories:

- Authentication.
- Document updates.
- Approvals.
- Publication.
- Administrative changes.

### Authentication Events

Audit:

- Login success.
- Login failure.
- Logout.
- Token refresh.
- Refresh token rotation.
- Refresh token reuse detection.
- Password reset request.
- Password reset completion.
- MFA enrolment, challenge, success, failure, and removal.
- Session revocation.

### Document Updates

Audit:

- Controlled information creation.
- Metadata update.
- Revision creation.
- Attachment addition or removal.
- Relationship creation or removal.
- Evidence link creation or removal.
- Archive, withdrawal, supersede, or restore action.

### Approvals

Audit:

- Review submission.
- Approval assignment.
- Approval decision.
- Rejection decision.
- Electronic signature capture.
- Delegated approval use.

### Publication

Audit:

- Publication request.
- Publication completion.
- Effective date change.
- Distribution change.
- Withdrawal.
- Supersession.

### Administrative Changes

Audit:

- Organisation settings changes.
- Membership changes.
- Role changes.
- Permission changes.
- Invitation issue, acceptance, expiry, and revocation.
- Integration connection and disconnection.
- Service account creation, secret rotation, and revocation.

## OpenAPI Standards

Every endpoint must include OpenAPI documentation.

### Operation Naming

Operation IDs must be stable, descriptive, and command-oriented.

Examples:

```text
listOrganisationDocuments
createOrganisationDocument
submitDocumentRevisionForReview
approveDocumentRevision
revokeOrganisationInvitation
```

### Tag Naming

Tags must match product or bounded-context concepts.

Examples:

```text
Identity
Organisations
Controlled Information
Approvals
Evidence
Audit Events
```

### DTO Naming

DTO names must be explicit and action-specific.

Examples:

```text
CreateDocumentRequest
DocumentResponse
ApproveRevisionRequest
ValidationErrorResponse
PaginatedDocumentResponse
```

### Schema Conventions

Schemas must:

- Use UUID format for identifiers.
- Use ISO 8601 strings for timestamps.
- Document enum values.
- Mark required fields accurately.
- Include validation constraints.
- Include security requirements.
- Include error responses.
- Include pagination, filtering, sorting, and rate-limit responses where applicable.

### Examples

OpenAPI examples must include realistic values and must not include secrets, real customer data, production tokens, or unsupported product behaviour.

## Rate Limiting

Rate limiting is mandatory for all APIs.

Default limits:

| Principal Type | Default Limit | Notes |
| --- | --- | --- |
| Anonymous users | 30 requests per minute per IP | Public endpoints only. |
| Authenticated users | 600 requests per minute per user per organisation | Lower limits may apply to sensitive operations. |
| Service accounts | 1,200 requests per minute per client per organisation | Must be explicitly issued and auditable. |

Sensitive endpoints require stricter limits:

- Login.
- Password reset.
- MFA challenge.
- Token refresh.
- Invitation acceptance.
- Webhook ingestion.
- Export generation.
- Bulk import.

Rate-limit responses must use `429 Too Many Requests` and include `Retry-After` where practical.

## Idempotency

Idempotency keys are required for operations where retrying could create duplicate resources or duplicate side effects.

Required for:

- Resource creation through external clients.
- Payment or billing operations when introduced.
- Invitation creation.
- Publication commands.
- Approval commands where duplicate submission would alter audit history.
- Webhook processing.
- Bulk import.
- Export generation requests.

Idempotency key header:

```http
Idempotency-Key: 01JZ4Y5F2R2W5F9Y3B4H8KQ91P
```

Rules:

- Keys must be scoped to principal, organisation, endpoint, and payload hash.
- Reusing a key with the same payload must return the original result where possible.
- Reusing a key with a different payload must return `409 Conflict`.
- Idempotency records must have a documented retention period.

## Pagination

Collection endpoints must be paginated unless formally bounded and documented.

Standard request:

```text
GET /api/v1/organisations/{organisationId}/documents?page[size]=50&page[after]=opaque-cursor
```

Standard response:

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

Rules:

- Cursor pagination is preferred.
- Cursors must be opaque.
- Default page size is 50.
- Maximum page size is 100 unless approved for a specific endpoint.
- Ordering must be deterministic.
- Unbounded tenant-owned collection responses are prohibited.

## Filtering

Filtering uses explicit `filter[...]` query parameters.

Examples:

```text
filter[state]=published
filter[classification]=restricted
filter[ownerId]=9f25fba0-6b19-4b6f-a688-909712a9f1f1
filter[createdAt][from]=2026-01-01T00:00:00.000Z
filter[createdAt][to]=2026-12-31T23:59:59.999Z
```

Rules:

- Supported filters must be documented in OpenAPI.
- Unsupported filters return `400 Bad Request`.
- Filter values must be validated.
- Date filters must use ISO 8601.
- Filtering must never bypass tenant isolation.

## Sorting

Sorting uses the `sort` query parameter.

Examples:

```text
sort=createdAt
sort=-updatedAt
sort=title,-updatedAt
```

Rules:

- Ascending is the default.
- Prefix descending fields with `-`.
- Supported sort fields must be documented.
- Unsupported sort fields return `400 Bad Request`.
- Sort order must be stable when pagination is used.

## Searching

Search uses the `search` query parameter for simple search or a dedicated search endpoint for advanced search.

Simple example:

```text
GET /api/v1/organisations/{organisationId}/documents?search=quality%20manual
```

Advanced example:

```text
POST /api/v1/organisations/{organisationId}/controlled-information/search
```

Rules:

- Search input must be length-limited.
- Search must be tenant-scoped.
- Search must not expose restricted resources.
- Search results must honour resource permissions.
- Search ranking behaviour must be documented where user-visible.

## Correlation IDs

Every request must include correlation tracking.

Header:

```http
X-Correlation-Id: 01JZ4XR8G6Y3Y9T9CFJX3MZQ2B
```

Rules:

- Clients may provide a correlation ID.
- The server must generate one when missing.
- The correlation ID must be returned in responses.
- The correlation ID must be included in structured logs, audit events, error responses, and downstream service calls.
- Invalid correlation IDs must be replaced or rejected according to gateway policy.

## Security Headers

APIs and API gateway responses must include appropriate security headers.

Required headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Cache-Control: no-store
Pragma: no-cache
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Header rules:

- `Strict-Transport-Security` applies only over HTTPS.
- Authenticated API responses must not be cached by shared caches.
- File download endpoints require explicit content type and disposition handling.
- CORS must be restrictive and environment-specific.

## API Naming Standards

APIs must use predictable resource naming.

Rules:

- Use plural resource names.
- Use lowercase kebab-case path segments.
- Use nouns for resources.
- Use HTTP methods for CRUD intent.
- Use action endpoints only for domain commands.
- Do not expose implementation names, database table names, ORM names, or internal service names.
- Do not include file extensions in paths.
- Do not use trailing slashes.

Examples:

```text
GET /api/v1/organisations/{organisationId}/documents
POST /api/v1/organisations/{organisationId}/documents
GET /api/v1/organisations/{organisationId}/documents/{documentId}
POST /api/v1/organisations/{organisationId}/documents/{documentId}/submit-for-review
POST /api/v1/organisations/{organisationId}/documents/{documentId}/approvals
GET /api/v1/organisations/{organisationId}/audit-events
```

Avoid:

```text
POST /api/v1/createDocument
GET /api/v1/document_table/{id}
POST /api/v1/documents/{id}/doApprove
```

## Integration Guidelines

Integrations must preserve tenant isolation, least privilege, auditability, and revocability.

### Microsoft Graph

Microsoft Graph integrations must:

- Use OAuth 2.1-compatible authorisation.
- Request minimum required scopes.
- Store consent, tenant, and token metadata securely.
- Audit connection, disconnection, refresh, import, export, and permission failures.
- Treat Microsoft tenant identifiers as external identifiers, not Certisphere organisation identifiers.
- Validate file, user, group, and drive ownership before linking content to controlled information.

### Google Workspace

Google Workspace integrations must:

- Use OAuth 2.1-compatible authorisation.
- Request minimum required scopes.
- Store consent, domain, and token metadata securely.
- Audit connection, disconnection, refresh, import, export, and permission failures.
- Treat Google Workspace domain identifiers as external identifiers, not Certisphere organisation identifiers.
- Validate document ownership and sharing permissions before linking content to controlled information.

### Webhook Strategy

Webhook endpoints must:

- Authenticate source systems where supported.
- Verify signatures where supported.
- Validate timestamp freshness to reduce replay risk.
- Use idempotency keys or event identifiers.
- Store processing outcome.
- Rate limit aggressively.
- Return fast acknowledgement where processing is asynchronous.
- Never trust webhook payloads without validation and tenant resolution.

Webhook delivery from Certisphere must:

- Sign payloads.
- Include event ID, timestamp, organisation ID, resource type, resource ID, event type, and correlation ID.
- Retry with bounded backoff.
- Record delivery attempts.
- Avoid sending secrets or unnecessary personal data.

### Future Public API

Future public APIs require explicit product, security, and architecture approval before release.

Public API requirements:

- Client registration.
- Scoped access.
- Service account or OAuth client identity.
- Rate limits.
- Idempotency for unsafe operations.
- OpenAPI publication.
- Developer-facing error documentation.
- Webhook security documentation.
- Support and deprecation policy.

No internal endpoint becomes public by accident. Public API exposure is a product decision and a release event.

