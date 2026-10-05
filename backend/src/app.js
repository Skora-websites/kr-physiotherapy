const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const errorHandler = require('./middleware/errorHandler');
const { renderHtmlForPath } = require('./services/ssr.service');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder (images, fonts, scripts)
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

const rootPublicDir = path.resolve(__dirname, '../../public');
app.use(express.static(rootPublicDir));

// Also serve client build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// REST API
app.use('/api/admin', uploadRoutes);   // file uploads (multipart, own router)
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Clean URLs: 301-redirect legacy ".html" URLs to their extension-less form.
// Registered after static/API routers, so real files and API paths are never touched.
// (Apache deployments get the same behavior via public/.htaccess.)
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let target = null;
  if (req.path === '/index.htm') target = '/';
  else if (req.path === '/blogs/index.htm') target = '/blogs/';
  else if (req.path === '/blogs') target = '/blogs/';
  else if (/\.html$/i.test(req.path)) target = req.path.replace(/\.html$/i, '');
  if (!target) return next();
  const q = req.originalUrl.indexOf('?');
  return res.redirect(301, target + (q >= 0 ? req.originalUrl.slice(q) : ''));
});

// Server-Side SEO HTML Render Handler for all public site routes
app.use(async (req, res, next) => {
  if (req.method !== 'GET') return next();

  // Do not intercept static files with extensions
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(req.path)) {
    return next();
  }

  try {
    const html = await renderHtmlForPath(req.path);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

// Central error handler
app.use(errorHandler);

module.exports = app;
