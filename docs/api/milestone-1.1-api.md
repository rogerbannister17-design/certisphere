# Milestone 1.1 API Specification

## API Gateway

Base path: `/v1`

### `GET /v1/health`

Returns API gateway health.

Authentication: bearer token.

Authorisation: `platform.health.read`.

Audit/logging: each request is logged through the API gateway observability interceptor.

Correlation ID: callers should pass `x-correlation-id`; the gateway returns it in the response.

Response `200`:

```json
{
  "status": "ok",
  "checkedAt": "2026-07-07T14:00:00.000Z",
  "version": "0.1.0"
}
```

OpenAPI documentation is exposed at `/api/docs`.
