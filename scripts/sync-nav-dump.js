// Syncs production_dump.sql navigation_items with the cleaned seed data:
//   - all internal ".html" URLs → clean extension-less URLs
//   - adds the Sector 51 main-clinic footer entry (sort_order 1), renumbering sectors
// Run: node scripts/sync-nav-dump.js
const fs = require('fs');
const file = 'backend/database/production_dump.sql';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const SECTOR_51_TITLE = 'Physiotherapy in Sector 51 (Main Clinic)';
// Idempotency guard: renumbering/inserting again would shuffle Sector 51 down
// and duplicate its row, so bail out when the dump is already in sync.
if (lines.some(l => l.includes(`'${SECTOR_51_TITLE}'`)) && !lines.some(l => /^INSERT INTO `navigation_items`/.test(l) && /'(\/[a-z0-9-]+)\.html'/.test(l))) {
  console.log('production_dump.sql: navigation_items already in sync (Sector 51 present, URLs clean) — nothing to do');
  process.exit(0);
}

let cleaned = 0;
let renumbered = 0;
const renumberTargets = [];

// Pass 1: clean URLs on every navigation_items row; renumber footer_locations
for (let i = 0; i < lines.length; i++) {
  if (!/^INSERT INTO `navigation_items`/.test(lines[i])) continue;
  const before = lines[i];
  lines[i] = lines[i].replace(/'(\/[a-z0-9-]+)\.html'/g, (m, p1) => `'${p1}'`);
  if (lines[i] !== before) cleaned++;
  if (/'footer_locations'/.test(lines[i])) renumberTargets.push(i);
}

if (renumberTargets.length === 0) throw new Error('No footer_locations rows found in dump');
// Existing sectors get sort_order 2..n (main clinic takes 1)
renumberTargets.forEach((lineIdx, idx) => {
  const newOrder = idx + 2;
  lines[lineIdx] = lines[lineIdx].replace(
    /(VALUES \(\d+, 'footer_locations', NULL, '[^']*', '[^']*', )\d+/,
    `$1${newOrder}`
  );
  renumbered++;
});

// Pass 2: insert the main clinic row after the last navigation_items row
const navIdxs = lines.map((l, i) => (/^INSERT INTO `navigation_items`/.test(l) ? i : -1)).filter(i => i >= 0);
if (navIdxs.length === 0) throw new Error('No navigation_items rows in dump');
const maxId = Math.max(...navIdxs.map(i => parseInt(lines[i].match(/VALUES \((\d+),/)[1], 10)));
const ts = lines[navIdxs[0]].match(/'(20\d\d-\d\d-\d\d [\d:]+)'\);\s*$/)[1];
const newRow = `INSERT INTO \`navigation_items\` (\`id\`, \`menu_location\`, \`parent_id\`, \`title\`, \`url\`, \`sort_order\`, \`created_at\`) VALUES (${maxId + 1}, 'footer_locations', NULL, '${SECTOR_51_TITLE}', '/about', 1, '${ts}');`;
lines.splice(navIdxs[navIdxs.length - 1] + 1, 0, newRow);

fs.writeFileSync(file, lines.join('\n'));
console.log(`production_dump.sql: ${cleaned} navigation row(s) got clean URLs, ${renumbered} sector row(s) renumbered, added Sector 51 main clinic (id ${maxId + 1})`);
