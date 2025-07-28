import React, { useState, useEffect } from 'react';
import LocalStorageService, { UserPreferences } from '../services/localStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = [
  'Aksiyon', 'Komedi', 'Drama', 'Korku', 'Bilim Kurgu', 
  'Romantik', 'Gerilim', 'Animasyon', 'Belgesel', 'Fantastik'
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    darkMode: true,
    language: 'tr',
    defaultView: 'watched'
  });
  const [storageSize, setStorageSize] = useState('0 KB');

  useEffect(() => {
    if (isOpen) {
      const savedPrefs = LocalStorageService.getUserPreferences();
      setPreferences(savedPrefs);
      setStorageSize(LocalStorageService.getStorageSize());
    }
  }, [isOpen]);

  const handleSavePreferences = () => {
    try {
      LocalStorageService.saveUserPreferences(preferences);
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

  const handleClearData = () => {
    if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
      try {
        LocalStorageService.clearAllData();
        setStorageSize('0 KB');
        setPreferences({
          favoriteGenres: [],
          darkMode: true,
          language: 'tr',
          defaultView: 'watched'
        });
        alert('Veriler başarıyla silindi');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Veriler silinirken hata oluştu');
      }
    }
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
          setStorageSize(LocalStorageService.getStorageSize());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-poppins text-black">Ayarlar</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Favori Türler */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Favori Film Türleri</h3>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_GENRES.map(genre => (
              <label key={genre} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.favoriteGenres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                  className="mr-2"
                />
                <span className="text-sm text-black">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tema */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Tema</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => setPreferences(prev => ({ ...prev, darkMode: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-black">Karanlık Mod</span>
          </label>
        </div>

        {/* Varsayılan Görünüm */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Varsayılan Görünüm</h3>
          <select
            value={preferences.defaultView}
            onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value as 'watched' | 'watchlist' }))}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="watched">İzlediğim Filmler</option>
            <option value="watchlist">İzleme Listesi</option>
          </select>
        </div>

        {/* Depolama Bilgileri */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Depolama</h3>
          <p className="text-sm text-gray-600 mb-3">Kullanılan alan: {storageSize}</p>
          <div className="space-y-2">
            <button
              onClick={handleExportData}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Verileri Dışa Aktar
            </button>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <span className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer block text-center">
                Verileri İçe Aktar
              </span>
            </label>
            <button
              onClick={handleClearData}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Tüm Verileri Sil
            </button>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={handleSavePreferences}
            className="flex-1 p-2 bg-[#FE7743] text-white rounded hover:bg-[#e66a3a]"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
