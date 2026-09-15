const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function runMigration() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'krphysiotherapy';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let rootConn;
  try {
    rootConn = await mysql.createConnection({ host, port, user, password });
    console.log('Connected to MySQL server.');

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${database}' ensured.`);
    await rootConn.end();
  } catch (err) {
    console.error('Failed connecting to MySQL server:', err.message);
    throw err;
  }

  // Connect to the specific database and run schema
  const dbConn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  const sqlPath = path.join(__dirname, '001_create_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running table migrations...');
  await dbConn.query(sql);
  console.log('All migrations executed successfully.');
  await dbConn.end();
}

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = runMigration;
