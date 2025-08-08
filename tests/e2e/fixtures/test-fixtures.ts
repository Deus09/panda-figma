import { test as base, Page } from '@playwright/test';

export interface TestFixtures {
  moviePage: Page;
  explorePage: Page;
}

export const test = base.extend<TestFixtures>({
  moviePage: async ({ page }, use) => {
    // Navigate to home page and wait for it to load
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  explorePage: async ({ page }, use) => {
    // Navigate to explore page and wait for it to load  
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect } from '@playwright/test';
