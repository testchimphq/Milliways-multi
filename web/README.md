# Milliways Web (Angular)

Angular SPA mirroring the iOS/Android food-ordering demo. Shares the repo **Node backend** on port **3001**.

## Prerequisites

- Node.js 18+
- Backend running: from repo root, `docker compose up --build -d`

## Run locally

```bash
cd web
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). API calls are proxied to `http://localhost:3001` (see `proxy.conf.json`).

## TestChimp TrueCoverage (RUM)

- **SDK:** `@testchimp/rum-js` (see `package.json` for pinned version)
- **Helper:** `src/app/rum/milliways-rum.service.ts` — init at bootstrap, `platform: web` on every emit
- **Config:** `src/environments/environment*.ts` — project id, api key, ingest URL, `testchimpEnvironment: staging`
- **Journey events:** `auth_session_started`, `menu_loaded`, `order_submitted_success` — documented in `plans/events/`
- **Flush:** on tab hide / `pagehide` so short sessions still upload buffered events

During Playwright SmartTests, test identity is attached by `@testchimp/playwright` (`installTestChimp` in the web fixtures barrel); the app does not need extra instrumentation for that link.

## Build

```bash
npm run build
```

Output: `dist/web/`.
