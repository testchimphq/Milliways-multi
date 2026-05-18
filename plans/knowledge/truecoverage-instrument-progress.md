# TrueCoverage instrumentation progress

Multi-platform project: `161eddb8-16ef-4f47-b205-6caa5f03d5b9` (staging ingest). Web: `@testchimp/rum-js@0.1.2` in `web/` (`MilliwaysRumService`).

## Done (instrumented + `plans/events/*.event.md`)

| Event | iOS | Android | Web |
|-------|-----|---------|-----|
| auth-session-started | yes | yes | yes (`AuthService`) |
| menu-loaded | yes | yes | yes (`MenuService`) |
| order-submitted-success | yes | yes | yes (`CartService`) |

### Web implementation notes

- **Init:** `APP_INITIALIZER` → `MilliwaysRumService.configureIfNeeded()` (`web/src/app/app.config.ts`)
- **Credentials / ingest:** `web/src/environments/environment*.ts` → project id, api key, `testchimpEndpoint`, `testchimpEnvironment: staging`
- **Release:** `environment.appVersion` passed to RUM `release`
- **Flush:** `visibilitychange` + `pagehide` → `testchimp.flush()` (short sessions / tab close)
- **Test identity during SmartTests:** `@testchimp/playwright` `installTestChimp` on web fixture barrel (when `tests/` scaffold exists) — reporter injects CI metadata into the page; no extra app hooks beyond RUM init

## Planned (not in scope)

_None — hold at current three events until evolve or product asks for more._
