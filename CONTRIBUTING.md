# Contributing to API Keychain

Thank you for your interest in contributing. API Keychain is an OpenAI-compatible
gateway that routes across eight free-tier LLM providers with effort-based
cascades, automatic failover, and encrypted provider key storage.

## Ways to contribute

- Report bugs and request features via [GitHub Issues](https://github.com/Sharann-del/API-Keychain/issues).
- Improve documentation in `docs/` and `examples/`.
- Fix routing, dashboard, or security issues with pull requests.
- Share integration examples for new languages or frameworks.

## Development setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Supabase project (email/password auth)

### Backend (FastAPI gateway)

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export MASTER_SECRET="a-long-stable-secret-for-local-dev"
export SUPABASE_JWT_SECRET="your-supabase-legacy-jwt-secret"
export SUPABASE_URL="https://YOUR-PROJECT.supabase.co"

uvicorn main:app --reload
```

The gateway listens on `http://localhost:8000`. See [docs/installation.md](docs/installation.md)
for database and deployment notes.

### Frontend (Next.js dashboard)

```sh
npm install
cp .env.example .env.local   # fill in Supabase + API base URL
npm run dev
```

The dashboard runs on `http://localhost:3000`.

## Project layout

| Path | Purpose |
| --- | --- |
| `main.py` | FastAPI app, management API, `/v1/*` gateway endpoints |
| `router.py` | Cascade routing, failover, streaming |
| `registry.py` | Provider catalog and effort tiers |
| `crypto.py` | AES-256-GCM encryption for provider keys |
| `models.py` | SQLAlchemy models (SQLite by default) |
| `app/` | Next.js App Router pages |
| `components/` | Dashboard UI |
| `lib/` | API client, auth, catalog |

## Coding guidelines

### Python (gateway)

- Keep routing logic in `router.py`; registry data in `registry.py`.
- Never log plaintext provider keys or keychain `ak-` tokens.
- Prefer explicit error types (`NoModelsAvailable`, `AllProvidersFailed`) over bare exceptions.
- Run `ruff check` and `ruff format` on changed Python files before opening a PR.

### TypeScript (dashboard)

- Follow existing patterns: server components where possible, SWR for data fetching.
- Use Tailwind utility classes consistent with `components/ui/`.
- Run `npm run lint` before submitting.

## Pull request process

1. Fork the repository and create a feature branch from `main`.
2. Make focused changes with a clear commit history.
3. Fill out the pull request template completely.
4. Ensure CI passes (`npm run lint`, `npm run build`, gateway health check).
5. Request review. Maintainers may ask for changes before merge.

## Security

If you discover a vulnerability involving provider keys, JWT handling, or
encryption, **do not** open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating, you agree to uphold a welcoming and respectful community.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
