# Deploy Hendy Video Studio VietSub v2.9.0-rc1: Cloudflare Pages + Render

This repository uses two separate runtimes:

- **Cloudflare Pages** serves the Vite frontend and runs the small Pages Functions proxy for `/api/*` and `/health`.
- **Render Web Service** runs `server.ts` (Express), AI/API routes, and serves the full production app when opened directly.

Do not deploy the root `server.ts` using `wrangler deploy`. It is an Express/Node.js server, not a Cloudflare Workers module entry point. Root Wrangler configuration files are intentionally not used for the Pages frontend.

## Cloudflare Pages settings

Create or open the Pages project connected to this repository and branch `main`:

- Framework preset: **Vite**
- Root directory: repository root
- Build command: `npm run build:pages`
- Build output directory: `dist`
- Node.js: 20 or newer

Set this Pages environment variable for both Production and Preview as appropriate:

- `BACKEND_API_URL` = the HTTPS origin of the Render Web Service, for example `https://your-service.onrender.com` (no trailing slash required).

The value must be a trusted HTTPS URL. Do not put API keys or secrets in this variable. The proxy forwards requests under `/api/*` to the Render service and exposes `/health` as a backend health check. If the backend variable is missing, Pages returns an explicit 503 instead of pretending API calls succeeded.

## Render.com settings

Create a Render **Web Service** from this repository and use the root `render.yaml` Blueprint, or set:

- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm start`
- Health check path: `/health`
- Runtime: Node.js 20+

Configure secrets in Render's Environment page, never in Git. At minimum configure the Gemini key if AI features are needed. Admin routes also require the Cloudflare Access issuer, audience, administrator email allowlist, and a strong `DEDICATED_ADMIN_GATEWAY_SECRET`; see `.env.example` and the security section in `README.md`.

Use Render's actual service URL as `BACKEND_API_URL` in Cloudflare Pages. If the Render service is suspended or still starting, API requests may temporarily return 502/503.

## Verification

From a local checkout:

```bash
npm ci
npm run check:cloudflare
npm run build:pages
npm run build
npm start
```

Then verify:

- Pages homepage and `/studio.html` load.
- `https://YOUR-PAGES-DOMAIN/health` returns the Render backend's health JSON.
- `https://YOUR-PAGES-DOMAIN/api/health` returns the backend API health JSON.
- A request to `/api/*` reaches the Render service and returns the real backend response.
- Admin pages and admin APIs remain protected by Cloudflare Access and the server-side JWT/allowlist checks.

The build commands alone do not deploy either platform. After merging, confirm the Cloudflare Pages deployment and Render deployment logs separately.
