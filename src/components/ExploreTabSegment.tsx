import React from 'react';
import { useTranslation } from 'react-i18next';

type ExploreTabType = 'filmler' | 'series';

interface ExploreTabSegmentProps {
  activeTab: ExploreTabType;
  onTabChange: (tab: ExploreTabType) => void;
}

const ExploreTabSegment: React.FC<ExploreTabSegmentProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-[160px] max-w-[200px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] border-r border-white rounded-l-[10px] transition-all duration-300 px-2 ${activeTab === 'filmler' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        onClick={() => onTabChange('filmler')}
        type="button"
      >
        {t('tabs.movies')}
      </button>
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] rounded-r-[10px] transition-all duration-300 px-2 ${activeTab === 'series' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        style={{ borderLeft: 'none' }}
        onClick={() => onTabChange('series')}
        type="button"
      >
        {t('tabs.series')}
      </button>
    </div>
  );
};

export default ExploreTabSegment;
