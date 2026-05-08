#!/usr/bin/env node

// Auto-restarting server wrapper
const { spawn } = require('child_process');
const path = require('path');

const SERVER_SCRIPT = path.join(__dirname, 'server.cjs');
const MAX_RESTARTS = 100;
const RESTART_DELAY = 1000;

let restarts = 0;
let child = null;

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting server... (restart #${restarts})`);
  
  child = spawn('node', [SERVER_SCRIPT], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });

  child.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Server exited with code ${code}, signal ${signal}`);
    
    if (restarts < MAX_RESTARTS && code !== 0) {
      restarts++;
      console.log(`[${new Date().toISOString()}] Restarting in ${RESTART_DELAY}ms...`);
      setTimeout(startServer, RESTART_DELAY);
    } else {
      console.log('Max restarts reached or clean exit, stopping.');
      process.exit(code || 0);
    }
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
}

console.log('=== Auto-restarting server wrapper ===');
startServer();

// Keep the wrapper process alive
setInterval(() => {}, 1000);