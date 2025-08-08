import { test, expect } from './fixtures/test-fixtures';

test.describe('Page Structure Debug', () => {
  test('Sayfa yapısını incele', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000); // Sayfa yüklenmesi için daha uzun bekle
    
    // Sayfa HTML'ini al
    const html = await page.content();
    console.log('=== SAYFA HTML YAPISI ===');
    console.log(html.substring(0, 2000)); // İlk 2000 karakter
    
    // Tüm elementleri listele
    const allElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).map(el => ({
        tagName: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id,
        textContent: el.textContent?.substring(0, 50)
      }));
    });
    
    console.log('=== TÜM ELEMENTLER ===');
    console.log(JSON.stringify(allElements.slice(0, 30), null, 2)); // İlk 30 element
    
    // Ionic elementlerini ara (düzeltilmiş selector)
    const ionicElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="ion-"], ion-app, ion-content, ion-header, ion-tab-bar');
      return Array.from(elements).map(el => ({
        tagName: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id
      }));
    });
    
    console.log('=== IONIC ELEMENTLER ===');
    console.log(JSON.stringify(ionicElements, null, 2));
    
    // Body elementini kontrol et
    const bodyElement = await page.evaluate(() => {
      const body = document.body;
      return {
        tagName: body.tagName.toLowerCase(),
        className: body.className,
        childrenCount: body.children.length,
        innerHTML: body.innerHTML.substring(0, 500)
      };
    });
    
    console.log('=== BODY ELEMENTI ===');
    console.log(JSON.stringify(bodyElement, null, 2));
    
    // Screenshot al
    await page.screenshot({ path: 'test-results/debug-page-structure.png', fullPage: true });
    
    // Temel kontroller
    await expect(page.locator('body')).toBeVisible();
    console.log('Body elementi görünür');
    
    // Sayfa başlığını kontrol et
    const title = await page.title();
    console.log('Sayfa başlığı:', title);
    
    // URL'i kontrol et
    const url = page.url();
    console.log('URL:', url);
    
    // React uygulamasının yüklenip yüklenmediğini kontrol et
    const reactRoot = await page.evaluate(() => {
      const root = document.querySelector('#root');
      return root ? {
        tagName: root.tagName,
        className: root.className,
        childrenCount: root.children.length
      } : null;
    });
    
    console.log('=== REACT ROOT ===');
    console.log(JSON.stringify(reactRoot, null, 2));
  });
}); 