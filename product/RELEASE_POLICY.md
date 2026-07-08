# Certisphere Release Policy

## Purpose

This policy governs how Certisphere plans, validates, tags, releases, hotfixes, and rolls back commercial SaaS releases. It applies to every repository change that can affect product behaviour, data integrity, security, compliance evidence, operational reliability, or customer-facing documentation.

Certisphere releases must remain traceable from approved specification through implementation, verification, commit, push, tag, and deployment evidence. No release may bypass the engineering gates defined in this document.

## Version Numbering

Certisphere uses semantic versioning with prerelease labels while the platform is under active commercial development.

### Major

Major versions introduce incompatible platform, API, data, operational, or contractual changes. A major version requires explicit product-owner approval, architecture review, migration planning, rollback planning, customer-impact assessment, and release notes.

Example: `v1.0.0`

### Minor

Minor versions introduce backward-compatible product capability, domain expansion, infrastructure capability, or compliance coverage. Release 0.x minor versions represent pre-launch product increments and must still meet production engineering standards.

Example: `v0.2.0`

### Patch

Patch versions deliver backward-compatible fixes, documentation corrections, security hardening, dependency updates, non-breaking operational improvements, or release verification updates.

Example: `v0.2.1`

### Alpha

Alpha releases are internal validation cuts for incomplete release scope. Alpha releases may be deployed only to internal development or isolated validation environments and must not be used for customer production data.

Example: `v0.2.0-alpha1`

### Beta

Beta releases are feature-complete for the planned release scope but still require broader validation, operational rehearsal, security review, or controlled stakeholder acceptance.

Example: `v0.2.0-beta1`

### Release Candidate

Release candidates are intended production candidates. A release candidate must have no known release-blocking defects and must have passed all sprint and release gates available in the target environment.

Example: `v0.2.0-rc1`

### Stable

Stable releases are approved for production deployment. Stable releases require completed release gates, release notes, migration evidence, rollback evidence, and a signed-off tag.

Example: `v0.2.0`

## Branch Strategy

### `main`

`main` represents production-ready stable code. It must contain only reviewed, verified, tagged release commits or approved hotfix merges. Direct commits to `main` are not permitted.

### `develop`

`develop` is the integration branch for approved sprint work. Sprint implementation merges into `develop` after the Definition of Done is satisfied. Release branches are cut from `develop`.

### `feature/*`

`feature/*` branches contain sprint or feature implementation work. Each branch must map to an approved specification, backlog item, or architecture/documentation task. Feature branches must pass local verification before merge.

### `hotfix/*`

`hotfix/*` branches are cut from `main` to resolve production defects or urgent security issues. They must be merged back into both `main` and `develop` after verification.

### `release/*`

`release/*` branches are cut from `develop` when a release scope is feature-complete. Only release stabilization, documentation, versioning, migration verification, and release-blocking fixes may be committed to a release branch.

## Commit Message Standard

Certisphere uses Conventional Commits for all commits.

Allowed commit types:

- `feat:` introduces a production capability.
- `fix:` corrects a defect.
- `docs:` changes documentation only.
- `refactor:` changes code structure without changing behaviour.
- `test:` adds or updates tests.
- `build:` changes build tooling, dependency metadata, or packaging.
- `ci:` changes CI/CD configuration.
- `perf:` improves performance without changing intended behaviour.
- `style:` changes formatting only.
- `chore:` performs repository maintenance.

Examples:

```text
feat(documents): implement KCIP persistence foundation
fix(identity): enforce tenant scope on session lookup
docs(product): add release policy
test(documents): cover repository tenant isolation
ci(pipeline): add Prisma migration validation
```

## Release Gates

Every sprint must satisfy the following gates before completion:

- Specification approved.
- Architecture unchanged or approved through a documented architecture exception.
- Build passes.
- Lint passes.
- Tests pass.
- Documentation updated.
- Sprint report completed.
- `PROJECT_STATUS.md` updated.
- Git commit completed.
- Git pushed.
- Release tagged.

## Tagging Policy

Tags are created after the release gates pass and the release owner confirms the intended version. Tags must use the `v` prefix and the version formats defined in this policy.

Prerelease tags are created from `develop` or `release/*` after internal validation gates pass. Stable tags are created from `main` after final release approval. Tags must not be moved after publication. If a tag is incorrect, create a new patch, prerelease, or release-candidate tag.

## Hotfix Policy

Production hotfixes use the following workflow:

1. Confirm and classify the production issue.
2. Create a `hotfix/*` branch from the affected `main` tag or current `main`.
3. Implement the smallest production-grade fix.
4. Add or update tests that prove the defect and the fix.
5. Run build, lint, tests, Prisma validation where applicable, and deployment-specific checks.
6. Merge to `main`.
7. Tag a patch release.
8. Merge the hotfix back to `develop`.
9. Update `PROJECT_STATUS.md`, release notes, and incident records.

Hotfixes must not introduce unrelated product functionality.

## Rollback Policy

Rollback uses immutable Git tags and verified deployment artifacts.

If a release must be rolled back:

1. Identify the last known good stable tag.
2. Confirm database migration compatibility and rollback requirements.
3. Apply database rollback scripts only when required and only after data-impact assessment.
4. Redeploy the application artifact associated with the last known good tag.
5. Verify health checks, authentication, tenant isolation, and release-specific smoke tests.
6. Record the rollback in `PROJECT_STATUS.md` and operational incident records.

Rollback must preserve audit evidence. Destructive data rollback requires explicit product-owner and engineering approval.

## Definition of Done

A Certisphere sprint or release is done only when:

- The approved specification has been implemented without unauthorised architecture changes.
- Domain boundaries remain intact.
- Multi-tenant isolation is enforced.
- Security, audit metadata, and logging expectations are met for the implemented layer.
- TypeScript typecheck passes with strict settings.
- ESLint passes without errors.
- Tests pass, including unit, integration, migration, or API coverage appropriate to the work.
- Prisma schema, migrations, and seed data are validated when persistence changes are included.
- Documentation, roadmap, backlog, sprint report, and `PROJECT_STATUS.md` are updated.
- No non-production implementation pattern is present.
- The work is committed, pushed, and tagged according to this release policy.
