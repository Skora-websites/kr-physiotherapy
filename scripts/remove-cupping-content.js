// Cupping/Hijama content removal.
// 1) Deletes the two cupping blog articles (+ their SEO rows/paths and media entries)
// 2) Strips cupping/hijama wording from doctor bio & FAQs, treatment copy, page copy
//    and SEO FAQ schema (removes cupping Question entries entirely)
// Applies to BOTH backend/database/seed-data JSON files and the live MySQL DB.
// Idempotent — safe to run repeatedly. Mirrors scripts/update-contact-info.js style.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const seedDir = path.resolve(__dirname, '../backend/database/seed-data');

const CUPPING_BLOG_SLUGS = [
  'cupping-therapy-and-the-various-advantages-it-provides',
  'go-for-the-cupping-therapy-in-noida-for-best-results'
];

// Ordered phrase rewrites (most specific first). Generic single-word fallbacks come
// last so nothing mentioning cupping/hijama can survive; tidy() fixes the seams.
const TEXT_SWAPS = [
  // doctors.json bio_html: treatment list
  ['tapping, Chiropractor, Dry needling, dry cupping, hijama cupping.', 'tapping, Chiropractor and Dry needling.'],
  // doctors.json / seo.json doctor FAQ: "why do patients visit" answer (typo "chirapractic" fixed too)
  ['dry needling, cupping therapy, chirapractic and other manual therapies', 'dry needling, chiropractic and other manual therapies'],
  ['dry needling, cupping therapy, chiropractic and other manual therapies', 'dry needling, chiropractic and other manual therapies'],
  // treatments.json (back pain): treatment copy
  ['mobilisation, chiropractic, dry needling and cupping, and provides treatment', 'mobilisation, chiropractic and dry needling, and provides treatment'],
  ['we use chiropractic, cupping therapy and manual therapy', 'we use chiropractic and manual therapy'],
  // seo.json shoulder-pain FAQ answers
  ['dry needling, cupping therapy can relief from shoulder pain', 'dry needling can relief from shoulder pain'],
  ['postural taping, cupping therapy & dry needling', 'postural taping & dry needling'],
  // blogs.json (non-cupping articles) passing mentions
  ['like massage cupping, exercise or stretching techniques', 'like massage, exercise or stretching techniques'],
  ['such as cupping or massage', 'such as massage'],
  ['<li>Cupping</li>', ''],
  // pages.json services intro
  ['hijama cupping therapy, cerebral palsy', 'cerebral palsy'],
  ['dry needling, cupping and advanced electrotherapy', 'dry needling and advanced electrotherapy'],
  // tag leftover safety
  ['Cupping / Hijama', 'Manual Therapy'],
  // Generic fallbacks (last): guarantee zero leftovers in DB text we cannot inspect
  ['hijama cupping therapy', ''],
  ['hijama cupping', ''],
  ['hijama', ''],
  ['Cupping therapy', ''],
  ['cupping therapy', ''],
  ['Cupping', ''],
  ['cupping', '']
];

const tidy = (s) => s
  .replace(/,\s*,/g, ',')
  .replace(/,\s*\./g, '.')
  .replace(/ {2,}/g, ' ');

const applySwaps = (text) => tidy(TEXT_SWAPS.reduce((acc, [from, to]) => acc.split(from).join(to), text));

// Deep transform: string swaps + drop FAQ "Question" entries whose TITLE asks about
// cupping/hijama (Questions that merely mention it in the answer are kept and cleaned).
function walk(value) {
  if (typeof value === 'string') return applySwaps(value);
  if (Array.isArray(value)) {
    return value
      .filter((el) => !(el && typeof el === 'object' && el['@type'] === 'Question' && /cupping|hijama/i.test(String(el.name || ''))))
      .map(walk);
  }
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

// Entries to drop entirely
const FILTERS = {
  'blogs.json': (list) => list.filter((b) => !CUPPING_BLOG_SLUGS.includes(b.slug)),
  'seo.json': (list) => list.filter((s) => !/cupping|hijama/i.test(s.path || '')),
  'media.json': (list) => list.filter((m) => !/cupping|hijama/i.test(JSON.stringify(m)))
};

function updateSeedFiles() {
  let changed = 0;
  for (const file of JSON_FILES) {
    const p = path.join(seedDir, file);
    if (!fs.existsSync(p)) continue;
    const before = fs.readFileSync(p, 'utf8');
    let data = JSON.parse(before);
    if (FILTERS[file]) data = FILTERS[file](data);
    const out = JSON.stringify(walk(data), null, 2) + '\n';
    if (out !== before) {
      fs.writeFileSync(p, out, 'utf8');
      changed++;
    }
  }
  console.log(`Seed data updated: ${changed} JSON file(s) rewritten.`);

  // Verify no cupping/hijama references remain in seed data
  console.log('\nSeed-data verification (leftover references):');
  let clean = true;
  for (const file of JSON_FILES) {
    const p = path.join(seedDir, file);
    if (!fs.existsSync(p)) continue;
    const count = (fs.readFileSync(p, 'utf8').match(/cupping|hijama/gi) || []).length;
    if (count > 0) clean = false;
    console.log(`  ${file}: ${count}`);
  }
  console.log(clean ? 'Seed data is CLEAN.' : 'Seed data needs attention (see non-zero counts above).');
}

/* ── Part 2: Live MySQL database ────────────────────────────────────────── */
const chain = (col) => TEXT_SWAPS.reduce(
  (expr, [f, t]) => `REPLACE(${expr}, ${mysql.escape(f)}, ${mysql.escape(t)})`,
  col
);

const STATEMENTS = [
  // Cupping blog article + SEO + media removal
  `DELETE FROM blogs WHERE slug IN (${CUPPING_BLOG_SLUGS.map((s) => mysql.escape(s)).join(', ')})`,
  `DELETE FROM seo_metadata WHERE path LIKE '%cupping%' OR path LIKE '%hijama%'`,
  `DELETE FROM media WHERE original_path LIKE '%cupping%' OR original_path LIKE '%hijama%' OR local_url LIKE '%cupping%' OR local_url LIKE '%hijama%' OR alt_text LIKE '%cupping%' OR alt_text LIKE '%hijama%'`,
  // Content text swaps
  `UPDATE pages SET content_html = ${chain('content_html')}, subtitle = ${chain('subtitle')}`,
  `UPDATE services SET name = ${chain('name')}, short_description = ${chain('short_description')}, full_description_html = ${chain('full_description_html')}`,
  `UPDATE treatments SET name = ${chain('name')}, summary = ${chain('summary')}, symptoms_html = ${chain('symptoms_html')}, causes_html = ${chain('causes_html')}, treatment_html = ${chain('treatment_html')}`,
  `UPDATE doctors SET name = ${chain('name')}, designation = ${chain('designation')}, qualification = ${chain('qualification')}, bio_html = ${chain('bio_html')}`,
  `UPDATE blogs SET excerpt = ${chain('excerpt')}, content_html = ${chain('content_html')}`,
  `UPDATE testimonials SET testimonial_text = ${chain('testimonial_text')}`,
  `UPDATE site_settings SET setting_value = ${chain('setting_value')}`,
  `UPDATE navigation_items SET title = ${chain('title')}`,
  `UPDATE seo_metadata SET meta_title = ${chain('meta_title')}, meta_description = ${chain('meta_description')}, meta_keywords = ${chain('meta_keywords')}, og_title = ${chain('og_title')}, og_description = ${chain('og_description')}`
];

// structured_data_json is double-encoded (JSON array containing a JSON string),
// so REPLACE alone is unsafe — clean it in JS instead.
async function cleanStructuredData(conn) {
  const [rows] = await conn.query(
    "SELECT id, structured_data_json FROM seo_metadata WHERE structured_data_json LIKE '%cupping%' OR structured_data_json LIKE '%hijama%'"
  );
  let cleaned = 0;
  for (const row of rows) {
    let data;
    try {
      data = JSON.parse(row.structured_data_json);
    } catch {
      await conn.query('UPDATE seo_metadata SET structured_data_json = ? WHERE id = ?', [applySwaps(row.structured_data_json), row.id]);
      cleaned++;
      continue;
    }
    const out = Array.isArray(data)
      ? data.map((item) => {
          if (typeof item === 'string') {
            try { return JSON.stringify(walk(JSON.parse(item))); } catch { return applySwaps(item); }
          }
          return walk(item);
        })
      : walk(data);
    await conn.query('UPDATE seo_metadata SET structured_data_json = ? WHERE id = ?', [JSON.stringify(out), row.id]);
    cleaned++;
  }
  console.log(`structured_data_json cleaned for ${cleaned} SEO row(s).`);
}

const CHECKS = [
  "SELECT (SELECT COUNT(*) FROM blogs WHERE slug LIKE '%cupping%' OR content_html LIKE '%cupping%' OR content_html LIKE '%hijama%') AS cupping_blogs",
  "SELECT (SELECT COUNT(*) FROM treatments WHERE name LIKE '%cupping%' OR summary LIKE '%cupping%' OR symptoms_html LIKE '%cupping%' OR causes_html LIKE '%cupping%' OR treatment_html LIKE '%cupping%' OR name LIKE '%hijama%' OR summary LIKE '%hijama%' OR symptoms_html LIKE '%hijama%' OR causes_html LIKE '%hijama%' OR treatment_html LIKE '%hijama%') AS cupping_treatments",
  "SELECT (SELECT COUNT(*) FROM doctors WHERE bio_html LIKE '%cupping%' OR bio_html LIKE '%hijama%') AS cupping_doctors",
  "SELECT (SELECT COUNT(*) FROM pages WHERE content_html LIKE '%cupping%' OR content_html LIKE '%hijama%') AS cupping_pages",
  "SELECT (SELECT COUNT(*) FROM seo_metadata WHERE path LIKE '%cupping%' OR structured_data_json LIKE '%cupping%' OR structured_data_json LIKE '%hijama%' OR meta_description LIKE '%cupping%' OR meta_description LIKE '%hijama%' OR meta_title LIKE '%cupping%') AS cupping_seo",
  "SELECT (SELECT COUNT(*) FROM media WHERE alt_text LIKE '%cupping%' OR alt_text LIKE '%hijama%') AS cupping_media"
];

(async () => {
  updateSeedFiles();

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: false
    });
  } catch (err) {
    console.warn(`\nMySQL unreachable (${err.code || err.message}) — DB part skipped. JSON seed data is live; re-run this script when the DB is back.`);
    process.exit(0);
  }

  try {
    let applied = 0;
    for (const sql of STATEMENTS) {
      const [res] = await conn.query(sql);
      applied += res.affectedRows || 0;
    }
    console.log(`\nDB statements applied — ${applied} row(s) affected.`);

    await cleanStructuredData(conn);

    console.log('\nDB verification:');
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
