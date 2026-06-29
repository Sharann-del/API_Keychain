#!/usr/bin/env bash
# List available models (including keychain-* effort tiers)
#
# Usage:
#   export KEYCHAIN_KEY="ak-your-key"
#   ./list-models.sh

set -euo pipefail

KEYCHAIN_KEY="${KEYCHAIN_KEY:?Set KEYCHAIN_KEY}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8000}"

curl -sS "${GATEWAY_URL}/v1/models" \
  -H "Authorization: Bearer ${KEYCHAIN_KEY}" | jq '.data[].id'
