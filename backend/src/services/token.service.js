const crypto = require('crypto');

// Admin session tokens are opaque strings: <base64url(payload)>.<base64url(hmac)>
// Signed with ADMIN_TOKEN_SECRET (falling back to ADMIN_PASSWORD) using Node's
// built-in crypto only — no external dependency required.
const DEFAULT_TTL_SECONDS = 12 * 60 * 60; // 12 hours

function getSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';
}

function signValue(body) {
  return crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
}

// Issues a signed, expiring token for the given admin email.
function signAdminToken(email, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ email, iat: now, exp: now + ttlSeconds });
  const body = Buffer.from(payload, 'utf8').toString('base64url');
  return `${body}.${signValue(body)}`;
}

// Returns the token payload when the token is authentic AND unexpired, else null.
// Fails closed: with no secret configured, every token is rejected.
function verifyAdminToken(token) {
  if (!getSecret() || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = signValue(body);
  // Compare the base64url strings in constant time. Lengths must match first
  // because crypto.timingSafeEqual throws on differing buffer lengths.
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch (err) {
    return null;
  }

  if (!payload || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null;
  return payload;
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  DEFAULT_TTL_SECONDS
};