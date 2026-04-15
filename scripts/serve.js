/**
 * Combined server for web preview:
 *  - Port 8082: static file server for app/dist/
 *  - Port 8083: CORS proxy for Anthropic API
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const STATIC_PORT = 8082;
const PROXY_PORT = 8083;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
};

// Static file server
const staticServer = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  // Strip query strings
  filePath = filePath.split('?')[0];
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';
  res.setHeader('Content-Type', mime);
  fs.createReadStream(filePath).pipe(res);
});
staticServer.on('error', (e) => console.error('Static server error:', e.message));
staticServer.listen(STATIC_PORT, () => console.log(`Static → http://localhost:${STATIC_PORT}`));

// CORS proxy
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
};

const proxyServer = http.createServer((req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST' || req.url !== '/v1/messages') {
    res.writeHead(404); res.end('Not found'); return;
  }
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const proxyReq = https.request({
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': body.length,
      },
    }, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
      });
      proxyRes.on('data', chunk => res.write(chunk));
      proxyRes.on('end', () => res.end());
    });
    proxyReq.on('error', err => {
      if (!res.headersSent) res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });
    proxyReq.write(body);
    proxyReq.end();
  });
});
proxyServer.on('error', (e) => console.error('Proxy server error:', e.message));
proxyServer.listen(PROXY_PORT, () => console.log(`Proxy   → http://localhost:${PROXY_PORT}`));
