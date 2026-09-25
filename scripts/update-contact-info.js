// Contact-info update: phone swap, doctor name credential, Hijama page removal.
// Applies to BOTH backend/database/seed-data JSON files and the live MySQL DB.
// Idempotent — safe to run repeatedly. Mirrors scripts/db-update-content.js style.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const seedDir = path.resolve(__dirname, '../backend/database/seed-data');

// Ordered swaps: de-dupe combined patterns FIRST, then generic variants, then name
// (normalize existing "(PT)" before re-adding so nothing becomes "(PT)(PT)").
const TEXT_SWAPS = [
  // pages (about): lists both numbers — collapse to the new one
  ['<a href="tel:+918595321652">+91 85953 21652</a>, <a href="tel:+917668527335">+91 76685 27335</a>', '<a href="tel:+917668527335">+91 76685 27335</a>'],
  // structured data (LocalBusiness.telephone): lists both numbers — collapse
  ['+91 8595321652, +91 7668527335', '+91 7668527335'],
  // generic phone variants
  ['tel:+918595321652', 'tel:+917668527335'],
  ['+91 8595321652', '+91 7668527335'],
  ['+91 85953 21652', '+91 76685 27335'],
  ['85953 21652', '76685 27335'],
  ['8595321652', '7668527335'],
  // name: normalize, then append the (PT) credential everywhere
  ['Neelam Sharma(PT)', 'Neelam Sharma'],
  ['Neelam Sharma', 'Neelam Sharma(PT)']
];

const applySwaps = (text) => TEXT_SWAPS.reduce((acc, [from, to]) => acc.split(from).join(to), text);

function walk(value) {
  if (typeof value === 'string') return applySwaps(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
  }
  return value;
}

/* ── Part 1: JSON seed data ─────────────────────────────────────────────── */
const JSON_FILES = [
  'pages.json', 'services.json', 'treatments.json', 'doctors.json',
  'testimonials.json', 'blogs.json', 'blog-categories.json',
  'seo.json', 'navigation.json', 'site-settings.json', 'media.json'
];

// Entries to drop entirely (Hijama page removal)
const FILTERS = {
  'treatments.json': (list) => list.filter((t) => t.slug !== 'hijama-cupping-therapy'),
  'navigation.json': (list) => list.filter((n) => n.url !== '/hijama-cupping-therapy.html'),
  'seo.json': (list) => list.filter((s) => s.path !== '/hijama-cupping-therapy.html')
};

function updateSeedFiles() {
  let changed = 0;
  for (const file of JSON_FILES) {
    const p = path.join(seedDir, file);
    if (!fs.existsSync(p)) continue;
    let data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (FILTERS[file]) data = FILTERS[file](data);
    const out = JSON.stringify(walk(data), null, 2) + '\n';
    fs.writeFileSync(p, out, 'utf8');
    changed++;
  }
  console.log(`Seed data updated: ${changed} JSON file(s) rewritten.`);
}

/* ── Part 2: Live MySQL database ────────────────────────────────────────── */
const chain = (col) => TEXT_SWAPS.reduce(
  (expr, [f, t]) => `REPLACE(${expr}, ${mysql.escape(f)}, ${mysql.escape(t)})`,
  col
);

const STATEMENTS = [
  // Hijama page removal
  `DELETE FROM treatments WHERE slug='hijama-cupping-therapy'`,
  `DELETE FROM navigation_items WHERE url='/hijama-cupping-therapy.html'`,
  `DELETE FROM seo_metadata WHERE path='/hijama-cupping-therapy.html'`,
  // Content text swaps
  `UPDATE pages SET content_html = ${chain('content_html')}, subtitle = ${chain('subtitle')}`,
  `UPDATE services SET name = ${chain('name')}, short_description = ${chain('short_description')}, full_description_html = ${chain('full_description_html')}`,
  `UPDATE treatments SET name = ${chain('name')}, summary = ${chain('summary')}, symptoms_html = ${chain('symptoms_html')}, causes_html = ${chain('causes_html')}, treatment_html = ${chain('treatment_html')}`,
  `UPDATE doctors SET name = ${chain('name')}, bio_html = ${chain('bio_html')}, phone = ${chain('phone')}`,
  `UPDATE blogs SET author_name = ${chain('author_name')}, excerpt = ${chain('excerpt')}, content_html = ${chain('content_html')}`,
  `UPDATE testimonials SET doctor_name = ${chain('doctor_name')}, testimonial_text = ${chain('testimonial_text')}`,
  `UPDATE site_settings SET setting_value = ${chain('setting_value')}`,
  `UPDATE seo_metadata SET meta_title = ${chain('meta_title')}, meta_description = ${chain('meta_description')}, meta_keywords = ${chain('meta_keywords')}, og_title = ${chain('og_title')}, og_description = ${chain('og_description')}, structured_data_json = ${chain('structured_data_json')}`,
  `UPDATE navigation_items SET title = ${chain('title')}`
];

const CHECKS = [
  "SELECT (SELECT COUNT(*) FROM treatments WHERE slug LIKE '%hijama%') AS hijama_treatments",
  "SELECT (SELECT COUNT(*) FROM navigation_items WHERE url LIKE '%hijama%') AS hijama_nav",
  "SELECT (SELECT COUNT(*) FROM seo_metadata WHERE path LIKE '%hijama%') AS hijama_seo",
  "SELECT (SELECT COUNT(*) FROM pages WHERE content_html LIKE '%8595321652%' OR content_html LIKE '%85953 21652%') AS old_phone_pages",
  "SELECT (SELECT COUNT(*) FROM doctors WHERE phone LIKE '%8595321652%' OR bio_html LIKE '%85953 21652%') AS old_phone_doctors",
  "SELECT (SELECT COUNT(*) FROM seo_metadata WHERE structured_data_json LIKE '%8595321652%' OR meta_description LIKE '%8595321652%') AS old_phone_seo",
  "SELECT (SELECT COUNT(*) FROM blogs WHERE author_name = 'Dr. Neelam Sharma') AS blogs_without_pt",
  "SELECT (SELECT COUNT(*) FROM site_settings WHERE setting_key='phone_primary' AND setting_value NOT LIKE '%7668527335%') AS settings_phone"
];

(async () => {
  updateSeedFiles();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: false
  });

  try {
    let applied = 0;
    for (const sql of STATEMENTS) {
      const [res] = await conn.query(sql);
      applied += res.affectedRows || 0;
    }
    console.log(`DB statements applied — ${applied} row(s) affected.`);

    console.log('\nVerification:');
    let clean = true;
    for (const c of CHECKS) {
      const [[row]] = await conn.query(c);
      const key = Object.keys(row)[0];
      if (row[key] > 0) clean = false;
      console.log(' ', key + ':', row[key]);
    }
    console.log(clean ? 'DB is CLEAN.' : 'DB needs attention (see non-zero counts above).');
  } finally {
    await conn.end();
  }
  process.exit(0);
})().catch((err) => {
  console.error('Update failed:', err.message);
  process.exit(1);
});
