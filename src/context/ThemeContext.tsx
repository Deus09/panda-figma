import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark';

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
  // Her zaman dark tema kullan
  const getInitialTheme = (): Theme => {
    return 'dark';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Tema değiştirme fonksiyonu (sadece dark tema için)
  const setTheme = (newTheme: Theme) => {
    setThemeState('dark'); // Her zaman dark tema
  };

  // Tema toggle fonksiyonu (dark tema sabit kalır)
  const toggleTheme = () => {
    // Her zaman dark tema kalsın
    setTheme('dark');
  };

  // Tema değiştiğinde DOM'a uygula ve localStorage'a kaydet
  useEffect(() => {
    try {
      // Mevcut tema class'larını temizle
      document.documentElement.classList.remove('light', 'dark');
      // Her zaman dark tema class'ını ekle
      document.documentElement.classList.add('dark');
      
      // localStorage'a dark tema kaydet
      localStorage.setItem('theme', 'dark');
      
      // User preferences'taki darkMode'u da true yap
      try {
        const userPrefsStr = localStorage.getItem('moviloi-user-preferences');
        if (userPrefsStr) {
          const userPrefs = JSON.parse(userPrefsStr);
          userPrefs.darkMode = true;
          localStorage.setItem('moviloi-user-preferences', JSON.stringify(userPrefs));
        } else {
          // Eğer user preferences yoksa, darkMode: true ile oluştur
          const defaultPrefs = { darkMode: true };
          localStorage.setItem('moviloi-user-preferences', JSON.stringify(defaultPrefs));
        }
      } catch (prefError) {
        console.error('Error updating user preferences:', prefError);
      }
      
      // body'ye de class ekle (eski stil uyumluluk için)
      document.body.classList.remove('light', 'dark');
      document.body.classList.add('dark');
    } catch (error) {
      console.error('Error applying theme:', error);
    }
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
