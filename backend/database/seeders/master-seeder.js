const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function runSeed() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'krphysiotherapy';

  console.log(`Connecting to database '${database}' at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  const seedDir = path.join(__dirname, '../seed-data');

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Blog categories
    const categories = JSON.parse(fs.readFileSync(path.join(seedDir, 'blog-categories.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE blog_categories;');
    for (const c of categories) {
      await conn.execute(
        'INSERT INTO blog_categories (id, name, slug, description) VALUES (?, ?, ?, ?)',
        [c.id, c.name, c.slug, c.description || '']
      );
    }
    console.log(`Seeded ${categories.length} blog categories.`);

    // 2. Pages
    const pages = JSON.parse(fs.readFileSync(path.join(seedDir, 'pages.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE pages;');
    for (const p of pages) {
      await conn.execute(
        'INSERT INTO pages (id, slug, path, title, subtitle, content_html, template, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.slug, p.path, p.title, p.subtitle || '', p.content_html || '', p.template || 'standard', p.status || 'published']
      );
    }
    console.log(`Seeded ${pages.length} pages.`);

    // 3. Services
    const services = JSON.parse(fs.readFileSync(path.join(seedDir, 'services.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE services;');
    for (const s of services) {
      await conn.execute(
        'INSERT INTO services (id, slug, name, short_description, full_description_html, icon, banner_image, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.slug, s.name, s.short_description || '', s.full_description_html || '', s.icon || 'medical_services', s.banner_image || '', s.sort_order || 0, s.status || 'published']
      );
    }
    console.log(`Seeded ${services.length} services.`);

    // 4. Treatments
    const treatments = JSON.parse(fs.readFileSync(path.join(seedDir, 'treatments.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE treatments;');
    for (const t of treatments) {
      await conn.execute(
        'INSERT INTO treatments (id, slug, name, category, summary, symptoms_html, causes_html, treatment_html, banner_image, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.slug, t.name, t.category || '', t.summary || '', t.symptoms_html || '', t.causes_html || '', t.treatment_html || '', t.banner_image || '', t.sort_order || 0, t.status || 'published']
      );
    }
    console.log(`Seeded ${treatments.length} treatments.`);

    // 5. Doctors
    const doctors = JSON.parse(fs.readFileSync(path.join(seedDir, 'doctors.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE doctors;');
    for (const d of doctors) {
      await conn.execute(
        'INSERT INTO doctors (id, slug, name, designation, qualification, experience_years, bio_html, photo_url, phone, email, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [d.id, d.slug, d.name, d.designation || '', d.qualification || '', d.experience_years || 0, d.bio_html || '', d.photo_url || '', d.phone || '', d.email || '', d.sort_order || 0, d.status || 'published']
      );
    }
    console.log(`Seeded ${doctors.length} doctors.`);

    // 6. Testimonials
    const testimonials = JSON.parse(fs.readFileSync(path.join(seedDir, 'testimonials.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE testimonials;');
    for (const tm of testimonials) {
      await conn.execute(
        'INSERT INTO testimonials (id, patient_name, location, condition_treated, rating, testimonial_text, doctor_name, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [tm.id, tm.patient_name, tm.location || 'Noida', tm.condition_treated || '', tm.rating || 5, tm.testimonial_text, tm.doctor_name || '', tm.is_featured ? 1 : 0, tm.sort_order || 0]
      );
    }
    console.log(`Seeded ${testimonials.length} testimonials.`);

    // 7. Blogs
    const blogs = JSON.parse(fs.readFileSync(path.join(seedDir, 'blogs.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE blogs;');
    for (const b of blogs) {
      await conn.execute(
        'INSERT INTO blogs (id, slug, title, excerpt, content_html, featured_image, category_id, author_name, published_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [b.id, b.slug, b.title, b.excerpt || '', b.content_html || '', b.featured_image || '', b.category_id || 1, b.author_name || '', b.published_at || new Date(), b.status || 'published']
      );
    }
    console.log(`Seeded ${blogs.length} blog articles.`);

    // 8. SEO Metadata
    const seoList = JSON.parse(fs.readFileSync(path.join(seedDir, 'seo.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE seo_metadata;');
    for (const s of seoList) {
      const structJson = s.structuredData ? JSON.stringify(s.structuredData) : null;
      await conn.execute(
        'INSERT INTO seo_metadata (id, entity_type, entity_id, path, meta_title, meta_description, meta_keywords, canonical_url, robots, og_title, og_description, og_image, og_url, structured_data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.entity_type || 'page', s.entity_id || 0, s.path, s.title || '', s.description || '', s.keywords || '', s.canonical || '', s.robots || '', s.ogTitle || '', s.ogDesc || '', s.ogImage || '', s.ogUrl || '', structJson]
      );
    }
    console.log(`Seeded ${seoList.length} SEO metadata records.`);

    // 9. Media
    const media = JSON.parse(fs.readFileSync(path.join(seedDir, 'media.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE media;');
    for (const m of media) {
      await conn.execute(
        'INSERT INTO media (id, original_path, local_url, alt_text, mime_type, file_size) VALUES (?, ?, ?, ?, ?, ?)',
        [m.id, m.original_path, m.local_url, m.alt_text || '', m.mime_type || '', m.file_size || 0]
      );
    }
    console.log(`Seeded ${media.length} media records.`);

    // 10. Navigation
    const navItems = JSON.parse(fs.readFileSync(path.join(seedDir, 'navigation.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE navigation_items;');
    for (const n of navItems) {
      await conn.execute(
        'INSERT INTO navigation_items (id, menu_location, parent_id, title, url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [n.id, n.menu_location, n.parent_id || null, n.title, n.url, n.sort_order || 0]
      );
    }
    console.log(`Seeded ${navItems.length} navigation items.`);

    // 11. Site Settings
    const settings = JSON.parse(fs.readFileSync(path.join(seedDir, 'site-settings.json'), 'utf8'));
    await conn.query('TRUNCATE TABLE site_settings;');
    for (const st of settings) {
      await conn.execute(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        [st.setting_key, st.setting_value]
      );
    }
    console.log(`Seeded ${settings.length} site settings.`);

    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Database seeding finished cleanly.');
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = runSeed;
