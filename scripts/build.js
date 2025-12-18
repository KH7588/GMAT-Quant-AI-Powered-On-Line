const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// 執行既有的清理與 lint 腳本
try {
  require('./lint-exams.js');
  require('../clean.js');
  require('../copy-assets.js');
  
  // Create .nojekyll to ensure GitHub Pages serves everything correctly
  fs.writeFileSync(path.join(__dirname, '../dist/.nojekyll'), '');
} catch (e) {
  console.error("Error running pre-build scripts:", e);
  process.exit(1);
}

// 從系統環境變數中讀取 API Key
const apiKey = process.env.API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: API_KEY not found in environment variables.');
}

console.log('🚀 Starting Build with esbuild...');

esbuild.build({
  entryPoints: [path.join(__dirname, '../index.tsx')],
  bundle: true,
  // Disable splitting for simpler build and to avoid issues with format matching
  splitting: false, 
  format: 'esm',
  minify: true,
  sourcemap: true,
  platform: 'browser', 
  outfile: 'dist/index.js', // Use outfile instead of outdir when splitting is false
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