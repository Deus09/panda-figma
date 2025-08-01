import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', short: 'TR' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1];

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
                className={`dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
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
              i18n.language === lang.code
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
