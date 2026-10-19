# Hendy Video Studio VietSub — deployment layout

## Cloudflare Pages (public frontend)
- Root: repository root
- Build: `npm install --no-audit --no-fund && npm run build:pages`
- Output: `dist`
- Keep the standalone `/admin.html` entry out of the public Pages artifact.
- Do not run `wrangler deploy` against the root `server.ts`. That file is an Express/Node.js application and belongs on Render.

## Render.com (Node.js/Express API + server-rendered origin)
- Blueprint: `render.yaml`
- Build: `npm install --no-audit --no-fund && npm run build:render`
- Start: `npm start`
- Health check: `/health`
- Set `PUBLIC_URL` to the actual Render service URL.
- Configure the required secret environment variables in the Render dashboard. Never commit secrets.

## API routing from Pages
The repository contains a Cloudflare Pages Function proxy for `/api/*` and `/health`. Set `BACKEND_API_URL` in Cloudflare Pages to the actual Render service URL (HTTPS origin); relative `/api/*` calls from the frontend then pass through Pages to Render. The separate `BACKEND_API_URL` variable is not needed when using this same-origin proxy.


## Cloudflare Pages environment variables
- `BACKEND_API_URL`: set to the actual Render Web Service origin, for example `https://hendy-video-studio-vietsub-api.onrender.com` after the service exists. Do not add a trailing slash. This is a Pages Function runtime setting; it is not embedded into frontend assets.
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`: GitHub Actions repository secrets used only by the Pages deploy job.

The current frontend's AI subtitle-generation and refinement requests use `BACKEND_API_URL` to reach Render. Other API endpoints that are called from additional workspaces should be reviewed before production if they rely on same-origin `/api/*` paths.
