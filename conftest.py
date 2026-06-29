import os
import tempfile
import pytest
from fastapi.testclient import TestClient

# Force a temp-file SQLite DB for every test run so tests never touch keychain.db
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_tmp.name}")
os.environ.setdefault("MASTER_SECRET", "test-secret-for-tests-only")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret")

from main import app  # noqa: E402 — import after env is set

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c
