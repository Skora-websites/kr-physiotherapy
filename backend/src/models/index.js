const { query } = require('../config/db');

const PageModel = {
  async findByPath(path) {
    const rows = await query('SELECT * FROM pages WHERE path = ? LIMIT 1', [path]);
    return rows[0] || null;
  },
  async findBySlug(slug) {
    const rows = await query('SELECT * FROM pages WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  },
  async getAll() {
    return await query('SELECT id, slug, path, title, subtitle, template, status, created_at FROM pages');
  }
};

const ServiceModel = {
  async getAll() {
    return await query('SELECT * FROM services WHERE status = "published" ORDER BY sort_order ASC');
  },
  async findBySlug(slug) {
    const rows = await query('SELECT * FROM services WHERE slug = ? AND status = "published" LIMIT 1', [slug]);
    return rows[0] || null;
  }
};

const TreatmentModel = {
  async getAll() {
    return await query('SELECT * FROM treatments WHERE status = "published" ORDER BY sort_order ASC');
  },
  async findBySlug(slug) {
    const rows = await query('SELECT * FROM treatments WHERE slug = ? AND status = "published" LIMIT 1', [slug]);
    return rows[0] || null;
  }
};

const DoctorModel = {
  async getAll() {
    return await query('SELECT * FROM doctors WHERE status = "published" ORDER BY sort_order ASC');
  },
  async findBySlug(slug) {
    const rows = await query('SELECT * FROM doctors WHERE slug = ? AND status = "published" LIMIT 1', [slug]);
    return rows[0] || null;
  }
};

const TestimonialModel = {
  async getAll() {
    return await query('SELECT * FROM testimonials ORDER BY is_featured DESC, sort_order ASC');
  }
};

const BlogModel = {
  async getAll(limit = 50, offset = 0) {
    return await query(
      'SELECT b.id, b.slug, b.title, b.excerpt, b.featured_image, b.author_name, b.published_at, c.name as category_name, c.slug as category_slug FROM blogs b LEFT JOIN blog_categories c ON b.category_id = c.id WHERE b.status = "published" ORDER BY b.published_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  },
  async findBySlug(slug) {
    const rows = await query(
      'SELECT b.*, c.name as category_name, c.slug as category_slug FROM blogs b LEFT JOIN blog_categories c ON b.category_id = c.id WHERE b.slug = ? AND b.status = "published" LIMIT 1',
      [slug]
    );
    return rows[0] || null;
  }
};

const SeoModel = {
  async findByPath(path) {
    let rows = await query('SELECT * FROM seo_metadata WHERE path = ? LIMIT 1', [path]);
    if (!rows.length && path.endsWith('/')) {
      rows = await query('SELECT * FROM seo_metadata WHERE path = ? LIMIT 1', [path.slice(0, -1)]);
    }
    if (!rows.length && !path.endsWith('/')) {
      rows = await query('SELECT * FROM seo_metadata WHERE path = ? LIMIT 1', [path + '/']);
    }
    return rows[0] || null;
  }
};

const NavigationModel = {
  async getAll() {
    return await query('SELECT * FROM navigation_items ORDER BY menu_location ASC, sort_order ASC');
  }
};

const SiteSettingModel = {
  async getAll() {
    const rows = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  }
};

const AppointmentModel = {
  async create({ patient_name, phone, email, preferred_date, preferred_time, service_or_treatment, message }) {
    const result = await query(
      'INSERT INTO appointments (patient_name, phone, email, preferred_date, preferred_time, service_or_treatment, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_name, phone, email || null, preferred_date || null, preferred_time || null, service_or_treatment || null, message || null]
    );
    return result.insertId;
  }
};

const ContactModel = {
  async create({ name, email, phone, subject, message }) {
    const result = await query(
      'INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject || null, message]
    );
    return result.insertId;
  }
};

module.exports = {
  PageModel,
  ServiceModel,
  TreatmentModel,
  DoctorModel,
  TestimonialModel,
  BlogModel,
  SeoModel,
  NavigationModel,
  SiteSettingModel,
  AppointmentModel,
  ContactModel
};
