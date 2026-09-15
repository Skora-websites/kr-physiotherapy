// Verifies the admin API rejects unauthenticated, forged, tampered and expired
// tokens — and still accepts a token issued by POST /api/admin/login.
//
// Usage: node scripts/test-admin-auth.js          (server must be on :5100)
//        TEST_BASE_URL=https://... node scripts/test-admin-auth.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { signAdminToken } = require('../backend/src/services/token.service');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5100';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@krphysiotherapy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

let passed = 0;
let failed = 0;

async function call(urlPath, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token !== undefined) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let json = null;
  try { json = await res.json(); } catch (err) { /* response was not JSON */ }
  return { status: res.status, json };
}

async function expect(name, urlPath, opts, expectedStatus) {
  try {
    const res = await call(urlPath, opts);
    if (opts && opts.capture) opts.capture(res.json);

    if (res.status === expectedStatus) {
      console.log(`PASS  ${name} (${expectedStatus})`);
      passed++;
    } else {
      console.log(`FAIL  ${name} — expected ${expectedStatus}, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL  ${name} — request error: ${err.message}`);
    failed++;
  }
}

(async () => {
  console.log(`Admin auth test suite -> ${BASE_URL}\n`);

  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not set in .env — cannot test the success path.');
    process.exitCode = 1; return;
  }

  // --- Unauthenticated access must be rejected (the live-site regression) ---
  await expect('GET  /api/admin/stats        no token', '/api/admin/stats', {}, 401);
  await expect('GET  /api/admin/appointments no token', '/api/admin/appointments', {}, 401);
  await expect('GET  /api/admin/contacts     no token', '/api/admin/contacts', {}, 401);
  await expect('GET  /api/admin/services     no token', '/api/admin/services', {}, 401);
  await expect('POST /api/admin/services     no token', '/api/admin/services', { method: 'POST', body: {} }, 401);
  await expect('DEL  /api/admin/blogs/1      no token', '/api/admin/blogs/1', { method: 'DELETE' }, 401);

  // --- Garbage and legacy-format tokens must be rejected ---
  await expect('GET  /api/admin/stats        Bearer fake', '/api/admin/stats', { token: 'fake' }, 401);
  const legacyToken = Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64');
  await expect('GET  /api/admin/stats        legacy base64 token', '/api/admin/stats', { token: legacyToken }, 401);

  // --- Login ---
  await expect('POST /api/admin/login        wrong password', '/api/admin/login',
    { method: 'POST', body: { email: ADMIN_EMAIL, password: 'definitely-wrong' } }, 401);

  let sessionToken = null;
  await expect('POST /api/admin/login        valid credentials', '/api/admin/login',
    {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      capture: (json) => { if (json && json.token) sessionToken = json.token; }
    }, 200);

  if (!sessionToken) {
    console.log('\nFAIL  no session token issued — remaining assertions cannot run');
    process.exitCode = 1; return;
  }

  // --- The issued token works ---
  await expect('GET  /api/admin/stats        valid token', '/api/admin/stats', { token: sessionToken }, 200);

  // --- Tampered signature ---
  const flipped = sessionToken.slice(0, -1) + (sessionToken.endsWith('A') ? 'B' : 'A');
  await expect('GET  /api/admin/stats        tampered signature', '/api/admin/stats', { token: flipped }, 401);

  // --- Tampered payload keeping the original signature ---
  const originalSignature = sessionToken.split('.')[1];
  const forgedBody = Buffer.from(JSON.stringify({
    email: 'attacker@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64url');
  await expect('GET  /api/admin/stats        tampered payload', '/api/admin/stats',
    { token: `${forgedBody}.${originalSignature}` }, 401);

  // --- Expired token ---
  await expect('GET  /api/admin/stats        expired token', '/api/admin/stats',
    { token: signAdminToken(ADMIN_EMAIL, -10) }, 401);

  // --- Public surface must be unaffected ---
  await expect('GET  /api/health              public', '/api/health', {}, 200);
  await expect('GET  /api/services            public', '/api/services', {}, 200);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed === 0 ? 0 : 1;
})();
