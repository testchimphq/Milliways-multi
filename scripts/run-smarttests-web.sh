#!/usr/bin/env bash
# Run web SmartTests (Playwright) from repo-root tests/.
#
# Prerequisites: Docker, Node.js. Starts the API via Docker; expects the Angular
# dev server at BASE_URL (default http://localhost:4200 from tests/.env-QA).
#
# Usage (from repo root):
#   ./scripts/run-smarttests-web.sh
#   ./scripts/run-smarttests-web.sh --grep "main dishes"
#   ./scripts/run-smarttests-web.sh web/e2e/menu.spec.js
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

if ! smarttests_wait_for_url "$BASE_URL/" "web app ($BASE_URL)"; then
  echo "Start the web app in another terminal: cd web && npm install && npm start" >&2
  exit 1
fi

smarttests_install_deps

echo "==> Running Playwright (web) — TestChimp env from .cursor/mcp.json"
smarttests_run_with_mcp_env \
  --project-type multi-platform \
  playwright test -c playwright.config.js --project=web "$@"
