const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// --- Configuration ---
const DIST_DIR = path.join(__dirname, '../dist');
const SRC_HTML = path.join(__dirname, '../index.html');
const DEST_HTML = path.join(DIST_DIR, 'index.html');
const ENTRY_POINT = path.join(__dirname, '../index.tsx');

console.log('🚀 Starting Robust Build Process...');

// 1. Clean /dist directory
try {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('🧹 Cleaned dist directory.');
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
} catch (e) {
  console.error('❌ Failed to clean/create dist directory:', e);
  process.exit(1);
}

// 2. Copy index.html
try {
  fs.copyFileSync(SRC_HTML, DEST_HTML);
  // Create .nojekyll for GitHub Pages
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('📄 Copied index.html and created .nojekyll.');
} catch (e) {
  console.error('❌ Failed to copy assets:', e);
  process.exit(1);
}

// 3. API Key setup
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.warn('⚠️ WARNING: API_KEY not found in environment variables.');
}

// 4. Run esbuild
console.log('📦 Bundling with esbuild...');

esbuild.build({
  entryPoints: [ENTRY_POINT],
  bundle: true,
  splitting: false, // Keep it simple: one file
  format: 'esm',
  minify: true,
  sourcemap: true, // Helpful for debugging if needed
  platform: 'browser',
  outfile: path.join(DIST_DIR, 'index.js'),
  target: ['es2020'],
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: {
    'process.env.API_KEY': JSON.stringify(apiKey),
  },
  logLevel: 'info',
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch((e) => {
  console.error('❌ Build failed:', e);
  process.exit(1);
});