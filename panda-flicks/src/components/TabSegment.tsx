import React from 'react';

type TabType = 'watched' | 'watchlist';

interface TabSegmentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSegment: React.FC<TabSegmentProps> = ({ activeTab, onTabChange }) => (
  <div className="flex w-[193px] h-[25px] rounded-[10px] overflow-hidden border border-border bg-muted">
    <button
      className={`w-[100px] h-full flex items-center justify-center font-sans font-semibold text-[16px] leading-[24px] border-r border-border rounded-l-[10px] transition-all duration-300 ${activeTab === 'watched' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
      onClick={() => onTabChange('watched')}
      type="button"
    >
      Watched
    </button>
    <button
      className={`w-[100px] h-full flex items-center justify-center font-sans font-semibold text-[16px] leading-[24px] rounded-r-[10px] transition-all duration-300 ${activeTab === 'watchlist' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
      style={{ borderLeft: 'none' }}
      onClick={() => onTabChange('watchlist')}
      type="button"
    >
      Watchlist
    </button>
  </div>
);

export default TabSegment; 