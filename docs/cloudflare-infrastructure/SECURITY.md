# Security policy

## Supported version

Security fixes are targeted at the latest release on `main`.

## Reporting a vulnerability

Please do not publish tokens, account IDs tied to sensitive infrastructure, private data, or exploit details in a public issue. Contact the repository maintainer privately using GitHub's security advisory/reporting feature.

## Security design

- Cloudflare Access JWT signature, issuer, audience and time claims are validated in the Worker.
- The browser never receives the runtime Cloudflare API token.
- The runtime token must be read-only and separate from the GitHub deployment token.
- The API exposes a fixed allowlist of read endpoints and rejects all mutation methods.
- The Worker does not connect to Docker sockets, VPS hosts, Redis, or arbitrary upstream origins.
- No provider errors or authorization headers are returned to users or logged by the application.
- Browser content is served with a restrictive CSP and anti-framing headers; API responses are not cacheable.

## Operational requirements

Restrict the Access policy to named users or groups, rotate secrets after suspected disclosure, use GitHub environment protection and branch protection, and configure Cloudflare WAF rate limiting. Do not paste secret values into issues, workflow logs, screenshots, or committed files.
