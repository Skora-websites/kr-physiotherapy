// Final structural validation of the legal-page data updates.
// Run: node scripts/verify-legal-data.js
const fs = require('fs');

// 1. All touched data files must parse
for (const f of ['pages.json', 'seo.json', 'navigation.json']) {
  JSON.parse(fs.readFileSync(`backend/database/seed-data/${f}`, 'utf8'));
}
console.log('JSON: pages.json, seo.json, navigation.json all parse OK');

// 2. Dump rows: single-line, balanced single-quote literals (lexer-style scan:
//    skip escaped pairs like \' and \\, toggle literal state on bare quotes),
//    proper statement terminators. Covers the legal-page rows and the
//    generated Sector 51 landing-page rows.
const lines = fs.readFileSync('backend/database/production_dump.sql', 'utf8').split('\n');
let checked = 0;
for (const line of lines) {
  if (/^INSERT INTO `(pages|seo_metadata)`/.test(line) && /(privacy-policy|terms-and-conditions|physiotherapy-in-noida-sector-51)/.test(line)) {
    if (!line.endsWith("');")) throw new Error('Bad terminator: ' + line.slice(0, 60));
    let i = 0, inLiteral = false;
    while (i < line.length) {
      if (line[i] === '\\') { i += 2; continue; }
      if (line[i] === "'") inLiteral = !inLiteral;
      i++;
    }
    if (inLiteral) throw new Error('Unbalanced quotes in: ' + line.slice(0, 60));
    checked++;
  }
}
if (checked !== 6) throw new Error('Expected 6 dump rows (2 legal pages + 2 legal seo + Sector 51 page + Sector 51 seo), found ' + checked);
console.log(`SQL dump: ${checked} updated rows structurally valid (terminated, balanced quotes)`);

// 3. New content + clean canonicals actually present in the dump
const dump = lines.join('\n');
for (const probe of [
  'Digital Personal Data Protection Act, 2023',
  'Governing Law and Jurisdiction',
  'https://www.krphysiotherapy.com/privacy-policy',
  'https://www.krphysiotherapy.com/terms-and-conditions',
  'Physiotherapy in Noida Sector 51',
  'M.P.T (Neurology), MIAP'
]) {
  if (!dump.includes(probe)) throw new Error('Missing in dump: ' + probe);
}
console.log('SQL dump: legal + Sector 51 content and clean canonicals present');

// 4. Sector 51 page must resolve from the seed data with a location template
const pages = JSON.parse(fs.readFileSync('backend/database/seed-data/pages.json', 'utf8'));
const s51 = pages.find(p => p.slug === 'physiotherapy-in-noida-sector-51');
if (!s51) throw new Error('Sector 51 page missing from pages.json');
if (s51.template !== 'location' || s51.status !== 'published') throw new Error('Sector 51 page template/status wrong');
if (!/What We Treat at Sector 51/.test(s51.content_html)) throw new Error('Sector 51 content incomplete');
console.log('pages.json: Sector 51 location page present and published');
console.log('ALL FINAL DATA CHECKS PASSED');
