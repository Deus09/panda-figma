// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çeviri dosyalarını import et
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationTR from './locales/tr/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  tr: {
    translation: translationTR,
  },
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini algılar
  .use(initReactI18next) // i18n'i react-i18next'e bağlar
  .init({
    resources,
    fallbackLng: 'en', // Eğer dil bulunamazsa varsayılan dil
    interpolation: {
      escapeValue: false, // React zaten XSS koruması yaptığı için gerekli değil
    },
  });

export default i18n;
