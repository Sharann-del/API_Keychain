"""AES-256-GCM encryption for stored provider API keys.

The encryption key is derived from the ``MASTER_SECRET`` environment variable
using HKDF-SHA256 so that an arbitrary-length, human-supplied secret becomes a
proper 32-byte key. Each ciphertext carries its own random 12-byte nonce and is
stored as base64(nonce || ciphertext_with_tag).
"""

import base64
import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

_NONCE_SIZE = 12  # 96-bit nonce, recommended for GCM
_KEY_SIZE = 32  # AES-256
# Static, non-secret context string mixed into key derivation.
_HKDF_INFO = b"api-keychain:provider-key-encryption:v1"


def _master_secret() -> bytes:
    secret = os.environ.get("MASTER_SECRET")
    if not secret:
        raise RuntimeError(
            "MASTER_SECRET environment variable is not set. "
            "Set it to a strong random string before starting the server."
        )
    return secret.encode("utf-8")


def _derive_key() -> bytes:
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=_KEY_SIZE,
        salt=None,
        info=_HKDF_INFO,
    )
    return hkdf.derive(_master_secret())


def encrypt(plaintext: str) -> str:
    """Encrypt a UTF-8 string, returning base64(nonce || ciphertext+tag)."""
    aesgcm = AESGCM(_derive_key())
    nonce = os.urandom(_NONCE_SIZE)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    return base64.b64encode(nonce + ciphertext).decode("ascii")


def decrypt(token: str) -> str:
    """Reverse :func:`encrypt`. Raises on tampering or wrong key."""
    raw = base64.b64decode(token)
    nonce, ciphertext = raw[:_NONCE_SIZE], raw[_NONCE_SIZE:]
    aesgcm = AESGCM(_derive_key())
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode("utf-8")


# --------------------------------------------------------------------------- #
# Keychain (ak-...) token hashing — these tokens are stored only as a hash, so
# the plaintext is shown to the user exactly once at creation. SHA-256 is fine
# here: the tokens are long, high-entropy random secrets, not guessable
# passwords, so no slow KDF is needed for lookup.
# --------------------------------------------------------------------------- #
def hash_token(token: str) -> str:
    """Return the hex SHA-256 of an API Keychain token, for storage/comparison."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def mask_token(token: str) -> str:
    """A non-reversible display form, e.g. ``ak-abc…wxyz``."""
    if len(token) <= 12:
        return token[:3] + "…"
    return f"{token[:6]}…{token[-4:]}"
