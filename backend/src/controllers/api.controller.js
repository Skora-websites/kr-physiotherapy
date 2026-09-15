const {
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
} = require('../models');
const { validateAppointment, validateContact } = require('../validators/form.validator');
const { checkDatabase } = require('../config/db');

const ApiController = {
  // GET /api/pages/:path
  async getPage(req, res, next) {
    try {
      let rawPath = req.params.path ? '/' + req.params.path : req.query.path || '/';
      if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;

      const page = await PageModel.findByPath(rawPath);
      if (!page) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      const seo = await SeoModel.findByPath(rawPath);
      res.json({ success: true, data: { ...page, seo } });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/services
  async getServices(req, res, next) {
    try {
      const services = await ServiceModel.getAll();
      res.json({ success: true, data: services });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/services/:slug
  async getServiceBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const cleanSlug = slug.replace('.html', '');
      const service = await ServiceModel.findBySlug(cleanSlug);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      const seo = await SeoModel.findByPath(`/${cleanSlug}.html`);
      res.json({ success: true, data: { ...service, seo } });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/treatments
  async getTreatments(req, res, next) {
    try {
      const treatments = await TreatmentModel.getAll();
      res.json({ success: true, data: treatments });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/treatments/:slug
  async getTreatmentBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const cleanSlug = slug.replace('.html', '');
      const treatment = await TreatmentModel.findBySlug(cleanSlug);
      if (!treatment) {
        return res.status(404).json({ success: false, message: 'Treatment not found' });
      }
      const seo = await SeoModel.findByPath(`/${cleanSlug}.html`);
      res.json({ success: true, data: { ...treatment, seo } });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/doctors
  async getDoctors(req, res, next) {
    try {
      const doctors = await DoctorModel.getAll();
      res.json({ success: true, data: doctors });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/doctors/:slug
  async getDoctorBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const cleanSlug = slug.replace('.html', '');
      const doctor = await DoctorModel.findBySlug(cleanSlug);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      const seo = await SeoModel.findByPath(`/${cleanSlug}.html`);
      res.json({ success: true, data: { ...doctor, seo } });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/testimonials
  async getTestimonials(req, res, next) {
    try {
      const testimonials = await TestimonialModel.getAll();
      res.json({ success: true, data: testimonials });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/blogs
  async getBlogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const page = parseInt(req.query.page || '1', 10);
      const offset = (page - 1) * limit;
      const blogs = await BlogModel.getAll(limit, offset);
      const seo = await SeoModel.findByPath('/blogs/index.htm');
      res.json({ success: true, data: blogs, seo });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/blogs/:slug
  async getBlogBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const cleanSlug = slug.replace(/\/index\.htm$/, '').replace(/\/$/, '');
      const blog = await BlogModel.findBySlug(cleanSlug);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog article not found' });
      }
      const seo = await SeoModel.findByPath(`/blogs/${cleanSlug}/`);
      res.json({ success: true, data: { ...blog, seo } });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/site-settings
  async getSiteSettings(req, res, next) {
    try {
      const settings = await SiteSettingModel.getAll();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/navigation
  async getNavigation(req, res, next) {
    try {
      const items = await NavigationModel.getAll();
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/health
  // Reports whether the backend is up and which database mode it is actually using.
  // Always responds 200 (the site is designed to keep serving from JSON seed data
  // when MySQL is down) — inspect `status` / `database.connected` to alert.
  async getHealth(req, res, next) {
    try {
      const database = await checkDatabase();
      res.json({
        success: true,
        status: database.connected ? 'ok' : 'degraded',
        service: 'kr-physiotherapy',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        database
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/appointments
  async createAppointment(req, res, next) {
    try {
      const errors = validateAppointment(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const id = await AppointmentModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Appointment request submitted successfully. Our clinic team will call to confirm.',
        data: { id }
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/contact
  async createContact(req, res, next) {
    try {
      const errors = validateContact(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const id = await ContactModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Message received. We will respond promptly.',
        data: { id }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ApiController;
