# Milestone 1 Identity API

All routes are versioned under `/v1/identity`.

## Register Organisation

`POST /v1/identity/organisations/register`

Headers:

- `x-certisphere-setup-token`

Creates the initial organisation and owner user. The owner receives the `organisation.owner` role and the initial Identity and Organisation permissions.

Responses:

- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`

## Create Session

`POST /v1/identity/sessions`

Authenticates an active user for an organisation slug, creates a persisted session, stores a hashed refresh token, emits an audit event, and returns a signed JWT access token plus opaque refresh token.

Responses:

- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`

## Refresh Session

`POST /v1/identity/sessions/refresh`

Rotates an opaque refresh token. The previous token is revoked and the next token is stored only as a hash.

Responses:

- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`

## Create Invitation

`POST /v1/identity/invitations`

Requires:

- Bearer JWT
- `identity.invitations.manage`
- Matching organisation context

Creates an invitation token, stores only its hash, and emits an immutable audit event using the authenticated principal as the actor.

Responses:

- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
