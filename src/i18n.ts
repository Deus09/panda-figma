// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dinamik çeviri yükleme fonksiyonu
const loadTranslation = async (language: string) => {
  try {
    switch (language) {
      case 'en':
        return (await import('./locales/en/translation.json')).default;
      case 'es':
        return (await import('./locales/es/translation.json')).default;
      case 'tr':
        return (await import('./locales/tr/translation.json')).default;
      default:
        return (await import('./locales/en/translation.json')).default;
    }
  } catch (error) {
    console.warn(`Failed to load ${language} translations, falling back to English`);
    return (await import('./locales/en/translation.json')).default;
  }
};

// i18n başlangıç konfigürasyonu (minimum)
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {}, // Boş başla, dinamik yükle
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Backend yükleme ayarları
    initImmediate: false, // İlk dil yüklenene kadar bekle
  });

// Dil değiştiğinde dinamik yükleme
const changeLanguage = async (lng: string) => {
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    const translation = await loadTranslation(lng);
    i18n.addResourceBundle(lng, 'translation', translation);
  }
  await i18n.changeLanguage(lng);
};

// İlk dil yükleme
const initializeI18n = async () => {
  const detectedLng = i18n.language || 'en';
  await changeLanguage(detectedLng);
};

// Export dinamik i18n fonksiyonları
export { changeLanguage, initializeI18n };
export default i18n;
