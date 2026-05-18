#!/usr/bin/env bash
# Run Android SmartTests (Mobilewright) from repo-root tests/.
#
# Usage (from repo root):
#   ./scripts/run-smarttests-android.sh
#   ./scripts/run-smarttests-android.sh --grep "main dishes"
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=smarttests-common.sh
source "$ROOT/scripts/smarttests-common.sh"
smarttests_init_paths
cd "$ROOT"

smarttests_require_mcp_json
smarttests_start_backend

echo "==> Building Android debug APK"
(cd "$ROOT/android" && ./gradlew :app:assembleDebug)
export ANDROID_APK_PATH="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"

smarttests_install_deps

echo "==> Running Mobilewright (android) — TestChimp env from .cursor/mcp.json"
smarttests_run_with_mcp_env \
  mobilewright test -c mobilewright.config.ts --project=android \
  mobile/e2e/common "$@"
