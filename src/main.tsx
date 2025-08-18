import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeI18n } from './i18n'; // i18n dinamik başlatma

// i18n'i başlat ve app'i render et
const startApp = async () => {
  await initializeI18n();
  
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

startApp().catch(console.error);