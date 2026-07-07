# AI Controlled Information Lifecycle

AI must never directly modify controlled information.

Controlled information may only move through:

```text
AI
  |
  v
Suggestion
  |
  v
Human Review
  |
  v
Approval
  |
  v
Workflow
  |
  v
Published
```

Each transition must enforce:

- Authentication.
- Authorisation.
- Domain workflow rules.
- Immutable audit events.
- Human accountability for approval and publication.
