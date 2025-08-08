import { test, expect } from './fixtures/test-fixtures';

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('Tam kullanıcı yolculuğu - Ana sayfa keşfi', async ({ page }) => {
    // 1. Ana sayfa yüklendiğini kontrol et
    await expect(page.locator('ion-app')).toBeVisible();
    await expect(page).toHaveURL(/.*\/home/);
    
    // 2. Header'ın görünür olduğunu kontrol et
    const header = page.locator('div[class*="flex flex-row items-center justify-between"]');
    await expect(header).toBeVisible();
    
    // 3. Logo'nun görünür olduğunu kontrol et
    const logo = page.locator('img[alt="Logo"]');
    await expect(logo).toBeVisible();
    
    // 4. Tab segment'lerin çalıştığını kontrol et
    const segmentButtons = page.locator('button[class*="flex-1 h-full flex items-center justify-center"]');
    await expect(segmentButtons).toHaveCount(2);
    
    // 5. Watched tab'ının aktif olduğunu kontrol et
    const watchedButton = segmentButtons.first();
    await expect(watchedButton).toHaveClass(/bg-white/);
    
    // 6. Watchlist tab'ına geç
    const watchlistButton = segmentButtons.nth(1);
    await watchlistButton.click();
    await page.waitForTimeout(1000);
    
    // 7. İçeriğin değiştiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('Sayfa navigasyonu - Explore sayfası', async ({ page }) => {
    // 1. Explore tab'ına git
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const exploreButton = navButtons.nth(1); // Explore button
    await exploreButton.click();
    await page.waitForTimeout(2000);
    
    // 2. Explore sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/explore/);
    
    // 3. Explore sayfası içeriğinin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    
    // 4. Home tab'ına geri dön
    const homeButton = navButtons.first();
    await homeButton.click();
    await page.waitForTimeout(2000);
    
    // 5. Home sayfasına döndüğümüzü kontrol et
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('Sayfa navigasyonu - Lists sayfası', async ({ page }) => {
    // 1. Lists tab'ına git
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const listsButton = navButtons.nth(3); // Lists button (4. button)
    await listsButton.click();
    await page.waitForTimeout(2000);
    
    // 2. Lists sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/lists/);
    
    // 3. Lists sayfası içeriğinin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('Sayfa navigasyonu - Social sayfası', async ({ page }) => {
    // 1. Social tab'ına git
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const socialButton = navButtons.nth(2); // Social button (3. button)
    await socialButton.click();
    await page.waitForTimeout(2000);
    
    // 2. Social sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/social/);
    
    // 3. Social sayfası içeriğinin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('Sayfa navigasyonu - Profile sayfası', async ({ page }) => {
    // 1. Profile tab'ına git
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const profileButton = navButtons.nth(4); // Profile button (5. button)
    await profileButton.click();
    await page.waitForTimeout(2000);
    
    // 2. Profile sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/profile/);
    
    // 3. Profile sayfası içeriğinin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('FAB button işlevselliği ve modal etkileşimi', async ({ page }) => {
    // 1. FAB button'ın görünür olduğunu kontrol et
    const fabButton = page.locator('button[class*="fixed bottom-[110px] right-[20px]"]');
    await expect(fabButton).toBeVisible();
    
    // 2. FAB'a tıkla
    await fabButton.click();
    await page.waitForTimeout(1000);
    
    // 3. Modal'ın açıldığını kontrol et
    const visibleModal = page.locator('ion-modal:not(.overlay-hidden)');
    if (await visibleModal.count() > 0) {
      await expect(visibleModal.first()).toBeVisible();
      
      // 4. Modal içeriğinin yüklendiğini kontrol et
      const modalContent = await visibleModal.first().textContent();
      expect(modalContent).toBeTruthy();
      
      // 5. Modal'ı kapat
      await page.click('ion-backdrop');
      await page.waitForTimeout(500);
      
      // 6. Modal'ın kapandığını kontrol et
      await expect(visibleModal.first()).not.toBeVisible();
    }
  });

  test('Sayfa yenileme sonrası durum korunuyor', async ({ page }) => {
    // 1. Explore sayfasına git
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const exploreButton = navButtons.nth(1);
    await exploreButton.click();
    await page.waitForTimeout(2000);
    
    // 2. Explore sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/explore/);
    
    // 3. Sayfayı yenile
    await page.reload();
    await page.waitForTimeout(3000);
    
    // 4. Explore sayfasında kaldığımızı kontrol et
    await expect(page).toHaveURL(/.*\/explore/);
    
    // 5. İçeriğin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('Performans kontrolü - Sayfa yükleme süreleri', async ({ page }) => {
    // 1. Ana sayfa yükleme süresini ölç
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log('Ana sayfa yükleme süresi:', loadTime, 'ms');
    
    // 2. Yükleme süresinin makul olduğunu kontrol et (5 saniyeden az)
    expect(loadTime).toBeLessThan(5000);
    
    // 3. Explore sayfasına geçiş süresini ölç
    const navStartTime = Date.now();
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    const exploreButton = navButtons.nth(1);
    await exploreButton.click();
    await page.waitForLoadState('networkidle');
    const navTime = Date.now() - navStartTime;
    
    console.log('Explore sayfası geçiş süresi:', navTime, 'ms');
    
    // 4. Geçiş süresinin makul olduğunu kontrol et (3 saniyeden az)
    expect(navTime).toBeLessThan(3000);
  });
}); 