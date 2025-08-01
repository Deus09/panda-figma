# Cinenar - LocalStorage Entegrasyonu

Bu döküman, Cinenar uygulamasındaki localStorage entegrasyonunu açıklar.

## 🚀 Özellikler

### LocalStorage Servisi
- **Movie Logs**: Kullanıcının eklediği film/dizi logları kalıcı olarak saklanır
- **User Preferences**: Kullanıcı tercihleri (favori türler, tema, dil)
- **Session Data**: Son aktif tab bilgisi
- **Data Management**: Veri dışa/içe aktarma, temizleme

### Desteklenen Veri Türleri

#### MovieLog Interface
```typescript
interface MovieLog {
  id: string;
  title: string;
  date: string;
  rating: string;
  review: string;
  poster: string;
  type: 'watched' | 'watchlist';
  tmdbId?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### UserPreferences Interface
```typescript
interface UserPreferences {
  favoriteGenres: string[];
  darkMode: boolean;
  language: string;
  defaultView: 'watched' | 'watchlist';
}
```

## 📁 Dosya Yapısı

```
src/
├── services/
│   └── localStorage.ts          # Ana localStorage servisi
├── components/
│   ├── SettingsModal.tsx       # Kullanıcı ayarları modal'ı
│   ├── MovieCard.tsx           # Film kartı (düzenleme/silme)
│   └── FabAddButton.tsx        # Film ekleme butonu
├── pages/
│   └── home.tsx                # Ana sayfa (localStorage entegrasyonu)
└── utils/
    └── demoData.ts             # Demo veriler ve test fonksiyonları
```

## 🔧 Kullanım

### LocalStorage Servis Metodları

#### Movie Logs
```typescript
// Tüm logları getir
const logs = LocalStorageService.getMovieLogs();

// Yeni log ekle
const newLog = LocalStorageService.saveMovieLog({
  title: 'Film Adı',
  date: '2024-01-15',
  rating: '9/10',
  review: 'Harika bir film!',
  poster: 'poster-url',
  type: 'watched'
});

// Log güncelle
const updatedLog = LocalStorageService.updateMovieLog(logId, {
  rating: '10/10',
  review: 'Gözden geçirdim, mükemmel!'
});

// Log sil
const success = LocalStorageService.deleteMovieLog(logId);

// Tip bazında logları getir
const watchedMovies = LocalStorageService.getMovieLogsByType('watched');
```

#### User Preferences
```typescript
// Kullanıcı tercihlerini getir
const preferences = LocalStorageService.getUserPreferences();

// Tercihleri kaydet
LocalStorageService.saveUserPreferences({
  favoriteGenres: ['Aksiyon', 'Komedi'],
  darkMode: true,
  language: 'tr',
  defaultView: 'watched'
});
```

#### Data Management
```typescript
// Tüm verileri temizle
LocalStorageService.clearAllData();

// Storage boyutunu kontrol et
const size = LocalStorageService.getStorageSize();

// Verileri dışa aktar
const exportData = LocalStorageService.exportData();

// Verileri içe aktar
const success = LocalStorageService.importData(jsonString);
```

### Component Entegrasyonu

#### Home Component
Ana sayfa `home.tsx`'te localStorage entegrasyonu:

```typescript
// Component mount'ta verileri yükle
useEffect(() => {
  const savedLogs = LocalStorageService.getMovieLogs();
  setMovieLogs(savedLogs);
  
  const lastTab = LocalStorageService.getLastActiveTab();
  setActiveTab(lastTab);
}, []);

// Film ekleme
const handleAddMovieLog = (logData) => {
  const newLog = LocalStorageService.saveMovieLog(logData);
  setMovieLogs(prev => [...prev, newLog]);
};

// Film güncelleme
const handleUpdateMovieLog = (id, updates) => {
  const updatedLog = LocalStorageService.updateMovieLog(id, updates);
  if (updatedLog) {
    setMovieLogs(prev => prev.map(log => 
      log.id === id ? updatedLog : log
    ));
  }
};

// Film silme
const handleDeleteMovieLog = (id) => {
  const success = LocalStorageService.deleteMovieLog(id);
  if (success) {
    setMovieLogs(prev => prev.filter(log => log.id !== id));
  }
};
```

### Settings Modal
Kullanıcı ayarları için `SettingsModal.tsx`:

- Favori türler seçimi
- Tema ayarları
- Veri dışa/içe aktarma
- Storage bilgileri
- Veri temizleme

## 🧪 Test ve Demo

### Demo Veriler
Demo veriler oluşturmak için:

```typescript
import { createDemoData } from '../utils/demoData';

// 5 adet demo film log'u oluştur
createDemoData();
```

### Storage Verilerini Kontrol Etme
```typescript
import { logStorageData } from '../utils/demoData';

// Mevcut verileri konsola yazdır
logStorageData();
```

### Tüm Verileri Temizleme
```typescript
import { clearAllData } from '../utils/demoData';

// Tüm localStorage verilerini temizle
clearAllData();
```

## 💾 Storage Anahtarları

```typescript
const STORAGE_KEYS = {
  MOVIE_LOGS: 'cinenar-movie-logs',
  USER_PREFERENCES: 'cinenar-user-preferences',
  LAST_ACTIVE_TAB: 'cinenar-last-active-tab'
};
```

## ⚡ Performans ve Limitler

- **Browser Support**: Tüm modern tarayıcılarda desteklenir
- **Storage Limit**: ~5-10MB (tarayıcıya göre değişir)
- **Data Format**: JSON serialization
- **Error Handling**: Try-catch blokları ile hata yönetimi
- **Memory Usage**: Lazy loading, sadece gerektiğinde yükleme

## 🔒 Güvenlik

- Kullanıcı verileri sadece client-side'da saklanır
- Hassas bilgiler için ek encryption implementasyonu önerilir
- Cross-site scripting (XSS) koruması için input validation

## 📱 Mobile Support

- Capacitor ile mobil cihazlarda çalışır
- iOS/Android localStorage desteği
- Offline kullanım için ideal

## 🚨 Error Handling

Tüm localStorage operasyonları try-catch blokları ile korunmuştur:

```typescript
try {
  const data = LocalStorageService.getMovieLogs();
  // Success
} catch (error) {
  console.error('Error loading data:', error);
  // Fallback behavior
}
```

Bu entegrasyon sayesinde kullanıcıların film logları cihazlarında kalıcı olarak saklanır ve uygulama yeniden açıldığında tüm veriler geri yüklenir.
