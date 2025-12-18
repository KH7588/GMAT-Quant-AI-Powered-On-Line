const esbuild = require('esbuild');
const path = require('path');

// 執行既有的清理與 lint 腳本
// 注意：require 的路徑是相對於此檔案 (scripts/build.js)
require('./lint-exams.js');
require('../clean.js');
require('../copy-assets.js');

// 從系統環境變數中讀取 API Key
// 在 GitHub Actions 中，這會從 Repository Secrets 讀取
const apiKey = process.env.API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: 未偵測到 API_KEY 環境變數。部署後的網頁可能無法連線 AI。');
  console.warn('   若是本地開發，請確保您的環境變數已設定。');
  console.warn('   若是 GitHub Action，請確保 Repository Secrets 已設定 API_KEY。');
}

console.log('🚀 Starting Build with esbuild...');

esbuild.build({
  entryPoints: [path.join(__dirname, '../index.tsx')], // 使用絕對路徑以確保找到檔案
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,       // 壓縮程式碼以縮小體積
  sourcemap: true,    // 方便除錯
  outdir: 'dist',
  target: 'es2020',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  // 關鍵步驟：將程式碼中的 process.env.API_KEY 字串替換為實際的值
  define: {
    'process.env.API_KEY': JSON.stringify(apiKey),
  },
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch(() => {
  console.error('❌ Build failed.');
  process.exit(1);
});