import { handleTelegramUpdate } from "./telegramBot";
import { putPipelineLog } from "./r2Storage";

interface Env {
  BACKEND_ORIGIN: string;
  CORS_ALLOWED_ORIGINS?: string;
  BOT_TOKEN?: string;
  ADMIN_ID?: string;
  MINI_APP_URL?: string;
  WEB_APP_URL?: string;
  BOT_STATE?: KVNamespace;
  CONFIG_SOT?: KVNamespace;
  EDGE_AI_CACHE?: KVNamespace;
  PIPELINE_LOGS?: R2Bucket;
  EDGE_SHARED_SECRET?: string;
}

const edgeMemCache = new Map<string, { body: string; expiresAt: number }>();
let workerCacheHits = 0;
let workerCacheMisses = 0;

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const ALLOWED_METHODS = "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Authorization,Content-Type,X-Requested-With,X-Telegram-Bot-Api-Secret-Token";

function allowedOrigin(origin: string | null, env: Env): string | null {
  if (!origin) return null;
  const configured = (env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.includes(origin) ? origin : null;
}

function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = allowedOrigin(request.headers.get("Origin"), env);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    headers.set("Access-Control-Max-Age", "86400");
  }
  headers.set("Vary", "Origin");
  return headers;
}

function securityHeaders(): Headers {
  const headers = new Headers();
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return headers;
}

function upstreamUrl(request: Request, backendOrigin: string): URL {
  const backend = new URL(backendOrigin);
  const incoming = new URL(request.url);

  const backendBase = backend.pathname.replace(/\/$/, "");
  const incomingPath = incoming.pathname.startsWith("/")
    ? incoming.pathname
    : `/${incoming.pathname}`;

  backend.pathname = `${backendBase}${incomingPath}` || "/";
  backend.search = incoming.search;
  return backend;
}

async function proxy(request: Request, env: Env): Promise<Response> {
  if (!env.BACKEND_ORIGIN) {
    return new Response(JSON.stringify({ error: "BACKEND_ORIGIN_NOT_CONFIGURED" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  const target = upstreamUrl(request, env.BACKEND_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("X-Forwarded-Host", new URL(request.url).host);
  headers.set("X-Forwarded-Proto", new URL(request.url).protocol.replace(":", ""));
  headers.set("X-Edge-Worker", "video-subtitle-api");

  const upstreamRequest = new Request(target.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual"
  });

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const [key, value] of securityHeaders()) responseHeaders.set(key, value);
  for (const [key, value] of corsHeaders(request, env)) responseHeaders.set(key, value);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth/otp" && request.method === "POST") {
      try {
        if (!env.BOT_STATE || !env.BACKEND_ORIGIN || !env.EDGE_SHARED_SECRET) return new Response(JSON.stringify({ error: "OTP_SERVICE_NOT_CONFIGURED" }), { status: 503, headers: { "Content-Type": "application/json" } });
        const payload = await request.json() as { token?: string };
        const otp = (payload.token || "").trim().toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(otp)) return new Response(JSON.stringify({ error: "INVALID_OTP" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const raw = await env.BOT_STATE.get(`otp:${otp}`);
        if (!raw) return new Response(JSON.stringify({ error: "OTP_EXPIRED" }), { status: 401, headers: { "Content-Type": "application/json" } });
        const record = JSON.parse(raw) as { chatId: string; expiresAt: number };
        if (record.expiresAt < Date.now()) { await env.BOT_STATE.delete(`otp:${otp}`); return new Response(JSON.stringify({ error: "OTP_EXPIRED" }), { status: 401, headers: { "Content-Type": "application/json" } }); }
        const ts = Math.floor(Date.now() / 1000);
        const signature = await hmacSha256(env.EDGE_SHARED_SECRET, `${record.chatId}:${ts}`);
        await env.BOT_STATE.delete(`otp:${otp}`);
        const target = new URL("/api/auth/edge-otp", env.BACKEND_ORIGIN);
        const upstream = await fetch(target, { method: "POST", headers: { "X-Edge-User-Id": record.chatId, "X-Edge-Timestamp": String(ts), "X-Edge-Signature": signature } });
        return new Response(upstream.body, { status: upstream.status, headers: upstream.headers });
      } catch (error) {
        console.error("OTP auth failed", error);
        return new Response(JSON.stringify({ error: "OTP_AUTH_FAILED" }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try {
        const update = await request.json();
        await handleTelegramUpdate(update as any, env);
        return new Response("OK");
      } catch (error) {
        console.error("Telegram webhook failed", error);
        return new Response(JSON.stringify({ error: "TELEGRAM_WEBHOOK_FAILED" }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    if (url.pathname === "/_edge/health" && request.method === "GET") {
      ctx.waitUntil(putPipelineLog(env, `health/${Date.now()}.json`, { ok: true, service: "video-subtitle-api", edge: true }));
      return new Response(JSON.stringify({
        ok: true,
        service: "video-subtitle-api",
        edge: true,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...Object.fromEntries(securityHeaders())
        }
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    try {
      return await proxy(request, env);
    } catch (error) {
      console.error("Upstream proxy failed", error);
      return new Response(JSON.stringify({
        error: "UPSTREAM_UNAVAILABLE"
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...Object.fromEntries(securityHeaders()),
          ...Object.fromEntries(corsHeaders(request, env))
        }
      });
    }
  }
};


async function hmacSha256(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
