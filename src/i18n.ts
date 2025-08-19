// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dinamik çeviri yükleme fonksiyonu
const loadTranslation = async (language: string) => {
  try {
    console.log(`📂 Loading translation file for: ${language}`);
    let translation;
    switch (language) {
      case 'en':
        translation = (await import('./locales/en/translation.json')).default;
        break;
      case 'es':
        translation = (await import('./locales/es/translation.json')).default;
        break;
      case 'tr':
        translation = (await import('./locales/tr/translation.json')).default;
        break;
      default:
        translation = (await import('./locales/en/translation.json')).default;
    }
    
    console.log(`🔍 Loaded translation structure for ${language}:`, {
      hasPaywall: !!translation.paywall,
      paywallKeys: translation.paywall ? Object.keys(translation.paywall) : 'no paywall',
      paywallTitle: translation.paywall?.title || 'no title',
      sampleKeys: Object.keys(translation).slice(0, 5)
    });
    
    return translation;
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
    react: {
      useSuspense: false, // React Suspense'ı devre dışı bırak
    },
    // Backend yükleme ayarları
    initImmediate: true, // Hemen başlat
  });

// Dil değiştiğinde dinamik yükleme
const changeLanguage = async (lng: string) => {
  console.log(`🔄 Starting language change to: ${lng}`);
  
  // Force load the translation even if it exists
  console.log(`📥 Force loading translations for: ${lng}`);
  const translation = await loadTranslation(lng);
  i18n.addResourceBundle(lng, 'translation', translation, true, true); // Force override
  console.log(`✅ Force loaded translations for: ${lng}`);
  
  await i18n.changeLanguage(lng);
  console.log(`🌍 Language changed to: ${lng}`);
  
  // Test paywall translations after language change
  console.log('🧪 Post-change test:', {
    language: lng,
    paywallTitle: i18n.t('paywall.title'),
    paywallSubtitle: i18n.t('paywall.subtitle'),
    billingInfo: i18n.t('paywall.pricing.billing_info', { period: 'monthly' })
  });
  
  // Force re-render by emitting language change event
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lng }));
};

// İlk dil yükleme
const initializeI18n = async () => {
  try {
    // Tarayıcı dilini algıla ve normalize et
    let detectedLng = i18n.language || 'tr'; // Default to Turkish
    console.log('🌍 i18n detected language:', detectedLng);
    
    // Uzun dil kodlarını kısalt (en-US -> en)
    if (detectedLng.includes('-')) {
      detectedLng = detectedLng.split('-')[0];
    }
    
    // Desteklenen dillerde mi kontrol et
    const supportedLanguages = ['tr', 'en', 'es'];
    if (!supportedLanguages.includes(detectedLng)) {
      detectedLng = 'tr'; // Fallback to Turkish
    }
    
    console.log('🌍 Using language:', detectedLng);
    
    // İlk çevirileri yükle
    const translation = await loadTranslation(detectedLng);
    i18n.addResourceBundle(detectedLng, 'translation', translation, true, true);
    
    // Dili ayarla
    await i18n.changeLanguage(detectedLng);
    
    console.log('✅ i18n initialized successfully');
    
    // Test için çeviriyi deneme
    console.log('🧪 Test translations:', {
      language: detectedLng,
      paywallTitle: i18n.t('paywall.title'),
      paywallSubtitle: i18n.t('paywall.subtitle'),
      billingInfo: i18n.t('paywall.pricing.billing_info', { period: 'monthly' }),
      hasResources: i18n.hasResourceBundle(detectedLng, 'translation')
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize i18n:', error);
  }
};

// Export dinamik i18n fonksiyonları
export { changeLanguage, initializeI18n };
export default i18n;
