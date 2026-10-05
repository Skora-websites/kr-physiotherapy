// Renders the redesigned LegalTemplate with ReactDOMServer against the real
// page data and asserts the output markup. This verifies the component itself
// (not just the parser) without needing a browser.
// Run: node scripts/test-legal-render.js
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const cache = path.join(ROOT, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });

const entry = path.join(cache, 'legal-render-entry.jsx');
const templatePath = path.join(ROOT, 'frontend/src/templates/ClinicalTemplates').replace(/\\/g, '/');
fs.writeFileSync(entry, `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LegalTemplate } from '${templatePath}';
export function render(page) { return renderToString(<LegalTemplate page={page} />); }
export { LegalTemplate };
`);

const out = path.join(cache, 'legal-render-bundle.cjs');
esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  format: 'cjs',
  outfile: out,
  jsx: 'transform',
  loader: { '.jsx': 'jsx', '.js': 'jsx' },
  external: ['react', 'react-dom'],
  define: { 'process.env.NODE_ENV': '"production"' },
  absWorkingDir: ROOT
});

const { render } = require(out);
const React = require('react');
const { renderToString } = require('react-dom/server');
const pages = require(path.join(ROOT, 'backend/database/seed-data/pages.json'));

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

for (const slug of ['privacy-policy', 'terms-and-conditions']) {
  const page = pages.find(p => p.slug === slug);
  console.log(`\n== ${slug} ==`);
  let html;
  try {
    html = render(page);
  } catch (e) {
    check('component renders without throwing', false, e.message);
    continue;
  }
  check('component renders without throwing', true, `${html.length} chars`);

  check('table of contents present', html.includes('On this page'));
  check('last-updated pill present', /Last updated: 5 October 2026/.test(html));
  check('numbered section anchors present', /id="1-information-we-collect"|id="1-about-the-website-and-services"/.test(html));
  check('scroll offset for fixed navbar', html.includes('scroll-mt-28'));
  check('mobile TOC details block', html.includes('<details'));
  check('closing CTA present', html.includes('Need something clarified?'));
  check('CTA links to contact page', html.includes('href="/contact"'));
  check('contact phone in sidebar CTA', html.includes('tel:+917668527335'));
  check('no leftover raw top-bar markup', !html.includes('fa fa-clock-o') && !html.includes('top-text'));
  check('no unrendered h2 tags from raw html', !/<h2[^>]*>\s*\d+\./.test(html));

  // Section count and the privacy/terms specifics
  const anchors = html.match(/<section id="[a-z0-9-]+" class="scroll-mt-28[^"]*"/g) || [];
  console.log(`  section cards rendered: ${anchors.length}`);
  check('all sections rendered as cards', anchors.length >= 13, `${anchors.length} cards`);

  if (slug === 'terms-and-conditions') {
    check('medical disclaimer gets amber alert styling', /bg-amber-50\/70/.test(html));
    check('emergency wording visible', /112/.test(html));
  } else {
    check('no amber alert on privacy page', !/bg-amber-50\/70/.test(html));
  }
}

// Missing page still degrades gracefully
const { render: renderPage, LegalTemplate } = require(out);
const notFound = renderToString(React.createElement(LegalTemplate, { page: null }));
check('missing page shows not-found message', notFound.includes('Legal document not found.'));

console.log(failures === 0 ? '\nALL RENDER TESTS PASSED' : `\n${failures} render test(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
