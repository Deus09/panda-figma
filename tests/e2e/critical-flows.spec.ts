import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Critical User Flows', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('Ana sayfa yükleme ve temel navigasyon', async ({ page }) => {
    // Ana sayfa yüklendiğini kontrol et
    await expect(page.locator('ion-content')).toBeVisible();
    
    // Bottom navigation bar'ın görünür olduğunu kontrol et
    await expect(page.locator('ion-tab-bar')).toBeVisible();
    
    // Home tab'ının aktif olduğunu kontrol et
    await expect(page.locator('ion-tab-button[tab="home"]')).toHaveClass(/tab-selected/);
    
    // Diğer tab'ların görünür olduğunu kontrol et
    const tabNames = ['explore', 'lists', 'social', 'profile'];
    for (const tabName of tabNames) {
      await expect(page.locator(`ion-tab-button[tab="${tabName}"]`)).toBeVisible();
    }
  });

  test('Tab navigasyonu çalışıyor', async ({ page }) => {
    const tabs = ['explore', 'lists', 'social', 'profile'];
    
    for (const tab of tabs) {
      // Tab'a tıkla
      await helpers.navigateToTab(tab);
      
      // Tab'ın seçili olduğunu kontrol et
      await expect(page.locator(`ion-tab-button[tab="${tab}"]`)).toHaveClass(/tab-selected/);
      
      // İçeriğin yüklendiğini kontrol et
      await expect(page.locator('ion-content')).toBeVisible();
    }
    
    // Home tab'ına geri dön
    await helpers.navigateToTab('home');
    await expect(page.locator('ion-tab-button[tab="home"]')).toHaveClass(/tab-selected/);
  });

  test('FAB button işlevselliği', async ({ page }) => {
    // FAB button'ın görünür olduğunu kontrol et
    await expect(page.locator('ion-fab-button')).toBeVisible();
    
    // FAB'a tıkla
    await page.click('ion-fab-button');
    
    // Modal'ın açıldığını kontrol et
    await expect(page.locator('ion-modal')).toBeVisible();
    
    // Modal içeriğinin görünür olduğunu kontrol et
    await expect(page.locator('ion-modal ion-content')).toBeVisible();
    
    // Modal'ı kapat
    await helpers.closeModal();
  });

  test('Sayfa yenileme sonrası durum korunuyor', async ({ page }) => {
    // Explore tab'ına git
    await helpers.navigateToTab('explore');
    
    // Sayfayı yenile
    await page.reload();
    await helpers.waitForPageLoad();
    
    // Explore tab'ının hala seçili olduğunu kontrol et
    await expect(page.locator('ion-tab-button[tab="explore"]')).toHaveClass(/tab-selected/);
  });

  test('Responsive tasarım kontrolü', async ({ page }) => {
    // Mobile viewport'ta olduğumuzu kontrol et
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(375);
    expect(viewport?.height).toBeLessThanOrEqual(667);
    
    // Tüm temel elementlerin görünür olduğunu kontrol et
    await expect(page.locator('ion-header')).toBeVisible();
    await expect(page.locator('ion-content')).toBeVisible();
    await expect(page.locator('ion-tab-bar')).toBeVisible();
  });
}); 