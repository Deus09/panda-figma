import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Sayfa yükleme bekleme
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Ionic animasyonları için ek bekleme
  }

  // Tab navigasyonu
  async navigateToTab(tabName: string) {
    await this.page.click(`ion-tab-button[tab="${tabName}"]`);
    await this.page.waitForTimeout(500);
  }

  // Modal açma/kapama
  async openModal(selector: string) {
    await this.page.click(selector);
    await expect(this.page.locator('ion-modal')).toBeVisible();
  }

  async closeModal() {
    await this.page.click('ion-modal ion-button[aria-label="Close"], ion-modal ion-backdrop');
    await expect(this.page.locator('ion-modal')).not.toBeVisible();
  }

  // Loading state bekleme
  async waitForLoading() {
    await this.page.waitForSelector('ion-loading', { state: 'hidden', timeout: 10000 });
  }

  // Toast mesajı bekleme
  async waitForToast(message?: string) {
    if (message) {
      await expect(this.page.locator(`ion-toast:has-text("${message}")`)).toBeVisible();
    } else {
      await expect(this.page.locator('ion-toast')).toBeVisible();
    }
  }

  // Network isteği bekleme
  async waitForAPIRequest(urlPattern: string) {
    await this.page.waitForRequest(request => request.url().includes(urlPattern));
  }

  // LocalStorage işlemleri
  async setLocalStorage(key: string, value: any) {
    await this.page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key, value });
  }

  async getLocalStorage(key: string) {
    return await this.page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }, key);
  }

  // Screenshot alma
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
} 