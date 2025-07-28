import React, { useState, useEffect } from 'react';
import LocalStorageService, { UserPreferences } from '../services/localStorage';

interface SettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = [
  'Aksiyon', 'Komedi', 'Drama', 'Korku', 'Bilim Kurgu', 
  'Romantik', 'Gerilim', 'Animasyon', 'Belgesel', 'Fantastik',
  'Macera', 'Suç', 'Müzikal', 'Western', 'Savaş'
];

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-card-foreground font-medium font-sans">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Genre Chip Component
const GenreChip: React.FC<{
  genre: string;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ genre, isSelected, onToggle }) => (
  <button
    onClick={onToggle}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
      isSelected
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
        : 'bg-secondary text-secondary-foreground border border-border hover:border-primary hover:text-card-foreground'
    }`}
  >
    {genre}
  </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen = true, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    darkMode: true,
    language: 'tr',
    defaultView: 'watched'
  });

  useEffect(() => {
    if (isOpen) {
      const savedPrefs = LocalStorageService.getUserPreferences();
      setPreferences(savedPrefs);
    }
  }, [isOpen]);

  const handleSavePreferences = () => {
    try {
      LocalStorageService.saveUserPreferences(preferences);
      
      // Apply dark mode theme immediately
      if (preferences.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handleGenreToggle = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleExportData = () => {
    try {
      const data = LocalStorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panda-flicks-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Veriler dışa aktarılırken hata oluştu');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = LocalStorageService.importData(jsonData);
        if (success) {
          alert('Veriler başarıyla içe aktarıldı');
          const newPrefs = LocalStorageService.getUserPreferences();
          setPreferences(newPrefs);
        } else {
          alert('Veriler içe aktarılırken hata oluştu');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Geçersiz dosya formatı');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-card rounded-[20px] p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-sans text-card-foreground">Ayarlar</h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-card-foreground transition-colors p-2 hover:bg-muted rounded-full"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Görünüm Kartı */}
        <div className="bg-[#222] rounded-[16px] p-6 mb-6 border border-[#333]">
          <h3 className="text-lg font-semibold mb-4 text-[#FE7743] font-poppins flex items-center">
            <svg width="20" height="20" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Görünüm
          </h3>
          
          <ToggleSwitch
            checked={preferences.darkMode}
            onChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
            label="Karanlık Mod"
          />

          <div className="mt-4 pt-4 border-t border-[#333]">
            <label className="block text-white font-medium mb-2 font-poppins">Varsayılan Görünüm</label>
            <select
              value={preferences.defaultView}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value as 'watched' | 'watchlist' }))}
              className="w-full p-3 bg-[#333] text-white rounded-lg border border-[#444] focus:border-[#FE7743] focus:outline-none font-poppins"
            >
              <option value="watched">İzlediğim Filmler</option>
              <option value="watchlist">İzleme Listesi</option>
            </select>
          </div>
        </div>

        {/* Tercihler Kartı */}
        <div className="bg-[#222] rounded-[16px] p-6 mb-6 border border-[#333]">
          <h3 className="text-lg font-semibold mb-4 text-[#FE7743] font-poppins flex items-center">
            <svg width="20" height="20" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Tercihler
          </h3>
          
          <div>
            <p className="text-gray-300 text-sm mb-3 font-poppins">Favori Film Türleri</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map(genre => (
                <GenreChip
                  key={genre}
                  genre={genre}
                  isSelected={preferences.favoriteGenres.includes(genre)}
                  onToggle={() => handleGenreToggle(genre)}
                />
              ))}
            </div>
            {preferences.favoriteGenres.length > 0 && (
              <p className="text-xs text-gray-400 mt-3 font-poppins">
                {preferences.favoriteGenres.length} tür seçildi
              </p>
            )}
          </div>
        </div>

        {/* Veri Yönetimi Kartı */}
        <div className="bg-[#222] rounded-[16px] p-6 mb-6 border border-[#333]">
          <h3 className="text-lg font-semibold mb-4 text-[#FE7743] font-poppins flex items-center">
            <svg width="20" height="20" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            </svg>
            Veri Yönetimi
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full p-3 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-lg font-medium transition-colors font-poppins flex items-center justify-center"
            >
              <svg width="16" height="16" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Verileri Dışa Aktar
            </button>
            
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <span className="w-full p-3 bg-[#4CAF50] hover:bg-[#45A049] text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center font-poppins">
                <svg width="16" height="16" className="mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                </svg>
                Verileri İçe Aktar
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-[#333] hover:bg-[#444] text-white rounded-lg font-medium transition-colors font-poppins"
          >
            İptal
          </button>
          <button
            onClick={handleSavePreferences}
            className="flex-1 p-3 bg-[#FE7743] hover:bg-[#E56A3C] text-white rounded-lg font-medium transition-colors font-poppins shadow-lg shadow-[#FE7743]/25"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
