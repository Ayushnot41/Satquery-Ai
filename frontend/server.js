/**
 * BhuVision / SatQuery Frontend Development Server
 * Listens on port 3000 (http://localhost:3000)
 * Serves the BhuVision Mission Cockpit SPA and reverse-proxies /api/* to FastAPI on port 8000.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '8000', 10);
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');
const PREVIEW_HTML = path.join(ROOT_DIR, 'bhuvision_preview.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
};

function getCockpitHtml() {
  if (fs.existsSync(INDEX_HTML)) {
    return fs.readFileSync(INDEX_HTML, 'utf8');
  }
  if (fs.existsSync(PREVIEW_HTML)) {
    return fs.readFileSync(PREVIEW_HTML, 'utf8');
  }
  return '<h1>BhuVision Cockpit File Not Found</h1>';
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  // 1. API Reverse Proxy -> Forward to FastAPI (port 8000)
  if (pathname.startsWith('/api/') || pathname === '/api' || pathname.startsWith('/docs') || pathname.startsWith('/openapi.json')) {
    const proxyOptions = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`,
      },
    };

    const proxyReq = http.request(proxyOptions, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] ${req.method} ${req.url} -> ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend gateway connection failed', details: err.message }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // 2. Static file resolution
  const tryPaths = [
    path.join(__dirname, 'public', pathname),
    path.join(ROOT_DIR, pathname),
    path.join(ROOT_DIR, 'assets', pathname),
  ];

  for (const filePath of tryPaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 3. SPA Route Fallback -> Serve BhuVision Cockpit HTML
  const html = getCockpitHtml();
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  BHUVISION / SATQUERY AI COCKPIT LIVE ON PORT ${PORT}`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Network URL: http://0.0.0.0:${PORT}`);
  console.log(`  Backend API: http://${BACKEND_HOST}:${BACKEND_PORT}/api`);
  console.log(`=======================================================`);
});
