# Streaming chat completion
#
# Usage:
#   export KEYCHAIN_KEY="ak-your-key"
#   ./stream.sh

set -euo pipefail

KEYCHAIN_KEY="${KEYCHAIN_KEY:?Set KEYCHAIN_KEY}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8000}"

curl -sS -N "${GATEWAY_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${KEYCHAIN_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "keychain-low",
    "stream": true,
    "messages": [{"role": "user", "content": "Count from 1 to 5 slowly."}]
  }'
