# Shared helpers for run-smarttests-*.sh (source only — do not execute directly).
# shellcheck shell=bash

smarttests_init_paths() {
  SMARTTESTS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  SMARTTESTS_MCP_JSON="${SMARTTESTS_MCP_JSON:-$SMARTTESTS_ROOT/.cursor/mcp.json}"
  SMARTTESTS_TESTS_DIR="$SMARTTESTS_ROOT/tests"
}

smarttests_require_mcp_json() {
  if [[ ! -f "$SMARTTESTS_MCP_JSON" ]]; then
    echo "Missing $SMARTTESTS_MCP_JSON — add testchimp MCP env (TESTCHIMP_API_KEY, TESTCHIMP_BACKEND_URL)." >&2
    exit 1
  fi
}

smarttests_stop_backend() {
  echo "==> Stopping existing Milliways Docker stack (if any)"
  (cd "$SMARTTESTS_ROOT" && docker compose down --remove-orphans --timeout 10) || true

  local leftover
  leftover="$(docker ps -aq --filter "name=milliways-multi-" 2>/dev/null || true)"
  if [[ -n "$leftover" ]]; then
    echo "==> Removing leftover milliways-multi containers"
    # shellcheck disable=SC2086
    docker rm -f $leftover >/dev/null 2>&1 || true
  fi
}

# Stop any Docker container still publishing a host port (e.g. stale postgres on 5432).
smarttests_free_docker_port() {
  local port="$1"
  local cid name
  while IFS= read -r cid; do
    [[ -z "$cid" ]] && continue
    name="$(docker inspect -f '{{.Name}}' "$cid" 2>/dev/null | sed 's/^\///')"
    echo "==> Stopping container ${name:-$cid} (host port $port)"
    docker rm -f "$cid" >/dev/null 2>&1 || true
  done < <(docker ps -q --filter "publish=$port" 2>/dev/null || true)
}

smarttests_start_backend() {
  : "${MILLIWAYS_API_BASE_URL:=http://localhost:3001}"
  export MILLIWAYS_API_BASE_URL

  smarttests_stop_backend
  smarttests_free_docker_port 5432
  smarttests_free_docker_port 3001

  echo "==> Starting local backend"
  (cd "$SMARTTESTS_ROOT" && docker compose up --build -d)

  echo "==> Waiting for backend at $MILLIWAYS_API_BASE_URL"
  for _ in {1..60}; do
    if curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
  curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null
}

smarttests_install_deps() {
  echo "==> Installing SmartTests dependencies"
  npm ci --prefix "$SMARTTESTS_TESTS_DIR"
}

smarttests_wait_for_url() {
  local url="$1"
  local label="${2:-$url}"
  local max_attempts="${3:-60}"
  echo "==> Waiting for $label"
  for ((attempt = 1; attempt <= max_attempts; attempt++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  echo "Timed out waiting for $label ($url)" >&2
  return 1
}

SMARTTESTS_WEB_PID=""
SMARTTESTS_WEB_STARTED_BY_SCRIPT=false

smarttests_cleanup_web_dev_server() {
  if [[ "$SMARTTESTS_WEB_STARTED_BY_SCRIPT" == true && -n "$SMARTTESTS_WEB_PID" ]]; then
    echo "==> Stopping web dev server (pid $SMARTTESTS_WEB_PID)"
    kill "$SMARTTESTS_WEB_PID" 2>/dev/null || true
    wait "$SMARTTESTS_WEB_PID" 2>/dev/null || true
  fi
}

# Stop any process listening on the web dev port so `ng serve` picks up dependency changes.
smarttests_stop_web_dev_server_on_port() {
  local port="${1:-4200}"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi
  echo "==> Stopping process(es) on port $port ($pids) for fresh web bundle"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 1
}

# Start `ng serve` when BASE_URL is not already up (web SmartTests only).
smarttests_ensure_web_dev_server() {
  local base_url="${1:-http://localhost:4200}"

  echo "==> Installing web dependencies"
  if [[ -f "$SMARTTESTS_ROOT/web/package-lock.json" ]]; then
    npm ci --prefix "$SMARTTESTS_ROOT/web"
  else
    npm install --prefix "$SMARTTESTS_ROOT/web"
  fi

  # Always restart so @testchimp/rum-js updates are bundled (stale ng serve skips npm ci otherwise).
  smarttests_stop_web_dev_server_on_port "${base_url##*:}"

  if curl -fsS "${base_url}/" >/dev/null 2>&1; then
    echo "==> Web app already running at $base_url"
    return 0
  fi

  local log_file="$SMARTTESTS_ROOT/.web-dev-server.log"
  echo "==> Starting web dev server (npm start) — log: $log_file"
  (cd "$SMARTTESTS_ROOT/web" && npm start) >"$log_file" 2>&1 &
  SMARTTESTS_WEB_PID=$!
  SMARTTESTS_WEB_STARTED_BY_SCRIPT=true
  trap smarttests_cleanup_web_dev_server EXIT INT TERM

  if ! smarttests_wait_for_url "${base_url}/" "web app ($base_url)" 90; then
    echo "Web dev server did not become ready. Last lines of $log_file:" >&2
    tail -40 "$log_file" >&2 || true
    exit 1
  fi
}

smarttests_run_with_mcp_env() {
  # Runner args (playwright/mobilewright) follow wrapper flags; do not use `--` here or
  # `--project-type` and similar would be passed to Playwright/Mobilewright instead.
  node "$SMARTTESTS_ROOT/scripts/run-mobilewright-with-mcp-env.mjs" \
    --mcp-json "$SMARTTESTS_MCP_JSON" \
    --tests-root "$SMARTTESTS_TESTS_DIR" \
    "$@"
}
