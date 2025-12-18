const fs = require('fs');
const path = require('path');
const distDir = path.join(__dirname, 'dist');
const srcHtml = path.join(__dirname, 'index.html');
const destHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
try {
  fs.copyFileSync(srcHtml, destHtml);
  console.log('Successfully copied index.html to dist/');
} catch (err) {
  console.error('Error copying index.html:', err);
  process.exit(1);
}
