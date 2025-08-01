import React from 'react';
import { useTranslation } from 'react-i18next';

type SocialTabType = 'news' | 'reviews';

interface SocialTabSegmentProps {
  activeTab: SocialTabType;
  onTabChange: (tab: SocialTabType) => void;
}

const SocialTabSegment: React.FC<SocialTabSegmentProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-[160px] max-w-[200px] h-[25px] rounded-[10px] overflow-hidden border border-white bg-[#222]">
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] border-r border-white rounded-l-[10px] transition-all duration-300 px-2 ${activeTab === 'news' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        onClick={() => onTabChange('news')}
        type="button"
      >
        {t('tabs.news')}
      </button>
      <button
        className={`flex-1 h-full flex items-center justify-center font-poppins font-semibold text-[14px] leading-[20px] rounded-r-[10px] transition-all duration-300 px-2 ${activeTab === 'reviews' ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'}`}
        style={{ borderLeft: 'none' }}
        onClick={() => onTabChange('reviews')}
        type="button"
      >
        {t('tabs.reviews')}
      </button>
    </div>
  );
};

export default SocialTabSegment; 