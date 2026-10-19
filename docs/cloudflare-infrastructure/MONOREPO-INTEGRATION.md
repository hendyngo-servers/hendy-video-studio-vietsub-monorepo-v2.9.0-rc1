# Monorepo Integration Boundary

- `apps/admin-web`: separately addressable admin UI entrypoint, HTML/CSS/JS source split; shares the root React/Vite toolchain.
- `apps/studio-web`: separately addressable Studio UI entrypoint; wraps the current React editor implementation rather than replacing the editing engine.
- `apps/cloudflare-console`: static Cloudflare infrastructure console, served by the dedicated Cloudflare Worker through the `ASSETS` binding.
- `services/cloudflare-control-api`: independent read-only Cloudflare Worker API with Cloudflare Access JWT verification and its own Wrangler configuration.
- root `vite.config.ts`: builds `/`, `/admin.html`, and `/studio.html` as separate pages.

The Admin and Studio pages share the root runtime dependencies for compatibility. Cloudflare console assets and its Worker remain independently deployed. No credentials are committed; `.dev.vars` is gitignored.

The broader Express admin routes are additionally protected by `services/api-gateway/cloudflareAccessMiddleware.mjs`; configure `ADMIN_ACCESS_ISSUER`, `ADMIN_ACCESS_AUD`, and `ADMIN_ACCESS_EMAILS` for the admin hostname. The separate Cloudflare Access identity allowlist is mandatory for production admin API access.
