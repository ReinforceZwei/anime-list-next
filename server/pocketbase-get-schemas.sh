#!/usr/bin/env bash
#
# pocketbase-get-schemas.sh
# Fetches PocketBase collection schemas via admin API using curl + jq
#
# Usage:
#   ./pocketbase-get-schemas.sh                  # → all collections (pretty JSON)
#   ./pocketbase-get-schemas.sh articles         # → only "articles" collection (pretty JSON)
#   PB_URL="https://pb.yourdomain.com" ./pocketbase-get-schemas.sh
#

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
#  CONFIG - CHANGE THESE VALUES
# ──────────────────────────────────────────────────────────────────────────────

PB_URL="${PB_URL:-http://127.0.0.1:8090}"
ADMIN_EMAIL="admin@pb.local"
ADMIN_PASSWORD="adminadmin"

COLLECTION="${1:-}"

# ──────────────────────────────────────────────────────────────────────────────

AUTH_RESPONSE=$(curl -s -X POST "${PB_URL}/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${ADMIN_EMAIL}\", \"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo "${AUTH_RESPONSE}" | jq -r '.token // empty')

if [ -z "${TOKEN}" ]; then
  echo "Error: Authentication failed." >&2
  echo "${AUTH_RESPONSE}" | jq . >&2
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────

if [ -n "${COLLECTION}" ]; then
  curl -s "${PB_URL}/api/collections/${COLLECTION}" \
    -H "Authorization: ${TOKEN}" \
    | jq .
else
  curl -s "${PB_URL}/api/collections?perPage=200" \
    -H "Authorization: ${TOKEN}" \
    | jq '[.items[] | select(.system == false)]'
fi
