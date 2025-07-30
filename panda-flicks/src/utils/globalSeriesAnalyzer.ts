// Mevcut localStorage verilerini analiz etme aracı
import { LocalStorageService } from '../services/localStorage';

export const analyzeAllSeriesData = () => {
  console.log('🔍 ===== GLOBAL SERİ ANALİZİ =====');
  
  const allLogs = LocalStorageService.getMovieLogs();
  const seriesLogs = allLogs.filter(log => log.contentType === 'tv' || log.mediaType === 'tv');
  
  console.log('📊 Toplam log sayısı:', allLogs.length);
  console.log('📺 Toplam dizi log sayısı:', seriesLogs.length);
  
  // Dizi ID'lerine göre grupla
  const seriesGroups = seriesLogs.reduce((acc, log) => {
    const seriesId = log.seriesId || 'undefined';
    if (!acc[seriesId]) acc[seriesId] = [];
    acc[seriesId].push(log);
    return acc;
  }, {} as Record<string, any[]>);
  
  console.log('🎭 Bulunan dizi grupları:');
  Object.entries(seriesGroups).forEach(([seriesId, logs]) => {
    console.log(`\n📽️ SeriesID: ${seriesId} (${logs.length} bölüm)`);
    console.log(`   Dizi Adı: ${logs[0]?.seriesTitle || 'Bilinmiyor'}`);
    
    // İlk 3 bölümün tmdbId formatını kontrol et
    logs.slice(0, 3).forEach((log, index) => {
      console.log(`   📋 Bölüm ${index + 1}:`, {
        id: log.id,
        title: log.title,
        tmdbId: log.tmdbId,
        tmdbIdType: typeof log.tmdbId,
        tmdbIdString: String(log.tmdbId),
        seriesId: log.seriesId,
        contentType: log.contentType,
        mediaType: log.mediaType
      });
    });
  });
  
  console.log('\n🚨 SORUN TESPİTİ:');
  const problemLogs = seriesLogs.filter(log => !log.tmdbId || log.tmdbId === null || log.tmdbId === undefined);
  console.log(`❌ tmdbId'si eksik olan bölümler: ${problemLogs.length}`);
  
  if (problemLogs.length > 0) {
    console.log('🔴 Problematik bölümler:');
    problemLogs.forEach(log => {
      console.log(`   - ${log.title} (ID: ${log.id}) - tmdbId: ${log.tmdbId}`);
    });
  }
  
  console.log('===============================');
  return { seriesGroups, problemLogs };
};

export const fixMissingTmdbIds = () => {
  console.log('🔧 tmdbId eksikliklerini düzeltmeye çalışıyor...');
  
  const allLogs = LocalStorageService.getMovieLogs();
  let fixedCount = 0;
  
  allLogs.forEach(log => {
    // Eğer tmdbId eksikse ve bu bir dizi bölümüyse
    if ((!log.tmdbId || log.tmdbId === null) && (log.contentType === 'tv' || log.mediaType === 'tv')) {
      console.log(`⚠️ tmdbId eksik: ${log.title}`);
      
      // Geçici çözüm: Log ID'sinden tmdbId oluştur (gerçek projelerde TMDB API'dan alınmalı)
      const tempTmdbId = parseInt(log.id.slice(-6), 36) + 100000; // Geçici ID
      
      const updated = LocalStorageService.updateMovieLog(log.id, {
        tmdbId: tempTmdbId
      });
      
      if (updated) {
        fixedCount++;
        console.log(`✅ Düzeltildi: ${log.title} -> tmdbId: ${tempTmdbId}`);
      }
    }
  });
  
  console.log(`🎯 ${fixedCount} adet bölümün tmdbId'si düzeltildi.`);
  return fixedCount;
};

export const debugSpecificSeries = (seriesId: string) => {
  const allLogs = LocalStorageService.getMovieLogs();
  
  console.log('🔍 SPESİFİK SERİ ANALİZİ:', seriesId);
  console.log('📊 Tüm TV Kayıtları:', allLogs.filter(log => 
    log.contentType === 'tv' || log.mediaType === 'tv'
  ));
  
  // SeriesId ile eşleşen kayıtlar
  const exactMatches = allLogs.filter(log => String(log.seriesId) === seriesId);
  console.log('✅ Tam Eşleşen Kayıtlar:', exactMatches);
  
  // Benzer seriesId'ler (case-insensitive)
  const similarMatches = allLogs.filter(log => 
    log.seriesId && String(log.seriesId).toLowerCase().includes(seriesId.toLowerCase())
  );
  console.log('🔄 Benzer Eşleşmeler:', similarMatches);
  
  // Title'da "Mahsun" geçen kayıtlar
  const titleMatches = allLogs.filter(log => 
    log.title && log.title.toLowerCase().includes('mahsun')
  );
  console.log('📝 Title Eşleşmeleri:', titleMatches);
  
  // Tüm series ID'leri göster
  const allSeriesIds = [...new Set(allLogs.map(log => log.seriesId).filter(Boolean))];
  console.log('🆔 Tüm SeriesId değerleri:', allSeriesIds);
  
  return { exactMatches, similarMatches, titleMatches, allSeriesIds };
};
