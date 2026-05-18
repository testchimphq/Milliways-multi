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

Credentials and staging ingest URL are in `src/environments/environment*.ts` (demo project `161eddb8-16ef-4f47-b205-6caa5f03d5b9`). Journey events: `auth_session_started`, `menu_loaded`, `order_submitted_success` — see `plans/events/`.

## Build

```bash
npm run build
```

Output: `dist/web/`.
