#!/usr/bin/env bash
# Run web SmartTests (Playwright) from repo-root tests/.
#
# Prerequisites: Docker, Node.js. Starts Docker API + Angular dev server (if not
# already running at BASE_URL, default http://localhost:4200 from tests/.env-QA).
#
# Usage (from repo root):
#   ./scripts/run-smarttests-web.sh
#   ./scripts/run-smarttests-web.sh --grep "main dishes"
#   ./scripts/run-smarttests-web.sh web/e2e/menu.spec.js
#   ./scripts/run-smarttests-web.sh --headed --workers 1
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=smarttests-common.sh
source "$ROOT/scripts/smarttests-common.sh"
smarttests_init_paths
cd "$ROOT"

smarttests_require_mcp_json
smarttests_start_backend

: "${BASE_URL:=http://localhost:4200}"
export BASE_URL

smarttests_ensure_web_dev_server "$BASE_URL"

smarttests_install_deps

echo "==> Running Playwright (web) — TestChimp env from .cursor/mcp.json"
smarttests_run_with_mcp_env \
  --project-type multi-platform \
  playwright test -c playwright.config.js --project=web "$@"
