# Security

Report suspected vulnerabilities through the private security channel configured for the project.

Security requirements:

- No secrets in source control.
- Every endpoint must declare authentication and authorization behaviour.
- Administrative actions must be logged and auditable.
- Dependencies must be scanned in CI.
- Data access must be tenant-aware.
- Production telemetry must avoid sensitive personal data.
