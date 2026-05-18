#!/usr/bin/env bash
# Local SmartTests (ios/tc-tests) on iOS Simulator with the local Docker backend.
# Prerequisites: Xcode, Docker, Makefile `build` / `boot` targets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${DEVICE_NAME:=iPhone 17 Pro}"
: "${MILLIWAYS_API_BASE_URL:=http://localhost:3001}"
export DEVICE_NAME
export MILLIWAYS_API_BASE_URL

echo "==> Starting local backend"
docker compose up --build -d

echo "==> Waiting for backend at $MILLIWAYS_API_BASE_URL"
for _ in {1..60}; do
  if curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null; then
    break
  fi
  sleep 2
done
curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null

echo "==> Building Debug app for Simulator ($DEVICE_NAME)"
make -C "$ROOT/ios" build

echo "==> Booting Simulator"
make -C "$ROOT/ios" boot

export IOS_APP_PATH="$ROOT/ios/build/Build/Products/Debug-iphonesimulator/Milliways.app"
if [[ ! -d "$IOS_APP_PATH" ]]; then
  echo "Expected app not found: $IOS_APP_PATH" >&2
  exit 1
fi

echo "==> Installing app on booted Simulator"
xcrun simctl install booted "$IOS_APP_PATH"

echo "==> Running SmartTests order flow from ios/tc-tests (TestChimp env from ios/.cursor/mcp.json when present)"
cd "$ROOT/ios/tc-tests"
node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" --mcp-json "$ROOT/ios/.cursor/mcp.json" --tests-root "$ROOT/ios/tc-tests" --project-type ios -- order-flow.spec.js
