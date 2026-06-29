# Getting started

This guide walks you through your first successful inference call with API
Keychain in under fifteen minutes.

## What you will build

1. A running FastAPI gateway on port 8000
2. A Next.js dashboard on port 3000
3. A keychain `ak-` key and at least one upstream provider key
4. A chat completion routed through `keychain-medium`

## Prerequisites

- Node.js 18+ and Python 3.10+
- A [Supabase](https://supabase.com) project with email/password auth enabled

## Step 1 — Start the gateway

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export MASTER_SECRET="$(openssl rand -hex 32)"
export SUPABASE_JWT_SECRET="your-supabase-legacy-jwt-secret"
export SUPABASE_URL="https://YOUR-PROJECT.supabase.co"

uvicorn main:app --reload
```

Verify: `curl http://localhost:8000/health`

## Step 2 — Start the dashboard

```sh
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL, anon key, and API base URL
npm run dev
```

Open `http://localhost:3000` and create an account.

## Step 3 — Add a provider key

1. Sign in and open **Providers**.
2. Choose a provider (e.g. Groq) and paste your upstream API key.
3. Save. The key is encrypted before it reaches the database.

## Step 4 — Copy your keychain key

1. Open **Keys** in the dashboard.
2. Copy your `ak-...` key (shown once on creation; rotate if you lose it).

## Step 5 — Send a request

```sh
curl http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer ak-YOUR-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "keychain-medium",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
```

You should receive an OpenAI-shaped JSON response. The gateway selected a model
from the medium tier cascade and failed over automatically if an upstream was
throttled.

## Next steps

- Tune model priority in **Models**
- Exclude providers in **Preferences**
- Review latency and token usage in **Dashboard**
- Read [configuration.md](configuration.md) for production env vars
- Browse [examples/](../examples/) for SDK integrations

## Common first-run issues

| Symptom | Fix |
| --- | --- |
| `MASTER_SECRET environment variable is not set` | Export `MASTER_SECRET` before starting uvicorn |
| Dashboard cannot reach API | `NEXT_PUBLIC_API_BASE_URL` must be a public URL (e.g. `https://api.apikeychain.dev`) |
| `No provider keys configured` | Add at least one provider key in the dashboard |
| 401 on `/v1/*` | Use the `ak-` keychain key, not the Supabase JWT |

See [troubleshooting.md](troubleshooting.md) for more.
