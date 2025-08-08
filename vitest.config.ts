import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'tests/e2e/**',
      '**/*.e2e.ts',
      'node_modules',
      'dist',
      'playwright-report',
      'test-results'
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'tests/e2e/**',
        'tests/setup/**',
        'playwright-report/**',
        'test-results/**',
        'coverage/**',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts'
      ]
    }
  }
});
