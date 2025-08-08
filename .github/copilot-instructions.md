# Moviloi - AI Coding Agent Instructions

## 🎬 Project Overview
Moviloi is a movie/TV tracking app built with **Ionic React + Capacitor** for cross-platform deployment. The architecture combines Ionic's mobile-first components with React patterns, using TMDB API for movie data and localStorage for persistence.nenar - AI Coding Agent Instructions

## 🎬 Project Overview
Moviloi is a movie/TV tracking app built with **Ionic React + Capacitor** for cross-platform deployment. The architecture combines Ionic's mobile-first components with React patterns, using TMDB API for movie data and localStorage for persistence.

## Key Architecture Patterns

### Modal Stack System
The app uses a sophisticated modal stack architecture via `ModalContext.tsx`:
```tsx
// Open any content type seamlessly
const { openModal } = useModal();
openModal('movie', movieId); // Stacks modals for deep navigation
```
- **Critical**: Always use `useModal()` hook for navigation between movie/series/actor details
- Modals are rendered centrally in `App.tsx` via `ModalRenderer` component
- Stack-based: supports modal-over-modal navigation (e.g., movie → actor → another movie)

### State Management Patterns
**localStorage as Primary Database**: The app uses a structured localStorage service as its database:
```typescript
// Always use the service, never direct localStorage calls
LocalStorageService.saveMovieLog(movieData);
LocalStorageService.getUserPreferences();
```
- `src/services/localStorage.ts` - Centralized data operations with error handling
- Structured interfaces: `MovieLog`, `UserProfile`, `UserPreferences`
- **Convention**: All data operations must go through LocalStorageService

### Theme System (Dual Implementation)
**Two theme systems coexist** - ensure consistency:
1. **CSS Variables**: `src/theme/variables.css` (HSL format, used by Tailwind)
2. **ThemeContext**: `src/context/ThemeContext.tsx` (React state management)

Apply theme changes in BOTH systems:
```tsx
// Update React context
const { setTheme } = useTheme();
// Update localStorage preferences
LocalStorageService.saveUserPreferences({ ...prefs, darkMode: isDark });
```

### Component Organization
- **Pages**: `src/pages/` - Route-level components with bottom navigation
- **Components**: `src/components/` - Reusable UI components
- **Modals**: Each content type has its own modal (MovieDetailModal, SeriesDetailModal, ActorDetailModal)

## Development Workflows

### Local Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run serve        # Preview build
npm run test.e2e     # Cypress E2E tests
npm run test.unit    # Vitest unit tests
```

### Mobile Development
```bash
npx cap add ios      # Add iOS platform
npx cap add android  # Add Android platform
npx cap sync         # Sync web assets to native
npx cap open ios     # Open in Xcode
```

## Critical Patterns & Conventions

### TMDB API Integration
- **Service**: `src/services/tmdb.ts` handles all external API calls
- **Types**: Well-defined TypeScript interfaces for API responses
- **Pattern**: Always await API calls and handle loading/error states
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Styling Approach
**Hybrid Ionic + Tailwind**:
- Use `IonContent`, `IonPage`, `IonModal` for layout structure
- Apply Tailwind classes for custom styling
- **Color System**: Always use CSS variables (`bg-background`, `text-foreground`)
- **Font System**: `font-sans` (Poppins), `font-serif` (Source Serif 4)

### Data Persistence Patterns
**Structured localStorage with TypeScript**:
```typescript
interface MovieLog {
  id: string;           // Unique identifier
  tmdbId?: number;      // TMDB API reference
  contentType: 'movie' | 'tv';
  seriesId?: string;    // For TV episode grouping
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

### Series/Episode Handling
**Complex TV Show Architecture**:
- Series have multiple seasons, each with multiple episodes
- Episode logs are grouped by `seriesId` for display
- Use `SeriesDetailPage.tsx` for dedicated series navigation
- **Pattern**: Always check `contentType` and `seriesId` for TV content

## Project-Specific Conventions

### Turkish Localization
- UI text is primarily in Turkish
- Date formats use Turkish locale
- Genre names and categories in Turkish

### Design System
- **Primary Color**: `#FE7743` (orange/coral)
- **Radius**: `12px-20px` for cards, `8px` for buttons
- **Spacing**: 4px/8px grid system via Tailwind
- **Dark Mode Default**: App defaults to dark theme

### Mobile-First Patterns
- Bottom navigation with fixed positioning
- Card-based layouts for content
- Touch-friendly 44px minimum tap targets
- Ionic's native components for platform consistency

## External Dependencies

### Core Dependencies
- **@ionic/react**: UI framework and components
- **@capacitor/core**: Native platform bridge
- **react-router-dom v5**: Client-side routing
- **tailwindcss**: Utility-first CSS framework

### API Dependencies
- **TMDB API**: Movie/TV data source (requires API key)
- **Gemini AI**: Used for content recommendations and chat features

## Common Gotchas

1. **Modal Navigation**: Never use React Router for movie/series/actor details - always use ModalContext
2. **Theme Consistency**: When changing themes, update both CSS classes and localStorage preferences
3. **TV Series Complexity**: Episode handling requires careful `seriesId` grouping and season management
4. **Ionic + Tailwind**: Some Ionic components need CSS variables, not Tailwind classes
5. **localStorage Structure**: Always use the LocalStorageService - never direct localStorage access
6. **TypeScript Strict**: The codebase uses strict TypeScript - handle all null/undefined cases

## File Structure Highlights
- `src/App.tsx` - Central modal rendering and routing
- `src/context/ModalContext.tsx` - Core navigation system
- `src/services/localStorage.ts` - Database layer (675 lines)
- `src/services/tmdb.ts` - External API integration (695 lines)
- `src/theme/variables.css` - CSS variable definitions for theming
