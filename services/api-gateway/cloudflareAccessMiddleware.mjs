import { createPublicKey, verify as verifySignature } from 'node:crypto';

const JWKS_TTL_MS = 60 * 60 * 1000;
const JWKS_REFRESH_COOLDOWN_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;
const jwksCache = new Map();

function getIssuer(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function decodeJsonSegment(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_jwt_segment');
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

async function loadJwks(issuer, forceRefresh = false) {
  const cached = jwksCache.get(issuer);
  const now = Date.now();
  if (cached && !forceRefresh && cached.expiresAt > now) return cached.keys;
  if (cached && forceRefresh && now - cached.fetchedAt < JWKS_REFRESH_COOLDOWN_MS) return cached.keys;

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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

export async function verifyCloudflareAccessJwt(token, env = process.env, nowSeconds = Math.floor(Date.now() / 1000)) {
  const issuer = getIssuer(env.ADMIN_ACCESS_ISSUER);
  const expectedAudience = typeof env.ADMIN_ACCESS_AUD === 'string' ? env.ADMIN_ACCESS_AUD.trim() : '';
  if (!issuer || !expectedAudience || typeof token !== 'string' || !token || token.length > 16_384) return null;

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
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const signingInput = Buffer.from(`${segments[0]}.${segments[1]}`, 'utf8');
    const signature = Buffer.from(segments[2], 'base64url');
    return verifySignature('RSA-SHA256', signingInput, publicKey, signature) ? claims : null;
  } catch {
    return null;
  }
}

function isLoopbackRequest(req) {
  const rawHost = String(req.hostname || req.headers?.host || '').toLowerCase();
  const host = rawHost.startsWith('[') ? rawHost.slice(1, rawHost.indexOf(']')) : rawHost.split(':')[0];
  const rawPeer = String(req.socket?.remoteAddress || req.connection?.remoteAddress || '').toLowerCase();
  const peer = rawPeer.startsWith('::ffff:') ? rawPeer.slice(7) : rawPeer;
  const hostIsLoopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const peerIsLoopback = peer === 'localhost' || peer === '127.0.0.1' || peer === '::1';
  // Checking Host alone is unsafe: a remote client can forge `Host: localhost`.
  return hostIsLoopback && peerIsLoopback;
}

function isProductionEnvironment(env) {
  return env.NODE_ENV === 'production' || env.RENDER === 'true' || Boolean(env.RENDER_EXTERNAL_URL) ||
    env.RAILWAY_ENVIRONMENT === 'production' || env.CF_PAGES === '1';
}

export function createRequireCloudflareAccessAdmin({ env = process.env, verifyJwt = verifyCloudflareAccessJwt } = {}) {
  return async function requireCloudflareAccessAdmin(req, res, next) {
    // Local development bypass is explicit, local-host-only, and never active in production.
    if (!isProductionEnvironment(env) && env.ADMIN_ACCESS_ALLOW_LOCAL_DEV === 'true' && isLoopbackRequest(req)) {
      return next();
    }

    const issuer = getIssuer(env.ADMIN_ACCESS_ISSUER);
    const audience = typeof env.ADMIN_ACCESS_AUD === 'string' ? env.ADMIN_ACCESS_AUD.trim() : '';
    const allowedEmails = String(env.ADMIN_ACCESS_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
    if (!issuer || !audience) {
      return res.status(503).json({ error: 'admin_access_not_configured' });
    }
    if (allowedEmails.length === 0) {
      return res.status(503).json({ error: 'admin_access_allowlist_not_configured' });
    }

    const token = typeof req.get === 'function'
      ? req.get('cf-access-jwt-assertion')
      : req.headers?.['cf-access-jwt-assertion'];
    if (typeof token !== 'string' || !token) {
      return res.status(401).json({ error: 'admin_access_required' });
    }

    let claims = null;
    try { claims = await verifyJwt(token, env); } catch { claims = null; }
    if (!claims) return res.status(401).json({ error: 'admin_access_invalid' });
    const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';
    if (!email || !allowedEmails.includes(email)) return res.status(403).json({ error: 'admin_identity_not_allowed' });
    res.locals.adminAccessClaims = { sub: claims.sub || null, email };
    return next();
  };
}

export const requireCloudflareAccessAdmin = createRequireCloudflareAccessAdmin();
