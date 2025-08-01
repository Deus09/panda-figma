import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
