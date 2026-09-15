const fs = require('fs');
const path = require('path');
const { query } = require('../backend/src/config/db');

async function exportDatabase() {
  const schemaSql = fs.readFileSync(path.resolve(__dirname, '../backend/database/migrations/001_create_tables.sql'), 'utf8');
  
  const tables = [
    'pages',
    'services',
    'treatments',
    'doctors',
    'testimonials',
    'blog_categories',
    'blogs',
    'seo_metadata',
    'media',
    'navigation_items',
    'site_settings',
    'appointments',
    'contact_submissions'
  ];

  let dump = `-- ========================================================\n`;
  dump += `-- KR Physiotherapy & Rehabilitation Clinic - Production SQL Dump\n`;
  dump += `-- Target: MySQL 8.0+ / MariaDB 10.5+\n`;
  dump += `-- Generated: ${new Date().toISOString()}\n`;
  dump += `-- ========================================================\n\n`;
  dump += `CREATE DATABASE IF NOT EXISTS \`krphysiotherapy\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  dump += `USE \`krphysiotherapy\`;\n\n`;
  dump += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
  dump += `-- Table Structure\n`;
  dump += schemaSql + `\n\n`;
  dump += `-- Data Inserts\n`;

  for (const table of tables) {
    const rows = await query(`SELECT * FROM ${table}`);
    if (rows && rows.length > 0) {
      dump += `-- Table data: ${table} (${rows.length} rows)\n`;
      const keys = Object.keys(rows[0]);
      for (const row of rows) {
        const values = keys.map(k => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          const escaped = String(val)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
          return `'${escaped}'`;
        });
        dump += `INSERT INTO \`${table}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
      }
      dump += `\n`;
    }
  }

  dump += `SET FOREIGN_KEY_CHECKS=1;\n`;
  dump += `-- End of dump\n`;

  const outputPath = path.resolve(__dirname, '../backend/database/production_dump.sql');
  fs.writeFileSync(outputPath, dump, 'utf8');
  console.log(`Successfully generated full production SQL dump (${(dump.length / 1024).toFixed(1)} KB) at:`);
  console.log(outputPath);
  process.exit(0);
}

exportDatabase().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
