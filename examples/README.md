# Examples

Runnable samples for calling API Keychain with common tools and SDKs.

| Directory | Description |
| --- | --- |
| [curl/](curl/) | Shell scripts for chat, streaming, and model listing |
| [python/](python/) | OpenAI Python SDK |
| [typescript/](typescript/) | OpenAI SDK (TypeScript) |
| [node/](node/) | OpenAI SDK (Node ESM) |
| [nextjs/](nextjs/) | Next.js App Router server route |

## Prerequisites

1. Running gateway (`uvicorn main:app --reload`)
2. Keychain `ak-` key from the dashboard
3. At least one upstream provider key configured

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `KEYCHAIN_KEY` | — | Your `ak-...` bearer token |
| `GATEWAY_URL` | `http://localhost:8000` | Gateway base URL (no `/v1` suffix) |

## Effort tiers

Use these as the `model` parameter:

- `keychain-low` — fast, economical
- `keychain-medium` — balanced
- `keychain-high` — highest quality cascade

See [docs/getting-started.md](../docs/getting-started.md) for the full walkthrough.
