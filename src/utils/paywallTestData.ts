import { LocalStorageService } from '../services/localStorage';

// Test için 105 adet film oluştur (limit 100 olduğu için)
export const createPaywallTestData = () => {
  console.log('🎬 Paywall test verileri oluşturuluyor...');

  // Önce mevcut verileri temizle
  LocalStorageService.clearAllData();

  // 105 adet test filmi
  const testMovies = [
    // İlk 50 film
    { title: 'The Shawshank Redemption', tmdbId: 278 },
    { title: 'The Godfather', tmdbId: 238 },
    { title: 'The Dark Knight', tmdbId: 155 },
    { title: 'The Godfather Part II', tmdbId: 240 },
    { title: 'Pulp Fiction', tmdbId: 680 },
    { title: "Schindler's List", tmdbId: 424 },
    { title: 'The Lord of the Rings: The Return of the King', tmdbId: 122 },
    { title: '12 Angry Men', tmdbId: 389 },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', tmdbId: 120 },
    { title: 'The Good, the Bad and the Ugly', tmdbId: 429 },
    { title: 'Forrest Gump', tmdbId: 13 },
    { title: 'The Lord of the Rings: The Two Towers', tmdbId: 121 },
    { title: 'Fight Club', tmdbId: 550 },
    { title: 'Inception', tmdbId: 27205 },
    { title: 'Star Wars: Episode V - The Empire Strikes Back', tmdbId: 1891 },
    { title: 'The Matrix', tmdbId: 603 },
    { title: 'Goodfellas', tmdbId: 769 },
    { title: 'One Flew Over the Cuckoo\'s Nest', tmdbId: 510 },
    { title: 'Parasite', tmdbId: 496243 },
    { title: 'Seven Samurai', tmdbId: 346 },
    { title: 'Se7en', tmdbId: 807 },
    { title: 'The Silence of the Lambs', tmdbId: 274 },
    { title: 'City of God', tmdbId: 598 },
    { title: 'It\'s a Wonderful Life', tmdbId: 1585 },
    { title: 'Life Is Beautiful', tmdbId: 637 },
    { title: 'The Usual Suspects', tmdbId: 629 },
    { title: 'Léon: The Professional', tmdbId: 101 },
    { title: 'Spirited Away', tmdbId: 129 },
    { title: 'Saving Private Ryan', tmdbId: 857 },
    { title: 'Once Upon a Time in the West', tmdbId: 335 },
    { title: 'American History X', tmdbId: 73 },
    { title: 'Interstellar', tmdbId: 157336 },
    { title: 'Casablanca', tmdbId: 289 },
    { title: 'Psycho', tmdbId: 539 },
    { title: 'The Green Mile', tmdbId: 497 },
    { title: 'City Lights', tmdbId: 834 },
    { title: 'The Intouchables', tmdbId: 77338 },
    { title: 'Modern Times', tmdbId: 5751 },
    { title: 'Raiders of the Lost Ark', tmdbId: 85 },
    { title: 'Rear Window', tmdbId: 101 },
    { title: 'The Pianist', tmdbId: 423 },
    { title: 'The Departed', tmdbId: 1422 },
    { title: 'Terminator 2: Judgment Day', tmdbId: 280 },
    { title: 'Back to the Future', tmdbId: 105 },
    { title: 'Whiplash', tmdbId: 244786 },
    { title: 'Gladiator', tmdbId: 98 },
    { title: 'Memento', tmdbId: 77 },
    { title: 'The Prestige', tmdbId: 1124 },
    { title: 'Apocalypse Now', tmdbId: 28 },
    { title: 'Alien', tmdbId: 348 },
    
    // İkinci 50 film (51-100)
    { title: 'The Great Dictator', tmdbId: 914 },
    { title: 'The Lives of Others', tmdbId: 405 },
    { title: 'Sunset Boulevard', tmdbId: 599 },
    { title: 'Dr. Strangelove', tmdbId: 935 },
    { title: 'The Lion King', tmdbId: 8587 },
    { title: 'Paths of Glory', tmdbId: 352 },
    { title: 'Grave of the Fireflies', tmdbId: 12477 },
    { title: 'Django Unchained', tmdbId: 68718 },
    { title: 'The Shining', tmdbId: 694 },
    { title: 'WALL·E', tmdbId: 10681 },
    { title: 'American Beauty', tmdbId: 14 },
    { title: 'The Dark Knight Rises', tmdbId: 49026 },
    { title: 'Princess Mononoke', tmdbId: 128 },
    { title: 'Aliens', tmdbId: 679 },
    { title: 'Oldboy', tmdbId: 670 },
    { title: 'Once Upon a Time in America', tmdbId: 311 },
    { title: 'Witness for the Prosecution', tmdbId: 61 },
    { title: 'Das Boot', tmdbId: 641 },
    { title: 'Citizen Kane', tmdbId: 15 },
    { title: 'North by Northwest', tmdbId: 532 },
    { title: 'Vertigo', tmdbId: 110 },
    { title: 'Star Wars: Episode IV - A New Hope', tmdbId: 11 },
    { title: 'Reservoir Dogs', tmdbId: 500 },
    { title: 'Braveheart', tmdbId: 197 },
    { title: 'M', tmdbId: 1581 },
    { title: 'Requiem for a Dream', tmdbId: 872 },
    { title: 'Amélie', tmdbId: 194 },
    { title: 'A Clockwork Orange', tmdbId: 185 },
    { title: 'Like Stars on Earth', tmdbId: 457 },
    { title: 'Taxi Driver', tmdbId: 103 },
    { title: 'Lawrence of Arabia', tmdbId: 527 },
    { title: 'Double Indemnity', tmdbId: 1200 },
    { title: 'Eternal Sunshine of the Spotless Mind', tmdbId: 38 },
    { title: 'Amadeus', tmdbId: 240 },
    { title: 'To Kill a Mockingbird', tmdbId: 595 },
    { title: 'Toy Story 3', tmdbId: 10193 },
    { title: 'Logan', tmdbId: 263115 },
    { title: 'The Sting', tmdbId: 185 },
    { title: 'Full Metal Jacket', tmdbId: 813 },
    { title: '2001: A Space Odyssey', tmdbId: 62 },
    { title: 'Singin\' in the Rain', tmdbId: 872 },
    { title: 'Toy Story', tmdbId: 862 },
    { title: 'Bicycle Thieves', tmdbId: 710 },
    { title: 'The Kid', tmdbId: 12133 },
    { title: 'Inglourious Basterds', tmdbId: 16869 },
    { title: 'Snatch', tmdbId: 107 },
    { title: '3 Idiots', tmdbId: 20453 },
    { title: 'Monty Python and the Holy Grail', tmdbId: 31 },
    { title: 'Scarface', tmdbId: 111 },
    { title: 'L.A. Confidential', tmdbId: 111 },
    
    // Son 5 film (101-105) - Bunlar limiti aşacak
    { title: 'Avengers: Endgame', tmdbId: 299534 },
    { title: 'Spider-Man: Into the Spider-Verse', tmdbId: 324857 },
    { title: 'Your Name', tmdbId: 372058 },
    { title: 'Avengers: Infinity War', tmdbId: 299536 },
    { title: 'Coco', tmdbId: 354912 }
  ];

  // İlk 100 filmi izleme listesine ekle
  testMovies.slice(0, 100).forEach((movie, index) => {
    try {
      LocalStorageService.saveMovieLog({
        title: movie.title,
        date: new Date().toISOString().split('T')[0],
        rating: '',
        review: `Test film ${index + 1}`,
        poster: `https://image.tmdb.org/t/p/w500/test${index}.jpg`,
        type: 'watchlist',
        mediaType: 'movie',
        tmdbId: movie.tmdbId,
        contentType: 'movie',
        genres: ['Drama', 'Action'],
        releaseYear: 2020 + (index % 10)
      });
    } catch (error) {
      console.error(`Film ${index + 1} eklenirken hata:`, error);
    }
  });

  const watchlistCount = LocalStorageService.getWatchlistCount();
  console.log(`✅ ${watchlistCount} film izleme listesine eklendi`);
  console.log('📊 Test durumu:');
  console.log(`   - İzleme listesi sayısı: ${watchlistCount}`);
  console.log(`   - Limit: 100`);
  console.log(`   - Kullanıcı Pro mu: ${LocalStorageService.isUserPro()}`);
  console.log(`   - Yeni film eklenebilir mi: ${LocalStorageService.canAddToWatchlist().canAdd}`);
  
  // Son 5 filmi göster (bunlar paywall'ı tetiklemeli)
  console.log('🎯 Test için kullanılabilecek filmler (101-105):');
  testMovies.slice(100).forEach((movie, index) => {
    console.log(`   ${101 + index}. ${movie.title} (ID: ${movie.tmdbId})`);
  });
  
  console.log('\n📝 Test senaryosu:');
  console.log('1. Yukarıdaki filmlerden birini arayın');
  console.log('2. İzleme listesine eklemeye çalışın');
  console.log('3. Paywall modal\'ı açılmalı');
  console.log('4. Pro\'ya geçtikten sonra sınırsız ekleme yapabilmelisiniz');
};

// Pro durumunu test etmek için fonksiyonlar
export const testProSubscription = () => {
  console.log('💳 Pro aboneliğini test ediliyor...');
  
  const success = LocalStorageService.subscribeToProPlan('monthly');
  if (success) {
    console.log('✅ Pro aboneliği başarılı');
    console.log(`   - Pro durumu: ${LocalStorageService.isUserPro()}`);
    console.log(`   - Yeni film eklenebilir mi: ${LocalStorageService.canAddToWatchlist().canAdd}`);
    
    const proStatus = LocalStorageService.getProStatus();
    console.log('   - Pro bilgileri:', proStatus);
  } else {
    console.log('❌ Pro aboneliği başarısız');
  }
};

export const testFreeTrialStart = () => {
  console.log('🆓 Ücretsiz deneme başlatılıyor...');
  
  const success = LocalStorageService.startFreeTrial();
  if (success) {
    console.log('✅ Ücretsiz deneme başlatıldı');
    console.log(`   - Pro durumu: ${LocalStorageService.isUserPro()}`);
    console.log(`   - Deneme durumu: ${LocalStorageService.getProStatus().isInFreeTrial}`);
    console.log(`   - Yeni film eklenebilir mi: ${LocalStorageService.canAddToWatchlist().canAdd}`);
  } else {
    console.log('❌ Ücretsiz deneme başlatılamadı');
  }
};

export const clearTestData = () => {
  console.log('🗑️ Test verileri temizleniyor...');
  LocalStorageService.clearAllData();
  console.log('✅ Tüm veriler temizlendi');
};

export const showCurrentStatus = () => {
  const watchlistCount = LocalStorageService.getWatchlistCount();
  const isPro = LocalStorageService.isUserPro();
  const canAdd = LocalStorageService.canAddToWatchlist();
  const proStatus = LocalStorageService.getProStatus();
  
  console.log('📊 Mevcut durum:');
  console.log(`   - İzleme listesi sayısı: ${watchlistCount}`);
  console.log(`   - Kullanıcı Pro mu: ${isPro}`);
  console.log(`   - Yeni film eklenebilir mi: ${canAdd.canAdd}`);
  if (!canAdd.canAdd) {
    console.log(`   - Engelleme sebebi: ${canAdd.reason}`);
  }
  console.log('   - Pro durumu:', proStatus);
};

// Genel test fonksiyonu
export const runPaywallTests = () => {
  console.log('🧪 Paywall testleri başlatılıyor...\n');
  
  console.log('=== Test 1: Limit Kontrolü ===');
  createPaywallTestData();
  showCurrentStatus();
  
  console.log('\n=== Test 2: Pro Abonelik ===');
  testProSubscription();
  showCurrentStatus();
  
  console.log('\n=== Test 3: Verileri Temizle ve Ücretsiz Deneme ===');
  clearTestData();
  createPaywallTestData();
  testFreeTrialStart();
  showCurrentStatus();
  
  console.log('\n🎯 Testler tamamlandı! Manuel olarak aşağıdaki adımları takip edin:');
  console.log('1. Konsola `createPaywallTestData()` yazarak 100 film ekleyin');
  console.log('2. Herhangi bir filmi arayıp izleme listesine eklemeye çalışın');
  console.log('3. Paywall modal\'ının açıldığını kontrol edin');
  console.log('4. Paywall\'dan Pro\'ya geçin');
  console.log('5. Artık sınırsız film ekleyebildiğinizi kontrol edin');
};

// Global olarak kullanım için window'a ekle
if (typeof window !== 'undefined') {
  (window as any).paywallTests = {
    createPaywallTestData,
    testProSubscription,
    testFreeTrialStart,
    clearTestData,
    showCurrentStatus,
    runPaywallTests
  };
}
