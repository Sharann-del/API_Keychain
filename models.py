"""SQLAlchemy models and session/engine setup."""

from __future__ import annotations

import datetime as dt
import os
from pathlib import Path
from typing import Optional

from sqlalchemy import (
    JSON,
    URL,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    create_engine,
    inspect,
    select,
    text,
)
from sqlalchemy.engine import make_url
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)


def _resolve_db_url() -> URL:
    """Resolve the database URL.

    Defaults to a SQLite file in THIS source directory (absolute, so it's the
    same file regardless of where uvicorn is launched from). Built via
    ``URL.create`` rather than a "sqlite:///..." string so that special
    characters in the path — notably the space in ".../API Keychain/" — are
    passed to the driver literally instead of being mangled by URL parsing,
    which is what produced the persistent "readonly database" errors. Override
    with the DATABASE_URL env var.
    """
    env = os.environ.get("DATABASE_URL")
    if env:
        return make_url(env)
    db_path = str(Path(__file__).resolve().parent / "keychain.db")
    return URL.create("sqlite", database=db_path)


def _prepare_sqlite_path(url: URL) -> Optional[str]:
    """For a SQLite file URL: ensure the dir + file exist and are writable.

    Prints the resolved path and raises a clear startup error if the file or its
    directory is not writable. No-op for non-file SQLite (``:memory:``) and other
    backends. Returns the absolute db path (or None).
    """
    if url.get_backend_name() != "sqlite":
        print(f"[API Keychain] Database backend: {url.get_backend_name()}", flush=True)
        return None
    db_path = url.database
    if not db_path or db_path == ":memory:":
        print("[API Keychain] Database: in-memory SQLite", flush=True)
        return None

    db_path = os.path.abspath(db_path)
    db_dir = os.path.dirname(db_path)

    # 1. Ensure the directory exists.
    os.makedirs(db_dir, exist_ok=True)
    # 2. Touch the file so it exists before we check writability.
    if not os.path.exists(db_path):
        open(db_path, "a").close()

    # 3. The file AND its directory must be writable — SQLite writes a journal
    #    file alongside the DB, so a read-only directory also fails.
    if not os.access(db_path, os.W_OK):
        raise RuntimeError(
            f"[API Keychain] SQLite DB file is not writable: {db_path}\n"
            f"  Fix it, e.g.:  chmod u+w '{db_path}'   "
            f"(also check the file isn't owned by another user, e.g. from a sudo run)."
        )
    if not os.access(db_dir, os.W_OK | os.X_OK):
        raise RuntimeError(
            f"[API Keychain] SQLite DB directory is not writable: {db_dir}\n"
            f"  SQLite needs to create a journal here. Fix:  chmod u+w '{db_dir}'"
        )

    print(f"[API Keychain] SQLite DB path: {db_path} (writable=True)", flush=True)
    return db_path


_DB_URL = _resolve_db_url()
DATABASE_URL = _DB_URL.render_as_string(hide_password=False)  # string form for display
DB_PATH = _prepare_sqlite_path(_DB_URL)

_connect_args = (
    {"check_same_thread": False} if _DB_URL.get_backend_name() == "sqlite" else {}
)
engine = create_engine(_DB_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    # The API Keychain bearer token issued at registration. Indexed + unique so
    # it can resolve back to a user on every /v1/* request.
    api_key: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_utcnow)

    provider_keys: Mapped[list["ProviderKey"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class ProviderKey(Base):
    __tablename__ = "provider_keys"
    # Multiple keys per (user, provider) are allowed for rotation; they're kept
    # distinct by label. Labels are unique only within a (user, provider) pair.
    __table_args__ = (
        UniqueConstraint(
            "user_id", "provider", "key_label", name="uq_user_provider_label"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    provider: Mapped[str] = mapped_column(String, index=True, nullable=False)
    key_label: Mapped[str] = mapped_column(String, nullable=False, default="default")
    # AES-256-GCM ciphertext (base64), never the raw provider key.
    encrypted_key: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime, default=_utcnow, onupdate=_utcnow
    )

    user: Mapped["User"] = relationship(back_populates="provider_keys")


class RequestLog(Base):
    """One row per /v1/chat/completions request, for usage analytics."""

    __tablename__ = "request_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    timestamp: Mapped[dt.datetime] = mapped_column(
        DateTime, default=_utcnow, index=True
    )
    effort: Mapped[str] = mapped_column(String, nullable=False)
    # Ordered list of every model entry attempted, with its outcome:
    # [{"model": "...", "provider": "...", "status": 429, "error": "..."}].
    models_attempted: Mapped[list] = mapped_column(JSON, default=list)
    # The model entry / provider that ultimately served the request (if any).
    succeeded_model: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    provider: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    # "success" | "error"
    status: Mapped[str] = mapped_column(String, nullable=False)
    # Final HTTP status returned to the client (200, 409, 502, ...).
    status_code: Mapped[int] = mapped_column(Integer, default=0)
    # Which keychain key authenticated this request (for per-key rate limiting
    # and analytics). Nullable for rows written before this column existed.
    keychain_key_id: Mapped[Optional[int]] = mapped_column(
        Integer, index=True, nullable=True
    )


class KeychainKey(Base):
    """An API Keychain bearer token (ak-...). Stored only as a SHA-256 hash."""

    __tablename__ = "keychain_keys"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    label: Mapped[str] = mapped_column(String, nullable=False, default="primary")
    key_hash: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    # Non-reversible display form, e.g. "ak-abc…wxyz".
    masked: Mapped[str] = mapped_column(String, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    # Optional per-key requests-per-minute cap (None = unlimited).
    rate_limit_per_minute: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_utcnow)
    last_used_at: Mapped[Optional[dt.datetime]] = mapped_column(DateTime, nullable=True)


class ProviderHealth(Base):
    """Per (user, provider) health state used for routing decisions.

    Rolling request *counts* (last minute / day) are computed on demand from
    ``request_logs``; this table holds the sticky timestamps the router reads
    cheaply at routing time (notably ``last_429_at`` for cooldown).
    """

    __tablename__ = "provider_health"
    __table_args__ = (
        UniqueConstraint("user_id", "provider", name="uq_health_user_provider"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    provider: Mapped[str] = mapped_column(String, nullable=False)
    last_success_at: Mapped[Optional[dt.datetime]] = mapped_column(
        DateTime, nullable=True
    )
    last_failure_at: Mapped[Optional[dt.datetime]] = mapped_column(
        DateTime, nullable=True
    )
    last_429_at: Mapped[Optional[dt.datetime]] = mapped_column(DateTime, nullable=True)


class UserModel(Base):
    """A per-user override of, or addition to, the global model registry.

    A row exists only when the user has customized a model. Registry defaults
    that the user hasn't touched have no row — the effective list is computed by
    merging these overrides onto the registry. ``is_custom`` marks a model the
    user added that isn't in the registry at all.
    """

    __tablename__ = "user_models"
    __table_args__ = (
        UniqueConstraint("user_id", "model_entry", "tier", name="uq_user_model_tier"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    model_entry: Mapped[str] = mapped_column(String, nullable=False)
    tier: Mapped[str] = mapped_column(String, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)


class UserPreference(Base):
    """Per-user routing preferences (one row per user)."""

    __tablename__ = "user_preferences"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    # Ordered list of provider names to try first.
    preferred_providers: Mapped[list] = mapped_column(JSON, default=list)
    # Providers to never route to.
    excluded_providers: Mapped[list] = mapped_column(JSON, default=list)
    # Specific model entries to never route to.
    excluded_models: Mapped[list] = mapped_column(JSON, default=list)


def _migrate_provider_keys() -> None:
    """Bring a pre-Phase-3 provider_keys table up to the multi-key schema.

    The old table had UNIQUE(user_id, provider) and no key_label. SQLite can't
    drop a baked-in table constraint in place, so we rebuild: rename the old
    table aside, let create_all() build the new schema, copy rows over with
    key_label='default', then drop the old table. Idempotent and a no-op on
    fresh databases (where create_all already builds the right schema).
    """
    insp = inspect(engine)
    if "provider_keys" not in insp.get_table_names():
        return  # fresh DB; create_all() will build the new schema directly.
    cols = {c["name"] for c in insp.get_columns("provider_keys")}
    if "key_label" in cols:
        return  # already migrated.

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS provider_keys_old"))
        conn.execute(text("ALTER TABLE provider_keys RENAME TO provider_keys_old"))

    # create_all (called next) builds the new provider_keys; copy + cleanup after.


def _finish_provider_keys_migration() -> None:
    insp = inspect(engine)
    if "provider_keys_old" not in insp.get_table_names():
        return
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO provider_keys "
                "(id, user_id, provider, key_label, encrypted_key, created_at, updated_at) "
                "SELECT id, user_id, provider, 'default', encrypted_key, created_at, updated_at "
                "FROM provider_keys_old"
            )
        )
        conn.execute(text("DROP TABLE provider_keys_old"))


def _migrate_request_logs_keychain_col() -> None:
    """Add request_logs.keychain_key_id to pre-existing tables (idempotent)."""
    insp = inspect(engine)
    if "request_logs" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("request_logs")}
    if "keychain_key_id" not in cols:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE request_logs ADD COLUMN keychain_key_id INTEGER")
            )


def _migrate_keychain_keys() -> None:
    """Backfill a primary keychain key for any user that lacks one.

    Pre-Phase-5 users authenticated against the plaintext ``users.api_key``. We
    hash that into a ``keychain_keys`` row (so their existing ak-... token keeps
    working) and scrub the plaintext column to the hash so no token sits at rest.
    Idempotent: skips users that already have keychain keys.
    """
    from crypto import (
        hash_token,
        mask_token,
    )  # local import avoids cycle at import time

    with SessionLocal() as db:
        users = db.execute(select(User)).scalars().all()
        existing_user_ids = set(db.execute(select(KeychainKey.user_id)).scalars().all())
        changed = False
        for user in users:
            if user.id in existing_user_ids:
                continue
            plaintext = user.api_key
            h = hash_token(plaintext)
            db.add(
                KeychainKey(
                    user_id=user.id,
                    label="primary",
                    key_hash=h,
                    masked=mask_token(plaintext),
                    is_primary=True,
                    created_at=user.created_at or _utcnow(),
                )
            )
            # Scrub plaintext: store the hash instead (column stays non-null/unique).
            user.api_key = h
            changed = True
        if changed:
            db.commit()


def init_db() -> None:
    # The DB path was already resolved, prepared, and writability-checked at
    # import (see _prepare_sqlite_path). Here we just note size before/after so a
    # restart visibly "reuses existing" data rather than starting empty.
    had_data = bool(DB_PATH and os.path.getsize(DB_PATH) > 0)

    _migrate_provider_keys()
    Base.metadata.create_all(bind=engine)
    _finish_provider_keys_migration()
    _migrate_request_logs_keychain_col()
    _migrate_keychain_keys()

    if DB_PATH:
        size = os.path.getsize(DB_PATH)
        print(
            f"[API Keychain] DB ready: {DB_PATH} size={size}B "
            f"({'reused existing data' if had_data else 'initialized new'})",
            flush=True,
        )
