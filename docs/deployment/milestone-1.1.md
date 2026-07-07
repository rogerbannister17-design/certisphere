# Milestone 1.1 Deployment

## Local Platform

Docker Compose provides PostgreSQL and Redis for local development.

## CI Platform

GitLab CI runs:

- Dependency installation.
- Linting.
- Type checking.
- Unit tests.
- Build.
- Dependency audit.

## Azure and Kubernetes

Azure, Terraform, and Kubernetes directories are reserved for production deployment assets. Manifests must be added as complete, reviewed infrastructure slices.
