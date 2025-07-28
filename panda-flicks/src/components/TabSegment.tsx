import React from 'react';

type TabType = 'watched' | 'watchlist';

interface TabSegmentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSegment: React.FC<TabSegmentProps> = ({ activeTab, onTabChange }) => (
  <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] border-r border-white rounded-l-[10px] transition-all duration-300 ${activeTab === 'watched' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      onClick={() => onTabChange('watched')}
      type="button"
    >
      Watched
    </button>
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      style={{ borderLeft: 'none' }}
      onClick={() => onTabChange('watchlist')}
      type="button"
    >
      Watchlist
    </button>
  </div>
);

export default TabSegment; 