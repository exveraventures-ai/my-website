#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');
const publicDir = path.join(process.cwd(), 'public');
const htaccessSource = path.join(publicDir, '.htaccess');
const htaccessDest = path.join(outDir, '.htaccess');

// Copy .htaccess to out directory if it exists in public
if (fs.existsSync(htaccessSource)) {
  fs.copyFileSync(htaccessSource, htaccessDest);
  console.log('✅ Copied .htaccess to out directory');
} else {
  console.log('⚠️  .htaccess not found in public directory');
}

// Create a simple index redirect check (optional)
console.log('✅ GoDaddy deployment files prepared!');
console.log('📁 Build output is in the "out" directory');
console.log('📤 Upload all contents of the "out" directory to your GoDaddy hosting');
