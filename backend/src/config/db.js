const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

let pool = null;
let seedDataCache = null;
let dbMode = 'unknown'; // 'mysql' | 'fallback' — set by query()

function loadSeedData() {
  if (seedDataCache) return seedDataCache;
  try {
    seedDataCache = {
      pages: require('../../database/seed-data/pages.json'),
      services: require('../../database/seed-data/services.json'),
      treatments: require('../../database/seed-data/treatments.json'),
      doctors: require('../../database/seed-data/doctors.json'),
      testimonials: require('../../database/seed-data/testimonials.json'),
      blogs: require('../../database/seed-data/blogs.json'),
      blogCategories: require('../../database/seed-data/blog-categories.json'),
      seo: require('../../database/seed-data/seo.json'),
      navigation: require('../../database/seed-data/navigation.json'),
      siteSettings: require('../../database/seed-data/site-settings.json'),
      appointments: [],
      contacts: []
    };
    return seedDataCache;
  } catch (e) {
    console.warn('[DB] Static require for seed data failed:', e.message);
  }

  const seedDir = path.resolve(__dirname, '../../database/seed-data');
  const read = (file) => {
    try {
      const p = path.join(seedDir, file);
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.error(`Error reading seed data ${file}:`, e);
    }
    return [];
  };

  seedDataCache = {
    pages: read('pages.json'),
    services: read('services.json'),
    treatments: read('treatments.json'),
    doctors: read('doctors.json'),
    testimonials: read('testimonials.json'),
    blogs: read('blogs.json'),
    blogCategories: read('blog-categories.json'),
    seo: read('seo.json'),
    navigation: read('navigation.json'),
    siteSettings: read('site-settings.json'),
    appointments: [],
    contacts: []
  };
  return seedDataCache;
}

function getPool() {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (dbUrl) {
    try {
      pool = mysql.createPool({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        connectTimeout: 5000
      });
      return pool;
    } catch (err) {
      console.warn('[DB] Failed to create pool from DATABASE_URL:', err.message);
    }
  }

  // Only create standard pool if DB_HOST is explicitly set or local
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'krphysiotherapy';

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    });
  } catch (err) {
    console.warn('[DB] Pool initialization failed:', err.message);
    pool = null;
  }

  return pool;
}

function fallbackQuery(sql, params = []) {
  const data = loadSeedData();
  const normalizedSql = sql.trim().toLowerCase();

  // 0. Admin mutations — applied in-memory so the admin panel works without MySQL
  const TABLE_KEYS = {
    services: 'services',
    treatments: 'treatments',
    blogs: 'blogs',
    testimonials: 'testimonials',
    doctors: 'doctors',
    appointments: 'appointments',
    contact_submissions: 'contacts'
  };

  // DELETE FROM <table> WHERE id = ?
  const deleteMatch = normalizedSql.match(/^delete from (services|treatments|blogs|testimonials|doctors|appointments|contact_submissions) where id = \?$/);
  if (deleteMatch) {
    const arr = data[TABLE_KEYS[deleteMatch[1]]];
    const id = Number(params[0]);
    const idx = arr.findIndex(x => Number(x.id) === id);
    if (idx !== -1) arr.splice(idx, 1);
    return { affectedRows: idx !== -1 ? 1 : 0 };
  }

  // UPDATE <table> SET status = ? WHERE id = ?  (appointments / contacts PATCH)
  const statusUpdateMatch = normalizedSql.match(/^update (appointments|contact_submissions) set status = \? where id = \?$/);
  if (statusUpdateMatch) {
    const arr = data[TABLE_KEYS[statusUpdateMatch[1]]];
    const id = Number(params[1]);
    const row = arr.find(x => Number(x.id) === id);
    if (row) row.status = params[0];
    return { affectedRows: row ? 1 : 0 };
  }

  // UPDATE <table> SET col=?, ... WHERE id = ?  (full row updates)
  const updateMatch = normalizedSql.match(/^update (services|treatments|blogs|testimonials|doctors) set (.+) where id = \?$/);
  if (updateMatch) {
    const cols = updateMatch[2].split(',').map(part => part.split('=')[0].trim());
    const arr = data[TABLE_KEYS[updateMatch[1]]];
    const id = Number(params[params.length - 1]);
    const row = arr.find(x => Number(x.id) === id);
    if (row) cols.forEach((col, i) => { row[col] = params[i]; });
    return { affectedRows: row ? 1 : 0 };
  }

  // INSERT INTO <table> (cols...) VALUES (?,?,...)
  const insertMatch = normalizedSql.match(/^insert into (services|treatments|blogs|testimonials|doctors) \(/);
  if (insertMatch) {
    const cols = sql.match(/\(([^)]+)\)/)[1].split(',').map(s => s.trim());
    const newRow = { id: Date.now() };
    cols.forEach((col, i) => { newRow[col] = params[i]; });
    data[TABLE_KEYS[insertMatch[1]]].unshift(newRow);
    return { insertId: newRow.id, affectedRows: 1 };
  }

  // 1. Pages
  if (normalizedSql.includes('from pages')) {
    if (normalizedSql.includes('where path = ?')) {
      const match = data.pages.find(p => p.path === params[0]);
      return match ? [match] : [];
    }
    if (normalizedSql.includes('where slug = ?')) {
      const match = data.pages.find(p => p.slug === params[0]);
      return match ? [match] : [];
    }
    return data.pages;
  }

  // 2. Services
  if (normalizedSql.includes('from services')) {
    if (normalizedSql.includes('where slug = ?')) {
      const match = data.services.find(s => s.slug === params[0] && s.status === 'published');
      return match ? [match] : [];
    }
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.services.length }];
    }
    return [...data.services]
      .filter(s => s.status === 'published')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  // 3. Treatments
  if (normalizedSql.includes('from treatments')) {
    if (normalizedSql.includes('where slug = ?')) {
      const match = data.treatments.find(t => t.slug === params[0] && t.status === 'published');
      return match ? [match] : [];
    }
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.treatments.length }];
    }
    return [...data.treatments]
      .filter(t => t.status === 'published')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  // 4. Doctors
  if (normalizedSql.includes('from doctors')) {
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.doctors.length }];
    }
    if (normalizedSql.includes('where slug = ?')) {
      const match = data.doctors.find(d => d.slug === params[0] && d.status === 'published');
      return match ? [match] : [];
    }
    return [...data.doctors]
      .filter(d => d.status === 'published')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  // 5. Testimonials
  if (normalizedSql.includes('from testimonials')) {
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.testimonials.length }];
    }
    return [...data.testimonials].sort(
      (a, b) => (b.is_featured || 0) - (a.is_featured || 0) || (a.sort_order || 0) - (b.sort_order || 0)
    );
  }

  // 6. Blogs
  if (normalizedSql.includes('from blogs')) {
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.blogs.length }];
    }
    // Admin path: SELECT * returns ALL blogs (incl. drafts); public paths filter published below.
    // Honors LIMIT/OFFSET params when present (safety net for paginated callers).
    if (normalizedSql.startsWith('select *')) {
      const rows = [...data.blogs].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      if (typeof params[1] === 'number' && typeof params[0] === 'number') {
        return rows.slice(params[1], params[1] + params[0]);
      }
      return rows;
    }
    if (normalizedSql.includes('where b.slug = ?') || normalizedSql.includes('where slug = ?')) {
      const slug = params[0];
      const blog = data.blogs.find(b => b.slug === slug && b.status === 'published');
      if (!blog) return [];
      const cat = data.blogCategories.find(c => c.id === blog.category_id);
      return [{
        ...blog,
        category_name: cat ? cat.name : 'Physiotherapy',
        category_slug: cat ? cat.slug : 'physiotherapy'
      }];
    }
    const limit = typeof params[0] === 'number' ? params[0] : 50;
    const offset = typeof params[1] === 'number' ? params[1] : 0;
    return data.blogs
      .filter(b => b.status === 'published')
      .slice(offset, offset + limit)
      .map(b => {
        const cat = data.blogCategories.find(c => c.id === b.category_id);
        return {
          id: b.id,
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt,
          featured_image: b.featured_image,
          author_name: b.author_name,
          published_at: b.published_at,
          category_name: cat ? cat.name : 'Physiotherapy',
          category_slug: cat ? cat.slug : 'physiotherapy'
        };
      });
  }

  // 7. SEO Metadata
  if (normalizedSql.includes('from seo_metadata')) {
    const targetPath = params[0];
    const match = data.seo.find(s => s.path === targetPath);
    if (!match) return [];
    return [{
      id: match.id,
      path: match.path,
      meta_title: match.title || match.meta_title,
      meta_description: match.description || match.meta_description,
      meta_keywords: match.keywords || match.meta_keywords,
      canonical_url: match.canonical || match.canonical_url,
      robots: match.robots,
      og_title: match.ogTitle || match.og_title,
      og_description: match.ogDesc || match.og_description,
      og_url: match.ogUrl || match.og_url,
      og_image: match.ogImage || match.og_image,
      structured_data_json: Array.isArray(match.structuredData) ? JSON.stringify(match.structuredData) : (match.structured_data_json || null)
    }];
  }

  // 8. Navigation items
  if (normalizedSql.includes('from navigation_items')) {
    return data.navigation;
  }

  // 9. Site Settings
  if (normalizedSql.includes('from site_settings')) {
    return data.siteSettings;
  }

  // 10. Appointments
  if (normalizedSql.includes('from appointments')) {
    if (normalizedSql.includes('count(*)')) {
      if (normalizedSql.includes("status='pending'")) {
        return [{ count: data.appointments.filter(a => a.status === 'Pending').length }];
      }
      return [{ count: data.appointments.length }];
    }
    return data.appointments;
  }
  if (normalizedSql.startsWith('insert into appointments')) {
    const newId = Date.now();
    data.appointments.unshift({
      id: newId,
      patient_name: params[0],
      phone: params[1],
      email: params[2],
      preferred_date: params[3],
      preferred_time: params[4],
      service_or_treatment: params[5],
      message: params[6],
      status: 'Pending',
      created_at: new Date().toISOString()
    });
    return { insertId: newId };
  }

  // 11. Contact Submissions
  if (normalizedSql.includes('from contact_submissions')) {
    if (normalizedSql.includes('count(*)')) {
      return [{ count: data.contacts.length }];
    }
    return data.contacts;
  }
  if (normalizedSql.startsWith('insert into contact_submissions')) {
    const newId = Date.now();
    data.contacts.unshift({
      id: newId,
      name: params[0],
      email: params[1],
      phone: params[2],
      subject: params[3],
      message: params[4],
      status: 'Unread',
      created_at: new Date().toISOString()
    });
    return { insertId: newId };
  }

  return [];
}

async function query(sql, params = []) {
  try {
    const p = getPool();
    if (p) {
      const [results] = await p.query(sql, params);
      dbMode = 'mysql';
      return results;
    }
  } catch (err) {
    // Only warn once in serverless or connection failure
    if (!global._dbWarned) {
      console.warn(`[DB] MySQL query failed (${err.code || err.message}). Serving from JSON fallback dataset.`);
      global._dbWarned = true;
    }
  }
  dbMode = 'fallback';
  return fallbackQuery(sql, params);
}

function getDbMode() {
  return dbMode;
}

// Live connectivity probe used by /api/health and the server startup log.
// Unlike query(), this never falls back — it reports what actually happened.
async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const target = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'krphysiotherapy',
    credentialsFrom: dbUrl ? 'DATABASE_URL' : '.env'
  };

  const started = Date.now();
  let p;
  try {
    p = getPool();
    if (!p) throw new Error('No database pool configured');
    const [rows] = await p.query('SELECT DATABASE() AS db, VERSION() AS version');
    dbMode = 'mysql';
    const result = {
      connected: true,
      mode: 'mysql',
      reason: 'Connected to MySQL/MariaDB',
      database: rows[0].db,
      version: rows[0].version,
      latencyMs: Date.now() - started,
      target
    };

    // Content counts prove the schema exists AND was seeded.
    try {
      const [counts] = await p.query(
        `SELECT
          (SELECT COUNT(*) FROM services) AS services,
          (SELECT COUNT(*) FROM treatments) AS treatments,
          (SELECT COUNT(*) FROM blogs) AS blogs,
          (SELECT COUNT(*) FROM pages) AS pages`
      );
      result.content = counts;
    } catch (schemaErr) {
      result.content = { error: `Schema incomplete (${schemaErr.code || schemaErr.message}) — run: npm run db:migrate && npm run db:seed` };
    }

    return result;
  } catch (err) {
    dbMode = 'fallback';
    return {
      connected: false,
      mode: 'fallback',
      reason: `MySQL unreachable (${err.code || err.message}) — serving JSON seed data from backend/database/seed-data`,
      database: target.database,
      version: null,
      latencyMs: Date.now() - started,
      target
    };
  }
}

module.exports = {
  getPool,
  query,
  getDbMode,
  checkDatabase,
  loadSeedData
};

