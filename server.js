const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const safe = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const file = path.join(root, /^[/\\]$/.test(safe) ? 'index.html' : safe);
  if (!file.startsWith(root)) { res.writeHead(403, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache'}); res.end(data);
  });
}).listen(port, '0.0.0.0', () => console.log(`rightsflow listening on ${port}`));
