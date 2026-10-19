# Hendy Video Studio VietSub — Cloudflare Pages + Render

This repository keeps the existing editor and API code and makes its two production targets explicit.

## Deployment model

- **Cloudflare Pages** hosts the public static frontend from `dist/`. Pages Functions proxy `/api/*` and `/health` to Render.
- **Render Web Service** runs the Node/Express origin (`server.ts`) and builds its own origin assets. It is not a Cloudflare Worker.
- **GitHub Actions** runs tests and builds both targets for each pull request. After merge to `main`, it deploys Pages if the `cloudflare-production` environment secrets are configured.
- **Render auto-deploy** follows `main` using `render.yaml`. Render deployment and Pages deployment are separate jobs/platforms and must both be verified.

## GitHub environment and secrets

Create GitHub repository environment **cloudflare-production** (or change the workflow environment to an existing one). Add these secrets in **Settings → Environments → cloudflare-production**:

- `CLOUDFLARE_API_TOKEN`: a least-privilege Cloudflare API token allowing Pages deployment and, for the control Worker workflow, Worker deployment in the intended account.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account identifier.

Never paste token values into issues, chat, config files, source code, or commits. Rotate any credential previously exposed outside the secret store.

## Cloudflare Pages

Project name: `hendy-vietsub-pro`

- Build command (for direct Cloudflare Git integration): `npm install --include=dev --no-audit --no-fund && npm run build:pages`
- Output directory: `dist`
- The GitHub workflow uses Wrangler to deploy the same build. Avoid enabling a second Pages Git build/deploy path at the same time unless you intentionally want duplicate deployments.
- Set `BACKEND_API_URL` to the actual Render service HTTPS origin in Pages project settings if it differs from `wrangler.toml`.

## Render

Use the root Blueprint `render.yaml` to create/update the Web Service, or set:

- Build: `npm install --include=dev --no-audit --no-fund && npm run build:render`
- Start: `npm start`
- Health check: `/health`
- Branch: `main`
- Node: 20

Configure `GEMINI_API_KEY`, `ADMIN_ACCESS_ISSUER`, `ADMIN_ACCESS_AUD`, `ADMIN_ACCESS_EMAILS`, and `DEDICATED_ADMIN_GATEWAY_SECRET` directly in the Render Dashboard. For an existing Render service, manually add or verify these values; `sync: false` means they are intentionally not sourced from Git. Keep `ADMIN_ACCESS_ALLOW_LOCAL_DEV=false` in production. Also verify the service URL matches `PUBLIC_URL` and Cloudflare's `BACKEND_API_URL`.

## Local validation

```bash
npm install --include=dev --no-audit --no-fund
npm run check:cloudflare
node --check 'functions/api/[[path]].js'
node --check functions/health.js
npm run build:pages
npm run build:render
```

The Pages build omits `admin.html` by design; the Render build includes the origin/admin entry protected by Cloudflare Access middleware. These commands validate build artifacts but do not prove an external service is live.

## Production checklist

1. Confirm Cloudflare API token permissions in Cloudflare Dashboard and configure the two GitHub environment secrets above.
2. Confirm Render service deploys from `main` and its dashboard has the required secrets.
3. Confirm Render `/health` returns JSON directly.
4. Confirm Pages `/`, `/health`, and `/api/health` return expected responses.
5. Test the editor and real AI subtitle path with a valid Gemini key; a health check alone does not prove AI processing works.
6. Inspect both Cloudflare and Render deployment logs after every release.
