import React from 'react';
import { useTranslation } from 'react-i18next';

type SearchTabType = 'all' | 'movies' | 'series' | 'persons';

interface SearchTabSegmentProps {
  activeTab: SearchTabType;
  onTabChange: (tab: SearchTabType) => void;
  counts: {
    movies: number;
    series: number;
    persons: number;
  };
}

const SearchTabSegment: React.FC<SearchTabSegmentProps> = ({ activeTab, onTabChange, counts }) => {
  const { t } = useTranslation();
  
  const tabs = [
    { key: 'all' as SearchTabType, label: t('tabs.all'), count: counts.movies + counts.series + counts.persons },
    { key: 'movies' as SearchTabType, label: t('tabs.movies'), count: counts.movies },
    { key: 'series' as SearchTabType, label: t('tabs.series'), count: counts.series },
    { key: 'persons' as SearchTabType, label: t('tabs.persons'), count: counts.persons },
  ];

  return (
    <div className="flex bg-[#222] rounded-[10px] overflow-hidden border border-white">
      {tabs.map((tab, index) => (
        <button
          key={tab.key}
          className={`px-3 py-1.5 flex items-center justify-center font-poppins font-semibold text-xs transition-all duration-300 ${
            activeTab === tab.key ? 'bg-white text-[#FE7743]' : 'bg-[#222] text-white'
          } ${index !== tabs.length - 1 ? 'border-r border-white' : ''}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
        >
          {tab.label} {tab.count > 0 && `(${tab.count})`}
        </button>
      ))}
    </div>
  );
};

export default SearchTabSegment;
