import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonContent, 
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';

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
      initialBreakpoint={0.6}
      breakpoints={[0, 0.4, 0.6, 0.8]}
      className="filter-modal"
    >
      {/* Ana Modal Container - Uygulamanın tema renkleriyle */}
      <div className="bg-[#222] text-[#F8F8FF] h-full rounded-t-[24px] relative">
        {/* Pull Indicator */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-12 h-1.5 bg-[#555] rounded-full"></div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <button 
            onClick={handleReset}
            className="text-[#FE7743] text-[16px] font-semibold font-poppins hover:text-[#FE7743]/80 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <h2 className="text-[20px] font-bold font-poppins text-[#F8F8FF]">
            {t('search.filter')}
          </h2>
          <button 
            onClick={onDidDismiss}
            className="text-[#F8F8FF] text-[16px] font-semibold font-poppins hover:text-[#F8F8FF]/70 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6 space-y-6">
          {/* İçerik Türü Filtresi */}
          <div>
            <h3 className="text-[18px] font-semibold font-poppins text-[#F8F8FF] mb-4">
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
                  className={`flex-1 py-3 px-4 rounded-[12px] text-[16px] font-semibold font-poppins transition-all duration-200 ${
                    tempFilters.contentType === option.value
                      ? 'bg-[#FE7743] text-[#F8F8FF] shadow-lg'
                      : 'bg-[#333] text-[#B0B0B0] hover:bg-[#404040] hover:text-[#F8F8FF]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sıralama Filtresi */}
          <div>
            <h3 className="text-[18px] font-semibold font-poppins text-[#F8F8FF] mb-4">
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
                  className={`flex-1 py-3 px-4 rounded-[12px] text-[16px] font-semibold font-poppins transition-all duration-200 ${
                    tempFilters.sortBy === option.value
                      ? 'bg-[#FE7743] text-[#F8F8FF] shadow-lg'
                      : 'bg-[#333] text-[#B0B0B0] hover:bg-[#404040] hover:text-[#F8F8FF]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6">
          <button 
            onClick={handleApply}
            className="w-full py-4 rounded-[12px] bg-[#FE7743] text-[#F8F8FF] text-[18px] font-bold font-poppins hover:bg-[#FE7743]/90 transition-colors shadow-lg"
          >
            {t('search.search_results', 'Sonuçları Göster')}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default FilterModal;
