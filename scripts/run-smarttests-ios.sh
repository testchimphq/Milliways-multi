#!/usr/bin/env bash
# Run iOS SmartTests (Mobilewright) from repo-root tests/.
#
# Usage (from repo root):
#   ./scripts/run-smarttests-ios.sh
#   ./scripts/run-smarttests-ios.sh --grep "main dishes"
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=smarttests-common.sh
source "$ROOT/scripts/smarttests-common.sh"
smarttests_init_paths
cd "$ROOT"

smarttests_require_mcp_json
smarttests_start_backend

: "${DEVICE_NAME:=iPhone 17 Pro}"
export DEVICE_NAME

echo "==> Building iOS app ($DEVICE_NAME)"
make -C "$ROOT/ios" build
make -C "$ROOT/ios" boot

IOS_PRODUCTS="$ROOT/ios/build/Build/Products/Debug-iphonesimulator"
IOS_APP="$IOS_PRODUCTS/Milliways.app"
IOS_ZIP="$IOS_PRODUCTS/Milliways.zip"
if [[ ! -f "$IOS_ZIP" ]] || [[ "$IOS_APP" -nt "$IOS_ZIP" ]]; then
  (cd "$IOS_PRODUCTS" && zip -qr Milliways.zip Milliways.app)
fi
export IOS_APP_PATH="$IOS_ZIP"
xcrun simctl install booted "$IOS_APP"

smarttests_install_deps

echo "==> Running Mobilewright (ios) — TestChimp env from .cursor/mcp.json"
smarttests_run_with_mcp_env \
  mobilewright test -c mobilewright.config.ts --project=ios \
  mobile/e2e/common "$@"
