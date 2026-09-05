import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(root, 'dist');
const port = Number(process.env.PORT || 3000);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ttf', 'font/ttf'],
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || '')) {
    return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') {
    const payload = JSON.stringify({ ok: true, service: 'propuesta-converge-group', version: 2 });
    return send(res, 200, req.method === 'HEAD' ? '' : payload, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const normalized = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(distRoot, normalized);
  if (!filePath.startsWith(distRoot)) return send(res, 403, 'Forbidden');

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('not-file');
  } catch {
    filePath = path.join(distRoot, 'index.html');
  }

  try {
    const body = await readFile(filePath);
    send(res, 200, req.method === 'HEAD' ? '' : body, {
      'Content-Type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
  } catch {
    send(res, 404, 'Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`propuesta-converge-group v2 listening on ${port}`);
});
