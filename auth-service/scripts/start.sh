#!/bin/sh
set -eu

LOG_FILE="$(mktemp)"
BASELINE_MIGRATION="20260413090000_init"
RESOLVE_LOG=""

if npx prisma migrate deploy >"$LOG_FILE" 2>&1; then
  cat "$LOG_FILE"
else
  cat "$LOG_FILE"

  if grep -q "Error: P3005" "$LOG_FILE"; then
    echo "Existing database schema detected. Marking ${BASELINE_MIGRATION} as applied."
    RESOLVE_LOG="$(mktemp)"

    if npx prisma migrate resolve --applied "$BASELINE_MIGRATION" >"$RESOLVE_LOG" 2>&1; then
      cat "$RESOLVE_LOG"
    else
      cat "$RESOLVE_LOG"

      if grep -q "Error: P3008" "$RESOLVE_LOG"; then
        echo "Migration ${BASELINE_MIGRATION} was already marked as applied. Continuing."
      else
        rm -f "$LOG_FILE" "$RESOLVE_LOG"
        exit 1
      fi
    fi

    npx prisma migrate deploy
  else
    rm -f "$LOG_FILE"
    exit 1
  fi
fi

if [ -n "$RESOLVE_LOG" ]; then
  rm -f "$LOG_FILE" "$RESOLVE_LOG"
else
  rm -f "$LOG_FILE"
fi

exec node src/index.js
