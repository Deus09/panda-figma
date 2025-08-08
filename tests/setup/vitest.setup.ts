import '@testing-library/jest-dom';
import { beforeAll, beforeEach, vi, afterAll, afterEach } from 'vitest';
import 'dotenv/config';
import { setupServer } from 'msw/node';
import { http } from 'msw';

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
}

// Setup MSW server for API mocking
const server = setupServer(
  http.get('https://api.themoviedb.org/3/*', () => {
    return new Response(
      JSON.stringify({ results: [], page: 1, total_pages: 1, total_results: 0 }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
  http.get('*', () => {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  })
);

// Global fetch mock for tests (fallback)
const mockFetch = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  console.warn(`Mock fetch called with URL: ${input}`);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response);
});

beforeAll(() => {
  // Start MSW server
  server.listen();
  
  // Mock fetch globally for unit tests (fallback)
  global.fetch = mockFetch as any;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock as any;

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterAll(() => {
  // Stop MSW server
  server.close();
});

afterEach(() => {
  // Reset MSW handlers
  server.resetHandlers();
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset localStorage mock
  (global.localStorage.getItem as any).mockReturnValue(null);
  (global.localStorage.setItem as any).mockImplementation(() => {});
});
