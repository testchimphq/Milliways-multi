# Milliways — TestChimp agent instructions

## Repo layout vs TestChimp mappings

- **App surfaces:** `web/` (Angular), `ios/`, `android/` — shared `backend/` API.
- **SmartTests root:** `tests/` (to be scaffolded via `/testchimp test` — `project_type=multi-platform`).
- **Plans root:** `plans/` (`.testchimp-plans`) — unified multi-platform TestChimp project.
- **TestChimp project ID:** `161eddb8-16ef-4f47-b205-6caa5f03d5b9` (staging backend; web + iOS + Android).
- **MCP / CLI / runner env:** repo-root `.cursor/mcp.json` → `TESTCHIMP_API_KEY`, `TESTCHIMP_BACKEND_URL` (staging). File is **gitignored** — copy from a teammate or create locally. `scripts/run-smarttests-{web,ios,android}.sh` (and `npm run test:*` from `tests/`) apply these to the test runner automatically. Never commit keys.

## Init progress

### Phase 0 (quick smoke)

- **Offered:** yes (user continued full init without a separate smoke-only pass).
- **Smoke specs:** `menu.spec.js` + `navigation.spec.js` authored under `tests/mobile/e2e/common/` (run via `./scripts/run-smarttests.sh` when stack + simulator/device are up).

### Phase 1–3 completion (2026-05-18)

| Key area | Status |
|----------|--------|
| 1 Basic integration | **done** — markers, `tests/package.json`, MCP `get-eaas-config` OK, iOS bundle id `com.mobilenext.Milliways` |
| 2 Import strategy | **N/A** — greenfield under `tests/` |
| 3 Mocking | **done** — HTTP N/A, AIMock deferred |
| 4 TrueCoverage | **done** — enabled; three events; no new instrumentation this pass |
| 5 Environment | **done** — local Docker + build/run scripts documented below |
| 6 CI | **deferred** — no GitHub Actions yet |

### Completed Items

- Unified `tests/` + `plans/` markers; multi-platform scaffold with `@testchimp/playwright` reporter.
- Workstation MCP at `.cursor/mcp.json` (staging, gitignored).
- `tests/package.json` + lockfile: `mobilewright` / `@mobilewright/test` **0.0.38**, `@playwright/test` + `playwright` **1.59.1** (TestChimp minimum; npm **`overrides`** force **1.59.1** for Mobilewright’s nested `playwright` too — do not bump to **1.60+** without re-validating both runners).
- SmartTests — **mobile:** `mobile/e2e/common/menu.spec.js` (#TS-105), `navigation.spec.js` (#TS-109). **Web:** `web/e2e/menu.spec.js` (#TS-105, #TS-106), `web/e2e/account.spec.js` (#TS-109). Shared: `shared/seed-user.js`, `shared/menu-catalog.js`, `shared/mobile-auth.js`, `shared/web-auth.js`; `installTestChimp` in `mobile/fixtures/index.js` and `web/fixtures/index.js`.
- TrueCoverage RUM wired in app; events documented under `plans/events/` (no expansion in init).

### Pending Items

- Additional scenario coverage beyond menu + navigation smoke paths.
- CI workflow update (deferred by team choice).
- First full device/browser validation of new web + mobile specs on a fresh stack (run when Docker + web/iOS builds are up).

### Deferred Items

- AIMock / LLM mocking — N/A.
- CI SmartTests jobs — not needed yet.

---

## Environment Provision Strategy

### Local - Test Authoring

SmartTests root is **`tests/`** at the **repo root** (scaffold via `/testchimp test`; `project_type=multi-platform`).

1. **Backend** (repo root): `docker compose up --build -d` then `curl -fsS http://localhost:3001/health`
2. **Web app:** `./scripts/run-smarttests-web.sh` starts `ng serve` automatically if `:4200` is down (log: `.web-dev-server.log`; stops the server when the script exits). Or run `cd web && npm start` yourself first.
3. **iOS app:** `cd ios && make build` → `ios/build/Build/Products/Debug-iphonesimulator/Milliways.app`
4. **Android APK:** `cd android && ./gradlew :app:assembleDebug`
4. **Run** (repo root — recommended):

```bash
./scripts/run-smarttests-web.sh    # Playwright — starts Docker + ng serve when needed
./scripts/run-smarttests-ios.sh
./scripts/run-smarttests-android.sh
```

Or from `tests/` after `npm ci` (requires **Docker backend** + **`cd web && npm start`** for web; see `.env-QA` `BASE_URL` / `MILLIWAYS_API_BASE_URL`):

```bash
cd tests
npm run test:web      # Playwright — project web
npm run test:ios      # loads .cursor/mcp.json → TESTCHIMP_BACKEND_URL + API key
npm run test:android
```

`scripts/run-mobilewright-with-mcp-env.mjs` **requires** `.cursor/mcp.json` and exports **`TESTCHIMP_API_KEY`** + **`TESTCHIMP_BACKEND_URL`** (staging) on the Mobilewright process. Reporter does **not** use `TESTCHIMP_PROJECT_ID` (that is for app TrueCoverage/RUM only). `TESTCHIMP_TESTS_FOLDER=.` (paths relative to SmartTests root `tests/`).

Overrides: `IOS_APP_PATH`, `ANDROID_APK_PATH`, `MILLIWAYS_API_BASE_URL` (`tests/.env-QA`).

RUM: `web/src/environments/*.ts` (`@testchimp/rum-js`), `android/gradle.properties`, Xcode `TESTCHIMP_*` build settings. Web emits use `platform: web`.

### CI - Test Execution

Deferred. When enabled, use macOS for iOS Simulator + `tests/` as cwd; pass `TESTCHIMP_API_KEY` and `TESTCHIMP_BACKEND_URL` as secrets.

## TrueCoverage Plan

- **Enabled** for staging unified project `161eddb8-16ef-4f47-b205-6caa5f03d5b9`.
- **Instrumented events (current slice only):** `auth-session-started`, `menu-loaded`, `order-submitted-success` — see `plans/events/` and `plans/knowledge/truecoverage-instrument-progress.md`.
- **RUM `environment` tag:** Web uses `staging` in `web/src/environments/*.ts` (`testchimpEnvironment` — not runner `TESTCHIMP_ENV`). Mobile Debug uses `staging` (iOS plist / Android `BuildConfig`). Filter TrueCoverage in MCP with tags that match these values (`list-rum-environments`).
- **Web RUM:** `@testchimp/rum-js@0.1.2` — `web/src/app/rum/milliways-rum.service.ts`; `APP_INITIALIZER` in `app.config.ts`.
- **Mobile SmartTests:** `installTestChimp(..., { uiFixture: 'screen' })` in `tests/mobile/fixtures/index.js` and `projects[].use.platform` (`ios` / `android`) in `tests/mobilewright.config.ts`. `@testchimp/playwright` **0.2.1** (latest npm) applies TrueCoverage `v1/set` from the **`device`** fixture. iOS **`bundleId`:** `com.mobilenext.Milliways`; Android: `com.mobilenext.milliways`.
- **Web SmartTests:** `installTestChimp` on `tests/web/fixtures/index.js` when multi-platform scaffold exists; reporter links test identity via `page` (no native URL scheme).

## Mocking Plan

- **http_mocking:** N/A — local Docker API; mobile UI flows.
- **aimock:** deferred / not applicable.

## ExploreChimp

- Use `markScreenState` in UI SmartTests when running explorations.
- Set `EXPLORECHIMP_ENABLED` per team policy; `TESTCHIMP_BRANCH_NAME` from current git branch for local runs.

## Past learnings — authoring & validation (FAQ)

### Q: Reporter or API returns 401

**A:** Use `./scripts/run-smarttests-ios.sh` (or `npm run test:ios` from `tests/`). Confirm: `Reporter env: TESTCHIMP_BACKEND_URL=https://featureservice-staging.testchimp.io TESTCHIMP_API_KEY=set`. Reporter does **not** use `TESTCHIMP_PROJECT_ID`. If runs ingest but `testFound=false`, sync the mapped **`tests/`** folder in TestChimp (Git integration).

### Q: Tests cannot find the app bundle or APK

**A:** Build iOS (`make build`) or Android (`./gradlew :app:assembleDebug`), or set `IOS_APP_PATH` / `ANDROID_APK_PATH`. **mobilewright 0.0.37+** (iOS simulator): `installApps` must be a **`.zip`** of the `.app` (see `run-smarttests.sh` — it zips after build). Android still uses `.apk`.

### Q: No TrueCoverage / RUM emits on Android (iOS works)

**A:** The debug APK at `android/app/build/outputs/apk/debug/app-debug.apk` is often **stale**. Mobilewright installs whatever is on disk; an APK built **before** `testchimp-rum-android` was added contains **no RUM SDK** (no `menu_loaded` / `auth_session_started`, automation `SET` is a no-op). Rebuild: `cd android && ./gradlew :app:assembleDebug`, or run `./scripts/run-smarttests-android.sh` from repo root (builds APK + backend). After rebuild, logcat should show `am start … testchimp-rum://truecoverage/v1/set?p=…` per test.

### Q: RUM events missing `ci_test_info` on mobile

**A:** Use `@testchimp/playwright` **0.2.1**, `installTestChimp` with `uiFixture: 'screen'`, and `use.platform: 'ios'` or `'android'` on the Mobilewright UI project. Run with `--project=ios` or `--project=android`. Expect `device.openUrl` to `testchimp-rum://truecoverage/v1/set?p=...` once per test at device fixture start (plus trailing set+flush in `afterEach`). Import `test` from `mobile/fixtures/index.js`, not only `@testchimp/playwright/runtime`.

### Q: `Playwright Test did not expect test()` / `afterEach()` when running mobilewright

**A:** Use **`@playwright/test` and `playwright` at 1.59.1** in `tests/package.json` with npm **`overrides`** for both (see `tests/package.json`). A lone bump to **1.60+**, or only overriding `@playwright/test` while `mobilewright` still pulls **1.58.x**, breaks listing and `installTestChimp`. Re-run `npm ci` under `tests/`.

### Q: Seed user fails

**A:** Ensure Docker backend is up and `curl -fsS http://localhost:3001/health` succeeds before running tests.

### Q: Web SmartTests pass but no rows in staging `rum_events`

**A:** (1) **Ingest URL** is `environment.testchimpEndpoint` → `https://featureservice-staging.testchimp.io` (not `TESTCHIMP_BACKEND_URL`, which is for the Playwright reporter only). Filter TrueCoverage on **`environment` = `staging`**. (2) **Libraries only:** **`@testchimp/playwright` ≥ 0.2.4** flushes rum-js in web `afterEach` via `globalThis.__TC_RUM_FLUSH` (no app/test flush helpers). **`@testchimp/rum-js` ≥ 0.1.3** exposes that hook; production `emit` batching is unchanged. (3) **Stale `ng serve`:** `./scripts/run-smarttests-web.sh` runs `npm ci` in `web/`, stops port 4200, and restarts the dev server.

### Q: Docker `Bind for 0.0.0.0:5432 failed: port is already allocated`

**A:** `run-smarttests-*.sh` runs `docker compose down`, removes leftover `milliways-multi-*` containers, then stops any Docker container still publishing **5432** or **3001** before `compose up`. Re-run the script. If it persists, something non-Docker owns **5432** (e.g. local Postgres): stop that service or change the host port in `docker-compose.yml`.

### Q: iOS sign-in never reaches “New Order” / simctl launch exit 4

**A:** (1) Docker up + `curl -fsS http://localhost:3001/health`. (2) `cd ios && make build` then `xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/Milliways.app`. (3) Bundle id **`com.mobilenext.Milliways`** (set on the `ios` project in `mobilewright.config.ts`). (4) After **Sign In**, iOS may show a system sheet (**Save Password** → tap **Not Now**, or **Local Network** → **Allow**); `tests/shared/mobile-auth.js` → `dismissIosSystemSheets` handles these. (5) Account toolbar: **Account** a11y label on welcome screen.
