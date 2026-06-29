# FAQ

Detailed frequently asked questions for API Keychain.

## General

### How is API Keychain different from OpenRouter?

API Keychain is **self-hosted** and uses **your own** upstream provider keys.
Routing, failover, cooldowns, and encryption run on your infrastructure. You
control the cascade and can customize tiers per user.

### How many providers and models are supported?

Eight providers are integrated today (Gemini, Groq, Cerebras, Mistral, DeepSeek,
OpenRouter, Together, Cohere). The dashboard catalog lists 59 free-tier models
across those providers; the default tier cascades use a curated subset.

### Does API Keychain store prompts?

Request metadata (model, provider, tokens, latency, status) is logged to
`RequestLog` for analytics. Review `main.py` logging behavior for your
compliance requirements before production use.

## Routing & tiers

### What happens when I request `keychain-high`?

The gateway builds a cascade starting with high-tier models, then falls through
medium and low if needed. Within each tier, models are tried in priority order
with user overrides applied.

### Can I force a specific model?

Pin models via the **Models** page or management API. Disable models you do not
want in the cascade. Direct upstream model IDs are also accepted if you have a
key for that provider.

### How long do cooldowns last?

60 seconds after an upstream HTTP 429. The provider is deprioritized during
cooldown so other providers are tried first.

### Does failover work across tiers?

Yes. A `keychain-high` request that exhausts high-tier candidates continues
into medium, then low.

## Security

### Who can decrypt my provider keys?

Anyone with `MASTER_SECRET` and database access. Protect both aggressively.

### Are keychain keys hashed?

Yes. Only SHA-256 hashes are stored. Plaintext `ak-` tokens are shown once at
creation.

### Is TLS required?

Strongly recommended in production. Terminate TLS at your reverse proxy or
platform.

## API compatibility

### Which OpenAI endpoints are supported?

- `POST /v1/chat/completions` (including `stream: true`)
- `GET /v1/models`

Embeddings, audio, images, and assistants are not implemented.

### Can I use the official OpenAI Python SDK?

Yes. Set `base_url` to your gateway and `api_key` to your `ak-` key.

## Deployment

### Can I run gateway and dashboard on one server?

Yes for small deployments. Use a reverse proxy to route `/` to Next.js and `/v1`
to FastAPI, or run on separate ports as in local dev.

### SQLite vs PostgreSQL?

SQLite is fine for development and single-instance installs. Use PostgreSQL when
running multiple gateway replicas or needing durable backups.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [ROADMAP.md](../ROADMAP.md).
