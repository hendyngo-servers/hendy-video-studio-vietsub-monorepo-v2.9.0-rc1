# Hendy Video Studio/Vietsub Pro — monorepo refactor report

Release candidate: `2.9.0-rc.1`

## Scope

- Integrated the Cloudflare infrastructure console as `apps/cloudflare-console/` and its isolated Worker API as `services/cloudflare-control-api/`.
- Added independently addressable Vite entrypoints at `/admin.html` and `/studio.html`; each has an HTML document, dedicated `src/main.jsx` entrypoint and dedicated `src/styles.css`. Existing React feature components remain shared source so the refactor does not discard Studio logic.
- Expanded Tailwind content globs for app sources and wired multi-page Vite inputs. The Pages-only build excludes `admin.html`; deploy the admin plane behind Cloudflare Access through the intended protected host.
- Added Cloudflare Access RS256 verification and explicit email allowlisting for legacy admin API namespaces, guarded legacy maintenance reset and old admin telemetry/configuration routes, removed client-supplied actor IDs from audit payloads, and removed the default `ADMIN2026` bypass from admin API requests.
- Local development bypass is disabled by default and only works when explicitly enabled in non-production on a loopback host and loopback socket peer.

## Validation completed

- `npm run check:cloudflare`: **16/16 tests passed**.
- JavaScript/TypeScript/JSX syntax transpile scan: **149 source files, zero syntax diagnostics**.
- Parsed root `package.json`, `package-lock.json` and Worker `wrangler.jsonc`; package name/version are synchronized.
- `npm run build` ran workspace synchronization and icon generation, then stopped with `vite: not found`. Dependency installation was unable to complete because the environment could not reach `registry.npmjs.org`; therefore a full Vite build, semantic TypeScript typecheck, `npm audit`, Wrangler dry-run and real account deployment remain unverified.

## Required production configuration

Root API service:

- `ADMIN_ACCESS_ISSUER`
- `ADMIN_ACCESS_AUD`
- `ADMIN_ACCESS_EMAILS` (comma-separated exact allowed email addresses)
- `DEDICATED_ADMIN_GATEWAY_SECRET` (high-entropy secret; never commit it)
- `ADMIN_ACCESS_ALLOW_LOCAL_DEV=false`

Cloudflare Worker GitHub Environment `cloudflare-production`:

- `CLOUDFLARE_API_TOKEN` (least-privilege deploy token)
- `CLOUDFLARE_ACCOUNT_ID`
- `ACCESS_ISSUER`
- `ACCESS_AUD`
- `CF_API_READ_TOKEN` (read-only Cloudflare inventory token)

Before production: install from the lockfile on CI, run `npm run check:cloudflare`, `npm run build`, `npm run lint`, `npm audit`, Wrangler dry-run and an authenticated staging smoke test. Configure Cloudflare Access on the admin hostname and verify origin/API paths cannot be accessed around the Access policy. Do not mark this RC as production-ready until these checks pass.
