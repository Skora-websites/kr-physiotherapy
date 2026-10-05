// Unit-tests the legal content parser against the real page HTML.
// Transpiles the ESM util to CJS with esbuild (already a project dependency)
// so the logic can be tested without a bundler/browser.
// Run: node scripts/test-legal-parser.js
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const tmp = path.join(ROOT, 'node_modules/.cache/legal-content-test.cjs');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
esbuild.buildSync({
  entryPoints: [path.join(ROOT, 'frontend/src/utils/legalContent.js')],
  bundle: true,
  format: 'cjs',
  outfile: tmp
});
const { parseLegalSections, isAlertSection } = require(tmp);

const pages = require(path.join(ROOT, 'backend/database/seed-data/pages.json'));
let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

for (const slug of ['privacy-policy', 'terms-and-conditions']) {
  const page = pages.find(p => p.slug === slug);
  const { intro, sections } = parseLegalSections(page.content_html);
  console.log(`\n== ${slug} ==`);
  console.log(`intro chars: ${intro.length} | sections: ${sections.length}`);
  sections.forEach(s => console.log(`  ${s.number}. ${s.title}  [id=${s.id}] body=${s.body.length}`));

  check('intro captured', intro.length > 50);
  check('sections found', sections.length >= 10, `${sections.length} sections`);
  check('every section has an id', sections.every(s => /^section-\d$|^[a-z0-9-]+$/.test(s.id)));
  check('ids are unique', new Set(sections.map(s => s.id)).size === sections.length);
  check('every section has a body', sections.every(s => s.body.replace(/<[^>]+>/g, '').trim().length > 20));
  check('no raw html left in titles', sections.every(s => !/[<>]/.test(s.title)));
  check('no leftover entity codes in titles', sections.every(s => !/&[a-z]+;/i.test(s.title)));
  check('numbers are sequential', sections.every((s, i) => Number(s.number) === i + 1));
}

// The Terms "Medical Disclaimer" section must get the amber callout
const terms = pages.find(p => p.slug === 'terms-and-conditions');
const termsSections = parseLegalSections(terms.content_html).sections;
check('Medical Disclaimer detected as alert section', termsSections.some(s => isAlertSection(s.title)));
check('privacy sections are not alert sections', parseLegalSections(pages.find(p => p.slug === 'privacy-policy').content_html).sections.every(s => !isAlertSection(s.title)));

// Guard: empty/garbage input must not throw
check('empty html handled', parseLegalSections('').sections.length === 0);
check('html without h2 handled', parseLegalSections('<p>Just a paragraph</p>').sections.length === 0);

console.log(failures === 0 ? '\nALL PARSER TESTS PASSED' : `\n${failures} parser test(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
