import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonModal } from '@ionic/react';

export type FilterOptions = {
  contentType: 'all' | 'movie' | 'tv';
  sortBy: 'date_desc' | 'rating_desc' | 'alpha_asc';
};

interface FilterModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  initialFilters: FilterOptions;
  onApplyFilters: (newFilters: FilterOptions) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onDidDismiss, 
  initialFilters, 
  onApplyFilters 
}) => {
  const { t } = useTranslation();
  const [tempFilters, setTempFilters] = useState<FilterOptions>(initialFilters);

  // Sıfırlama fonksiyonu
  const handleReset = () => {
    setTempFilters({
      contentType: 'all',
      sortBy: 'date_desc'
    });
  };

  // Filtreleri uygulama
  const handleApply = () => {
    onApplyFilters(tempFilters);
  };

  // Modal açıldığında tempFilters'ı güncelle
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onDidDismiss}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.4, 0.5, 0.7]}
      className="filter-modal"
    >
      {/* Ana Modal Container - Sadece Dark Mode */}
      <div className="bg-[#1a1a1a] text-gray-100 h-full rounded-t-[20px] relative">
        {/* Pull Indicator - Daha ince */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Modal Header - Daha kompakt */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <h2 className="text-lg font-semibold text-gray-100">
            {t('search.filter')}
          </h2>
          <button 
            onClick={onDidDismiss}
            className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>

        {/* Modal Content - Daha kompakt spacing */}
        <div className="px-4 py-4 space-y-5">
          {/* İçerik Türü Filtresi */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              {t('movies.movies')}
            </h3>
            <div className="flex gap-2">
              {[
                { value: 'all', label: t('common.all', 'Tümü') },
                { value: 'movie', label: t('movies.movie') },
                { value: 'tv', label: t('movies.tv_show') }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempFilters(prev => ({ 
                    ...prev, 
                    contentType: option.value as 'all' | 'movie' | 'tv' 
                  }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tempFilters.contentType === option.value
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sıralama Filtresi */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              {t('search.sort_by')}
            </h3>
            <div className="flex gap-2">
              {[
                { value: 'date_desc', label: t('movies.release_date', 'Tarih') },
                { value: 'rating_desc', label: t('movies.rating') },
                { value: 'alpha_asc', label: t('common.alphabetical', 'Alfabetik') }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempFilters(prev => ({ 
                    ...prev, 
                    sortBy: option.value as 'date_desc' | 'rating_desc' | 'alpha_asc' 
                  }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tempFilters.sortBy === option.value
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer - Daha kompakt */}
        <div className="px-4 pb-4">
          <button 
            onClick={handleApply}
            className="w-full py-3 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
          >
            {t('search.search_results', 'Sonuçları Göster')}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default FilterModal;
