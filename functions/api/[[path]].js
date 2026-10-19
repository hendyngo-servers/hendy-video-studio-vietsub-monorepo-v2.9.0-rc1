const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

function errorResponse(status, error, message) {
  return new Response(JSON.stringify({ ok: false, error, message }), { status, headers: JSON_HEADERS });
}

export async function onRequest(context) {
  const backend = String(context.env.BACKEND_API_URL || "").trim();
  if (!backend) {
    return errorResponse(503, "BACKEND_NOT_CONFIGURED", "Set BACKEND_API_URL in Cloudflare Pages environment variables to the HTTPS URL of the Render web service.");
  }

  let backendUrl;
  try {
    backendUrl = new URL(backend);
    if (backendUrl.protocol !== "https:" || backendUrl.username || backendUrl.password) {
      return errorResponse(500, "INVALID_BACKEND_URL", "BACKEND_API_URL must be an HTTPS origin without embedded credentials.");
    }
  } catch {
    return errorResponse(500, "INVALID_BACKEND_URL", "BACKEND_API_URL must be a valid HTTPS URL.");
  }

  const incoming = new URL(context.request.url);
  const basePath = backendUrl.pathname.replace(/\/$/, "");
  backendUrl.pathname = basePath + incoming.pathname;
  backendUrl.search = incoming.search;

  const headers = new Headers(context.request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const init = {
    method: context.request.method,
    headers,
    redirect: "manual"
  };
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    init.body = context.request.body;
  }

  try {
    const upstream = await fetch(new Request(backendUrl.toString(), { ...init, duplex: "half" }));
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("cache-control", "no-store");
    responseHeaders.delete("set-cookie");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Pages API proxy failed", error instanceof Error ? error.message : "unknown error");
    return errorResponse(502, "BACKEND_UNAVAILABLE", "The Render backend could not be reached. Check the Render service status and BACKEND_API_URL.");
  }
}
