import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createRequireCloudflareAccessAdmin, verifyCloudflareAccessJwt } from './cloudflareAccessMiddleware.mjs';

const issuer = 'https://admin-test.cloudflareaccess.com';
const audience = 'admin-app-test-audience';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key-1', alg: 'RS256', use: 'sig' };
const originalFetch = globalThis.fetch;

after(() => { globalThis.fetch = originalFetch; });
function makeJwt(overrides = {}, headerOverrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', kid: 'test-key-1', ...headerOverrides };
  const claims = { iss: issuer, aud: audience, sub: 'admin-test-sub', email: 'admin@example.test', iat: now, exp: now + 300, ...overrides };
  const head = Buffer.from(JSON.stringify(header)).toString('base64url');
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const input = `${head}.${body}`;
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url')}`;
}
function mockJwksFetch() {
  globalThis.fetch = async (url) => {
    assert.equal(String(url), `${issuer}/cdn-cgi/access/certs`);
    return new Response(JSON.stringify({ keys: [jwk] }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}
function mockRes() {
  return {
    statusCode: 200,
    body: null,
    locals: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

 test('valid Cloudflare Access RS256 token verifies against configured issuer and audience', async () => {
  mockJwksFetch();
  const claims = await verifyCloudflareAccessJwt(makeJwt(), { ADMIN_ACCESS_ISSUER: issuer, ADMIN_ACCESS_AUD: audience });
  assert.equal(claims?.email, 'admin@example.test');
});

test('invalid audience, expired token, and non-RS256 token are rejected', async () => {
  mockJwksFetch();
  const env = { ADMIN_ACCESS_ISSUER: issuer, ADMIN_ACCESS_AUD: audience };
  assert.equal(await verifyCloudflareAccessJwt(makeJwt({ aud: 'wrong-audience' }), env), null);
  assert.equal(await verifyCloudflareAccessJwt(makeJwt({ exp: Math.floor(Date.now() / 1000) - 120 }), env), null);
  assert.equal(await verifyCloudflareAccessJwt(makeJwt({}, { alg: 'none' }), env), null);
});

test('admin middleware fails closed when the production Access configuration is missing', async () => {
  const middleware = createRequireCloudflareAccessAdmin({ env: { NODE_ENV: 'production' } });
  const req = { headers: {}, hostname: 'admin.example.test' };
  const res = mockRes();
  let nextCalled = false;
  await middleware(req, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'admin_access_not_configured');
  assert.equal(nextCalled, false);
});


test('production admin middleware fails closed without an explicit email allowlist', async () => {
  const env = { NODE_ENV: 'production', ADMIN_ACCESS_ISSUER: issuer, ADMIN_ACCESS_AUD: audience };
  const middleware = createRequireCloudflareAccessAdmin({ env });
  const res = mockRes();
  await middleware({ headers: {}, hostname: 'admin.example.test' }, res, () => {});
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'admin_access_allowlist_not_configured');
});

test('verified but non-allowlisted identity is rejected', async () => {
  const env = { NODE_ENV: 'production', ADMIN_ACCESS_ISSUER: issuer, ADMIN_ACCESS_AUD: audience, ADMIN_ACCESS_EMAILS: 'other@example.test' };
  const middleware = createRequireCloudflareAccessAdmin({ env, verifyJwt: async () => ({ sub: 'sub-1', email: 'ops@example.test' }) });
  const res = mockRes();
  await middleware({ headers: { 'cf-access-jwt-assertion': 'valid' }, hostname: 'admin.example.test' }, res, () => {});
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'admin_identity_not_allowed');
});

test('admin middleware requires a token and accepts a verified Access identity', async () => {
  const env = { NODE_ENV: 'production', ADMIN_ACCESS_ISSUER: issuer, ADMIN_ACCESS_AUD: audience, ADMIN_ACCESS_EMAILS: 'ops@example.test' };
  const middleware = createRequireCloudflareAccessAdmin({ env, verifyJwt: async (token) => token === 'valid' ? { sub: 'sub-1', email: 'ops@example.test' } : null });
  const noTokenResponse = mockRes();
  await middleware({ headers: {}, hostname: 'admin.example.test' }, noTokenResponse, () => {});
  assert.equal(noTokenResponse.statusCode, 401);

  const res = mockRes();
  let nextCalled = false;
  await middleware({ headers: { 'cf-access-jwt-assertion': 'valid' }, hostname: 'admin.example.test' }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.deepEqual(res.locals.adminAccessClaims, { sub: 'sub-1', email: 'ops@example.test' });
});

test('local bypass requires explicit opt-in and a loopback host', async () => {
  const env = { NODE_ENV: 'development', ADMIN_ACCESS_ALLOW_LOCAL_DEV: 'true' };
  const middleware = createRequireCloudflareAccessAdmin({ env });
  let localNext = false;
  await middleware({ headers: {}, hostname: 'localhost', socket: { remoteAddress: '::1' } }, mockRes(), () => { localNext = true; });
  assert.equal(localNext, true);
  let remoteNext = false;
  const remoteRes = mockRes();
  await middleware({ headers: {}, hostname: 'example.com', socket: { remoteAddress: '203.0.113.7' } }, remoteRes, () => { remoteNext = true; });
  assert.equal(remoteNext, false);
  assert.equal(remoteRes.statusCode, 503);

  const forgedHostRes = mockRes();
  let forgedHostNext = false;
  await middleware({ headers: { host: 'localhost:3000' }, hostname: 'localhost', socket: { remoteAddress: '203.0.113.7' } }, forgedHostRes, () => { forgedHostNext = true; });
  assert.equal(forgedHostNext, false, 'remote peer cannot use a forged localhost Host header');
  assert.equal(forgedHostRes.statusCode, 503);
});
