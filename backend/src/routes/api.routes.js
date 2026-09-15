const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.controller');

// Health / readiness (public, no auth) — used by monitoring and the Docker HEALTHCHECK
router.get('/health', ApiController.getHealth);

// Content endpoints
router.get('/pages', ApiController.getPage);
router.get('/pages/:path', ApiController.getPage);
router.get('/services', ApiController.getServices);
router.get('/services/:slug', ApiController.getServiceBySlug);
router.get('/treatments', ApiController.getTreatments);
router.get('/treatments/:slug', ApiController.getTreatmentBySlug);
router.get('/doctors', ApiController.getDoctors);
router.get('/doctors/:slug', ApiController.getDoctorBySlug);
router.get('/testimonials', ApiController.getTestimonials);
router.get('/blogs', ApiController.getBlogs);
router.get('/blogs/:slug', ApiController.getBlogBySlug);
router.get('/site-settings', ApiController.getSiteSettings);
router.get('/navigation', ApiController.getNavigation);

// Interactive Form endpoints
router.post('/appointments', ApiController.createAppointment);
router.post('/contact', ApiController.createContact);

module.exports = router;
