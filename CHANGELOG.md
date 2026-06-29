# Changelog

All notable changes to API Keychain are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Anthropic Messages API (`POST /v1/messages`, `POST /v1/messages/count_tokens`)
  for Claude Code with streaming and tool-use translation.
- Four new providers: NVIDIA NIM, SambaNova, Hugging Face, Cloudflare Workers AI.
- `x-api-key` header auth for Anthropic clients.
- `env_loader.py` — loads `.env.local` / `.env` for the FastAPI gateway.
- Pytest suite (`tests/`) and CI test step.
- Claude pseudo-models on `GET /v1/models`.

### Changed

- Expanded default tier cascades in `registry.py` (June 2026 catalog).
- FastAPI lifespan context manager replaces deprecated startup event.
- SQL-optimized rate-limit and provider count queries.

### Fixed

- Removed internal `_keychain` routing metadata from upstream API responses.

### Added (earlier unreleased)

- GitHub community health files, CI workflows, and expanded `docs/` and `examples/`.

## [1.0.0] - 2025-06-01

### Added

- OpenAI-compatible gateway (`POST /v1/chat/completions`, `GET /v1/models`).
- Effort tiers: `keychain-low`, `keychain-medium`, `keychain-high` with cascade
  failover across lower tiers.
- Eight supported providers: Gemini, Groq, Cerebras, Mistral, DeepSeek,
  OpenRouter, Together, and Cohere.
- Automatic failover on upstream 429/5xx/timeout with 60-second provider cooldowns.
- AES-256-GCM encryption for stored provider keys (`MASTER_SECRET`).
- Keychain `ak-` bearer keys with SHA-256 hashed storage and rotation.
- Supabase JWT authentication for management API (`/users/*`).
- Next.js 14 dashboard: provider keys, model overrides, preferences, usage analytics.
- Per-key rate limiting and request logging.
- Streaming chat completions support.
- SQLite default database with optional `DATABASE_URL` override.

[Unreleased]: https://github.com/Sharann-del/API-Keychain/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Sharann-del/API-Keychain/releases/tag/v1.0.0
