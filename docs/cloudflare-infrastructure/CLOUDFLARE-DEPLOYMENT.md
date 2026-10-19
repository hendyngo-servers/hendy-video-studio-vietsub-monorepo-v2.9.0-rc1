# Cloudflare production deployment guide

## Required platform resources

- Cloudflare Workers account with a custom domain available for the dashboard.
- Cloudflare Access self-hosted application protecting that custom hostname.
- One **read-only** runtime API token with Workers Scripts Read, D1 Read and Workers KV Storage Read, scoped to the target account.
- A separate deployment token scoped to deploying Workers and static assets.
- GitHub environment named `cloudflare-production` with the five secrets documented in the root README. Keep local `.dev.vars` beside `services/cloudflare-control-api/wrangler.jsonc`.

## Deploy flow

1. Add secrets to the GitHub environment. The workflow refuses to deploy when a required secret is absent or the account ID has the wrong format.
2. Push code to `main` or start the deployment workflow manually.
3. The validate job runs `npm ci`, syntax/unit tests, `npm audit --audit-level=high`, and `npm run deploy:dry-run`.
4. The deploy job runs only after validation succeeds and uses the `cloudflare-production` environment. Runtime secrets are uploaded separately from the code bundle.
5. Configure the custom domain in Cloudflare and attach the Access application. A direct `workers.dev` request is still blocked by the Worker unless a valid Access JWT is supplied.
6. Add a WAF rate limiting rule for the dashboard hostname, restrict Access policy to named people/groups, and protect `main` with required pull request reviews and status checks.

## Smoke tests

```bash
curl -i https://YOUR_DASHBOARD_HOSTNAME/healthz
curl -i https://YOUR_DASHBOARD_HOSTNAME/api/overview
curl -i https://YOUR_WORKER.workers.dev/
```

Expected: `/healthz` returns `200` with only liveness metadata. `/api/overview` should prompt Cloudflare Access login through the protected hostname; if Access is bypassed, the Worker must return `401` without a valid signed JWT. The public `workers.dev` URL must not reveal HTML or API data without a valid JWT. Authenticated API errors should describe configuration/availability at a high level but never return the provider's raw error, token, or request URL.

After authenticating with an allowed identity, validate that the Worker, D1 and KV sections populate as expected and that each resource group's error state remains isolated if a permission is intentionally removed in staging.

## Emergency rollback

Use Cloudflare Workers deployment/version history to roll back to the last known-good version. Revoke a leaked runtime token in the Cloudflare dashboard immediately, then update `CF_API_READ_TOKEN` in the GitHub production environment and redeploy. Revoke the deploy token separately if it may have been exposed.


## Monorepo paths

The Worker entry point is `services/cloudflare-control-api/worker/index.mjs`, its Wrangler configuration is `services/cloudflare-control-api/wrangler.jsonc`, and the static console is `apps/cloudflare-console/public/`. Use the root npm scripts so Wrangler receives the correct configuration path.
