const { spawn } = require('child_process');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3307', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';

async function isDbReady() {
  try {
    const conn = await mysql.createConnection({ host, port, user, password, connectTimeout: 1000 });
    await conn.query('SELECT 1;');
    await conn.end();
    return true;
  } catch (e) {
    return false;
  }
}

async function startDb() {
  const ready = await isDbReady();
  if (ready) {
    console.log(`Database is already reachable on ${host}:${port}`);
    return;
  }

  console.log(`Database not reachable on ${host}:${port}. Attempting to start DevKit MariaDB on port ${port}...`);

  const mysqldPath = 'C:\\CodesEasy\\DevKit\\services\\mysql\\bin\\mysqld.exe';
  const myIniPath = 'C:\\CodesEasy\\DevKit\\services\\mysql\\my.ini';

  const child = spawn(mysqldPath, [
    `--defaults-file=${myIniPath}`,
    `--port=${port}`,
    '--console'
  ], {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();

  // Wait up to 10 seconds for DB to become ready
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await isDbReady()) {
      console.log(`MariaDB started successfully on ${host}:${port}!`);
      return;
    }
  }

  throw new Error(`Failed to start database on port ${port} after 10 seconds.`);
}

if (require.main === module) {
  startDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = startDb;
