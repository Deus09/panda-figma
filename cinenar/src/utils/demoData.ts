// Demo veriler için localStorage service testi
import LocalStorageService from '../services/localStorage';

// Demo movie log'ları oluştur
export const createDemoData = () => {
  const demoMovies = [
    {
      title: 'The Matrix',
      date: '2024-01-15',
      rating: '9/10',
      review: 'Mükemmel bir bilim kurgu filmi! Görsel efektler ve hikaye muhteşem.',
      poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      type: 'watched' as const,
      mediaType: 'movie' as const,
      contentType: 'movie' as const,
      tmdbId: 603
    },
    {
      title: 'Inception',
      date: '2024-01-20',
      rating: '10/10',
      review: 'Nolan\'ın başyapıtı. Zihin büken bir hikaye ve mükemmel oyunculuk.',
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      type: 'watched' as const,
      mediaType: 'movie' as const,
      contentType: 'movie' as const,
      tmdbId: 27205
    },
    {
      title: 'Interstellar',
      date: '2024-02-01',
      rating: '9.5/10',
      review: 'Hem duygusal hem bilimsel olarak etkileyici. Hans Zimmer\'ın müzikleri harika.',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      type: 'watched' as const,
      mediaType: 'movie' as const,
      contentType: 'movie' as const,
      tmdbId: 157336
    },
    {
      title: 'Dune: Part Two',
      date: '',
      rating: '',
      review: 'İzlemek için sabırsızlanıyorum!',
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      type: 'watchlist' as const,
      mediaType: 'movie' as const,
      contentType: 'movie' as const,
      tmdbId: 693134
    },
    {
      title: 'Oppenheimer',
      date: '',
      rating: '',
      review: 'Christopher Nolan\'ın yeni filmi için çok heyecanlıyım.',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      type: 'watchlist' as const,
      mediaType: 'movie' as const,
      contentType: 'movie' as const,
      tmdbId: 872585
    }
  ];

  // Demo verileri localStorage'a kaydet
  demoMovies.forEach(movie => {
    LocalStorageService.saveMovieLog(movie);
  });

  // Demo kullanıcı tercihleri
  LocalStorageService.saveUserPreferences({
    favoriteGenres: ['Bilim Kurgu', 'Drama', 'Aksiyon'],
    darkMode: true,
    language: 'tr',
    defaultView: 'watched'
  });

  console.log('Demo veriler başarıyla oluşturuldu!');
};

// localStorage'daki mevcut verileri konsola yazdır
export const logStorageData = () => {
  console.log('=== CINENAR STORAGE DATA ===');
  console.log('Movie Logs:', LocalStorageService.getMovieLogs());
  console.log('User Preferences:', LocalStorageService.getUserPreferences());
  console.log('Last Active Tab:', LocalStorageService.getLastActiveTab());
  console.log('Storage Size:', LocalStorageService.getStorageSize());
  console.log('=================================');
};

// Tüm verileri temizle
export const clearAllData = () => {
  LocalStorageService.clearAllData();
  console.log('Tüm veriler temizlendi!');
};

export default {
  createDemoData,
  logStorageData,
  clearAllData
};
