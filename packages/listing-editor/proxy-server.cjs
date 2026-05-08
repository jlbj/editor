const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 5173;

// Start Vite as subprocess
const vite = spawn('node', [path.join(__dirname, 'node_modules/vite/bin/vite.js'), '--host', '--port', '5174'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe']
});

let viteReady = false;

vite.stdout.on('data', (data) => {
  console.log('[Vite]', data.toString());
  if (data.toString().includes('ready')) {
    viteReady = true;
  }
});

vite.stderr.on('data', (data) => {
  console.log('[Vite Error]', data.toString());
});

// Proxy server
const server = http.createServer((req, res) => {
  if (!viteReady) {
    res.writeHead(503);
    res.end('Vite not ready yet');
    return;
  }
  
  const options = {
    hostname: '127.0.0.1',
    port: 5174,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxy, { end: true });
  proxy.on('error', (e) => {
    res.writeHead(502);
    res.end('Proxy error: ' + e.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=== Proxy server running at http://0.0.0.0:${PORT}/ ===`);
  console.log(`Vite dev server running at http://127.0.0.1:5174`);
});

process.on('exit', () => vite.kill());