import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/react';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', short: 'TR' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1];

  if (compact) {
    return (
      <div className="language-switcher-accordion min-w-[100px]">
        <IonAccordionGroup>
          <IonAccordion value="language">
            <IonItem 
              slot="header" 
              className="header-item"
            >
              <IonLabel className="text-white text-sm font-medium">
                <span className="mr-1">{currentLanguage.flag}</span>
                {currentLanguage.short}
              </IonLabel>
            </IonItem>
            
            <div slot="content" className="content-container">
              {languages.map((lang) => (
                <IonItem
                  key={lang.code}
                  button
                  onClick={() => changeLanguage(lang.code)}
                  className={`content-item ${i18n.language === lang.code ? 'active' : ''}`}
                >
                  <IonLabel className={`text-sm font-medium ${
                    i18n.language === lang.code ? 'text-white' : 'text-gray-300'
                  }`}>
                    <span className="mr-2">{lang.flag}</span>
                    {lang.short}
                  </IonLabel>
                </IonItem>
              ))}
            </div>
          </IonAccordion>
        </IonAccordionGroup>
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
