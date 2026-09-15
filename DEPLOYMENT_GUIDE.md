# 🚀 Production Deployment Guide - KR Physiotherapy & Rehabilitation Clinic

This application is a modern full-stack web platform built with:
* **Frontend**: React 18, Tailwind CSS, GSAP 3 animations, 3D card tilts
* **Backend**: Node.js, Express.js 5, Server-Side SEO Generator (SSR)
* **Database**: MySQL 8.0+ / MariaDB 10.5+
* **Live Admin Portal**: `/admin` (Protected practice management)

---

## 📦 What's Included in the Deployment Package

* `backend/database/production_dump.sql`: Complete database dump (pages, clinical blogs, services, treatments, SEO metadata and settings).
* `ecosystem.config.js`: PM2 cluster process configuration for VPS deployments.
* `nginx/krphysiotherapy.conf`: Nginx reverse proxy, caching, and SSL configuration.

> **Note:** the live site is deployed to **Vercel** (`vercel.json` + `api/index.js`), which this guide does not cover.

---

## Option 1: Linux VPS Deployment (Ubuntu / Debian with PM2 & Nginx)

For Hostinger VPS, DigitalOcean Droplet, Linode, AWS EC2, or Hetzner:

### 1. Install Node.js, MySQL, and Nginx on Server
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx mysql-server

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Set Up MySQL Database
```bash
sudo mysql
```
Inside the MySQL shell:
```sql
CREATE DATABASE krphysiotherapy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'krphysio_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON krphysiotherapy.* TO 'krphysio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import the complete database dump:
```bash
mysql -u krphysio_user -p krphysiotherapy < backend/database/production_dump.sql
```

### 3. Deploy Application Code
```bash
cd /var/www/krphysiotherapy
npm ci --omit=dev

# Build client React bundle
node scripts/build-client.js

# Create production .env
cat << 'EOF' > .env
PORT=5100
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=krphysio_user
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=krphysiotherapy
ADMIN_EMAIL=admin@krphysiotherapy.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD
EOF

# Start with PM2 Process Manager
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Configure Nginx & SSL Certificate
```bash
sudo cp nginx/krphysiotherapy.conf /etc/nginx/sites-available/krphysiotherapy.conf
sudo ln -s /etc/nginx/sites-available/krphysiotherapy.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free SSL certificate with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d krphysiotherapy.com -d www.krphysiotherapy.com
```

---

## Option 2: Managed Cloud Hosting (Render / Railway / DigitalOcean App Platform)

1. **Database**: Create a managed MySQL database on Railway or Render.
2. **Import SQL**: Run the `backend/database/production_dump.sql` against the database connection URL.
3. **Web Service**:
   * Build Command: `npm install && node scripts/build-client.js`
   * Start Command: `node backend/src/server.js`
   * Set Environment Variables:
     * `NODE_ENV=production`
     * `DB_HOST=<db-host>`
     * `DB_USER=<db-user>`
     * `DB_PASSWORD=<db-password>`
     * `DB_NAME=krphysiotherapy`
     * `PORT=5100`

---

## Option 3: cPanel / Shared Hosting with Node.js Selector

1. In **cPanel**, go to **MySQL Databases** and create `krphysiotherapy`.
2. Open **phpMyAdmin**, click the database, and **Import** `backend/database/production_dump.sql`.
3. In **cPanel**, go to **Setup Node.js App**:
   * Application Root: `public_html` or subfolder
   * Application Startup File: `backend/src/server.js`
   * Node.js Version: `20.x`
4. Run `npm install` and run `node scripts/build-client.js`.
5. Add environment variables in the cPanel Node.js interface.
