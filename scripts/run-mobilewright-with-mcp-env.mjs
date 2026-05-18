#!/usr/bin/env node
/**
 * Run Mobilewright from a SmartTests root with TestChimp env from a chosen MCP JSON
 * (`mcpServers.testchimp.env`: TESTCHIMP_API_KEY, optional TESTCHIMP_BACKEND_URL).
 *
 * Defaults: repo `.cursor/mcp.json` + `tests/` SmartTests root.
 *
 * Usage:
 *   node scripts/run-mobilewright-with-mcp-env.mjs [args...]   # legacy: args → mobilewright
 *   node scripts/run-mobilewright-with-mcp-env.mjs --mcp-json android/.cursor/mcp.json \
 *     --tests-root android/tests --project-type android -- smoke.quick.spec.js
 */
import { existsSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

let mcpPath = join(repoRoot, '.cursor', 'mcp.json');
let testsRoot = join(repoRoot, 'tests');
let projectType = 'mobile';
let explicitMcpJson = false;

const raw = process.argv.slice(2);
const passthrough = [];
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a === '--mcp-json' && raw[i + 1]) {
    explicitMcpJson = true;
    const p = raw[++i];
    mcpPath = isAbsolute(p) ? p : resolve(process.cwd(), p);
    continue;
  }
  if (a === '--tests-root' && raw[i + 1]) {
    const p = raw[++i];
    testsRoot = isAbsolute(p) ? p : resolve(process.cwd(), p);
    continue;
  }
  if (a === '--project-type' && raw[i + 1]) {
    projectType = String(raw[++i]).toLowerCase();
    continue;
  }
  if (a === '--') {
    passthrough.push(...raw.slice(i + 1));
    break;
  }
  passthrough.push(a);
}

const env = { ...process.env };

function applyTestchimpEnvFromMcp(mcpJson) {
  const te = mcpJson?.mcpServers?.testchimp?.env;
  if (te?.TESTCHIMP_API_KEY) {
    env.TESTCHIMP_API_KEY = String(te.TESTCHIMP_API_KEY).trim();
  }
  if (te?.TESTCHIMP_BACKEND_URL) {
    env.TESTCHIMP_BACKEND_URL = String(te.TESTCHIMP_BACKEND_URL).trim();
  }
}

/**
 * SmartTests root is `tests/` (mapped in TestChimp). Paths are relative to that folder, not repo root.
 * Matches legacy ios/tc-tests reporter config (`testsFolder: '.'`).
 */
env.TESTCHIMP_TESTS_FOLDER = env.TESTCHIMP_TESTS_FOLDER || '.';

if (explicitMcpJson) {
  if (!existsSync(mcpPath)) {
    console.error(`[run-mobilewright-with-mcp-env] --mcp-json: file not found: ${mcpPath}`);
    process.exit(1);
  }
  let mcp;
  try {
    mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[run-mobilewright-with-mcp-env] --mcp-json: invalid JSON at ${mcpPath}: ${msg}`);
    process.exit(1);
  }
  applyTestchimpEnvFromMcp(mcp);
  if (!env.TESTCHIMP_API_KEY?.trim()) {
    console.error(
      '[run-mobilewright-with-mcp-env] --mcp-json: mcpServers.testchimp.env.TESTCHIMP_API_KEY is missing or blank.'
    );
    process.exit(1);
  }
} else if (existsSync(mcpPath)) {
  try {
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
    applyTestchimpEnvFromMcp(mcp);
  } catch {
    console.warn('[run-mobilewright-with-mcp-env] Could not parse MCP JSON; using process env only.');
  }
} else {
  console.error(`[run-mobilewright-with-mcp-env] Missing MCP config at ${mcpPath}`);
  console.error('Create .cursor/mcp.json with mcpServers.testchimp.env (TESTCHIMP_API_KEY, TESTCHIMP_BACKEND_URL).');
  process.exit(1);
}

if (!env.TESTCHIMP_API_KEY?.trim()) {
  console.error('[run-mobilewright-with-mcp-env] TESTCHIMP_API_KEY is missing (set in .cursor/mcp.json).');
  process.exit(1);
}
if (!env.TESTCHIMP_BACKEND_URL?.trim()) {
  console.error('[run-mobilewright-with-mcp-env] TESTCHIMP_BACKEND_URL is missing (set in .cursor/mcp.json).');
  process.exit(1);
}

console.log(
  `[run-mobilewright-with-mcp-env] Reporter env: TESTCHIMP_BACKEND_URL=${env.TESTCHIMP_BACKEND_URL} ` +
    `TESTCHIMP_API_KEY=set testsFolder=${env.TESTCHIMP_TESTS_FOLDER}`
);

env.TESTCHIMP_PROJECT_TYPE = env.TESTCHIMP_PROJECT_TYPE || projectType;
env.TESTCHIMP_MOBILE_TEST_MODULE = '@mobilewright/test';

if (!env.TESTCHIMP_BRANCH_NAME) {
  const g = spawnSync('git', ['-C', repoRoot, 'branch', '--show-current'], { encoding: 'utf8' });
  const b = g.stdout?.trim();
  if (b) env.TESTCHIMP_BRANCH_NAME = b;
}

const mwArgs = ['mobilewright', 'test', ...passthrough];

const r = spawnSync('npx', mwArgs, {
  cwd: testsRoot,
  env,
  stdio: 'inherit',
});

process.exit(r.status ?? 1);
