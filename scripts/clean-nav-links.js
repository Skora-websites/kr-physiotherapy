// One-off: switch internal .html links to clean extension-less URLs in
// Navbar.jsx and navigation.json (data comparisons elsewhere are handled
// manually). Run: node scripts/clean-nav-links.js
const fs = require('fs');

function stripHtmlLinks(file, patterns) {
  let s = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [re, rep] of patterns) {
    s = s.replace(re, (...args) => {
      count++;
      return rep(...args);
    });
  }
  fs.writeFileSync(file, s);
  console.log(`${file}: ${count} link(s) cleaned, remaining .html refs: ${(s.match(/\.html/g) || []).length}`);
}

// Navbar.jsx — double- and single-quoted internal hrefs (no data comparisons live here)
stripHtmlLinks('frontend/src/components/Navbar.jsx', [
  [/\"\/([a-z0-9-]+)\.html\"/g, (m, p1) => `\"/${p1}\"`],
  [/'\/([a-z0-9-]+)\.html'/g, (m, p1) => `'/${p1}'`]
]);

// navigation.json — menu URLs (index.htm entries are left untouched)
stripHtmlLinks('backend/database/seed-data/navigation.json', [
  [/\"\/([a-z0-9-]+)\.html\"/g, (m, p1) => `\"/${p1}\"`]
]);
