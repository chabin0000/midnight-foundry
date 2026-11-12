import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function serve(root = resolve('.'), port = 4173) {
  root = resolve(root);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png' };
  const server = createServer(async (req, res) => {
    try {
      const raw = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let path = resolve(root, '.' + raw);
      if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
      if (raw.split('/').some(p => p.startsWith('.') && p !== '.')) { res.writeHead(403).end('Forbidden'); return; }
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      const data = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
  });
  return server.listen(port, '127.0.0.1', () => console.log(`Foundry: http://127.0.0.1:${server.address().port}`));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) serve(process.argv[2] || '.', Number(process.argv[3] || 4173));
