// Creates the "Physiotherapy in Noida Sector 51" landing page (the main clinic)
// and wires it everywhere the other sector pages live:
//   - backend/database/seed-data/pages.json    (new page id 13, template "location")
//   - backend/database/seed-data/seo.json     (new seo id 85, entity_type "location", entity_id 6)
//   - backend/database/production_dump.sql    (matching pages + seo_metadata rows)
//   - navigation seed + dump                  (Sector 51 footer entry now points at the page)
// Run: node scripts/add-sector51-page.js  (idempotent — safe to re-run)
const fs = require('fs');

const ROOT = process.cwd();
const PAGES = 'backend/database/seed-data/pages.json';
const SEO = 'backend/database/seed-data/seo.json';
const NAV = 'backend/database/seed-data/navigation.json';
const DUMP = 'backend/database/production_dump.sql';

const SLUG = 'physiotherapy-in-noida-sector-51';
const PATH = `/${SLUG}.html`;
const URL = `/${SLUG}`;
const SITE = 'https://www.krphysiotherapy.com';

const CONTENT_HTML = `
<h2>Our Main Clinic in Sector 51, Noida</h2>
<p>KR Physiotherapy &amp; Rehabilitation Clinic has treated patients from across Noida since 2013 from our main clinic at <strong>Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51, Noida</strong>. The clinic sits on the main Hosiyarpur road, minutes from Sector 50, 52 and 53, and is easy to reach from anywhere in the city.</p>
<p>Every patient is assessed properly before treatment begins. We diagnose the problem first, explain it in plain language, and then treat it with hands-on care backed by a structured exercise programme.</p>

<h2>What We Treat at Sector 51</h2>
<ul>
<li><strong>Musculoskeletal:</strong> back pain, knee pain, shoulder pain, neck pain, stiffness and recurring aches</li>
<li><strong>Sports injuries:</strong> ligament sprains, muscle strains, running injuries and post-match rehabilitation</li>
<li><strong>Post-operative rehabilitation:</strong> knee, hip, shoulder and spine recovery after surgery</li>
<li><strong>Neurological:</strong> stroke, paralysis, sciatica, Bell&rsquo;s palsy, cerebral palsy, Parkinson&rsquo;s disease and balance problems</li>
<li><strong>Geriatric care:</strong> mobility, balance and strength training for older adults</li>
<li><strong>Paediatric physiotherapy:</strong> developmental and posture-related concerns in children</li>
<li><strong>Women&rsquo;s health:</strong> prenatal, postnatal and pelvic floor physiotherapy</li>
</ul>

<h2>What to Expect at Your First Visit</h2>
<p>Your first session is a full assessment, not just a quick treatment. It usually includes:</p>
<ul>
<li>A conversation about your pain, injury history, medical conditions and current medication</li>
<li>A physical examination of movement, strength, posture and the joints or muscles involved</li>
<li>A clear explanation of what is causing your symptoms and what can realistically be achieved</li>
<li>A written treatment plan with the sessions we recommend and the home exercises you can start straight away</li>
</ul>
<p>Most patients need between six and twelve sessions depending on the condition, though severe or long-standing problems take longer. You will always know what the next step is before you leave.</p>

<h2>Treatment Available In-Clinic</h2>
<ul>
<li>Manual therapy and joint mobilisation</li>
<li>Electrotherapy including TENS, interferential therapy and therapeutic ultrasound</li>
<li>Structured exercise therapy and progressive strengthening</li>
<li>Posture correction, ergonomics and workstation advice</li>
<li>Gait and balance training</li>
<li>Kinesio taping and return-to-sport programming</li>
</ul>

<h2>Why Patients Choose Our Sector 51 Clinic</h2>
<ul>
<li><strong>Qualified care:</strong> sessions are led by Dr. Neelam Sharma (PT), B.P.T, M.P.T (Neurology), MIAP, with 15 years of clinical experience</li>
<li><strong>Open seven days:</strong> Monday to Sunday, 8:30 AM to 8:30 PM</li>
<li><strong>Easy access:</strong> on-site parking, ATM and bank facilities in the same building, and convenient Metro connectivity</li>
<li><strong>Walk-ins welcome:</strong> appointments are recommended, but you can be seen sooner if we have a slot free</li>
<li><strong>Home visits available:</strong> if you cannot travel, we bring the same treatment to your home in Noida</li>
</ul>

<h2>Physiotherapy at Home in Sector 51</h2>
<p>For patients recovering after surgery, elderly residents, or anyone who finds travelling difficult, we offer home physiotherapy across Noida. A therapist visits with the equipment needed for manual therapy, exercise coaching and mobility work, so treatment continues without a break.</p>

<h2>Book Your Appointment</h2>
<p>Call the clinic to book, or request a slot online. We will confirm your appointment by phone or WhatsApp.</p>
<ul>
<li><strong>Phone:</strong> <a href="tel:+917668527335">+91 76685 27335</a> &middot; <a href="tel:+918595321652">+91 85953 21652</a></li>
<li><strong>Address:</strong> Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51, Noida, Uttar Pradesh 201304</li>
<li><strong>Hours:</strong> Monday to Sunday, 8:30 AM &ndash; 8:30 PM</li>
<li><strong>Online booking:</strong> <a href="/contact">request an appointment through our contact page</a></li>
</ul>
`.trim();

function alreadyExists() {
  const pages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
  return pages.some(p => p.slug === SLUG);
}

if (alreadyExists()) {
  console.log(`Page "${SLUG}" already exists — nothing to do`);
  process.exit(0);
}

// ── 1. pages.json ──────────────────────────────────────────────────────────
const pages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
const pageId = Math.max(...pages.map(p => p.id)) + 1;
pages.push({
  id: pageId,
  slug: SLUG,
  path: PATH,
  title: 'Physiotherapy in Noida Sector 51',
  subtitle: 'Main clinic of KR Physiotherapy & Rehabilitation Clinic — expert physiotherapy and home care in Sector 51, Noida',
  content_html: CONTENT_HTML,
  template: 'location',
  status: 'published'
});
fs.writeFileSync(PAGES, JSON.stringify(pages, null, 2) + '\n');
console.log(`✓ pages.json: added page id ${pageId} (${SLUG})`);

// ── 2. seo.json (reuse the clinic LocalBusiness schema block) ──────────────
const seo = JSON.parse(fs.readFileSync(SEO, 'utf8'));
const donor = seo.find(e => e.path === '/physiotherapy-in-noida-sector-52.html');
const seoId = Math.max(...seo.map(e => e.id || 0)) + 1;
const usedEntityIds = new Set(seo.filter(e => e.entity_type === 'location').map(e => e.entity_id));
let entityId = 1;
while (usedEntityIds.has(entityId)) entityId++;
seo.push({
  path: PATH,
  title: 'Physiotherapy in Noida Sector 51 | Main Clinic - KR Physiotherapy',
  description: 'KR Physiotherapy is the main clinic in Sector 51, Noida. Book physiotherapy for back, knee, sports, neurological and post-operative problems, or book a home visit. Open 7 days, 8:30 AM - 8:30 PM.',
  keywords: 'physiotherapy in noida sector 51, physiotherapist in sector 51 noida, physiotherapy clinic sector 51 noida, best physiotherapy clinic in noida sector 51, home visit physiotherapy noida sector 51',
  robots: 'INDEX,FOLLOW',
  canonical: `${SITE}${URL}`,
  ogTitle: 'Physiotherapy in Noida Sector 51 | Main Clinic - KR Physiotherapy',
  ogDesc: 'Our main clinic in Sector 51, Noida: assessment, manual therapy, electrotherapy and structured rehab. Open 7 days, 8:30 AM - 8:30 PM.',
  ogUrl: `${SITE}${URL}`,
  ogImage: `${SITE}/images/clinic-gym.jpg`,
  structuredData: donor ? donor.structuredData : [],
  id: seoId,
  entity_type: 'location',
  entity_id: entityId
});
fs.writeFileSync(SEO, JSON.stringify(seo, null, 2) + '\n');
console.log(`✓ seo.json: added seo id ${seoId} (entity_id ${entityId})`);

// ── 3. navigation seed + dump: point the Sector 51 entry at the page ───────
const nav = JSON.parse(fs.readFileSync(NAV, 'utf8'));
const navItem = nav.find(n => n.title === 'Physiotherapy in Sector 51 (Main Clinic)');
if (navItem) {
  navItem.url = URL;
  fs.writeFileSync(NAV, JSON.stringify(nav, null, 2) + '\n');
  console.log(`✓ navigation.json: Sector 51 entry url → ${URL}`);
}

// ── 4. production_dump.sql: pages + seo_metadata rows, nav url ─────────────
function sqlLiteral(s) {
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
}
const lines = fs.readFileSync(DUMP, 'utf8').split('\n');
const ts = (lines.find(l => /^INSERT INTO `pages`/.test(l)) || '').match(/'(20\d\d-\d\d-\d\d [\d:]+)'\);\s*$/)[1];

const pageRow = `INSERT INTO \`pages\` (\`id\`, \`slug\`, \`path\`, \`title\`, \`subtitle\`, \`content_html\`, \`template\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${pageId}, '${SLUG}', '${PATH}', 'Physiotherapy in Noida Sector 51', 'Main clinic of KR Physiotherapy & Rehabilitation Clinic — expert physiotherapy and home care in Sector 51, Noida', ${sqlLiteral(CONTENT_HTML)}, 'location', 'published', '${ts}', '${ts}');`;
const seoEntry = seo.find(e => e.path === PATH);
const seoRow = `INSERT INTO \`seo_metadata\` (\`id\`, \`entity_type\`, \`entity_id\`, \`path\`, \`meta_title\`, \`meta_description\`, \`meta_keywords\`, \`canonical_url\`, \`robots\`, \`og_title\`, \`og_description\`, \`og_image\`, \`og_url\`, \`structured_data_json\`, \`created_at\`, \`updated_at\`) VALUES (${seoId}, 'location', ${entityId}, '${PATH}', ${sqlLiteral(seoEntry.title)}, ${sqlLiteral(seoEntry.description)}, ${sqlLiteral(seoEntry.keywords)}, '${SITE}${URL}', 'INDEX,FOLLOW', ${sqlLiteral(seoEntry.ogTitle)}, ${sqlLiteral(seoEntry.ogDesc)}, '${seoEntry.ogImage}', '${SITE}${URL}', ${sqlLiteral(JSON.stringify(seoEntry.structuredData))}, '${ts}', '${ts}');`;

const pagesIdx = lines.map((l, i) => (/^INSERT INTO `pages`/.test(l) ? i : -1)).filter(i => i >= 0).pop();
lines.splice(pagesIdx + 1, 0, pageRow);
const seoIdx = lines.map((l, i) => (/^INSERT INTO `seo_metadata`/.test(l) ? i : -1)).filter(i => i >= 0).pop();
lines.splice(seoIdx + 1, 0, seoRow);

for (let i = 0; i < lines.length; i++) {
  if (/^INSERT INTO `navigation_items`/.test(lines[i]) && lines[i].includes("'Physiotherapy in Sector 51 (Main Clinic)'")) {
    lines[i] = lines[i].replace("'/about'", `'${URL}'`);
  }
}
fs.writeFileSync(DUMP, lines.join('\n'));
console.log(`✓ production_dump.sql: added pages row ${pageId} + seo_metadata row ${seoId}, Sector 51 nav url → ${URL}`);
console.log('Sector 51 landing page created.');
