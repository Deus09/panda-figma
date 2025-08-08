import { describe, it, expect, beforeEach } from 'vitest';

// Dinamik import ile farklı env senaryolarını test edeceğiz

const resetModules = () => {
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
  });
};

describe('TMDB API Key Guard', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetModules();
    process.env = { ...originalEnv };
  });

  it('throws when key is missing (on first API call)', async () => {
    (import.meta as any).env = { MODE: 'development' };
    const mod = await import('../../src/services/tmdb');
    await expect(mod.searchMovies('test')).rejects.toThrow(/TMDB API key misconfigured/i);
  });

  it('throws when key is placeholder (on first API call)', async () => {
    (import.meta as any).env = { MODE: 'development', VITE_TMDB_API_KEY: 'your_tmdb_api_key_here' };
    const mod = await import('../../src/services/tmdb');
    await expect(mod.searchMovies('test')).rejects.toThrow(/TMDB API key misconfigured/i);
  });

  it('does not throw when key is valid', async () => {
    (import.meta as any).env = { MODE: 'development', VITE_TMDB_API_KEY: 'abc123' };
    const mod = await import('../../src/services/tmdb');
    // Mock fetch since we only care about guard not throwing
    global.fetch = async () => new Response(JSON.stringify({ results: [] }), { status: 200 }) as any;
    await expect(mod.searchMovies('test')).resolves.toEqual([]);
  });
});
