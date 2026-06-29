# Configuration

## Frontend (Next.js)

Read at **build time**. Set in `.env.local` for development and in your host's
environment for production.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Gateway base URL without trailing slash |

Example (local development):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Example (hosted dashboard + gateway):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=https://api.apikeychain.dev
```

## Backend (FastAPI)

Read from the **process environment** at runtime. On startup, `env_loader.py`
loads `.env.local` and `.env` from the project root (so one file can configure
both Next.js and FastAPI locally). It also copies `NEXT_PUBLIC_SUPABASE_URL`
into `SUPABASE_URL` when the latter is unset.

| Variable | Required | Description |
| --- | --- | --- |
| `MASTER_SECRET` | Yes | Derives AES-256-GCM key for provider key encryption. **Must remain stable** after keys are stored. |
| `SUPABASE_JWT_SECRET` | Yes* | Legacy HS256 JWT secret for management routes |
| `SUPABASE_URL` | Yes* | Project URL for JWKS fetch when verifying asymmetric Supabase tokens |
| `DATABASE_URL` | No | SQLAlchemy URL (default: SQLite file `keychain.db` in project root) |
| `CORS_ORIGINS` | No | Comma-separated browser origins allowed to call management routes |

\* Required for `/users/*` management endpoints. Not needed for `/v1/*` inference
if you only use keychain key auth.

### `CORS_ORIGINS`

Controls which dashboard origins may call `/users/*` from the browser.

Default when unset:

```text
http://localhost:3000,https://www.apikeychain.dev,https://apikeychain.dev
```

Example override on the gateway host:

```sh
export CORS_ORIGINS="http://localhost:3000,https://www.apikeychain.dev,https://apikeychain.dev,https://custom.example"
```

### Generating `MASTER_SECRET`

```sh
openssl rand -hex 32
```

Store in a secrets manager. Loss or rotation without migration makes existing
provider keys undecryptable.

### Supabase JWT verification

Management routes accept Supabase session JWTs. The gateway verifies:

- HS256 tokens using `SUPABASE_JWT_SECRET`
- Asymmetric tokens via JWKS from `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`

## Gateway behavior constants

| Setting | Location | Default |
| --- | --- | --- |
| Upstream request timeout | `router.py` | 60s read, 10s connect |
| Provider cooldown after 429 | `router.py` | 60 seconds |
| CORS allowed origins | `main.py` (`CORS_ORIGINS`) | `http://localhost:3000`, `https://www.apikeychain.dev`, `https://apikeychain.dev` |

## Per-user settings (dashboard)

Configured via management API, not environment:

| Setting | Endpoint | Description |
| --- | --- | --- |
| Provider keys | `POST /users/{id}/keys` | Encrypted upstream credentials |
| Model overrides | `PUT /users/{id}/models/{model_id}` | Enable, priority, custom models |
| Preferences | `PUT /users/{id}/preferences` | Preferred/excluded providers and models |
| Keychain key rate limit | `PUT /keychain-keys/{key_id}` | Requests per minute per `ak-` key |

## Effort tiers

Pseudo-models accepted by `/v1/chat/completions`:

- `keychain-low`
- `keychain-medium`
- `keychain-high`

Claude pseudo-models for `/v1/messages` (map to the same cascades):

- `claude-haiku-4-5` → low
- `claude-sonnet-4-6` → medium
- `claude-opus-4-6` → high

Tier cascades are defined in `registry.py` (`MODEL_TIERS`) and merged with
per-user overrides at request time.

## Supported providers

`gemini`, `groq`, `cerebras`, `mistral`, `deepseek`, `openrouter`, `together`,
`cohere`, `nim`, `sambanova`, `hf`, `cf`

Cloudflare (`cf`) requires your Workers AI account ID when storing keys in the
dashboard.

Provider base URLs and OpenAI-compatible paths are in `registry.py` →
`PROVIDERS`.
