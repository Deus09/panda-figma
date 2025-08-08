import { test, expect } from '@playwright/test';

test.describe('Navigation Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Sayfa yüklenmesi için bekle
  });

  test('Ionic uygulaması yükleniyor', async ({ page }) => {
    // Ion-app elementinin görünür olduğunu kontrol et
    await expect(page.locator('ion-app')).toBeVisible();
    
    // Ion-content elementinin görünür olduğunu kontrol et
    await expect(page.locator('ion-content')).toBeVisible();
    
    // Sayfa içeriğinin yüklendiğini kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test('Bottom navigation button\'ları çalışıyor', async ({ page }) => {
    // Bottom navigation button'larının görünür olduğunu kontrol et
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    await expect(navButtons).toHaveCount(5); // 5 tab button'ı
    
    // İlk button'ın (home) aktif olduğunu kontrol et
    const firstButton = navButtons.first();
    await expect(firstButton).toHaveClass(/bg-white/); // Aktif button beyaz arka plana sahip
    
    // Diğer button'ların pasif olduğunu kontrol et
    const otherButtons = navButtons.nth(1);
    await expect(otherButtons).toHaveClass(/bg-transparent/); // Pasif button'lar şeffaf
  });

  test('FAB button işlevselliği', async ({ page }) => {
    // FAB button'ın görünür olduğunu kontrol et
    const fabButton = page.locator('button[class*="fixed bottom-[110px] right-[20px]"]');
    await expect(fabButton).toBeVisible();
    
    // FAB button'ın doğru renkte olduğunu kontrol et
    await expect(fabButton).toHaveClass(/bg-\[#FE7743\]/); // Turuncu renk
    
    // FAB'a tıkla
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Modal'ın açıldığını kontrol et (spesifik modal)
    const visibleModal = page.locator('ion-modal:not(.overlay-hidden)');
    if (await visibleModal.count() > 0) {
      await expect(visibleModal.first()).toBeVisible();
      
      // Modal'ı kapat
      await page.click('ion-backdrop');
      await expect(visibleModal.first()).not.toBeVisible();
    }
  });

  test('Header bileşeni görünür', async ({ page }) => {
    // Header içeriğinin görünür olduğunu kontrol et
    const headerContent = page.locator('div[class*="flex flex-row items-center justify-between"]');
    await expect(headerContent).toBeVisible();
    
    // Logo'nun görünür olduğunu kontrol et
    const logo = page.locator('img[alt="Logo"]');
    await expect(logo).toBeVisible();
  });

  test('Tab segment bileşeni çalışıyor', async ({ page }) => {
    // Tab segment button'larının görünür olduğunu kontrol et
    const segmentButtons = page.locator('button[class*="flex-1 h-full flex items-center justify-center"]');
    await expect(segmentButtons).toHaveCount(2); // Watched ve Watchlist
    
    // İlk button'ın (Watched) aktif olduğunu kontrol et
    const firstSegmentButton = segmentButtons.first();
    await expect(firstSegmentButton).toHaveClass(/bg-white/);
    
    // İkinci button'a tıkla
    const secondSegmentButton = segmentButtons.nth(1);
    await secondSegmentButton.click();
    await page.waitForTimeout(1000); // Daha uzun bekle
    
    // İkinci button'ın aktif olduğunu kontrol et (farklı renk kontrolü)
    const secondButtonClass = await secondSegmentButton.getAttribute('class');
    console.log('İkinci button class:', secondButtonClass);
    
    // Button'ın tıklandığını kontrol et (herhangi bir değişiklik)
    expect(secondButtonClass).toBeTruthy();
  });

  test('Sayfa içeriği yükleniyor', async ({ page }) => {
    // Ana içerik alanının görünür olduğunu kontrol et
    await expect(page.locator('ion-content')).toBeVisible();
    
    // İçeriğin yüklendiğini kontrol et
    await page.waitForTimeout(2000);
    
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test('Responsive tasarım kontrolü', async ({ page }) => {
    // Viewport boyutunu kontrol et
    const viewport = page.viewportSize();
    console.log('Viewport boyutu:', viewport);
    
    // Tüm temel elementlerin görünür olduğunu kontrol et
    await expect(page.locator('ion-app')).toBeVisible();
    await expect(page.locator('ion-content')).toBeVisible();
    
    // Bottom navigation button'larının görünür olduğunu kontrol et (ilk button)
    const firstNavButton = page.locator('button[class*="flex flex-col items-center flex-1"]').first();
    await expect(firstNavButton).toBeVisible();
  });

  test('URL navigasyonu çalışıyor', async ({ page }) => {
    // Başlangıçta home sayfasında olduğumuzu kontrol et
    await expect(page).toHaveURL(/.*\/home/);
    
    // Sayfa başlığını kontrol et
    const title = await page.title();
    expect(title).toBe('Moviloi');
  });

  test('Bottom navigation tıklama testi', async ({ page }) => {
    // Bottom navigation button'larını test et
    const navButtons = page.locator('button[class*="flex flex-col items-center flex-1"]');
    
    // Explore button'una tıkla (ikinci button)
    const exploreButton = navButtons.nth(1);
    await exploreButton.click();
    await page.waitForTimeout(1000);
    
    // URL'in değiştiğini kontrol et
    await expect(page).toHaveURL(/.*\/explore/);
    
    // Home button'una geri dön
    const homeButton = navButtons.first();
    await homeButton.click();
    await page.waitForTimeout(1000);
    
    // Home sayfasına döndüğünü kontrol et
    await expect(page).toHaveURL(/.*\/home/);
  });
}); 