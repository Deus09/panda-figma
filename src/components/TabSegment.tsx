import React from 'react';
import { useTranslation } from 'react-i18next';

type TabType = 'watched' | 'watchlist';

interface TabSegmentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSegment: React.FC<TabSegmentProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
      <button
        className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] border-r border-white rounded-l-[10px] transition-all duration-300 ${activeTab === 'watched' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        onClick={() => onTabChange('watched')}
        type="button"
      >
        {t('tabs.watched')}
      </button>
      <button
        className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        style={{ borderLeft: 'none' }}
        onClick={() => onTabChange('watchlist')}
        type="button"
      >
        {t('tabs.watchlist')}
      </button>
    </div>
  );
};

export default TabSegment; 