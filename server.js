const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
const server = http.createServer((req,res)=>{
  let pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  if(pathname === '/') pathname='/index.html';
  const safePath = path.normalize(pathname).replace(/^([.][.][\/])+/, '');
  const filePath = path.join(root, safePath);
  if(!filePath.startsWith(root)){ res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(filePath,(err,stat)=>{
    if(err || !stat.isFile()){ res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); return res.end('404 — Page not found'); }
    res.writeHead(200,{'Content-Type':types[path.extname(filePath).toLowerCase()] || 'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(filePath).pipe(res);
  });
});
server.listen(port,'0.0.0.0',()=>console.log(`adandra concept running at http://localhost:${port}`));
