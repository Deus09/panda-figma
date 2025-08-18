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
    <div className="flex min-w-[160px] max-w-[200px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] border-r border-white rounded-l-[9px] transition-all duration-300 px-2 ${activeTab === 'watched' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        onClick={() => onTabChange('watched')}
        type="button"
      >
        {t('tabs.watched')}
      </button>
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] rounded-r-[9px] transition-all duration-300 px-2 ${activeTab === 'watchlist' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
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