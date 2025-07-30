// Debug için test verisi oluşturma
import { LocalStorageService } from '../services/localStorage';

export const createTestSeriesEpisodeData = () => {
  // Breaking Bad (seriesId: 1396) için test bölüm verileri
  const testEpisodes = [
    {
      title: "Breaking Bad - S01E01 - Pilot",
      date: '2024-01-15',
      rating: '9/10',
      review: 'Serinin başlangıcı harika!',
      poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      type: 'watched' as const,
      mediaType: 'tv' as const,
      contentType: 'tv' as const,
      tmdbId: 62085, // TMDB episode ID
      seasonCount: 5,
      episodeCount: 62,
      runtime: 47,
      seriesId: '1396', // Breaking Bad series ID
      seriesTitle: 'Breaking Bad',
      seriesPoster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg'
    },
    {
      title: "Breaking Bad - S01E02 - Cat's in the Bag...",
      date: '2024-01-16',
      rating: '8/10',
      review: 'Gerilim artıyor!',
      poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      type: 'watched' as const,
      mediaType: 'tv' as const,
      contentType: 'tv' as const,
      tmdbId: 62086, // TMDB episode ID
      seasonCount: 5,
      episodeCount: 62,
      runtime: 47,
      seriesId: '1396',
      seriesTitle: 'Breaking Bad',
      seriesPoster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg'
    },
    {
      title: "Breaking Bad - S01E03 - ...And the Bag's in the River",
      date: '2024-01-17',
      rating: '9/10',
      review: 'Karakterler geliştiriliyor.',
      poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      type: 'watched' as const,
      mediaType: 'tv' as const,
      contentType: 'tv' as const,
      tmdbId: 62087, // TMDB episode ID
      seasonCount: 5,
      episodeCount: 62,
      runtime: 47,
      seriesId: '1396',
      seriesTitle: 'Breaking Bad',
      seriesPoster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg'
    }
  ];

  console.log('📝 Test bölüm verileri oluşturuluyor...');
  
  testEpisodes.forEach(episode => {
    const savedLog = LocalStorageService.saveMovieLog(episode);
    console.log('✅ Kaydedilen bölüm:', {
      id: savedLog.id,
      title: savedLog.title,
      tmdbId: savedLog.tmdbId,
      tmdbIdType: typeof savedLog.tmdbId,
      seriesId: savedLog.seriesId
    });
  });

  console.log('🎯 Test verileri başarıyla oluşturuldu!');
  console.log('🔗 Breaking Bad detay sayfasına gitmek için: /series/1396');
  
  return testEpisodes;
};

export const logCurrentStorageData = () => {
  const allLogs = LocalStorageService.getMovieLogs();
  const seriesLogs = allLogs.filter(log => log.contentType === 'tv' && log.seriesId === '1396');
  
  console.log('📊 MEVCUT LOCALSTORAGE VERİLERİ:');
  console.log('🎬 Toplam log sayısı:', allLogs.length);
  console.log('📺 Breaking Bad bölüm sayısı:', seriesLogs.length);
  console.log('🔍 Breaking Bad bölümleri:', seriesLogs.map(log => ({
    id: log.id,
    title: log.title,
    tmdbId: log.tmdbId,
    tmdbIdType: typeof log.tmdbId,
    seriesId: log.seriesId
  })));
  
  return seriesLogs;
};

export const clearTestData = () => {
  const allLogs = LocalStorageService.getMovieLogs();
  const testSeriesLogs = allLogs.filter(log => log.seriesId === '1396');
  
  testSeriesLogs.forEach(log => {
    LocalStorageService.deleteMovieLog(log.id);
  });
  
  console.log(`🗑️ ${testSeriesLogs.length} adet test verisi temizlendi.`);
};
