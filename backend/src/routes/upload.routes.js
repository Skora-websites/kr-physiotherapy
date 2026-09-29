const express = require('express');
const fs = require('fs');
const path = require('path');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// ─── Minimal multipart/form-data parser (no external deps) ─────────────
// Returns { fields: {name: value}, files: {name: {filename, mimeType, buffer}} }
function parseMultipart(req, boundary) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => {
      chunks.push(c);
      // 60 MB safety cap (videos are big; anything larger should be a link)
      if (chunks.reduce((n, b) => n + b.length, 0) > 60 * 1024 * 1024) {
        reject(new Error('Payload too large (max 60MB)'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const delim = Buffer.from(`--${boundary}`);
        const fields = {};
        const files = {};

        let pos = body.indexOf(delim);
        while (pos !== -1) {
          const next = body.indexOf(delim, pos + delim.length);
          if (next === -1) break;
          // part content sits between the CRLF after the boundary line and the CRLF before the next boundary
          let part = body.slice(pos + delim.length, next);
          // strip leading CRLF
          if (part[0] === 13 && part[1] === 10) part = part.slice(2);
          // strip trailing CRLF
          if (part[part.length - 2] === 13 && part[part.length - 1] === 10) part = part.slice(0, -2);

          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const headerBlock = part.slice(0, headerEnd).toString('utf8');
            const content = part.slice(headerEnd + 4);
            const nameMatch = headerBlock.match(/name="([^"]*)"/i);
            const fileMatch = headerBlock.match(/filename="([^"]*)"/i);
            const typeMatch = headerBlock.match(/content-type:\s*([^\r\n]+)/i);
            const fieldName = nameMatch ? nameMatch[1] : '';

            if (fileMatch && fileMatch[1]) {
              files[fieldName] = {
                filename: fileMatch[1],
                mimeType: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
                buffer: content
              };
            } else if (fieldName) {
              fields[fieldName] = content.toString('utf8');
            }
          }
          pos = next;
        }
        resolve({ fields, files });
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

function sanitizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-80); // keep tail (extension matters)
}

// ─── POST /api/admin/upload  (multipart: file, [kind=video|image]) ──────
router.post('/upload', adminAuth, async (req, res, next) => {
  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!contentType.includes('multipart/form-data') || !boundaryMatch) {
      return res.status(400).json({ success: false, message: 'Expected multipart/form-data' });
    }
    const boundary = (boundaryMatch[1] || boundaryMatch[2]).trim();

    const { fields, files } = await parseMultipart(req, boundary);
    const kind = (fields.kind || 'video').toLowerCase();

    const file = files.file;
    if (!file || !file.buffer || !file.buffer.length) {
      return res.status(400).json({ success: false, message: 'No file received (field name must be "file")' });
    }

    const isVideo = kind === 'video';
    const extOk = isVideo ? VIDEO_EXT.test(file.filename) : IMAGE_EXT.test(file.filename);
    if (!extOk) {
      return res.status(400).json({
        success: false,
        message: isVideo
          ? 'Only .mp4, .webm, .mov, .m4v, .ogv video files are allowed'
          : 'Only .jpg, .jpeg, .png, .webp, .gif, .avif image files are allowed'
      });
    }
    // Accept by content-type too when the extension is missing entirely
    if (!isVideo && !IMAGE_EXT.test(file.filename) && !/^image\//.test(file.mimeType)) {
      return res.status(400).json({ success: false, message: 'File is not a recognised image' });
    }

    // Local dev / PM2: persist under backend/public so express.static serves it.
    // Vercel serverless: filesystem is ephemeral — write to /tmp (works for the
    // session; prefer video links in production, see admin hint).
    const onVercel = process.env.VERCEL === '1';
    const baseDir = onVercel
      ? '/tmp/kr-uploads'
      : path.resolve(__dirname, '../../public/uploads', isVideo ? 'videos' : 'images');
    fs.mkdirSync(baseDir, { recursive: true });

    const fname = `${Date.now()}-${sanitizeName(path.basename(file.filename))}`;
    const dest = path.join(baseDir, fname);
    fs.writeFileSync(dest, file.buffer);

    const publicUrl = onVercel
      ? `/api/admin/uploads/${isVideo ? 'videos' : 'images'}/${fname}`
      : `/uploads/${isVideo ? 'videos' : 'images'}/${fname}`;

    res.status(201).json({ success: true, url: publicUrl, size: file.buffer.length, mimeType: file.mimeType });
  } catch (err) {
    if (err.message && err.message.startsWith('Payload too large')) {
      return res.status(413).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// Vercel-only: serve files written to /tmp/kr-uploads during this lambda's life
router.get('/uploads/:kind/:file', (req, res) => {
  if (process.env.VERCEL !== '1') return res.status(404).end();
  const { kind, file } = req.params;
  if (!['videos', 'images'].includes(kind) || /[\/\\]|\.\./.test(file)) return res.status(400).end();
  const p = path.join('/tmp/kr-uploads', kind, file);
  if (!fs.existsSync(p)) return res.status(404).end();
  const ext = path.extname(file).toLowerCase();
  const mimes = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/x-m4v', '.ogv': 'video/ogg', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
  res.setHeader('Content-Type', mimes[ext] || 'application/octet-stream');
  fs.createReadStream(p).pipe(res);
});

module.exports = router;
