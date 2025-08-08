# Testing Documentation

## Overview

Bu projede iki farklı test yaklaşımı kullanılmaktadır:

- **Unit Tests**: Vitest ile component, hook ve servis testleri
- **E2E Tests**: Playwright ile kullanıcı akışı testleri

## Test Structure

```
tests/
├── unit/                    # Unit testler (Vitest)
│   ├── App.test.tsx
│   └── ...
├── e2e/                     # E2E testler (Playwright)
│   ├── fixtures/
│   │   └── test-fixtures.ts
│   ├── pages/              # Page Object Model
│   ├── basic-navigation.e2e.ts
│   └── ...
├── setup/
│   └── vitest.setup.ts     # Vitest global setup
└── utils/
    └── test-helpers.ts     # Shared test utilities
```

## Running Tests

### Unit Tests (Vitest)
```bash
# Tek seferlik çalıştırma
npm run test:unit

# Watch mode
npm run test:unit:watch

# Coverage raporu ile
npm run test:unit:coverage
```

### E2E Tests (Playwright)
```bash
# Headless mode
npm run test:e2e

# UI mode (interaktif)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Trace ile
npm run test:e2e:trace
```

### All Tests
```bash
# Tüm testler
npm run test:all

# CI pipeline için
npm run ci:test
```

## Naming Conventions

- **Unit Tests**: `*.test.ts` veya `*.test.tsx`
- **E2E Tests**: `*.e2e.ts`

## Environment Variables

### Unit Tests (.env.test)
- Mock API anahtarları
- Test ortamı konfigürasyonları

### E2E Tests (.env.e2e)
- Gerçek/staging API anahtarları
- Browser konfigürasyonları

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MyComponent from '../../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from './fixtures/test-fixtures';

test.describe('User Flow', () => {
  test('should navigate through app', async ({ moviePage }) => {
    await expect(moviePage.locator('ion-content')).toBeVisible();
  });
});
```

## CI Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Manual workflow dispatch

Pipeline includes:
1. Lint check
2. Type checking
3. Unit tests
4. E2E tests

## Debugging

### Unit Tests
- Use `console.log` or debugger
- Check test output in terminal
- Use watch mode for rapid iteration

### E2E Tests
- Use `--debug` flag for step-by-step debugging
- Check screenshots/videos in `playwright-report`
- Use trace viewer for detailed inspection

## Best Practices

1. **Isolation**: Each test should be independent
2. **Data**: Use fixtures for consistent test data
3. **Selectors**: Use `data-testid` for stable selectors
4. **Async**: Always await async operations
5. **Cleanup**: Clean up after tests (localStorage, etc.)

## Troubleshooting

### Common Issues
- **Timeout**: Increase timeout in config
- **Flaky Tests**: Add proper waits and assertions
- **Mock Issues**: Check mock setup in vitest.setup.ts
