/**
 * Local CORS proxy for Anthropic API — web dev only.
 * Runs on port 8083, forwards POST /v1/messages to api.anthropic.com.
 * The API key is read from EXPO_PUBLIC_ANTHROPIC_API_KEY in ../.env.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const PORT = 8083;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
};

const server = http.createServer((req, res) => {
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
      const isStream = (proxyRes.headers['content-type'] || '').includes('event-stream');
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',       // disable nginx buffering if behind proxy
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

server.listen(PORT, () => console.log(`Anthropic proxy → http://localhost:${PORT}`));
