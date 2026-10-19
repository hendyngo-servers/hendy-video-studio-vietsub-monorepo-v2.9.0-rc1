# Hendy Video Studio VietSub — deployment layout

## Cloudflare Pages (public frontend)
- Root: repository root
- Build: `npm ci && npm run build:pages`
- Output: `dist`
- Keep the standalone `/admin.html` entry out of the public Pages artifact.
- Do not run `wrangler deploy` against the root `server.ts`. That file is an Express/Node.js application and belongs on Render.

## Render.com (Node.js/Express API + server-rendered origin)
- Blueprint: `render.yaml`
- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Health check: `/health`
- Set `PUBLIC_URL` to the actual Render service URL.
- Configure the required secret environment variables in the Render dashboard. Never commit secrets.

## API routing from Pages
Set the frontend API base URL to the Render service URL, or configure a Cloudflare Pages Function/proxy to forward `/api/*` to Render. Do not assume relative `/api/*` calls on the Pages hostname will reach Render unless the proxy is configured.
