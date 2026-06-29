# API reference

Base URL: `http://localhost:8000` (or your deployed gateway).

## Authentication

| Route prefix | Auth header |
| --- | --- |
| `/users/*` | `Authorization: Bearer <supabase-jwt>` |
| `/v1/chat/completions`, `/v1/models` | `Authorization: Bearer ak-<keychain-key>` |
| `/health`, `/providers`, `/models` | None |

## Public endpoints

### `GET /health`

Service health check.

### `GET /providers`

Provider catalog metadata.

### `GET /models`

Full model registry including tier assignments.

## Gateway (OpenAI-compatible)

### `POST /v1/chat/completions`

OpenAI-compatible chat completions with effort-tier routing.

**Headers:** `Authorization: Bearer ak-...`

**Body (subset):**

```json
{
  "model": "keychain-high",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}
```

**Effort pseudo-models:**

- `keychain-low`
- `keychain-medium`
- `keychain-high`

**Responses:**

- `200` — OpenAI-shaped completion JSON
- `400` — No provider keys configured
- `409` — No models available after filters
- `429` — Per-key rate limit exceeded
- `502` — All providers failed (`all_providers_failed`)

### `GET /v1/models`

OpenAI-compatible model list including `keychain-*` pseudo-models.

## User management

All routes require a valid Supabase JWT. The authenticated user must match
`user_id` in the path.

### `POST /users/init`

Idempotently onboard the signed-in user. Call after first login.

### Keychain keys

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users/{user_id}/keychain-keys` | List keychain keys (masked) |
| `POST` | `/users/{user_id}/keychain-keys` | Create new `ak-` key |
| `POST` | `/users/{user_id}/regenerate-key` | Rotate primary key |
| `PUT` | `/keychain-keys/{key_id}` | Update label or rate limit |
| `DELETE` | `/keychain-keys/{key_id}` | Revoke a key |

### Provider keys

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users/{user_id}/keys` | Store encrypted provider key |
| `GET` | `/users/{user_id}/keys` | List stored keys (masked) |
| `DELETE` | `/users/{user_id}/keys/{key_id}` | Remove a provider key |

**Store key body:**

```json
{
  "provider": "groq",
  "api_key": "gsk_...",
  "key_label": "default"
}
```

Supported `provider` values: `gemini`, `groq`, `cerebras`, `mistral`,
`deepseek`, `openrouter`, `together`, `cohere`.

### Models

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users/{user_id}/models` | Effective model table |
| `PUT` | `/users/{user_id}/models/{model_id}` | Enable/disable, set priority |
| `POST` | `/users/{user_id}/models` | Add custom model entry |
| `DELETE` | `/users/{user_id}/models/{model_id}` | Remove override |

### Preferences

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users/{user_id}/preferences` | Routing preferences |
| `PUT` | `/users/{user_id}/preferences` | Update preferred/excluded lists |

### Analytics

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users/{user_id}/providers/health` | Per-provider status and cooldowns |
| `GET` | `/users/{user_id}/usage` | Aggregate usage stats |
| `GET` | `/users/{user_id}/usage/recent` | Recent request log entries |

## Error format

Gateway errors follow OpenAI-style JSON where applicable:

```json
{
  "error": {
    "message": "All providers failed",
    "type": "api_error",
    "code": "all_providers_failed"
  }
}
```

Failed routing attempts may include `failed_attempts` in the error payload for
debugging.

## Interactive docs

When running locally, FastAPI serves:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Examples

See [examples/](../examples/) for curl, Python, TypeScript, and Next.js clients.
