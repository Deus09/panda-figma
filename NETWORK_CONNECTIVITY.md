# Network Connectivity Detection System

Bu proje, Ionic/Capacitor tabanlı mobil uygulama için kapsamlı bir network connectivity detection (ağ bağlantısı algılama) sistemi içerir.

## 🚀 Özellikler

### 1. Cross-Platform Network Detection
- **Native Platforms (iOS/Android)**: Capacitor Network plugin kullanır
- **Web Platform**: Navigator.onLine API ve network events kullanır
- Otomatik platform detection ve uygun API seçimi

### 2. Reactive Network Status
- Real-time network durumu takibi
- Connection type detection (WiFi, Cellular, 4G, 3G, etc.)
- Network değişikliklerinde otomatik güncelleme

### 3. Smart Error Handling
- Network hatalarının otomatik algılanması
- Kullanıcı dostu hata mesajları (i18n destekli)
- Timeout ve connection failure handling

### 4. Visual Indicators
- **OfflineIndicator**: Bağlantı kesildiğinde üst kısımda görünen uyarı
- **NetworkStatusIndicator**: Detaylı bağlantı durumu göstergesi
- Toast notifications ile hata bildirimleri

## 📁 Dosya Yapısı

```
src/
├── hooks/
│   └── useNetworkStatus.ts          # Ana network status hook'u
├── context/
│   └── NetworkContext.tsx           # Global network context
├── components/
│   ├── NetworkIndicator.tsx         # Visual indicator component'leri  
│   └── NetworkErrorHandler.tsx      # Error handling utilities
├── services/
│   ├── networkService.ts           # Network utility fonksiyonları
│   └── tmdb.ts                     # Network-aware API calls
└── pages/
    └── NetworkTestPage.tsx         # Test sayfası
```

## 🛠️ Kurulum

### 1. Dependency'ler Yüklendi
```bash
npm install @capacitor/network
```

### 2. Native Platform Sync
```bash
npx cap sync ios
npx cap sync android
```

## 💻 Kullanım

### 1. Context Provider Setup
```tsx
import { NetworkProvider } from './context/NetworkContext';

function App() {
  return (
    <NetworkProvider>
      <YourAppContent />
    </NetworkProvider>
  );
}
```

### 2. Hook Kullanımı
```tsx
import { useNetwork } from '../context/NetworkContext';

function MyComponent() {
  const { isConnected, connectionType, isInitializing } = useNetwork();
  
  return (
    <div>
      <p>Bağlantı Durumu: {isConnected ? 'Bağlı' : 'Bağlı Değil'}</p>
      <p>Bağlantı Tipi: {connectionType}</p>
    </div>
  );
}
```

### 3. Visual Indicators
```tsx
import { OfflineIndicator, NetworkStatusIndicator } from '../components/NetworkIndicator';

function MyPage() {
  return (
    <div>
      <OfflineIndicator /> {/* Sadece offline'da görünür */}
      <NetworkStatusIndicator showWhenOnline={true} /> {/* Her zaman görünür */}
    </div>
  );
}
```

### 4. Error Handling
```tsx
import { useNetworkErrorHandler } from '../components/NetworkErrorHandler';

function ApiComponent() {
  const { handleNetworkError, NetworkErrorComponent } = useNetworkErrorHandler();
  
  const fetchData = async () => {
    try {
      const data = await apiCall();
    } catch (error) {
      handleNetworkError(error.message);
    }
  };
  
  return (
    <div>
      {/* Component content */}
      <NetworkErrorComponent />
    </div>
  );
}
```

### 5. Network Service Utilities
```tsx
import { NetworkService } from '../services/networkService';

// Network status kontrol
const status = await NetworkService.getNetworkStatus();
console.log(status.connected, status.connectionType);

// API calls için network kontrolü
const { canMakeRequest, shouldUseCache } = await NetworkService.checkNetworkForApiCall();

if (canMakeRequest) {
  // API call yap
} else if (shouldUseCache) {
  // Cache'den data kullan
}
```

## 🧪 Testing

Test sayfasında (`/network-test`) şu testleri yapabilirsiniz:

1. **Network Status Test**: Mevcut bağlantı durumunu kontrol eder
2. **API Call Test**: Network-aware API çağrısı yapar
3. **Offline Simulation**: Offline durumunu simüle eder
4. **Online Simulation**: Online durumuna geri döner

## 📱 Platform Özellikleri

### iOS/Android (Native)
- Capacitor Network plugin kullanır
- Hardware-level network detection
- Cellular/WiFi type detection
- Background network change monitoring

### Web
- Navigator.onLine API kullanır
- Online/offline events dinler
- Connection API (desteklenen tarayıcılarda)
- Limited connection type detection

## 🌍 Internationalization

Network mesajları şu dillerde desteklenir:
- **Türkçe** (`tr`)
- **İngilizce** (`en`)

Mesaj anahtarları:
- `network.offline`: "İnternet Bağlantısı Yok"
- `network.online`: "Çevrimiçi"
- `network.connected`: "Bağlı"
- `network.no_connection`: "İnternet bağlantısı yok..."
- `network.timeout_error`: "Bağlantı zaman aşımına uğradı..."
- `network.server_error`: "Sunucuya bağlanılamıyor..."

## 🔧 Configuration

### Capacitor Config
```typescript
// capacitor.config.ts
plugins: {
  Network: {
    // Network plugin configuration
  }
}
```

### Network Service Config
```typescript
// Cache duration, timeout values, etc. can be configured
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const timeout = quality === 'low' ? 15000 : 5000; // Connection-based timeouts
```

## 📊 Features Summary

✅ **Real-time network monitoring**  
✅ **Cross-platform compatibility**  
✅ **Smart error handling**  
✅ **Visual indicators**  
✅ **Internationalization support**  
✅ **Connection type detection**  
✅ **API integration**  
✅ **Offline mode support**  
✅ **Test utilities**  

## 🔗 Dependencies

- `@capacitor/network`: Native network detection
- `@capacitor/core`: Platform utilities
- `@ionic/react`: UI components
- `react-i18next`: Internationalization

---

Bu sistem sayesinde kullanıcılar her zaman network durumundan haberdar olacak ve uygulama network hatalarını gracefully handle edecektir.
