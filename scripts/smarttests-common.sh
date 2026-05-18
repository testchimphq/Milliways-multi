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
  echo "==> Waiting for $label"
  for _ in {1..60}; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  echo "Timed out waiting for $label ($url)" >&2
  return 1
}

smarttests_run_with_mcp_env() {
  node "$SMARTTESTS_ROOT/scripts/run-mobilewright-with-mcp-env.mjs" \
    --mcp-json "$SMARTTESTS_MCP_JSON" \
    --tests-root "$SMARTTESTS_TESTS_DIR" \
    -- "$@"
}
