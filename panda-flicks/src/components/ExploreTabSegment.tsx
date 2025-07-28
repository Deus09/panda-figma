import React from 'react';

type ExploreTabType = 'flicks' | 'series';

interface ExploreTabSegmentProps {
  activeTab: ExploreTabType;
  onTabChange: (tab: ExploreTabType) => void;
}

const ExploreTabSegment: React.FC<ExploreTabSegmentProps> = ({ activeTab, onTabChange }) => (
  <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] border-r border-white rounded-l-[10px] transition-all duration-300 ${activeTab === 'flicks' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      onClick={() => onTabChange('flicks')}
      type="button"
    >
      Flicks
    </button>
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'series' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      style={{ borderLeft: 'none' }}
      onClick={() => onTabChange('series')}
      type="button"
    >
      Series
    </button>
  </div>
);

export default ExploreTabSegment;
