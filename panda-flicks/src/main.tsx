import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 🐛 DEBUG: Test verilerini oluştur
import { createTestSeriesEpisodeData, logCurrentStorageData } from './utils/debugTestData';
import { analyzeAllSeriesData, fixMissingTmdbIds, debugSpecificSeries } from './utils/globalSeriesAnalyzer';

// Development mode'da test verilerini oluştur
if (import.meta.env.DEV) {
  // Eğer localStorage'da Breaking Bad verileri yoksa test verilerini oluştur
  const existingData = localStorage.getItem('panda-flicks-movie-logs');
  if (!existingData || !existingData.includes('"seriesId":"1396"')) {
    console.log('🐛 DEBUG: Test verileri oluşturuluyor...');
    createTestSeriesEpisodeData();
  }
  
  // Tüm dizi verilerini analiz et
  console.log('🔍 GLOBAL ANALİZ başlatılıyor...');
  const { problemLogs } = analyzeAllSeriesData();
  
  // Mahsun J için özel debug
  const mahsunDebug = debugSpecificSeries('mahsun-j');
  console.log('🎬 Mahsun J debug sonuçları:', mahsunDebug);
  
  // Eksik tmdbId'leri düzelt
  if (problemLogs.length > 0) {
    console.log('🔧 tmdbId eksikliklerini düzeltiliyor...');
    fixMissingTmdbIds();
    console.log('✅ Düzeltme tamamlandı, sayfayı yenileyin.');
  }
  
  logCurrentStorageData();
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);