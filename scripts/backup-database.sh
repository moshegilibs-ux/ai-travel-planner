#!/usr/bin/env sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required before running a production backup." >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump was not found. Install PostgreSQL client tools first." >&2
  exit 1
fi

OUTPUT_DIR="${1:-./backups}"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$OUTPUT_DIR/trippilot-$TIMESTAMP.dump"

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$TARGET"

echo "Backup created: $TARGET"
