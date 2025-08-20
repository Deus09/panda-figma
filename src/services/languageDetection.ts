// src/services/languageDetection.ts

export interface LocationInfo {
  country: string;
  region: string;
  timezone: string;
  language: string;
}

/**
 * IP adresinden konum ve dil bilgisi alır
 */
export const detectLanguageFromIP = async (): Promise<string | null> => {
  try {
    // Ücretsiz IP geolocation servisi
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    console.log('🌍 IP-based location data:', data);
    
    // Ülke kodlarına göre dil eşleştirme
    const countryLanguageMap: { [key: string]: string } = {
      'TR': 'tr', // Türkiye
      'ES': 'es', // İspanya
      'MX': 'es', // Meksika
      'AR': 'es', // Arjantin
      'CO': 'es', // Kolombiya
      'PE': 'es', // Peru
      'VE': 'es', // Venezuela
      'CL': 'es', // Şili
      'EC': 'es', // Ekvador
      'BO': 'es', // Bolivya
      'PY': 'es', // Paraguay
      'UY': 'es', // Uruguay
      'US': 'en', // ABD
      'GB': 'en', // İngiltere
      'AU': 'en', // Avustralya
      'CA': 'en', // Kanada
      'NZ': 'en', // Yeni Zelanda
      'IE': 'en', // İrlanda
    };
    
    const detectedLang = countryLanguageMap[data.country_code];
    if (detectedLang) {
      console.log(`🌍 IP-based language detected: ${detectedLang} (Country: ${data.country_name})`);
      return detectedLang;
    }
    
    return null;
  } catch (error) {
    console.warn('🚫 IP-based language detection failed:', error);
    return null;
  }
};

/**
 * Tarayıcı dil tercihlerinden dil algılar
 */
export const detectLanguageFromBrowser = (): string | null => {
  try {
    // navigator.languages array'ini kontrol et
    const browserLanguages = navigator.languages || [navigator.language];
    console.log('🌐 Browser languages:', browserLanguages);
    
    for (const lang of browserLanguages) {
      const langCode = lang.includes('-') ? lang.split('-')[0] : lang;
      if (['tr', 'en', 'es'].includes(langCode)) {
        console.log(`🌐 Browser language detected: ${langCode}`);
        return langCode;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('🚫 Browser language detection failed:', error);
    return null;
  }
};

/**
 * Saat diliminden dil algılar
 */
export const detectLanguageFromTimezone = (): string | null => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('🕐 User timezone:', timezone);
    
    // Türkiye
    if (timezone.includes('Istanbul') || timezone.includes('Europe/Istanbul')) {
      return 'tr';
    }
    
    // İspanyolca bölgeler
    if (timezone.includes('Madrid') || timezone.includes('Europe/Madrid') || 
        timezone.includes('America/Argentina') || timezone.includes('America/Mexico') ||
        timezone.includes('America/Bogota') || timezone.includes('America/Lima') ||
        timezone.includes('America/Santiago') || timezone.includes('America/Caracas')) {
      return 'es';
    }
    
    // İngilizce bölgeler (varsayılan olarak)
    if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles') ||
        timezone.includes('Europe/London') || timezone.includes('Australia/Sydney')) {
      return 'en';
    }
    
    return null;
  } catch (error) {
    console.warn('🚫 Timezone language detection failed:', error);
    return null;
  }
};

/**
 * Coğrafi konum API'sından dil algılar
 */
export const detectLanguageFromGeolocation = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('🚫 Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 User coordinates: ${latitude}, ${longitude}`);
        
        // Türkiye koordinatları
        if (latitude >= 36 && latitude <= 42 && longitude >= 26 && longitude <= 45) {
          console.log('📍 Geolocation detected: Turkey (tr)');
          resolve('tr');
          return;
        }
        
        // İspanya
        if (latitude >= 36 && latitude <= 44 && longitude >= -9 && longitude <= 3) {
          console.log('📍 Geolocation detected: Spain (es)');
          resolve('es');
          return;
        }
        
        // Latin Amerika (genel)
        if (latitude >= -55 && latitude <= 32 && longitude >= -117 && longitude <= -34) {
          console.log('📍 Geolocation detected: Latin America (es)');
          resolve('es');
          return;
        }
        
        // ABD/Kanada
        if (latitude >= 25 && latitude <= 72 && longitude >= -168 && longitude <= -52) {
          console.log('📍 Geolocation detected: North America (en)');
          resolve('en');
          return;
        }
        
        console.log('📍 Geolocation: No specific region detected');
        resolve(null);
      },
      (error) => {
        console.warn('🚫 Geolocation error:', error.message);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};

/**
 * Kapsamlı dil algılama - tüm yöntemleri sırayla dener
 */
export const detectUserLanguage = async (): Promise<string> => {
  console.log('🔍 Starting comprehensive language detection...');
  
  // 1. Önceden kaydedilmiş tercih
  const savedLanguage = localStorage.getItem('preferred-language');
  if (savedLanguage && ['tr', 'en', 'es'].includes(savedLanguage)) {
    console.log('✅ Found saved language preference:', savedLanguage);
    return savedLanguage;
  }
  
  // 2. IP tabanlı konum
  const ipLanguage = await detectLanguageFromIP();
  if (ipLanguage) {
    localStorage.setItem('detected-language-method', 'ip');
    localStorage.setItem('preferred-language', ipLanguage);
    return ipLanguage;
  }
  
  // 3. Coğrafi konum
  const geoLanguage = await detectLanguageFromGeolocation();
  if (geoLanguage) {
    localStorage.setItem('detected-language-method', 'geolocation');
    localStorage.setItem('preferred-language', geoLanguage);
    return geoLanguage;
  }
  
  // 4. Saat dilimi
  const timezoneLanguage = detectLanguageFromTimezone();
  if (timezoneLanguage) {
    localStorage.setItem('detected-language-method', 'timezone');
    localStorage.setItem('preferred-language', timezoneLanguage);
    return timezoneLanguage;
  }
  
  // 5. Tarayıcı dili
  const browserLanguage = detectLanguageFromBrowser();
  if (browserLanguage) {
    localStorage.setItem('detected-language-method', 'browser');
    localStorage.setItem('preferred-language', browserLanguage);
    return browserLanguage;
  }
  
  // 6. Varsayılan
  console.log('🔄 Using default language: en');
  localStorage.setItem('detected-language-method', 'default');
  return 'en';
};
