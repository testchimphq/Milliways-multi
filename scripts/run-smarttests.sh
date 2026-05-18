#!/usr/bin/env bash
# Back-compat wrapper — prefer platform-specific scripts:
#   ./scripts/run-smarttests-web.sh
#   ./scripts/run-smarttests-ios.sh
#   ./scripts/run-smarttests-android.sh
#
# Usage (from repo root):
#   ./scripts/run-smarttests.sh web|ios|android [runner args...]
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLATFORM="${1:-}"
shift || true

case "$PLATFORM" in
  web)
    exec "$SCRIPT_DIR/run-smarttests-web.sh" "$@"
    ;;
  ios)
    exec "$SCRIPT_DIR/run-smarttests-ios.sh" "$@"
    ;;
  android)
    exec "$SCRIPT_DIR/run-smarttests-android.sh" "$@"
    ;;
  *)
    echo "Usage: $0 web|ios|android [test runner args...]" >&2
    echo "  ./scripts/run-smarttests-web.sh" >&2
    echo "  ./scripts/run-smarttests-ios.sh" >&2
    echo "  ./scripts/run-smarttests-android.sh" >&2
    exit 1
    ;;
esac
