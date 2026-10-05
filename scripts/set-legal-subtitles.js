// Sets the "Last updated" subtitle on the two legal pages (used by the
// redesigned LegalTemplate header pill) in both the seed data and the
// production dump. Run: node scripts/set-legal-subtitles.js  (idempotent)
const fs = require('fs');

const PAGES = 'backend/database/seed-data/pages.json';
const DUMP = 'backend/database/production_dump.sql';
const SUBTITLE = 'Last updated: 5 October 2026';
const SLUGS = { 'privacy-policy': 6, 'terms-and-conditions': 7 };

// ── seed data ──────────────────────────────────────────────────────────────
const pages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
let changed = 0;
for (const p of pages) {
  if (p.slug in SLUGS && p.subtitle !== SUBTITLE) {
    p.subtitle = SUBTITLE;
    changed++;
  }
}
fs.writeFileSync(PAGES, JSON.stringify(pages, null, 2) + '\n');
console.log(changed ? `✓ pages.json: subtitle set on ${changed} legal page(s)` : '✓ pages.json: subtitles already set');

// ── production dump ─────────────────────────────────────────────────────────
// Row shape: VALUES (<id>, '<slug>', '/<slug>.html', '<title>', '<subtitle>', '<content>', …)
// The subtitle is currently empty, so match the empty 5th value exactly.
let lines = fs.readFileSync(DUMP, 'utf8').split('\n');
let dumpChanged = 0;
for (let i = 0; i < lines.length; i++) {
  if (!/^INSERT INTO `pages`/.test(lines[i])) continue;
  for (const [slug, id] of Object.entries(SLUGS)) {
    const re = new RegExp(`(VALUES \\(${id}, '${slug}', '/${slug}\\.html', '[^']*', )''`);
    if (re.test(lines[i])) {
      lines[i] = lines[i].replace(re, `$1'${SUBTITLE}'`);
      dumpChanged++;
    }
  }
}
fs.writeFileSync(DUMP, lines.join('\n'));
console.log(dumpChanged ? `✓ production_dump.sql: subtitle patched on ${dumpChanged} row(s)` : '✓ production_dump.sql: subtitles already set');

// Verify both stores actually carry the subtitle now
const checkPages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
for (const slug of Object.keys(SLUGS)) {
  const p = checkPages.find(x => x.slug === slug);
  if (!p || p.subtitle !== SUBTITLE) throw new Error(`subtitle not set for ${slug}`);
}
const dump = fs.readFileSync(DUMP, 'utf8');
for (const [slug, id] of Object.entries(SLUGS)) {
  const re = new RegExp(`VALUES \\(${id}, '${slug}', '/${slug}\\.html', '[^']*', '${SUBTITLE}'`);
  if (!re.test(dump)) throw new Error(`dump subtitle not set for ${slug}`);
}
console.log('✓ verified: subtitles present in both seed data and dump');
