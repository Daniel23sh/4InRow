const http = require('http');
const url  = require('url');
const api  = require('./api.js');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') 
    { res.writeHead(204); 
        res.end(); 
        return; 
    }

  try {
    const parsed   = url.parse(req.url, true);
    const pathname = parsed.pathname || '/';
    const q = parsed.query || {};

    // ---- API routes ----
    if (pathname === '/api/board' && req.method === 'GET'){
        api.getBoard(req, res, q); 
        return; 
    }
    if (pathname === '/api/reset' && req.method === 'POST'){
        api.resetBoard(req, res, q);
        return;
    }
    if (pathname === '/api/move'  && req.method === 'POST'){
        api.dropDisc(req, res, q);
        return;
    }
 

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    console.error('error', err);
  }
    
}).listen(3000, '0.0.0.0', ()=>{console.log("now server is listening on port 3000 on all interfaces...");});


