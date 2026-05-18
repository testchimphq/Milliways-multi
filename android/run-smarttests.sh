#!/usr/bin/env bash
# Run the full Android SmartTests suite (android/tests) on a connected emulator/device + Docker backend + TestChimp env.
# Prerequisites: Android SDK (adb), Docker, jq. Keys: android/.cursor/mcp.json (gitignored).
#
# Usage:
#   ./android/run-smarttests.sh              # full suite
#   ./android/run-smarttests.sh smoke.quick.spec.js
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${MILLIWAYS_API_BASE_URL:=http://localhost:3001}"
export MILLIWAYS_API_BASE_URL

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if ! adb devices | grep -E '^\S+\s+device$' -q; then
  echo "ERROR: No Android device or emulator connected (adb devices)." >&2
  echo "Start an AVD from Android Studio or: emulator -avd <name> &" >&2
  exit 1
fi

MCP_JSON="$ROOT/android/.cursor/mcp.json"
if [[ -f "$MCP_JSON" ]]; then
  export TESTCHIMP_API_KEY="$(jq -r '.mcpServers.testchimp.env.TESTCHIMP_API_KEY' "$MCP_JSON")"
  export TESTCHIMP_BACKEND_URL="$(jq -r '.mcpServers.testchimp.env.TESTCHIMP_BACKEND_URL // empty' "$MCP_JSON")"
else
  echo "WARN: $MCP_JSON not found — set TESTCHIMP_API_KEY (and optional TESTCHIMP_BACKEND_URL) in the environment." >&2
fi
export TESTCHIMP_PROJECT_TYPE="${TESTCHIMP_PROJECT_TYPE:-android}"

echo "==> Starting local backend"
docker compose up --build -d

echo "==> Waiting for backend at $MILLIWAYS_API_BASE_URL"
for _ in {1..60}; do
  if curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null

echo "==> Building debug APK"
(cd "$ROOT/android" && ./gradlew :app:assembleDebug --no-daemon)

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
export ANDROID_APK_PATH="$APK"
if [[ ! -f "$APK" ]]; then
  echo "Expected APK not found: $APK" >&2
  exit 1
fi

echo "==> Installing APK on device(s)"
adb install -r "$APK"

echo "==> Installing npm dependencies (android/tests)"
npm ci --prefix "$ROOT/android/tests"

echo "==> Running SmartTests"
cd "$ROOT/android/tests"
if [[ $# -gt 0 ]]; then
  node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" --mcp-json "$MCP_JSON" --tests-root "$ROOT/android/tests" --project-type android -- "$@"
else
  node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" --mcp-json "$MCP_JSON" --tests-root "$ROOT/android/tests" --project-type android
fi
