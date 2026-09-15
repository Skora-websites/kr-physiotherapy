const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/adminAuth');

// Public: login (no token yet)
router.post('/login', AdminController.login);

// Everything below requires a Bearer token
router.use(adminAuth);

router.get('/stats', AdminController.getStats);

// Bookings
router.get('/appointments', AdminController.getAppointments);
router.patch('/appointments/:id', AdminController.updateAppointment);
router.delete('/appointments/:id', AdminController.deleteAppointment);

// Inquiries
router.get('/contacts', AdminController.getContacts);
router.patch('/contacts/:id', AdminController.updateContact);
router.delete('/contacts/:id', AdminController.deleteContact);

// Services
router.get('/services', AdminController.getServices);
router.post('/services', AdminController.createService);
router.put('/services/:id', AdminController.updateService);
router.delete('/services/:id', AdminController.deleteService);

// Treatments
router.get('/treatments', AdminController.getTreatments);
router.post('/treatments', AdminController.createTreatment);
router.put('/treatments/:id', AdminController.updateTreatment);
router.delete('/treatments/:id', AdminController.deleteTreatment);

// Blogs
router.get('/blogs', AdminController.getBlogs);
router.post('/blogs', AdminController.createBlog);
router.put('/blogs/:id', AdminController.updateBlog);
router.delete('/blogs/:id', AdminController.deleteBlog);

// Testimonials
router.get('/testimonials', AdminController.getTestimonials);
router.post('/testimonials', AdminController.createTestimonial);
router.put('/testimonials/:id', AdminController.updateTestimonial);
router.delete('/testimonials/:id', AdminController.deleteTestimonial);

// Doctors
router.get('/doctors', AdminController.getDoctors);
router.post('/doctors', AdminController.createDoctor);
router.put('/doctors/:id', AdminController.updateDoctor);
router.delete('/doctors/:id', AdminController.deleteDoctor);

// Site Settings
router.get('/site-settings', AdminController.getSiteSettings);
router.put('/site-settings/:key', AdminController.updateSiteSetting);
router.put('/site-settings', AdminController.updateSiteSettingsBulk);

module.exports = router;
