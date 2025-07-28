import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // localStorage'dan tema tercihini al, yoksa sistem tercihini kontrol et
  const getInitialTheme = (): Theme => {
    try {
      // Önce 'theme' key'ini kontrol et
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
      
      // Sonra user preferences'taki darkMode'u kontrol et
      const userPrefsStr = localStorage.getItem('panda-flicks-user-preferences');
      if (userPrefsStr) {
        try {
          const userPrefs = JSON.parse(userPrefsStr);
          if (typeof userPrefs.darkMode === 'boolean') {
            return userPrefs.darkMode ? 'dark' : 'light';
          }
        } catch (error) {
          console.error('Error parsing user preferences:', error);
        }
      }
      
      // Sistem tercihini kontrol et
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return 'light';
    }
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Tema değiştirme fonksiyonu
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Tema toggle fonksiyonu
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Tema değiştiğinde DOM'a uygula ve localStorage'a kaydet
  useEffect(() => {
    try {
      // Mevcut tema class'larını temizle
      document.documentElement.classList.remove('light', 'dark');
      
      // Yeni tema class'ını ekle
      document.documentElement.classList.add(theme);
      
      // localStorage'a kaydet
      localStorage.setItem('theme', theme);
      
      // User preferences'taki darkMode'u da güncelle
      try {
        const userPrefsStr = localStorage.getItem('panda-flicks-user-preferences');
        if (userPrefsStr) {
          const userPrefs = JSON.parse(userPrefsStr);
          userPrefs.darkMode = theme === 'dark';
          localStorage.setItem('panda-flicks-user-preferences', JSON.stringify(userPrefs));
        }
      } catch (prefError) {
        console.error('Error updating user preferences:', prefError);
      }
      
      // body'ye de class ekle (eski stil uyumluluk için)
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
      
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme]);

  // Sistem tema değişikliklerini dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Sadece localStorage'da tema yoksa sistem tercihini uygula
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
