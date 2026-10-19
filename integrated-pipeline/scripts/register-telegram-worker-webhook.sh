#!/usr/bin/env bash
set -euo pipefail
: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN}"
: "${WORKER_PUBLIC_URL:?Set WORKER_PUBLIC_URL, e.g. https://video-subtitle-api.<subdomain>.workers.dev}"
curl -fsS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H 'Content-Type: application/json' \
  --data "{\"url\":\"${WORKER_PUBLIC_URL}/telegram/webhook\"}"
