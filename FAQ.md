# Frequently Asked Questions

Short answers to common questions. See also [docs/faq.md](docs/faq.md) for
more detail.

## What is API Keychain?

A unified gateway that routes requests across twelve free-tier LLM providers
behind a single `ak-` key, with effort-based tiers, automatic failover, and
OpenAI plus Anthropic client support.

## Do I need a key for every provider?

You need at least **one** upstream provider key for routing to work, but you
do not need all twelve. The cascade skips providers you have not configured.

## What are effort tiers?

| Model | Tier | Use case |
| --- | --- | --- |
| `keychain-low` | Fast, economical | Classification, autocomplete |
| `keychain-medium` | Balanced | Everyday chat and agents |
| `keychain-high` | Highest quality | Hard reasoning tasks |

Each tier tries an ordered list of real models, cascading to lower tiers if
needed. Claude pseudo-models (`claude-haiku-4-5`, `claude-sonnet-4-6`,
`claude-opus-4-6`) map to the same tiers for `/v1/messages`.

## Does Claude Code work?

Yes. Point `ANTHROPIC_BASE_URL` at your gateway and use your `ak-` key as
`ANTHROPIC_API_KEY`. The gateway speaks Anthropic Messages natively.

## Is this a drop-in OpenAI replacement?

For chat completions and model listing, yes — point your OpenAI SDK at the
gateway base URL and use your keychain key. Embeddings, images, and fine-tuning
are not supported.

## Where are my provider keys stored?

Encrypted with AES-256-GCM in the database (SQLite by default). The dashboard
never shows decrypted provider keys after storage.

## Can I self-host?

Yes. Run the FastAPI gateway and Next.js dashboard yourself. See
[docs/installation.md](docs/installation.md).

## Is the MIT license free for commercial use?

Yes, subject to the [MIT License](LICENSE) terms.

## How do I report a security issue?

Follow [SECURITY.md](SECURITY.md). Do not open a public issue.

## Where do I get help?

See [SUPPORT.md](SUPPORT.md).
