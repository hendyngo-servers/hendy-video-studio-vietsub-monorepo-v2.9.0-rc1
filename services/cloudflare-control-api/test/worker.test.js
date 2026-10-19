import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign as signBytes } from 'node:crypto';
import worker, { verifyAccessJwt } from '../worker/index.mjs';

const issuer = 'https://hendy-test.cloudflareaccess.com';
const audience = 'hendy-dashboard-test-audience';
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key-1', use: 'sig', alg: 'RS256' };
const originalFetch = globalThis.fetch;

function b64url(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}
function makeJwt({ aud = audience, exp = Math.floor(Date.now() / 1000) + 300, nbf, email = 'admin@example.test', kid = jwk.kid, iss = issuer } = {}) {
  const header = b64url({ alg: 'RS256', typ: 'JWT', kid });
  const claims = { iss, aud, exp, iat: Math.floor(Date.now() / 1000), email };
  if (nbf !== undefined) claims.nbf = nbf;
  const payload = b64url(claims);
  const input = `${header}.${payload}`;
  return `${input}.${signBytes('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url')}`;
}
function makeEnv(overrides = {}) {
  return {
    ACCESS_ISSUER: issuer,
    ACCESS_AUD: audience,
    CF_ACCOUNT_ID: 'a'.repeat(32),
    CF_API_READ_TOKEN: 'synthetic-read-only-token',
    ASSETS: { fetch: async () => new Response('<!doctype html><title>Test</title>', { headers: { 'content-type': 'text/html; charset=utf-8' } }) },
    ...overrides
  };
}
function accessRequest(path, token, method = 'GET') {
  const headers = token ? { 'cf-access-jwt-assertion': token } : {};
  return new Request(`https://hendy.example.test${path}`, { method, headers });
}
function installCloudflareMock({ failD1 = false } = {}) {
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.origin === issuer && url.pathname === '/cdn-cgi/access/certs') {
      return Response.json({ keys: [jwk] });
    }
    if (url.origin === 'https://api.cloudflare.com' && init.headers?.authorization === 'Bearer synthetic-read-only-token') {
      if (url.pathname.endsWith('/workers/scripts')) {
        return Response.json({ success: true, result: [{ id: 'hendy-worker', compatibility_date: '2026-10-17', modified_on: '2026-10-16T12:00:00Z', created_on: '2026-10-10T12:00:00Z', tags: ['prod'], secretField: 'must-not-escape' }] });
      }
      if (url.pathname.endsWith('/d1/database')) {
        if (failD1) return new Response('provider details should not escape', { status: 403 });
        return Response.json({ success: true, result: [{ uuid: 'db-123', name: 'hendy-data', created_at: '2026-10-10T12:00:00Z', num_tables: 3, file_size: 4096, rows: ['not-exposed'] }], result_info: { page: 1, per_page: 100, total_pages: 1 } });
      }
      if (url.pathname.endsWith('/storage/kv/namespaces')) {
        return Response.json({ success: true, result: [{ id: 'kv-123', title: 'hendy-cache', supports_url_encoding: true, value: 'must-not-escape' }], result_info: { page: 1, per_page: 100, total_pages: 1 } });
      }
    }
    throw new Error(`Unexpected test fetch: ${url.toString()}`);
  };
}

test('health endpoint is public but reveals no account or secret configuration', async () => {
  const response = await worker.fetch(new Request('https://hendy.example.test/healthz'), makeEnv());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { ok: true, service: 'hendy-cloud-control-api', mode: 'cloudflare-native' });
  assert.equal(JSON.stringify(body).includes('CF_API_READ_TOKEN'), false);
});

test('private static assets require a valid Access JWT', async () => {
  let assetCalls = 0;
  const env = makeEnv({ ASSETS: { fetch: async () => { assetCalls += 1; return new Response('private page'); } } });
  const response = await worker.fetch(accessRequest('/'), env);
  assert.equal(response.status, 401);
  assert.equal(assetCalls, 0);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('private API rejects missing, wrongly-audienced and expired JWTs', async () => {
  const env = makeEnv();
  const missing = await worker.fetch(accessRequest('/api/overview'), env);
  assert.equal(missing.status, 401);
  const wrongAud = await worker.fetch(accessRequest('/api/overview', makeJwt({ aud: 'other-audience' })), env);
  assert.equal(wrongAud.status, 401);
  const expired = await worker.fetch(accessRequest('/api/overview', makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 })), env);
  assert.equal(expired.status, 401);
  const invalidSignature = makeJwt().split('.');
  invalidSignature[2] = `${invalidSignature[2][0] === 'a' ? 'b' : 'a'}${invalidSignature[2].slice(1)}`;
  const forged = await worker.fetch(accessRequest('/api/overview', invalidSignature.join('.')), env);
  assert.equal(forged.status, 401);
});

test('valid Access JWT returns projected read-only inventory', async () => {
  installCloudflareMock();
  try {
    const response = await worker.fetch(accessRequest('/api/overview', makeJwt()), makeEnv());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    const body = await response.json();
    assert.equal(body.totals.workers, 1);
    assert.equal(body.totals.databases, 1);
    assert.equal(body.totals.kvNamespaces, 1);
    assert.equal(body.resources.workers.items[0].id, 'hendy-worker');
    assert.equal(body.resources.databases.items[0].name, 'hendy-data');
    assert.equal(body.resources.kvNamespaces.items[0].title, 'hendy-cache');
    assert.equal(body.viewer.email, 'admin@example.test');
    assert.equal(JSON.stringify(body).includes('must-not-escape'), false);
    assert.equal(JSON.stringify(body).includes('synthetic-read-only-token'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('a provider error is isolated and returned without raw vendor details', async () => {
  installCloudflareMock({ failD1: true });
  try {
    const response = await worker.fetch(accessRequest('/api/overview', makeJwt()), makeEnv());
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.resources.workers.status, 'ok');
    assert.equal(body.resources.databases.status, 'error');
    assert.equal(body.resources.databases.error, 'Không thể đọc tài nguyên từ Cloudflare API.');
    assert.equal(JSON.stringify(body).includes('provider details'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('mutation methods and unknown API routes are not exposed', async () => {
  const post = await worker.fetch(accessRequest('/api/overview', null, 'POST'), makeEnv());
  assert.equal(post.status, 405);
  const unknown = await worker.fetch(accessRequest('/api/arbitrary-proxy', makeJwt()), makeEnv());
  assert.equal(unknown.status, 404);
});


test('unknown Access key IDs cannot force a JWKS network refresh on every request', async () => {
  const isolatedIssuer = 'https://hendy-jwks-throttle-test.cloudflareaccess.com';
  let jwksFetchCount = 0;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.origin === isolatedIssuer && url.pathname === '/cdn-cgi/access/certs') {
      jwksFetchCount += 1;
      return Response.json({ keys: [jwk] });
    }
    throw new Error(`Unexpected JWKS test fetch: ${url.toString()}`);
  };
  try {
    const token = makeJwt({ kid: 'attacker-chosen-unknown-kid', iss: isolatedIssuer });
    const env = { ACCESS_ISSUER: isolatedIssuer, ACCESS_AUD: audience };
    assert.equal(await verifyAccessJwt(token, env), null);
    assert.equal(await verifyAccessJwt(token, env), null);
    assert.equal(jwksFetchCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.after(() => { globalThis.fetch = originalFetch; });

test('integration: authenticated HEAD is metadata-only and unknown paths do not expose assets', async () => {
  let assetCalls = 0;
  const env = makeEnv({ ASSETS: { fetch: async () => { assetCalls += 1; return new Response('<html>private</html>', { headers: { 'content-type': 'text/html' } }); } } });
  const head = await worker.fetch(accessRequest('/api/overview', makeJwt(), 'HEAD'), env);
  assert.equal(head.status, 204);
  assert.equal(await head.text(), '');
  const missing = await worker.fetch(accessRequest('/api/not-enabled', makeJwt()), env);
  assert.equal(missing.status, 404);
  const staticPage = await worker.fetch(accessRequest('/', makeJwt()), env);
  assert.equal(staticPage.status, 200);
  assert.equal(staticPage.headers.get('cache-control'), 'no-store, max-age=0');
  assert.match(staticPage.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(assetCalls, 1);
});

test('integration: invalid account configuration fails closed without calling Cloudflare API', async () => {
  let providerCalls = 0;
  globalThis.fetch = async () => { providerCalls += 1; throw new Error('provider should not be called'); };
  try {
    const env = makeEnv({ CF_ACCOUNT_ID: 'invalid-account-id' });
    const response = await worker.fetch(accessRequest('/api/overview', makeJwt()), env);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.resources.workers.status, 'not_configured');
    assert.equal(body.resources.databases.status, 'not_configured');
    assert.equal(body.resources.kvNamespaces.status, 'not_configured');
    assert.equal(providerCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
