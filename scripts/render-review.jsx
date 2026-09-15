/**
 * One-off review harness: renders redesigned templates to static HTML
 * with real seed data for spacing/copy review. (useEffect data fetches
 * don't run in renderToStaticMarkup, so list grids render empty — the
 * static structure is what we're verifying.)
 */
const fs = require('fs');
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');

const { HomeTemplate, AboutTemplate } = require('../frontend/src/templates/HomeAndAbout.jsx');
const { ContactTemplate, ServiceTemplate, TreatmentTemplate } = require('../frontend/src/templates/ClinicalTemplates.jsx');

const services = require('../backend/database/seed-data/services.json');
const treatments = require('../backend/database/seed-data/treatments.json');

const onBook = (name) => console.log(`  [onBook] ${name || '(general)'}`);

const aboutPage = {
  path: '/about.html',
  slug: 'about',
  title: 'About KR Physiotherapy & Rehabilitation Clinic',
  subtitle: "Noida Sector 51's trusted centre for non-surgical pain relief.",
  content_html: '<p>legacy content hidden on about</p>',
};

const pages = [
  ['home.html', React.createElement(HomeTemplate, { onBook })],
  ['about.html', React.createElement(AboutTemplate, { page: aboutPage, onBook })],
  ['contact.html', React.createElement(ContactTemplate, { onBook })],
  ['service-msk.html', React.createElement(ServiceTemplate, { service: services[0], onBook })],
  ['treatment-backpain.html', React.createElement(TreatmentTemplate, { treatment: treatments.find(t => t.slug === 'back-pain'), onBook })],
];

const outDir = 'tmp-review';
fs.mkdirSync(outDir, { recursive: true });

for (const [name, el] of pages) {
  try {
    const html = renderToStaticMarkup(el);
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>review:${name}</title></head><body>${html}</body></html>`;
    fs.writeFileSync(`${outDir}/${name}`, doc);
    console.log(`rendered ${name} (${(doc.length / 1024).toFixed(1)} kB)`);
  } catch (e) {
    console.error(`FAILED ${name}:`, e.message, '\n', e.stack.split('\n').slice(0, 6).join('\n'));
    process.exitCode = 1;
  }
}
