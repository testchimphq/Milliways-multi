# Milliways — TestChimp agent instructions

## Repo layout vs TestChimp mappings

- **SmartTests root:** `tests/` (`.testchimp-tests`, `project_type=mobile`) — iOS + Android via Mobilewright `ios` / `android` projects.
- **Plans root:** `plans/` (`.testchimp-plans`) — unified mobile TestChimp project.
- **TestChimp project ID:** `0853e684-9871-483a-bc71-ca84d922be7c` (staging backend; single project for both platforms).
- **MCP / CLI / runner env:** repo-root `.cursor/mcp.json` → `TESTCHIMP_API_KEY`, `TESTCHIMP_BACKEND_URL` (staging). `npm run test:*` / `scripts/run-smarttests.sh` apply these to the Mobilewright child process automatically. Never commit keys.

## Init progress

### Completed Items

- Unified `tests/` + `plans/` markers; mobile scaffold with `@testchimp/playwright` reporter.
- Workstation MCP at `.cursor/mcp.json` (staging).
- Initial SmartTests: `mobile/e2e/common/menu.spec.js`, `navigation.spec.js` (iOS + Android).
- TrueCoverage RUM wired in app; events documented under `plans/events/` (no expansion in init).

### Pending Items

- Additional scenario coverage beyond menu + navigation smoke paths.
- CI workflow update (deferred by team choice).

### Deferred Items

- AIMock / LLM mocking — N/A.
- CI SmartTests jobs — not needed yet.

---

## Environment Provision Strategy

### Local - Test Authoring

SmartTests root is **`tests/`** at the **repo root** (not under `ios/`).

1. **Backend** (repo root): `docker compose up --build -d` then `curl -fsS http://localhost:3001/health`
2. **iOS app:** `cd ios && make build` → `ios/build/Build/Products/Debug-iphonesimulator/Milliways.app`
3. **Android APK:** `cd android && ./gradlew :app:assembleDebug`
4. **Run** (repo root — recommended):

```bash
./scripts/run-smarttests.sh ios
./scripts/run-smarttests.sh android
```

Or from `tests/` after `npm ci`:

```bash
cd tests
npm run test:ios      # loads .cursor/mcp.json → TESTCHIMP_BACKEND_URL + API key
npm run test:android
```

`scripts/run-mobilewright-with-mcp-env.mjs` **requires** `.cursor/mcp.json` and exports **`TESTCHIMP_API_KEY`** + **`TESTCHIMP_BACKEND_URL`** (staging) on the Mobilewright process. Reporter does **not** use `TESTCHIMP_PROJECT_ID` (that is for app TrueCoverage/RUM only). `TESTCHIMP_TESTS_FOLDER=.` (paths relative to SmartTests root `tests/`).

Overrides: `IOS_APP_PATH`, `ANDROID_APK_PATH`, `MILLIWAYS_API_BASE_URL` (`tests/.env-QA`).

RUM: `android/gradle.properties` + Xcode `TESTCHIMP_*` build settings.

### CI - Test Execution

Deferred. When enabled, use macOS for iOS Simulator + `tests/` as cwd; pass `TESTCHIMP_API_KEY` and `TESTCHIMP_BACKEND_URL` as secrets.

## TrueCoverage Plan

- **Enabled** for staging unified project `0853e684-9871-483a-bc71-ca84d922be7c`.
- **Instrumented events (current slice only):** `auth-session-started`, `menu-loaded`, `order-submitted-success` — see `plans/events/`.
- RUM `environment` aligns with `TESTCHIMP_ENV` / build config (`staging` or `QA` for local Debug).
- Mobile SmartTests: `installTestChimp(..., { uiFixture: 'screen' })` in `tests/mobile/fixtures/index.js` and `projects[].use.platform` (`ios` / `android`) in `tests/mobilewright.config.ts`. `@testchimp/playwright` ≥ **0.2.3** applies one TrueCoverage `v1/set` from the **`device`** fixture (after `launchApp`, before `screen`). Platform for `afterEach` flush comes from `projects[].use.platform`, not `TESTCHIMP_PROJECT_TYPE`.

## Mocking Plan

- **http_mocking:** N/A — local Docker API; mobile UI flows.
- **aimock:** deferred / not applicable.

## ExploreChimp

- Use `markScreenState` in UI SmartTests when running explorations.
- Set `EXPLORECHIMP_ENABLED` per team policy; `TESTCHIMP_BRANCH_NAME` from current git branch for local runs.

## Past learnings — authoring & validation (FAQ)

### Q: Reporter or API returns 401

**A:** Use `npm run test:ios` from `tests/` or `./scripts/run-smarttests.sh ios`. Confirm: `Reporter env: TESTCHIMP_BACKEND_URL=https://featureservice-staging.testchimp.io TESTCHIMP_API_KEY=set`. Reporter does **not** use `TESTCHIMP_PROJECT_ID`. If runs ingest but `testFound=false`, sync the mapped **`tests/`** folder in TestChimp (Git integration).

### Q: Tests cannot find the app bundle or APK

**A:** Build iOS (`make build`) or Android (`./gradlew :app:assembleDebug`), or set `IOS_APP_PATH` / `ANDROID_APK_PATH`. **mobilewright 0.0.37+** (iOS simulator): `installApps` must be a **`.zip`** of the `.app` (see `run-smarttests.sh` — it zips after build). Android still uses `.apk`.

### Q: No TrueCoverage / RUM emits on Android (iOS works)

**A:** The debug APK at `android/app/build/outputs/apk/debug/app-debug.apk` is often **stale**. Mobilewright installs whatever is on disk; an APK built **before** `testchimp-rum-android` was added contains **no RUM SDK** (no `menu_loaded` / `auth_session_started`, automation `SET` is a no-op). Rebuild: `cd android && ./gradlew :app:assembleDebug`, or `npm run test:android` from `tests/` (runs `build:android` first). Prefer `./scripts/run-smarttests.sh android` from repo root (builds APK + backend). After rebuild, logcat should show `am start … testchimp-rum://truecoverage/v1/set?p=…` per test.

### Q: RUM events missing `ci_test_info` on mobile

**A:** Use `@testchimp/playwright` ≥ **0.2.3**, `installTestChimp` with `uiFixture: 'screen'`, and `use.platform: 'ios'` or `'android'` on the Mobilewright UI project. Run with `--project=ios` or `--project=android`. Expect `device.openUrl` to `testchimp-rum://truecoverage/v1/set?p=...` once per test at device fixture start (plus trailing set+flush in `afterEach`). Avoid **0.2.0–0.2.2** on mobile (device SET could be skipped). Import `test` from `mobile/fixtures/index.js`, not only `@testchimp/playwright/runtime`.

### Q: Seed user fails

**A:** Ensure Docker backend is up and `curl -fsS http://localhost:3001/health` succeeds before running tests.

### Q: iOS sign-in never reaches “New Order” / simctl launch exit 4

**A:** (1) Docker up + `curl -fsS http://localhost:3001/health`. (2) `cd ios && make build` then `xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/Milliways.app`. (3) Bundle id **`com.mobilenext.Milliways`**. (4) After **Sign In**, iOS may show a system sheet (**Save Password** → tap **Not Now**, or **Local Network** → **Allow**); `tests/shared/ios-helpers.js` dismisses these automatically on the `ios` project. (5) Account toolbar: prefers **Account** a11y label, falls back to **`person.circle`**.
