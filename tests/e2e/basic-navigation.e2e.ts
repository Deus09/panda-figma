import { test, expect } from './fixtures/test-fixtures';

test.describe('Basic Navigation Tests', () => {
  test('Ana sayfa yükleniyor', async ({ page }) => {
    await page.goto('/');
    
    // Sayfa yüklendiğini kontrol et
    await expect(page.locator('ion-app')).toBeVisible();
    
    // Home sayfasına yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('Ionic uygulaması çalışıyor', async ({ page }) => {
    await page.goto('/');
    
    // Temel Ionic elementlerinin görünür olduğunu kontrol et
    await expect(page.locator('ion-app')).toBeVisible();
    
    // Sayfa içeriğinin yüklendiğini kontrol et
    await page.waitForTimeout(2000); // Sayfa yüklenmesi için bekle
    
    // Herhangi bir içerik var mı kontrol et
    const content = await page.locator('ion-content').textContent();
    expect(content).toBeTruthy();
  });

  test('Sayfa başlığı doğru', async ({ page }) => {
    await page.goto('/');
    
    // Sayfa başlığını kontrol et
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('Sayfa başlığı:', title);
  });
}); 