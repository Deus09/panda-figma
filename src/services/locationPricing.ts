// Location and Pricing Service
export interface PricingTier {
  monthly: number;
  yearly: number;
  currency: string;
  currencySymbol: string;
  region: string;
}

export interface LocationInfo {
  country: string;
  countryCode: string;
  currency: string;
  region: 'turkey' | 'usa' | 'europe' | 'other';
}

const PRICING_TIERS: Record<string, PricingTier> = {
  turkey: {
    monthly: 29.99,
    yearly: 300,
    currency: 'TRY',
    currencySymbol: '₺',
    region: 'turkey'
  },
  usa: {
    monthly: 1,
    yearly: 10,
    currency: 'USD',
    currencySymbol: '$',
    region: 'usa'
  },
  europe: {
    monthly: 1,
    yearly: 10,
    currency: 'EUR',
    currencySymbol: '€',
    region: 'europe'
  },
  other: {
    monthly: 1,
    yearly: 10,
    currency: 'USD',
    currencySymbol: '$',
    region: 'other'
  }
};

// European Union country codes
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

export class LocationPricingService {
  private static cachedLocation: LocationInfo | null = null;
  
    /**
   * Get user's location using browser APIs and fallback services
   */
  static async getUserLocation(): Promise<LocationInfo> {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Method 1: Browser timezone-based detection (most reliable)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 Detected timezone:', timezone);
      
      if (timezone.includes('Europe/Istanbul') || timezone.includes('Asia/Istanbul')) {
        const locationInfo = this.processLocationData('TR', 'Turkey', 'TRY');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
      
      if (timezone.includes('America/')) {
        const locationInfo = this.processLocationData('US', 'United States', 'USD');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
      
      if (timezone.includes('Europe/')) {
        const locationInfo = this.processLocationData('DE', 'Germany', 'EUR');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
    } catch (error) {
      console.warn('Timezone detection failed:', error);
    }

    try {
      // Method 2: Browser language-based detection
      const language = navigator.language || 'en-US';
      console.log('🌍 Detected language:', language);
      
      if (language.startsWith('tr')) {
        const locationInfo = this.processLocationData('TR', 'Turkey', 'TRY');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
      
      if (language.startsWith('en-US')) {
        const locationInfo = this.processLocationData('US', 'United States', 'USD');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
      
      if (language.startsWith('es')) {
        const locationInfo = this.processLocationData('ES', 'Spain', 'EUR');
        this.cachedLocation = locationInfo;
        return locationInfo;
      }
      
      // Default to Europe for other European languages
      const locationInfo = this.processLocationData('DE', 'Germany', 'EUR');
      this.cachedLocation = locationInfo;
      return locationInfo;
      
    } catch (error) {
      console.warn('Language detection failed:', error);
    }

    // Final fallback: Europe pricing
    console.log('🔄 Using fallback location: Europe');
    const fallbackLocation = this.processLocationData('DE', 'Germany', 'EUR');
    this.cachedLocation = fallbackLocation;
    return fallbackLocation;
  }

  /**
   * Process location data and determine region
   */
  private static processLocationData(countryCode: string, countryName: string, currency?: string): LocationInfo {
    const upperCountryCode = countryCode?.toUpperCase();
    
    let region: LocationInfo['region'] = 'other';
    
    if (upperCountryCode === 'TR') {
      region = 'turkey';
    } else if (upperCountryCode === 'US') {
      region = 'usa';
    } else if (EU_COUNTRIES.includes(upperCountryCode)) {
      region = 'europe';
    }

    return {
      country: countryName || 'Unknown',
      countryCode: upperCountryCode || 'XX',
      currency: currency || 'USD',
      region
    };
  }

  /**
   * Fallback: determine location from browser locale
   */
  private static getLocationFromLocale(): LocationInfo {
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    const countryCode = locale.split('-')[1]?.toUpperCase() || 'US';
    
    let region: LocationInfo['region'] = 'other';
    
    if (countryCode === 'TR') {
      region = 'turkey';
    } else if (countryCode === 'US') {
      region = 'usa';
    } else if (EU_COUNTRIES.includes(countryCode)) {
      region = 'europe';
    }

    const locationInfo: LocationInfo = {
      country: countryCode,
      countryCode,
      currency: region === 'turkey' ? 'TRY' : region === 'europe' ? 'EUR' : 'USD',
      region
    };

    this.cachedLocation = locationInfo;
    return locationInfo;
  }

  /**
   * Get pricing for user's location
   */
  static async getPricingForLocation(): Promise<PricingTier> {
    try {
      const location = await this.getUserLocation();
      console.log('📍 User location detected:', location);
      
      const pricing = this.getPricingTier(location.region);
      console.log('💰 Pricing for location:', pricing);
      
      return pricing;
    } catch (error) {
      console.error('❌ Failed to get location pricing:', error);
      // Fallback to Europe pricing
      console.log('🔄 Falling back to Europe pricing');
      return PRICING_TIERS.europe;
    }
  }

  /**
   * Get pricing tier for region
   */
  static getPricingTier(region: 'turkey' | 'usa' | 'europe' | 'other'): PricingTier {
    return PRICING_TIERS[region] || PRICING_TIERS.europe;
  }

  /**
   * Format price with currency
   */
  static formatPrice(amount: number, pricing: PricingTier): string {
    // Special handling for Turkish Lira (symbol after)
    if (pricing.currency === 'TRY') {
      return `${amount.toFixed(2)} ${pricing.currencySymbol}`;
    }
    
    // For USD and EUR (symbol before)
    return `${pricing.currencySymbol}${amount.toFixed(amount >= 10 ? 0 : 2)}`;
  }

  /**
   * Get discount percentage for yearly plan
   */
  static getYearlyDiscount(pricing: PricingTier): number {
    const monthlyTotal = pricing.monthly * 12;
    const discount = ((monthlyTotal - pricing.yearly) / monthlyTotal) * 100;
    return Math.round(discount);
  }

  /**
   * Clear cached location (for testing)
   */
  static clearCache(): void {
    this.cachedLocation = null;
  }
}
