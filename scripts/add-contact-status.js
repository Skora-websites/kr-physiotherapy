require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT||'3307'),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, connectTimeout: 5000
  });
  try {
    await pool.execute("ALTER TABLE contact_submissions ADD COLUMN status VARCHAR(50) DEFAULT 'New'");
    console.log('Added status column to contact_submissions');
  } catch(e) { console.log('Column may already exist:', e.message); }
  await pool.end();
})();
