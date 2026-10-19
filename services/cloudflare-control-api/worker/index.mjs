const API_BASE = 'https://api.cloudflare.com/client/v4';
const JWT_HEADER = 'cf-access-jwt-assertion';
const JWKS_TTL_MS = 60 * 60 * 1000;
const JWKS_REFRESH_COOLDOWN_MS = 60 * 1000;
const API_TIMEOUT_MS = 10_000;
const MAX_PAGES = 10;
const MAX_PAGE_SIZE = 100;
const jwksCache = new Map();

const SECURITY_HEADERS = {
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};

function json(body, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
    ...SECURITY_HEADERS,
    ...extraHeaders
  });
  return new Response(JSON.stringify(body), { status, headers });
}

function getIssuer(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function decodeBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_base64url');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function decodeJsonSegment(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function loadJwks(issuer, forceRefresh = false) {
  const cached = jwksCache.get(issuer);
  const now = Date.now();
  if (cached && !forceRefresh && cached.expiresAt > now) return cached.keys;
  // An unknown `kid` must not force a JWKS fetch on every attacker-crafted request.
  if (cached && forceRefresh && now - cached.fetchedAt < JWKS_REFRESH_COOLDOWN_MS) return cached.keys;

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(API_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error('access_jwks_unavailable');
  const document = await response.json();
  if (!document || !Array.isArray(document.keys) || document.keys.length > 50) throw new Error('access_jwks_invalid');

  const keys = document.keys.filter((key) => key && key.kty === 'RSA' && typeof key.kid === 'string' && key.n && key.e);
  if (!keys.length) throw new Error('access_jwks_empty');
  jwksCache.set(issuer, { keys, expiresAt: Date.now() + JWKS_TTL_MS, fetchedAt: Date.now() });
  return keys;
}

function audienceMatches(actual, expected) {
  const values = Array.isArray(actual) ? actual : [actual];
  return values.some((value) => typeof value === 'string' && value === expected);
}

export async function verifyAccessJwt(token, env, nowSeconds = Math.floor(Date.now() / 1000)) {
  const issuer = getIssuer(env.ACCESS_ISSUER);
  const expectedAudience = typeof env.ACCESS_AUD === 'string' ? env.ACCESS_AUD.trim() : '';
  if (!issuer || !expectedAudience || !token || token.length > 16_384) return null;

  try {
    const segments = token.split('.');
    if (segments.length !== 3) return null;
    const header = decodeJsonSegment(segments[0]);
    const claims = decodeJsonSegment(segments[1]);
    if (!header || header.alg !== 'RS256' || typeof header.kid !== 'string' || header.crit) return null;
    if (!claims || claims.iss !== issuer || !audienceMatches(claims.aud, expectedAudience)) return null;
    if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds - 30) return null;
    if (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > nowSeconds + 30)) return null;
    if (claims.iat !== undefined && (!Number.isFinite(claims.iat) || claims.iat > nowSeconds + 30)) return null;

    let keys = await loadJwks(issuer);
    let jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) {
      keys = await loadJwks(issuer, true);
      jwk = keys.find((key) => key.kid === header.kid);
    }
    if (!jwk) return null;

    const publicKey = await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['verify']
    );
    const signedBytes = new TextEncoder().encode(`${segments[0]}.${segments[1]}`);
    const signature = decodeBase64Url(segments[2]);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature, signedBytes);
    return valid ? claims : null;
  } catch {
    return null;
  }
}

function safeAccountId(env) {
  const value = typeof env.CF_ACCOUNT_ID === 'string' ? env.CF_ACCOUNT_ID.trim() : '';
  return /^[a-f0-9]{32}$/i.test(value) ? value : null;
}

async function cloudflareGet(env, resourcePath, query = '') {
  const accountId = safeAccountId(env);
  const token = typeof env.CF_API_READ_TOKEN === 'string' ? env.CF_API_READ_TOKEN.trim() : '';
  if (!accountId || !token) throw new Error('cloudflare_api_not_configured');
  const allowedPaths = new Set(['/workers/scripts', '/d1/database', '/storage/kv/namespaces']);
  if (!allowedPaths.has(resourcePath)) throw new Error('resource_path_not_allowed');
  const url = `${API_BASE}/accounts/${accountId}${resourcePath}${query}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    signal: AbortSignal.timeout(API_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`cloudflare_api_http_${response.status}`);
  const payload = await response.json();
  if (!payload || payload.success !== true || !Array.isArray(payload.result)) {
    throw new Error('cloudflare_api_response_invalid');
  }
  return payload;
}

async function listResource(env, resourcePath, paginate = false) {
  try {
    if (!paginate) {
      const payload = await cloudflareGet(env, resourcePath);
      return { items: payload.result, status: 'ok', count: payload.result.length };
    }

    const firstPage = await cloudflareGet(env, resourcePath, `?page=1&per_page=${MAX_PAGE_SIZE}`);
    const all = [...firstPage.result];
    const totalPages = Number(firstPage.result_info?.total_pages);

    if (Number.isFinite(totalPages) && totalPages > 0) {
      const pageCount = Math.min(totalPages, MAX_PAGES);
      if (pageCount > 1) {
        const pages = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) =>
          cloudflareGet(env, resourcePath, `?page=${index + 2}&per_page=${MAX_PAGE_SIZE}`)
        ));
        for (const page of pages) all.push(...page.result);
      }
      const truncated = totalPages > MAX_PAGES;
      return {
        items: all, status: truncated ? 'partial' : 'ok', count: all.length,
        ...(truncated ? { error: `Kết quả bị giới hạn ở ${MAX_PAGES * MAX_PAGE_SIZE} mục đầu tiên.` } : {})
      };
    }

    if (firstPage.result.length < MAX_PAGE_SIZE) return { items: all, status: 'ok', count: all.length };
    let truncated = false;
    for (let page = 2; page <= MAX_PAGES; page += 1) {
      const payload = await cloudflareGet(env, resourcePath, `?page=${page}&per_page=${MAX_PAGE_SIZE}`);
      all.push(...payload.result);
      if (payload.result.length < MAX_PAGE_SIZE) break;
      if (page === MAX_PAGES) truncated = true;
    }
    return {
      items: all, status: truncated ? 'partial' : 'ok', count: all.length,
      ...(truncated ? { error: `Kết quả bị giới hạn ở ${MAX_PAGES * MAX_PAGE_SIZE} mục đầu tiên.` } : {})
    };
  } catch (error) {
    // Do not expose vendor messages, request URLs, or credentials to the browser.
    const reason = error instanceof Error ? error.message : 'unknown_error';
    const status = reason === 'cloudflare_api_not_configured' ? 'not_configured' : 'error';
    return { items: [], status, count: 0, error: status === 'not_configured' ? 'Chưa cấu hình token API chỉ đọc.' : 'Không thể đọc tài nguyên từ Cloudflare API.' };
  }
}

function projectWorker(worker) {
  return {
    id: String(worker.id || ''),
    createdOn: worker.created_on || null,
    modifiedOn: worker.modified_on || null,
    compatibilityDate: worker.compatibility_date || null,
    usageModel: worker.usage_model || null,
    tags: Array.isArray(worker.tags) ? worker.tags.slice(0, 20).filter((tag) => typeof tag === 'string') : []
  };
}

function projectD1(database) {
  return {
    uuid: String(database.uuid || ''),
    name: String(database.name || ''),
    createdAt: database.created_at || null,
    version: database.version || null,
    numTables: Number.isFinite(database.num_tables) ? database.num_tables : null,
    fileSize: Number.isFinite(database.file_size) ? database.file_size : null
  };
}

function projectKv(namespace) {
  return {
    id: String(namespace.id || ''),
    title: String(namespace.title || ''),
    supportsUrlEncoding: Boolean(namespace.supports_url_encoding)
  };
}

async function getOverview(env, claims) {
  const [workers, databases, namespaces] = await Promise.all([
    listResource(env, '/workers/scripts'),
    listResource(env, '/d1/database', true),
    listResource(env, '/storage/kv/namespaces', true)
  ]);

  const resources = {
    workers: { ...workers, items: workers.items.filter((item) => item && typeof item === 'object').map(projectWorker) },
    databases: { ...databases, items: databases.items.filter((item) => item && typeof item === 'object').map(projectD1) },
    kvNamespaces: { ...namespaces, items: namespaces.items.filter((item) => item && typeof item === 'object').map(projectKv) }
  };
  const warnings = Object.values(resources).filter((item) => item.status !== 'ok').map((item) => item.error || 'Một nguồn dữ liệu chưa sẵn sàng.');
  return {
    generatedAt: new Date().toISOString(),
    account: { id: safeAccountId(env) ? `${safeAccountId(env).slice(0, 6)}…${safeAccountId(env).slice(-4)}` : null },
    viewer: { email: typeof claims.email === 'string' ? claims.email.slice(0, 254) : null },
    totals: {
      workers: resources.workers.count,
      databases: resources.databases.count,
      kvNamespaces: resources.kvNamespaces.count
    },
    resources,
    warnings
  };
}

function withSecurityHeaders(response, html = false) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);
  if (html || headers.get('content-type')?.includes('text/html')) headers.set('cache-control', 'no-store, max-age=0');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/healthz') {
      return json({ ok: true, service: 'hendy-cloud-control-api', mode: 'cloudflare-native' });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed. This release exposes a read-only API.' }, 405, { allow: 'GET, HEAD' });
    }

    const claims = await verifyAccessJwt(request.headers.get(JWT_HEADER), env);
    if (!claims) return json({ error: 'Access authentication required. Open this dashboard through its Cloudflare Access-protected domain.' }, 401);

    if (url.pathname === '/api/overview') {
      if (request.method === 'HEAD') return new Response(null, { status: 204, headers: SECURITY_HEADERS });
      const overview = await getOverview(env, claims);
      console.info(JSON.stringify({ event: 'admin_inventory_read', result: 'completed' }));
      return json(overview);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);

    if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
      return json({ error: 'Static asset binding is not configured.' }, 500);
    }
    try {
      return withSecurityHeaders(await env.ASSETS.fetch(request), url.pathname === '/' || url.pathname.endsWith('.html'));
    } catch {
      return json({ error: 'Unable to serve dashboard assets.' }, 500);
    }
  }
};

export { getIssuer, safeAccountId, audienceMatches };
