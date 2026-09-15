const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const app = require('./app');
const { checkDatabase } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    // Real connectivity probe: query() silently falls back to JSON, so it cannot
    // be used to report whether MySQL is actually reachable.
    const db = await checkDatabase();
    if (db.connected) {
      console.log(`[DB] MySQL connected — ${db.target.user}@${db.target.host}:${db.target.port}/${db.database} (${db.version}) in ${db.latencyMs}ms`);
      if (db.content && db.content.error) {
        console.warn(`[DB] ${db.content.error}`);
      }
    } else {
      console.warn(`[DB] ${db.reason}`);
    }

    // Admin auth configuration — login fails closed without ADMIN_PASSWORD.
    if (!process.env.ADMIN_TOKEN_SECRET) {
      console.warn('[ADMIN] ADMIN_TOKEN_SECRET is not set — falling back to ADMIN_PASSWORD for token signing. Set a dedicated secret in .env / Vercel.');
    }
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('[ADMIN] ADMIN_PASSWORD is not set — admin login is disabled (503).');
    }

    const server = app.listen(PORT, () => {
      console.log(`KR Physiotherapy Server running on port ${PORT} (http://localhost:${PORT})`);
      console.log(`REST API available at http://localhost:${PORT}/api/`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
