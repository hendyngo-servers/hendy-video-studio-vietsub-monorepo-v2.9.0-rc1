# Hendy Vietsub Platform v3 — rewrite foundation

This directory is the clean v3 runtime foundation for the Cloudflare Pages + Render architecture. It is intentionally isolated from the current v2.9 RC application while feature parity is built and tested. Do not route production traffic here until the feature migration and security review are complete.

## Responsibilities

- Cloudflare Pages: public static frontend and /api/* edge proxy.
- Render Web Service: Node.js API/orchestration runtime; no Docker socket access.
- GitHub Actions: reproducible validation and deployment gates.
- Secrets: only in GitHub Actions Secrets / Render Environment / Cloudflare secrets; never in source files.

## Local run

    cd platform-v3
    npm install
    npm test
    npm start

Health: GET /health. API status: GET /api/v1/status.

## Environment

- PORT — injected by Render; defaults to 3000 locally.
- SERVICE_NAME — optional service label.
- APP_VERSION — optional version label.
- CORS_ORIGINS — comma-separated exact allowed origins. Unset means no cross-origin browser access.
- JSON_BODY_LIMIT — optional request size cap.
- GEMINI_API_KEY and R2 configuration are capability flags only in this baseline; AI and storage modules must be implemented behind dedicated adapters before being enabled.

## Migration rule

This is not a drop-in replacement for the existing editor yet. Move each feature with tests and parity checks; do not delete the v2.9 code or switch Render's root/start command until frontend editing, subtitle pipeline, access controls, and file storage are migrated and verified.
