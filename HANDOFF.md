# KR Physiotherapy - Project Handout for AI Agents

## Project Overview
A physiotherapy clinic website for **KR Physiotherapy & Rehabilitation Clinic** in Noida, India. React frontend + Node.js/Express backend + MySQL database with JSON seed data fallback.

**Running at:** `http://localhost:5100`
**Admin panel:** `http://localhost:5100/admin` (login email `admin@krphysiotherapy.com`; the password comes from `ADMIN_PASSWORD` in `.env` — never commit it)

---

## Tech Stack
- **Frontend:** React 19 + Framer Motion + Tailwind CSS (CDN)
- **Backend:** Express 5 + MySQL2
- **Build:** esbuild (`npm run build:dev`)
- **DB:** MySQL with JSON seed data fallback (when DB is unreachable, server serves from `backend/database/seed-data/*.json`)
- **SSR:** Server-side renders HTML shells with `window.__INITIAL_DATA__` for React hydration

## Project Structure
```
kr-physiotherapy/
├── frontend/src/
│   ├── index.jsx              — React entry point (renders <App />)
│   ├── App.jsx                — Router: maps URL path → template component
│   ├── components/
│   │   ├── Navbar.jsx          — Site navigation (desktop + mobile drawer)
│   │   ├── Footer.jsx          — Site footer
│   │   ├── Cards.jsx           — ServiceCard, TreatmentCard, TestimonialCard, etc.
│   │   ├── AppointmentModal.jsx — Booking modal form
│   │   ├── motion-primitives.jsx — Framer Motion wrappers (Reveal, MotionSection, MotionButton, etc.)
│   │   └── DevTools.jsx        — Disabled (was Agentation overlay)
│   └── templates/
│       ├── AdminDashboard.jsx  — Full admin panel (935 lines, sidebar + CRUD)
│       ├── HomeAndAbout.jsx    — HomeTemplate + AboutTemplate
│       └── ClinicalTemplates.jsx — ServicesList, TreatmentsList, ServiceTemplate, TreatmentTemplate, DoctorTemplate, LocationTemplate, BlogList, BlogArticle, ContactTemplate, LegalTemplate
├── backend/
│   ├── src/
│   │   ├── app.js             — Express app, mounts routes, SSR middleware
│   │   ├── server.js          — Entry point
│   │   ├── config/db.js       — MySQL pool + JSON fallback query engine (313 lines)
│   │   ├── controllers/
│   │   │   ├── admin.controller.js  — Full admin CRUD (services, treatments, blogs, testimonials, settings, appointments, contacts)
│   │   │   └── api.controller.js    — Public API endpoints
│   │   ├── routes/
│   │   │   ├── admin.routes.js      — Admin API routes (22 routes)
│   │   │   └── api.routes.js        — Public API routes (15 routes)
│   │   ├── models/index.js          — 11 model objects with fallback query logic
│   │   ├── services/ssr.service.js  — Server-side HTML rendering
│   │   └── validators/form.validator.js
│   └── database/
│       ├── migrations/
│       │   ├── 001_create_tables.sql — 13 tables
│       │   └── migrate.js
│       └── seed-data/               — JSON seed data for all entities
├── public/                    — Static assets (images, old HTML pages)
├── scripts/build-client.js    — esbuild bundler
└── package.json
```

## URL Routing (App.jsx)
The React app reads `window.location.pathname` and renders the matching template:
- `/` → HomeTemplate
- `/about.html` → AboutTemplate
- `/services.html` → ServicesListTemplate
- `/treatments.html` → TreatmentsListTemplate
- `/contact.html` → ContactTemplate
- `/blogs/index.htm` → BlogListTemplate
- `/blogs/{slug}/` → BlogArticleTemplate
- `/doctor-{slug}.html` → DoctorTemplate
- `/*sector-*/` → LocationTemplate
- `*physiotherapy*` → ServiceTemplate
- `*-pain*`, `*therapy*`, `*palsy*`, `*scoliosis*` → TreatmentTemplate
- `/admin` → AdminDashboard

## Database Tables (13)
| Table | Key Columns |
|-------|-------------|
| `services` | id, slug, name, short_description, full_description_html, icon, banner_image, sort_order, status |
| `treatments` | id, slug, name, category, summary, symptoms_html, causes_html, treatment_html, banner_image, sort_order, status |
| `blogs` | id, slug, title, excerpt, content_html, featured_image, category_id, author_name, published_at, status |
| `testimonials` | id, patient_name, location, condition_treated, rating, testimonial_text, doctor_name, is_featured, sort_order |
| `appointments` | id, patient_name, phone, email, preferred_date, preferred_time, service_or_treatment, message, status, created_at |
| `contact_submissions` | id, name, email, phone, subject, message, status, created_at |
| `site_settings` | id, setting_key (UNIQUE), setting_value |
| `doctors` | id, slug, name, designation, qualification, experience_years, bio_html, photo_url, phone, email, sort_order, status |
| `pages` | id, slug, path (UNIQUE), title, subtitle, content_html, template, status |
| `seo_metadata` | id, entity_type, entity_id, path, meta_title, meta_description, etc. |
| `navigation_items` | id, menu_location, parent_id, title, url, sort_order |
| `blog_categories` | id, name, slug, description |
| `media` | id, original_path, local_url, alt_text, mime_type, file_size |

## Admin API Routes (26)
All prefixed with `/api/admin/` — **everything except `POST /login` requires a Bearer token** (enforced by `backend/src/middleware/adminAuth.js`):
- `POST /login` — Returns token
- `GET /stats` — Dashboard counts
- `GET|PATCH|DELETE /appointments` — Bookings CRUD (`GET` supports `?page&limit&search&status`)
- `GET|PATCH|DELETE /contacts` — Inquiries CRUD (`GET` supports `?page&limit&search&status`)
- `GET|POST|PUT|DELETE /services` — Services CRUD
- `GET|POST|PUT|DELETE /treatments` — Treatments CRUD
- `GET|POST|PUT|DELETE /blogs` — Blogs CRUD (`GET` supports `?page&limit&search&status`)
- `GET|POST|PUT|DELETE /testimonials` — Testimonials CRUD
- `GET|POST|PUT|DELETE /doctors` — Doctors CRUD
- `GET /site-settings`, `PUT /site-settings`, `PUT /site-settings/:key` — Settings

## Changes Made This Session

### 1. Removed Navbar Dropdowns
- **File:** `frontend/src/components/Navbar.jsx`
- Removed `SERVICES` constant, `TREATMENTS` constant, `DropdownItem` component, `DropdownPanel` component, `openMenu` state, `slugFromUrl` function, `SERVICE_ICONS`/`TREATMENT_ICONS` imports
- Replaced hover dropdown triggers with plain `<a>` links for Services and Treatments
- Mobile drawer unchanged (already had plain links)

### 2. Fixed Homepage Hero Not Rendering
- **File:** `frontend/src/templates/HomeAndAbout.jsx`
- **Root cause:** `data-reveal="fade"` and `data-img-reveal` attributes on divs triggered a CSS rule `[data-reveal] { opacity: 0; }` in the SSR HTML, hiding content permanently
- **Fix:** Removed all `data-reveal` and `data-img-reveal` attributes from HomeAndAbout.jsx (5 instances)

### 3. Fixed Console Errors
- **Floating attribute:** Removed `<div floating>` attributes from HomeAndAbout.jsx (2 instances) — React warned about non-boolean HTML attribute
- **Agentation DevTools:** Replaced `DevTools.jsx` with a no-op component (was trying to connect to localhost:4747 which doesn't exist)
- **favicon.ico 404:** Noted (minor, `images/favicon.png` exists but no `<link>` tag or `favicon.ico` file)

### 4. Fixed Blog Thumbnails
- **Root cause:** All 26 blog records in MySQL had `featured_image = '/blogs/wp-content/uploads/2022/04/cropped-logo-kr.jpeg'` (old WordPress logo)
- **Fix:** Created migration script that updated all 26 blogs to use correct images from `/images/blogs/` matching the seed data
- Also added `featured_image` field to the admin blog creation form

### 5. Complete Admin Panel Rebuild
- **File:** `frontend/src/templates/AdminDashboard.jsx` (rewritten, 935 lines)
- **Backend:** `backend/src/controllers/admin.controller.js` (rewritten with full CRUD)
- **Backend:** `backend/src/routes/admin.routes.js` (22 routes)
- **DB migration:** Added `status` column to `contact_submissions` table

**New admin features:**
- Sidebar navigation (dark sidebar #0b1c30)
- 9 pages: Dashboard, Bookings, Inquiries, Services, Treatments, Blogs, Testimonials, Doctors, Site Settings
- Full CRUD (Create, Read, Update, Delete) for all entities
- Create/edit modals with entity-specific forms
- Status badges (color-coded)
- Responsive (mobile hamburger toggle)
- Auto-logout on 401 (expired/invalid token)

## Changes Made This Session (Continuation)

### 1. Fixed Dashboard Stats 500 Error
- **File:** `backend/src/controllers/admin.controller.js`
- `getStats` destructured `query()` results as `[[row]]` (double), but `query()` resolves directly to rows → "object is not iterable". Fixed to `[row]`.
- Note: `query()` in `db.js` returns **rows directly** (not `[rows, fields]`). Use `const [row] = await query(...)` for single-row results.

### 2. Added Auth Middleware (Security Fix)
- **File:** `backend/src/middleware/adminAuth.js` (new)
- Previously **all admin API routes were publicly accessible** — the frontend sent a Bearer token but the backend never checked it.
- Now every `/api/admin/*` route except `POST /login` requires a valid `Authorization: Bearer <token>` header, else 401.
- Token is still a plain base64 string (not signed) — acceptable for this internal tool, but a JWT/real session should replace it before any public exposure.

### 3. Fixed Status Value Mismatch
- **Files:** `frontend/src/templates/AdminDashboard.jsx`
- Admin UI offered `active/inactive` for services/treatments, but the site + seed data + DB default use `published/draft`. Items saved as "active" would have **disappeared from the public site** (public queries filter `status = 'published'`).
- All status dropdowns now use `published/draft`.

### 4. Added Doctors CRUD
- **Backend:** `admin.controller.js` (getDoctors/createDoctor/updateDoctor/deleteDoctor), `admin.routes.js` (4 routes)
- **Frontend:** new "Doctors" page in AdminDashboard with full create/edit/delete modal

### 5. Admin Works Without MySQL (Fallback Mutations)
- **File:** `backend/src/config/db.js`
- `fallbackQuery()` previously only handled SELECTs (and 2 INSERTs), so admin create/edit/delete silently did nothing in fallback mode.
- Added in-memory UPDATE / DELETE / INSERT handling for services, treatments, blogs, testimonials, doctors, appointments, contact_submissions (mutations mutate the cached seed-data arrays in-process).
- Also added: pending-appointment count support (`WHERE status='Pending'`), doctors count support.

### 6. Frontend 401 Handling
- **File:** `frontend/src/templates/AdminDashboard.jsx`
- Added `jfetch()` wrapper: any 401 clears the stored token and returns the user to the login screen.

## Changes Made This Session (Admin UI Walkthrough)

### 7. Dedicated /admin HTML Shell (Important)
- **File:** `backend/src/services/ssr.service.js`
- Previously `/admin` rendered the full public site shell (fixed header, nav, hero skeleton, footer) before React hydration — site chrome flashed on the admin URL and a misleading content page showed if JS failed.
- Added `renderAdminShell()`: minimal dark shell, empty `#root`, `NOINDEX,NOFOLLOW`, own title/favicon. `renderHtmlForPath` short-circuits for `/admin` and `/admin/`.

### 8. Modal Auto-Close Race Fixed
- **File:** `frontend/src/templates/AdminDashboard.jsx`
- Save success closed the modal via a bare `setTimeout(800ms)`; opening another modal within that window got closed by the stale timer. Now tracked in `modalTimerRef`, cleared on unmount and whenever a modal is opened.

### 9. Settings Page Loading/Empty States
- Added `settingsLoading` state; the page previously showed "Loading settings..." forever if the fetch failed. Now distinguishes loading vs. genuinely empty.

### 10. Booking Date Off-By-One Fixed
- Added `formatBookingDate()`: `YYYY-MM-DD` strings are parsed as local calendar dates (plain `new Date()` treats them as UTC midnight → displayed one day early in negative-UTC-offset timezones, e.g. IST evenings).

### 11. Favicon Added
- `public/images/favicon.png` existed but was never linked → console 404 on every page. `<link rel="icon">` added to both the public SSR head and the admin shell.

### 12. Unread Badge Color
- Fallback-mode contact inserts used status `Unread`, which the UI's `statusColors` didn't know (rendered unstyled). Added `Unread: bg-blue-100 text-blue-800`.

### 13. Pagination + Search for Bookings, Inquiries, Blogs
- **Backend (`admin.controller.js`):** `GET /appointments`, `/contacts`, `/blogs` accept `?page=&limit=&search=&status=` (limit capped at 100, default 20; UI uses 10). MySQL path filters via `WHERE ... LIKE` + `LIMIT/OFFSET`; fallback path filters/paginates the in-memory arrays via `paginateArray()`. Responses now include `pagination: { page, limit, total, totalPages }` (via `listResponse()` helper).
- **db.js:** fallback `SELECT * FROM blogs` branch now returns ALL statuses (incl. drafts, for the admin list), honors LIMIT/OFFSET params, and sorts by `published_at` desc. Added `getDbMode()` ('mysql' | 'fallback' | 'unknown').
- **server.js:** startup DB ping now goes through `query()` (not `pool.query()` directly) so `dbMode` is set at boot — otherwise the first request took the wrong code path.
- **Frontend (`AdminDashboard.jsx`):** per-list `listState` (search text, status filter, page) with a 300ms-debounced `fetchList()`; `loadData()` now fetches only stats + non-paginated entities, and delete/status-change/save handlers refetch the affected list so server-filtered views stay accurate. UI: search box + status dropdown + Clear button above each list, Prev/Next pagination footer with "Page X of Y · N total".
- **Gotcha:** `query()` returns rows directly — destructure `const [row] = ...`, never `[[row]]` (this bit twice: getStats, then pagination counts).

### 14. Health Endpoint + Accurate DB Startup Log
- **Problem:** `server.js` printed "Database connection verified." unconditionally, because `query()` swallows connection errors and falls back to JSON seed data — the log could claim success while the app was actually running on the fallback dataset. There was also no `/api/health` route at all: requests to it fell through to the SSR catch-all and returned a full HTML page with HTTP **200**, so uptime monitors got a false positive.
- **`backend/src/config/db.js`:** added `checkDatabase()` — a probe that does NOT fall back, returning `{ connected, mode, reason, database, version, latencyMs, target, content }`. `content` holds row counts (services/treatments/blogs/pages) so you can distinguish "connected but schema missing/empty" from "connected and seeded".
- **`backend/src/controllers/api.controller.js` + `api.routes.js`:** new public `GET /api/health` (JSON). Always returns 200 because the site is designed to keep serving from JSON when MySQL is down — inspect `status` (`ok` | `degraded`) and `database.connected` to alert.
- **`backend/src/server.js`:** boot now logs the real result, e.g. `[DB] MySQL connected — krphysio_user@127.0.0.1:3306/krphysiotherapy (11.8.3-MariaDB) in 17ms`.
- **`Dockerfile` (since removed — see §15):** its `HEALTHCHECK` hit `/api/admin/stats`, which requires a Bearer token → always **401** → `curl -f` fails → the container was permanently marked unhealthy. That bug went unnoticed because the Docker path was never actually run.

### 15. Removed the Unused Docker Deployment Path
- Deleted `Dockerfile` and `docker-compose.yml`. They were scaffolded in the initial commit (`3aef817`) as an "Option 1 (Recommended)" one-click deployment, but the project actually ships on **Vercel** (`56552ae` added `vercel.json` + `api/index.js`, and the JSON-fallback DB layer exists because of serverless).
- Nothing depended on them: no `package.json` script, no CI config, no runtime import, and no build step reads them. The compose file also mapped `3306:3306`, which collides with the local MariaDB.
- **Kept:** `ecosystem.config.js` + `nginx/krphysiotherapy.conf` (valid for the VPS/PM2 self-host path, now Option 1 in `DEPLOYMENT_GUIDE.md`) and `backend/database/production_dump.sql` (also imported directly by that path).

### 16. Admin Auth Hardened (CRITICAL — the live admin API was wide open)
- **The bug:** `backend/src/middleware/adminAuth.js` was **untracked**, so it was never deployed; the committed `admin.routes.js` therefore had **no guard at all** and every `/api/admin/*` endpoint answered **HTTP 200 with no token** on the live Vercel deployment (verified against production). The local guard was also a stub that accepted *any* non-empty bearer token, and `login` issued an unsigned `base64(email:timestamp)` that was never verified.
- **Fix:** new `backend/src/services/token.service.js` issues **HMAC-SHA256 signed, 12h-expiring** tokens using Node's built-in `crypto` (no new dependency). `adminAuth` verifies signature + expiry and **fails closed**. `admin.controller.js` reads credentials per-request, compares them **timing-safely**, no longer hardcodes `'the-old-password'` as a fallback, and returns **503** when `ADMIN_PASSWORD` is unset rather than accepting a public default.
- **Env:** `ADMIN_TOKEN_SECRET` is new (`.env` + `.env.example`); `ADMIN_PASSWORD` was rotated.
- **Verify:** `node scripts/test-admin-auth.js` — 13 assertions; unauthenticated, forged, tampered and expired tokens must all return **401**.

## Important Notes for Future Agents
1. **DB fallback system:** `backend/src/config/db.js` has a `fallbackQuery()` function that serves JSON seed data when MySQL is unreachable. This means the site works WITHOUT a database. The fallback handles SELECT queries for all tables and INSERT for appointments/contacts.
2. **Build required:** After editing any file in `frontend/src/`, run `npm run build:dev` and restart the server to see changes.
3. **Server restart:** Kill all node processes, then `Start-Process -NoNewWindow -FilePath "node" -ArgumentList "backend/src/server.js"`
4. **Tailwind is CDN-loaded** in the HTML — not a build step. All Tailwind classes work immediately.
5. **Material Symbols** font is loaded via Google Fonts link in the HTML. Use `className="material-symbols-outlined"` with icon name as text content.
6. **Framer Motion** is used for animations. Key components: `MotionSection` (scroll-reveal), `MotionButton` (hover/tap), `Reveal` (scroll-triggered), `Stagger` (orchestrated children).
7. **The `__INITIAL_DATA__`** object in each HTML page contains `path`, `entityType`, `seo`, and `content` — React hydrates from this.
8. **Status conventions:** content entities use `published`/`draft`; appointments use `Pending`/`Confirmed`/`Completed`/`Cancelled`; contact submissions use `New`/`Read`/`Replied`/`Archived`. The public site filters content entities on `status = 'published'`.
9. **Status value conventions:** `backend/src/config/db.js` `query()` returns rows directly (not `[rows, fields]`) — destructure once. Fallback mode now supports admin mutations (in-memory, lost on restart) as well as reads.
10. **Windows background server:** `nohup node backend/src/server.js > server.log 2>&1 &` works in Git Bash; `tasklist | grep -i node` and `netstat -ano | grep :5100` to check it's running. Restart with: find PID via `netstat -ano | grep ":5100" | grep LISTENING`, `taskkill //F //PID <pid>`, then nohup again.
11. **SSR shells:** `/admin` uses the minimal `renderAdminShell()` in `ssr.service.js` — public site pages use the full shell with SEO tags. Both share `/js/bundle.js`.
12. **No Chrome available** in this dev environment — UI verification is done by curl-inspecting the SSR shell and tracing component code against live API responses.
13. **Checking DB status:** `GET /api/health` reports the live database mode (`ok`/`degraded`, plus database/version/row counts). Use `checkDatabase()` from `db.js` — **never** `query()` — to decide whether MySQL is up, because `query()` never throws (it silently falls back to JSON seed data).
14. **Local DB credentials:** the real local `krphysio_user` password lives in `.env` (`DB_PASSWORD`) and must never be committed — `.env.example` carries a placeholder only. Local MariaDB is 11.8.3 on port 3306, and `.env*` is gitignored.
15. **Stray nested repo — REMOVED:** `kr-physiotherapy/kr-physiotherapy/` (an accidental nested clone containing only `.git` + `.gitattributes`) was deleted during the repo re-init, because an unignored embedded repo makes `git add .` record a broken gitlink.
16. **Admin auth files MUST be committed:** `backend/src/middleware/adminAuth.js` and `backend/src/services/token.service.js` guard the entire admin API. `adminAuth.js` was once left untracked, which is exactly what left the live admin API open — always confirm they are staged (`git ls-files`) before deploying.
17. **`ADMIN_PASSWORD` is required:** admin login returns **503** when it is unset (there is deliberately no hardcoded fallback). Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_TOKEN_SECRET` in the Vercel project env before deploying.
