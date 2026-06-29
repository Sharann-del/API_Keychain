"""Load .env.local / .env before other modules read os.environ.
Next.js loads .env.local for the dashboard; FastAPI does not unless we load it here.
Import this at the top of main.py before models/crypto initialize.
"""
from __future__ import annotations
from pathlib import Path
from dotenv import load_dotenv

def load_project_env() -> None:
    root = Path(__file__).resolve().parent
    load_dotenv(root / ".env.local")
    load_dotenv(root / ".env")
    import os
    if not os.environ.get("SUPABASE_URL"):
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        if url:
            os.environ["SUPABASE_URL"] = url

load_project_env()
