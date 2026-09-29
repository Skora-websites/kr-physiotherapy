const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { query, getDbMode, loadSeedData } = require('../config/db');
const { signAdminToken } = require('../services/token.service');

const SITE_URL = 'https://www.krphysiotherapy.com';

// Map a seed-data SEO row (title/description/keywords/canonical/ogTitle/...)
// to the snake_case shape used by the seo_metadata table / admin UI.
function seoRowFromSeed(row) {
  return {
    id: row.id,
    path: row.path,
    entity_type: row.entity_type || null,
    entity_id: row.entity_id ?? null,
    meta_title: row.title || row.meta_title || '',
    meta_description: row.description || row.meta_description || '',
    meta_keywords: row.keywords || row.meta_keywords || '',
    canonical_url: row.canonical || row.canonical_url || '',
    robots: row.robots || 'INDEX,FOLLOW',
    og_title: row.ogTitle || row.og_title || '',
    og_description: row.ogDesc || row.og_description || '',
    og_url: row.ogUrl || row.og_url || '',
    og_image: row.ogImage || row.og_image || ''
  };
}

// Build a seed-style patch from an admin payload — only keys present in the
// body are written, so partial upserts (e.g. from the blog editor) never
// clobber curated OG tags with blanks.
function seedPatchFrom(body) {
  const patch = {};
  const map = {
    meta_title: 'title',
    meta_description: 'description',
    meta_keywords: 'keywords',
    canonical_url: 'canonical',
    robots: 'robots',
    og_title: 'ogTitle',
    og_description: 'ogDesc',
    og_url: 'ogUrl',
    og_image: 'ogImage'
  };
  for (const [adminKey, seedKey] of Object.entries(map)) {
    if (body[adminKey] !== undefined) patch[seedKey] = body[adminKey];
  }
  return patch;
}

function guessEntityType(normPath) {
  if (/^\/blogs\/index\.htm$/.test(normPath)) return 'blog_index';
  if (normPath.startsWith('/blogs/')) return 'blog';
  return 'page';
}

// Write-through: persist the in-memory seo array back to the seed JSON so
// fallback-mode admin edits survive a server restart.
function persistSeedSeo(rows) {
  try {
    const file = path.resolve(__dirname, '../../database/seed-data/seo.json');
    fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.warn('[ADMIN] Could not persist seo.json:', err.message);
  }
}

// Same write-through for the video gallery (fallback-mode admin edits survive restarts)
function persistSeedVideos(rows) {
  try {
    const file = path.resolve(__dirname, '../../database/seed-data/videos.json');
    fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.warn('[ADMIN] Could not persist videos.json:', err.message);
  }
}

// Credentials are read per-request from the environment. There is deliberately
// no hardcoded password fallback: with ADMIN_PASSWORD unset, admin login is
// disabled (503) rather than silently accepting a value published in the repo.
function adminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@krphysiotherapy.com',
    password: process.env.ADMIN_PASSWORD || ''
  };
}

// Constant-length, timing-safe string comparison (sha256 → equal-length buffers,
// so no length information leaks and timingSafeEqual cannot throw).
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Parse ?page & ?limit & ?search & ?status from the query string
function parseListParams(req, defaultLimit = 20) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
  const search = (req.query.search || '').toString().trim().toLowerCase();
  const status = (req.query.status || '').toString().trim();
  return { page, limit, search, status, offset: (page - 1) * limit };
}

// Filter + paginate an in-memory array (fallback mode)
function paginateArray(items, { page, limit, search, status }, searchFields) {
  let out = items;
  if (status) out = out.filter(x => (x.status || '') === status);
  if (search) {
    out = out.filter(x => searchFields.some(f => String(x[f] || '').toLowerCase().includes(search)));
  }
  const total = out.length;
  const rows = out.slice((page - 1) * limit, page * limit);
  return { rows, total };
}

// Standard list response shape for paginated endpoints
function listResponse(res, rows, total, { page, limit }) {
  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
  });
}

const AdminController = {
  // ─── Auth ───────────────────────────────────────────────────────────
  async login(req, res) {
    const { email, password } = req.body || {};
    const expected = adminCredentials();

    if (!expected.password) {
      console.error('[ADMIN] ADMIN_PASSWORD is not set — admin login is disabled.');
      return res.status(503).json({ success: false, message: 'Admin login is not configured' });
    }

    const emailOk = safeEqual(email || '', expected.email);
    const passwordOk = safeEqual(password || '', expected.password);

    if (!emailOk || !passwordOk) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      token: signAdminToken(expected.email),
      user: { name: 'Dr. Neelam Sharma(PT) (Admin)', email: expected.email }
    });
  },

  // ─── Dashboard Stats ────────────────────────────────────────────────
  async getStats(req, res, next) {
    try {
      // query() resolves directly to rows, so destructure once: [row]
      const [apt] = await query('SELECT COUNT(*) as count FROM appointments');
      const [pend] = await query("SELECT COUNT(*) as count FROM appointments WHERE status='Pending'");
      const [con] = await query('SELECT COUNT(*) as count FROM contact_submissions');
      const [srv] = await query('SELECT COUNT(*) as count FROM services');
      const [trt] = await query('SELECT COUNT(*) as count FROM treatments');
      const [blg] = await query('SELECT COUNT(*) as count FROM blogs');
      const [tst] = await query('SELECT COUNT(*) as count FROM testimonials');
      res.json({ success: true, data: {
        totalAppointments: apt.count, pendingAppointments: pend.count,
        totalContacts: con.count, totalServices: srv.count,
        totalTreatments: trt.count, totalBlogs: blg.count, totalTestimonials: tst.count
      }});
    } catch (err) { next(err); }
  },

  // ─── Bookings (Appointments) ────────────────────────────────────────
  async getAppointments(req, res, next) {
    try {
      const p = parseListParams(req);

      if (getDbMode() === 'fallback') {
        const data = loadSeedData();
        const sorted = [...data.appointments].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const { rows, total } = paginateArray(sorted, p, ['patient_name', 'phone', 'email', 'service_or_treatment', 'message']);
        return listResponse(res, rows, total, p);
      }

      // MySQL path: filter + paginate in SQL
      const where = [];
      const sqlParams = [];
      if (p.status) { where.push('status = ?'); sqlParams.push(p.status); }
      if (p.search) {
        where.push('(LOWER(patient_name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ? OR LOWER(service_or_treatment) LIKE ?)');
        const like = `%${p.search}%`;
        sqlParams.push(like, like, like, like);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [countRow] = await query(`SELECT COUNT(*) as count FROM appointments ${whereSql}`, sqlParams);
      const rows = await query(
        `SELECT * FROM appointments ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...sqlParams, p.limit, p.offset]
      );
      return listResponse(res, rows, countRow.count, p);
    } catch (err) { next(err); }
  },

  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteAppointment(req, res, next) {
    try {
      await query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Inquiries (Contacts) ───────────────────────────────────────────
  async getContacts(req, res, next) {
    try {
      const p = parseListParams(req);

      if (getDbMode() === 'fallback') {
        const data = loadSeedData();
        const sorted = [...data.contacts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const { rows, total } = paginateArray(sorted, p, ['name', 'email', 'phone', 'subject', 'message']);
        return listResponse(res, rows, total, p);
      }

      const where = [];
      const sqlParams = [];
      if (p.status) { where.push('status = ?'); sqlParams.push(p.status); }
      if (p.search) {
        where.push('(LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(message) LIKE ?)');
        const like = `%${p.search}%`;
        sqlParams.push(like, like, like, like, like);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [countRow] = await query(`SELECT COUNT(*) as count FROM contact_submissions ${whereSql}`, sqlParams);
      const rows = await query(
        `SELECT * FROM contact_submissions ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...sqlParams, p.limit, p.offset]
      );
      return listResponse(res, rows, countRow.count, p);
    } catch (err) { next(err); }
  },

  async updateContact(req, res, next) {
    try {
      const { status } = req.body;
      await query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteContact(req, res, next) {
    try {
      await query('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Services ───────────────────────────────────────────────────────
  async getServices(req, res, next) {
    try {
      const rows = await query('SELECT * FROM services ORDER BY sort_order ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async createService(req, res, next) {
    try {
      const { slug, name, short_description, full_description_html, icon, banner_image, sort_order, status } = req.body;
      const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const result = await query(
        'INSERT INTO services (slug, name, short_description, full_description_html, icon, banner_image, sort_order, status) VALUES (?,?,?,?,?,?,?,?)',
        [finalSlug, name, short_description || '', full_description_html || '', icon || 'medical_services', banner_image || '', sort_order || 0, status || 'published']
      );
      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
  },

  async updateService(req, res, next) {
    try {
      const { name, short_description, full_description_html, icon, banner_image, sort_order, status } = req.body;
      await query(
        'UPDATE services SET name=?, short_description=?, full_description_html=?, icon=?, banner_image=?, sort_order=?, status=? WHERE id=?',
        [name, short_description || '', full_description_html || '', icon || 'medical_services', banner_image || '', sort_order || 0, status || 'published', req.params.id]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteService(req, res, next) {
    try {
      await query('DELETE FROM services WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Treatments ─────────────────────────────────────────────────────
  async getTreatments(req, res, next) {
    try {
      const rows = await query('SELECT * FROM treatments ORDER BY sort_order ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async createTreatment(req, res, next) {
    try {
      const { slug, name, category, summary, symptoms_html, causes_html, treatment_html, banner_image, sort_order, status } = req.body;
      const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const result = await query(
        'INSERT INTO treatments (slug, name, category, summary, symptoms_html, causes_html, treatment_html, banner_image, sort_order, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [finalSlug, name, category || '', summary || '', symptoms_html || '', causes_html || '', treatment_html || '', banner_image || '', sort_order || 0, status || 'published']
      );
      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
  },

  async updateTreatment(req, res, next) {
    try {
      const { name, category, summary, symptoms_html, causes_html, treatment_html, banner_image, sort_order, status } = req.body;
      await query(
        'UPDATE treatments SET name=?, category=?, summary=?, symptoms_html=?, causes_html=?, treatment_html=?, banner_image=?, sort_order=?, status=? WHERE id=?',
        [name, category || '', summary || '', symptoms_html || '', causes_html || '', treatment_html || '', banner_image || '', sort_order || 0, status || 'published', req.params.id]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteTreatment(req, res, next) {
    try {
      await query('DELETE FROM treatments WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Blogs ──────────────────────────────────────────────────────────
  async getBlogs(req, res, next) {
    try {
      const p = parseListParams(req);

      if (getDbMode() === 'fallback') {
        const data = loadSeedData();
        const sorted = [...data.blogs].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
        const { rows, total } = paginateArray(sorted, p, ['title', 'slug', 'excerpt', 'author_name']);
        return listResponse(res, rows, total, p);
      }

      const where = [];
      const sqlParams = [];
      if (p.status) { where.push('status = ?'); sqlParams.push(p.status); }
      if (p.search) {
        where.push('(LOWER(title) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(excerpt) LIKE ? OR LOWER(author_name) LIKE ?)');
        const like = `%${p.search}%`;
        sqlParams.push(like, like, like, like);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [countRow] = await query(`SELECT COUNT(*) as count FROM blogs ${whereSql}`, sqlParams);
      const rows = await query(
        `SELECT * FROM blogs ${whereSql} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
        [...sqlParams, p.limit, p.offset]
      );
      return listResponse(res, rows, countRow.count, p);
    } catch (err) { next(err); }
  },

  async createBlog(req, res, next) {
    try {
      const { title, slug, excerpt, content_html, featured_image, author_name } = req.body;
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const result = await query(
        'INSERT INTO blogs (title, slug, excerpt, content_html, featured_image, author_name, status) VALUES (?,?,?,?,?,?,?)',
        [title, finalSlug, excerpt || '', content_html || '', featured_image || '/images/clinic-gym.jpg', author_name || 'Dr. Neelam Sharma(PT)', 'published']
      );
      res.status(201).json({ success: true, id: result.insertId, slug: finalSlug });
    } catch (err) { next(err); }
  },

  async updateBlog(req, res, next) {
    try {
      const { title, excerpt, content_html, featured_image, author_name, status } = req.body;
      await query(
        'UPDATE blogs SET title=?, excerpt=?, content_html=?, featured_image=?, author_name=?, status=? WHERE id=?',
        [title, excerpt || '', content_html || '', featured_image || '', author_name || 'Dr. Neelam Sharma(PT)', status || 'published', req.params.id]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteBlog(req, res, next) {
    try {
      await query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Testimonials ───────────────────────────────────────────────────
  async getTestimonials(req, res, next) {
    try {
      const rows = await query('SELECT * FROM testimonials ORDER BY is_featured DESC, sort_order ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async createTestimonial(req, res, next) {
    try {
      const { patient_name, location, condition_treated, rating, testimonial_text, doctor_name, is_featured } = req.body;
      const result = await query(
        'INSERT INTO testimonials (patient_name, location, condition_treated, rating, testimonial_text, doctor_name, is_featured) VALUES (?,?,?,?,?,?,?)',
        [patient_name, location || 'Noida', condition_treated || '', rating || 5, testimonial_text, doctor_name || 'Dr. Neelam Sharma(PT)', is_featured ? 1 : 0]
      );
      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
  },

  async updateTestimonial(req, res, next) {
    try {
      const { patient_name, location, condition_treated, rating, testimonial_text, doctor_name, is_featured } = req.body;
      await query(
        'UPDATE testimonials SET patient_name=?, location=?, condition_treated=?, rating=?, testimonial_text=?, doctor_name=?, is_featured=? WHERE id=?',
        [patient_name, location || '', condition_treated || '', rating || 5, testimonial_text, doctor_name || '', is_featured ? 1 : 0, req.params.id]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteTestimonial(req, res, next) {
    try {
      await query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Doctors ────────────────────────────────────────────────────────
  async getDoctors(req, res, next) {
    try {
      const rows = await query('SELECT * FROM doctors ORDER BY sort_order ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async createDoctor(req, res, next) {
    try {
      const { slug, name, designation, qualification, experience_years, bio_html, photo_url, phone, email, sort_order, status } = req.body;
      const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const result = await query(
        'INSERT INTO doctors (slug, name, designation, qualification, experience_years, bio_html, photo_url, phone, email, sort_order, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [finalSlug, name, designation || '', qualification || '', experience_years || 0, bio_html || '', photo_url || '', phone || '', email || '', sort_order || 0, status || 'published']
      );
      res.status(201).json({ success: true, id: result.insertId, slug: finalSlug });
    } catch (err) { next(err); }
  },

  async updateDoctor(req, res, next) {
    try {
      const { name, designation, qualification, experience_years, bio_html, photo_url, phone, email, sort_order, status } = req.body;
      await query(
        'UPDATE doctors SET name=?, designation=?, qualification=?, experience_years=?, bio_html=?, photo_url=?, phone=?, email=?, sort_order=?, status=? WHERE id=?',
        [name, designation || '', qualification || '', experience_years || 0, bio_html || '', photo_url || '', phone || '', email || '', sort_order || 0, status || 'published', req.params.id]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteDoctor(req, res, next) {
    try {
      await query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Site Settings ──────────────────────────────────────────────────
  async getSiteSettings(req, res, next) {
    try {
      const rows = await query('SELECT * FROM site_settings ORDER BY id ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async updateSiteSetting(req, res, next) {
    try {
      const { setting_key, setting_value } = req.body;
      await query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [setting_key, setting_value, setting_value]
      );
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async updateSiteSettingsBulk(req, res, next) {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) return res.status(400).json({ success: false, message: 'settings must be an array' });
      for (const { setting_key, setting_value } of settings) {
        await query(
          'INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [setting_key, setting_value, setting_value]
        );
      }
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── Video Gallery ──────────────────────────────────────────────────
  async getVideos(req, res, next) {
    try {
      const rows = await query('SELECT * FROM video_gallery ORDER BY sort_order ASC, id ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  async createVideo(req, res, next) {
    try {
      const { title, source_type, video_url, thumbnail_url, orientation, sort_order, status } = req.body;
      if (!video_url) return res.status(400).json({ success: false, message: 'video_url is required (upload a file or paste a link)' });
      const result = await query(
        'INSERT INTO video_gallery (title, source_type, video_url, thumbnail_url, orientation, sort_order, status) VALUES (?,?,?,?,?,?,?)',
        [title || '', source_type === 'file' ? 'file' : 'link', video_url, thumbnail_url || '', orientation === 'landscape' ? 'landscape' : 'portrait', parseInt(sort_order, 10) || 0, status === 'draft' ? 'draft' : 'published']
      );
      if (getDbMode() !== 'mysql') persistSeedVideos(loadSeedData().videos);
      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
  },

  async updateVideo(req, res, next) {
    try {
      const { title, source_type, video_url, thumbnail_url, orientation, sort_order, status } = req.body;
      await query(
        'UPDATE video_gallery SET title=?, source_type=?, video_url=?, thumbnail_url=?, orientation=?, sort_order=?, status=? WHERE id=?',
        [title || '', source_type === 'file' ? 'file' : 'link', video_url || '', thumbnail_url || '', orientation === 'landscape' ? 'landscape' : 'portrait', parseInt(sort_order, 10) || 0, status === 'draft' ? 'draft' : 'published', req.params.id]
      );
      if (getDbMode() !== 'mysql') persistSeedVideos(loadSeedData().videos);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async deleteVideo(req, res, next) {
    try {
      await query('DELETE FROM video_gallery WHERE id = ?', [req.params.id]);
      if (getDbMode() !== 'mysql') persistSeedVideos(loadSeedData().videos);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // ─── SEO Metadata ───────────────────────────────────────────────────
  // Rows are keyed by path; the SSR reads them via SeoModel.findByPath() to
  // build <title>/meta/canonical/OG tags, so edits here go live immediately.
  // Fallback mode mutates the in-memory seed array and writes through to
  // backend/database/seed-data/seo.json (edits survive restarts).
  async getSeoMetadata(req, res, next) {
    try {
      const search = (req.query.search || '').toString().trim().toLowerCase();

      if (getDbMode() !== 'mysql') {
        let rows = loadSeedData().seo.map(seoRowFromSeed);
        if (search) {
          rows = rows.filter(r => `${r.path} ${r.meta_title}`.toLowerCase().includes(search));
        }
        rows.sort((a, b) => String(a.path).localeCompare(String(b.path)));
        return res.json({ success: true, data: rows });
      }

      const rows = search
        ? await query('SELECT * FROM seo_metadata WHERE LOWER(path) LIKE ? OR LOWER(meta_title) LIKE ? ORDER BY path ASC', [`%${search}%`, `%${search}%`])
        : await query('SELECT * FROM seo_metadata ORDER BY path ASC');
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  // Upsert by path: updates the row if one exists (any path variant — with or
  // without trailing slash), otherwise creates it. Only fields present in the
  // body are written.
  async upsertSeoMetadata(req, res, next) {
    try {
      const body = req.body || {};
      if (!body.path) return res.status(400).json({ success: false, message: 'path is required' });
      const normPath = body.path.startsWith('/') ? body.path : '/' + body.path;
      const robots = body.robots || 'INDEX,FOLLOW';

      if (getDbMode() !== 'mysql') {
        const data = loadSeedData();
        const bare = normPath.replace(/\/$/, '');
        let row = data.seo.find(s => s.path === normPath || s.path === bare || s.path === bare + '/');
        const patch = seedPatchFrom(body);
        if (row) {
          Object.assign(row, patch);
        } else {
          row = {
            id: Date.now(),
            path: normPath,
            entity_type: body.entity_type || guessEntityType(normPath),
            entity_id: null,
            title: '', description: '', keywords: '', canonical: '',
            robots, ogTitle: '', ogDesc: '', ogUrl: `${SITE_URL}${normPath}`, ogImage: '',
            structuredData: [],
            ...patch
          };
          if (!row.robots) row.robots = robots;
          data.seo.push(row);
        }
        persistSeedSeo(data.seo);
        return res.json({ success: true, id: row.id, path: row.path });
      }

      const existing = await query('SELECT id FROM seo_metadata WHERE path = ? LIMIT 1', [normPath]);
      if (existing.length) {
        await query(
          'UPDATE seo_metadata SET meta_title = COALESCE(?, meta_title), meta_description = COALESCE(?, meta_description), meta_keywords = COALESCE(?, meta_keywords), canonical_url = COALESCE(?, canonical_url), robots = COALESCE(?, robots), og_title = COALESCE(?, og_title), og_description = COALESCE(?, og_description), og_image = COALESCE(?, og_image) WHERE id = ?',
          [body.meta_title ?? null, body.meta_description ?? null, body.meta_keywords ?? null, body.canonical_url ?? null, body.robots ?? null, body.og_title ?? null, body.og_description ?? null, body.og_image ?? null, existing[0].id]
        );
        return res.json({ success: true, id: existing[0].id, path: normPath });
      }
      const result = await query(
        'INSERT INTO seo_metadata (entity_type, path, meta_title, meta_description, meta_keywords, canonical_url, robots, og_title, og_description, og_url, og_image) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [body.entity_type || guessEntityType(normPath), normPath, body.meta_title || '', body.meta_description || '', body.meta_keywords || '', body.canonical_url || '', robots, body.og_title || '', body.og_description || '', `${SITE_URL}${normPath}`, body.og_image || '']
      );
      res.status(201).json({ success: true, id: result.insertId, path: normPath });
    } catch (err) { next(err); }
  },

  async deleteSeoMetadata(req, res, next) {
    try {
      if (getDbMode() !== 'mysql') {
        const data = loadSeedData();
        const idx = data.seo.findIndex(s => Number(s.id) === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, message: 'SEO entry not found' });
        data.seo.splice(idx, 1);
        persistSeedSeo(data.seo);
        return res.json({ success: true });
      }
      await query('DELETE FROM seo_metadata WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) { next(err); }
  }
};

module.exports = AdminController;
