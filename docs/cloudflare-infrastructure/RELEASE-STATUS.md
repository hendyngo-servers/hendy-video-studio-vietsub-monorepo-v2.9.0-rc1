# Release status — v2.1.0-rc.1 Cloudflare infrastructure module

## Refactor summary

The original Cloudflare-native panel has been reorganized into a module boundary suitable for the Hendy Video Studio/Vietsub Pro monorepo:

- `apps/cloudflare-console/public/` — static administration UI.
- `services/cloudflare-control-api/worker/index.mjs` — Access-protected, read-only Cloudflare inventory API.
- `services/cloudflare-control-api/wrangler.jsonc` — deployment configuration.
- `services/cloudflare-control-api/test/worker.test.js` — retained security tests plus two integration-oriented tests.
- `packages/` and `infrastructure/` — documented extension boundaries, not falsely represented as completed application logic.

## Local verification in this authoring environment (2026-10-18)

- `npm ci --ignore-scripts --no-audit --no-fund`: passed.
- `npm run check`: passed; 9/9 tests.
- `npm audit --audit-level=high`: not verified because the npm audit endpoint could not be reached (`EAI_AGAIN registry.npmjs.org`). This is a network limitation, not a clean audit result.
- `npm run deploy:dry-run`: attempted but timed out while obtaining the pinned Wrangler CLI from npm. The Worker packaging/deployment dry-run remains unverified.
- Live Cloudflare Access, Cloudflare API, custom hostname, GitHub Actions and production deployment: not run; no account access was configured in this session.

## Production release gate

Do not mark this release production-ready until all of the following pass in GitHub Actions and the target Cloudflare account:

- [ ] `npm ci`, `npm run check`, and `npm audit --audit-level=high`.
- [ ] Wrangler dry-run using `services/cloudflare-control-api/wrangler.jsonc`.
- [ ] Verify GitHub Actions versions and production environment protection.
- [ ] Configure Cloudflare Access with a restrictive policy on the exact custom hostname.
- [ ] Verify unauthenticated requests cannot retrieve static assets or inventory from either the custom hostname or `workers.dev`.
- [ ] Confirm runtime token is read-only and separate from deployment token.
- [ ] Deploy to staging, run authenticated API smoke tests, verify logs do not leak secrets, and rehearse rollback.

The module remains intentionally read-only. It does not manage arbitrary VPS/Docker hosts, mutate Cloudflare resources, or implement video rendering. No deployment is claimed by this source refactor.
