// Bearer-token auth for admin routes.
// Tokens are HMAC-SHA256 signed and time-limited (see services/token.service.js)
// and are only issued by POST /api/admin/login after a valid password check.
// Fails closed: if no ADMIN_TOKEN_SECRET/ADMIN_PASSWORD is configured, every
// request is rejected rather than let through.
const { verifyAdminToken } = require('../services/token.service');

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: missing bearer token' });
  }

  const payload = verifyAdminToken(header.slice(7).trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid or expired token' });
  }

  req.admin = payload;
  next();
}

module.exports = { adminAuth };
