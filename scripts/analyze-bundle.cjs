#!/usr/bin/env node
/*
 * Bundle size analyzer - gzip/brotli analysis of dist files
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const TARGET_MAIN_GZIP = 250 * 1024; // 250 KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipSize = zlib.gzipSync(content).length;
  const brotliSize = zlib.brotliCompressSync ? zlib.brotliCompressSync(content).length : 0;
  
  return {
    raw: content.length,
    gzip: gzipSize,
    brotli: brotliSize
  };
}

function analyzeDist() {
  const distPath = path.join(process.cwd(), 'dist', 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist/assets dizini bulunamadı. Önce npm run build çalıştırın.');
    process.exit(1);
  }
  
  const files = fs.readdirSync(distPath)
    .filter(f => f.endsWith('.js') && !f.includes('legacy'))
    .sort();
  
  let mainFile = null;
  let totalGzip = 0;
  
  console.log('📦 Bundle Size Analysis');
  console.log('='.repeat(60));
  
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const sizes = analyzeFile(filePath);
    totalGzip += sizes.gzip;
    
    const isMain = file.startsWith('index-');
    if (isMain) mainFile = { file, sizes };
    
    const status = isMain && sizes.gzip > TARGET_MAIN_GZIP ? '❌' : '✅';
    console.log(`${status} ${file}`);
    console.log(`   Raw: ${formatBytes(sizes.raw)} | Gzip: ${formatBytes(sizes.gzip)}${sizes.brotli ? ` | Brotli: ${formatBytes(sizes.brotli)}` : ''}`);
  });
  
  console.log('='.repeat(60));
  
  if (mainFile) {
    const overLimit = mainFile.sizes.gzip - TARGET_MAIN_GZIP;
    console.log(`🎯 Main Chunk: ${formatBytes(mainFile.sizes.gzip)} (Target: ${formatBytes(TARGET_MAIN_GZIP)})`);
    if (overLimit > 0) {
      console.log(`⚠️  ${formatBytes(overLimit)} over limit!`);
      process.exit(1);
    } else {
      console.log('✅ Under target limit');
    }
  }
  
  console.log(`📊 Total JS Gzip: ${formatBytes(totalGzip)}`);
  console.log('\n💡 Open dist/bundle-analyzer.html for detailed breakdown');
}

try {
  analyzeDist();
} catch (err) {
  console.error('❌ Analysis failed:', err.message);
  process.exit(1);
}
