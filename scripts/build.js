const esbuild = require('esbuild');
const path = require('path');
require('./lint-exams.js');
require('../clean.js');
require('../copy-assets.js');
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.warn('⚠️ WARNING: 未偵測到 API_KEY 環境變數。部署後的網頁可能無法連線 AI。');
}
console.log('🚀 Starting Build with esbuild...');
esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  sourcemap: true,
  outdir: 'dist',
  target: 'es2020',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: {
    'process.env.API_KEY': JSON.stringify(apiKey),
  },
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch(() => {
  console.error('❌ Build failed.');
  process.exit(1);
});
