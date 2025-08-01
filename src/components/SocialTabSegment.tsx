import React from 'react';

type SocialTabType = 'news' | 'reviews';

interface SocialTabSegmentProps {
  activeTab: SocialTabType;
  onTabChange: (tab: SocialTabType) => void;
}

const SocialTabSegment: React.FC<SocialTabSegmentProps> = ({ activeTab, onTabChange }) => (
  <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] border-r border-white rounded-l-[10px] transition-all duration-300 ${activeTab === 'news' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      onClick={() => onTabChange('news')}
      type="button"
    >
      News
    </button>
    <button
      className={`w-[100px] h-full flex items-center justify-center font-poppins font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'reviews' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
      style={{ borderLeft: 'none' }}
      onClick={() => onTabChange('reviews')}
      type="button"
    >
      Reviews
    </button>
  </div>
);

export default SocialTabSegment; 