#!/bin/sh
set -eu

LOG_FILE="$(mktemp)"
BASELINE_MIGRATION="20260413090000_init"

if npx prisma migrate deploy >"$LOG_FILE" 2>&1; then
  cat "$LOG_FILE"
else
  cat "$LOG_FILE"

  if grep -q "Error: P3005" "$LOG_FILE"; then
    echo "Existing database schema detected. Marking ${BASELINE_MIGRATION} as applied."
    npx prisma migrate resolve --applied "$BASELINE_MIGRATION"
    npx prisma migrate deploy
  else
    exit 1
  fi
fi

rm -f "$LOG_FILE"
exec node src/index.js
