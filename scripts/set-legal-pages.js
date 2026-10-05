// Sets the legal pages (Privacy Policy, Terms & Conditions) content everywhere it lives:
//   1. backend/database/seed-data/pages.json   (DB seed + JSON fallback used when MySQL is unreachable)
//   2. backend/database/production_dump.sql    (pages INSERT rows 6 & 7)
//   3. backend/database/seed-data/seo.json     (fixes canonical/description/og_url that migration pointed at back-pain.html)
//   4. backend/database/production_dump.sql    (seo_metadata INSERT rows 6 & 7)
//
// Run: node scripts/set-legal-pages.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_JSON = path.join(ROOT, 'backend/database/seed-data/pages.json');
const SEO_JSON = path.join(ROOT, 'backend/database/seed-data/seo.json');
const DUMP_SQL = path.join(ROOT, 'backend/database/production_dump.sql');

const LAST_UPDATED = '5 October 2026';
const CLINIC = 'KR Physiotherapy & Rehabilitation Clinic';
const ADDRESS = 'Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51, Noida, Uttar Pradesh 201304';
const EMAIL = 'info@krphysiotherapy.com';
const PHONE_LINK = '<a href="tel:+917668527335">+91 76685 27335</a>';
const PHONE_LINK_2 = '<a href="tel:+918595321652">+91 85953 21652</a>';
const SITE = 'https://www.krphysiotherapy.com';

// ─────────────────────────────────────────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────────────────────────────────────────
const PRIVACY_HTML = `
<p><strong>Last updated: ${LAST_UPDATED}.</strong> This Privacy Policy explains how ${CLINIC} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, &ldquo;the Clinic&rdquo;) collects, uses, discloses and protects your personal information when you visit ${SITE}, book an appointment, call or message us, or receive treatment at the clinic or at your home.</p>
<p>We are committed to handling your personal data responsibly and in accordance with applicable Indian law, including the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;), and professional confidentiality obligations that apply to healthcare providers.</p>

<h2>1. Information We Collect</h2>
<ul>
  <li><strong>Identity and contact details</strong> &mdash; your name, phone number, email address and residential address, when you book an appointment, submit an enquiry form, or contact us by phone, WhatsApp or email.</li>
  <li><strong>Appointment details</strong> &mdash; the service you request, your preferred date and time, and any notes you choose to share about your condition.</li>
  <li><strong>Health information</strong> &mdash; symptoms, medical history, previous treatments, prescriptions, investigation reports and other clinical information that you or your referring doctor provide to us for assessment and treatment.</li>
  <li><strong>Payment information</strong> &mdash; records of fees charged and payments received. We do not store your card or banking credentials.</li>
  <li><strong>Technical information</strong> &mdash; IP address, browser and device type, pages visited and referring website, collected through server logs and analytics when you browse our website.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
  <li>To schedule, confirm, remind and manage your appointments (including by phone, SMS, WhatsApp or email).</li>
  <li>To assess your condition, provide physiotherapy treatment and maintain clinical records.</li>
  <li>To respond to your enquiries and provide information about our services.</li>
  <li>To process fees and maintain basic accounts and billing records.</li>
  <li>To improve our website, services and patient experience.</li>
  <li>To comply with legal, regulatory and professional obligations applicable to a healthcare practice.</li>
  <li>Only with your consent &mdash; to send you occasional health tips, clinic updates or offers. You can opt out at any time.</li>
</ul>
<p>We do not use your personal data for any purpose that is incompatible with the purposes set out above without informing you.</p>

<h2>3. Health and Sensitive Personal Data</h2>
<p>Information about your health is treated as sensitive personal data. We handle it with a higher standard of care, limit access to the physiotherapist and staff directly involved in your care or the administration of your appointments, and never sell it or use it for unrelated commercial purposes. We disclose health information only:</p>
<ul>
  <li>to the treating physiotherapist and clinic staff involved in your care;</li>
  <li>to a referring or receiving doctor, where you ask us to share it or it is necessary for your treatment;</li>
  <li>with your consent;</li>
  <li>where disclosure is required by law, court order, or a competent regulatory authority.</li>
</ul>

<h2>4. Consent and Legal Basis</h2>
<p>Where we process your personal data based on consent (for example, when you submit an appointment form or share health information), that consent is freely given, specific and informed, and you may withdraw it at any time by contacting us. Withdrawing consent may mean we are unable to continue providing treatment or related services. We may also process limited personal data where necessary to comply with a legal obligation, or to establish, exercise or defend a legal claim.</p>

<h2>5. Sharing and Disclosure</h2>
<p>We do not sell, rent or trade your personal information. We share it only with:</p>
<ul>
  <li><strong>Service providers</strong> that help us operate &mdash; for example website hosting, appointment and communication tools (such as WhatsApp), mapping and analytics services &mdash; under confidentiality obligations and only to the extent needed to perform their function.</li>
  <li><strong>Treating clinicians</strong>, as described above.</li>
  <li><strong>Authorities</strong>, where disclosure is required by law or to protect the safety, rights or property of our patients, staff or the public.</li>
</ul>

<h2>6. Data Retention</h2>
<p>We keep your personal data only as long as necessary for the purposes described in this policy and for the retention of clinical records required under applicable healthcare regulations. Records that are no longer required are securely deleted or de-identified.</p>

<h2>7. Data Security</h2>
<p>We apply reasonable technical and organisational safeguards appropriate to a clinical practice &mdash; including restricted access to records and encrypted transport for data submitted through our website. No method of storage or transmission is completely secure, and we cannot guarantee absolute security, but we take the protection of your data seriously and review our practices regularly.</p>

<h2>8. Cookies and Analytics</h2>
<p>Our website uses essential cookies and basic analytics to understand how visitors use the site and to improve it. You can control or delete cookies through your browser settings; doing so may affect some website functionality.</p>

<h2>9. Third-Party Links and Embeds</h2>
<p>Our website may embed or link to third-party services such as Google Maps, WhatsApp, and our social media pages (Facebook, Instagram, LinkedIn). These services are governed by their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party websites.</p>

<h2>10. Children&rsquo;s Privacy</h2>
<p>We provide physiotherapy to children only with the knowledge and consent of a parent or legal guardian, who should accompany minor patients and provide the information we need for treatment. We do not knowingly collect personal data directly from children without such parental involvement.</p>

<h2>11. Your Rights</h2>
<p>Subject to applicable law, you have the right to:</p>
<ul>
  <li>access the personal data we hold about you and know how it is processed;</li>
  <li>request correction, completion or updating of inaccurate or incomplete data;</li>
  <li>request erasure of your data where retention is no longer legally required;</li>
  <li>withdraw consent for optional processing (such as marketing messages);</li>
  <li>raise a grievance about how your data has been handled.</li>
</ul>
<p>To exercise any of these rights, contact our Grievance Officer using the details below. We will respond within a reasonable period, normally within 30 days.</p>

<h2>12. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The &ldquo;Last updated&rdquo; date at the top of this page shows the current version. Material changes will be highlighted on our website.</p>

<h2>13. Contact Us / Grievance Officer</h2>
<p>For any questions, requests or grievances regarding this Privacy Policy or your personal data, please contact:</p>
<ul>
  <li><strong>Grievance Officer:</strong> Dr. Neelam Sharma (PT), ${CLINIC}</li>
  <li><strong>Address:</strong> ${ADDRESS}</li>
  <li><strong>Phone:</strong> ${PHONE_LINK}, ${PHONE_LINK_2}</li>
  <li><strong>Email:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
  <li><strong>Clinic hours:</strong> Monday to Sunday, 8:30 AM &ndash; 8:30 PM</li>
</ul>
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Terms and Conditions
// ─────────────────────────────────────────────────────────────────────────────
const TERMS_HTML = `
<p><strong>Last updated: ${LAST_UPDATED}.</strong> These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the website ${SITE} and your engagement of the physiotherapy services of ${CLINIC} (&ldquo;the Clinic&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using this website, booking an appointment, or receiving treatment from the Clinic, you agree to these Terms. If you do not agree, please do not use the website or the services.</p>

<h2>1. About the Website and Services</h2>
<p>The website provides information about the Clinic, its physiotherapy services and treatment options, and allows you to request appointments. The Clinic provides physiotherapy assessment, treatment and rehabilitation at its clinic in Sector 51, Noida, and as home visits in serviceable areas of Noida, delivered by qualified physiotherapists.</p>

<h2>2. Medical Disclaimer &mdash; Not for Emergencies</h2>
<p>Content on this website is for general information only and does not constitute medical advice, diagnosis or a treatment plan for any individual. It is not a substitute for an in-person consultation with a qualified physiotherapist or doctor.</p>
<p><strong>This website and our phone lines are not emergency services. In a medical emergency, or if you experience severe pain, sudden weakness, numbness, chest pain, breathlessness, loss of bladder or bowel control, or symptoms after an injury, immediately call 112 or your nearest emergency number, or go to the nearest hospital emergency department.</strong></p>

<h2>3. Appointments</h2>
<ul>
  <li>Appointment requests submitted through the website, by phone or WhatsApp are <strong>requests</strong> and become confirmed only when the Clinic confirms the date and time.</li>
  <li>Appointments are subject to availability. We try to run on schedule, but treatment durations can vary and waits can occur.</li>
  <li>Please arrive on time and inform us in advance if you expect to be late, so we can adjust or reschedule your slot.</li>
</ul>

<h2>4. Cancellations, Rescheduling and No-Shows</h2>
<p>If you need to cancel or reschedule, please give us at least <strong>24 hours&rsquo; notice</strong> by phone or WhatsApp, so the slot can be offered to another patient. Repeated missed appointments without notice may require reconfirmation before future bookings.</p>

<h2>5. Fees, Payments and Home Visits</h2>
<ul>
  <li>Fees for consultation, treatment sessions and packages are as quoted at the time of booking or as displayed at the Clinic, and are payable at the Clinic unless otherwise agreed.</li>
  <li>Home visits are subject to therapist availability and serviceable locations, and may attract an additional visit charge that will be communicated at the time of booking.</li>
  <li>For home visits, the patient or a responsible adult must be present, and safe, workable access to the treatment area must be ensured.</li>
  <li>Applicable taxes are included or added as per prevailing law.</li>
</ul>

<h2>6. Patient Responsibilities</h2>
<ul>
  <li>Provide accurate, complete and current information about your health, medications, allergies, prior surgeries and other treatments.</li>
  <li>Inform your physiotherapist promptly about any change in your condition, new symptoms, or medical advice received from other practitioners.</li>
  <li>Follow the prescribed treatment plan and home exercise programme, and attend scheduled sessions, as outcomes depend significantly on adherence.</li>
  <li>Treat Clinic staff with courtesy. The Clinic may decline or discontinue services in case of abusive, unsafe or non-cooperative conduct.</li>
</ul>

<h2>7. No Guarantee of Clinical Outcomes</h2>
<p>Physiotherapy outcomes vary from person to person and depend on the condition, its duration, overall health and adherence to the programme. While we follow evidence-based practice and give our professional best, the Clinic does not guarantee any particular result, recovery timeline or cure.</p>

<h2>8. Intellectual Property</h2>
<p>All content on this website &mdash; including text, graphics, logos, images and design &mdash; is owned by or licensed to the Clinic and protected by applicable intellectual property laws. You may not reproduce, republish or distribute website content without our prior written consent. Content is provided for your personal, non-commercial information.</p>

<h2>9. Third-Party Links</h2>
<p>The website may contain links to third-party websites or services (such as maps or social media). We do not control and are not responsible for their content, policies or availability.</p>

<h2>10. Communication Consent</h2>
<p>When you share your contact details with us, you consent to being contacted by phone, SMS, WhatsApp or email about your appointments, treatment and Clinic services. You may withdraw this consent for non-essential communications at any time by contacting us.</p>

<h2>11. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, the Clinic is not liable for indirect, incidental or consequential losses arising from use of the website, or from delays or interruptions in online booking or communication channels. Nothing in these Terms limits liability that cannot lawfully be limited, including liability arising from professional negligence in the delivery of healthcare services.</p>

<h2>12. Changes to These Terms</h2>
<p>We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top of this page shows the current version, and continued use of the website or the services after changes take effect constitutes acceptance of the revised Terms.</p>

<h2>13. Governing Law and Jurisdiction</h2>
<p>These Terms are governed by the laws of India. Subject to applicable law, any dispute arising in connection with these Terms or the services shall be subject to the exclusive jurisdiction of the courts at Gautam Buddha Nagar (Noida), Uttar Pradesh.</p>

<h2>14. Contact Us</h2>
<ul>
  <li><strong>${CLINIC}</strong></li>
  <li><strong>Address:</strong> ${ADDRESS}</li>
  <li><strong>Phone:</strong> ${PHONE_LINK}, ${PHONE_LINK_2}</li>
  <li><strong>Email:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
  <li><strong>Clinic hours:</strong> Monday to Sunday, 8:30 AM &ndash; 8:30 PM</li>
</ul>
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Apply to data files
// ─────────────────────────────────────────────────────────────────────────────
function updatePagesJson() {
  const pages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));
  const byId = { 6: { html: PRIVACY_HTML, title: 'Privacy Policy' }, 7: { html: TERMS_HTML, title: 'Terms and Conditions' } };
  for (const p of pages) {
    const upd = byId[p.id];
    if (upd) {
      p.content_html = upd.html;
      p.title = upd.title;
      p.template = 'legal';
      p.status = 'published';
    }
  }
  fs.writeFileSync(PAGES_JSON, JSON.stringify(pages, null, 2) + '\n');
  console.log('✓ pages.json: privacy-policy + terms-and-conditions content set');
}

const SEO_DESCRIPTIONS = {
  6: 'How KR Physiotherapy & Rehabilitation Clinic, Noida collects, uses and protects your personal and health information under Indian data protection law.',
  7: 'Terms and Conditions for using the KR Physiotherapy & Rehabilitation Clinic website and for booking physiotherapy appointments and home visits in Noida.'
};

function updateSeoJson() {
  const seo = JSON.parse(fs.readFileSync(SEO_JSON, 'utf8'));
  const targets = {
    '/privacy-policy.html': { canonical: `${SITE}/privacy-policy`, id: 6 },
    '/terms-and-conditions.html': { canonical: `${SITE}/terms-and-conditions`, id: 7 }
  };
  let touched = 0;
  for (const entry of seo) {
    const t = targets[entry.path];
    if (t) {
      entry.description = SEO_DESCRIPTIONS[t.id];
      entry.canonical = t.canonical;
      entry.ogUrl = t.canonical;
      touched++;
    }
  }
  if (touched !== 2) throw new Error(`Expected 2 seo entries to patch, touched ${touched}`);
  fs.writeFileSync(SEO_JSON, JSON.stringify(seo, null, 2) + '\n');
  console.log('✓ seo.json: legal page descriptions + canonical/og URLs fixed');
}

// MySQL dump escaping for single-quoted string literals
function sqlLiteral(s) {
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
}

function updateDump() {
  const lines = fs.readFileSync(DUMP_SQL, 'utf8').split('\n');
  let pagesFixed = 0;
  let seoFixed = 0;

  const newPages = {
    6: { slug: 'privacy-policy', path: '/privacy-policy.html', title: 'Privacy Policy', html: PRIVACY_HTML },
    7: { slug: 'terms-and-conditions', path: '/terms-and-conditions.html', title: 'Terms and Conditions', html: TERMS_HTML }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // pages rows 6 & 7 — rebuild the INSERT from the new content
    const m = line.match(/^INSERT INTO `pages` .*VALUES \(6, 'privacy-policy'/);
    const m7 = line.match(/^INSERT INTO `pages` .*VALUES \(7, 'terms-and-conditions'/);
    if (m || m7) {
      const id = m ? 6 : 7;
      const p = newPages[id];
      lines[i] = `INSERT INTO \`pages\` (\`id\`, \`slug\`, \`path\`, \`title\`, \`subtitle\`, \`content_html\`, \`template\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${id}, '${p.slug}', '${p.path}', '${p.title}', '', ${sqlLiteral(p.html)}, 'legal', 'published', '2026-09-12 11:45:44', '2026-09-12 11:45:44');`;
      pagesFixed++;
      continue;
    }

    // seo_metadata rows 6 & 7 — fix description, canonical_url and og_url in place
    if (/VALUES \(6, 'page', 6, '\/privacy-policy\.html'/.test(line) || /VALUES \(7, 'page', 7, '\/terms-and-conditions\.html'/.test(line)) {
      const id = line.includes("'/privacy-policy.html'") ? 6 : 7;
      const slug = id === 6 ? 'privacy-policy' : 'terms-and-conditions';
      let updated = line
        .replace("'Back Pain Physiotherapist - Best Back Pain and lower back pain Physiotherapy doctors in Noida and nearby area. Book an appointment online or call now.'", sqlLiteral(SEO_DESCRIPTIONS[id]))
        .replace(/, 'back-pain\.html', 'INDEX,FOLLOW'/, `, '${SITE}/${slug}', 'INDEX,FOLLOW'`)
        .replace(/, 'https:\/\/www\.krphysiotherapy\.com\/chronic-pain-physiotherapy\.html',/, `, '${SITE}/${slug}',`);
      if (updated === line) throw new Error(`seo_metadata row ${id}: expected fields not found — dump format may have changed`);
      lines[i] = updated;
      seoFixed++;
    }
  }

  if (pagesFixed !== 2) throw new Error(`Expected to patch 2 pages rows, patched ${pagesFixed}`);
  if (seoFixed !== 2) throw new Error(`Expected to patch 2 seo_metadata rows, patched ${seoFixed}`);
  fs.writeFileSync(DUMP_SQL, lines.join('\n'));
  console.log('✓ production_dump.sql: pages rows 6/7 + seo_metadata rows 6/7 updated');
}

updatePagesJson();
updateSeoJson();
updateDump();
console.log('Legal pages content applied successfully.');
