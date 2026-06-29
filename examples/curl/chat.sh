#!/usr/bin/env bash
# Chat completion via curl
#
# Usage:
#   export KEYCHAIN_KEY="ak-your-key"
#   export GATEWAY_URL="http://localhost:8000"
#   ./chat.sh

set -euo pipefail

KEYCHAIN_KEY="${KEYCHAIN_KEY:?Set KEYCHAIN_KEY to your ak- key}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8000}"

curl -sS "${GATEWAY_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${KEYCHAIN_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "keychain-medium",
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }' | jq .
