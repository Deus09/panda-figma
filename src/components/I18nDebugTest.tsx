import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const I18nDebugTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = (lng: string) => {
    console.log(`🔄 Debug: Changing language to: ${lng}`);
    changeLanguage(lng);
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Lang: {i18n.language}</div>
      <div>Ready: {i18n.isInitialized ? 'Yes' : 'No'}</div>
      <div style={{ marginTop: '5px' }}>
        <button onClick={() => handleLanguageChange('tr')} style={{ margin: '2px', padding: '2px 5px', fontSize: '10px' }}>TR</button>
        <button onClick={() => handleLanguageChange('en')} style={{ margin: '2px', padding: '2px 5px', fontSize: '10px' }}>EN</button>
        <button onClick={() => handleLanguageChange('es')} style={{ margin: '2px', padding: '2px 5px', fontSize: '10px' }}>ES</button>
      </div>
      <div>Title: "{t('paywall.title')}"</div>
      <div>Subtitle: "{t('paywall.subtitle')}"</div>
      <div>Features: "{t('paywall.features.unlimited_ai')}"</div>
    </div>
  );
};

export default I18nDebugTest;
