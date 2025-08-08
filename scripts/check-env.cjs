#!/usr/bin/env node
/*
 * Simple environment validation before build.
 * Ensures TMDB API key exists and is not a known placeholder.
 */

const fs = require('fs');
const path = require('path');

const INVALID = new Set(['', 'your_tmdb_api_key_here', 'your-api-key-here', 'YOUR_TMDB_KEY_HERE']);

function loadDotEnv() {
  const dotenvPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(dotenvPath)) {
    console.error('\n[ENV CHECK] .env dosyası bulunamadı. env.example dosyasını kopyalayın:');
    console.error('cp env.example .env');
    process.exit(1);
  }
  const content = fs.readFileSync(dotenvPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    map[key] = val;
  }
  return map;
}

try {
  const envMap = loadDotEnv();
  const key = envMap.VITE_TMDB_API_KEY || '';
  if (INVALID.has(key)) {
    console.error('\n[ENV CHECK] Geçersiz veya placeholder TMDB anahtarı. Lütfen .env dosyanızı düzenleyin.');
    console.error('VITE_TMDB_API_KEY=<gerçek_tmdb_api_key>');
    process.exit(2);
  }
  console.log('[ENV CHECK] TMDB API anahtarı bulundu.');
} catch (err) {
  console.error('[ENV CHECK] Hata:', err.message);
  process.exit(1);
}
