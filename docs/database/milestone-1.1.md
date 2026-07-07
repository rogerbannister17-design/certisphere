# Milestone 1.1 Database

Prisma is the only migration authority for Certisphere database changes.

## Initial Models

- `Organisation`: tenant boundary for enterprise organisations.
- `User`: organisation-scoped user identity record.
- `AuditEvent`: append-oriented audit event record for platform actions.

## Migration Rule

Schema changes must be generated with Prisma:

```bash
pnpm prisma:migrate
```

Handwritten database migrations are not permitted.
