# Deploy Hendy Video Studio VietSub v2.9.0-rc1: Cloudflare Pages + Render

This repository uses two separate runtimes:

- **Cloudflare Pages** serves the Vite frontend and runs the small Pages Functions proxy for `/api/*` and `/health`.
- **Render Web Service** runs `server.ts` (Express), AI/API routes, and serves the full production app when opened directly.

Do not deploy the root `server.ts` using `wrangler deploy`. It is an Express/Node.js server, not a Cloudflare Workers module entry point. Root Wrangler configuration files are intentionally not used for the Pages frontend.

## Cloudflare Pages settings

Create or open the Pages project connected to this repository and branch `main`:

- Framework preset: **Vite**
- Root directory: repository root
- Build command: `npm install --no-audit --no-fund && npm run build:pages`
- Build output directory: `dist`
- Node.js: 20 or newer

Set `BACKEND_API_URL` to the real HTTPS origin of the Render Web Service. The current `wrangler.toml` uses `https://hendy-video-studio-new-pro.onrender.com`, matching the URL declared in `render.yaml`. This URL was not reachable from the available network verifier during this run, so confirm it is the actual live service URL. If it differs, update `wrangler.toml` before deploying or override it in Cloudflare Pages Dashboard for Production and Preview.

The value must be a trusted HTTPS URL. Do not put API keys or secrets in this variable. The proxy forwards requests under `/api/*` to the Render service and exposes `/health` as a backend health check. If the backend variable is missing, Pages returns an explicit 503 instead of pretending API calls succeeded.

## Render.com settings

Create a Render **Web Service** from this repository and use the root `render.yaml` Blueprint, or set:

- Build command: `npm install --include=dev --no-audit --no-fund && npm run build:render`
- Start command: `npm start`
- Health check path: `/health`
- Runtime: Node.js 20+

Configure secrets in Render's Environment page, never in Git. The Blueprint marks `GEMINI_API_KEY`, `ADMIN_ACCESS_ISSUER`, `ADMIN_ACCESS_AUD`, `ADMIN_ACCESS_EMAILS`, and `DEDICATED_ADMIN_GATEWAY_SECRET` with `sync: false`. On an existing service, verify or add these values manually in the Dashboard; do not assume a Blueprint sync will inject new secret values. Admin routes require the configured Cloudflare Access issuer/audience, administrator email allowlist, and a strong `DEDICATED_ADMIN_GATEWAY_SECRET`; see `.env.example` and the security section in `README.md`.

Use Render's actual service URL as `BACKEND_API_URL` in Cloudflare Pages. If the Render service is suspended or still starting, API requests may temporarily return 502/503.

## Verification

From a local checkout (CI currently uses `npm install` to reconcile the dependency lock metadata):

```bash
npm install --no-audit --no-fund
npm run check:cloudflare
node --check 'functions/api/[[path]].js'
node --check functions/health.js
npm run build:pages
npm run build:render
```

Then verify:

- Pages homepage and `/studio.html` load.
- `https://YOUR-PAGES-DOMAIN/health` returns the Render backend's health JSON.
- `https://YOUR-PAGES-DOMAIN/api/health` returns the backend API health JSON.
- A request to `/api/*` reaches the Render service and returns the real backend response.
- Admin pages and admin APIs remain protected by Cloudflare Access and the server-side JWT/allowlist checks.

The build commands alone do not deploy either platform. After merging, confirm the Cloudflare Pages deployment and Render deployment logs separately.


## GitHub Actions secrets for Pages deployment
Open **GitHub → repository Settings → Secrets and variables → Actions** and add:
- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Pages deployment permissions for this account/project.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Do not write either value to source code, `wrangler.toml`, or chat. The workflow verifies both secrets before deployment and deliberately stops if either is missing.

## Live verification
A successful `validate-build` checks dependencies, security tests, Pages Function syntax, Vite output, and exclusion of the standalone Admin HTML entry. It does not prove a production deploy or live backend. After the secrets are configured, check that the `deploy-pages` job succeeds and test the actual Pages domain's `/health` endpoint; it must return the Render backend health response rather than `BACKEND_NOT_CONFIGURED` or `BACKEND_UNAVAILABLE`. Also test the Render origin's `/health` directly and test subtitle generation/refinement with a valid Gemini key.
