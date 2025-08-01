// Breaking Bad test verilerini localStorage'dan temizleme
// Browser console'da çalıştırın:

(() => {
  const cleanBreakingBadData = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('cinenar-movie-logs') || '[]');
      console.log('🔍 Temizleme öncesi log sayısı:', logs.length);
      
      // Breaking Bad verilerini filtrele (seriesId: 1396)
      const filteredLogs = logs.filter(log => {
        const isBreakingBad = 
          log.seriesId === '1396' || 
          log.seriesId === 1396 ||
          (log.title && log.title.toLowerCase().includes('breaking bad')) ||
          (log.seriesTitle && log.seriesTitle.toLowerCase().includes('breaking bad'));
        
        if (isBreakingBad) {
          console.log('🗑️ Siliniyor:', log.title);
          return false;
        }
        return true;
      });
      
      // Temizlenmiş veriyi geri kaydet
      localStorage.setItem('cinenar-movie-logs', JSON.stringify(filteredLogs));
      
      console.log('✅ Breaking Bad verileri temizlendi');
      console.log('📊 Temizleme sonrası log sayısı:', filteredLogs.length);
      console.log('🔥 Silinen kayıt sayısı:', logs.length - filteredLogs.length);
      
      return {
        before: logs.length,
        after: filteredLogs.length,
        deleted: logs.length - filteredLogs.length
      };
    } catch (error) {
      console.error('❌ Temizleme hatası:', error);
    }
  };
  
  // Fonksiyonu çalıştır
  const result = cleanBreakingBadData();
  
  if (result && result.deleted > 0) {
    console.log('🔄 Sayfayı yenileyin...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
})();

console.log('Breaking Bad temizleme scripti çalıştırıldı!');
