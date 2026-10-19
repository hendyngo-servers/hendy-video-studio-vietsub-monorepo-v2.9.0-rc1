export async function onRequest(context) {
  const configured = String(context.env.BACKEND_API_URL || "").trim();
  if (!configured) {
    return Response.json(
      { ok: false, status: "backend_not_configured", message: "Set BACKEND_API_URL in Cloudflare Pages environment variables." },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  let backend;
  try {
    backend = new URL(configured);
    if (backend.protocol !== "https:" || backend.username || backend.password) throw new Error("invalid backend URL");
  } catch {
    return Response.json({ ok: false, status: "invalid_backend_url" }, { status: 500 });
  }

  backend.pathname = backend.pathname.replace(/\/$/, "") + "/health";
  backend.search = "";
  try {
    const response = await fetch(backend.toString(), { headers: { accept: "application/json" }, redirect: "manual" });
    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch {
    return Response.json({ ok: false, status: "backend_unavailable" }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
