# Cloudflare Worker — Edge API Gateway

This Worker is the public edge gateway in front of the Ktor backend.

## Role

- `/api/*` → Ktor backend
- `/telegram/webhook` → Ktor backend
- `/ws/*` → Ktor WebSocket endpoint (the Worker forwards the upgrade request)
- `/_edge/health` → edge health endpoint

The Worker does not contain the Whisper/Gemini/FFmpeg workload. Those stay on the Ktor server where filesystem/process access is available.

## Local development

Create `.dev.vars` beside `wrangler.jsonc`:

```dotenv
BACKEND_ORIGIN=http://127.0.0.1:8080
```

Run:

```bash
npm install
npm run dev
```

## Production secret

The Ktor origin is stored as a Worker secret:

```bash
npx wrangler@4.148.0 secret put BACKEND_ORIGIN
```

The `wrangler.jsonc` declares this secret as required, so a deploy will fail when it has not been configured. Cloudflare recommends Wrangler secrets for credentials/origin values that should not be kept in plaintext configuration.

## Deploy

```bash
npm install
npm run deploy
```

Attach a custom domain such as `api.example.com` to this Worker in Cloudflare when ready. The TMA can stay on Pages while the browser still uses same-origin `/api` via the Pages Function service binding.
