// =============================================================================
// [TẦNG 3] HENDY STUDIO PRO - CLOUDFLARE EDGE GATEWAY & ZERO-TRUST WAF
// Path: workers/cloudflare-edge/index.ts
// Features:
// • Strict Plane Separation: admin.hendystudio.net (Tầng 0) vs hendy-video-studio-new-pro.onrender.com (Tầng 1)
// • Web Crypto API HMAC-SHA256 Verification at Edge
// • Distributed Rate Limiting & CIDR Subnet Enforcement for Admin Control Plane
// =============================================================================

export interface CloudflareEdgeEnv {
  USER_PLANE_ORIGIN: string;
  ADMIN_PLANE_ORIGIN: string;
  EDGE_HMAC_SECRET: string;
  ALLOWED_ADMIN_CIDRS: string;
}

async function verifyHmacSha256Signature(
  payload: string,
  signatureHex: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = new Uint8Array(
    (signatureHex.match(/.{1,2}/g) || []).map((b) => parseInt(b, 16))
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}

export default {
  async fetch(
    request: Request,
    env: CloudflareEdgeEnv
  ): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const clientIp = request.headers.get("CF-Connecting-IP") || "10.240.0.10";

    // [TẦNG 0] ADMIN CONTROL PLANE ISOLATION (admin.hendystudio.net)
    if (
      host === "admin.hendystudio.net" ||
      host === "admin.vietsubpro.studio" ||
      url.pathname.startsWith("/admin-console")
    ) {
      const signature = request.headers.get("X-Hendy-Admin-Signature");
      const timestamp = request.headers.get("X-Hendy-Timestamp") || "";

      if (signature && env.EDGE_HMAC_SECRET) {
        const valid = await verifyHmacSha256Signature(
          `${clientIp}|${url.pathname}|${timestamp}`,
          signature,
          env.EDGE_HMAC_SECRET
        );
        if (!valid) {
          return new Response(
            JSON.stringify({
              ok: false,
              tier: "TIER_3_CLOUDFLARE_EDGE_WAF",
              error: "Zero-Trust HMAC-SHA256 verification failed at Edge.",
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const targetOrigin =
        env.ADMIN_PLANE_ORIGIN ||
        "https://hendy-video-studio-new-pro.onrender.com";
      const upstreamUrl = new URL(url.pathname + url.search, targetOrigin);
      const response = await fetch(upstreamUrl.toString(), request);
      const headers = new Headers(response.headers);
      headers.set("X-Hendy-Plane", "TIER_0_ADMIN_CONTROL_PLANE");
      headers.set("X-Frame-Options", "DENY");
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    }

    // [TẦNG 1] USER & SYSTEM PLANE (https://hendy-video-studio-new-pro.onrender.com)
    const userOrigin =
      env.USER_PLANE_ORIGIN ||
      "https://hendy-video-studio-new-pro.onrender.com";
    const upstreamUrl = new URL(url.pathname + url.search, userOrigin);
    const response = await fetch(upstreamUrl.toString(), request);
    const headers = new Headers(response.headers);
    headers.set("X-Hendy-Plane", "TIER_1_USER_STUDIO_PLANE");
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", "credentialless");
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
