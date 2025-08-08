# Moviloi

Modern film ve dizi takip uygulaması. Ionic React, TypeScript ve TMDB API kullanarak geliştirilmiştir.

## Features

- 🎬 Film ve dizi arama
- 📝 İzlenen/izlenecek listeler
- ⭐ Puanlama ve yorumlar
- 🏆 Rozet sistemi
- 📱 PWA desteği
- 🌙 Dark/Light tema
- 🌐 Çoklu dil desteği (TR, EN, ES)
- 🔔 Push bildirimler

## Tech Stack

- **Framework**: Ionic React 8.x
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State**: React Context
- **API**: TMDB API
- **Testing**: Vitest + Playwright
- **Build**: Vite

## Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd moviloi

# Install dependencies  
npm install

# Setup environment variables
cp env.example .env
# Edit .env with your API keys
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Testing

Proje iki farklı test yaklaşımı kullanır:

#### Unit Tests (Vitest)
```bash
# Run unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# Coverage report
npm run test:unit:coverage
```

#### E2E Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

#### All Tests
```bash
# Run all tests
npm run test:all

# CI pipeline
npm run ci:test
```

Detaylı test dokümantasyonu için [Testing Guide](docs/testing.md) bakınız.

### Build

```bash
# Production build
npm run build

# Preview production build
npm run serve
```

### Mobile Development

```bash
# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android

# Sync changes
npx cap sync

# Run on iOS
npx cap run ios

# Run on Android
npx cap run android
```

## Environment Variables

```bash
# Required
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### TMDB API Anahtarı Kurulumu

Uygulama TMDB (The Movie Database) herkese açık okuma uçlarını kullanır. Frontend tarafında anahtar tam olarak gizlenemez; bu nedenle sadece okuma (read-only) yetkili bir key kullanın.

1. TMDB hesabı açın ve API bölümünden bir v4 auth key / v3 key üretin.
2. Proje kökünde `.env` dosyası oluşturun (örnek: `cp env.example .env`).
3. `VITE_TMDB_API_KEY` değerini girin.
4. Geliştirme sunucusunu yeniden başlatın.

Koruma: Build veya runtime sırasında geçersiz (`your_tmdb_api_key_here` vb.) anahtar tespit edilirse konsolda uyarı verilir ve herhangi bir TMDB isteği yapılmadan hata fırlatılır. Böylece boş anahtar ile yanlışlıkla rate limit veya hata spam'i oluşmaz.

Notlar:
- Değişken Vite gereği `VITE_` prefixine sahip olmalıdır.
- Production ortamında CI pipeline’da `.env` veya gizli yönetimi (örn. GitHub Actions Secrets) aracılığıyla enjekte edilmelidir.
- Daha ileri güvenlik için backend proxy katmanı eklenebilir (yazma/özel istekler için gereklidir).

## Performance & Bundle Optimization

Uygulama optimize edilmiş chunk stratejisi kullanır:

### Bundle Analizi
```bash
# Bundle boyutlarını ve eşikleri kontrol et
npm run analyze:size

# Detaylı görselleştirme için
npm run build:analyze
npm run analyze:open
```

### Size Limits
- **Ana chunk**: < 250 KB gzip (şu an: ~80 KB)
- **Toplam JS**: < 800 KB gzip
- **i18n**: Dinamik yükleme (dil başına ~5 KB)

### Kod Bölme Stratejisi
- `react-vendors`: React ekosistemi
- `ionic-core`: Ionic bileşenleri
- `capacitor`: Native plugin'ler
- `supabase`: Backend istemcisi
- `i18n`: Çeviri yönetimi
- Route-level splitting: Her sayfa ayrı chunk

### Performans İzleme
```bash
# CI size kontrolü
npm run size:check

# Development boyut raporu
npm run build && npm run analyze:size
```

## Project Structure

```
src/
├── components/         # Reusable components
├── pages/             # Page components  
├── context/           # React contexts
├── services/          # API services
├── hooks/             # Custom hooks
├── types/             # TypeScript types
├── locales/           # i18n translations
└── theme/             # Theme configuration

tests/
├── unit/              # Unit tests (Vitest)
├── e2e/               # E2E tests (Playwright)
├── setup/             # Test configuration
└── utils/             # Test utilities
```

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Bu proje MIT lisansı altında lisanslanmıştır.
