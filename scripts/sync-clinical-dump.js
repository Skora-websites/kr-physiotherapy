/**
 * One-off: regenerate the services + treatments INSERT rows (and the
 * services/treatments page rows) in production_dump.sql from the seed JSON files.
 */
const fs = require('fs');

const dumpPath = 'backend/database/production_dump.sql';
const dump = fs.readFileSync(dumpPath, 'utf8');
const eol = dump.includes('\r\n') ? '\r\n' : '\n';
const lines = dump.split(/\r?\n/);

const services = require('../backend/database/seed-data/services.json');
const treatments = require('../backend/database/seed-data/treatments.json');
const pages = require('../backend/database/seed-data/pages.json');

const TS = '2026-09-12 11:45:44';

// Escape a value for a single-quoted MySQL string literal (dump uses \\n newlines).
const esc = (v) =>
  String(v == null ? '' : v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

const serviceRows = services.map(
  (s) =>
    `INSERT INTO \`services\` (\`id\`, \`slug\`, \`name\`, \`short_description\`, \`full_description_html\`, \`icon\`, \`banner_image\`, \`sort_order\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${s.id}, '${esc(s.slug)}', '${esc(s.name)}', '${esc(s.short_description)}', '${esc(s.full_description_html)}', '${esc(s.icon)}', '${esc(s.banner_image)}', ${s.sort_order}, '${esc(s.status)}', '${TS}', '${TS}');`
);

const treatmentRows = treatments.map(
  (t) =>
    `INSERT INTO \`treatments\` (\`id\`, \`slug\`, \`name\`, \`category\`, \`summary\`, \`symptoms_html\`, \`causes_html\`, \`treatment_html\`, \`banner_image\`, \`sort_order\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${t.id}, '${esc(t.slug)}', '${esc(t.name)}', '${esc(t.category)}', '${esc(t.summary)}', '${esc(t.symptoms_html)}', '${esc(t.causes_html)}', '${esc(t.treatment_html)}', '${esc(t.banner_image)}', ${t.sort_order}, '${esc(t.status)}', '${TS}', '${TS}');`
);

// Only the two list pages we reformatted.
const listPageSlugs = ['services', 'treatments'];
const pageRows = pages
  .filter((p) => listPageSlugs.includes(p.slug))
  .map(
    (p) =>
      `INSERT INTO \`pages\` (\`id\`, \`slug\`, \`path\`, \`title\`, \`subtitle\`, \`content_html\`, \`template\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${p.id}, '${esc(p.slug)}', '${esc(p.path)}', '${esc(p.title)}', '${esc(p.subtitle)}', '${esc(p.content_html)}', '${esc(p.template)}', '${esc(p.status)}', '${TS}', '${TS}');`
  );

const out = [];
let sDone = false;
let tDone = false;
const pDone = new Set();

for (const line of lines) {
  if (/^INSERT INTO `services` /.test(line)) {
    if (!sDone) {
      out.push(...serviceRows);
      sDone = true;
    }
    continue;
  }
  if (/^INSERT INTO `treatments` /.test(line)) {
    if (!tDone) {
      out.push(...treatmentRows);
      tDone = true;
    }
    continue;
  }
  const pageMatch = line.match(/^INSERT INTO `pages` .* VALUES \(\d+, '([a-z0-9-]+)'/);
  if (pageMatch && listPageSlugs.includes(pageMatch[1])) {
    const slug = pageMatch[1];
    if (!pDone.has(slug)) {
      const row = pageRows.find((r) => r.includes(`'${esc(slug)}'`));
      if (row) {
        out.push(row);
        pDone.add(slug);
      }
    }
    continue;
  }
  out.push(line);
}

fs.writeFileSync(dumpPath, out.join(eol));

console.log('services rows replaced:', sDone, `(${serviceRows.length} rows)`);
console.log('treatments rows replaced:', tDone, `(${treatmentRows.length} rows)`);
console.log('page rows replaced:', [...pDone].join(', '), `(${pageRows.length} available)`);
