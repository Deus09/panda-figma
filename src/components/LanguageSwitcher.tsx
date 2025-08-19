import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage as changeI18nLanguage } from '../i18n';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', short: 'TR' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' }
  ];

  // i18n dil değişikliklerini dinle
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('🌍 Language changed to:', lng);
      setCurrentLang(lng);
    };

    const handleCustomLanguageChange = (event: CustomEvent) => {
      console.log('🔄 Custom language change event:', event.detail);
      setCurrentLang(event.detail);
    };

    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('languageChanged', handleCustomLanguageChange as EventListener);
    
    // İlk load'da da güncelle
    setCurrentLang(i18n.language || 'en');

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChanged', handleCustomLanguageChange as EventListener);
    };
  }, [i18n]);

  const changeLanguage = async (lng: string) => {
    console.log('🔄 Changing language to:', lng);
    try {
      await changeI18nLanguage(lng);
      console.log('✅ Language changed successfully to:', lng);
    } catch (error) {
      console.error('❌ Failed to change language:', error);
    }
    setIsOpen(false);
  };

  // Mevcut dili doğru bulma - fallback dahil
  const getCurrentLanguage = () => {
    const currentLangCode = currentLang || 'en';
    console.log('🌍 Current language code:', currentLangCode);
    
    // Tam eşleşme ara
    const exactMatch = languages.find(lang => lang.code === currentLangCode);
    if (exactMatch) return exactMatch;
    
    // Kısaltma ile eşleşme ara (örn: en-US -> en)
    const shortMatch = languages.find(lang => currentLangCode.startsWith(lang.code));
    if (shortMatch) return shortMatch;
    
    // Fallback İngilizce
    return languages.find(lang => lang.code === 'en') || languages[0];
  };

  const currentLanguage = getCurrentLanguage();

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (compact) {
    return (
      <div className="language-switcher-minimal" ref={dropdownRef}>
        <button
          className="minimal-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="flag-text">{currentLanguage.flag}</span>
          <svg 
            className={`chevron-icon ${isOpen ? 'rotated' : ''}`} 
            width="8" 
            height="8" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        
        {isOpen && (
          <div className="minimal-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`dropdown-item ${currentLang === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                type="button"
              >
                <span className="flag-text">{lang.flag}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 font-poppins">{t('profile.language')}:</span>
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentLang === lang.code
                ? 'bg-[#FE7743] text-white shadow-lg'
                : 'bg-[#333] text-gray-300 hover:bg-[#444] hover:text-white'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
