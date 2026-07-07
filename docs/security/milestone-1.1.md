# Milestone 1.1 Security

## Controls

- Strict TypeScript prevents unsafe runtime assumptions.
- API gateway uses global validation pipes with whitelist enforcement.
- OpenAPI bearer security is configured for protected endpoints.
- Health endpoint is explicitly public and operational.
- Audit logging interceptor records request completion metadata.
- Database schema includes `organisationId`, audit ownership metadata, optimistic concurrency fields, and audit events from the first milestone.

## Mandatory Future Feature Controls

Every feature must define:

- Authentication requirements.
- Authorization policy.
- Tenant isolation rules.
- Audit events.
- Input validation.
- Error handling.
- Security test coverage.
