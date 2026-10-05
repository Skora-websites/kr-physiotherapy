// Adds the main clinic (Sector 51) as the first footer_locations menu item
// and renumbers the remaining sector entries. Run: node scripts/add-sector51-nav.js
const fs = require('fs');
const file = 'backend/database/seed-data/navigation.json';
const nav = JSON.parse(fs.readFileSync(file, 'utf8'));

// Already present? keep idempotent
if (nav.some(n => n.title === 'Physiotherapy in Sector 51 (Main Clinic)')) {
  console.log('footer_locations: Sector 51 entry already present — nothing to do');
  process.exit(0);
}

const maxId = Math.max(...nav.map(n => n.id));
const locs = nav.filter(n => n.menu_location === 'footer_locations').sort((a, b) => a.sort_order - b.sort_order);
if (locs.length === 0) throw new Error('No footer_locations entries found');

// Shift existing sector entries down by one
locs.forEach((n, i) => { n.sort_order = i + 2; });

// Insert the main clinic first (links to the About page — the clinic's own page;
// no dedicated Sector 51 landing page exists)
nav.splice(nav.indexOf(locs[0]), 0, {
  id: maxId + 1,
  menu_location: 'footer_locations',
  parent_id: null,
  title: 'Physiotherapy in Sector 51 (Main Clinic)',
  url: '/about',
  sort_order: 1
});

fs.writeFileSync(file, JSON.stringify(nav, null, 2) + '\n');
console.log(`footer_locations: added "Physiotherapy in Sector 51 (Main Clinic)" (id ${maxId + 1}) as sort_order 1; renumbered ${locs.length} sector entries`);
