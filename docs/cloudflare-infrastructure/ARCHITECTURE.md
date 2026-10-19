# Architecture

## Deployment topology

```text
Administrator browser
  -> Cloudflare Access (identity provider and policy)
  -> Cloudflare Worker (validates the Access JWT again)
      -> static assets binding (HTML/CSS/JS)
      -> fixed, read-only Cloudflare API client
          -> Workers Scripts inventory
          -> D1 database inventory
          -> KV namespace inventory

GitHub push / tag
  -> CI: npm ci, unit tests, npm audit, Wrangler dry-run
  -> protected cloudflare-production environment
  -> deployment-only Cloudflare API token
  -> Wrangler Worker + static assets deploy
  -> runtime read-only API token and Access issuer/audience stored as Worker secrets
```

## Trust boundaries

1. The public browser cannot supply or override the Cloudflare API token. It is used only by the Worker for requests to a fixed allowlist of API routes.
2. Every request except `/healthz` must carry a valid `Cf-Access-Jwt-Assertion`. The Worker verifies RS256 with Cloudflare Access JWKS and checks exact issuer, audience, expiry and not-before claims. Merely checking for a header is not sufficient.
3. The browser receives projected resource fields only; raw Cloudflare API payloads and errors are not passed through.
4. The runtime API token is read-only and distinct from the deployment token. There are no mutation methods and all non-GET/HEAD requests are rejected.
5. CSP disallows inline script and styles, cross-origin connections, framing and object embedding. API responses are `no-store`.
6. `GET /healthz` returns only liveness and mode; it does not expose configuration status, account identifiers, token presence, or runtime dependencies.

## Availability and quotas

Cloudflare API collection errors are isolated per resource group so one missing permission does not disclose provider errors or crash the complete UI. API calls have a timeout and page count ceiling. Configure Cloudflare WAF rate limiting and observe Worker metrics/logs in production. The UI is intentionally read-only; no data mutation, SQL execution, KV value retrieval, general Docker administration, or host-level container operations are implemented.
