#!/usr/bin/env bash
# Deprecated wrapper — SmartTests live at repo-root tests/, not ios/tc-tests.
# Forwards to scripts/run-smarttests.sh ios
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/scripts/run-smarttests.sh" ios "$@"
