# Installation

API Keychain consists of two deployable components:

| Component | Stack | Default port |
| --- | --- | --- |
| Gateway | FastAPI + SQLAlchemy + SQLite | 8000 |
| Dashboard | Next.js 14 (App Router) | 3000 |

## Local development

### Gateway

```sh
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Required environment variables:

```sh
export MASTER_SECRET="long-random-secret"
export SUPABASE_JWT_SECRET="supabase-jwt-secret"
export SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
```

Optional:

```sh
export DATABASE_URL="sqlite:////absolute/path/to/keychain.db"
```

Start:

```sh
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

By default the database file is `keychain.db` in the project root (resolved
with an absolute path to handle spaces in directory names).

### Dashboard

```sh
npm install
cp .env.example .env.local
npm run dev
```

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Production deployment

Reference URLs for the hosted project:

| Component | URL |
| --- | --- |
| Dashboard | `https://www.apikeychain.dev` |
| Gateway | `https://api.apikeychain.dev` |

### Supabase (auth)

Under **Authentication → URL Configuration**:

| Setting | Value |
| --- | --- |
| Site URL | `https://www.apikeychain.dev` |
| Redirect URLs | `https://www.apikeychain.dev/auth/callback` |

Add `https://apikeychain.dev/**` if the apex domain also serves the dashboard.
Required for password reset and email confirmation. Email/password sign-in
works without these, but production auth should set them.

### Dashboard (Vercel)

1. Import the repository as a Next.js project.
2. Set environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=https://api.apikeychain.dev
```

`NEXT_PUBLIC_API_BASE_URL` must be a publicly reachable gateway URL — browsers
cannot call `localhost`.

### Gateway (Render, Railway, Fly, etc.)

1. Deploy `main.py` with uvicorn as the start command:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Set `PYTHON_VERSION` to `3.12.8` on Render (avoids Python 3.14 build issues).
3. Set `MASTER_SECRET`, `SUPABASE_JWT_SECRET`, and `SUPABASE_URL` as secrets.
4. **Set `DATABASE_URL` to external PostgreSQL** — see [Database](#database) below.
   Without it, SQLite on Render is wiped on every deploy.
5. CORS is controlled by `CORS_ORIGINS` (comma-separated). Default when unset:

   `http://localhost:3000,https://www.apikeychain.dev,https://apikeychain.dev`

   Append additional origins (e.g. a custom domain) via the `CORS_ORIGINS`
   environment variable on the gateway host.

6. **Custom API domain** (`api.apikeychain.dev`): Render → your web service →
   **Settings** → **Custom Domains** → add `api.apikeychain.dev`. Create a
   **CNAME** at your DNS host: `api` → the hostname Render shows (often
   `api-keychain.onrender.com`). SSL is issued automatically. Then set
   `NEXT_PUBLIC_API_BASE_URL=https://api.apikeychain.dev` on Vercel and redeploy
   the dashboard so code snippets and API calls use the new URL.

### Database

**Render's filesystem is ephemeral.** The default `keychain.db` SQLite file is
deleted on every deploy or restart. For production on Render you must use
external PostgreSQL.

#### Supabase Postgres (recommended — you already have Supabase for auth)

1. Supabase → **Project Settings** → **Database**.
2. Under **Connection string**, choose **URI** and **Session pooler** (port
   **6543**). Copy the string.
3. Change the scheme from `postgresql://` to `postgresql+psycopg2://` (SQLAlchemy).
4. On Render → your web service → **Environment** → add:

```env
DATABASE_URL=postgresql+psycopg2://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

5. Redeploy. Tables are created automatically on startup via `init_db()`.

If your database password contains special characters (`@`, `#`, `/`, etc.),
[URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding)
them in the connection string.

#### Other options

- [Neon](https://neon.tech) — free Postgres tier, same `postgresql+psycopg2://` format.
- Render Postgres — paid add-on on the same platform.

#### Local development

SQLite works for single-instance development:

```sh
export DATABASE_URL="sqlite:////absolute/path/to/keychain.db"
```

`psycopg2-binary` is included in `requirements.txt` for production Postgres.
Tables are created automatically on startup via `init_db()`.

## System requirements

| Resource | Minimum | Recommended |
| --- | --- | --- |
| CPU | 1 vCPU | 2+ vCPU for concurrent routing |
| Memory | 512 MB | 1 GB+ |
| Disk | 100 MB + logs/DB | Persistent volume for DB |
| Python | 3.10 | 3.12 |
| Node | 18 | 20 LTS |

## Verify installation

```sh
curl http://localhost:8000/health
curl http://localhost:8000/providers
curl http://localhost:8000/models
```

The dashboard should load at `http://localhost:3000` and redirect unauthenticated
users to `/login`.
