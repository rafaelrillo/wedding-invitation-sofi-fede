const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript',
  '.json':'application/json', '.woff2':'font/woff2', '.woff':'font/woff', '.otf':'font/otf',
  '.webp':'image/webp', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.mp3':'audio/mpeg' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '/dos' || p === '/dos/' || p === '/fiesta' || p === '/fiesta/') p = '/index.html';   // rewrite como Vercel
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(8780, () => console.log('preview en http://localhost:8780'));
