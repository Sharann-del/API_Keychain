# Support

## Documentation

| Resource | Description |
| --- | --- |
| [README](README.md) | Project overview, quickstart, and API summary |
| [docs/getting-started.md](docs/getting-started.md) | First-run walkthrough |
| [docs/installation.md](docs/installation.md) | Local and production setup |
| [docs/configuration.md](docs/configuration.md) | Environment variables |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common errors and fixes |
| [docs/faq.md](docs/faq.md) | Frequently asked questions |
| [examples/](examples/) | curl, Python, TypeScript, and Next.js samples |

## Community

- **Bug reports:** [Open an issue](https://github.com/Sharann-del/API-Keychain/issues/new?template=bug_report.yml)
- **Feature ideas:** [Feature request template](https://github.com/Sharann-del/API-Keychain/issues/new?template=feature_request.yml)
- **Questions:** [GitHub Discussions](https://github.com/Sharann-del/API-Keychain/discussions) (recommended for "how do I…" questions)
- **Security:** See [SECURITY.md](SECURITY.md) — do not file public issues for vulnerabilities

## Self-service checklist

Before asking for help, verify:

1. **Gateway is running** — `curl http://localhost:8000/health` returns OK.
2. **Environment variables are set** — `MASTER_SECRET`, `SUPABASE_JWT_SECRET`, and frontend `NEXT_PUBLIC_*` values.
3. **At least one provider key is stored** — Dashboard → Providers, or `POST /users/{id}/keys`.
4. **You are using a keychain key for inference** — Bearer `ak-...` on `/v1/*`, not the Supabase JWT.
5. **Effort tier is valid** — `keychain-low`, `keychain-medium`, or `keychain-high`.

## Commercial / dedicated support

API Keychain is an open-source project maintained by [Sharann Manojkumar](https://github.com/Sharann-del).
There is no official paid support tier today. Organizations requiring SLAs,
private onboarding, or custom routing policies may contact
[sharannmanojkumar@gmail.com](mailto:sharannmanojkumar@gmail.com) or
[@Sharann-del on GitHub](https://github.com/Sharann-del) to discuss sponsorship
or consulting arrangements.

## Version information

- Gateway version: `GET /health` or FastAPI app metadata (`1.0.0`)
- Dashboard version: `package.json` (`1.0.0`)

When reporting issues, include both versions and your deployment method (local,
Vercel + Render, etc.).
