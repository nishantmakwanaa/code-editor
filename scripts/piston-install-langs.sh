#!/usr/bin/env bash
# Install common Piston language packages into the running codex-piston container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/docker-compose.piston.yml"
CONTAINER="${PISTON_CONTAINER:-codex-piston}"

# Package names from https://github.com/engineer-man/piston/tree/master/packages
LANGS=(
  python
  javascript
  node
  typescript
  java
  gcc
  g++
  rust
  go
  php
  ruby
  bash
  csharp
  kotlin
  swift
)

if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
  echo "Piston container '${CONTAINER}' is not running."
  echo "Start it with: pnpm piston:up"
  exit 1
fi

echo "Installing languages into ${CONTAINER} (this can take several minutes)..."
for lang in "${LANGS[@]}"; do
  echo "→ ${lang}"
  docker exec "${CONTAINER}" piston ppman install "${lang}" || echo "  (skipped or failed: ${lang})"
done

echo ""
echo "Installed runtimes:"
curl -s http://localhost:2000/api/v2/runtimes | head -c 4000
echo ""
