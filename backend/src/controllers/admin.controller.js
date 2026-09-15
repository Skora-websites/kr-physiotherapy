const crypto = require('crypto');
const { query, getDbMode, loadSeedData } = require('../config/db');
const { signAdminToken } = require('../services/token.service');

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
      user: { name: 'Dr. Neelam Sharma (Admin)', email: expected.email }
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
        [title, finalSlug, excerpt || '', content_html || '', featured_image || '/images/clinic-gym.jpg', author_name || 'Dr. Neelam Sharma', 'published']
      );
      res.status(201).json({ success: true, id: result.insertId, slug: finalSlug });
    } catch (err) { next(err); }
  },

  async updateBlog(req, res, next) {
    try {
      const { title, excerpt, content_html, featured_image, author_name, status } = req.body;
      await query(
        'UPDATE blogs SET title=?, excerpt=?, content_html=?, featured_image=?, author_name=?, status=? WHERE id=?',
        [title, excerpt || '', content_html || '', featured_image || '', author_name || 'Dr. Neelam Sharma', status || 'published', req.params.id]
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
        [patient_name, location || 'Noida', condition_treated || '', rating || 5, testimonial_text, doctor_name || 'Dr. Neelam Sharma', is_featured ? 1 : 0]
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
  }
};

module.exports = AdminController;
