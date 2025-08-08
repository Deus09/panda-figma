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
