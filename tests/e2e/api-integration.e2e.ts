import { test, expect } from './fixtures/test-fixtures';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('Network istekleri izleniyor', async ({ page }) => {
    // Network isteklerini dinle
    const apiRequests: string[] = [];
    const apiResponses: { url: string; status: number }[] = [];
    
    page.on('request', request => {
      if (request.url().includes('api.themoviedb.org')) {
        apiRequests.push(request.url());
        console.log('API Request:', request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api.themoviedb.org')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
        console.log('API Response:', response.url(), response.status());
      }
    });
    
    // Explore sayfasına git (API çağrısı tetikler)
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const exploreButton = navButtons.nth(1);
    await exploreButton.click();
    await page.waitForTimeout(3000); // API çağrıları için bekle
    
    // API çağrılarının yapıldığını kontrol et
    console.log('Toplam API istekleri:', apiRequests.length);
    console.log('API yanıtları:', apiResponses);
    
    // En az bir API çağrısı yapılmış olmalı
    expect(apiRequests.length).toBeGreaterThan(0);
    
    // API yanıtlarının başarılı olduğunu kontrol et
    for (const response of apiResponses) {
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(400);
    }
  });

  test('LocalStorage işlemleri', async ({ page }) => {
    // Test verisi ekle
    await page.evaluate(() => {
      localStorage.setItem('test-movie', JSON.stringify({
        id: 123,
        title: 'Test Movie',
        addedAt: new Date().toISOString()
      }));
    });
    
    // Sayfayı yenile
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verinin korunduğunu kontrol et
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('test-movie');
    });
    
    expect(storedData).toBeTruthy();
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.title).toBe('Test Movie');
    expect(parsedData.id).toBe(123);
    
    // Test verisini temizle
    await page.evaluate(() => {
      localStorage.removeItem('test-movie');
    });
  });

  test('Console logları izleniyor', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('Console:', msg.text());
    });
    
    // Sayfa etkileşimleri yap
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const exploreButton = navButtons.nth(1);
    await exploreButton.click();
    await page.waitForTimeout(2000);
    
    // Console mesajlarının yakalandığını kontrol et
    console.log('Toplam console mesajları:', consoleMessages.length);
    expect(consoleMessages.length).toBeGreaterThan(0);
  });

  test('Error handling kontrolü', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('Page Error:', error.message);
    });
    
    // Sayfa etkileşimleri yap
    const fabButton = page.locator('button[class*="fixed bottom-[110px] right-[20px]"]');
    await fabButton.click();
    await page.waitForTimeout(1000);
    
    // Hata olmadığını kontrol et
    console.log('Toplam hatalar:', errors.length);
    expect(errors.length).toBe(0);
  });

  test('Performance metrics', async ({ page }) => {
    // Performance metrics'leri al
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('Performance Metrics:', metrics);
    
    // Performance değerlerinin makul olduğunu kontrol et
    expect(metrics.loadTime).toBeLessThan(5000);
    expect(metrics.domContentLoaded).toBeLessThan(3000);
  });

  test('Memory usage kontrolü', async ({ page }) => {
    // Memory kullanımını kontrol et
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory;
    });
    
    console.log('Memory Info:', memoryInfo);
    
    // Memory kullanımının makul seviyede olduğunu kontrol et
    if (memoryInfo) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB
      expect(memoryInfo.totalJSHeapSize).toBeLessThan(200 * 1024 * 1024); // 200MB
    }
  });
}); 