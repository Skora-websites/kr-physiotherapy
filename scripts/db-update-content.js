// Applies the cardio-content removal to the local MySQL database.
// Mirrors scripts/fix-dump-final.js transformations. Idempotent.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const SWAPS = [
  // services: cardioservice -> chronic pain
  [`UPDATE services SET slug='chronic-pain-physiotherapy', name='Chronic Pain Physiotherapy', icon='healing',
    short_description='Structured, non-surgical relief for long-standing pain — back, neck, joints and post-injury stiffness — combining advanced electrotherapy, manual therapy and graded exercise.',
    full_description_html='<p>Chronic pain physiotherapy helps patients who have lived with pain for months or years — long-standing back and neck pain, persistent joint pain, post-fracture stiffness and pain that has not responded to medication alone.</p><p><strong>How we help:</strong></p><ul><li>Thorough assessment to identify the true driver of your pain</li><li>Advanced electrotherapy and manual therapy to settle symptoms</li><li>Graded exercise programmes to rebuild strength and confidence</li><li>Posture, ergonomics and movement re-education</li><li>Relapse-prevention strategies for long-term self-management</li></ul><p>These protocols are safe, non-surgical and benefit patients of all ages — including those who have been told to simply live with their pain.</p>'
    WHERE slug='cardiorespiratory-physiotherapy'`],

  // pages
  [`UPDATE pages SET subtitle = REPLACE(subtitle, 'musculoskeletal, neurological, cardiorespiratory, sports, geriatric, paediatric, women’s health', 'musculoskeletal, neurological, sports, geriatric, paediatric, chronic pain, women’s health') WHERE path='/services.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'musculoskeletal, neurological, cardiorespiratory, sports, geriatric and paediatric physiotherapy, women’s health physiotherapy', 'musculoskeletal, neurological, sports, geriatric and paediatric physiotherapy, chronic pain rehabilitation, women’s health physiotherapy') WHERE path='/services.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'orthopaedic problems, cardiovascular and pulmonary issues, sports injuries', 'orthopaedic problems, chronic pain conditions, sports injuries') WHERE path='/about.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'arthritis, diabetes and heart disease, physiotherapy is a ray of hope', 'arthritis, diabetes and lifestyle-related pain conditions, physiotherapy is a ray of hope') WHERE path='/about.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, '<li><strong>Cardiopulmonary:</strong> This therapy is given to those who have suffered any disorders like chronic obstructive pulmonary disease and cardiac arrest. The main aim is to tell or educate patients about exercise and techniques.</li>', '<li><strong>Post-Surgical Rehabilitation:</strong> This therapy is given to patients recovering after an operation. The main aim is to restore strength, mobility and confidence through progressive, guided exercise.</li>') WHERE path='/physiotherapy-in-noida-sector-34.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, '<li>Prevent from chest complications</li>', '<li>Recover comfortably during and after pregnancy</li>') WHERE path='/physiotherapy-in-noida-sector-34.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'women’s health, neurological, respiratory conditions and many more', 'women’s health, neurological and orthopaedic conditions and many more') WHERE path='/physiotherapy-in-noida-sector-52.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'neurological, respiratory, cardiovascular, sexual, visual, vestibular function', 'neurological, muscular, skeletal, postural and vestibular function') WHERE path='/physiotherapy-in-noida-sector-52.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, '<li>Airway Clearance Techniques</li>', '') WHERE path='/physiotherapy-in-noida-sector-52.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, '<li>Breathing Techniques</li>', '') WHERE path='/physiotherapy-in-noida-sector-52.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, '<li>Integumentary repair and protection techniques</li>', '') WHERE path='/physiotherapy-in-noida-sector-52.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'medications for pain and breathing, however', 'medications for pain and mobility-related conditions, however') WHERE path='/physiotherapy-in-noida-sector-71.html'`],
  [`UPDATE pages SET content_html = REPLACE(content_html, 'following heart disease, strokes, or major surgery', 'following injuries, strokes, or major surgery') WHERE path='/physiotherapy-in-noida-sector-71.html'`],

  // navigation: remove the cardio item
  [`DELETE FROM navigation_items WHERE url='/cardiorespiratory-physiotherapy.html'`],

  // seo_metadata
  [`UPDATE seo_metadata SET meta_keywords = REPLACE(meta_keywords, 'Cardiac Physiotherapy Noida, Cardiorespiratory Physiotherapy, cardiac physiotherapy  ', '') WHERE meta_keywords LIKE '%Cardiorespiratory%'`],
  [`UPDATE seo_metadata SET og_title = REPLACE(og_title, 'Cardiac Physiotherapy Noida - Cardiorespiratory Physiotherapy', '') WHERE og_title LIKE '%Cardiorespiratory%'`],
  [`UPDATE seo_metadata SET og_description = REPLACE(og_description, 'Krphysiotherapy is an expert in cardiorespiratory physiotherapy in the prevention, compensation, and rehabilitation of diseases or injuries affecting the heart, chest, and lungs.', 'KR Physiotherapy is an expert in physiotherapy for the prevention, rehabilitation and recovery of orthopaedic, neurological and sports-related conditions.') WHERE og_description LIKE '%cardiorespiratory%'`],
  [`UPDATE seo_metadata SET meta_description = REPLACE(meta_description, 'Krphysiotherapy services: Cardiorespiratory Physiotherapy, Sports Physiotherapy,  Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Musculoskeletal Physiotherapy. you make a call: 7668527335, 9821611201.', 'KR Physiotherapy services: Musculoskeletal Physiotherapy, Sports Physiotherapy, Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Neurological Physiotherapy. you make a call: 7668527335, 9821611201.') WHERE meta_description LIKE '%Cardiorespiratory%'`],
  [`UPDATE seo_metadata SET meta_description = REPLACE(meta_description, 'Krphysiotherapy services: Cardiorespiratory Physiotherapy, Sports Physiotherapy,  Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Musculoskeletal Physiotherapy.', 'KR Physiotherapy services: Musculoskeletal Physiotherapy, Sports Physiotherapy, Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Neurological Physiotherapy.') WHERE og_description LIKE '%Cardiorespiratory Physiotherapy,%' AND meta_description LIKE '%Cardiorespiratory%'`],
  [`UPDATE seo_metadata SET og_description = REPLACE(og_description, 'Krphysiotherapy services: Cardiorespiratory Physiotherapy, Sports Physiotherapy,  Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Musculoskeletal Physiotherapy.', 'KR Physiotherapy services: Musculoskeletal Physiotherapy, Sports Physiotherapy, Geriatric Physiotherapy, Paediatric Physiotherapy, Physiotherapy For Women’s Health, Neurological Physiotherapy.') WHERE og_description LIKE '%Cardiorespiratory Physiotherapy,%'`],
  [`UPDATE seo_metadata SET path='/chronic-pain-physiotherapy.html', canonical_url='chronic-pain-physiotherapy.html',
    meta_title='Chronic Pain Physiotherapy Clinic in Noida - KR Physiotherapy',
    meta_description='Chronic Pain Physiotherapy in Noida - Structured, non-surgical relief for long-standing back, neck and joint pain. Book an appointment online or call now.',
    og_url='https://www.krphysiotherapy.com/chronic-pain-physiotherapy.html'
    WHERE path='/cardiorespiratory-physiotherapy.html'`],
  [`UPDATE seo_metadata SET og_url = REPLACE(og_url, 'http://www.krphysiotherapy.com/cardiorespiratory-physiotherapy.html', 'https://www.krphysiotherapy.com/chronic-pain-physiotherapy.html') WHERE og_url LIKE '%cardiorespiratory%'`],
  [`DELETE FROM seo_metadata WHERE path LIKE '%what-are-the-benefits-of-cardiorespiratory-physiotherapy%'`],
  [`UPDATE seo_metadata SET meta_description = REPLACE(meta_description, 'as similar as getting heal from heart trauma. The healing requires', 'as similar as recovering from a major illness. The healing requires') WHERE meta_description LIKE '%heart trauma%'`],
  [`UPDATE seo_metadata SET og_description = REPLACE(og_description, 'as similar as getting heal from heart trauma. The healing requires', 'as similar as recovering from a major illness. The healing requires') WHERE og_description LIKE '%heart trauma%'`],
  [`UPDATE seo_metadata SET structured_data_json = REPLACE(structured_data_json, 'as similar as getting heal from heart trauma. The healing requires', 'as similar as recovering from a major illness. The healing requires') WHERE structured_data_json LIKE '%heart trauma%'`],
  [`UPDATE seo_metadata SET structured_data_json = REPLACE(structured_data_json, 'breathing and relaxationtechniques', 'relaxation techniques') WHERE structured_data_json LIKE '%relaxationtechniques%'`],

  // blogs
  [`DELETE FROM blogs WHERE slug='what-are-the-benefits-of-cardiorespiratory-physiotherapy'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'chronic medical conditions like asthma, aid in healing injuries', 'chronic medical conditions like arthritis, aid in healing injuries') WHERE content_html LIKE '%like asthma%'`],
  [`UPDATE blogs SET excerpt = REPLACE(excerpt, 'getting heal from heart trauma', 'recovering from a major illness') WHERE excerpt LIKE '%heart trauma%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'getting heal from heart trauma', 'recovering from a major illness') WHERE content_html LIKE '%heart trauma%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'the acupuncture method, cardiothoracic, hand treatment', 'the acupuncture method, hand treatment') WHERE content_html LIKE '%cardiothoracic%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, '<li><strong>Cardio respiratory Therapy</strong></li>', '') WHERE content_html LIKE '%Cardio respiratory%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, '<li><strong>Cardiovascular And Pulmonary Physiotherapy</strong>: Patients suffering from improper mobility due to pulmonary disorders, post coronary bypass surgery, chronic obstructive pulmonary disease, cystic fibrosis, heart attacks and pulmonary fibrosis must appoint the therapist from this particular specialty area.</li>', '') WHERE content_html LIKE '%Cardiovascular And Pulmonary%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'high blood pressure, heart disease, stroke, diabetes', 'high blood pressure, diabetes') WHERE content_html LIKE '%heart disease, stroke%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'premenstrual syndrome, cardiovascular conditions, depression', 'premenstrual syndrome, chronic pain conditions, depression') WHERE content_html LIKE '%cardiovascular conditions%'`],
  [`UPDATE blogs SET content_html = REPLACE(content_html, 'breathing and relaxationtechniques', 'relaxation techniques') WHERE content_html LIKE '%relaxationtechniques%'`],
  [`UPDATE blogs SET featured_image = REPLACE(featured_image, 'cardio-respiratory.jpg', 'physiotherapy-at-home.jpg') WHERE featured_image LIKE '%cardio%'`],

  // treatments: hijama page
  [`UPDATE treatments SET symptoms_html = REPLACE(symptoms_html, '<li>Asthma, persistent cough and chest congestion</li>', '<li>Seasonal allergies and sinus trouble</li>') WHERE slug='hijama-cupping-therapy'`],
  [`UPDATE treatments SET treatment_html = REPLACE(treatment_html, '<li><strong>Lung problems</strong> — asthma and cough often ease quickly</li>', '<li><strong>Sinus discomfort</strong> — many patients report easier, freer comfort</li>') WHERE slug='hijama-cupping-therapy'`],
  [`UPDATE treatments SET treatment_html = REPLACE(treatment_html, '<li>Fractures, serious heart problems, haemophilia</li>', '<li>Fractures, bleeding disorders, haemophilia</li>') WHERE slug='hijama-cupping-therapy'`],
  [`UPDATE treatments SET causes_html = REPLACE(causes_html, 'pregnancy, preeclampsia, obesity, hypertension, diabetes, upper respiratory ailments', 'pregnancy, preeclampsia, obesity, hypertension, diabetes') WHERE slug='bell-palsy'`]
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: false
  });

  let applied = 0;
  for (const [sql] of SWAPS) {
    try {
      const [res] = await conn.query(sql);
      if (res.affectedRows > 0) applied++;
    } catch (e) {
      console.log('ERROR:', sql.slice(0, 70), '->', e.message.slice(0, 90));
    }
  }

  // Final verification: count remaining cardio terms in content tables
  const CHECKS = [
    "SELECT (SELECT COUNT(*) FROM services WHERE slug LIKE '%cardio%' OR full_description_html LIKE '%cardio%' OR full_description_html LIKE '%pulmonary%' OR full_description_html LIKE '%respiratory%') AS services",
    "SELECT (SELECT COUNT(*) FROM pages WHERE content_html LIKE '%cardio%' OR content_html LIKE '%pulmonary%' OR content_html LIKE '%Cardiopulmonary%' OR subtitle LIKE '%cardio%') AS pages",
    "SELECT (SELECT COUNT(*) FROM blogs WHERE content_html LIKE '%cardio%' OR content_html LIKE '%pulmonary%' OR title LIKE '%Cardiorespiratory%' OR excerpt LIKE '%cardiorespiratory%' OR slug LIKE '%cardiorespiratory%') AS blogs",
    "SELECT (SELECT COUNT(*) FROM seo_metadata WHERE path LIKE '%cardiorespiratory%' OR meta_title LIKE '%Cardiac%' OR meta_description LIKE '%cardiorespiratory%' OR og_title LIKE '%Cardiac%' OR og_description LIKE '%cardiorespiratory%') AS seo",
    "SELECT (SELECT COUNT(*) FROM navigation_items WHERE url LIKE '%cardiorespiratory%' OR title LIKE '%Cardiorespiratory%') AS nav"
  ];
  console.log('\nRemaining cardio-term rows:');
  let clean = true;
  for (const c of CHECKS) {
    const [[row]] = await conn.query(c);
    const key = Object.keys(row)[0];
    if (row[key] > 0) clean = false;
    console.log(' ', key + ':', row[key]);
  }

  await conn.end();
  console.log(applied + ' statements affected rows; DB is ' + (clean ? 'CLEAN' : 'NOT YET CLEAN'));
  process.exit(0);
})();
